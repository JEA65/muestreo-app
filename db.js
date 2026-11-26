import {canRemoveLocal} from './sync.js';
const opening = new Promise((resolve, reject) => {
  const req = indexedDB.open('agua-campanas', 2);
  req.onupgradeneeded = () => { for(const name of ['records','drafts','settings']) if(!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name, {keyPath:'id'}); };
  req.onsuccess = () => {req.result.onversionchange=()=>req.result.close();resolve(req.result);};
  req.onblocked = () => reject(new Error('Cerrá otras pestañas de Muestreo para actualizar el almacenamiento.'));
  req.onerror = () => reject(req.error);
});
async function transaction(store, mode, run) {
  const db = await opening;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode); const request = run(tx.objectStore(store));
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('Guardado cancelado'));
  });
}
export const allRecords = () => transaction('records','readonly', s=>s.getAll());
export const getDraft = () => transaction('drafts','readonly', s=>s.get('active'));
export const putDraft = record => transaction('drafts','readwrite', s=>s.put({id:'active',record}));
export const clearDraft = () => transaction('drafts','readwrite', s=>s.delete('active'));
export const putRecord = record => transaction('records','readwrite', s=>s.put(record));
export const getSettings = () => transaction('settings','readonly',s=>s.get('sync'));
export const putSettings = settings => transaction('settings','readwrite',s=>s.put({...settings,id:'sync'}));
export async function acknowledgeRevision(id, revision, remote) {
 const db=await opening;
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('records','readwrite');const store=tx.objectStore('records');const read=store.get(id);let matched=false;
  read.onsuccess=()=>{const r=read.result;if(r?.revision===revision){store.put({...r,status:'synced',remote});matched=true;}};
  tx.oncomplete=()=>resolve(matched);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
 });
}

// Read and delete under the same lock, including drafts from other tabs.
export async function removeSyncedRecord(id, expectedRevision) {
 const db=await opening;
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(['records','drafts'],'readwrite');
  const store=tx.objectStore('records');
  const read=store.get(id),draftRead=tx.objectStore('drafts').get('active');
  let record,draft,ready=0,result={removed:false,reason:'missing'};
  const check=()=>{
   if(++ready!==2)return;
   if(!record)return;
   if(record.revision!==expectedRevision){result.reason='changed';return;}
   if(!canRemoveLocal(record)){result.reason='pending';return;}
   if(draft?.record?.id===id){result.reason='draft';return;}
   store.delete(id);result={removed:true};
  };
  read.onsuccess=()=>{record=read.result;check();};
  draftRead.onsuccess=()=>{draft=draftRead.result;check();};
  tx.oncomplete=()=>resolve(result);
  tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('No se pudo quitar la copia local.'));
 });
}
