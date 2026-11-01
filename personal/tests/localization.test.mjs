import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {CATALOG,BUILDER_LANGUAGES,strings,formatBuildError,formatMessage} from '../i18n.mjs';
import {parseBuilderArgs,defaultAppLanguage,getBuilderLocale} from '../cli.mjs';
import {PersonalBuildError} from '../lib.mjs';

const root=resolve(import.meta.dirname,'../..');
const read=(path)=>readFileSync(resolve(root,path),'utf8');
const cyrillic=/[\u0400-\u052f]/u;
const englishDocs=[
  'README.md','docs/INSTALLATION.md','docs/TROUBLESHOOTING.md',
  'docs/FAQ.md','docs/COMPATIBILITY.md','docs/BUILD-NOTES.md',
  'SECURITY.md','CONTRIBUTING.md','CHANGELOG.md',
  '.github/ISSUE_TEMPLATE/bug_report.yml','.github/pull_request_template.md'
];

test('every localized builder message and error has the same key set',()=>{
  assert.deepEqual(BUILDER_LANGUAGES,['en','ru','nl']);
  const expected=Object.keys(CATALOG.en).sort();
  const errorKeys=Object.keys(CATALOG.en.errors).sort();
  for(const lang of BUILDER_LANGUAGES){
    assert.deepEqual(Object.keys(CATALOG[lang]).sort(),expected,lang);
    assert.deepEqual(Object.keys(CATALOG[lang].errors).sort(),errorKeys,lang+' error codes');
    for(const [key,value] of Object.entries(CATALOG[lang])){
      if(key==='errors')continue;
      assert.ok(typeof value==='string' && value.length>0,lang+'.'+key);
    }
    for(const [key,value] of Object.entries(CATALOG[lang].errors))
      assert.ok(typeof value==='string' && value.length>0,lang+'.errors.'+key);
  }
});

test('English and Dutch builder catalogs do not contain Russian text',()=>{
  assert.ok(!cyrillic.test(JSON.stringify(CATALOG.en)),'English catalog');
  assert.ok(!cyrillic.test(JSON.stringify(CATALOG.nl)),'Dutch catalog');
  assert.ok(cyrillic.test(JSON.stringify(CATALOG.ru)),'Russian catalog');
  assert.match(strings('en').plugins,/^Enable third-party plugins/);
  assert.match(strings('ru').plugins,/^Разрешить сторонние плагины/);
  assert.match(strings('nl').plugins,/^Externe plug-ins inschakelen/);
});

test('English documentation and GitHub templates contain no Cyrillic prose',()=>{
  for(const path of englishDocs)
    assert.ok(!cyrillic.test(read(path)),path+' has unexpected Cyrillic');
});

test('Dutch documentation is Dutch, Russian documentation is Russian',()=>{
  const dutch=read('docs/README.nl.md'),russian=read('docs/README.ru.md');
  assert.ok(!cyrillic.test(dutch),'Dutch guide has unexpected Cyrillic');
  assert.ok(cyrillic.test(russian),'Russian guide lacks Russian text');
  assert.ok(!russian.includes('[English README]')&&!russian.includes('Nederlandse handleiding]'),
    'Russian guide contains mixed-language navigation');
});

test('documented terminal questions are exact copies of the selected builder messages',()=>{
  const docs={en:read('docs/BUILDER_GUIDE.md'),ru:read('docs/README.ru.md'),nl:read('docs/README.nl.md')};
  for(const lang of BUILDER_LANGUAGES){
    const defaults=defaultAppLanguage(lang);
    const prompt=strings(lang);
    for(const exact of [
      prompt.interfaceLanguage.replace('{default}',defaults).trim(),
      prompt.serverUrl.trim(),
      prompt.parserType.trim(),
      prompt.plugins.trim()
    ])assert.ok(docs[lang].includes(exact),lang+' doc missing exact prompt: '+exact);
  }
});

test('the default builder is English and selects English for the TV',()=>{
  const p=parseBuilderArgs([]);
  assert.equal(p.locale,'en');
  assert.equal(p.interactive,true);
  assert.equal(p.defaultLanguage,'en');
  assert.equal(p.settings,null);
});

