import test from 'node:test';
import vm from 'node:vm';
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
  assert.deepEqual(normalizeSettings(),{language:'ru',torrserverUrl:'',parserType:'jackett',pluginsEnabled:false});
  assert.equal(normalizeSettings({language:'uk'}).language,'uk');
  assert.equal(normalizeSettings({language:'nl'}).language,'nl');
  assert.throws(()=>normalizeSettings({language:'zz'}));
  assert.equal(normalizeSettings({parserType:'prowlarr'}).parserType,'prowlarr');
  assert.throws(()=>normalizeSettings({parserType:'invalid'}),e=>e.code==='INVALID_PARSER_TYPE');
});
test('seeds local preferences, disables remote configuration and CUB account',()=>{
  const js=configScript({language:'en',torrserverUrl:'http://192.168.1.20:8090'});
  const w={},data=new Map();
  new Function('window','localStorage',js)(w,{setItem:(key,val)=>data.set(key,val),getItem:(key)=>data.get(key)??null});
  assert.equal(w.lampa_personal_mode,true);
  assert.equal(w.lampa_settings.account_use,false);
  assert.equal(w.lampa_settings.socket_use,false);
  assert.equal(w.lampa_settings.plugins_use,false);
  assert.equal(w.lampa_settings.torrents_use,true);
  assert.equal(w.lampa_settings.disable_features.remote_configuration,true);
  assert.equal(data.get('torrserver_url'),'http://192.168.1.20:8090');
  assert.equal(data.get('tmdb_lang'),'en');
  assert.equal(data.get('parser_torrent_type'),'jackett');
  assert.ok(!js.includes('token='));
});
test('rebuilding without TorrServer clears a previously bundled server address',()=>{
  const data=new Map([['torrserver_url','http://192.168.1.25:8090']]);
  new Function('window','localStorage',configScript({torrserverUrl:''}))({},{
    setItem:(key,val)=>data.set(key,val),getItem:(key)=>data.get(key)??null
  });
  assert.equal(data.get('torrserver_url'),'');
});
test('TV-side TorrServer edits survive app relaunch when builder inputs are unchanged',()=>{
  const data=new Map();
  const storage={setItem:(key,val)=>data.set(key,val),getItem:(key)=>data.get(key)??null};
  const js=configScript({language:'ru',torrserverUrl:''});
  new Function('window','localStorage',js)({},storage);
  data.set('torrserver_url','http://192.168.1.40:8090');
  new Function('window','localStorage',js)({},storage);
  assert.equal(data.get('torrserver_url'),'http://192.168.1.40:8090');
  const updated=configScript({language:'ru',torrserverUrl:'https://my-new-server.example'});
  new Function('window','localStorage',updated)({},storage);
  assert.equal(data.get('torrserver_url'),'https://my-new-server.example');
});

test('third-party plugins can be enabled only after persisted user opt-in',()=>{
  const data=new Map([['lampa_personal_plugins_opt_in','true']]);
  const w={};
  new Function('window','localStorage',configScript())(w,{setItem:(k,v)=>data.set(k,v),getItem:(k)=>data.get(k)??null});
  assert.equal(w.lampa_settings.plugins_use,true);
});

test('Personal Edition keeps parser and plugin settings reachable without a server',()=>{
  const settings=readFileSync(join(root,'src/interaction/settings/main.js'),'utf8');
  const extensions=readFileSync(join(root,'src/interaction/extensions/extensions.js'),'utf8');
  assert.ok(settings.includes('!window.lampa_settings.plugins_use && !window.lampa_personal_mode'));
  assert.match(extensions,/catalog: PersonalCatalog/);
  const w={};
  new Function('window','localStorage',configScript())(w,{setItem(){},getItem(){return null}});
  assert.equal(w.lampa_settings.torrents_use,true);
});

test('bundled catalogue is small, categorized, deduplicated and HTTPS-only',()=>{
  const source=readFileSync(join(root,'src/interaction/extensions/personal_catalog.js'),'utf8');
  const catalog=JSON.parse(source.slice(source.indexOf('export default ')+15).trim());
  assert.ok(catalog.results.length>=3);
  const urls=catalog.results.flatMap(category=>{
    assert.ok(category.titles.en && category.titles.ru);
    return category.results.map(item=>{
      assert.ok(item.link.startsWith('https://') && item.link.length>12);
      assert.ok(item.name && item.descr && item.lang.en && item.lang.ru);
      return item.link;
    });
  });
  assert.equal(urls.length,new Set(urls).size);
  assert.ok(urls.length>=5);
});

test('opt-in allows upstream plugin system, but not store by default',()=>{
  const js=configScript({pluginsEnabled:true});
  const w={};
  new Function('window','localStorage',js)(w,{setItem(){},getItem(){return null}});
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

test('changing the bundled interface locale preserves independently chosen metadata language and user data',()=>{
  const data=new Map([['tmdb_lang','fr'],['favorite','[{"id":42}]'],['plugins','[{"url":"https://example.com/plugin.js"}]'],['history','[{"id":7}]']]);
  const before=new Map(data);
  const storage={setItem:(key,val)=>data.set(key,val),getItem:(key)=>data.get(key)??null};
  for(const language of ['nl','de','tr']){
    new Function('window','localStorage',configScript({language}))({},storage);
    assert.equal(data.get('language'),language);
    for(const [key,value] of before)assert.equal(data.get(key),value,key);
  }
});

test('rebuilding with only another interface language preserves TV-side TorrServer and parser edits',()=>{
  const values=new Map();
  const storage={setItem:(key,val)=>values.set(key,val),getItem:key=>values.get(key)??null};
  new Function('window','localStorage',configScript({language:'nl'}))({},storage);
  values.set('torrserver_url','http://192.168.1.42:8090');
  values.set('torrserver_use_link','two');
  values.set('parser_torrent_type','prowlarr');
  new Function('window','localStorage',configScript({language:'de'}))({},storage);
  assert.equal(values.get('language'),'de');
  assert.equal(values.get('torrserver_url'),'http://192.168.1.42:8090');
  assert.equal(values.get('torrserver_use_link'),'two');
  assert.equal(values.get('parser_torrent_type'),'prowlarr');
});

test('first-install language choice is pending only for a fresh device',()=>{
  const script=configScript({language:'nl'});
  const execute=entries=>{
    const values=new Map(entries);
    const localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
    vm.runInNewContext(script,{window:{lampa_settings:{}},localStorage});return values;
  };
  assert.equal(execute([]).get('lampa_personal_language_pending'),'true');
  assert.equal(execute([['language','de']]).get('lampa_personal_language_pending'),undefined);
});
