import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,existsSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {normalizeServerUrl,normalizeSettings,configScript,localTizenHtml,patchedGulp,patchedLibraries,patchedManifest,widgetManifest,packageTizen} from '../lib.mjs';
const root=resolve(import.meta.dirname,'..','..');
const icon=join(root,'personal/assets/icon.png');
const HTML='<html><head><title>Lampa</title><link href="css/app.css"></head><body><script src="./vender/jquery/jquery.js"></script><script src="http://www.youtube.com/iframe_api"></script><script src="loader.js"></script></body></html>';

test('URL validation and no secret-bearing URL',()=>{
  assert.equal(normalizeServerUrl(' http://192.168.1.20:8090/ '),'http://192.168.1.20:8090');
  assert.equal(normalizeServerUrl('https://host.test/lampa/'),'https://host.test/lampa');
  assert.equal(normalizeServerUrl(''),'');
  for(const url of ['javascript:alert(1)','file:///etc/passwd','https://user:password@host','https://host/?token=1','https://host/#secret','https://host/a b']){
    assert.throws(()=>normalizeServerUrl(url),url);
  }
});
test('only supported source languages',()=>{
  assert.deepEqual(normalizeSettings(),{language:'ru',torrserverUrl:'',pluginsEnabled:false});
  assert.equal(normalizeSettings({language:'uk'}).language,'uk');
  assert.throws(()=>normalizeSettings({language:'nl'}));
});
test('seeds local preferences, disables remote configuration and CUB account',()=>{
  const js=configScript({language:'en',torrserverUrl:'http://192.168.1.20:8090'});
  const w={},data=new Map();
  new Function('window','localStorage',js)(w,{setItem:(key,val)=>data.set(key,val)});
  assert.equal(w.lampa_personal_mode,true);
  assert.equal(w.lampa_settings.account_use,false);
  assert.equal(w.lampa_settings.socket_use,false);
  assert.equal(w.lampa_settings.plugins_use,false);
  assert.equal(w.lampa_settings.disable_features.remote_configuration,true);
  assert.equal(data.get('torrserver_url'),'http://192.168.1.20:8090');
  assert.equal(data.get('tmdb_lang'),'en');
  assert.ok(!js.includes('token='));
});
test('rebuilding without TorrServer clears a previously bundled server address',()=>{
  const data=new Map([['torrserver_url','http://192.168.1.25:8090']]);
  new Function('window','localStorage',configScript({torrserverUrl:''}))({},{
    setItem:(key,val)=>data.set(key,val)
  });
  assert.equal(data.get('torrserver_url'),'');
});
test('opt-in allows upstream plugin system, but not store by default',()=>{
  const js=configScript({pluginsEnabled:true});
  const w={};
  new Function('window','localStorage',js)(w,{setItem(){}});
  assert.equal(w.lampa_settings.plugins_use,true);
  assert.equal(w.lampa_settings.plugins_store,false);
});
test('removes public remote loader and uses local app assets',()=>{
  const html=localTizenHtml(HTML);
  assert.ok(html.includes('personal-config.js'));
  assert.ok(html.includes('app.min.js'));
  assert.ok(html.indexOf('personal-config.js')<html.indexOf('app.min.js'));
  assert.ok(!html.includes('src="loader.js"'));
  assert.ok(!html.includes('http://www.youtube.com'));
  assert.throws(()=>localTizenHtml(HTML.replace('loader.js','new-loader.js')));
});
test('fixes premature upstream gulp stream callback and provides build target',()=>{
  const original="function merge(done) {\n    rollup({}).pipe(dest('dest'));\n    done();\n}\n\nfunction bubbleFile(name) {}";
  const next=patchedGulp(original);
  assert.ok(next.includes('function merge()'));
  assert.ok(next.includes('return rollup({'));
  assert.ok(next.includes('exports.personal_tizen = series(merge'));
  assert.ok(!next.includes('    done();'));
});
test('keeps packaged playback dependencies local',()=>{
  const source="        return window.location.protocol == 'file:' || window.location.href.indexOf('chrome-extension') > -1 ? Manifest.github_lampa + 'vender/' + lib : './vender/' + lib\n    // Плагины различные";
  const patched=patchedLibraries(source);
  assert.ok(patched.includes("window.lampa_personal_mode) return './vender/' + lib"));
  assert.ok(patched.includes('Utils.putScriptOfMirrors(include'));
});
test('uses packaged asset base in Personal mode',()=>{
  const source="get: ()=> window.lampa_settings.fix_widget ? 'http://lampa.mx/' : 'https://yumata.github.io/lampa/',";
  assert.ok(patchedManifest(source).includes("window.lampa_personal_mode ? './'"));
  assert.throws(()=>patchedManifest('unexpected upstream'));
});
test('isolated Tizen manifest and privileges',()=>{
  const xml=widgetManifest();
  assert.match(xml,/L4mpaPers0.LampaPersonal/);
  assert.match(xml,/required_version="5.0"/);
  assert.match(xml,/<content src="index.html"/);
});
test('produces a verified ZIP without loader or public credentials',()=>{
  const tmp=mkdtempSync(join(tmpdir(),'lampa-personal-test-'));
  try{
    const source=join(tmp,'compiled');
    const assets=['index.html','app.min.js','css/app.css','vender/jquery/jquery.js',
      'vender/notify/notify.js','vender/keypad/keypad.js','vender/navigator/navigator.js',
      'vender/hls/hls.js','vender/dash/dash.js','vender/qrcode/qrcode.js','lang/ru.js'];
    for(const name of assets){
      mkdirSync(join(source,name,'..'),{recursive:true});
      writeFileSync(join(source,name),name==='index.html'?HTML:'/* asset */');
    }
    writeFileSync(join(source,'loader.js'),'var domain="yumata.github.io/lampa";');
    const output=join(tmp,'dist','Lampa-Personal-Edition.wgt');
    packageTizen({builtDir:source,outputFile:output,iconFile:icon,settings:{language:'uk',pluginsEnabled:false}});
    assert.ok(existsSync(output));
    const entries=execFileSync('unzip',['-Z','-1',output],{encoding:'utf8'});
    for(const name of ['config.xml','icon.png','index.html','personal-config.js','app.min.js','plugins/modification.js'])assert.ok(entries.includes(name),name);
    assert.ok(!entries.includes('loader.js'));
    assert.ok(execFileSync('unzip',['-tq',output],{encoding:'utf8'}).includes('No errors'));
    const html=execFileSync('unzip',['-p',output,'index.html'],{encoding:'utf8'});
    assert.ok(html.includes('personal-config.js'));
    assert.ok(!html.includes('loader.js'));
    assert.equal(readFileSync(join(source,'index.html'),'utf8'),HTML);
  }finally{rmSync(tmp,{recursive:true,force:true});}
});
