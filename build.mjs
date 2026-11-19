import {mkdir,copyFile} from 'node:fs/promises';
const assets=['index.html','app.js','core.js','db.js','style.css','manifest.webmanifest','icon.svg','ada.svg','icon-192.png','icon-512.png','sw.js'];
await mkdir(new URL('./dist/',import.meta.url),{recursive:true});
for(const asset of assets)await copyFile(new URL(asset,import.meta.url),new URL('dist/'+asset,import.meta.url));
console.log('App preparada en dist/ (sin registros locales ni fotos de prueba).');
