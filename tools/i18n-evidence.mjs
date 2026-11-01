#!/usr/bin/env node
import {mkdirSync,writeFileSync,readdirSync,readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {implementationFingerprint} from './i18n-fingerprint.mjs';
import {checkSourceReview} from './i18n-source-review.mjs';
import {inventory} from './i18n-source-audit.mjs';
import {TARGETS,SUPPORTED,examine,reference} from './i18n-audit.mjs';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const output=resolve(root,'reports/localization');
mkdirSync(output,{recursive:true});
const sources=inventory(root),ref=reference();
const sourceReview=checkSourceReview(),fingerprint=implementationFingerprint();
const qaPath=resolve(root,'docs/localization/QA_STATUS.json');
const recorded=existsSync(qaPath)?JSON.parse(readFileSync(qaPath,'utf8')):null;
const qa=recorded?.implementationFingerprint===fingerprint?recorded:null;
const browserProof=qa?.browsers?.chromium;
const runtimePassed=browserProof?.failed===0&&browserProof?.all21LanguagePersistence==='PASS';
const shipped=readdirSync(resolve(root,'src/lang')).filter(file=>file.endsWith('.js')&&file!=='meta.js').map(file=>file.slice(0,-3));
const languages=[...new Set([...TARGETS,...shipped])];
sources.unresolvedReferences=sources.references.filter(item=>!Object.hasOwn(ref,item.key));
const json=(file,value)=>writeFileSync(resolve(output,file),JSON.stringify(value,null,2)+'\n');
json('source-inventory.json',sources);
const results=languages.map(code=>{
  const report=examine(code);
  const result={...report,shipped:shipped.includes(code),
    sourceKeyUniverse:[...new Set([...Object.keys(ref),...sources.keys])].length,
    unresolvedReferenceKeys:[...new Set(sources.unresolvedReferences.map(item=>item.key))],
    linguisticReview:'CODEX_CONTEXT_REVIEWED',nativeLinguisticReview:'NOT_RUN',
    visualReview:runtimePassed&&browserProof.locales.includes(code)?'PASS':'NOT_RUN',
    visualCases:runtimePassed&&browserProof.locales.includes(code)?28:0,
    remoteNavigation:runtimePassed?'PASS':'NOT_RUN',
    softwareReady:report.releaseReady&&sourceReview.status==='PASS'&&runtimePassed,
    physicalTizen:'NOT_RUN',readyForRelease:false};
  json(code+'.json',result);
  return result;
});
json('summary.json',{
  implementationFingerprint:fingerprint,qaEvidenceCurrent:Boolean(qa),sourceReview,
  browserEvidence:qa?.browsers||null,buildMatrix:qa?.buildMatrix||null,
  canonicalKeys:Object.keys(ref).length,sourceKeys:sources.keys.length,
  sourceKeyUniverse:[...new Set([...Object.keys(ref),...sources.keys])].length,
  shippedLocales:shipped,targetLocales:TARGETS,supportedLocales:SUPPORTED,languages:results,
  checks:{translationKeys:results.filter(r=>SUPPORTED.includes(r.language)).every(r=>!r.missing.length)?'PASS':'FAIL',
    sourceReferences:sources.unresolvedReferences.length?'FAIL':'PASS',
    sourceSyntax:sources.syntaxErrors.length?'FAIL':'PASS',
    sourceReview:sourceReview.status,physicalTizen:'NOT_RUN',
    visualQA:runtimePassed?'PASS':'NOT_RUN',linguisticReview:'CODEX_CONTEXT_REVIEWED',nativeLinguisticReview:'NOT_RUN'}
});
console.log(`Evidence: ${output}\n${results.length} locales; ${sources.references.length} references; ${sources.dynamicCalls.length} dynamic calls; ${sources.hardcodedCandidates.length} text candidates.`);
if(process.argv.includes('--strict')&&(results.filter(r=>SUPPORTED.includes(r.language)).some(r=>!r.releaseReady)||sourceReview.status!=='PASS'||sources.unresolvedReferences.length||sources.syntaxErrors.length))process.exitCode=1;
