import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,relative} from 'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
export function implementationFingerprint(includeQA=true){
 const files=[];function scan(path){if(!existsSync(path))return;for(const e of readdirSync(path,{withFileTypes:true})){const p=resolve(path,e.name);if(e.isDirectory())scan(p);else files.push(p);}}
 for(const dir of ['src','public','index','personal/assets',...(includeQA?['personal/qa']:[])])scan(resolve(root,dir));
 for(const name of ['gulpfile.js','personal/build.mjs','personal/lib.mjs','personal/cli.mjs','personal/i18n.mjs','personal/dev-server.cjs','package.json','package-lock.json'])files.push(resolve(root,name));
 const hash=createHash('sha256');for(const file of files.sort()){hash.update(relative(root,file));hash.update('\0');hash.update(readFileSync(file));hash.update('\0');}return hash.digest('hex');
}
