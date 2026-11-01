import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectSource} from '../../tools/i18n-source-audit.mjs';
import {parseDictionary,inspectValue,markupErrors} from '../../tools/i18n-validation.mjs';

test('data parser finds duplicates in JS and JSON before object construction loses them',()=>{
  for(const [text,file] of [["export default {a:'first', a:'second'}",'en.js'],['{"a":"first","a":"second"}','nl.json']]){
    const result=parseDictionary(text,file);
    assert.deepEqual(result.duplicates,['a']);
    assert.equal(result.values.a,'second');
  }
});
test('dictionary parsing never evaluates code and reports empty strings',()=>{
  assert.throws(()=>parseDictionary("export default {a: (()=>{throw new Error('executed')})()}",'en.js'),/Non-string/);
  assert.throws(()=>parseDictionary('{a:"value"}','en.json'));
  assert.deepEqual(parseDictionary('export default {a:" "}','en.js').invalid,[{key:'a',reason:'empty'}]);
});
test('placeholder multiplicity, Unicode and markup failures remain visible',()=>{
  assert.ok(inspectValue('{name}','{name} {name}').includes('placeholder-mismatch'));
  assert.ok(inspectValue('\ud800','').includes('invalid-unicode'));
  assert.ok(inspectValue('\ufffd','').includes('invalid-unicode'));
  assert.ok(inspectValue('\u202eabc','').includes('bidi-control-review'));
  assert.deepEqual(markupErrors('<b><i>x</b></i>').length,2);
  assert.deepEqual(markupErrors('<b>x</b><br><img src="x">'),[]);
  assert.deepEqual(inspectValue('مرحبا {name}','Hello {name}'),[]);
});
test('source audit sees multiline calls, embedded tokens and dynamic paths without counting comments',()=>{
  const result=inspectSource(`// Lang.translate('comment_only')
    Lang.translate(
      'settings_title'
    );
    Lampa.Lang.translate('nested');
    const html = \`<div>#{template_key} Hello world</div>\`;
    const dynamic = \`<b>#{inside_dynamic}</b>\${value}\`;
    Lang.translate('prefix_' + state);
    Lang.add({registered: {en: 'Hello world'}});
    Lang.AddTranslation(code, table); Lang.codes();
  `,'src/templates/fixture.js');
  assert.deepEqual(result.references.map(x=>x.key),['settings_title','nested','template_key','inside_dynamic']);
  assert.equal(result.dynamicCalls.length,1);
  assert.deepEqual(result.registrations.map(x=>x.method),['add','AddTranslation','codes']);
  assert.ok(result.hardcodedCandidates.some(x=>x.value.includes('Hello world')));
});
test('source syntax failures and duplicate registrations carry locations',()=>{
  const broken=inspectSource('const =','src/broken.js');
  assert.equal(broken.syntaxErrors[0].file,'src/broken.js');
  assert.equal(broken.syntaxErrors[0].line,1);
  const duplicate=inspectSource('Lang.add({key:1,key:2})');
  assert.equal(duplicate.duplicates[0].key,'key');
});

test('all shipped dictionaries retain valid parameters, nonempty values and unique keys',async()=>{
  const {readdirSync,readFileSync}=await import('node:fs');
  const {examine}=await import('../../tools/i18n-audit.mjs');
  const root=new URL('../../',import.meta.url);
  for(const file of readdirSync(new URL('src/lang/',root)).filter(f=>f.endsWith('.js')&&f!=='meta.js')){
    const parsed=parseDictionary(readFileSync(new URL('src/lang/'+file,root),'utf8'),file);
    assert.deepEqual(parsed.duplicates,[],file);
    assert.deepEqual(parsed.invalid,[],file);
    assert.deepEqual(examine(file.slice(0,-3)).valueIssues,[],file);
  }
});
test('every static application reference resolves in the canonical dictionary',async()=>{
  const {inventory}=await import('../../tools/i18n-source-audit.mjs');
  const {reference}=await import('../../tools/i18n-audit.mjs');
  const source=inventory(),ref=reference();
  assert.deepEqual(source.syntaxErrors,[]);
  assert.deepEqual(source.references.filter(item=>!Object.hasOwn(ref,item.key)),[]);
});

test('visible startup status is translated while original diagnostics remain available',async()=>{
  const {readFileSync}=await import('node:fs');
  const vm=await import('node:vm');
  const source=readFileSync(new URL('../../src/interaction/loading_progress.js',import.meta.url),'utf8')
    .replace("import Lang from '../core/lang'",'')
    .replace('export default {','globalThis.progress = {');
  const visible=[],logs=[];
  const view={find:()=>({text:value=>visible.push(value)}),remove(){}};
  const context={Lang:{translate:key=>key==='loading'?'Bezig met laden':'Voorbereiding'},$:()=>view,console:{log:(...args)=>logs.push(args)},globalThis:null};
  context.globalThis=context;context.$=Object.assign(context.$,{});
  context.$=selector=>selector==='body'?{append(){}}:view;
  vm.runInNewContext(source,context);
  context.progress.init();context.progress.status('Mirrors initialization');
  assert.equal(visible.at(-1),'Bezig met laden');
  assert.ok(logs.some(args=>args.includes('Mirrors initialization')));
});

test('integrated locales use reviewed glossary terms and every override targets a real UI key',async()=>{
  const {readFileSync,readdirSync,existsSync}=await import('node:fs');
  const {readLanguage,reference}=await import('../../tools/i18n-audit.mjs');
  const root=new URL('../../',import.meta.url),ref=reference();
  for(const file of readdirSync(new URL('i18n/glossaries/',root))){
    const glossary=JSON.parse(readFileSync(new URL('i18n/glossaries/'+file,root),'utf8'));
    const code=glossary.locale;
    assert.ok(Object.keys(glossary.terms).length>=20,code);
    for(const key of Object.keys(glossary.overrides||{}))assert.ok(Object.hasOwn(ref,key),code+' unknown override '+key);
    if(!existsSync(new URL('src/lang/'+code+'.js',root)))continue;
    const lang=readLanguage(code);
    for(const [key,value] of Object.entries(glossary.overrides||{}))assert.equal(lang[key]?.normalize('NFC'),value.normalize('NFC'),code+' '+key);
    for(const [key,term] of [['title_settings','settings'],['settings_player_subs','subtitles'],['title_history','watchHistory'],['settings_main_player','player']])assert.equal(lang[key],glossary.terms[term],code+' '+key);
  }
});
