import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import vm from'node:vm';
const load=(file,globals)=>{const source=readFileSync(new URL('../../src/'+file,import.meta.url),'utf8').replace(/^import .*$/gm,'').replace('export default','globalThis.result =');const ctx=vm.createContext(globals);vm.runInContext(source,ctx);return ctx;};
test('VAST SDK URL joins local and remote asset bases without duplicate slashes',async()=>{
 for(const base of ['./','https://cdn.example/lampa/','https://cdn.example/lampa']){
  let url;const ctx=load('interaction/advert/ima.js',{window:{},Manifest:{github_lampa:base},Utils:{putScriptAsync:(items,complete,error,success)=>{url=items[0];success();}}});
  await ctx.result.loadSDK2();assert.equal(url,base.replace(/\/+$/,'')+'/vender/vast/vast.js');
 }
});
test('failed SDK loading resumes content once without creating an ad player',async()=>{
 let resumed=0,constructed=0;
 const ctx=load('interaction/advert/preroll.js',{
  window:{},console:{log(){}},Date,VPN:{code:()=> 'QA'},Controller:{},Platform:{},Background:{},
  Vast2:class{constructor(){constructed++}},Vast3:class{constructor(){constructed++}},
  VastManager:class{get(){return {url:'https://ads.example/fixture',vast_api:2}}coolingReady(){return true}},
  IMA:{getMediaType:()=>({any:false}),canShow:()=>true,loadSDK:()=>Promise.reject(Error('controlled SDK failure'))},
  Account:{hasPremium:()=>false},Personal:{confirm:()=>false},Metric:{counter(){}}
 });
 ctx.result.show({url:'https://video.example/fixture.mp4'},()=>resumed++);
 await new Promise(resolve=>setImmediate(resolve));assert.equal(resumed,1);assert.equal(constructed,0);
});
