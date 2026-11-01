#!/usr/bin/env node
import {createServer} from 'node:http';
import {readFileSync,readdirSync,statSync,existsSync,realpathSync,cpSync,rmSync,mkdirSync,chmodSync} from 'node:fs';
import {join,extname} from 'node:path';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {ROOT,requirements,buildPersonal} from './engine.mjs';
import {LANGUAGES,ID,normalizeSettings,PersonalBuildError} from './lib.mjs';
export async function startBuilder({port=0,root=ROOT,build=buildPersonal,openBrowser=true}={}) {
  const token=randomBytes(32).toString('hex');let job=null,controller=null,closing=false;
  const jobFolder=join(root,'.personal-build/wizard');mkdirSync(jobFolder,{recursive:true,mode:0o700});
  const files=new Map();
  const add=(dir,prefix)=>{if(!existsSync(dir))return;for(const name of readdirSync(dir)){const p=join(dir,name);if(!realpathSync(p).startsWith(realpathSync(dir)+'/'))continue;if(statSync(p).isDirectory())add(p,prefix+name+'/');else files.set(prefix+name,p);}};
  add(join(ROOT,'personal/web'),'/');add(join(ROOT,'site/assets'),'/assets/');files.set('/',join(ROOT,'personal/web/index.html'));files.set('/brand.css',join(ROOT,'site/brand.css'));
  const secure=(a,b)=>typeof a==='string'&&/^[a-f0-9]{64}$/.test(a)&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
  const server=createServer(async(req,res)=>{
    const origin=`http://127.0.0.1:${server.address().port}`,cookieName='lampa_builder_'+server.address().port;
    const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"};
    const json=(status,data)=>{res.writeHead(status,{...headers,'Content-Type':'application/json'});res.end(JSON.stringify(data));};
    try {
      if(req.headers.host!==`127.0.0.1:${server.address().port}`||req.headers.origin&&req.headers.origin!==origin||req.headers['sec-fetch-site']==='cross-site')return json(403,{code:'REQUEST_FORBIDDEN'});
      const url=new URL(req.url,origin),path=url.pathname;
      if(path==='/api/session'&&req.method==='GET'){
        res.setHeader('Set-Cookie',`${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/`);
        return json(200,{token,languages:LANGUAGES,appId:ID.app,version:ID.version,requirements:requirements(root)});
      }
      if(path.startsWith('/api/')){
        const cookie=req.headers.cookie?.split(';').map(x=>x.trim()).includes(cookieName+'='+token);
        if(!cookie||path!=='/api/download'&&!secure(req.headers['x-builder-token'],token))return json(403,{code:'REQUEST_FORBIDDEN'});
        if(req.method==='GET'&&path==='/api/state')return json(200,job||{status:'idle'});
        if(req.method==='GET'&&path==='/api/log')return json(200,{log:job?.log||''});
        if(req.method==='GET'&&path==='/api/download'){
          if(job?.status!=='complete'||url.searchParams.get('id')!==job.id)return json(404,{code:'NOT_READY'});
          res.writeHead(200,{...headers,'Content-Type':'application/widget','Content-Disposition':'attachment; filename="Lampa-Personal-Edition.wgt"','Content-Length':job.result.bytes});
          return res.end(readFileSync(join(jobFolder,job.id+'.wgt')));
        }
        if(req.method==='GET')return json(404,{code:'NOT_FOUND'});
        if(req.method!=='POST'||req.headers['content-type']?.split(';')[0]!=='application/json')return json(405,{code:'REQUEST_FORBIDDEN'});
        let body='',size=0;for await(const chunk of req){size+=chunk.length;if(size>4096)return json(413,{code:'REQUEST_FORBIDDEN'});body+=chunk;}
        let data;try{data=JSON.parse(body||'{}');}catch{return json(400,{code:'INVALID_REQUEST'});}
        if(path==='/api/validate'){try{return json(200,{settings:normalizeSettings(data)});}catch(e){return json(400,{code:e.code||'INVALID_REQUEST'});}}
        if(path==='/api/build'){
          if(closing||job?.status==='building'||job?.status==='cancelling')return json(409,{code:'BUILD_BUSY'});
          if(Object.keys(data).some(k=>!['language','torrserverUrl','parserType','pluginsEnabled','pluginsConsent'].includes(k)))return json(400,{code:'INVALID_REQUEST'});
          if(data.pluginsEnabled===true&&data.pluginsConsent!==true)return json(400,{code:'PLUGIN_CONSENT_REQUIRED'});
          const settings=normalizeSettings(data);if(!requirements(root).every(x=>x.ok))return json(400,{code:'MISSING_DEPENDENCY'});
          if(job?.id)rmSync(join(jobFolder,job.id+'.wgt'),{force:true});
          controller=new AbortController();job={id:randomBytes(12).toString('hex'),status:'building',stage:'preparing',log:''};const current=job;
          // No settings are written into logs, URLs, telemetry or persistent browser storage.
          build(settings,{root,signal:controller.signal,onArtifact:file=>{cpSync(file,join(jobFolder,current.id+'.wgt'));chmodSync(join(jobFolder,current.id+'.wgt'),0o600);},onStage:stage=>{current.stage=stage;},onLog:text=>{current.log=text.slice(-256000);}})
            .then(result=>{current.result=result;current.status='complete';current.stage='complete';})
            .catch(error=>{current.status=controller.signal.aborted?'cancelled':'error';current.code=current.status==='cancelled'?'BUILD_CANCELLED':error instanceof PersonalBuildError?error.code:'UPSTREAM_BUILD_FAILED';});
          return json(202,{id:job.id});
        }
        if(path==='/api/cancel'){if(job?.status!=='building')return json(409,{code:'NOT_BUILDING'});job.status='cancelling';controller.abort();return json(202,{status:'cancelling'});}
        if(path==='/api/open-output'){
          if(job?.status!=='complete')return json(409,{code:'NOT_READY'});
          const child=spawn(process.platform==='darwin'?'open':'xdg-open',[join(root,'dist')],{stdio:'ignore'});child.on('error',()=>{});child.unref();return json(200,{ok:true});
        }
        return json(404,{code:'NOT_FOUND'});
      }
      if(req.method!=='GET'||!files.has(path))return json(404,{code:'NOT_FOUND'});
      const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff':'font/woff'};
      res.writeHead(200,{...headers,'Content-Type':types[extname(files.get(path))]||'application/octet-stream'});res.end(readFileSync(files.get(path)));
    }catch(error){if(!res.headersSent)json(400,{code:error instanceof PersonalBuildError?error.code:'INVALID_REQUEST'});else res.end();}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  const url=`http://127.0.0.1:${server.address().port}`;
  console.log(`Lampa Personal Edition Builder: ${url}`);
  if(openBrowser){const child=spawn(process.platform==='darwin'?'open':'xdg-open',[url],{stdio:'ignore'});child.on('error',()=>console.log('Open the local address above in your browser.'));child.unref();}
  return {server,url,close:async()=>{closing=true;controller?.abort();while(job?.status==='building'||job?.status==='cancelling')await new Promise(r=>setTimeout(r,40));if(job?.id)rmSync(join(jobFolder,job.id+'.wgt'),{force:true});await new Promise(r=>server.close(r));}};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const flags=process.argv.slice(2),portAt=flags.indexOf('--port');const port=portAt>=0?Number(flags[portAt+1]):0;
  if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid local port');
  const instance=await startBuilder({port,openBrowser:!flags.includes('--no-open')});
  const stop=()=>instance.close().then(()=>process.exit(0));process.once('SIGINT',stop);process.once('SIGTERM',stop);
}
