// Añade eventos sourced al timeline.json. Idempotente: salta por id duplicado.
// Cada evento incluye fuentes citables (Xerez, Pedro Pizarro, Rostworowski 2003,
// Hemming 1970, etc.). NO INVENTA: cuando una fecha o detalle es controvertido,
// va con ~ o se nota en el resumen.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "content", "data", "timeline.json");

const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

// Add new acts if missing
const newActos = [
  {
    id: "acto-o",
    nombre: "Antes de la conquista — orígenes (1470s-1531)",
    rango: "~1470-1531",
    descripcion: "Generación de Huayna Cápac. Vidas tempranas de los protagonistas, primeros viajes de Pizarro, guerra civil inca."
  },
  {
    id: "acto-viii",
    nombre: "Después — vidas posteriores (1545+)",
    rango: "1545-1620",
    descripcion: "Vidas posteriores de los sobrevivientes (Inés, Angelina, Hernando Pizarro, Francisca, Beatriz)."
  }
];
for (const a of newActos) {
  if (!data.actos.find((x) => x.id === a.id)) data.actos.push(a);
}

const NEW_EVENTS = [
  // ============================================================
  // GROUP: Quispe Sisa / Inés Huaylas Yupanqui
  // ============================================================
  {
    id: "ines-nace",
    acto: "acto-o",
    fecha: "~1518",
    lugar: "cuzco",
    titulo: "Nace Quispe Sisa (después Inés Huaylas)",
    participantes: ["ines-huaylas-yupanqui", "huayna-capac", "contarguacho"],
    resumen: "Nace en Cuzco hija del Sapa Inca Huayna Cápac y de Contarguacho, señora del valle de Huaylas. Nombre quechua: Quispe Sisa ('flor de cristal'). Es princesa de la sangre real cuzqueña por línea paterna.",
    fuentes: ["pedro-pizarro-1571", "rostworowski-francisca-pizarro"],
    tags: ["nacimiento", "mujer", "linaje-real"]
  },
  {
    id: "ines-cajamarca-cautiva",
    acto: "acto-i",
    fecha: "1532-11",
    lugar: "cajamarca",
    titulo: "Quispe Sisa en el séquito de Atahualpa en Cajamarca",
    participantes: ["ines-huaylas-yupanqui", "atahualpa"],
    resumen: "Quispe Sisa, con ~14 años, está en el séquito de Atahualpa en Cajamarca cuando llega Pizarro. Su presencia se documenta por Pedro Pizarro, que la conoció directamente como paje de su pariente.",
    fuentes: ["pedro-pizarro-1571"],
    tags: ["mujer", "atahualpa"]
  },
  {
    id: "ines-entregada-pizarro",
    acto: "acto-i",
    fecha: "~1532-12",
    lugar: "cajamarca",
    titulo: "Atahualpa entrega a Quispe Sisa a Pizarro",
    participantes: ["ines-huaylas-yupanqui", "atahualpa", "francisco-pizarro"],
    resumen: "Durante el cautiverio, Atahualpa entrega a Quispe Sisa a Pizarro como gesto político de paz/alianza. Esta práctica era la costumbre andina: ofrecer mujeres de la sangre real para sellar pactos.",
    fuentes: ["pedro-pizarro-1571", "rostworowski-francisca-pizarro"],
    tags: ["mujer", "diplomacia", "concubinato"]
  },
  {
    id: "ines-bautizada",
    acto: "acto-i",
    fecha: "~1533",
    lugar: "cajamarca",
    titulo: "Quispe Sisa bautizada como Inés",
    participantes: ["ines-huaylas-yupanqui", "fray-vicente-de-valverde"],
    resumen: "Bautizada por Valverde con el nombre Inés. El nombre completo 'Inés Huaylas Yupanqui' combina su patronímico (Yupanqui, dinastía real) con su origen materno (Huaylas).",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["mujer", "bautismo"]
  },
  {
    id: "ines-marcha-sur",
    acto: "acto-iii",
    fecha: "1533-08",
    lugar: "huamachuco",
    titulo: "Inés acompaña a Pizarro de Cajamarca a Cuzco",
    participantes: ["ines-huaylas-yupanqui", "francisco-pizarro"],
    resumen: "Forma parte del séquito femenino de Pizarro en la marcha al sur. Lleva el embarazo de Francisca durante el cruce del Capac Ñan central.",
    fuentes: ["pedro-pizarro-1571"],
    tags: ["mujer", "viaje"]
  },
  {
    id: "nace-francisca-pizarro",
    acto: "acto-iii",
    fecha: "~1534-12-28",
    lugar: "xauxa",
    titulo: "Nace Francisca Pizarro Yupanqui",
    participantes: ["ines-huaylas-yupanqui", "francisco-pizarro", "francisca-pizarro-yupanqui"],
    resumen: "Nace en Jauja la primera hija mestiza noble del Perú. Bautizada inmediatamente como Francisca. Será legitimada por cédula real (Carlos V) en 1538.",
    fuentes: ["rostworowski-francisca-pizarro", "hemming-1970"],
    tags: ["mujer", "nacimiento", "mestiza"]
  },
  {
    id: "ines-lima-fundacion",
    acto: "acto-iv",
    fecha: "1535-01-18",
    lugar: "lima",
    titulo: "Inés Huaylas presente en la fundación de Lima",
    participantes: ["ines-huaylas-yupanqui", "francisco-pizarro"],
    resumen: "Inés (~17 años) acompaña a Pizarro en la fundación de la Ciudad de los Reyes. Reside en las casas reales que Pizarro hace edificar al lado de la plaza mayor.",
    fuentes: ["pedro-pizarro-1571", "rostworowski-francisca-pizarro"],
    tags: ["mujer", "lima"]
  },
  {
    id: "nace-gonzalo-yupanqui",
    acto: "acto-iv",
    fecha: "~1535",
    lugar: "lima",
    titulo: "Nace Gonzalo Pizarro Yupanqui (hijo de Inés)",
    participantes: ["ines-huaylas-yupanqui", "francisco-pizarro"],
    resumen: "Inés da a luz al segundo hijo de Pizarro: Gonzalo. Muere niño antes de 1541.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["nacimiento", "mestizo"]
  },
  {
    id: "ines-casa-ampuero",
    acto: "acto-v",
    fecha: "~1537-09",
    lugar: "lima",
    titulo: "Pizarro casa a Inés con Francisco de Ampuero",
    participantes: ["ines-huaylas-yupanqui", "francisco-pizarro"],
    resumen: "Pizarro retira a Inés de su lecho casándola con su secretario Francisco de Ampuero. Es ya hombre cincuentón con hijos legítimos planeados en España (Hernando piensa traerle esposa española). Los hijos (Francisca, Gonzalo) quedan con Pizarro. Inés tiene ~19 años; Ampuero será su esposo legal hasta su muerte.",
    fuentes: ["rostworowski-francisca-pizarro", "pedro-pizarro-1571"],
    tags: ["mujer", "matrimonio-forzado"]
  },
  {
    id: "ines-hijos-ampuero",
    acto: "acto-v",
    fecha: "~1538-1545",
    lugar: "lima",
    titulo: "Inés tiene hijos con Ampuero (Martín, Isabel, Francisca de Ampuero)",
    participantes: ["ines-huaylas-yupanqui"],
    resumen: "Inés y Ampuero tienen al menos tres hijos: Martín de Ampuero (heredará la encomienda), Isabel, Francisca de Ampuero. Esta segunda familia es legítima y española.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["mujer", "familia"]
  },
  {
    id: "ines-asesinato-pizarro",
    acto: "acto-vi",
    fecha: "1541-06-26",
    lugar: "lima",
    titulo: "Inés testigo del asesinato de Pizarro",
    participantes: ["ines-huaylas-yupanqui", "francisco-pizarro"],
    resumen: "Cuando los almagristas asaltan la casa de Pizarro, Inés y Ampuero están cerca. Sus hijos Francisca y Gonzalo escondidos por Inés Muñoz (esposa de Francisco Martín de Alcántara, también asesinado).",
    fuentes: ["pedro-pizarro-1571", "rostworowski-francisca-pizarro"],
    tags: ["mujer", "asesinato-pizarro"]
  },
  {
    id: "ines-muere",
    acto: "acto-viii",
    fecha: "~1556",
    lugar: "lima",
    titulo: "Muere Inés Huaylas Yupanqui",
    participantes: ["ines-huaylas-yupanqui"],
    resumen: "Muere en Lima ~1556 (algunas fuentes 1559). Sus descendientes por la rama Ampuero forman una rama nobiliaria limeña.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["mujer", "muerte"]
  },
  // ============================================================
  // GROUP: Angelina Yupanqui / Cuxirimay Ocllo
  // ============================================================
  {
    id: "angelina-nace",
    acto: "acto-o",
    fecha: "~1521",
    lugar: "cuzco",
    titulo: "Nace Cuxirimay Ocllo (después Angelina Yupanqui)",
    participantes: ["angelina-yupanqui"],
    resumen: "Nace Cuxirimay Ocllo, hija de Yamque Yupanqui (hermano de Huayna Cápac). Pertenece a la panaca de Pachacuti, las casas reales más antiguas de Cuzco.",
    fuentes: ["betanzos-1551"],
    tags: ["mujer", "nacimiento", "linaje-real"]
  },
  {
    id: "angelina-coya-atahualpa",
    acto: "acto-o",
    fecha: "~1531",
    lugar: "quito",
    titulo: "Cuxirimay Ocllo designada coya principal de Atahualpa",
    participantes: ["angelina-yupanqui", "atahualpa"],
    resumen: "Designada coya principal de Atahualpa en su consagración del norte. El matrimonio es endogámico real: Cuxirimay es hija de un hermano paterno de Huayna Cápac.",
    fuentes: ["betanzos-1551"],
    tags: ["mujer", "matrimonio-real"]
  },
  {
    id: "angelina-cajamarca",
    acto: "acto-i",
    fecha: "1532-11-15",
    lugar: "cajamarca",
    titulo: "Cuxirimay en Cajamarca con Atahualpa",
    participantes: ["angelina-yupanqui", "atahualpa"],
    resumen: "Cuxirimay, con ~11 años, está en Cajamarca como coya principal cuando Atahualpa es capturado por Pizarro. Acompaña al inca durante los 8 meses de cautiverio.",
    fuentes: ["betanzos-1551", "pedro-pizarro-1571"],
    tags: ["mujer", "atahualpa"]
  },
  {
    id: "angelina-pasa-pizarro",
    acto: "acto-ii",
    fecha: "1533-07",
    lugar: "cajamarca",
    titulo: "Cuxirimay pasa a Pizarro tras la ejecución de Atahualpa",
    participantes: ["angelina-yupanqui", "francisco-pizarro"],
    resumen: "Tras la ejecución de Atahualpa, Pizarro toma a Cuxirimay como concubina. Es bautizada como Angelina.",
    fuentes: ["pedro-pizarro-1571", "betanzos-1551"],
    tags: ["mujer", "concubinato"]
  },
  {
    id: "angelina-marcha-cuzco",
    acto: "acto-iii",
    fecha: "1533-08",
    lugar: "huamachuco",
    titulo: "Angelina viaja con Pizarro al sur",
    participantes: ["angelina-yupanqui", "francisco-pizarro"],
    resumen: "Acompaña al ejército español en la marcha de Cajamarca a Cuzco junto con Inés Huaylas.",
    fuentes: ["pedro-pizarro-1571"],
    tags: ["mujer", "viaje"]
  },
  {
    id: "angelina-lima-1535",
    acto: "acto-iv",
    fecha: "1535-01",
    lugar: "lima",
    titulo: "Angelina se establece en Lima con Pizarro",
    participantes: ["angelina-yupanqui", "francisco-pizarro"],
    resumen: "Comparte vivienda con Pizarro en Lima. Es 'segunda concubina' después/junto a Inés Huaylas.",
    fuentes: ["pedro-pizarro-1571"],
    tags: ["mujer", "lima"]
  },
  {
    id: "nace-francisco-hijo",
    acto: "acto-v",
    fecha: "~1538",
    lugar: "lima",
    titulo: "Nace Francisco Pizarro hijo (de Angelina)",
    participantes: ["angelina-yupanqui", "francisco-pizarro"],
    resumen: "Angelina da a luz al hijo Francisco Pizarro (homónimo del padre).",
    fuentes: ["pedro-pizarro-1571"],
    tags: ["nacimiento", "mestizo"]
  },
  {
    id: "nace-juan-yupanqui",
    acto: "acto-v",
    fecha: "~1540",
    lugar: "lima",
    titulo: "Nace Juan Pizarro Yupanqui (de Angelina)",
    participantes: ["angelina-yupanqui", "francisco-pizarro"],
    resumen: "Angelina da a luz a Juan Pizarro Yupanqui.",
    fuentes: ["pedro-pizarro-1571"],
    tags: ["nacimiento", "mestizo"]
  },
  {
    id: "angelina-casa-betanzos",
    acto: "acto-viii",
    fecha: "~1543",
    lugar: "cuzco",
    titulo: "Angelina casa con Juan de Betanzos",
    participantes: ["angelina-yupanqui"],
    resumen: "Tras el asesinato de Pizarro, Angelina queda viuda. Casa con Juan de Betanzos (notario y aprendiz de quechua) en Cuzco. Esta unión es la base de la Suma y narración de los incas (1551), porque Betanzos aprende quechua y la historia con la familia cuzqueña de su esposa.",
    fuentes: ["betanzos-1551"],
    tags: ["mujer", "matrimonio"]
  },
  {
    id: "betanzos-suma-completada",
    acto: "acto-viii",
    fecha: "1551",
    lugar: "cuzco",
    titulo: "Betanzos completa la Suma y narración",
    participantes: ["angelina-yupanqui"],
    resumen: "Juan de Betanzos completa la 'Suma y narración de los incas' usando los relatos de Angelina y su familia cuzqueña. Es la fuente más rica de la perspectiva Atahualpa/cuzqueña.",
    fuentes: ["betanzos-1551"],
    tags: ["mujer", "fuente"]
  },
  {
    id: "angelina-muere",
    acto: "acto-viii",
    fecha: "~1576",
    lugar: "cuzco",
    titulo: "Muere Angelina Yupanqui",
    participantes: ["angelina-yupanqui"],
    resumen: "Muere en Cuzco. Su descendencia se integra a la nobleza cuzqueña colonial.",
    fuentes: ["betanzos-1551"],
    tags: ["mujer", "muerte"]
  },
  // ============================================================
  // GROUP: Contarguacho
  // ============================================================
  {
    id: "contarguacho-secundaria",
    acto: "acto-o",
    fecha: "~1517",
    lugar: "cuzco",
    titulo: "Contarguacho como esposa secundaria de Huayna Cápac",
    participantes: ["contarguacho", "huayna-capac"],
    resumen: "Hija del curaca de Huaylas, dada a Huayna Cápac como esposa secundaria. Era una práctica imperial: integrar señoríos regionales a través de matrimonios.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["mujer", "matrimonio-politico"]
  },
  {
    id: "contarguacho-huaylas-1527",
    acto: "acto-o",
    fecha: "~1527",
    lugar: "huaylas",
    titulo: "Contarguacho vuelve a Huaylas tras muerte de Huayna Cápac",
    participantes: ["contarguacho"],
    resumen: "Tras la muerte del Sapa Inca, regresa a su señorío de Huaylas, donde mantiene autoridad como curaca por linaje propio.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["mujer", "viaje"]
  },
  {
    id: "contarguacho-visita-hija",
    acto: "acto-iv",
    fecha: "~1534",
    lugar: "cuzco",
    titulo: "Contarguacho visita a su hija Inés y nieta Francisca",
    participantes: ["contarguacho", "ines-huaylas-yupanqui", "francisca-pizarro-yupanqui"],
    resumen: "Viaja desde Huaylas a visitar a Inés y a su recién nacida nieta Francisca. Establece vínculo directo con la familia mestiza Pizarro.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["mujer", "viaje", "familia"]
  },
  {
    id: "contarguacho-tropas-lima",
    acto: "acto-v",
    fecha: "1536-08",
    lugar: "lima",
    titulo: "Contarguacho envía tropas huaylas a defender Lima",
    participantes: ["contarguacho", "ines-huaylas-yupanqui"],
    resumen: "Cuando Quizo Yupanqui asedia Lima en agosto 1536, Contarguacho envía un contingente militar de Huaylas para defender la ciudad. Su motivación es proteger a su hija y a su nieta Francisca. Es uno de los casos más explícitos de una señora étnica aliándose con los españoles por parentesco mestizo.",
    fuentes: ["pedro-pizarro-1571", "rostworowski-francisca-pizarro"],
    tags: ["mujer", "guerra", "alianza"]
  },
  // ============================================================
  // GROUP: Cura Ocllo — vida detallada
  // ============================================================
  {
    id: "cura-ocllo-coya-manco",
    acto: "acto-o",
    fecha: "~1530",
    lugar: "cuzco",
    titulo: "Cura Ocllo coya de Manco Inca",
    participantes: ["cura-ocllo", "manco-inca"],
    resumen: "Cura Ocllo, hermana paterna de Manco, se vuelve su coya principal según la práctica endogámica real inca.",
    fuentes: ["titu-cusi-1570", "pedro-pizarro-1571"],
    tags: ["mujer", "matrimonio-real"]
  },
  {
    id: "cura-ocllo-prision-1",
    acto: "acto-iv",
    fecha: "~1535",
    lugar: "cuzco",
    titulo: "Hernando Pizarro exige a Cura Ocllo durante la 1ª prisión",
    participantes: ["cura-ocllo", "manco-inca", "hernando-pizarro"],
    resumen: "Durante la 1ª prisión de Manco, Hernando exige no solo el tesoro sino también a la coya Cura Ocllo. Manco la mantiene a salvo.",
    fuentes: ["titu-cusi-1570"],
    tags: ["mujer", "violencia-sexual", "prision"]
  },
  {
    id: "cura-ocllo-engano-ynguill",
    acto: "acto-iv",
    fecha: "~1535",
    lugar: "cuzco",
    titulo: "Engaño de Ynguill — Manco salva a Cura Ocllo",
    participantes: ["cura-ocllo", "manco-inca", "gonzalo-pizarro", "ynguill"],
    resumen: "Durante la 2ª prisión, Gonzalo Pizarro exige a Cura Ocllo. Manco hace desfilar 20 mujeres; ninguna convence a Gonzalo. Finalmente Manco presenta a Ynguill (dama de Cura Ocllo) vestida como coya. Gonzalo cae. Cura Ocllo queda a salvo. Manco se ríe.",
    fuentes: ["titu-cusi-1570"],
    tags: ["mujer", "engano-politico"]
  },
  {
    id: "cura-ocllo-callea",
    acto: "acto-v",
    fecha: "1536-04",
    lugar: "callea",
    titulo: "Cura Ocllo huye con Manco a Callea",
    participantes: ["cura-ocllo", "manco-inca"],
    resumen: "Acompaña a Manco en la fuga desde Cuzco a Callea bajo pretexto de cacería. Desde Callea comienza la movilización del cerco.",
    fuentes: ["titu-cusi-1570"],
    tags: ["mujer", "viaje"]
  },
  {
    id: "cura-ocllo-vitcos",
    acto: "acto-vi",
    fecha: "~1537",
    lugar: "vitcos",
    titulo: "Cura Ocllo en Vitcos con Manco",
    participantes: ["cura-ocllo", "manco-inca"],
    resumen: "Vive en Vitcos durante la fase de resistencia neoinca temprana.",
    fuentes: ["titu-cusi-1570"],
    tags: ["mujer", "vilcabamba"]
  },
  {
    id: "cura-ocllo-oroncoy-salva-manco",
    acto: "acto-vi",
    fecha: "~1537",
    lugar: "oroncoy",
    titulo: "Cura Ocllo salva la vida de Manco en Oroncoy",
    participantes: ["cura-ocllo", "manco-inca"],
    resumen: "De noche, Cura Ocllo despierta a Manco al oír el tropel de los caballos españoles que se acercaban. Manco monta en segundos y organiza la trampa que despeña a 200 españoles. Sin ella, lo habrían sorprendido durmiendo.",
    fuentes: ["titu-cusi-1570"],
    tags: ["mujer", "guerra", "rescate"]
  },
  {
    id: "cura-ocllo-capturada",
    acto: "acto-vi",
    fecha: "~1540",
    lugar: "tambo",
    titulo: "Cura Ocllo capturada por Gonzalo Pizarro",
    participantes: ["cura-ocllo", "gonzalo-pizarro"],
    resumen: "Durante una expedición de Gonzalo Pizarro a Vilcabamba, Cura Ocllo es capturada. Manco escapa cruzando un río a nado.",
    fuentes: ["titu-cusi-1570"],
    tags: ["mujer", "captura"]
  },
  {
    id: "cura-ocllo-defensa-violacion",
    acto: "acto-vi",
    fecha: "~1540",
    lugar: "tambo",
    titulo: "Cura Ocllo se defiende de violación con sustancias hediondas",
    participantes: ["cura-ocllo"],
    resumen: "En el camino de regreso a Tambo, los soldados españoles intentan forzarla repetidamente. Ella se defiende untándose cosas hediondas para que ninguno se acerque. Esta defensa funciona durante toda la marcha.",
    fuentes: ["titu-cusi-1570"],
    tags: ["mujer", "violencia-sexual", "resistencia"]
  },
  {
    id: "cura-ocllo-asaeteada",
    acto: "acto-vi",
    fecha: "~1540",
    lugar: "tambo",
    titulo: "Cura Ocllo asaeteada en Tambo",
    participantes: ["cura-ocllo"],
    resumen: "En Tambo, enfurecidos por no haber podido violarla, los españoles la asaetean (flechan) viva. Ella misma se tapa los ojos con un paño y dice: '¿En una mujer vengáis vuestros enojos? Daos prisa a acabarme porque se cumpla vuestro apetito en todo.' Muere así.",
    fuentes: ["titu-cusi-1570"],
    tags: ["mujer", "muerte", "martirio"]
  },
  // ============================================================
  // GROUP: Buba
  // ============================================================
  {
    id: "buba-advierte-manco",
    acto: "acto-vi",
    fecha: "~1545",
    lugar: "vitcos",
    titulo: "Buba advierte a Manco del plan de los 7 españoles",
    participantes: ["buba", "manco-inca"],
    resumen: "Buba, una india pareja de uno de los siete españoles refugiados, advierte a Manco días antes del asesinato que los siete planean matarlo. Manco NO le cree y sigue tratando a los refugiados 'como hermanos propios'.",
    fuentes: ["titu-cusi-1570"],
    tags: ["mujer", "advertencia", "manco"]
  },
  // ============================================================
  // GROUP: Beatriz Clara Coya
  // ============================================================
  {
    id: "beatriz-nace",
    acto: "acto-vii",
    fecha: "1558",
    lugar: "yucay",
    titulo: "Nace Beatriz Clara Coya",
    participantes: ["beatriz-clara-coya", "sayri-tupac", "maria-cusi-huarcay"],
    resumen: "Nace en Yucay. Padre: Sayri Túpac (Sapa Inca de Vilcabamba que negoció su salida en 1557). Madre: María Cusi Huarcay (hermana-esposa de Sayri Túpac).",
    fuentes: ["calancha-1638", "hemming-1970"],
    tags: ["mujer", "nacimiento", "mestiza"]
  },
  {
    id: "beatriz-huerfana",
    acto: "acto-vii",
    fecha: "1561",
    lugar: "yucay",
    titulo: "Muere Sayri Túpac, Beatriz huérfana a los 3 años",
    participantes: ["beatriz-clara-coya", "sayri-tupac"],
    resumen: "Muere su padre Sayri Túpac. Beatriz queda como heredera única de la encomienda de Yucay con 3 años.",
    fuentes: ["calancha-1638"],
    tags: ["mujer", "huerfana"]
  },
  {
    id: "beatriz-matrimonio-loyola",
    acto: "acto-vii",
    fecha: "1572-09",
    lugar: "cuzco",
    titulo: "Beatriz (14 años) casa con García Óñez de Loyola",
    participantes: ["beatriz-clara-coya"],
    resumen: "Tras la caída de Vilcabamba y ejecución de Túpac Amaru, Beatriz es presionada al matrimonio con Martín García Óñez de Loyola (sobrino-nieto de San Ignacio, capitán que capturó a Túpac Amaru). Unión estratégica: linaje Loyola obtiene sangre Inca; el imperio integra a la dinastía vencida.",
    fuentes: ["murua-1613", "hemming-1970"],
    tags: ["mujer", "matrimonio-forzado"]
  },
  {
    id: "nace-ana-maria-loyola",
    acto: "acto-viii",
    fecha: "1593",
    lugar: "lima",
    titulo: "Nace Ana María Lorenza García de Loyola Coya",
    participantes: ["beatriz-clara-coya"],
    resumen: "Nace la hija de Beatriz, primera marquesa de Oropesa por descendencia, transmitiendo la sangre Inca a la nobleza europea.",
    fuentes: ["hemming-1970"],
    tags: ["mujer", "nacimiento"]
  },
  {
    id: "beatriz-muere",
    acto: "acto-viii",
    fecha: "1600",
    lugar: "lima",
    titulo: "Muere Beatriz Clara Coya",
    participantes: ["beatriz-clara-coya"],
    resumen: "Muere en Lima. Su retrato (junto al de Óñez de Loyola y los descendientes) decora el famoso cuadro del Beaterio del Cuzco — ícono del mestizaje noble.",
    fuentes: ["hemming-1970"],
    tags: ["mujer", "muerte"]
  },
  // ============================================================
  // GROUP: Hernando Pizarro — movimientos detallados
  // ============================================================
  {
    id: "hernando-baños-15-nov",
    acto: "acto-i",
    fecha: "1532-11-15",
    lugar: "banos-del-inca",
    titulo: "Hernando Pizarro y Soto entrevistan a Atahualpa en los Baños",
    participantes: ["hernando-pizarro", "hernando-de-soto", "atahualpa"],
    resumen: "El día previo al encuentro, Pizarro envía a Soto con 20 jinetes a entrevistarse con Atahualpa en los Baños del Inca. Hernando Pizarro lo refuerza con otros 15. Soto hace alarde con su caballo casi atropellando al Inca; Atahualpa no se mueve. Acuerdan que Atahualpa irá al día siguiente a Cajamarca a verse con Pizarro.",
    fuentes: ["xerez-1534", "estete-1535", "mena-1534"],
    tags: ["diplomacia", "atahualpa"]
  },
  {
    id: "captura-atahualpa-detail",
    acto: "acto-i",
    fecha: "1532-11-16",
    lugar: "cajamarca",
    titulo: "Captura de Atahualpa por los 168 españoles en la plaza",
    participantes: ["francisco-pizarro", "atahualpa", "hernando-pizarro", "hernando-de-soto", "fray-vicente-de-valverde", "felipillo"],
    resumen: "Los ~168 españoles de Pizarro están escondidos en las kallankas de la plaza de Cajamarca al atardecer. Atahualpa entra con ~6000 hombres del séquito ritual, sin armas pesadas. Valverde le entrega la quillca/breviario. Atahualpa la arroja al suelo. Pizarro hace la señal: dispara el falconete, sale la caballería al grito de '¡Santiago!'. Mueren 2000-7000 indígenas en minutos. Pizarro toma personalmente al inca prisionero (sufre una pequeña herida en la mano por proteger su vida).",
    fuentes: ["xerez-1534", "mena-1534", "estete-1535", "pedro-pizarro-1571"],
    tags: ["batalla", "captura"]
  },
  {
    id: "hernando-pachacamac",
    acto: "acto-i",
    fecha: "1533-01-20",
    lugar: "pachacamac",
    titulo: "Hernando Pizarro parte a Pachacámac",
    participantes: ["hernando-pizarro", "estete-1535"],
    resumen: "Sale de Cajamarca con 20 jinetes y un puñado de infantes hacia Pachacámac, el gran oráculo costero. Va a verificar las cantidades de oro prometidas y a desmantelar el ídolo. Le acompaña Miguel de Estete (cuya 'Noticia' es la fuente principal). Cruzan la sierra hasta Huánuco Pampa y bajan a la costa por Pachacámac.",
    fuentes: ["estete-1535", "hernando-pizarro-1533"],
    tags: ["viaje", "oro"]
  },
  {
    id: "hernando-pachacamac-vuelta",
    acto: "acto-ii",
    fecha: "1533-04-25",
    lugar: "cajamarca",
    titulo: "Hernando vuelve a Cajamarca",
    participantes: ["hernando-pizarro", "atahualpa", "challcochima"],
    resumen: "Vuelve a Cajamarca con poco oro de Pachacámac (los sacerdotes habían escondido lo principal). Trae además al general Challcochima en convoy (lo había convencido de subir desde Jauja).",
    fuentes: ["estete-1535", "xerez-1534"],
    tags: ["viaje", "challcochima"]
  },
  {
    id: "hernando-carta-audiencia",
    acto: "acto-ii",
    fecha: "1533-04",
    lugar: "cajamarca",
    titulo: "Hernando Pizarro escribe carta a la Audiencia de Santo Domingo",
    participantes: ["hernando-pizarro"],
    resumen: "Tras volver de Pachacámac, escribe una larga carta a la Audiencia de Santo Domingo describiendo el imperio inca, el rescate y la visita al oráculo. Este texto (embebido después en Oviedo) es una de las relaciones más tempranas del Tahuantinsuyu.",
    fuentes: ["hernando-pizarro-1533"],
    tags: ["carta", "fuente"]
  },
  {
    id: "hernando-lleva-rescate",
    acto: "acto-ii",
    fecha: "1533-07-13",
    lugar: "cajamarca",
    titulo: "Hernando parte hacia España con el primer rescate",
    participantes: ["hernando-pizarro"],
    resumen: "Sale de Cajamarca (días antes de la ejecución de Atahualpa) llevando la primera remesa del rescate hacia la costa, embarcando hacia Panamá y de allí a Sevilla. Su salida lo distancia políticamente de la ejecución.",
    fuentes: ["xerez-1534", "hemming-1970"],
    tags: ["viaje", "oro"]
  },
  {
    id: "hernando-rey-toledo",
    acto: "acto-iii",
    fecha: "1534-04",
    lugar: "toledo",
    titulo: "Hernando presenta el rescate al rey Carlos V en Toledo",
    participantes: ["hernando-pizarro"],
    resumen: "Llega a Sevilla en enero 1534, va a Toledo, entrega el oro al rey en abril. Es momento culminante del prestigio Pizarro en la corte: la noticia del 'Perú' se vuelve la sensación europea.",
    fuentes: ["hemming-1970"],
    tags: ["viaje", "diplomacia"]
  },
  {
    id: "hernando-vuelve-1535",
    acto: "acto-iv",
    fecha: "1535-01",
    lugar: "sevilla",
    titulo: "Hernando se embarca de regreso al Perú",
    participantes: ["hernando-pizarro"],
    resumen: "Sale de Sevilla con refuerzos y nuevos pobladores. Lleva título de caballero de Santiago.",
    fuentes: ["hemming-1970"],
    tags: ["viaje"]
  },
  {
    id: "hernando-prende-manco-1",
    acto: "acto-iv",
    fecha: "~1535",
    lugar: "cuzco",
    titulo: "Hernando toma a Manco preso (1ª prisión)",
    participantes: ["hernando-pizarro", "manco-inca"],
    resumen: "Como corregidor del Cuzco, Hernando dirige a 100+ españoles a la casa de Manco con pretexto de visita. Lo encadenan con grillos y cadena al cuello. Exigen el tesoro y a Cura Ocllo. Manco organiza el llamado de los 4 suyos para juntar el primer rescate.",
    fuentes: ["titu-cusi-1570"],
    tags: ["prision"]
  },
  {
    id: "hernando-vuelve-españa-1539",
    acto: "acto-vi",
    fecha: "1539",
    lugar: "lima",
    titulo: "Hernando se embarca a España con más oro",
    participantes: ["hernando-pizarro"],
    resumen: "Tras vencer a Almagro y ejecutarlo (1538), Hernando vuelve a España con un cargamento mayor de oro. Pero la corona y los aliados de Almagro reclaman justicia.",
    fuentes: ["hemming-1970"],
    tags: ["viaje"]
  },
  {
    id: "hernando-encarcelado",
    acto: "acto-vi",
    fecha: "1540",
    lugar: "la-mota",
    titulo: "Hernando Pizarro encarcelado en castillo de La Mota",
    participantes: ["hernando-pizarro"],
    resumen: "Por orden real, encarcelado en el castillo de La Mota (Medina del Campo) por la ejecución de Almagro. Pasaría 20 años preso (1540-1561) — la prisión política más larga de un conquistador.",
    fuentes: ["hemming-1970"],
    tags: ["prision"]
  },
  {
    id: "hernando-casa-francisca",
    acto: "acto-viii",
    fecha: "1552-10-10",
    lugar: "la-mota",
    titulo: "Hernando casa con su sobrina Francisca Pizarro Yupanqui",
    participantes: ["hernando-pizarro", "francisca-pizarro-yupanqui"],
    resumen: "En La Mota, todavía preso, Hernando casa con Francisca Pizarro Yupanqui, su sobrina mestiza (hija de Pizarro e Inés Huaylas). Él tiene ~50, ella ~17. Matrimonio escandaloso pero legal con dispensa papal. Justifica la fortuna unida del linaje.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["matrimonio", "mestiza"]
  },
  {
    id: "hernando-liberado",
    acto: "acto-viii",
    fecha: "1561",
    lugar: "la-mota",
    titulo: "Hernando liberado de La Mota",
    participantes: ["hernando-pizarro"],
    resumen: "Tras 20 años preso, finalmente liberado. Va a Trujillo (Extremadura) a vivir con Francisca y los hijos.",
    fuentes: ["hemming-1970"],
    tags: ["liberacion"]
  },
  {
    id: "hernando-muere",
    acto: "acto-viii",
    fecha: "1578",
    lugar: "trujillo-extremadura",
    titulo: "Muere Hernando Pizarro en Trujillo",
    participantes: ["hernando-pizarro"],
    resumen: "Muere a los ~76 años, último de los Pizarro vivos. Francisca le sobrevive y vive hasta 1598 en Madrid.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["muerte"]
  },
  // ============================================================
  // GROUP: Atahualpa — detalle Cajamarca
  // ============================================================
  {
    id: "atahualpa-baños-15-nov",
    acto: "acto-i",
    fecha: "1532-11-15",
    lugar: "banos-del-inca",
    titulo: "Atahualpa en los Baños del Inca",
    participantes: ["atahualpa"],
    resumen: "El día que llega Pizarro a Cajamarca, Atahualpa está en los Baños del Inca (Pultumarca) con su corte. Recibe a Hernando Pizarro y Soto. Acepta la propuesta de entrevistarse al día siguiente en la plaza.",
    fuentes: ["xerez-1534", "estete-1535"],
    tags: ["atahualpa", "diplomacia"]
  },
  {
    id: "atahualpa-propone-rescate",
    acto: "acto-i",
    fecha: "~1532-12",
    lugar: "cajamarca",
    titulo: "Atahualpa propone el rescate",
    participantes: ["atahualpa", "francisco-pizarro"],
    resumen: "Tras unos días de cautiverio, Atahualpa propone llenar un cuarto con oro hasta donde alcance la mano + dos cuartos con plata, a cambio de su libertad. Pizarro acepta. Esto inicia el flujo de oro desde todo el imperio.",
    fuentes: ["xerez-1534", "mena-1534"],
    tags: ["rescate", "atahualpa"]
  },
  {
    id: "atahualpa-cuarto-rescate-completo",
    acto: "acto-ii",
    fecha: "1533-05",
    lugar: "cajamarca",
    titulo: "Cuarto del rescate completado",
    participantes: ["atahualpa", "francisco-pizarro"],
    resumen: "Tras meses de envíos desde el Cuzco, Pachacámac y otras ciudades, el cuarto se llena. Los españoles funden el oro: ~6 toneladas de oro y ~12 de plata en lingotes. Cada hombre recibe varios kilos.",
    fuentes: ["xerez-1534", "hemming-1970"],
    tags: ["oro", "rescate"]
  },
  {
    id: "atahualpa-bautizo",
    acto: "acto-ii",
    fecha: "1533-07-26",
    lugar: "cajamarca",
    titulo: "Atahualpa bautizado in extremis como Francisco",
    participantes: ["atahualpa", "fray-vicente-de-valverde", "francisco-pizarro"],
    resumen: "Antes del garrote, Valverde le ofrece bautizo a Atahualpa con la promesa de morir por garrote (no hoguera). Atahualpa acepta. Es bautizado como Francisco. Inmediatamente después es ejecutado en la plaza.",
    fuentes: ["xerez-1534", "mena-1534", "estete-1535"],
    tags: ["bautismo", "ejecucion"]
  },
  // ============================================================
  // GROUP: Soto detallado
  // ============================================================
  {
    id: "soto-llega-tumbes",
    acto: "acto-i",
    fecha: "1532",
    lugar: "tumbes",
    titulo: "Hernando de Soto llega al Perú",
    participantes: ["hernando-de-soto"],
    resumen: "Llega al Perú con su propia compañía y caballos, no como hombre de los Pizarro. Se une a la expedición pero mantiene autonomía. Trae prestigio de las conquistas centroamericanas.",
    fuentes: ["xerez-1534", "lockhart-1972"],
    tags: ["llegada"]
  },
  {
    id: "soto-vilcaconga-emboscada",
    acto: "acto-iii",
    fecha: "1533-11-08",
    lugar: "vilcacunga",
    titulo: "Soto sufre emboscada de Quisquis en Vilcaconga",
    participantes: ["hernando-de-soto", "quisquis"],
    resumen: "Soto adelanta con ~70 jinetes (3 días delante de Pizarro). En el abra de Vilcaconga, miles de guerreros de Quisquis caen con galgas y flechas. Mueren 5 españoles y caballos. Soto resiste; refuerzos nocturnos de Almagro con 30 jinetes lo salvan.",
    fuentes: ["xerez-1534", "estete-1535", "pedro-pizarro-1571"],
    tags: ["batalla", "vilcaconga"]
  },
  {
    id: "soto-vuelve-españa",
    acto: "acto-iv",
    fecha: "1535",
    lugar: "lima",
    titulo: "Soto vuelve a España rico",
    participantes: ["hernando-de-soto"],
    resumen: "Tras la entrada al Cuzco y la persecución de Quisquis, Soto recibe su parte del oro y vuelve a España. Allí financia su propia expedición a la Florida (1539).",
    fuentes: ["hemming-1970"],
    tags: ["viaje"]
  },
  {
    id: "soto-florida",
    acto: "acto-v",
    fecha: "1539-05-25",
    lugar: "cuba",
    titulo: "Soto sale a la Florida",
    participantes: ["hernando-de-soto"],
    resumen: "Sale de Cuba con su propia expedición a la Florida. Recorre el sureste de Norteamérica durante 3 años buscando otro Perú.",
    fuentes: [],
    tags: ["viaje"]
  },
  {
    id: "soto-muere-mississippi",
    acto: "acto-vi",
    fecha: "1542-05-21",
    lugar: "mississippi",
    titulo: "Soto muere en el Mississippi",
    participantes: ["hernando-de-soto"],
    resumen: "Muere de fiebres en la orilla del río Mississippi. Sus hombres echan su cuerpo al río para que los indios no lo encuentren.",
    fuentes: [],
    tags: ["muerte"]
  },
  // ============================================================
  // GROUP: Francisca Pizarro Yupanqui — vida post-Pizarro
  // ============================================================
  {
    id: "francisca-legitimada",
    acto: "acto-v",
    fecha: "1538",
    lugar: "lima",
    titulo: "Francisca legitimada por Cédula Real",
    participantes: ["francisca-pizarro-yupanqui"],
    resumen: "Carlos V emite cédula legitimando a Francisca (hija natural) como hija legítima de Pizarro y heredera formal. Hito legal: primera mestiza con plenos derechos hereditarios coloniales.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["legitimacion", "mestiza"]
  },
  {
    id: "francisca-asesinato",
    acto: "acto-vi",
    fecha: "1541-06-26",
    lugar: "lima",
    titulo: "Francisca (~7 años) testigo del asesinato de su padre",
    participantes: ["francisca-pizarro-yupanqui", "ines-munoz"],
    resumen: "Cuando los almagristas asaltan la casa de Pizarro, Inés Muñoz (su tía política, esposa de Francisco Martín de Alcántara) la esconde junto con su hermanito Gonzalo en una pieza.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["asesinato-pizarro", "mestiza"]
  },
  {
    id: "francisca-viaja-españa",
    acto: "acto-viii",
    fecha: "1551",
    lugar: "lima",
    titulo: "Francisca sale del Perú hacia España",
    participantes: ["francisca-pizarro-yupanqui"],
    resumen: "Por orden del rey, Francisca y sus medio hermanos (los hijos de Angelina) son enviados a España para sacarlos del Perú revuelto. Llegan a Sevilla ese año.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["viaje"]
  },
  {
    id: "francisca-casa-hernando",
    acto: "acto-viii",
    fecha: "1552-10-10",
    lugar: "la-mota",
    titulo: "Francisca casa con su tío Hernando en La Mota",
    participantes: ["francisca-pizarro-yupanqui", "hernando-pizarro"],
    resumen: "Casa en el castillo donde su tío Hernando está preso. Él tiene 50+, ella 17. Matrimonio estratégico para mantener la fortuna Pizarro en la familia. Tendrán 5 hijos.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["matrimonio"]
  },
  {
    id: "francisca-muere",
    acto: "acto-viii",
    fecha: "1598-05-30",
    lugar: "madrid",
    titulo: "Muere Francisca Pizarro Yupanqui en Madrid",
    participantes: ["francisca-pizarro-yupanqui"],
    resumen: "Muere en Madrid a los 63 años. Termina sus días como una de las mujeres más ricas y respetadas de Castilla, con honores virreinales.",
    fuentes: ["rostworowski-francisca-pizarro"],
    tags: ["muerte"]
  }
];

let added = 0;
let skipped = 0;
const existing = new Set(data.eventos.map((e) => e.id));
for (const e of NEW_EVENTS) {
  if (existing.has(e.id)) {
    skipped++;
    continue;
  }
  // Default "citas" to empty array if not provided
  if (!e.citas) e.citas = [];
  data.eventos.push(e);
  added++;
}

// Sort by date roughly (year extraction)
function parseYear(s) {
  const m = String(s || "").replace(/^~/, "").match(/^(\d{4})/);
  return m ? Number(m[1]) : 9999;
}
data.eventos.sort((a, b) => parseYear(a.fecha) - parseYear(b.fecha));

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf8");
console.log(`Añadidos: ${added}/${NEW_EVENTS.length}. Saltados (dup): ${skipped}.`);
console.log(`Total eventos en timeline.json: ${data.eventos.length}`);
