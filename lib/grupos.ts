// Etiquetas y orden visible para los `grupo` del frontmatter de personajes.
// Agregar nuevos grupos aquí para que aparezcan en sidebar y listado.

export const GRUPO_LABEL: Record<string, string> = {
  "dinastia-inca": "Dinastía Inca (Sapas pre-1532)",
  "neoincas-vilcabamba": "Neoincas de Vilcabamba",
  "capitanes-incas": "Capitanes y nobles incas",
  "mujeres-incas": "Mujeres incas y coyas",
  "mujeres-espanolas": "Mujeres españolas",
  "incas-colaboradores": "Incas colaboradores con los españoles",
  "aliados-indigenas": "Aliados indígenas (no incas)",
  "primeros-descubridores": "Primeros descubridores (1524–1528)",
  "hermanos-pizarro": "Hermanos Pizarro",
  "conquistadores": "Otros conquistadores",
  "autoridades-coloniales": "Virreyes y autoridades coloniales",
  "religiosos": "Religiosos",
  "interpretes-escribas": "Cronistas, intérpretes y escribanos",
  "sin-grupo": "Sin agrupar",
};

export const GRUPO_ORDEN = [
  "dinastia-inca",
  "neoincas-vilcabamba",
  "capitanes-incas",
  "mujeres-incas",
  "incas-colaboradores",
  "aliados-indigenas",
  "primeros-descubridores",
  "hermanos-pizarro",
  "conquistadores",
  "autoridades-coloniales",
  "religiosos",
  "interpretes-escribas",
  "mujeres-espanolas",
  "sin-grupo",
];

export interface Groupable {
  grupo?: string;
}

export function groupBy<T extends Groupable>(
  entries: T[]
): Array<{ key: string; label: string; items: T[] }> {
  const buckets: Record<string, T[]> = {};
  for (const e of entries) {
    const k = e.grupo || "sin-grupo";
    (buckets[k] ??= []).push(e);
  }
  const orderedKeys = [
    ...GRUPO_ORDEN.filter((k) => buckets[k]),
    ...Object.keys(buckets).filter((k) => !GRUPO_ORDEN.includes(k)),
  ];
  return orderedKeys.map((k) => ({
    key: k,
    label: GRUPO_LABEL[k] ?? k,
    items: buckets[k],
  }));
}
