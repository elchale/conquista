# Conquista del Imperio Incaico — Archivo de Investigación

Archivo de investigación auditable sobre la conquista española del Tahuantinsuyu (1527–1572). Cada afirmación rastrea a una fuente catalogada; cada fuente está descargada en `/docs` o tiene URL verificable en `fuentes.json`.

## Propósito

No es un blog. No es un libro de divulgación. Es una **base de conocimiento operable** para responder cualquier pregunta sobre el período con precisión y trazabilidad. La meta final (serie de TV) viene después; primero se domina el tema.

## Regla de oro

> **Ninguna afirmación sin citation key.** Si no hay fuente, la afirmación se marca `[PENDIENTE: fuente]` o se borra. Es preferible un MD con huecos honestos que un MD pulido sin sustrato.

## Estructura

```
conquista/
├── docs/                          # Fuentes primarias y secundarias descargadas
│   ├── primarias/                 # Crónicas siglo XVI (Xerez, Cieza, Betanzos, etc.)
│   ├── secundarias/               # Estudios modernos (Hemming, Rostworowski, etc.)
│   ├── visitas/                   # Visitas administrativas (Huánuco 1562, Chucuito 1567)
│   ├── ediciones-criticas/        # Ediciones académicas críticas
│   ├── mapas-historicos/          # Cartografía histórica
│   └── INSTRUCCION...pdf          # Titu Cusi 1570 (ed. crítica)
│
├── content/                       # Contenido editable (MD + JSON)
│   ├── personajes/                # Perfiles de personajes históricos
│   ├── culturas/                  # Incas, Chachapoyas, Huancas, Cañaris, Tallanes...
│   ├── eventos/                   # Eventos específicos (batalla X, fiesta Y)
│   ├── lugares/                   # Pueblos, ciudades, fortalezas, ríos
│   ├── temas/                     # Cortes transversales: vestimenta, comida, idioma, traductores...
│   ├── indices/                   # Índices exhaustivos de fuentes primarias
│   ├── data/                      # Datos estructurados
│   │   ├── fuentes.json           # Catálogo central de fuentes con URLs y metadata
│   │   ├── lugares.json           # Coordenadas geográficas para el mapa
│   │   ├── rutas.json             # Travesías (Pizarro, Almagro, Manco)
│   │   └── timeline.json          # Eventos con fecha + cite-keys
│   └── notas/                     # Notas de trabajo, dudas, preguntas abiertas
│
├── app/                           # Next.js App Router
│   ├── page.tsx                   # Home — directorio
│   ├── mapa/                      # Mapa Leaflet
│   ├── timeline/                  # Timeline interactivo
│   ├── personajes/[slug]/         # Perfil de personaje
│   ├── culturas/[slug]/
│   ├── eventos/[slug]/
│   ├── lugares/[slug]/
│   ├── temas/[slug]/
│   ├── indices/[slug]/
│   ├── fuentes/                   # Catálogo de fuentes
│   └── api/                       # Endpoints lectura/escritura content
│
├── components/                    # React components reutilizables
├── lib/                           # Utilidades (markdown, citas, fuentes)
├── types/                         # Tipos TypeScript
└── public/                        # Estáticos (imágenes, etc.)
```

## Sistema de citas

Cada afirmación en un MD lleva una **citation key** entre `[^...]`:

```markdown
Atahualpa se enojó cuando el español derramó la chicha ritual [^titu-1570-c03],
gesto que los andinos interpretaron como ofensa religiosa [^rostworowski-2003-p87].
```

Las citation keys se resuelven en `content/data/fuentes.json`:

```json
{
  "fuentes": {
    "titu-cusi-1570": {
      "tipo": "primaria",
      "autor": "Diego de Castro Titu Cusi Yupanqui",
      "fecha": 1570,
      "pdf": "docs/INSTRUCCION A DON LOPE GARCIA DE CASTRO-Inca Titu Cusi Yupanqui (1570).pdf",
      "edicion": "Liliana Regalado de Hurtado, PUCP Fondo Editorial, 1992"
    }
  },
  "citas": {
    "titu-1570-c03": {
      "fuente_id": "titu-cusi-1570",
      "pagina_pdf": 47,
      "folio_ms": "10v",
      "texto": "...",
      "contexto": "Atahualpa recibe a los dos españoles..."
    }
  }
}
```

**Cite-key conventions:**
- Fuentes primarias: `<autor-apellido>-<año>` (ej. `xerez-1534`, `cieza-1553`, `betanzos-1551`)
- Citas dentro de una fuente: `<fuente-id>-c<NN>` (ej. `titu-1570-c01`)
- Secundarias: `<autor-apellido>-<año>-p<pag>` (ej. `hemming-1970-p140`)

## Convenciones de los MD

Cada archivo en `/content/<tipo>/<slug>.md` lleva frontmatter:

```yaml
---
tipo: personaje | cultura | evento | lugar | tema
nombre: Manco Inca Yupanqui
slug: manco-inca
tags: [inca, sapay-inga, vilcabamba]
fechas: { nacimiento: ~1516, muerte: 1545 }
ubicaciones_relacionadas: [cuzco, vilcabamba, tambo, vitcos]
personajes_relacionados: [titu-cusi, cura-ocllo, francisco-pizarro]
fuentes_principales: [titu-cusi-1570, pedro-pizarro-1571, hemming-1970]
estado: stub | en-progreso | revisado
ultima_revision: 2026-05-19
---
```

Secciones esperadas según `tipo`:
- **personaje**: identificación · biografía · personalidad · momentos clave · vestimenta/apariencia · relaciones · fuentes
- **cultura**: identificación · ubicación · cronología · organización social · cosmovisión · vestimenta · alimentación · arquitectura · relación con incas · relación con españoles · fuentes
- **evento**: fecha · lugar · participantes · narración · variantes según fuentes · consecuencias · fuentes
- **lugar**: identificación · ubicación geográfica (coords) · descripción · eventos asociados · personajes · fuentes
- **tema**: descripción · variantes según contexto · evidencia documental · debates historiográficos · fuentes

## Flujo de trabajo

1. **Pregunta nueva** del director → se crea (o se actualiza) un MD en el `tipo` apropiado
2. Se buscan menciones en las fuentes ya descargadas (Ctrl+F en PDFs o consulta a los índices en `/content/indices/`)
3. Cada afirmación se redacta con cite-key
4. Si una afirmación requiere una fuente no descargada → se añade entry en `fuentes.json` con URL, y se descarga si está disponible
5. Si una pregunta no se puede responder con fuentes actuales → se registra en `/content/notas/preguntas-abiertas.md`

## Estado actual

Ver `content/notas/estado.md`.
