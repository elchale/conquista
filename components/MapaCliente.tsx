"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, LayersControl, LayerGroup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Default icon fix for Leaflet+webpack
const DEFAULT_ICON = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Lugar {
  id: string;
  nombre: string;
  tipo: string;
  lat: number;
  lng: number;
  precision?: string;
  etnia?: string;
  altitud_m?: number;
  notas?: string;
}

interface RutaPunto {
  // Either references an existing lugar (renders polyline vertex + lugar marker),
  // or supplies intermediate lat/lng waypoints (polyline only, no marker).
  lugar_id?: string;
  lat?: number;
  lng?: number;
  via?: string;
  fecha?: string;
  evento?: string;
}

interface Ruta {
  id: string;
  nombre: string;
  color?: string;
  fechas?: string;
  descripcion?: string;
  puntos: RutaPunto[];
}

interface Props {
  data: {
    lugares: Lugar[];
    rutas: Ruta[];
  };
  selectedRouteId?: string | null;
  onSelectRoute?: (id: string | null) => void;
}

const ETNIA_COLOR: Record<string, string> = {
  incas: "#8b3a1f",
  huancas: "#b8860b",
  chachapoyas: "#3e6b5a",
  canaris: "#7a5f3c",
  tallanes: "#a8895a",
  chimu: "#54422a",
  collas: "#26200f",
  espanoles: "#000",
  "andes-vilcabamba": "#4a5d3c",
  "incas-quitenos": "#a04323",
};

export default function MapaCliente({
  data,
  selectedRouteId = null,
  onSelectRoute,
}: Props) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) {
    return (
      <div className="h-full w-full flex items-center justify-center text-ink-500">
        Cargando mapa…
      </div>
    );
  }

  const lugaresById = new Map(data.lugares.map((l) => [l.id, l]));

  return (
    <MapContainer
      key="conquista-mapa"
      center={[-10, -75.5]}
      zoom={6}
      style={{ height: "100%", width: "100%", minHeight: "400px" }}
      scrollWheelZoom
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OSM (estándar)">
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Stamen Terrain">
          <TileLayer
            attribution='© Stamen'
            url="https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="OpenTopoMap">
          <TileLayer
            attribution='© OpenTopoMap'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay checked name="Lugares">
          <LayerGroup>
            {data.lugares.map((l) => {
              const color = ETNIA_COLOR[l.etnia ?? ""] ?? "#444";
              return (
                <CircleMarker
                  key={l.id}
                  center={[l.lat, l.lng]}
                  radius={l.tipo === "capital" ? 9 : 6}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: l.precision === "aproximada" ? 0.35 : 0.75,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="font-serif">
                      <div className="font-semibold text-base">{l.nombre}</div>
                      <div className="text-xs text-gray-600 italic mb-1">
                        {l.tipo}
                        {l.etnia ? ` · ${l.etnia}` : ""}
                        {l.altitud_m ? ` · ${l.altitud_m} m` : ""}
                        {l.precision === "aproximada" ? " · coord. aprox." : ""}
                      </div>
                      {l.notas ? (
                        <p className="text-xs mb-2">{l.notas}</p>
                      ) : null}
                      <Link
                        href={`/lugares/${l.id}`}
                        className="text-xs text-amber-700 underline"
                      >
                        Abrir ficha →
                      </Link>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Rutas">
          <LayerGroup>
            {data.rutas.map((r) => {
              const positions = r.puntos
                .map((p): [number, number] | null => {
                  if (p.lugar_id) {
                    const lug = lugaresById.get(p.lugar_id);
                    return lug ? [lug.lat, lug.lng] : null;
                  }
                  if (typeof p.lat === "number" && typeof p.lng === "number") {
                    return [p.lat, p.lng];
                  }
                  return null;
                })
                .filter((p): p is [number, number] => p !== null);

              const isSelected = selectedRouteId === r.id;
              const isCapacNan = r.id.startsWith("capac-nan");
              // DEFAULT: nothing visible except Capac Ñan base.
              // Only the selected route renders prominently.
              const isHidden =
                !isCapacNan && selectedRouteId !== null && !isSelected;
              const isDefaultHidden =
                !isCapacNan && selectedRouteId === null;

              if (isHidden || isDefaultHidden) return null;

              return (
                <Polyline
                  key={r.id}
                  positions={positions}
                  eventHandlers={{
                    click: () => onSelectRoute?.(isSelected ? null : r.id),
                  }}
                  pathOptions={{
                    color: r.color ?? "#444",
                    weight: isSelected ? 5 : isCapacNan ? 2 : 3,
                    opacity: isCapacNan
                      ? selectedRouteId
                        ? 0.25
                        : 0.45
                      : 0.9,
                    dashArray: isCapacNan ? "2 6" : isSelected ? undefined : "6 4",
                  }}
                />
              );
            })}
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
}
