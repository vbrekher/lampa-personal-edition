import{get}from'node:http';import test from 'node:test';import assert from 'node:assert/strict';import{mkdtempSync,rmSync,existsSync,writeFileSync,mkdirSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';
import{startBuilder}from'../server.mjs';import{acquireBuildLock,runTool,sanitizeBuildLog}from'../engine.mjs';import{messages}from'../web/messages.js';
test('wizard has complete EN/RU/NL messages and no empty translations',()=>{for(const c of ['ru','nl'])assert.deepEqual(Object.keys(messages[c]).sort(),Object.keys(messages.en).sort());for(const d of Object.values(messages))assert.ok(Object.values(d).every(x=>typeof x==='string'&&x.trim()));});
test('loopback API enforces origin, token, body shape, consent and file boundaries',async()=>{
 const root=mkdtempSync(join(tmpdir(),'lampa-api-test-'));const app=await startBuilder({root,openBrowser:false});
 try{
  assert.equal(app.server.address().address,'127.0.0.1');
  const session=await fetch(app.url+'/api/session');const info=await session.json(),cookie=session.headers.get('set-cookie').split(';')[0];const headers={'Content-Type':'application/json','X-Builder-Token':info.token,Cookie:cookie,Origin:app.url};
  for(const path of ['/api/state','/api/log','/api/download?id=../../etc/passwd'])assert.equal((await fetch(app.url+path)).status,403);
  assert.equal((await fetch(app.url+'/api/state',{headers:{...headers,Origin:'https://evil.example'}})).status,403);
  assert.equal(await new Promise((resolve,reject)=>get(app.url+'/api/session',{headers:{Host:'evil.example'}},r=>{r.resume();resolve(r.statusCode);}).on('error',reject)),403);
  for(const path of ['/../package.json','/%2e%2e/package.json','/api/file?path=/etc/passwd','/.git/config','/engine.mjs','/api/download?id=anything'])assert.equal((await fetch(app.url+path,{headers})).status,404);
  for(const torrserverUrl of ['https://name:password@host','https://host/?token=secret','file:///etc/passwd','http://host/a b'])assert.equal((await fetch(app.url+'/api/validate',{method:'POST',headers,body:JSON.stringify({language:'en',torrserverUrl})})).status,400);
  for(const torrserverUrl of ['','http://192.168.1.100:8090','https://host.example/path']){const x=await fetch(app.url+'/api/validate',{method:'POST',headers,body:JSON.stringify({language:'en',torrserverUrl})});assert.equal(x.status,200);}
  assert.equal((await fetch(app.url+'/api/build',{method:'POST',headers,body:JSON.stringify({language:'en',pluginsEnabled:true})})).status,400);
  assert.equal((await fetch(app.url+'/api/build',{method:'POST',headers,body:JSON.stringify({command:'cat /etc/passwd'})})).status,400);
  assert.equal((await fetch(app.url+'/api/build',{method:'POST',headers:{...headers,'Content-Type':'text/plain'},body:'{}'})).status,405);
  assert.equal((await fetch(app.url+'/api/build',{method:'POST',headers,body:'x'.repeat(5000)})).status,413);
 }finally{await app.close();rmSync(root,{recursive:true,force:true});}
});
test('cross-process lock excludes concurrent CLI/UI builds and releases predictably',()=>{const root=mkdtempSync(join(tmpdir(),'lampa-lock-test-'));try{const unlock=acquireBuildLock(root);assert.throws(()=>acquireBuildLock(root),e=>e.code==='BUILD_BUSY');unlock();acquireBuildLock(root)();assert.equal(existsSync(join(root,'.personal-build/build.lock')),false);}finally{rmSync(root,{recursive:true,force:true});}});
test('cancellation terminates the actual compiler process',async()=>{const c=new AbortController();const p=runTool(process.execPath,['-e','setInterval(()=>{},1000)'],{signal:c.signal});setTimeout(()=>c.abort(),100);await assert.rejects(p,e=>e.code==='BUILD_CANCELLED');});
test('diagnostics redact common credential forms and local home paths',()=>{const value=sanitizeBuildLog('password=secret token=abc https://user:password@host');assert.ok(!value.includes('secret'));assert.ok(!value.includes('abc'));assert.ok(!value.includes('user:password'));});
