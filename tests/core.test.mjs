import test from 'node:test';
import assert from 'node:assert/strict';
import {newRecord,validate,parseNumber,finalize,escapeHTML,completedEnvironment} from '../core.js';
function sample(){const r=newRecord();Object.assign(r.fields,{cuenca:'Prueba',codigo:'P-01',observadores:'Equipo de prueba'});return r;}
test('dos puntos tienen identificadores y mediciones independientes',()=>{const a=sample();const b=newRecord(a.fields);a.measurements.ph.value='7,2';assert.notEqual(a.id,b.id);assert.equal(b.measurements.ph.value,'');assert.equal(b.fields.codigo,undefined);assert.equal(b.fields.cuenca,'Prueba');});
test('admite coma decimal y distingue vacío de cero',()=>{assert.equal(parseNumber('7,25'),7.25);assert.equal(parseNumber(''),null);assert.equal(parseNumber('0'),0);assert.ok(Number.isNaN(parseNumber('error')));});
test('cero medido válido y pH fuera de rango rechazado',()=>{const r=sample();r.measurements.ph.status='medido';r.measurements.ph.value='0';assert.deepEqual(validate(r),[]);r.measurements.ph.value='14,1';assert.match(validate(r).join(),/pH/);});
test('un estado medido exige un valor, sin medir no se convierte en cero',()=>{const r=sample();r.measurements.oxigeno.status='medido';assert.match(validate(r).join(),/Oxígeno/);r.measurements.oxigeno.status='no_medido';assert.deepEqual(validate(r),[]);assert.equal(r.measurements.oxigeno.value,'');});
test('coordenadas necesitan par y respetan límites',()=>{const r=sample();r.fields.latitud='-34,9';assert.match(validate(r).join(),/ambas/);r.fields.longitud='-58';assert.deepEqual(validate(r),[]);r.fields.longitud='181';assert.match(validate(r).join(),/Longitud/);});
test('editar incrementa revisión y mantiene identidad y fotos',()=>{const r=sample();r.photos=[{id:'foto-1',data:'data:image/jpeg;base64,prueba'}];const saved=finalize(r);const edited=finalize(saved);assert.equal(saved.id,edited.id);assert.equal(edited.revision,2);assert.equal(edited.photos[0].id,'foto-1');assert.equal(edited.status,'local');assert.equal(r.revision,0);});
test('contenido escrito no se interpreta como HTML en la ficha',()=>{assert.equal(escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;');});
test('la ficha omite campos y secciones ambientales vacíos',()=>{assert.deepEqual(completedEnvironment({cielo:'',viento:'   ',usos:[],residuos_tipo:[' ']}),[]);});
test('la ficha conserva respuestas negativas y valores cero',()=>{const result=completedEnvironment({crecida:'No',anomalia_0:'No observado',temperatura_ambiente:0,usos:['Pesca'],cielo:''});const keys=result.flatMap(s=>s.fields.map(f=>f[0]));assert.deepEqual(keys,['crecida','anomalia_0','usos']);});


test('identificación nueva exige cuenca y conserva un único sitio',()=>{const r=sample();assert.equal(r.schemaVersion,2);delete r.fields.cuenca;r.fields.campana='Campaña anterior';assert.match(validate(r).join(),/Cuenca/);r.fields.cuenca='Salado';assert.deepEqual(validate(r),[]);});
test('caracterización omite variables retiradas sin borrar valores guardados',()=>{const fields={cielo:'Nublado',nivel:'Alto',flujo:'Bajo',forma:['Natural'],cobertura:'0 %',ciano_aspecto:['Verdosa'],ciano_cobertura:'0 %',aspecto_flujo:'Remansado',crecida:'No'};const keys=completedEnvironment(fields).flatMap(s=>s.fields.map(f=>f[0]));assert.deepEqual(keys,['aspecto_flujo','crecida']);assert.equal(fields.nivel,'Alto');});
