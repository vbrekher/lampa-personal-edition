// One local build API for both the terminal and visual wizard.
import {cpSync,existsSync,mkdtempSync,mkdirSync,readFileSync,rmSync,symlinkSync,writeFileSync,openSync,closeSync,renameSync,chmodSync,statSync} from 'node:fs';
import {spawn,execFileSync} from 'node:child_process';
import {tmpdir,platform,homedir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {LANGUAGES,normalizeSettings,preparePackage,checkBinaryAssets,patchedGulp,patchedLibraries,patchedManifest,PersonalBuildError} from './lib.mjs';
export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export function requirements(root=ROOT) {
  const tool=name=>{try{execFileSync(name,['-v'],{stdio:'ignore',timeout:4000});return true;}catch{return false;}};
  return [
    {id:'node',ok:Number(process.versions.node.split('.')[0])>=22,detail:process.versions.node},
    {id:'npm',ok:tool('npm')},
    {id:'dependencies',ok:['.bin/gulp','rollup/package.json','sass/package.json','@babel/core/package.json'].every(p=>existsSync(join(root,'node_modules',p)))},
    {id:'packaging',ok:tool('zip')&&tool('unzip')},
    {id:'source',ok:['src','public','index','gulpfile.js'].every(p=>existsSync(join(root,p)))},
    {id:'platform',ok:['darwin','linux'].includes(platform()),detail:platform()==='darwin'?'macOS':platform()}
  ];
}
export function acquireBuildLock(root=ROOT) {
  const folder=join(root,'.personal-build');mkdirSync(folder,{recursive:true});const file=join(folder,'build.lock');
  try {const fd=openSync(file,'wx',0o600);writeFileSync(fd,String(process.pid));closeSync(fd);}
  catch(error){
    if(error.code!=='EEXIST')throw error;
    let pid;try{pid=Number(readFileSync(file,'utf8'));}catch{}
    // An interrupted process may leave a lock; remove only a provably dead owner's lock.
    let dead=false;if(Number.isSafeInteger(pid)&&pid>0){try{process.kill(pid,0);}catch(e){dead=e.code==='ESRCH';}}
    if(dead){
      const recovery=join(folder,'recovery.lock');
      try{mkdirSync(recovery,{mode:0o700});}catch{throw new PersonalBuildError('BUILD_BUSY');}
      try{const current=Number(readFileSync(file,'utf8'));let stillDead=false;try{process.kill(current,0);}catch(e){stillDead=e.code==='ESRCH';}if(!stillDead)throw new PersonalBuildError('BUILD_BUSY');rmSync(file,{force:true});return acquireBuildLock(root);}
      finally{rmSync(recovery,{recursive:true,force:true});}
    }
    throw new PersonalBuildError('BUILD_BUSY');
  }
  return ()=>rmSync(file,{force:true});
}
export function sanitizeBuildLog(text){return String(text).replace(/\x1b\[[0-9;]*m/g,'').replaceAll(homedir(),'<home>').replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/gi,'$1[redacted]@').replace(/((?:token|password|authorization|api[_-]?key)\s*[:=]\s*)[^\s,;]+/gi,'$1[redacted]');}
export async function runTool(command,args,{cwd,signal,onLog=()=>{}}={}) {
  signal?.throwIfAborted();
  await new Promise((resolve,reject)=>{
    const child=spawn(command,args,{cwd,stdio:['ignore','pipe','pipe'],detached:platform()!=='win32'});let killed=false,timer;
    const stop=()=>{killed=true;try{platform()==='win32'?child.kill('SIGTERM'):process.kill(-child.pid,'SIGTERM');}catch{}timer=setTimeout(()=>{try{process.kill(-child.pid,'SIGKILL');}catch{}},2000);timer.unref();};
    signal?.addEventListener('abort',stop,{once:true});
    for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>onLog(chunk.toString()));
    const finish=()=>{clearTimeout(timer);signal?.removeEventListener('abort',stop);};
    child.on('error',e=>{finish();reject(e);});
    child.on('close',code=>{finish();if(killed||signal?.aborted)reject(new PersonalBuildError('BUILD_CANCELLED'));else if(code!==0)reject(new PersonalBuildError('UPSTREAM_BUILD_FAILED'));else resolve();});
  });
}
export async function buildPersonal(input,{root=ROOT,signal,onStage=()=>{},onLog=()=>{},onArtifact=()=>{}}={}) {
  const settings=normalizeSettings(input),release=acquireBuildLock(root);let temp,packageTemp,pending;
  const stage=id=>{signal?.throwIfAborted();onStage(id);};
  try {
    stage('preparing');
    if(!requirements(root).every(x=>x.ok))throw new PersonalBuildError('MISSING_DEPENDENCY');
    temp=mkdtempSync(join(tmpdir(),'lampa-personal-build-'));
    for(const name of ['src','public','index'])cpSync(join(root,name),join(temp,name),{recursive:true});
    mkdirSync(join(temp,'personal'));cpSync(join(root,'personal/dev-server.cjs'),join(temp,'personal/dev-server.cjs'));
    symlinkSync(join(root,'node_modules'),join(temp,'node_modules'),'dir');
    for(const [file,patch]of [['src/services/libs.js',patchedLibraries],['src/core/manifest.js',patchedManifest],['gulpfile.js',patchedGulp]])writeFileSync(join(temp,file),patch(readFileSync(join(root,file),'utf8')));
    stage('compiling');rmSync(join(root,'dist/build-error.log'),{force:true});let diagnostics='';
    try {await runTool(join(root,'node_modules/.bin/gulp'),['personal_tizen'],{cwd:temp,signal,onLog:text=>{diagnostics=(diagnostics+text).slice(-512000);onLog(sanitizeBuildLog(diagnostics).slice(-256000));}});}
    catch(error){if(error.code!=='BUILD_CANCELLED'&&!signal?.aborted){mkdirSync(join(root,'dist'),{recursive:true});writeFileSync(join(root,'dist/build-error.log'),sanitizeBuildLog(diagnostics),{mode:0o600});}throw error;}
    stage('assets');for(const code of [...LANGUAGES,'meta'])if(!readFileSync(join(root,'src/lang',code+'.js')).equals(readFileSync(join(temp,'build/tizen/lang',code+'.js'))))throw new PersonalBuildError('CORRUPT_ASSET','lang/'+code+'.js');checkBinaryAssets(join(temp,'public'),join(temp,'build/tizen'));
    stage('configuration');const pkg=preparePackage({builtDir:join(temp,'build/tizen'),iconFile:join(root,'personal/assets/icon.png'),settings});packageTemp=pkg.temp;
    stage('archive');const archive=join(packageTemp,'app.wgt');
    await runTool('zip',['-q','-r',archive,'.'],{cwd:pkg.stage,signal});
    stage('verification');await runTool('unzip',['-tq',archive],{signal});
    const output=join(root,'dist/Lampa-Personal-Edition.wgt');mkdirSync(dirname(output),{recursive:true});pending=output+'.pending';
    cpSync(archive,pending);chmodSync(pending,0o600);signal?.throwIfAborted();renameSync(pending,output);
    const result={fileName:'Lampa-Personal-Edition.wgt',bytes:statSync(output).size,sha256:createHash('sha256').update(readFileSync(output)).digest('hex'),createdAt:new Date().toISOString()};
    onArtifact(output,result);onStage('complete');return result;
  } catch(error){if(signal?.aborted)throw new PersonalBuildError('BUILD_CANCELLED');throw error;} finally {if(pending)rmSync(pending,{force:true});if(packageTemp)rmSync(packageTemp,{recursive:true,force:true});if(temp)rmSync(temp,{recursive:true,force:true});release();}
}
