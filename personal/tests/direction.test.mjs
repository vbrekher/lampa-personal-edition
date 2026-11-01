import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../src/utils/direction.js',import.meta.url),'utf8');
const direction=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('only Arabic Urdu and Hebrew enable interface RTL',()=>{
 for(const code of ['ar','ur','he'])assert.equal(direction.isRTL(code),true);
 for(const code of ['nl','de','tr','hi','bn','id','en','zh','ru','uk','be','bg','cs','pl','ro','es','fr','pt'])assert.equal(direction.isRTL(code),false);
});
test('LTR native horizontal scroll keeps its physical coordinate and round trips',()=>{
 const element={scrollLeft:0};direction.writeScroll(element,325,false);
 assert.equal(element.scrollLeft,325);assert.equal(direction.readScroll(element,false),325);
});
test('technical field directions preserve URL and credential reading order while search stays automatic',()=>{
 for(const name of ['torrserver_url','jackett_url','jackett_key_api_key','email','hash'])assert.equal(direction.fieldDirection(name,false),'ltr');
 assert.equal(direction.fieldDirection('query',false),'auto');
 assert.equal(direction.fieldDirection('query',true),'ltr');
});
