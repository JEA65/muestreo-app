/* Muestreo - servicio vinculado a la planilla. No colocar claves en este archivo. */
const DESTINO = {folderId:'1WMtblwAolG0Kw8kgJAlNdP2fGNRA79MS', spreadsheetId:'1fb1YM3cBviZeykvcRrxfzXtP2HeHVlWIfrIvubY7qXU', tab:'Registros'};
const HEADERS = ['ID','Revisión','Cuenca / campaña anterior','Sitio de muestreo','Cuerpo/curso de agua','Fecha de campo','Hora de campo','Observadores','Latitud','Longitud','pH','Conductividad','Unidad conductividad','SDT','Unidad SDT','Turbiedad','Unidad turbiedad','Oxígeno disuelto','Unidad oxígeno','Equipo de medición','Dispositivo','Recibido UTC','Ficha PDF','Foto 1','Foto 2','Carpeta del registro'];

function onOpen(){SpreadsheetApp.getUi().createMenu('Muestreo').addItem('Actualizar nombres de carpetas','actualizarNombresCarpetas').addItem('Configurar destino','configurarMuestreo').addItem('Crear acceso de un celular','crearAccesoEquipo').addItem('Revocar acceso de un celular','revocarAccesoEquipo').addToUi();}
function configurarMuestreo(){
 const folder=DriveApp.getFolderById(DESTINO.folderId);const ss=SpreadsheetApp.openById(DESTINO.spreadsheetId);
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{getSheet_();PropertiesService.getScriptProperties().setProperty('CONFIG',JSON.stringify(DESTINO));}
 finally{lock.releaseLock();}
 SpreadsheetApp.getUi().alert('Destino configurado: '+folder.getName()+' / '+ss.getName()+'. Creá ahora un acceso para cada celular.');
}
function crearAccesoEquipo(){
 const ui=SpreadsheetApp.getUi();const result=ui.prompt('Acceso de celular','Código único, por ejemplo equipo-01 (letras, números y guiones).',ui.ButtonSet.OK_CANCEL);
 if(result.getSelectedButton()!==ui.Button.OK)return;
 const id=result.getResponseText().trim();if(!/^[a-zA-Z0-9_-]{3,40}$/.test(id))throw new Error('Código inválido.');
 const props=PropertiesService.getScriptProperties();if(props.getProperty('DEVICE_'+id))throw new Error('Este código ya existe. Revocalo o elegí otro.');
 const token=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');
 props.setProperty('DEVICE_'+id,hash_(token));
 ui.alert('Acceso para '+id,'Código del equipo: '+id+'\n\nClave de envío (se muestra una sola vez):\n'+token+'\n\nIngresá estos datos en Configurar envío dentro de Muestreo. No los guardes en la planilla pública.',ui.ButtonSet.OK);
}
function revocarAccesoEquipo(){const ui=SpreadsheetApp.getUi();const result=ui.prompt('Revocar acceso','Código del celular que dejará de enviar registros.',ui.ButtonSet.OK_CANCEL);if(result.getSelectedButton()!==ui.Button.OK)return;const id=result.getResponseText().trim();if(!/^[a-zA-Z0-9_-]{3,40}$/.test(id))throw new Error('Código inválido.');PropertiesService.getScriptProperties().deleteProperty('DEVICE_'+id);ui.alert('Acceso revocado. Los registros ya subidos se conservan.');}
function doGet(){return json_({service:'Muestreo',apiVersion:1,ok:true});}
function doPost(event){
 let lock;
 try{
  if(!event.postData||event.postData.contents.length>24000000)throw code_('VALIDATION');
  const p=JSON.parse(event.postData.contents);const props=PropertiesService.getScriptProperties();
  if(!/^[a-zA-Z0-9_-]{3,40}$/.test(p.deviceId||'')||typeof p.token!=='string'||p.token.length>200||props.getProperty('DEVICE_'+p.deviceId)!==hash_(p.token))throw code_('AUTH');
  if(p.apiVersion!==1)throw code_('VALIDATION');
  const r=validateRecord_(p.record);if(!props.getProperty('CONFIG'))throw code_('CONFIG');
  lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw code_('BUSY');
  return json_(receive_(r,p.deviceId,p.pdfData));
 }catch(err){if(!err.safeCode)console.error(err.stack||String(err));return json_({ok:false,code:err.safeCode||'SERVER'});}
 finally{if(lock&&lock.hasLock())lock.releaseLock();}
}
function code_(code){const err=new Error(code);err.safeCode=code;return err;}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function hash_(text){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,text,Utilities.Charset.UTF_8).map(b=>(b+256).toString(16).slice(-2)).join('');}
function canonical_(value){if(Array.isArray(value))return '['+value.map(canonical_).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical_(value[k])).join(',')+'}';return JSON.stringify(value);}
function validateRecord_(r){
 if(!r||![1,2].includes(r.schemaVersion)||!/^[a-f0-9-]{36}$/i.test(r.id||'')||!Number.isSafeInteger(r.revision)||r.revision<1||!r.fields||!r.measurements||!Array.isArray(r.photos)||r.photos.length>2)throw code_('VALIDATION');
 for(const key of [r.schemaVersion===2?'cuenca':'campana','codigo','fecha','hora','observadores'])if(typeof r.fields[key]!=='string'||!r.fields[key].trim())throw code_('VALIDATION');
 for(const key of Object.keys(r.fields)){const v=r.fields[key];if(Array.isArray(v)){if(v.length>40||v.some(x=>typeof x!=='string'||x.length>500))throw code_('VALIDATION');}else if(typeof v!=='string'||v.length>12000)throw code_('VALIDATION');}
 for(const m of SCHEMA.metrics){const v=r.measurements[m.key];if(!v||!['medido','pendiente','no_medido','no_disponible'].includes(v.status)||!m.units.includes(v.unit)||typeof v.value!=='string')throw code_('VALIDATION');if(v.status==='medido'){const n=Number(v.value.replace(',','.'));if(!v.value.trim()||!Number.isFinite(n)||n<m.min||(m.max!==undefined&&n>m.max))throw code_('VALIDATION');}}
 for(const key of ['latitud','longitud']){const v=r.fields[key];if(v){const n=Number(v.replace(',','.'));if(!Number.isFinite(n)||Math.abs(n)>(key==='latitud'?90:180))throw code_('VALIDATION');}}
 if(Boolean(r.fields.latitud)!==Boolean(r.fields.longitud))throw code_('VALIDATION');
 for(const p of r.photos){if(typeof p.data!=='string'||p.data.length>5000000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(p.data)||typeof p.caption!=='string'||p.caption.length>4000)throw code_('VALIDATION');const bytes=Utilities.base64Decode(p.data.split(',')[1]);if(bytes.length<3||(bytes[0]&255)!==255||(bytes[1]&255)!==216||(bytes[2]&255)!==255)throw code_('VALIDATION');}
 return r;
}
function getSheet_(){
 const ss=SpreadsheetApp.openById(DESTINO.spreadsheetId);let sheet=ss.getSheetByName(DESTINO.tab);
 if(!sheet)sheet=ss.insertSheet(DESTINO.tab);
 if(sheet.getLastRow()===0){sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);sheet.setFrozenRows(1);sheet.getRange(1,1,1,HEADERS.length).setBackground('#073b57').setFontColor('#ffffff').setFontWeight('bold').setWrap(true);sheet.setRowHeight(1,44);sheet.setColumnWidths(1,HEADERS.length,150);sheet.setColumnWidths(23,4,230);}
 else {const actual=sheet.getRange(1,1,1,HEADERS.length).getValues()[0];const legacy=HEADERS.slice();legacy[2]='Campaña';legacy[3]='Sitio';legacy[4]='Cuerpo de agua';if(JSON.stringify(actual)===JSON.stringify(legacy))sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);else if(JSON.stringify(actual)!==JSON.stringify(HEADERS))throw code_('CONFIG');}
 return sheet;
}
function childFolder_(parent,name){const items=parent.getFoldersByName(name);return items.hasNext()?items.next():parent.createFolder(name);}
function findFile_(folder,name){const items=folder.getFilesByName(name);return items.hasNext()?items.next():null;}
function ensureFile_(folder,name,blob){return findFile_(folder,name)||folder.createFile(blob.setName(name));}
function driveUrl_(file){return 'https://drive.google.com/file/d/'+file.getId()+'/view';}
function receive_(r,deviceId,pdfData){
 const pdfBlob=pdfData?validatePdf_(pdfData):null;
 const sheet=getSheet_();const found=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(r.id).matchEntireCell(true).useRegularExpression(false).findNext():null;
 const row=found?found.getRow():sheet.getLastRow()+1;
 if(found&&Number(sheet.getRange(row,2).getValue())>r.revision)throw code_('CONFLICT');
 const parent=DriveApp.getFolderById(DESTINO.folderId);const folder=recordFolder_(parent,r,deviceId,found?sheet.getRange(row,26).getValue():'');
 const revision=childFolder_(folder,'revision-'+String(r.revision).padStart(6,'0'));const fingerprint=hash_(canonical_(r));
 if(revision.getDescription()&&revision.getDescription()!==fingerprint)throw code_('CONFLICT');revision.setDescription(fingerprint);folder.setName(readableFolderName_(r.fields));
 const photos=r.photos.map((p,i)=>ensureFile_(revision,'foto-'+(i+1)+'.jpg',Utilities.newBlob(Utilities.base64Decode(p.data.split(',')[1]),'image/jpeg')));
 ensureFile_(revision,'datos.json',Utilities.newBlob(JSON.stringify(r,null,2),'application/json'));
 let pdf;if(pdfBlob){pdf=ensureFile_(revision,'ficha-vista-previa.pdf',pdfBlob);}else{pdf=findFile_(revision,'ficha-vista-previa.pdf')||findFile_(revision,'ficha.pdf');if(!pdf)pdf=makePdf_(r,revision,photos);}
 const received=new Date().toISOString();const value=key=>r.measurements[key].status==='medido'?Number(r.measurements[key].value.replace(',','.')):({'pendiente':'Sin completar','no_medido':'No medido','no_disponible':'Equipo no disponible'}[r.measurements[key].status]);
 const values=[r.id,r.revision,r.fields.cuenca||r.fields.campana,r.fields.codigo,r.fields.nombre||'',r.fields.fecha,r.fields.hora,r.fields.observadores,r.fields.latitud||'',r.fields.longitud||'',value('ph'),value('conductividad'),r.measurements.conductividad.unit,value('sdt'),r.measurements.sdt.unit,value('turbiedad'),r.measurements.turbiedad.unit,value('oxigeno'),r.measurements.oxigeno.unit,r.fields.equipo||'',deviceId,received,driveUrl_(pdf),photos[0]?driveUrl_(photos[0]):'',photos[1]?driveUrl_(photos[1]):'',folder.getUrl()];
 sheet.getRange(row,1,1,HEADERS.length).setValues([values.map(v=>typeof v==='string'&&/^[=+@-]/.test(v)?"'"+v:v)]).setVerticalAlignment('top').setWrap(true);
 SpreadsheetApp.flush();
 return {ok:true,id:r.id,revision:r.revision,receivedAt:received,pdfUrl:driveUrl_(pdf),photoUrls:photos.map(driveUrl_),sheetUrl:SpreadsheetApp.openById(DESTINO.spreadsheetId).getUrl()+'#gid='+sheet.getSheetId()+'&range=A'+row,folderUrl:folder.getUrl()};
}
function makePdf_(r,folder,photos){
 let existing=findFile_(folder,'ficha-temporal');let doc=existing?DocumentApp.openById(existing.getId()):DocumentApp.create('ficha-temporal');const docFile=DriveApp.getFileById(doc.getId());docFile.moveTo(folder);
 const body=doc.getBody();body.clear();body.setPageWidth(595).setPageHeight(842).setMarginTop(36).setMarginBottom(36).setMarginLeft(36).setMarginRight(36);
 body.setAttributes({[DocumentApp.Attribute.FONT_FAMILY]:'Arial',[DocumentApp.Attribute.FONT_SIZE]:10,[DocumentApp.Attribute.FOREGROUND_COLOR]:'#102a3a'});
 body.appendImage(Utilities.newBlob(Utilities.base64Decode(ADA_LOGO_BASE64),'image/png')).setWidth(110).setHeight(55);
 body.appendParagraph('Muestreo · Ficha de caracterización del sitio').setHeading(DocumentApp.ParagraphHeading.HEADING1);
 body.appendParagraph(r.fields.codigo+' · '+r.fields.fecha+' · '+r.fields.hora).editAsText().setBold(true);
 body.appendParagraph('ID: '+r.id+' · Revisión '+r.revision).editAsText().setFontSize(8);
 addTable_(body,'Identificación y ubicación',Object.entries(SCHEMA.labels).filter(([k])=>k!=='observaciones').map(([k,label])=>[label,String(r.fields[k]||'Sin completar')]));
 addTable_(body,'Mediciones in situ',SCHEMA.metrics.map(m=>{const v=r.measurements[m.key];return [m.label,v.status==='medido'?v.value+' '+v.unit:({'pendiente':'Sin completar','no_medido':'No medido','no_disponible':'Equipo no disponible'}[v.status])];}));
 if(photos.length){body.appendParagraph('Registro fotográfico').setHeading(DocumentApp.ParagraphHeading.HEADING2);photos.forEach((file,i)=>{const image=body.appendImage(file.getBlob());const ratio=Math.min(480/image.getWidth(),230/image.getHeight());image.setWidth(Math.round(image.getWidth()*ratio)).setHeight(Math.round(image.getHeight()*ratio));body.appendParagraph('Foto '+(i+1)+': '+(r.photos[i].caption||'Sin descripción')).editAsText().setFontSize(9);});}
 if(r.fields.observaciones){body.appendParagraph('Observaciones generales').setHeading(DocumentApp.ParagraphHeading.HEADING2);body.appendParagraph(r.fields.observaciones);}
 const completed=SCHEMA.sections.map(s=>({title:s.title,rows:s.fields.filter(([k])=>Array.isArray(r.fields[k])?r.fields[k].length:typeof r.fields[k]==='string'&&r.fields[k].trim()).map(([k,l])=>[l,Array.isArray(r.fields[k])?r.fields[k].join(', '):r.fields[k]])})).filter(s=>s.rows.length);
 if(completed.length){body.appendParagraph('Caracterización ambiental y paisajística').setHeading(DocumentApp.ParagraphHeading.HEADING2);completed.forEach(s=>addTable_(body,s.title,s.rows));}
 body.appendParagraph('Observaciones de campo. Las observaciones compatibles con floraciones no constituyen identificación taxonómica ni confirman toxinas.').editAsText().setFontSize(8);
 doc.saveAndClose();const pdf=folder.createFile(docFile.getAs(MimeType.PDF).setName('ficha.pdf'));docFile.setTrashed(true);return pdf;
}
function addTable_(body,title,rows){body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.HEADING2);const table=body.appendTable(rows);for(let i=0;i<table.getNumRows();i++){const cell=table.getRow(i).getCell(0);cell.setBackgroundColor('#e3eff5');cell.editAsText().setBold(true);}body.appendParagraph('');}

