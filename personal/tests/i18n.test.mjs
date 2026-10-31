import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {TARGETS,NAMES,NEW,EXISTING,readLanguage,reference,examine} from '../../tools/i18n-audit.mjs';
const root=resolve(import.meta.dirname,'../..');
const select=code=>readFileSync(resolve(root,'src/lang/meta.js'),'utf8').includes("code: '"+code+"'");
test('requested languages are an exact set of 3 priority and 2026 top 10',()=>{
  assert.deepEqual(TARGETS,['nl','de','tr','en','zh','hi','es','ar','fr','bn','pt','id','ur']);
  assert.equal(new Set(TARGETS).size,13);
  for(const c of TARGETS)assert.ok(NAMES[c],c);
  assert.deepEqual(NEW,['nl','de','tr','hi','ar','bn','id','ur']);
  assert.deepEqual(EXISTING,['en','zh','es','fr','pt']);
});
test('language drafts are not exposed to TV users until translation coverage is complete',()=>{
  const builder=readFileSync(resolve(root,'personal/lib.mjs'),'utf8');
  for(const c of NEW){
    assert.equal(select(c),false,c+' is incomplete but visible in TV language selector');
    assert.ok(!new RegExp("'"+c+"'").test(builder.slice(builder.indexOf('export const LANGUAGES'),builder.indexOf('export function normalizeServerUrl'))));
    const report=examine(c);
    assert.ok(report.translated>=90,c+' draft has unexpectedly low coverage');
    assert.ok(report.missing.length>0,c+' should not be published until full coverage');
    assert.equal(report.mismatches.length,0,c+' placeholder mismatch');
  }
});
test('the baseline includes all keys from both shipped canonical dictionaries',()=>{
  const expected=Object.keys(reference()).length;
  assert.ok(expected>1300,'unexpectedly truncated canonical keys');
  for(const code of TARGETS){
    const report=examine(code);
    assert.equal(report.required,expected,code);
    assert.equal(report.translated,expected-report.missing.length,code);
  }
});
test('RTL locales remain unpublished until direction and font acceptance',()=>{
  const css=readFileSync(resolve(root,'src/core/lang.js'),'utf8');
  assert.ok(css.includes('lang_default'),'fallback runtime must remain present');
  for(const code of ['ar','ur'])assert.equal(select(code),false);
});

test('Personal plugin catalogue category names and descriptions exist for all 13 languages',()=>{
  const source=readFileSync(resolve(root,'src/interaction/extensions/personal_catalog.js'),'utf8');
  const catalog=JSON.parse(source.slice(source.indexOf('export default ')+15).trim());
  assert.equal(catalog.results.length,3);
  for(const group of catalog.results){
    for(const code of TARGETS)assert.ok(group.titles[code]?.trim(),code+' category missing');
    for(const plugin of group.results){
      for(const code of TARGETS){
        assert.ok(plugin.lang[code]?.name?.trim(),code+' plugin name missing');
        assert.ok(plugin.lang[code]?.descr?.trim(),code+' plugin description missing');
      }
    }
  }
});

test('Personal Edition loads packaged non-core translations instead of fetching remote Lampa',()=>{
  const app=readFileSync(resolve(root,'src/app.js'),'utf8');
  assert.match(app,/window\.lampa_personal_mode \? '\.\/'/);
  assert.ok(app.includes("+ 'lang/' + code + '.js'"));
});
