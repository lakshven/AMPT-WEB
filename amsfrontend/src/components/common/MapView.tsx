import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// ⭐ Correct MarkerCluster imports (NO ERRORS)
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Asset type
export interface Asset {
  id?: number | string;
  structure_no?: string;
  structure_name?: string;
  location?: string;
  riskRating?: number | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  routeOrder?: number | string | null;
  [key: string]: any;
}

// Risk color
function getRiskColor(risk?: number | null) {
  if (!risk) return "text-blue-600";
  if (risk >= 5) return "text-red-700";
  if (risk === 4) return "text-orange-600";
  if (risk === 3) return "text-yellow-500";
  if (risk === 2) return "text-green-500";
  return "text-green-700";
}

// Marker icon with label
function getMarkerIcon(
  isSelected: boolean,
  risk?: number | null,
  label?: string
) {
  const colorClass = getRiskColor(risk);

  return L.divIcon({
    html: `
      <div style="text-align:center;">
        <i class="fas fa-map-marker-alt fa-lg ${
          isSelected ? `${colorClass} scale-150` : colorClass
        }"></i>
        <div style="font-size:10px; font-weight:bold; margin-top:-4px; color:#000;">
          ${label ?? ""}
        </div>
      </div>
    `,
    iconSize: [30, 45],
    className: "custom-marker",
  });
}

// FitBounds helper
interface FitBoundsProps {
  assets: Asset[];
}
function FitBounds({ assets }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    const coords = assets
      .filter((a) => a.latitude !== null && a.longitud !== null)
      .map(
        (a) => [Number(a.latitude), Number(a.longitude)] as [number, number]
      );

    if (coords.length === 0) {
      map.setView([0, 0], 2);
      return;
    }

    if (coords.length === 1) {
      map.setView(coords[0], 12);
      return;
    }

    map.fitBounds(coords, { padding: [50, 50] });
  }, [assets, map]);

  return null;
}

// MapView component
interface MapViewProps {
  assets: Asset[];
  selectedAssetId: number | string | null;
  setSelectedAssetId: (id: number | string | null) => void;
}

const MapView: React.FC<MapViewProps> = ({
  assets,
  selectedAssetId,
  setSelectedAssetId,
}) => {
  const [geoAssets, setGeoAssets] = useState<Asset[]>([]);

  useEffect(() => {
    setGeoAssets(
      assets
        .map((asset) => ({
          ...asset,
          latitude: Number(asset.latitude),
          longitude: Number(asset.longitude),
        }))
        .sort(
          (a, b) =>
            Number(a.routeOrder ?? 0) - Number(b.routeOrder ?? 0)
        )
    );
  }, [assets]);

  const defaultCenter: [number, number] = [0, 0];

  const routePoints: LatLngTuple[] = geoAssets
    .filter((a) => a.latitude !== null && a.longitude !== null)
    .map(
      (a) => [Number(a.latitude), Number(a.longitude)] as LatLngTuple
    );

  return (
    <div className="col-span-2 p-6 rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold text-blue-700 mb-4">
        Asset Locations Map
      </h2>

      <MapContainer
        center={defaultCenter}
        zoom={2}
        className="w-full h-[400px] rounded-lg border border-gray-200"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <FitBounds assets={geoAssets} />

        <ClusteredMarkers
          assets={geoAssets}
          selectedAssetId={selectedAssetId}
          setSelectedAssetId={setSelectedAssetId}
        />
      </MapContainer>
    </div>
  );
};

// ⭐ Clustered Markers Component
const ClusteredMarkers = ({
  assets,
  selectedAssetId,
  setSelectedAssetId,
}: {
  assets: Asset[];
  selectedAssetId: number | string | null;
  setSelectedAssetId: (id: number | string | null) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,

      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();

        let size = "small";
        if (count > 20) size = "large";
        else if (count > 10) size = "medium";

        return L.divIcon({
          html: `<div class="cluster-icon ${size}">${count}</div>`,
          className: "custom-cluster",
          iconSize: L.point(40, 40, true),
        });
      },
    });

    assets.forEach((asset) => {
      if (asset.latitude !== null && asset.longitude !== null) {
        const marker = L.marker(
          [asset.latitude as number, asset.longitude as number],
          {
            icon: getMarkerIcon(
              selectedAssetId === asset.id,
              asset.riskRating,
              asset.structure_no
            ),
          }
        );

        marker.on("click", () => setSelectedAssetId(asset.id!));

        marker.bindPopup(`
          <p class="text-gray-800 text-sm font-medium">
            <strong class="text-blue-600">${asset.structure_no}</strong><br/>
            ${asset.structure_name ?? ""}<br/>
            ${asset.location ?? ""}<br/>
            <span class="text-xs text-gray-500">
              Risk: ${asset.riskRating ?? "N/A"}
            </span>
          </p>
        `);

        clusterGroup.addLayer(marker);
      }
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [assets, selectedAssetId, setSelectedAssetId, map]);

  return null;
};

export default MapView;
