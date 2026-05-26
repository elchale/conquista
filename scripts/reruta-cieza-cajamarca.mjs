// Re-ruteo del tramo Serrán -> Cajamarca de la marcha de Pizarro (1532) según
// la reconstrucción de Cieza de León (ascenso por el valle de Zaña), corrigiendo
// la secuencia costeña de Lambayeque (Xerez 1534) y añadiendo el reconocimiento
// de Hernando de Soto a Caxas.
import fs from "node:fs";
import path from "node:path";
const ROOT = process.cwd();
const LUGARES = path.join(ROOT, "content", "data", "lugares.json");
const eps = 0.0006, sleepMs = 250;
const OSRM = "https://router.project-osrm.org/route/v1/driving";

function perp(p,a,b){const[py,px]=p,[ay,ax]=a,[by,bx]=b;const dx=bx-ax,dy=by-ay;if(!dx&&!dy)return Math.hypot(px-ax,py-ay);const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));}
function dp(p,e){if(p.length<3)return p;let m=0,k=0;const f=p[0],l=p[p.length-1];for(let i=1;i<p.length-1;i++){const d=perp(p[i],f,l);if(d>m){m=d;k=i;}}return m>e?[...dp(p.slice(0,k+1),e).slice(0,-1),...dp(p.slice(k),e)]:[f,l];}
function despike(p,th=-0.3){if(p.length<3)return p;let r=p.slice(),c=true,it=0;while(c&&it<5){c=false;it++;const n=[r[0]];for(let i=1;i<r.length-1;i++){const a=r[i-1],q=r[i],b=r[i+1];const ax=q[1]-a[1],ay=q[0]-a[0],bx=b[1]-q[1],by=b[0]-q[0];const m1=Math.hypot(ax,ay),m2=Math.hypot(bx,by);if(!m1||!m2){c=true;continue;}if((ax*bx+ay*by)/(m1*m2)<th){c=true;continue;}n.push(q);}n.push(r[r.length-1]);r=n;}return r;}
async function osrm(a,b){const u=`${OSRM}/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;const r=await fetch(u,{headers:{"User-Agent":"ConquistaArchive/0.3"}});if(!r.ok)throw new Error("HTTP "+r.status);const j=await r.json();return j.routes?.[0]?.geometry?.coordinates.map(([x,y])=>[y,x])||null;}

const data = JSON.parse(fs.readFileSync(LUGARES,"utf8"));
const byId = new Map(data.lugares.map(l=>[l.id,l]));
const CIT_COSTA="xerez-1534", CIT_SIERRA="cieza-1553-parte1";

// 1) Quitar los lugares de la ruta antigua (Chancay/Chongoyape) que ya no aplican
for (const id of ["chongoyape","santa-cruz-cajamarca"]) {
  const i = data.lugares.findIndex(l=>l.id===id);
  if (i>=0){ data.lugares.splice(i,1); byId.delete(id); console.log("- lugar removido:", id); }
}

// 2) Actualizar notas de paradas costeñas existentes (curacas, tambo real)
const upd = {
  motupe: "Motux. La hueste descansó ~4 días y recibió bastimentos; el curaca estaba ausente, en Cajamarca con Atahualpa (con ~300 soldados). Parada de la marcha 1532 (Xerez).",
  jayanca: "Xayanca. El curaca CAXUSOL recibió a los españoles y los alojó en el TAMBO REAL; Xerez la describe como un espléndido pueblo. Parada de la marcha 1532.",
  tucume: "Cucume. Gran centro Sicán/Lambayeque (Valle de las Pirámides). El cacique EFQUEN PISAN los recibió 'entre temor y sorpresa'. Parada de la marcha 1532.",
  cinto: "Curacazgo de Cinto, en el área de la actual Chiclayo. Breve descanso antes de cruzar el río Lambayeque. Coordenada aproximada.",
};
for (const [id,n] of Object.entries(upd)) { const l=byId.get(id); if(l){ l.notas=n; if(id==="jayanca"||id==="tucume"){l.fuentes=[CIT_COSTA];} } }
// reubicar Cinto al área de Chiclayo para suavizar la línea
if (byId.get("cinto")) { byId.get("cinto").lat=-6.7701; byId.get("cinto").lng=-79.8409; }

const NOTA="Punto de la marcha de Pizarro a Cajamarca (sep–nov 1532).";
// 3) Nuevos lugares (coord OSM; aproximada donde el sitio histórico está perdido)
const NUEVOS = [
  // costa
  {id:"copis",nombre:"Copiz",lat:-5.83,lng:-79.73,etnia:"tallanes",prec:"aproximada",f:[CIT_COSTA],
   nota:"Pueblo despoblado al pasar (sus habitantes habían emigrado, por orden del curaca y por falta de agua). Al norte de Olmos; ubicación aproximada. "+NOTA},
  {id:"lambayeque-ciudad",nombre:"Lambayeque (Llampayec)",lat:-6.7030,lng:-79.9065,etnia:"lambayeque",prec:"exacta",f:[CIT_COSTA],
   nota:"El cacique XEFUIN PISAN salió a recibir a Pizarro; en señal de protesta los suyos le quemaron la casa. "+NOTA},
  {id:"puente-lambayeque",nombre:"Puente sobre el río Lambayeque (Faquisllanga)",lat:-6.82,lng:-79.81,etnia:"andino",prec:"aproximada",f:[CIT_COSTA],tipo:"puente",
   nota:"El río (Faquisllanga, hoy río Lambayeque) bajaba crecido; Pizarro mandó cortar árboles y construir un PUENTE en una noche para cruzarlo. Ubicación aproximada del vado, cerca de Reque. "+NOTA},
  {id:"reque",nombre:"Reque",lat:-6.8632,lng:-79.8017,etnia:"lambayeque",prec:"exacta",f:[CIT_COSTA],
   nota:"El curaca XANCOL CHUMBI proveyó comida y obsequios a la hueste. "+NOTA},
  {id:"collique",nombre:"Collique (Cullique)",lat:-6.88,lng:-79.70,etnia:"lambayeque",prec:"aproximada",f:[CIT_COSTA],
   nota:"Curacazgo de Collique; la columna siguió hacia el sur rumbo a Saña. Ubicación aproximada. "+NOTA},
  // sierra (ascenso por el Zaña, Cieza)
  {id:"oyotun",nombre:"Oyotún",lat:-6.7784,lng:-79.2504,etnia:"andino",prec:"exacta",f:[CIT_SIERRA],
   nota:"Desde Saña la hueste tomó el camino transversal inca hacia los Andes por el valle de Zaña. "+NOTA},
  {id:"nanchoc",nombre:"Nanchoc",lat:-6.9595,lng:-79.2427,etnia:"andino",prec:"exacta",f:[CIT_SIERRA],nota:"En el camino del ascenso por el Zaña (Cieza). "+NOTA},
  {id:"san-miguel-pallaques",nombre:"San Miguel de Pallaques",lat:-7.0003,lng:-78.8514,etnia:"andino",prec:"exacta",f:["cieza-1553-parte1","trujillo-1571"],
   nota:"Según Diego de Trujillo, la hueste ACAMPÓ AQUÍ ~20 DÍAS antes del tramo final a Cajamarca. "+NOTA},
  {id:"llapa",nombre:"Llapa",lat:-6.9808,lng:-78.8076,etnia:"andino",prec:"exacta",f:[CIT_SIERRA],nota:"En la ruta serrana a Cajamarca (Cieza). "+NOTA},
  {id:"cochan",nombre:"San Silvestre de Cochán",lat:-6.9777,lng:-78.7741,etnia:"andino",prec:"exacta",f:[CIT_SIERRA],nota:"En la ruta serrana a Cajamarca (Cieza). "+NOTA},
  {id:"tumbaden",nombre:"Tumbadén",lat:-7.0249,lng:-78.7397,etnia:"andino",prec:"exacta",f:[CIT_SIERRA],nota:"Última puna antes de descender al valle de Cajamarca. "+NOTA},
  // marcadores (no anclas de ruta): distritos sobre/junto al camino de Cieza
  {id:"tingues",nombre:"Tingues",lat:-6.9368,lng:-79.2685,etnia:"andino",prec:"aproximada",f:[CIT_SIERRA],nota:"Caserío sobre el camino del ascenso por el Zaña (Cieza)."},
  {id:"bolivar-sm",nombre:"Bolívar (San Miguel)",lat:-6.9769,lng:-79.1784,etnia:"andino",prec:"exacta",f:[CIT_SIERRA],nota:"Distrito de San Miguel sobre la ruta de Cieza al Cajamarca."},
  {id:"paucal",nombre:"Paucal",lat:-6.9914,lng:-79.1424,etnia:"andino",prec:"aproximada",f:[CIT_SIERRA],nota:"Ruinas de Paucal, junto al camino del ascenso (Cieza)."},
  {id:"niepos",nombre:"Niepos",lat:-6.9264,lng:-79.1297,etnia:"andino",prec:"exacta",f:[CIT_SIERRA],nota:"Distrito de San Miguel sobre la ruta de Cieza."},
  {id:"miravalles",nombre:"Miravalles",lat:-7.0054,lng:-79.1032,etnia:"andino",prec:"aproximada",f:[CIT_SIERRA],nota:"Caserío sobre la ruta del ascenso (Cieza)."},
  {id:"union-agua-blanca",nombre:"Unión Agua Blanca",lat:-7.1143,lng:-79.0459,etnia:"andino",prec:"exacta",f:[CIT_SIERRA],nota:"Distrito de San Miguel sobre la ruta de Cieza."},
  {id:"jangala",nombre:"Jangalá (Calquis)",lat:-6.9801,lng:-78.8500,etnia:"andino",prec:"aproximada",f:[CIT_SIERRA],nota:"Paraje del distrito de Calquis sobre la ruta serrana (Cieza)."},
  // Caxas (reconocimiento de Soto)
  {id:"caxas",nombre:"Caxas (guarnición inca)",lat:-5.35,lng:-79.47,etnia:"inca",prec:"aproximada",f:[CIT_COSTA],tipo:"tampu-frontera",
   nota:"Guarnición y centro inca en la sierra de Huancabamba. Hernando de Soto fue enviado desde Serrán/Zaran con ~40 jinetes a reconocerla (oct 1532); allí vio el camino inca y una guarnición, y un mensajero/espía de Atahualpa salió a su encuentro. Soto volvió con las primeras noticias firmes de Atahualpa y Cajamarca. Ubicación aproximada (sitio inca de Caxas)."},
];
for (const n of NUEVOS) {
  if (byId.has(n.id)) { console.log("  ya existe:", n.id); continue; }
  const l = {id:n.id,nombre:n.nombre,tipo:n.tipo||"parada-marcha-1532",lat:n.lat,lng:n.lng,precision:n.prec,etnia:n.etnia,notas:n.nota,fuentes:n.f||[]};
  data.lugares.push(l); byId.set(n.id,l); console.log("  + lugar:", n.id);
}

const coords = id => { const l=byId.get(id); if(!l) throw new Error("falta lugar "+id); return [l.lat,l.lng]; };

async function densify(seqIds, includeFirstAnchor, includeLastAnchor) {
  const out = [];
  if (includeFirstAnchor) out.push({lugar_id:seqIds[0]});
  for (let i=1;i<seqIds.length;i++){
    const a=coords(seqIds[i-1]), b=coords(seqIds[i]);
    try{ const g0=await osrm(a,b); if(g0&&g0.length>=3){ let g=despike(dp(g0,eps),-0.3); for(let j=1;j<g.length-1;j++) out.push({lat:+g[j][0].toFixed(5),lng:+g[j][1].toFixed(5),via:"osrm"}); } }
    catch(e){ console.log(`  OSRM ${seqIds[i-1]}->${seqIds[i]}: ${e.message}`); }
    const last = i===seqIds.length-1;
    if (!last || includeLastAnchor) out.push({lugar_id:seqIds[i]});
    process.stdout.write(`.`);
    await new Promise(r=>setTimeout(r,sleepMs));
  }
  return out;
}

// 4) Reconstruir la ruta principal: [..serran] + (nuevo serran->cajamarca) + [cajamarca..]
const ruta = data.rutas.find(r=>r.id==="pizarro-1532-1533");
const iSerran = ruta.puntos.findIndex(p=>p.lugar_id==="serran");
const iCaj = ruta.puntos.findIndex((p,i)=>i>iSerran && p.lugar_id==="cajamarca");
const SPINE = ["serran","copis","motupe","jayanca","tucume","lambayeque-ciudad","cinto","puente-lambayeque","reque","collique","sana","oyotun","nanchoc","san-miguel-pallaques","llapa","cochan","tumbaden","cajamarca"];
console.log(`\nSplice principal: serran@${iSerran} cajamarca@${iCaj}`);
const mid = await densify(SPINE, false, false); // anchors intermedios sí, serran y cajamarca no
ruta.puntos = [...ruta.puntos.slice(0,iSerran+1), ...mid, ...ruta.puntos.slice(iCaj)];
console.log(`\nruta principal puntos: ${ruta.puntos.length}`);

// 5) Ruta del reconocimiento de Soto: Serrán -> Caxas
console.log("\nRuta Soto -> Caxas:");
const sotoPuntos = await densify(["serran","caxas"], true, true);
const sotoRuta = {
  id:"soto-caxas-1532",
  nombre:"Reconocimiento de Hernando de Soto a Caxas (oct 1532)",
  color:"#3e6b5a",
  puntos: sotoPuntos,
};
if (!data.rutas.find(r=>r.id==="soto-caxas-1532")) data.rutas.push(sotoRuta);
console.log(`\nsoto puntos: ${sotoPuntos.length}`);

const bk = path.join(ROOT,"content","data",`lugares.backup-${Date.now()}.json`);
fs.writeFileSync(bk, fs.readFileSync(LUGARES));
fs.writeFileSync(LUGARES, JSON.stringify(data,null,2),"utf8");
console.log("Backup:", path.basename(bk), "\nListo.");
