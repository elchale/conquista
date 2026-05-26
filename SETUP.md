# Setup local

## Instalación

```powershell
cd C:\Users\Personal\Desktop\Carlos\Aivideos\planning\conquista
npm install
```

## Arrancar el app

```powershell
npm run dev
```

Abre http://localhost:3000

## Descargar las fuentes en PDF (cuando estés listo)

```powershell
node scripts/descargar-fuentes.mjs
```

Esto descarga a `docs/primarias/`, `docs/secundarias/`, etc. todas las fuentes con URL verificada del catálogo. Tarda unos minutos. Saltea archivos ya existentes. Actualiza `fuentes.json` con la ruta `pdf_local`.

Si quieres descargar solo una:

```powershell
node scripts/descargar-fuentes.mjs --only=xerez-1534
```

## Estructura de trabajo

- **Para añadir un personaje, lugar, evento, etc.**: crea `content/<tipo>/<slug>.md` con el frontmatter estándar (ver README.md).
- **Para añadir una fuente nueva**: añade un objeto a `content/data/fuentes.json` en el array `fuentes`.
- **Para añadir una cita textual indexada**: añade una entrada al objeto `citas` con su cite-key.
- **Para añadir un lugar al mapa**: añade un objeto a `content/data/lugares.json` con lat/lng.
- **Para añadir un evento al timeline**: añade un objeto a `content/data/timeline.json`.

## Convención de citas

En cualquier MD:

```markdown
La chicha derramada fue interpretada como ofensa ritual grave [^titu-1570-c01].
```

El componente `MarkdownView` resolverá `titu-1570-c01` contra `fuentes.json` y mostrará tooltip con autor, página y texto.

Si la cita no se resuelve, aparece con tooltip "fuente no resuelta — añadir en fuentes.json", lo cual es **señal de que falta investigar**.

## Tipo de checks recomendados

- `npm run build` para verificar que no haya errores TypeScript.
- Validar JSON: `node -e "JSON.parse(require('fs').readFileSync('content/data/fuentes.json','utf8'))"`.
