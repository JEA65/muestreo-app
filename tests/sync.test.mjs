import test from 'node:test';import assert from 'node:assert/strict';import {newRecord,finalize} from '../core.js';import {validEndpoint,isPending,receiptValid,sendRecord,canRemoveLocal} from '../sync.js';
const config={endpoint:'https://script.google.com/macros/s/test/exec',deviceId:'equipo-01',token:'test-only-not-a-real-secret-123456789'};
function record(){return finalize(newRecord());}
function receipt(r){return {ok:true,id:r.id,revision:r.revision,pdfUrl:'https://drive.google.com/file/d/test/view',sheetUrl:'https://docs.google.com/spreadsheets/d/test/edit',photoUrls:r.photos.map(()=> 'https://drive.google.com/file/d/photo/view')};}
test('solo permite destinos HTTPS de Apps Script sin claves en la URL',()=>{assert.equal(validEndpoint(config.endpoint),true);for(const url of ['http://script.google.com/macros/s/a/exec','https://evil.test/macros/s/a/exec',config.endpoint+'?token=x',config.endpoint+'#token'])assert.equal(validEndpoint(url),false);});
test('una confirmación incompleta nunca marca sincronizado',()=>{const r=record();r.photos=[{data:'x'},{data:'y'}];const ack=receipt(r);assert.equal(receiptValid(r,ack),true);assert.equal(receiptValid(r,{...ack,photoUrls:[]}),false);assert.equal(receiptValid(r,{...ack,revision:2}),false);assert.equal(receiptValid(r,{...ack,pdfUrl:'javascript:alert(1)'}),false);assert.equal(receiptValid(r,{...ack,id:'otro'}),false);});
test('una edición posterior vuelve a quedar pendiente',()=>{const r=record();r.status='synced';r.remote=receipt(r);assert.equal(isPending(r),false);assert.equal(isPending(finalize(r)),true);});
test('el envío excluye estado local y metadatos remotos',async()=>{const r=record();r.remote={private:'not sent'};let payload;const fetcher=async(url,opts)=>{payload=JSON.parse(opts.body);assert.equal(url,config.endpoint);assert.equal(opts.credentials,'omit');return {ok:true,json:async()=>receipt(r)};};await sendRecord(r,config,fetcher);assert.equal(payload.record.remote,undefined);assert.equal(payload.record.status,undefined);assert.equal(payload.deviceId,'equipo-01');});
test('respuesta de error o HTML no se acepta como éxito',async()=>{const r=record();await assert.rejects(sendRecord(r,config,async()=>({ok:true,json:async()=>({ok:false,code:'AUTH'})})),/autorizado/);await assert.rejects(sendRecord(r,config,async()=>({ok:true,json:async()=>{throw new Error('html');}})),/confirmación válida/);});


test('quitar del dispositivo exige confirmación completa de la revisión actual',()=>{
 const r=record();r.photos=[{id:'foto-1',data:'test'},{id:'foto-2',data:'test'}];r.status='synced';r.remote=receipt(r);
 assert.equal(canRemoveLocal(r),true);
 for(const status of ['local','draft'])assert.equal(canRemoveLocal({...r,status}),false);
 assert.equal(canRemoveLocal(finalize(r)),false);
 assert.equal(canRemoveLocal({...r,revision:r.revision+1}),false);
});
test('quitar del dispositivo protege registros sin PDF, Sheets o todas sus fotos',()=>{
 const r=record();r.photos=[{id:'foto-1',data:'test'}];r.status='synced';r.remote=receipt(r);
 for(const patch of [{ok:false},{id:'otro'},{revision:0},{pdfUrl:''},{pdfUrl:'https://example.org/file/d/no'},{sheetUrl:''},{photoUrls:[]},{photoUrls:['https://example.org/photo']},{photoUrls:null}]){
  assert.equal(canRemoveLocal({...r,remote:{...r.remote,...patch}}),false,JSON.stringify(patch));
 }
 assert.equal(canRemoveLocal({...r,remote:undefined}),false);
});
test('un registro sin fotos puede quitarse si PDF y Sheets están confirmados',()=>{
 const r=record();r.status='synced';r.remote=receipt(r);
 assert.equal(canRemoveLocal(r),true);
});
