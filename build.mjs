import {mkdir,copyFile} from 'node:fs/promises';
const assets=['html2pdf.bundle.min.js','index.html','app.js','core.js','sync.js','db.js','style.css','manifest.webmanifest','icon.svg','ada.svg','ada.png','icon-192.png','icon-512.png','sw.js'];
await mkdir(new URL('./dist/',import.meta.url),{recursive:true});
await copyFile(new URL('./node_modules/html2pdf.js/dist/html2pdf.bundle.min.js',import.meta.url),new URL('./html2pdf.bundle.min.js',import.meta.url));
for(const asset of assets)await copyFile(new URL(asset,import.meta.url),new URL('dist/'+asset,import.meta.url));
console.log('App preparada en dist/ (sin registros locales ni fotos de prueba).');