function readableFolderName_(fields){return [fields.cuenca||fields.campana,fields.codigo].map(v=>String(v||'').replace(/[\x00-\x1f\/\\]/g,' ').replace(/\s+/g,' ').trim().slice(0,100)).join(' · ');}
function recordFolder_(parent,r,deviceId,url){
 let folder=null;const match=String(url||'').match(/\/folders\/([a-zA-Z0-9_-]+)/);
 if(match){folder=DriveApp.getFolderById(match[1]);const parents=folder.getParents();let valid=false;while(parents.hasNext())if(parents.next().getId()===parent.getId())valid=true;if(!valid)throw code_('CONFLICT');}
 if(!folder){const old=parent.getFoldersByName(r.id);if(old.hasNext())folder=old.next();}
 if(!folder){const folders=parent.getFolders();while(folders.hasNext()){const f=folders.next();try{if(JSON.parse(f.getDescription()).recordId===r.id){folder=f;break;}}catch{}}}
 if(!folder)folder=parent.createFolder(r.id);
 const description=folder.getDescription()||'';let owner;
 if(description.startsWith('device:'))owner=description.slice(7);else if(description){let metadata;try{metadata=JSON.parse(description);}catch{throw code_('CONFLICT');}if(metadata.recordId!==r.id)throw code_('CONFLICT');owner=metadata.deviceId;}
 if(owner&&owner!==deviceId)throw code_('CONFLICT');
 folder.setDescription(JSON.stringify({recordId:r.id,deviceId:deviceId}));return folder;
}
function validatePdf_(data){
 if(typeof data!=='string'||data.length>10000000)throw code_('VALIDATION');
 const match=/^data:application\/pdf;(?:filename=[^;]+;)?base64,([A-Za-z0-9+/=]+)$/.exec(data);if(!match)throw code_('VALIDATION');
 const bytes=Utilities.base64Decode(match[1]);if(bytes.length<8||[37,80,68,70,45].some((v,i)=>(bytes[i]&255)!==v))throw code_('VALIDATION');
 return Utilities.newBlob(bytes,'application/pdf');
}
function actualizarNombresCarpetas(){const lock=LockService.getScriptLock();lock.waitLock(10000);let total=0;try{const sheet=getSheet_();if(sheet.getLastRow()>1){const rows=sheet.getRange(2,1,sheet.getLastRow()-1,HEADERS.length).getValues();const parent=DriveApp.getFolderById(DESTINO.folderId);rows.forEach(row=>{const fields={campana:row[2],codigo:row[3]};recordFolder_(parent,{id:String(row[0]),fields:fields},String(row[20]),row[25]).setName(readableFolderName_(fields));total++;});}}finally{lock.releaseLock();}console.log('Carpetas con nombres legibles: '+total);}
