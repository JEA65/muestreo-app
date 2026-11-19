const opening = new Promise((resolve, reject) => {
  const req = indexedDB.open('agua-campanas', 1);
  req.onupgradeneeded = () => { req.result.createObjectStore('records', {keyPath:'id'}); req.result.createObjectStore('drafts', {keyPath:'id'}); };
  req.onsuccess = () => resolve(req.result);
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
