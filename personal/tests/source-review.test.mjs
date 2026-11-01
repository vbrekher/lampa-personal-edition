import test from 'node:test';import assert from 'node:assert/strict';import{validateReview}from'../../tools/i18n-source-review.mjs';
test('source review rejects new text, changed dynamic expressions and changed surrounding code',()=>{
 const row={file:'src/example.js',line:1,column:1,value:'Dolby Vision',kind:'literal'};
 const dynamic={file:row.file,line:2,column:1,expression:"Lang.known(key, 'network_error')"};
 const sources={hardcodedCandidates:[row],dynamicCalls:[dynamic],syntaxErrors:[]};
 const review={candidates:[{...row,category:'brand',reason:'Codec product name.'}],dynamicCalls:[{...dynamic,category:'guarded-dynamic',reason:'Localized fallback.'}],sourceHashes:{[row.file]:'original'},baselineCandidates:0,baselineResolution:[],baselineDynamicCalls:0,baselineDynamicExpressions:[]};
 assert.deepEqual(validateReview(sources,review,review.sourceHashes),[]);
 assert.ok(validateReview({...sources,hardcodedCandidates:[{...row,value:'New visible help'}]},review,review.sourceHashes).some(e=>e.startsWith('Unreviewed')));
 assert.ok(validateReview({...sources,dynamicCalls:[{...dynamic,expression:'Lang.translate(serverCode)'}]},review,review.sourceHashes).some(e=>e.startsWith('Unreviewed')));
 assert.ok(validateReview(sources,review,{[row.file]:'changed surrounding function'}).some(e=>e.startsWith('Changed source context')));
});
