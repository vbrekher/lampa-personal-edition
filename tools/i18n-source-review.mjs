#!/usr/bin/env node
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {inventory} from './i18n-source-audit.mjs';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const signature=(row,type)=>JSON.stringify([row.file,row.line,row.column,type==='dynamicCalls'?row.expression:row.value,row.kind]);
export function validateReview(sources,review,hashes){
 const issues=[];
 for(const type of ['hardcodedCandidates','dynamicCalls']){
  const records=type==='hardcodedCandidates'?review.candidates:review.dynamicCalls;
  const pending=new Map();
  for(const row of records){const key=signature(row,type);pending.set(key,(pending.get(key)||0)+1);if(!row.category||!row.reason?.trim())issues.push('Missing decision: '+key);}
  for(const row of sources[type]){const key=signature(row,type);if(!pending.get(key))issues.push('Unreviewed source: '+key);else pending.set(key,pending.get(key)-1);}
  for(const[key,count]of pending)if(count)issues.push('Stale decision: '+key);
 }
 for(const file of new Set([...Object.keys(hashes),...Object.keys(review.sourceHashes)]))if(hashes[file]!==review.sourceHashes[file])issues.push('Changed source context: '+file);
 if(sources.syntaxErrors.length)issues.push('Source syntax errors');
 if(review.baselineCandidates!==review.baselineResolution.length||review.baselineResolution.some(row=>!row.reason||!['fixed','retained-reviewed'].includes(row.resolution)))issues.push('Incomplete historical candidate resolution');
 if(review.baselineDynamicCalls!==review.baselineDynamicExpressions.length)issues.push('Incomplete historical dynamic inventory');
 return issues;
}
function hashes(dir){return Object.fromEntries(readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
 const file=resolve(dir,entry.name);if(file===resolve(root,'src/lang'))return [];
 return entry.isDirectory()?Object.entries(hashes(file)):entry.name.endsWith('.js')?[[relative(root,file),createHash('sha256').update(readFileSync(file)).digest('hex')]]:[];
}));}
export function checkSourceReview(){
 const review=JSON.parse(readFileSync(resolve(root,'i18n/source-review.json'),'utf8')),sources=inventory(root);
 const issues=validateReview(sources,review,hashes(resolve(root,'src')));
 return {status:issues.length?'FAIL':'PASS',currentCandidates:sources.hardcodedCandidates.length,currentDynamicCalls:sources.dynamicCalls.length,baselineCandidates:review.baselineCandidates,baselineDynamicCalls:review.baselineDynamicCalls,fixedBaselineCandidates:review.baselineResolution.filter(row=>row.resolution==='fixed').length,unclassified:issues.length,issues};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=checkSourceReview();console.log(JSON.stringify(result,null,2));if(result.issues.length)process.exitCode=1;
}
