export const DEFAULT_ENDPOINT = "https://script.google.com/macros/s/AKfycbzQ2n9XxCW0KbwnBDNaTroY3ZjmztUjQXttZXgZxn00IpuHkIZNJGjHHtcqX7Xy4G8A/exec";
export function validEndpoint(value) {
 try {const u=new URL(value);return u.protocol==='https:'&&u.hostname==='script.google.com'&&/^\/macros\/s\/[\w-]+\/exec$/.test(u.pathname)&&!u.search&&!u.hash;}catch{return false;}
}
export function isPending(record){return record.status!=='synced'||record.remote?.revision!==record.revision;}
export function receiptValid(record,receipt){
 const link=(value,host,path)=>{try{const u=new URL(value);return u.protocol==='https:'&&u.hostname===host&&u.pathname.startsWith(path);}catch{return false;}};
 return receipt?.ok===true&&receipt.id===record.id&&receipt.revision===record.revision&&link(receipt.pdfUrl,'drive.google.com','/file/d/')&&link(receipt.sheetUrl,'docs.google.com','/spreadsheets/d/')&&Array.isArray(receipt.photoUrls)&&receipt.photoUrls.length===record.photos.length&&receipt.photoUrls.every(url=>link(url,'drive.google.com','/file/d/'));
}
export async function sendRecord(record,config,fetcher=fetch){
 if(!validEndpoint(config.endpoint)||!config.deviceId||!config.token)throw new Error('Configurá el acceso de este equipo antes de sincronizar.');
 const payload={apiVersion:1,deviceId:config.deviceId,token:config.token,record:{schemaVersion:record.schemaVersion,id:record.id,revision:record.revision,createdAt:record.createdAt,updatedAt:record.updatedAt,fields:record.fields,measurements:record.measurements,photos:record.photos}};
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),90000);
 try {
  const response=await fetcher(config.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),credentials:'omit',redirect:'follow',signal:controller.signal});
  if(!response.ok)throw new Error('El servicio no confirmó el envío. Se conservará pendiente.');
  let receipt;try{receipt=await response.json();}catch{throw new Error('El servicio no devolvió una confirmación válida. Revisá la implementación de Apps Script.');}
  if(!receipt.ok){const errors={AUTH:'El acceso del equipo no está autorizado. Revisá su clave de envío.',CONFLICT:'La revisión enviada entra en conflicto con otra guardada. No se sobrescribió.',BUSY:'El servicio está ocupado. Se reintentará más tarde.',VALIDATION:'El servicio rechazó el formato del registro.',CONFIG:'El servicio de Google todavía no está configurado.'};throw new Error(errors[receipt.code]||'Google no completó el registro. Queda pendiente para reintentar.');}
  if(!receiptValid(record,receipt))throw new Error('Falta confirmar el registro, las fotos o el PDF. Se conserva pendiente.');
  return receipt;
 }finally{clearTimeout(timer);}
}

// La activación usa el fragmento: la clave no viaja al servidor de alojamiento.
export function parseActivation(hash){
 if(!hash.startsWith('#activar='))return null;
 const match=/^#activar=v1\.([a-zA-Z0-9_-]{3,40})\.([a-f0-9]{64})$/.exec(hash);
 if(!match)throw new Error('El enlace de activación está incompleto o no es válido. Volvé a escanear el QR.');
 return {endpoint:DEFAULT_ENDPOINT,deviceId:match[1],token:match[2]};
}
export function activationLink(deviceId,token){
 const hash='#activar=v1.'+deviceId+'.'+token;parseActivation(hash);
 return 'https://jea65.github.io/muestreo-app/'+hash;
}
