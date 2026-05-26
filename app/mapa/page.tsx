import lugaresData from "@/content/data/lugares.json";
import MapaWrapper from "@/components/MapaWrapper";

interface MapData {
  lugares: Array<{
    id: string;
    nombre: string;
    tipo: string;
    lat: number;
    lng: number;
    precision?: string;
    etnia?: string;
    altitud_m?: number;
    notas?: string;
  }>;
  rutas: Array<{
    id: string;
    nombre: string;
    color?: string;
    fechas?: string;
    puntos: Array<{ lugar_id: string; fecha?: string; evento?: string }>;
  }>;
}

export default function MapaPage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="px-6 py-3 border-b border-ink-200 bg-ink-100/70">
        <h1 className="font-serif text-xl font-semibold text-ink-900">Mapa</h1>
        <p className="text-xs text-ink-500">
          Pueblos, ciudades y travesías citadas en las fuentes. Click en un
          marcador para ir al lugar.
        </p>
      </header>
      <div className="flex-1 min-h-0">
        <MapaWrapper data={lugaresData as unknown as MapData} />
      </div>
    </div>
  );
}
