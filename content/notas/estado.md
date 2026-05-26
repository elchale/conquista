---
tipo: notas
nombre: Estado del archivo
slug: estado
tags: [meta, estado, roadmap]
estado: en-progreso
ultima_revision: 2026-05-19
---

# Estado del archivo (2026-05-19)

## Lo que existe ahora

### Infraestructura ✓
- Next.js 15 + React 18 + TypeScript + Tailwind. **Build verde, 57 páginas estáticas generadas.**
- Páginas: `/`, `/[tipo]`, `/[tipo]/[slug]`, `/mapa`, `/timeline`, `/fuentes`.
- Sidebar con árbol de carpetas y estados (○ stub · ◐ en-progreso · ● revisado).
- Editor in-browser con auto-guardado (1.2s debounce) vía API route.
- Sistema de citas `[^cite-key]` resolviendo contra `content/data/fuentes.json`.

### Fuentes ✓
- **41 fuentes catalogadas** en `content/data/fuentes.json`.
- **18 PDFs descargados** en `/docs/primarias/` (~394 MB) con campo `pdf_local` poblado.
- 6 fuentes "borrow only" en archive.org documentadas explícitamente — necesitan biblioteca física: Hemming 1970, D'Altroy *The Incas*, Bauer *Sacred Landscape*, Stern *Peru's Indian Peoples*, Spalding *Huarochirí*, Salomon *Native Lords of Quito*.
- 5 fuentes top sin acceso libre (lista en `top_prioridades_bibliotecas_fisicas` dentro del JSON).

### Datos estructurados ✓
- `timeline.json`: 7 actos, ~38 eventos sourced.
- `lugares.json`: 24 sitios geolocalizados, 7 regiones étnicas, 2 rutas históricas.
- `fuentes.json`: 41 entradas con metadata + URLs verificadas.

### Contenido (57 fichas) ✓
- **28 personajes**: Manco, Atahualpa, Huáscar, Titu Cusi, Sayri Túpac, Túpac Amaru I, Cura Ocllo, Vila Orna, Challcochima, Quisquis, Pascac, Paullu Inca, los 4 Pizarro, Soto, Almagro, Alonso de Alvarado, Felipillo, Martinillo, Valverde, fray Marcos García, fray Diego Ortiz, Martín de Pando, Inés Huaylas, Angelina Yupanqui, Francisca Pizarro Yupanqui.
- **5 culturas**: Incas, Chachapoyas, Huancas, Cañaris, Tallanes.
- **14 temas profundos**: traductores-y-comunicacion, vestimenta-espanola-1530s, vestimenta-inca, comida-espanola-en-marcha, comida-inca, advertencias-a-manco, motivos-alianzas-anti-incas, fiestas-incas, caminos-y-tampu, curacas-y-mitimaes, higiene-y-banos-incas, organizacion-cuzco, quipu-y-quillca, ganado-espanol-detalle.
- **4 lugares**: Cajamarca, Cuzco, Sacsahuamán, Vilcabamba.
- **3 eventos**: captura-atahualpa, cerco-cuzco, asesinato-manco-herron.
- **1 índice exhaustivo**: Titu Cusi 1570 (115 personas, 56 lugares, 58 eventos, 60 citas textuales numeradas).
- **2 notas meta**: este archivo + `preguntas-abiertas.md`.

## Convención de stubs

Cada stub tiene estructura completa de secciones pero la mayoría del contenido está marcado:
- `[PENDIENTE: fuente]` — afirmación que falta cite-key
- `[PENDIENTE: ...]` — investigación pendiente
- Citation keys provisorios — pendientes de mapear a los 60 cite-keys reales numerados c01–c60 del índice Titu Cusi

## Próximos pasos sugeridos

