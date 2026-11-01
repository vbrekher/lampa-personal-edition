import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
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
test('new locales enter the TV selector and builder only after full dictionary validation',()=>{
  const builder=readFileSync(resolve(root,'personal/lib.mjs'),'utf8');
  for(const c of NEW){
    const report=examine(c);
    const inBuilder=new RegExp("'"+c+"'").test(builder.slice(builder.indexOf('export const LANGUAGES'),builder.indexOf('export function normalizeServerUrl')));
    assert.equal(select(c),inBuilder,c+' runtime and builder disagree');
    if(select(c)){
      assert.equal(report.source,'upstream',c+' has no local runtime module');
      assert.deepEqual(report.missing,[],c);
      assert.equal(report.releaseReady,true,c+' has unreviewed dictionary errors');
    }else assert.ok(report.missing.length>0||!report.releaseReady,c+' complete locale should be integrated');
    assert.deepEqual(report.mismatches,[],c);
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
test('integrated RTL locales require complete dictionaries, local fonts and direction support',()=>{
  const app=readFileSync(resolve(root,'src/app.js'),'utf8');
  const styles=readFileSync(resolve(root,'src/sass/components/international.scss'),'utf8');
  assert.match(app,/Direction\.apply/);
  assert.ok(styles.includes("html[dir='rtl']"));
  for(const c of ['ar','ur','he'])if(select(c))assert.equal(examine(c).releaseReady,true,c);
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

test('Personal Edition uses English fallback for non-Russian locales',()=>{
  const source=readFileSync(resolve(root,'src/core/lang.js'),'utf8');
  assert.match(source,/window\.lampa_personal_mode && code !== 'ru' \? 'en'/);
  assert.ok(source.includes("langs[fallback][name]"));
});

test('translator export is complete, JSON-only and never silently fills missing strings',()=>{
  const raw=execFileSync(process.execPath,['tools/i18n-export.mjs','nl'],{cwd:root,encoding:'utf8'});
  const json=JSON.parse(raw);
  const report=examine('nl');
  assert.equal(json.locale,'nl');
  assert.equal(json.missingCount,report.missing.length);
  assert.equal(json.items.length,json.missingCount);
  assert.ok(json.items.every(i=>i.key && (i.english || i.russian)));
});

test('five shipped top-ten language files have complete canonical key and placeholder coverage',()=>{
  for(const code of EXISTING){
    const report=examine(code);
    assert.deepEqual(report.missing,[],code+' has untranslated canonical keys');
    assert.deepEqual(report.mismatches,[],code+' lost dynamic placeholders');
  }
});
