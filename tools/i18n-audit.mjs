#!/usr/bin/env node
// Lampa Personal Edition — local, dependency-free translation coverage audit.
// Report missing translations honestly: key existence is not equivalent to linguistic quality.
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const TARGETS=Object.freeze([
  'nl','de','tr','en','zh','hi','es','ar','fr','bn','pt','id','ur'
]);
export const NAMES=Object.freeze({
  nl:'Nederlands',de:'Deutsch',tr:'Türkçe',en:'English',zh:'简体中文',
  hi:'हिन्दी',es:'Español',ar:'العربية',fr:'Français',bn:'বাংলা',
  pt:'Português',id:'Bahasa Indonesia',ur:'اردو'
});
export const EXISTING=Object.freeze(['en','zh','es','fr','pt']);
export const NEW=Object.freeze(TARGETS.filter(code=>!EXISTING.includes(code)));
const placeholderPattern=/#?\{[a-z_][\w.-]*\}/gi;
function parseSource(text,file){
  if(!/^\s*export default \{/.test(text))throw new Error('Unexpected source module: '+file);
  const literal=text.replace(/^\s*export default /,'');
  const object=vm.runInNewContext('('+literal+')',Object.create(null),{timeout:1000,filename:file});
  if(!object||typeof object!=='object'||Array.isArray(object))throw new Error('Invalid language object: '+file);
  return Object.fromEntries(Object.entries(object).map(([k,v])=>{
    if(typeof v!=='string'||!v.trim())throw new Error('Empty/nonstring translation: '+file+' '+k);
    return [k,v];
  }));
}
export function readLanguage(code){
  const draft=resolve(ROOT,'i18n/drafts',code+'.json');
  const source=resolve(ROOT,'src/lang',code+'.js');
  if(existsSync(draft))return JSON.parse(readFileSync(draft,'utf8'));
  if(existsSync(source))return parseSource(readFileSync(source,'utf8'),source);
  return {};
}
export function reference(){
  // Russian occasionally includes keys omitted in English upstream.
  return {...readLanguage('ru'),...readLanguage('en')};
}
export function examine(code){
  const ref=reference(),eng=readLanguage('en'),ru=readLanguage('ru'),lang=readLanguage(code);
  const required=Object.keys(ref),owned=Object.keys(lang);
  const missing=required.filter(k=>!Object.hasOwn(lang,k)||!String(lang[k]).trim());
  const extra=owned.filter(k=>!Object.hasOwn(ref,k));
  const mismatches=required.filter(k=>{
    if(!Object.hasOwn(lang,k))return false;
    const source=eng[k]||ref[k];
    const a=(source.match(placeholderPattern)||[]).sort().join('|');
    const b=(lang[k].match(placeholderPattern)||[]).sort().join('|');
    return a!==b;
  });
  const identicalEnglish=required.filter(k=>code!=='en' && Object.hasOwn(lang,k)
    && Object.hasOwn(eng,k) && lang[k]===eng[k] && /[a-z]{4}/i.test(eng[k]));
  const identicalRussian=required.filter(k=>code!=='ru' && Object.hasOwn(lang,k)
    && lang[k]===ru[k] && /[\u0400-\u052f]{3}/u.test(lang[k]));
  // A literal match may be a deliberate trademark or established loanword.
  // This is a review signal, not proof of a bad translation.
  return {
    language:code,name:NAMES[code]||code,
    source:existsSync(resolve(ROOT,'i18n/drafts',code+'.json'))?'draft':'upstream',
    required:required.length,
    translated:required.length-missing.length,
    percent:Number(((required.length-missing.length)*100/required.length).toFixed(1)),
    missing,extra,mismatches,identicalEnglish,identicalRussian,
    releaseReady:missing.length===0&&mismatches.length===0&&identicalEnglish.length===0&&identicalRussian.length===0
  };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const strict=process.argv.includes('--strict');
  const reports=TARGETS.map(examine);
  for(const r of reports){
    console.log(r.language.padEnd(3),String(r.translated).padStart(4)+'/'+r.required,
      (r.percent+'%').padStart(6),'missing='+r.missing.length,
      'placeholder-mismatch='+r.mismatches.length,
      'same-as-English='+r.identicalEnglish.length,
      r.releaseReady?'RELEASE_CANDIDATE':'NOT_COMPLETE');
  }
  console.log('Full reports are computed locally; do not publish a partial draft as a finished locale.');
  if(strict && reports.some(r=>!r.releaseReady))process.exitCode=1;
}
