import {parseExpression} from '@babel/parser';
export const placeholders=text=>(text.match(/#?\{[a-z_][\w.-]*\}/gi)||[]).sort();
// Parse data without evaluating JS: duplicate properties must survive until validation.
export function parseDictionary(text,file='<dictionary>'){
  const json=file.endsWith('.json');
  if(json)JSON.parse(text); // Reject JSON syntax that JavaScript accepts.
  else if(!/^\s*export default\s+/.test(text))throw new Error('Unexpected source module: '+file);
  const source=json?text:text.replace(/^\s*export default\s+/,'').replace(/;\s*$/,'');
  const ast=parseExpression(source);
  if(ast.type!=='ObjectExpression')throw new Error('Invalid language object: '+file);
  const values={},duplicates=[],invalid=[];
  for(const prop of ast.properties){
    if(prop.type!=='ObjectProperty'||prop.computed||!['Identifier','StringLiteral'].includes(prop.key.type))
      throw new Error('Non-data property: '+file);
    const key=prop.key.name??prop.key.value;
    if(Object.hasOwn(values,key))duplicates.push(key);
    if(prop.value.type!=='StringLiteral')throw new Error('Non-string translation: '+file+' '+key);
    values[key]=prop.value.value;
    if(!values[key].trim())invalid.push({key,reason:'empty'});
  }
  return {values,duplicates,invalid};
}
const VOID=new Set(['br','hr','img','input','meta','link','wbr','source','area','base','col','embed','param','track']);
export function markupErrors(text){
  const stack=[],errors=[];
  // Only HTML-looking tags; values such as "< 5" are text.
  for(const match of text.matchAll(/<\s*(\/?)\s*([a-z][\w-]*)\b[^>]*>/gi)){
    const [,closing,raw]=match,tag=raw.toLowerCase();
    if(VOID.has(tag)||/\/\s*>$/.test(match[0]))continue;
    if(closing){if(stack.pop()!==tag)errors.push('unbalanced closing '+tag);}
    else stack.push(tag);
  }
  if(stack.length)errors.push('unclosed '+stack.join(','));
  return errors;
}
export function inspectValue(value,reference=''){
  const issues=[];
  if(typeof value!=='string')return ['non-string'];
  if(!value.trim())issues.push('empty');
  if(value.includes('\ufffd')||/[\ud800-\udfff]/u.test(value))issues.push('invalid-unicode');
  if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value))issues.push('control-character');
  if(/[\u202a-\u202e\u2066-\u2069]/u.test(value))issues.push('bidi-control-review');
  if(/\b(?:TODO|FIXME|TRANSLATE_ME)\b/.test(value))issues.push('unfinished-marker');
  if(JSON.stringify(placeholders(value))!==JSON.stringify(placeholders(reference)))issues.push('placeholder-mismatch');
  issues.push(...markupErrors(value).map(issue=>'markup: '+issue));
  return issues;
}
