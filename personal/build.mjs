#!/usr/bin/env node
// Personal build: all work happens on the user's own computer.
import {createInterface} from 'node:readline/promises';
import {cpSync,existsSync,mkdtempSync,readFileSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeSettings, packageTizen, patchedGulp, patchedLibraries, patchedManifest} from './lib.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function argumentsToSettings(args) {
  if(args.length===1&&args[0]==='--help')return null;
  if(!args.length)return undefined;
  const options={language:'ru',torrserverUrl:'',pluginsEnabled:false};
  for(let i=0;i<args.length;i++){
    const flag=args[i];const val=args[++i];
    if(!val || !['--language','--torrserver','--plugins'].includes(flag))throw Error('Недопустимые аргументы. См. --help');
    if(flag==='--language')options.language=val;
    if(flag==='--torrserver')options.torrserverUrl=val;
    if(flag==='--plugins'){
      if(!['on','off'].includes(val))throw Error('--plugins: on или off');
      options.pluginsEnabled=val==='on';
    }
  }
  return normalizeSettings(options);
}
async function ask() {
  if(!process.stdin.isTTY || !process.stdout.isTTY)throw Error('Для интерактивной сборки открой обычный терминал.');
  const rl=createInterface({input:process.stdin,output:process.stdout});
  try{
    console.log('\nLampa Personal Edition — локальная сборка для Samsung Tizen\n');
    console.log('Собственный сервер Lampa не нужен. Пароль не запрашивается.\n');
    const language=(await rl.question('Язык [ru/en/uk/fr/es/pl] (Enter=ru): ')).trim()||'ru';
    const torrserverUrl=(await rl.question('TorrServer URL (необязательно, Enter=пропустить): ')).trim();
    const answer=(await rl.question('Разрешить сторонние плагины? [y/N]: ')).trim().toLowerCase();
    return normalizeSettings({language,torrserverUrl,pluginsEnabled:['y','yes'].includes(answer)});
  }finally{rl.close();}
}
function compile(settings){
  for(const path of ['src','public','index','gulpfile.js','node_modules/.bin/gulp']){
    if(!existsSync(join(ROOT,path)))throw Error('Отсутствует '+path+'. Сначала выполни npm install.');
  }
  const temp=mkdtempSync(join(tmpdir(),'lampa-personal-build-'));
  try{
    for(const name of ['src','public','index'])cpSync(join(ROOT,name),join(temp,name),{recursive:true});
    symlinkSync(join(ROOT,'node_modules'),join(temp,'node_modules'),'dir');
    const libs=join(temp,'src/services/libs.js');
    writeFileSync(libs,patchedLibraries(readFileSync(libs,'utf8')));
    const manifest=join(temp,'src/core/manifest.js');
    writeFileSync(manifest,patchedManifest(readFileSync(manifest,'utf8')));
    writeFileSync(join(temp,'gulpfile.js'),patchedGulp(readFileSync(join(ROOT,'gulpfile.js'),'utf8')));
    console.log('Building local Lampa assets...');
    execFileSync(join(ROOT,'node_modules/.bin/gulp'),['personal_tizen'],{cwd:temp,stdio:'inherit'});
    packageTizen({builtDir:join(temp,'build/tizen'),
      outputFile:join(ROOT,'dist/Lampa-Personal-Edition.wgt'),
      iconFile:join(ROOT,'personal/assets/icon.png'),settings});
  }finally{rmSync(temp,{recursive:true,force:true});}
}
try{
  const args=argumentsToSettings(process.argv.slice(2));
  if(args===null){
    console.log('Usage: npm run build:personal [-- --language ru --torrserver https://host:8090 --plugins off]');
    console.log('Without options the builder asks questions in Terminal.');
  } else {
    const settings=args||await ask();
    if(settings.torrserverUrl.startsWith('http://'))console.warn('HTTP не шифрует трафик: только для доверенной домашней сети.');
    if(settings.pluginsEnabled)console.warn('Осторожно: сторонние плагины могут выполнять удалённый JavaScript.');
    compile(settings);
    console.log('\nReady: dist/Lampa-Personal-Edition.wgt');
    console.log('Install with Apps2Samsung > Custom WGT. Do not share personal packages.');
  }
}catch(error){console.error('Build failed: '+error.message);process.exitCode=1;}
