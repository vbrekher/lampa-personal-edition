#!/usr/bin/env node
import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdirSync,cpSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve,extname,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const own=dirname(fileURLToPath(import.meta.url));
const root=resolve(own,'../..');
const args=process.argv.slice(2);
const option=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const wgt=resolve(option('--wgt',resolve(root,'dist/Lampa-Personal-Edition.wgt')));
const folder=resolve(option('--output',resolve(root,'.personal-build/qa')));
const port=Number(option('--port','8766'));
if(!existsSync(wgt))throw Error('Build a generic WGT before starting the QA server.');
mkdirSync(folder,{recursive:true});
execFileSync('unzip',['-oq',wgt,'-d',folder]);
cpSync(own,resolve(folder,'qa'),{recursive:true});
const html=readFileSync(resolve(folder,'index.html'),'utf8')
    .replace('<script src="https://www.youtube.com/iframe_api"></script>','')
    .replace('<script src="app.min.js"></script>',
    '<script src="qa/bootstrap.js"></script>\n<script src="app.min.js"></script>\n<script src="qa/driver.js"></script>');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff':'font/woff','.mp4':'video/mp4','.png':'image/png'};
createServer((request,response)=>{
    const url=new URL(request.url,'http://127.0.0.1');
    const path=resolve(folder,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!path.startsWith(folder+'/')){response.writeHead(403);return response.end();}
    if(!existsSync(path)||!statSync(path).isFile()){response.writeHead(404);return response.end();}
    const content=path.endsWith('/index.html')?Buffer.from(html):readFileSync(path);
    const headers={'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'};
    const range=request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(range){
        const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),content.length-1):content.length-1;
        response.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${content.length}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});
        return response.end(content.subarray(start,end+1));
    }
    response.writeHead(200,{...headers,'Content-Length':content.length});response.end(content);
}).listen(port,'127.0.0.1',()=>console.log(`QA fixture server: http://127.0.0.1:${port}/?locale=nl&screen=settings`));
