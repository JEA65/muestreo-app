import 'fake-indexeddb/auto';
import {test,beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {allRecords,putRecord,putDraft,clearDraft,getDraft,getSettings,putSettings,acknowledgeRevision,removeSyncedRecord} from '../db.js';
import {newRecord,finalize} from '../core.js';

// This file runs in its own Node test process; fake-indexeddb never touches a browser.
const fixture=(suffix,status='synced')=>{
 const r=finalize(newRecord());
 Object.assign(r.fields,{cuenca:'QA LOCAL',codigo:'QA-QUITAR-'+suffix,observadores:'Prueba local ficticia'});
 r.photos=[{id:crypto.randomUUID(),data:'data:image/png;base64,PRUEBA',caption:'Imagen ficticia'}];
 r.status=status;
 r.remote={ok:true,id:r.id,revision:r.revision,pdfUrl:'https://drive.google.com/file/d/qa-ficticio/view',sheetUrl:'https://docs.google.com/spreadsheets/d/qa-ficticio/edit',photoUrls:['https://drive.google.com/file/d/qa-foto-ficticia/view']};
 return r;
};
const read=async id=>(await allRecords()).find(r=>r.id===id);
async function expectRetained(r,expectedRevision,reason){
 const before=await read(r.id);
 assert.deepEqual(await removeSyncedRecord(r.id,expectedRevision),{removed:false,reason});
 assert.deepEqual(await read(r.id),before,'Los datos y fotos deben conservarse íntegros');
}
beforeEach(async()=>{await clearDraft();});
afterEach(async()=>{await clearDraft();});

test('borrado local rechaza registros pendientes aunque tengan recibo anterior',async()=>{
 const r=fixture('PENDIENTE','local');await putRecord(r);
 await expectRetained(r,r.revision,'pending');
});
test('borrado local revalida la revisión almacenada y rechaza una pantalla desactualizada',async()=>{
 const r=fixture('REVISION-NUEVA');const seenRevision=r.revision;r.revision++;r.remote.revision=r.revision;await putRecord(r);
 await expectRetained(r,seenRevision,'changed');
});
test('borrado local exige confirmación de todas las fotos',async()=>{
 const r=fixture('FOTO-SIN-CONFIRMAR');r.remote.photoUrls=[];await putRecord(r);
 await expectRetained(r,r.revision,'pending');
});
test('borrado local protege el borrador del mismo registro y sus cambios no enviados',async()=>{
 const r=fixture('BORRADOR');await putRecord(r);
 const draft=structuredClone(r);draft.status='draft';draft.fields.observaciones='Edición aún no enviada';await putDraft(draft);
 await expectRetained(r,r.revision,'draft');
 assert.deepEqual((await getDraft()).record,draft);
});
test('borrado local elimina únicamente el objetivo y conserva otros registros, fotos, borrador y configuración',async()=>{
 const r=fixture('QUITAR-SOLO-ESTE'),other=fixture('CONSERVAR','local'),draft=fixture('BORRADOR-AJENO','draft');
 await putRecord(r);await putRecord(other);await putDraft(draft);
 await putSettings({deviceId:'qa-removal-test-only',note:'Configuración ficticia sin endpoint ni clave'});
 const settings=await getSettings();const others=(await allRecords()).filter(item=>item.id!==r.id);
 assert.deepEqual(await removeSyncedRecord(r.id,r.revision),{removed:true});
 assert.equal(await read(r.id),undefined);
 assert.deepEqual(await allRecords(),others);
 assert.deepEqual((await read(other.id)).photos,other.photos);
 assert.deepEqual((await getDraft()).record,draft);
 assert.deepEqual(await getSettings(),settings);
});
test('una confirmación tardía de sincronización no recrea una copia local eliminada',async()=>{
 const r=fixture('CONFIRMACION-TARDIA');await putRecord(r);
 assert.deepEqual(await removeSyncedRecord(r.id,r.revision),{removed:true});
 assert.equal(await acknowledgeRevision(r.id,r.revision,r.remote),false);
 assert.equal(await read(r.id),undefined);
});
test('quitar un registro inexistente no afecta otros datos',async()=>{
 const before=await allRecords();
 assert.deepEqual(await removeSyncedRecord(crypto.randomUUID(),1),{removed:false,reason:'missing'});
 assert.deepEqual(await allRecords(),before);
});
test('quitar la copia local no hace solicitudes a Drive, Sheets ni otro servidor',async t=>{
 const r=fixture('SIN-RED');await putRecord(r);
 const fetchSpy=t.mock.method(globalThis,'fetch',()=>{throw new Error('No debe utilizar la red');});
 assert.deepEqual(await removeSyncedRecord(r.id,r.revision),{removed:true});
 assert.equal(fetchSpy.mock.callCount(),0);
 assert.equal(await read(r.id),undefined);
});
test('una edición concurrente guardada primero impide borrar desde la revisión anterior',async()=>{
 const r=fixture('CARRERA-REVISION');await putRecord(r);
 const updated=structuredClone(r);updated.revision++;updated.remote.revision=updated.revision;updated.fields.observaciones='Edición desde otra pestaña';
 const writing=putRecord(updated);
 const removing=removeSyncedRecord(r.id,r.revision);
 const [,result]=await Promise.all([writing,removing]);
 assert.deepEqual(result,{removed:false,reason:'changed'});
 assert.deepEqual(await read(r.id),updated);
});
test('un borrador concurrente guardado primero bloquea el borrado del registro',async()=>{
 const r=fixture('CARRERA-BORRADOR');await putRecord(r);
 const draft=structuredClone(r);draft.status='draft';draft.fields.observaciones='Edición de otra pestaña sin enviar';
 const writing=putDraft(draft);
 const removing=removeSyncedRecord(r.id,r.revision);
 const [,result]=await Promise.all([writing,removing]);
 assert.deepEqual(result,{removed:false,reason:'draft'});
 assert.deepEqual(await read(r.id),r);
 assert.deepEqual((await getDraft()).record,draft);
});
