import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const allowed=new Set(['index.html','app.js','core.js','db.js','style.css','manifest.webmanifest','icon.svg','ada.svg','icon-192.png','icon-512.png','sw.js']);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const name=pathname==='/'?'index.html':pathname.slice(1);if(!allowed.has(name)){res.writeHead(404);res.end('Not found');return;}const data=await readFile(path.join(root,name));res.writeHead(200,{'Content-Type':mime[path.extname(name)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);}catch{res.writeHead(500);res.end('Error');}}).listen(4173,'127.0.0.1',()=>console.log('Vista local: http://localhost:4173'));