### Inmediatos
1. **Mapear las 60 citas Titu Cusi** (`titu-1570-c01`..`titu-1570-c60`) del índice a su uso en cada MD. Reemplazar placeholders `titu-1570-c-XXX-PENDIENTE`.
2. **Cruzar el Acto I del timeline** (Cajamarca 1532) con Xerez 1534 y Mena 1534 que ya están descargados. Añadir cite-keys de fuentes hispanas para corroborar Titu Cusi.
3. **Construir índice de Xerez 1534** análogo al de Titu Cusi — extraer personajes, lugares, eventos, citas textuales con cite-keys `xerez-1534-c01`..., usando el PDF en `/docs/primarias/xerez-1534.pdf`.

### A corto plazo
4. **Stubs para Diego Ordóñez, Diego Rodríguez de Figueroa, Sebastián de Benalcázar, Pedro de Alvarado el de Guatemala, Vaca de Castro, Núñez Vela, Toledo, Carlos Inca, Doña Beatriz Clara Coya.**
5. **Stubs para Chimú, Collas/Lupacas, Chinchas, Cajamarcas (etnia), Quitos** (cultura inca norteña).
6. **Stubs temáticos pendientes**: huarachico-vacaroc (sub-MD), inti-raymi, situa-coya-raymi, aya-marcay-momias, mocha-reverencia, mujeres-inca-y-conquistadores.
7. **Lugares pendientes**: Ollantaytambo, Vitcos, Tomebamba, Kuélap, Tumbes, Tangarará-San Miguel, Jauja, Lima fundación, Coricancha, Puná isla, baños del inca de Cajamarca.

### Investigación a fondo (preguntas del director)
8. **¿Por qué los chachapoyas?** y **¿Por qué los huancas?** — investigación dedicada cuando esté disponible Schjellerup 1997 (ya descargado ✓) y Espinoza Soriano 1971 (NO disponible — biblioteca).
9. **Microetnografía de los 7 españoles refugiados en Vitcos**: nombres exactos, delitos, vida cotidiana en Vilcabamba.
10. **Mujeres de la conquista**: Inés Huaylas, Angelina Yupanqui, Cura Ocllo, Beatriz Clara Coya, Francisca Pizarro — investigación con Rostworowski 2003 (descargada ✓).

## Limitaciones declaradas

- **Sesgos por sobre-dependencia de Titu Cusi**: todo lo que viene del Acto I-VI del timeline necesita corroboración cruzada con cronistas hispanos (ahora disponibles offline).
- **Fechas tentativas**: muchas fechas marcadas con `~` o `[PENDIENTE]` porque Titu Cusi raramente da años precisos.
- **Coordenadas aproximadas**: Vilcabamba, Vitcos, Vilcacunga, Oroncoy, Capi, Rayangalla tienen coords tentativas.
- **Quechua / glosario**: algunas glosas (ej. "vacaroc") del índice PUCP son problemáticas. Cruzar con Cobo (descargado ✓) y Molina cuzqueño (descargado ✓).
- **Fuentes secundarias modernas** (Hemming, D'Altroy, Stern, Spalding, Salomon, Bauer) están en archive.org pero solo en modo "préstamo" (1h online). Requieren acceso institucional o adquisición.

## Reglas del archivo (vinculantes)

1. **No escribir afirmación sin cite-key**. Si no hay, marca `[PENDIENTE: fuente]`.
2. **Citation keys reales** apuntan a entradas en `fuentes.json` (fuente entera) o en su sección `citas` (cita específica con folio).
3. **PDFs descargados** en `/docs/{primarias|secundarias|visitas|ediciones-criticas}/`.
4. **Cuando una fuente no esté disponible gratis**, anotarlo en `fuentes.json` y agregarla a `top_prioridades_bibliotecas_fisicas`.
5. **Cruzar fuentes**: cualquier afirmación importante debería tener al menos 2 fuentes que la mencionen, o estar marcada como "única fuente: X" si solo aparece en una.

## Cómo arrancar

```powershell
cd C:\Users\Personal\Desktop\Carlos\Aivideos\planning\conquista
npm run dev
# Abre http://localhost:3000
```

Para re-descargar PDFs (es idempotente, saltea los que ya existen):
```powershell
node scripts/descargar-fuentes.mjs
```
