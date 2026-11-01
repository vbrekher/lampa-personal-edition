#!/usr/bin/env node
// Source inventory is deliberately a review queue, not a translation certificate.
import {parse} from '@babel/parser';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(fileURLToPath(new URL('..',import.meta.url)));
export function walk(node,visit,parent=null){
  if(!node||typeof node!=='object')return;
  if(node.type)visit(node,parent);
  for(const [key,value] of Object.entries(node)){
    if(['loc','start','end','comments','tokens'].includes(key))continue;
    if(Array.isArray(value))value.forEach(child=>walk(child,visit,node));
    else if(value&&typeof value==='object')walk(value,visit,node);
  }
}
const literal=node=>node?.type==='StringLiteral'?node.value:
  node?.type==='TemplateLiteral'&&!node.expressions.length?node.quasis[0].value.cooked:null;
const name=node=>node?.name??node?.value;
export function inspectSource(source,file='<fixture>'){
  const out={references:[],dynamicCalls:[],registrations:[],hardcodedCandidates:[],duplicates:[],syntaxErrors:[]};
  let ast;
  try{ast=parse(source,{sourceType:'unambiguous'});}catch(error){
    out.syntaxErrors.push({file,line:error.loc?.line,message:error.message});return out;
  }
  const at=node=>({file,line:node.loc.start.line,column:node.loc.start.column+1});
  const addRef=(key,node,kind)=>out.references.push({...at(node),key,kind});
  walk(ast,(node,parent)=>{
    if(node.type==='ObjectExpression'){
      const seen=new Set();
      for(const prop of node.properties){
        if(prop.type!=='ObjectProperty'||prop.computed)continue;
        const key=name(prop.key);
        if(seen.has(key))out.duplicates.push({...at(prop),key});
        seen.add(key);
      }
    }
    if(node.type==='CallExpression'&&node.callee.type==='MemberExpression'){
      const callee=node.callee;
      const owner=callee.object.name;
      const method=name(callee.property);
      const isLang=owner==='Lang'||(callee.object.type==='MemberExpression'&&
        name(callee.object.property)==='Lang');
      if(isLang&&['translate','known'].includes(method)){
        if(method==='known'&&typeof literal(node.arguments[1])==='string')addRef(literal(node.arguments[1]),node,'dynamic-fallback');
        const value=literal(node.arguments[0]);
        if(value===null)out.dynamicCalls.push({...at(node),expression:source.slice(node.start,node.end)});
        else if(!value.includes('#{'))addRef(value,node,'translate');
      }
      if(isLang&&['add','AddTranslation','codes','addCodes'].includes(method)){
        out.registrations.push({...at(node),method,expression:source.slice(node.start,node.end)});
      }
    }
    if(node.type==='ObjectProperty'&&name(node.key)==='i18n_key'&&typeof literal(node.value)==='string')addRef(literal(node.value),node,'notice-key');
    let value=literal(node);
    // Quasis with expressions still contain translatable static text.
    if(node.type==='TemplateElement')value=node.value.cooked;
    if(typeof value!=='string')return;
    // Avoid counting an expression-free template twice.
    if(node.type==='TemplateElement'&&parent?.type==='TemplateLiteral'&&!parent.expressions.length)return;
    if(parent?.type==='ObjectProperty'&&['title','subtitle','label','caption'].includes(name(parent.key))&&/^(?:title|menu|settings|player|extensions|filter|full|torrent|network|watch_history|developer|reactions)_[a-z0-9_]+$/.test(value))addRef(value,node,'registry-key');
    for(const match of value.matchAll(/#\{([\w-]+)\}/g))addRef(match[1],node,'template');
    // Strip markup/attributes and SVG paths so the review queue contains visible text.
    // Keep raw non-HTML literals too: notifications and generated messages live there.
    if(!file.startsWith('src/lang/')&&node!==parent?.key){
      const html=/<[a-z][^>]*>/i.test(value);
      const texts=html?value.replace(/<svg[\s\S]*?<\/svg>/gi,'').split(/<[^>]*>/g):[value];
      for(const text of texts){
        const visible=text.replace(/#?\{[\w.-]+\}/g,'').replace(/&[\w#]+;/g,' ').trim();
        const uiProperty=parent?.type==='ObjectProperty'&&['title','label','text','placeholder','descr','description','caption','name'].includes(name(parent.key));
        const uiSetter=parent?.type==='CallExpression'&&parent.callee?.type==='MemberExpression'&&(['text','html'].includes(name(parent.callee.property))||name(parent.callee.property)==='attr'&&['title','placeholder','aria-label'].includes(literal(parent.arguments[0])));
        const singleUiWord=(uiProperty||uiSetter)&&/^[A-Za-z][A-Za-z -]*[.!?:…]?$/.test(visible);
        if(singleUiWord||(html&&/[\p{L}]{3}/u.test(visible))||/[\u0400-\u052f]{3}/u.test(visible)||/[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(visible)){
          out.hardcodedCandidates.push({...at(node),value:text.trim(),kind:html?'html-text':singleUiWord?'ui-literal':'literal'});
        }
      }
    }
  });
  return out;
}
function files(dir){
  return readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))
    .flatMap(entry=>entry.isDirectory()?files(resolve(dir,entry.name)):
      entry.name.endsWith('.js')?[resolve(dir,entry.name)]:[]);
}
export function inventory(root=ROOT){
  const out={references:[],dynamicCalls:[],registrations:[],hardcodedCandidates:[],duplicates:[],syntaxErrors:[]};
  for(const file of files(resolve(root,'src'))){
    const result=inspectSource(readFileSync(file,'utf8'),relative(root,file));
    for(const key of Object.keys(out))out[key].push(...result[key]);
  }
  out.keys=[...new Set(out.references.map(item=>item.key))].sort();
  return out;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  console.log(JSON.stringify(inventory(),null,2));
}
