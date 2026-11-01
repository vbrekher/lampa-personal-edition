#!/usr/bin/env node
// Lampa Personal Edition — local translation coverage and structural audit.
// Report missing translations honestly: key existence is not equivalent to linguistic quality.
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseDictionary,inspectValue,productIssues} from './i18n-validation.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const TARGETS=Object.freeze([
  'nl','de','tr','en','zh','hi','es','ar','fr','bn','pt','id','ur'
]);
export const SUPPORTED=Object.freeze([...TARGETS,'ru','uk','be','bg','cs','he','pl','ro']);
export const NAMES=Object.freeze({
  ru:'Русский',uk:'Українська',be:'Беларуская',bg:'Български',cs:'Čeština',he:'עברית',pl:'Polski',ro:'Română',
  nl:'Nederlands',de:'Deutsch',tr:'Türkçe',en:'English',zh:'简体中文',
  hi:'हिन्दी',es:'Español',ar:'العربية',fr:'Français',bn:'বাংলা',
  pt:'Português',id:'Bahasa Indonesia',ur:'اردو'
});
export const EXISTING=Object.freeze(['en','zh','es','fr','pt']);
export const NEW=Object.freeze(TARGETS.filter(code=>!EXISTING.includes(code)));
const exceptionFile=resolve(ROOT,'i18n/reviewed-exceptions.json');
const exceptions=existsSync(exceptionFile)?JSON.parse(readFileSync(exceptionFile,'utf8')):{};
const placeholderPattern=/#?\{[a-z_][\w.-]*\}/gi;
export function readLanguage(code){
  const draft=resolve(ROOT,'i18n/drafts',code+'.json');
  const source=resolve(ROOT,'src/lang',code+'.js');
  if(existsSync(source))return parseDictionary(readFileSync(source,'utf8'),source).values;
  if(existsSync(draft))return parseDictionary(readFileSync(draft,'utf8'),draft).values;
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
  const file=existsSync(resolve(ROOT,'src/lang',code+'.js'))?resolve(ROOT,'src/lang',code+'.js'):resolve(ROOT,'i18n/drafts',code+'.json');
  const parsed=existsSync(file)?parseDictionary(readFileSync(file,'utf8'),file):{duplicates:[],invalid:[]};
  const valueIssues=owned.flatMap(key=>inspectValue(lang[key],eng[key]||ref[key]||'').map(reason=>({key,reason})));
  const productMismatches=owned.flatMap(key=>productIssues(lang[key],eng[key]||ref[key]||'').map(product=>({key,product})));
  const scriptReview=owned.filter(key=>!['ru','uk','be','bg'].includes(code)&&/[\u0400-\u052f]{2}/u.test(lang[key]));
  const latinPhraseReview=owned.filter(key=>['zh','hi','ar','bn','ur','he'].includes(code)&&/[a-z]{3,}\s+[a-z]{3,}\s+[a-z]{3,}/i.test(lang[key]));
  const longTranslations=owned.filter(key=>lang[key].length>80&&lang[key].length>1.7*(eng[key]||ref[key]||'').length);
  const approved=exceptions[code]||{};
  const reviewedExceptions=Object.entries(approved).filter(([key,item])=>item.value===lang[key]&&item.reason?.trim()).map(([key,item])=>({key,...item}));
  const staleExceptions=Object.entries(approved).filter(([key,item])=>item.value!==lang[key]||!item.reason?.trim()).map(([key])=>key);
  const reviewed=new Set(reviewedExceptions.map(item=>item.key));
  const unreviewedEnglish=identicalEnglish.filter(key=>!reviewed.has(key));
  const unreviewedRussian=identicalRussian.filter(key=>!reviewed.has(key));
  // A literal match may be a deliberate trademark or established loanword.
  // This is a review signal, not proof of a bad translation.
  return {
    language:code,name:NAMES[code]||code,
    source:existsSync(resolve(ROOT,'src/lang',code+'.js'))?'upstream':'draft',
    required:required.length,
    translated:required.length-missing.length,
    percent:Number(((required.length-missing.length)*100/required.length).toFixed(1)),
    missing,extra,mismatches,identicalEnglish,identicalRussian,
    duplicates:parsed.duplicates,valueIssues,scriptReview,latinPhraseReview,longTranslations,
    reviewedExceptions,staleExceptions,unreviewedEnglish,unreviewedRussian,productMismatches,
    releaseReady:productMismatches.length===0&&staleExceptions.length===0&&scriptReview.length===0&&latinPhraseReview.length===0&&parsed.duplicates.length===0&&valueIssues.length===0&&missing.length===0&&mismatches.length===0&&unreviewedEnglish.length===0&&unreviewedRussian.length===0
  };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const strict=process.argv.includes('--strict');
  const reports=SUPPORTED.map(examine);
  for(const r of reports){
    console.log(r.language.padEnd(3),String(r.translated).padStart(4)+'/'+r.required,
      (r.percent+'%').padStart(6),'missing='+r.missing.length,
      'placeholder-mismatch='+r.mismatches.length,
      'same-as-English='+r.identicalEnglish.length,
      'duplicates='+r.duplicates.length,
      'value-issues='+r.valueIssues.length,
      r.releaseReady?'STRUCTURAL_CHECKS_PASS':'NOT_COMPLETE');
  }
  console.log('Full reports are computed locally; do not publish a partial draft as a finished locale.');
  if(strict && reports.some(r=>!r.releaseReady))process.exitCode=1;
}
