export const metrics = [
  {key:'ph',label:'pH',units:['unidades de pH'],min:0,max:14},
  {key:'conductividad',label:'Conductividad',units:['µS/cm','mS/cm'],min:0},
  {key:'sdt',label:'Sólidos disueltos totales (SDT)',units:['mg/L','g/L'],min:0},
  {key:'turbiedad',label:'Turbiedad instrumental',units:['NTU','FNU'],min:0},
  {key:'oxigeno',label:'Oxígeno disuelto',units:['mg/L','% de saturación'],min:0}
];
export const sections = [
  {
    "title": "Cuerpo de agua",
    "fields": [
      [
        "origen",
        "Origen del cauce",
        [
          "Natural",
          "Natural modificado",
          "Artificial",
          "No determinable"
        ]
      ],
      [
        "aspecto_flujo",
        "Aspecto del flujo",
        [
          "Remansado",
          "Corriente uniforme",
          "Turbulento"
        ]
      ],
      [
        "crecida",
        "Evidencia de crecida reciente",
        [
          "Sí",
          "No"
        ]
      ]
    ]
  },
  {
    "title": "Márgenes y cauce",
    "fields": [
      [
        "lecho",
        "Lecho",
        [
          "Natural",
          "Arena",
          "Roca",
          "Sedimento fino",
          "Grava",
          "Hormigón",
          "Otro"
        ],
        "multi"
      ],
      [
        "margen_izquierda",
        "Margen izquierda",
        [
          "Natural",
          "Vegetada",
          "Murallón",
          "Hormigón",
          "Gaviones",
          "Talud artificial",
          "Defensas contra erosión"
        ],
        "multi"
      ],
      [
        "erosion_izquierda",
        "Erosión · margen izquierda",
        [
          "Ausente",
          "Leve",
          "Moderada",
          "Intensa"
        ]
      ],
      [
        "margen_derecha",
        "Margen derecha",
        [
          "Natural",
          "Vegetada",
          "Murallón",
          "Hormigón",
          "Gaviones",
          "Talud artificial",
          "Defensas contra erosión"
        ],
        "multi"
      ],
      [
        "erosion_derecha",
        "Erosión · margen derecha",
        [
          "Ausente",
          "Leve",
          "Moderada",
          "Intensa"
        ]
      ]
    ]
  },
  {
    "title": "Estado visual del agua",
    "fields": [
      [
        "color",
        "Color aparente",
        [
          "Transparente",
          "Amarillento",
          "Amarronado",
          "Verdoso",
          "Grisáceo",
          "Negruzco",
          "Otro"
        ]
      ],
      [
        "turbidez_visual",
        "Turbidez visual (observación)",
        [
          "Baja",
          "Moderada",
          "Alta",
          "Muy alta"
        ]
      ],
      [
        "olor",
        "Olor",
        [
          "Sin olor perceptible",
          "Materia orgánica",
          "Aguas residuales",
          "Químico",
          "Sulfuroso",
          "Otro"
        ]
      ],
      [
        "anomalia_0",
        "Espuma",
        [
          "No observado",
          "Observado"
        ]
      ],
      [
        "anomalia_1",
        "Burbujeo",
        [
          "No observado",
          "Observado"
        ]
      ],
      [
        "anomalia_2",
        "Película superficial",
        [
          "No observado",
          "Observado"
        ]
      ],
      [
        "anomalia_3",
        "Iridiscencia / aceites",
        [
          "No observado",
          "Observado"
        ]
      ],
      [
        "anomalia_4",
        "Material flotante",
        [
          "No observado",
          "Observado"
        ]
      ],
      [
        "anomalia_5",
        "Restos vegetales acumulados",
        [
          "No observado",
          "Observado"
        ]
      ],
      [
        "anomalia_6",
        "Floración / acumulación biológica",
        [
          "No observado",
          "Observado"
        ]
      ],
      [
        "anomalia_7",
        "Otra anomalía",
        [
          "No observado",
          "Observado"
        ]
      ],
      [
        "anomalias_detalle",
        "Descripción de anomalías",
        "text"
      ]
    ]
  },
  {
    "title": "Residuos",
    "fields": [
      [
        "residuos_0",
        "Residuos en agua",
        [
          "Ausentes",
          "Escasos",
          "Moderados",
          "Abundantes"
        ]
      ],
      [
        "residuos_1",
        "Residuos en margen izquierda",
        [
          "Ausentes",
          "Escasos",
          "Moderados",
          "Abundantes"
        ]
      ],
      [
        "residuos_2",
        "Residuos en margen derecha",
        [
          "Ausentes",
          "Escasos",
          "Moderados",
          "Abundantes"
        ]
      ],
      [
        "residuos_tipo",
        "Tipo de residuos",
        [
          "Plásticos",
          "Vidrio",
          "Metal",
          "Papel / cartón",
          "Orgánicos",
          "Neumáticos",
          "Escombros",
          "Otros"
        ],
        "multi"
      ],
      [
        "residuos_evidencia",
        "Evidencias adicionales",
        [
          "Microbasural",
          "Quema de residuos",
          "Disposición reciente",
          "Residuos voluminosos"
        ],
        "multi"
      ]
    ]
  },
  {
    "title": "Vegetación",
    "fields": [
      [
        "ribera",
        "Vegetación de ribera",
        [
          "Ausente",
          "Escasa",
          "Moderada",
          "Abundante"
        ]
      ],
      [
        "ribera_tipo",
        "Predominio en ribera",
        [
          "Herbácea",
          "Arbustiva",
          "Arbórea",
          "Cultivada"
        ],
        "multi"
      ],
      [
        "vegetacion_agua",
        "Vegetación dentro del curso",
        [
          "Flotante",
          "Enraizada",
          "Palustre",
          "Emergente",
          "Otra"
        ],
        "multi"
      ]
    ]
  },
  {
    "title": "Indicadores biológicos y fauna",
    "fields": [
      [
        "evento_0",
        "Cianobacterias / floración compatible",
        [
          "No observado",
          "Puntual",
          "Moderado",
          "Extenso"
        ]
      ],
      [
        "evento_1",
        "Floración algal aparente",
        [
          "No observado",
          "Puntual",
          "Moderado",
          "Extenso"
        ]
      ],
      [
        "evento_2",
        "Acumulación de macrófitas",
        [
          "No observado",
          "Puntual",
          "Moderado",
          "Extenso"
        ]
      ],
      [
        "evento_3",
        "Espuma biológica aparente",
        [
          "No observado",
          "Puntual",
          "Moderado",
          "Extenso"
        ]
      ],
      [
        "evento_4",
        "Mortandad de peces",
        [
          "No observado",
          "Puntual",
          "Moderado",
          "Extenso"
        ]
      ],
      [
        "evento_5",
        "Mortandad de otros organismos",
        [
          "No observado",
          "Puntual",
          "Moderado",
          "Extenso"
        ]
      ],
      [
        "evento_6",
        "Concentración inusual de fauna",
        [
          "No observado",
          "Puntual",
          "Moderado",
          "Extenso"
        ]
      ],
      [
        "evento_7",
        "Otros eventos",
        [
          "No observado",
          "Puntual",
          "Moderado",
          "Extenso"
        ]
      ],
      [
        "fauna_0",
        "Peces",
        [
          "No observada",
          "Escasa",
          "Abundante"
        ]
      ],
      [
        "fauna_1",
        "Anfibios",
        [
          "No observada",
          "Escasa",
          "Abundante"
        ]
      ],
      [
        "fauna_2",
        "Reptiles",
        [
          "No observada",
          "Escasa",
          "Abundante"
        ]
      ],
      [
        "fauna_3",
        "Aves acuáticas",
        [
          "No observada",
          "Escasa",
          "Abundante"
        ]
      ],
      [
        "fauna_4",
        "Crustáceos",
        [
          "No observada",
          "Escasa",
          "Abundante"
        ]
      ],
      [
        "fauna_5",
        "Otros",
        [
          "No observada",
          "Escasa",
          "Abundante"
        ]
      ],
      [
        "mortandad",
        "Mortandad de fauna",
        [
          "No",
          "Sí"
        ]
      ],
      [
        "biologia_detalle",
        "Descripción de eventos y fauna",
        "text"
      ]
    ]
  },
  {
    "title": "Usos e intervención humana",
    "fields": [
      [
        "usos",
        "Presencia en las inmediaciones",
        [
          "Viviendas",
          "Ganadería",
          "Extracción de agua",
          "Canal",
          "Área urbana",
          "Recreación",
          "Puente",
          "Drenaje pluvial",
          "Industria",
          "Pesca",
          "Camino",
          "Descarga visible",
          "Agricultura",
          "Navegación",
          "Obra hidráulica",
          "Otro"
        ],
        "multi"
      ],
      [
        "descarga",
        "Descargas",
        [
          "No observadas",
          "Puntual",
          "Difusa",
          "Evidencia sin origen identificado"
        ]
      ],
      [
        "descarga_ubicacion",
        "Ubicación de la descarga",
        [
          "Aguas arriba",
          "En el sitio",
          "Aguas abajo"
        ]
      ],
      [
        "otros_detalles",
        "Detalle de opciones «Otro» y contexto adicional",
        "text"
      ]
    ]
  }
];
export function parseNumber(value) { if (String(value??'').trim()==='') return null; const n=Number(String(value).replace(',','.')); return Number.isFinite(n)?n:NaN; }
export function validate(record) {
 const errors=[]; for(const [key,label] of [['cuenca','Cuenca'],['codigo','Sitio de muestreo'],['fecha','Fecha'],['hora','Hora'],['observadores','Observadores']]) if(!record.fields[key]?.trim()) errors.push(`Completá ${label}.`);
 for(const [key,min,max,label] of [['latitud',-90,90,'Latitud'],['longitud',-180,180,'Longitud']]) {const n=parseNumber(record.fields[key]); if(n!==null && (!Number.isFinite(n)||n<min||n>max))errors.push(`${label}: valor inválido.`);}
 if(Boolean(record.fields.latitud)!==Boolean(record.fields.longitud)) errors.push('Completá ambas coordenadas o dejá ambas vacías.');
 for(const metric of metrics) {const m=record.measurements[metric.key];const n=parseNumber(m.value);if(m.status==='medido'&&(n===null||!Number.isFinite(n)||n<metric.min||(metric.max!==undefined&&n>metric.max)))errors.push(`Revisá el valor de ${metric.label}.`);if(!metric.units.includes(m.unit))errors.push(`Revisá la unidad de ${metric.label}.`);}
 return errors;
}
export function newRecord(previous={}) {const d=new Date();const local=new Date(d-d.getTimezoneOffset()*60000).toISOString();return {schemaVersion:2,id:crypto.randomUUID(),revision:0,createdAt:d.toISOString(),updatedAt:d.toISOString(),status:'draft',fields:{cuenca:previous.cuenca||'',observadores:previous.observadores||'',equipo:previous.equipo||'',fecha:local.slice(0,10),hora:local.slice(11,16)},measurements:Object.fromEntries(metrics.map(m=>[m.key,{value:'',unit:m.units[0],status:'pendiente'}])),photos:[]};}
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function completedEnvironment(fields) {
 const filled = value => Array.isArray(value) ? value.some(filled) : value !== undefined && value !== null && String(value).trim() !== '';
 return sections.map(section => ({...section, fields: section.fields.filter(([key]) => filled(fields[key]))})).filter(section => section.fields.length > 0);
}
export function finalize(record) {return {...record,schemaVersion:2,revision:record.revision+1,status:'local',updatedAt:new Date().toISOString()};}
