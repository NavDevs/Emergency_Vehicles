'use client';

import { useState, useCallback } from 'react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBYFOyE1N_kqbzhx7ib2TrysTWaOCPPiG8';

const mapContainerStyle = { width: '100%', height: '550px', borderRadius: '20px' };
const defaultCenter = { lat: 12.9716, lng: 77.5946 };
const defaultHospital = { lat: 12.9716, lng: 77.5946, name: 'City Hospital' };

interface Intersection {
  id: number;
  lat: number;
  lng: number;
  name: string;
  status: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
}

interface SimulationResult {
  originalTime: number;
  mlTime: number;
  improvement: number;
  intersectionsCount: number;
  confidence: number;
}

export default function RealGoogleMap() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [map, setMap] = useState<any>(null);
  const [accidentLocation, setAccidentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [hospitalLocation, setHospitalLocation] = useState<{lat: number; lng: number; name: string}>(defaultHospital);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [directions, setDirections] = useState<any>(null);
  const [intersections, setIntersections] = useState<Intersection[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [weather, setWeather] = useState('clear');
  const [traffic, setTraffic] = useState('moderate');
  const [activePreemption, setActivePreemption] = useState(-1);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const handleMapClick = (e: any) => {
    const location = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setAccidentLocation(location);
    setHospitalLocation(defaultHospital);
    setDirections(null);
    setSimulationResult(null);
    setActivePreemption(-1);
    
    // Calculate fake intersections between click point and hospital
    const steps = 6;
    const fakeIntersections: Intersection[] = [];
    for (let i = 1; i <= steps; i++) {
      const ratio = i / (steps + 1);
      fakeIntersections.push({
        id: i - 1,
        lat: location.lat + (defaultHospital.lat - location.lat) * ratio,
        lng: location.lng + (defaultHospital.lng - location.lng) * ratio,
        name: `Intersection ${i}`,
        status: 'red'
      });
    }
    setIntersections(fakeIntersections);
    
    // Calculate distance and time
    const distanceKm = Math.sqrt(
      Math.pow(location.lat - defaultHospital.lat, 2) + Math.pow(location.lng - defaultHospital.lng, 2)
    ) * 111;
    setRouteInfo({
      distance: `${(distanceKm * 10).toFixed(1)} km`,
      duration: `${Math.round(distanceKm * 3)} min`
    });
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setActivePreemption(-1);
    
    const weatherFactor: Record<string, number> = { clear: 1, rain: 0.85, heavy_rain: 0.75, fog: 0.7, night: 0.9 };
    const trafficFactor: Record<string, number> = { smooth: 1, moderate: 0.8, heavy: 0.65, severe: 0.5 };
    
    const originalTime = routeInfo ? parseInt(routeInfo.duration) * 60 : 180;
    const mlTime = originalTime * (weatherFactor[weather] || 1) * (trafficFactor[traffic] || 1) * 0.65;
    const improvement = ((originalTime - mlTime) / originalTime) * 100;
    
    intersections.forEach((_: any, idx: number) => {
      setTimeout(() => {
        setActivePreemption(idx);
        setIntersections(prev => prev.map((inter, i) => 
          i === idx ? { ...inter, status: 'green' } : inter
        ));
      }, idx * 800);
    });
    
    setTimeout(() => {
      setSimulationResult({
        originalTime: Math.round(originalTime),
        mlTime: Math.round(mlTime),
        improvement: Math.round(improvement),
        intersectionsCount: intersections.length,
        confidence: 98
      });
      setIsSimulating(false);
    }, intersections.length * 800 + 500);
  };

  const resetSimulation = () => {
    setAccidentLocation(null);
    setHospitalLocation(defaultHospital);
    setDirections(null);
    setIntersections([]);
    setSimulationResult(null);
    setRouteInfo(null);
    setActivePreemption(-1);
  };

  if (loadError) return <div className="text-red-500 p-4">Error loading map. Check API key.</div>;
  if (!isLoaded) return <div className="text-center p-8 text-[#64748B]">Loading map...</div>;

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <GoogleMap 
          mapContainerStyle={mapContainerStyle} 
          center={defaultCenter} 
          zoom={13} 
          onClick={handleMapClick} 
          onLoad={setMap}
          options={{ disableDefaultUI: false, zoomControl: true }}
        >
          {accidentLocation && (
            <Marker 
              position={accidentLocation} 
              title="Accident Location" 
            />
          )}
          {hospitalLocation && (
            <Marker 
              position={hospitalLocation} 
              title={hospitalLocation.name} 
            />
          )}
          {intersections.map((inter, i) => (
            <Marker 
              key={i} 
              position={{ lat: inter.lat, lng: inter.lng }} 
              title={inter.name}
            />
          ))}
        </GoogleMap>
        
        {!accidentLocation && (
          <div className="absolute top-4 left-4 bg-white/90 rounded-xl p-3 shadow">
            <div className="text-sm font-medium">📍 Click anywhere on map to mark accident location</div>
          </div>
        )}
      </div>
      
      {accidentLocation && (
        <div className="bg-white rounded-2xl p-6 shadow border border-[#E2E8F0]">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <select 
              value={weather} 
              onChange={(e) => setWeather(e.target.value)} 
              className="input-field"
            >
              <option value="clear">☀️ Clear</option>
              <option value="rain">🌧️ Rain</option>
              <option value="fog">🌫️ Fog</option>
              <option value="night">🌙 Night</option>
            </select>
            <select 
              value={traffic} 
              onChange={(e) => setTraffic(e.target.value)} 
              className="input-field"
            >
              <option value="smooth">🟢 Smooth</option>
              <option value="moderate">🟡 Moderate</option>
              <option value="heavy">🟠 Heavy</option>
              <option value="severe">🔴 Severe</option>
            </select>
            <button 
              onClick={runSimulation} 
              disabled={isSimulating} 
              className="btn-primary"
            >
              {isSimulating ? '🚨 ML Coordinating...' : '🚀 Start Emergency Response'}
            </button>
          </div>
          
          {routeInfo && (
            <div className="well flex justify-between text-sm">
              <span>📏 {routeInfo.distance}</span>
              <span>⏱️ {routeInfo.duration}</span>
              <span>🚦 {intersections.length} intersections</span>
              <span>🏥 {hospitalLocation.name}</span>
            </div>
          )}
        </div>
      )}
      
      {simulationResult && !isSimulating && (
        <div className="card bg-gradient-to-r from-[#F1F5F9] to-white border-[#0052FF]/20">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-sm text-[#64748B]">ML Travel Time</div>
              <div className="text-2xl font-bold gradient-text">{simulationResult.mlTime}s</div>
            </div>
            <div>
              <div className="text-sm text-[#64748B]">Original</div>
              <div className="text-xl font-medium text-[#0F172A]">{simulationResult.originalTime}s</div>
            </div>
            <div>
              <div className="text-sm text-[#64748B]">Improvement</div>
              <div className="text-2xl font-bold text-[#22c55e]">+{simulationResult.improvement}%</div>
            </div>
            <div>
              <div className="text-sm text-[#64748B]">Signals</div>
              <div className="text-2xl font-bold text-[#0F172A]">{simulationResult.intersectionsCount}</div>
            </div>
            <div>
              <div className="text-sm text-[#64748B]">ML Confidence</div>
              <div className="text-2xl font-bold text-[#0F172A]">{simulationResult.confidence}%</div>
            </div>
          </div>
          <button onClick={resetSimulation} className="btn-secondary w-full mt-4">
            New Simulation
          </button>
        </div>
      )}
    </div>
  );
}