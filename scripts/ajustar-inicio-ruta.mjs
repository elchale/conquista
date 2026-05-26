// Ajuste fino del inicio de la marcha de Pizarro:
// 1) Corrige la coordenada de Tangarará (estaba ~12 km al NE, fuera del Chira).
// 2) Añade Poechos (curacazgo tallán de Maizavilca, sobre el Chira).
// 3) Re-densifica el tramo Tumbes -> Poechos -> Tangarará -> Tambo Grande.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LUGARES = path.join(ROOT, "content", "data", "lugares.json");
const epsilon = 0.0006, sleepMs = 250;
const OSRM = "https://router.project-osrm.org/route/v1/driving";

function perpDistance(p,a,b){const[py,px]=p,[ay,ax]=a,[by,bx]=b;const dx=bx-ax,dy=by-ay;if(dx===0&&dy===0)return Math.hypot(px-ax,py-ay);const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));}
function dp(points,eps){if(points.length<3)return points;let maxD=0,idx=0;const f=points[0],l=points[points.length-1];for(let i=1;i<points.length-1;i++){const d=perpDistance(points[i],f,l);if(d>maxD){maxD=d;idx=i;}}if(maxD>eps){return[...dp(points.slice(0,idx+1),eps).slice(0,-1),...dp(points.slice(idx),eps)];}return[f,l];}
function despike(points,th=-0.3){if(points.length<3)return points;let r=points.slice(),ch=true,it=0;while(ch&&it<5){ch=false;it++;const n=[r[0]];for(let i=1;i<r.length-1;i++){const a=r[i-1],p=r[i],b=r[i+1];const v1x=p[1]-a[1],v1y=p[0]-a[0],v2x=b[1]-p[1],v2y=b[0]-p[0];const m1=Math.hypot(v1x,v1y),m2=Math.hypot(v2x,v2y);if(m1===0||m2===0){ch=true;continue;}const c=(v1x*v2x+v1y*v2y)/(m1*m2);if(c<th){ch=true;continue;}n.push(p);}n.push(r[r.length-1]);r=n;}return r;}
async function osrm(a,b){const u=`${OSRM}/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;const r=await fetch(u,{headers:{"User-Agent":"ConquistaArchive/0.3"}});if(!r.ok)throw new Error("HTTP "+r.status);const j=await r.json();return j.routes?.[0]?.geometry?.coordinates.map(([lng,lat])=>[lat,lng])||null;}

const data = JSON.parse(fs.readFileSync(LUGARES,"utf8"));
const byId = new Map(data.lugares.map(l=>[l.id,l]));

// 1) Corregir Tangarará
const tg = byId.get("tangarara");
console.log(`Tangarará: ${tg.lat},${tg.lng} -> -4.8855,-80.8249`);
tg.lat = -4.8855; tg.lng = -80.8249; tg.precision = "exacta";
tg.notas = "Sitio fundacional de San Miguel (15 ago 1532), primera ciudad española del Perú, en la ribera del río Chira, distrito Marcavelica (Sullana), a ~15 km al oeste de Sullana. Asiento tallán con residencia de curacas del valle del Chira. La ciudad se trasladó después al sitio de la actual Piura (1534). NO confundir con la moderna Piura (-5.19, -80.63), 40 km al sur.";

// 2) Añadir Poechos
if (!byId.has("poechos")) {
  const poechos = {
    id: "poechos", nombre: "Poechos (curacazgo tallán)", tipo: "centro-etnico",
    lat: -4.6828, lng: -80.5268, precision: "aproximada", etnia: "tallanes",
    notas: "Gran curacazgo tallán sobre el río Chira; sede de una capital provincial inca. Su curaca Maizavilca recibió a Pizarro al bajar de Tumbes (1532). Xerez (1534) la describió como 'una grande y hermosa ciudad'. El sitio histórico está en el área hoy inundada por el embalse de Poechos (distrito Querecotillo/Lancones); coordenada aproximada.",
    fuentes: ["xerez-1534"],
  };
  data.lugares.push(poechos); byId.set("poechos", poechos);
  console.log("+ lugar: poechos (-4.6828, -80.5268)");
}

const coords = id => { const l=byId.get(id); return [l.lat,l.lng]; };
const ruta = data.rutas.find(r=>r.id==="pizarro-1532-1533");
const iTumbes = ruta.puntos.findIndex(p=>p.lugar_id==="tumbes");
const iTambo  = ruta.puntos.findIndex(p=>p.lugar_id==="tambo-grande");
console.log(`Splice: tumbes@${iTumbes} tambo-grande@${iTambo}`);

// 3) Re-densificar Tumbes -> Poechos -> Tangarará -> Tambo Grande
const seq = ["tumbes","poechos","tangarara","tambo-grande"];
const middle = [];
for (let i=1;i<seq.length;i++){
  const a=coords(seq[i-1]), b=coords(seq[i]);
  let n=0;
  try{ const g0=await osrm(a,b); if(g0&&g0.length>=3){ let g=despike(dp(g0,epsilon),-0.3); for(let j=1;j<g.length-1;j++){middle.push({lat:+g[j][0].toFixed(5),lng:+g[j][1].toFixed(5),via:"osrm"});n++;} } }
  catch(e){ console.log(`  OSRM ${seq[i-1]}->${seq[i]}: ${e.message}`); }
  if (seq[i]!=="tambo-grande") middle.push({lugar_id:seq[i]});
  console.log(`  ${seq[i-1]} -> ${seq[i]} (+${n})`);
  await new Promise(r=>setTimeout(r,sleepMs));
}

const nuevo = [...ruta.puntos.slice(0,iTumbes+1), ...middle, ...ruta.puntos.slice(iTambo)];
console.log(`puntos: ${ruta.puntos.length} -> ${nuevo.length}`);
ruta.puntos = nuevo;

const bk = path.join(ROOT,"content","data",`lugares.backup-${Date.now()}.json`);
fs.writeFileSync(bk, fs.readFileSync(LUGARES));
fs.writeFileSync(LUGARES, JSON.stringify(data,null,2),"utf8");
console.log("Backup:", path.basename(bk), "\nListo.");
