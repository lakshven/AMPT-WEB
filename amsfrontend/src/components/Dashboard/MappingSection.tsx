// components/Dashboard/MappingSection.tsx
import React, { useEffect, useState } from "react";
import MapView, { Asset } from "../common/MapView";
import RouteEditorSidebar from "./RouteEditorSidebar";
import axiosInstance from "../../utils/axiosInstance";

// Simple Haversine distance in km
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface MappingSectionProps {
  assets: Asset[];
}

const MappingSection: React.FC<MappingSectionProps> = ({ assets }) => {
  const [localAssets, setLocalAssets] = useState<Asset[]>(assets);
  const [loading, setLoading] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState<number | string | null>(null);

  // Sync DashboardPage → MappingSection
  useEffect(() => {
    setLocalAssets(assets);
  }, [assets]);

  // Load route assets from backend
  useEffect(() => {
    async function loadRouteAssets() {
      try {
        const res = await axiosInstance.get("/dashboard/route-assets");
        setLocalAssets(res.data.assets || []);
      } catch (err) {
        console.error("Failed to load route assets:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRouteAssets();
  }, []);

  // Refresh after saving / optimizing
  const refreshAssets = async () => {
    try {
      const res = await axiosInstance.get("/dashboard/route-assets");
      setLocalAssets(res.data.assets || []);
    } catch (err) {
      console.error("Failed to refresh route assets:", err);
    }
  };

  // Sort assets by route order
  const sortedAssets = [...localAssets].sort(
    (a, b) => Number(a.routeOrder ?? 0) - Number(b.routeOrder ?? 0)
  );

  // Distance calculations
  const distances: number[] = [];
  let totalDistance = 0;

  for (let i = 0; i < sortedAssets.length - 1; i++) {
    const a = sortedAssets[i];
    const b = sortedAssets[i + 1];

    if (a.latitude && a.longitude && b.latitude && b.longitude) {
      const d = haversineDistance(
        Number(a.latitude),
        Number(a.longitude),
        Number(b.latitude),
        Number(b.longitude)
      );
      distances.push(d);
      totalDistance += d;
    } else {
      distances.push(0);
    }
  }

  // Save route order
  const handleSaveRouteOrder = async () => {
    try {
      const payload = sortedAssets.map((a, index) => ({
        id: a.id,
        routeOrder: a.routeOrder ?? index + 1,
      }));

      await axiosInstance.post("/assets/update-route-order", { assets: payload });
      await refreshAssets();
    } catch (err) {
      console.error("Error saving route order:", err);
    }
  };

  // Optimize route
  const handleOptimizeRoute = async () => {
    try {
      const res = await axiosInstance.post("/assets/optimize-route", {
        assetIds: sortedAssets.map((a) => a.id),
      });

      setLocalAssets(res.data.assets || []);
    } catch (err) {
      console.error("Error optimizing route:", err);
    }
  };

  if (loading) {
    return (
      <div className="col-span-2 rounded shadow bg-white/80 p-4">
        <h2 className="text-xl text-black font-bold mb-4">ASSET LOCATIONS MAP</h2>
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* MAP SECTION */}
      <div className="md:col-span-2 rounded shadow bg-white/80 p-4">
        <h2 className="text-xl text-black font-bold mb-4">ASSET LOCATIONS MAP</h2>
        <div className="map-scope">
          <MapView
            assets={localAssets}
            selectedAssetId={selectedAssetId}
            setSelectedAssetId={setSelectedAssetId}
          />
        </div>
      </div>

      {/* ROUTE EDITOR SIDEBAR */}
      <RouteEditorSidebar
        assets={localAssets}
        selectedAssetId={selectedAssetId}
        setSelectedAssetId={setSelectedAssetId}
        distances={distances}
        totalDistance={totalDistance}
        onSave={handleSaveRouteOrder}
        onOptimize={handleOptimizeRoute}
      />
    </div>
  );
};

export default MappingSection;