test('choosing builder language alone keeps questions interactive',()=>{
  for(const [locale,tv] of [['en','en'],['ru','ru'],['nl','en']]){
    const p=parseBuilderArgs(['--builder-language',locale]);
    assert.equal(p.locale,locale);
    assert.equal(p.interactive,true);
    assert.equal(p.defaultLanguage,tv);
    assert.equal(getBuilderLocale(['--builder-language',locale]),locale);
  }
});

test('the app interface language and the builder language are independent',()=>{
  const p=parseBuilderArgs(['--builder-language','nl','--language','ru','--plugins','on']);
  assert.equal(p.locale,'nl');
  assert.equal(p.interactive,false);
  assert.equal(p.settings.language,'ru');
  assert.equal(p.settings.pluginsEnabled,true);
  const q=parseBuilderArgs(['--builder-language','ru','--language','en','--plugins','off']);
  assert.equal(q.locale,'ru');
  assert.equal(q.settings.language,'en');
  assert.equal(q.settings.pluginsEnabled,false);
});

test('unknown TV interfaces are rejected in Dutch and completed Dutch is supported',()=>{
  assert.equal(parseBuilderArgs(['--builder-language','nl','--language','nl']).settings.language,'nl');
  assert.throws(()=>parseBuilderArgs(['--builder-language','nl','--language','zz']),
    e=>e instanceof PersonalBuildError && e.code==='UNSUPPORTED_APP_LANGUAGE');
  const message=formatBuildError(new PersonalBuildError('UNSUPPORTED_APP_LANGUAGE','nl'),'nl');
  assert.match(message,/Lampa op de tv ondersteunt/);
  assert.ok(!cyrillic.test(message));
});

test('argument and validation errors have one chosen language',()=>{
  assert.throws(()=>parseBuilderArgs(['--builder-language','es']),
    e=>e.code==='INVALID_BUILDER_LANGUAGE');
  assert.throws(()=>parseBuilderArgs(['--plugins','maybe']),
    e=>e.code==='INVALID_PLUGIN_CHOICE');
  assert.throws(()=>parseBuilderArgs(['--parser','notreal']),
    e=>e.code==='INVALID_PARSER_TYPE');
  assert.throws(()=>parseBuilderArgs(['--foo','bar']),
    e=>e.code==='INVALID_ARGUMENT');
  for(const lang of BUILDER_LANGUAGES){
    const message=formatBuildError(new PersonalBuildError('INVALID_ARGUMENT','--foo'),lang);
    assert.ok(message.includes('--foo'));
    if(lang!=='ru')assert.ok(!cyrillic.test(message));
  }
  assert.equal(formatMessage('Hello {detail}!','world'),'Hello world!');
});

test('localized --help runs without a terminal or npm dependencies',()=>{
  for(const [lang,start] of [['en','Usage:'],['ru','Использование:'],['nl','Gebruik:']]){
    const p=spawnSync(process.execPath,['personal/build.mjs','--builder-language',lang,'--help'],
      {cwd:root,encoding:'utf8'});
    assert.equal(p.status,0,p.stderr);
    assert.ok(p.stdout.startsWith(start),lang+': '+p.stdout);
    if(lang!=='ru')assert.ok(!cyrillic.test(p.stdout),lang+' help is mixed');
  }
});

test('localized validation failure is never printed in the wrong language',()=>{
  for(const [lang,expected] of [
    ['en','does not support language'],
    ['ru','не поддерживает язык'],
    ['nl','ondersteunt deze taal niet']
  ]){
    const p=spawnSync(process.execPath,
      ['personal/build.mjs','--builder-language',lang,'--language','zz'],
      {cwd:root,encoding:'utf8'});
    assert.equal(p.status,1,lang);
    assert.ok(p.stderr.includes(expected),lang+': '+p.stderr);
    if(lang!=='ru')assert.ok(!cyrillic.test(p.stderr));
  }
});
