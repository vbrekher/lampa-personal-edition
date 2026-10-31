// Minimal localhost-only development server. No BrowserSync/localtunnel or external dependencies.
// Used only by `npm start`; never packaged inside the Samsung Tizen WGT.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {Transform} = require('node:stream');

const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon',
  '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf',
  '.mp3':'audio/mpeg', '.mp4':'video/mp4', '.webm':'video/webm'
};

function create() {
  let root;
  const clients = new Set();
  const reload = () => {
    for (const res of clients) {
      try { res.write('data: reload\\n\\n'); }
      catch { clients.delete(res); }
    }
  };
  function init(options) {
    if (root) throw new Error('Development server already started');
    root = fs.realpathSync(path.resolve(options.server.baseDir));
    const server = http.createServer((req,res) => {
      let pathname;
      try { pathname = new URL(req.url,'http://localhost').pathname; }
      catch { res.writeHead(400);res.end();return; }
      if (pathname === '/__lampa_reload') {
        res.writeHead(200,{
          'Content-Type':'text/event-stream',
          'Cache-Control':'no-store',
          'X-Content-Type-Options':'nosniff'
        });
        res.write(': connected\\n\\n');
        clients.add(res);
        req.on('close',()=>clients.delete(res));
        return;
      }
      if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
      let file;
      try {
        const decoded = decodeURIComponent(pathname);
        file = path.resolve(root,'.'+(decoded.endsWith('/')?decoded+'index.html':decoded));
        if (!(file===root || file.startsWith(root+path.sep))) throw new Error('Outside root');
        file=fs.realpathSync(file);
        if (!(file===root || file.startsWith(root+path.sep))) throw new Error('Outside root');
        if (!fs.statSync(file).isFile()) throw new Error('Not a file');
      } catch {res.writeHead(404);res.end();return;}
      const ext=path.extname(file).toLowerCase();
      res.setHeader('Content-Type',MIME[ext]||'application/octet-stream');
      res.setHeader('Cache-Control','no-store');
      res.setHeader('X-Content-Type-Options','nosniff');
      if(req.method==='HEAD'){res.writeHead(200);res.end();return;}
      if(ext==='.html'){
        const injection='<script>new EventSource("/__lampa_reload").onmessage=function(){location.reload();};</script>';
        const html=fs.readFileSync(file,'utf8');
        res.end(html.includes('</body>')?html.replace('</body>',injection+'</body>'):html+injection);
      } else {
        const stream=fs.createReadStream(file);
        stream.on('error',()=>{if(!res.headersSent)res.writeHead(500);res.end();});
        stream.pipe(res);
      }
    });
    server.listen(3000,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:3000'));
    return server;
  }
  function reloadFiles({stream}={}){
    if(!stream){reload();return;}
    return new Transform({
      objectMode:true,
      transform(file,encoding,done){this.push(file);done();},
      flush(done){reload();done();}
    });
  }
  return {init,reload:reloadFiles};
}
module.exports={create};
