'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Pre-installed road layouts
const PRE_INSTALLED_LAYOUTS = {
  'cross': {
    name: '➕ Cross Intersection',
    description: '4-way intersection with traffic lights',
    intersections: [
      { id: 'I1', x: 0, y: 0, name: 'Center', roads: ['N', 'S', 'E', 'W'] },
      { id: 'I2', x: 200, y: 0, name: 'East', roads: ['W', 'E'] },
      { id: 'I3', x: -200, y: 0, name: 'West', roads: ['W', 'E'] },
      { id: 'I4', x: 0, y: 200, name: 'North', roads: ['N', 'S'] },
      { id: 'I5', x: 0, y: -200, name: 'South', roads: ['N', 'S'] }
    ],
    roads: [
      { from: 'I3', to: 'I1', distance: 200 },
      { from: 'I1', to: 'I2', distance: 200 },
      { from: 'I4', to: 'I1', distance: 200 },
      { from: 'I1', to: 'I5', distance: 200 }
    ]
  },
  
  'tjunction': {
    name: '🔀 T-Junction',
    description: '3-way intersection',
    intersections: [
      { id: 'I1', x: 0, y: 0, name: 'Junction', roads: ['N', 'S', 'E'] },
      { id: 'I2', x: 200, y: 0, name: 'East', roads: ['W', 'E'] },
      { id: 'I3', x: 0, y: 200, name: 'North', roads: ['N', 'S'] },
      { id: 'I4', x: 0, y: -200, name: 'South', roads: ['N', 'S'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 200 },
      { from: 'I1', to: 'I3', distance: 200 },
      { from: 'I1', to: 'I4', distance: 200 }
    ]
  },
  
  'roundabout': {
    name: '🔄 Roundabout',
    description: 'Circular intersection with 4 entries',
    intersections: [
      { id: 'I1', x: 0, y: 0, name: 'Roundabout Center', roads: ['Circle'] },
      { id: 'I2', x: 150, y: 0, name: 'East Entry', roads: ['W', 'E'] },
      { id: 'I3', x: -150, y: 0, name: 'West Entry', roads: ['W', 'E'] },
      { id: 'I4', x: 0, y: 150, name: 'North Entry', roads: ['N', 'S'] },
      { id: 'I5', x: 0, y: -150, name: 'South Entry', roads: ['N', 'S'] }
    ],
    roads: [
      { from: 'I2', to: 'I1', distance: 150 },
      { from: 'I3', to: 'I1', distance: 150 },
      { from: 'I4', to: 'I1', distance: 150 },
      { from: 'I5', to: 'I1', distance: 150 }
    ]
  },
  
  'highway': {
    name: '🛣️ Highway',
    description: 'Straight road with 4 intersections',
    intersections: [
      { id: 'I1', x: -300, y: 0, name: 'Entry', roads: ['E', 'W'] },
      { id: 'I2', x: -100, y: 0, name: 'Intersection 1', roads: ['E', 'W'] },
      { id: 'I3', x: 100, y: 0, name: 'Intersection 2', roads: ['E', 'W'] },
      { id: 'I4', x: 300, y: 0, name: 'Exit', roads: ['E', 'W'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 200 },
      { from: 'I2', to: 'I3', distance: 200 },
      { from: 'I3', to: 'I4', distance: 200 }
    ]
  },
  
  'grid': {
    name: '🔲 Grid Network (Original)',
    description: '2x2 grid with 4 intersections',
    intersections: [
      { id: 'I1', x: -100, y: 100, name: 'I1', roads: ['E', 'S', 'W', 'N'] },
      { id: 'I2', x: 100, y: 100, name: 'I2', roads: ['W', 'S', 'E', 'N'] },
      { id: 'I3', x: -100, y: -100, name: 'I3', roads: ['E', 'N', 'W', 'S'] },
      { id: 'I4', x: 100, y: -100, name: 'I4', roads: ['W', 'N', 'E', 'S'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 200 },
      { from: 'I1', to: 'I3', distance: 200 },
      { from: 'I2', to: 'I4', distance: 200 },
      { from: 'I3', to: 'I4', distance: 200 }
    ]
  },
  
  'diamond': {
    name: '💎 Diamond Interchange',
    description: 'Diamond-shaped highway interchange',
    intersections: [
      { id: 'I1', x: 0, y: 0, name: 'Main', roads: ['N', 'S', 'E', 'W'] },
      { id: 'I2', x: 150, y: 100, name: 'NE', roads: ['W', 'S'] },
      { id: 'I3', x: 150, y: -100, name: 'SE', roads: ['W', 'N'] },
      { id: 'I4', x: -150, y: 100, name: 'NW', roads: ['E', 'S'] },
      { id: 'I5', x: -150, y: -100, name: 'SW', roads: ['E', 'N'] }
    ],
    roads: [
      { from: 'I4', to: 'I1', distance: 180 },
      { from: 'I1', to: 'I2', distance: 180 },
      { from: 'I5', to: 'I1', distance: 180 },
      { from: 'I1', to: 'I3', distance: 180 }
    ]
  },
  
  'corridor': {
    name: '🏢 Urban Corridor',
    description: 'Long corridor with multiple cross streets',
    intersections: [
      { id: 'I1', x: -300, y: 0, name: 'Start', roads: ['E', 'W'] },
      { id: 'I2', x: -150, y: 0, name: 'Cross 1', roads: ['N', 'S', 'E', 'W'] },
      { id: 'I3', x: 0, y: 0, name: 'Main', roads: ['N', 'S', 'E', 'W'] },
      { id: 'I4', x: 150, y: 0, name: 'Cross 2', roads: ['N', 'S', 'E', 'W'] },
      { id: 'I5', x: 300, y: 0, name: 'End', roads: ['E', 'W'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 150 },
      { from: 'I2', to: 'I3', distance: 150 },
      { from: 'I3', to: 'I4', distance: 150 },
      { from: 'I4', to: 'I5', distance: 150 }
    ]
  },
  
  'triangle': {
    name: '🔺 Triangle Network',
    description: 'Triangular 3-intersection layout',
    intersections: [
      { id: 'I1', x: 0, y: 150, name: 'Top', roads: ['S', 'SE', 'SW'] },
      { id: 'I2', x: -150, y: -50, name: 'Left', roads: ['E', 'NE', 'SE'] },
      { id: 'I3', x: 150, y: -50, name: 'Right', roads: ['W', 'NW', 'SW'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 220 },
      { from: 'I2', to: 'I3', distance: 300 },
      { from: 'I3', to: 'I1', distance: 220 }
    ]
  },
  
  'lshape': {
    name: '📐 L-Shape Route',
    description: 'L-shaped corner with 3 intersections',
    intersections: [
      { id: 'I1', x: -200, y: 100, name: 'Start', roads: ['E', 'W'] },
      { id: 'I2', x: 0, y: 100, name: 'Corner', roads: ['N', 'S', 'E', 'W'] },
      { id: 'I3', x: 0, y: -100, name: 'End', roads: ['N', 'S'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 200 },
      { from: 'I2', to: 'I3', distance: 200 }
    ]
  },
  
  'hospital': {
    name: '🏥 Hospital Zone',
    description: 'Hospital emergency route with 3 signals',
    intersections: [
      { id: 'I1', x: -200, y: 0, name: 'Entry', roads: ['E', 'W'] },
      { id: 'I2', x: 0, y: 0, name: 'Main Gate', roads: ['N', 'S', 'E', 'W'] },
      { id: 'I3', x: 200, y: 0, name: 'Emergency', roads: ['E', 'W'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 200 },
      { from: 'I2', to: 'I3', distance: 200 }
    ]
  },
  
  'citycenter': {
    name: '🏙️ City Center',
    description: 'Dense urban 3x3 grid',
    intersections: [
      { id: 'I1', x: -150, y: 150, name: 'NW', roads: ['E', 'S'] },
      { id: 'I2', x: 0, y: 150, name: 'N', roads: ['E', 'S', 'W'] },
      { id: 'I3', x: 150, y: 150, name: 'NE', roads: ['S', 'W'] },
      { id: 'I4', x: -150, y: 0, name: 'W', roads: ['N', 'E', 'S'] },
      { id: 'I5', x: 0, y: 0, name: 'Center', roads: ['N', 'S', 'E', 'W'] },
      { id: 'I6', x: 150, y: 0, name: 'E', roads: ['N', 'S', 'W'] },
      { id: 'I7', x: -150, y: -150, name: 'SW', roads: ['N', 'E'] },
      { id: 'I8', x: 0, y: -150, name: 'S', roads: ['N', 'E', 'W'] },
      { id: 'I9', x: 150, y: -150, name: 'SE', roads: ['N', 'W'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 150 },
      { from: 'I2', to: 'I3', distance: 150 },
      { from: 'I1', to: 'I4', distance: 150 },
      { from: 'I2', to: 'I5', distance: 150 },
      { from: 'I3', to: 'I6', distance: 150 },
      { from: 'I4', to: 'I5', distance: 150 },
      { from: 'I5', to: 'I6', distance: 150 },
      { from: 'I4', to: 'I7', distance: 150 },
      { from: 'I5', to: 'I8', distance: 150 },
      { from: 'I6', to: 'I9', distance: 150 },
      { from: 'I7', to: 'I8', distance: 150 },
      { from: 'I8', to: 'I9', distance: 150 }
    ]
  },
  
  'yjunction': {
    name: '🌿 Y-Junction',
    description: 'Three-way split junction',
    intersections: [
      { id: 'I1', x: 0, y: 200, name: 'Base', roads: ['S'] },
      { id: 'I2', x: 0, y: 0, name: 'Split', roads: ['N', 'SE', 'SW'] },
      { id: 'I3', x: -173, y: -100, name: 'Left', roads: ['NE'] },
      { id: 'I4', x: 173, y: -100, name: 'Right', roads: ['NW'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 200 },
      { from: 'I2', to: 'I3', distance: 200 },
      { from: 'I2', to: 'I4', distance: 200 }
    ]
  },
  
  'star': {
    name: '⭐ Star Junction',
    description: 'Central hub with 5 radiating roads',
    intersections: [
      { id: 'I1', x: 0, y: 0, name: 'Hub', roads: ['N', 'NE', 'SE', 'SW', 'NW'] },
      { id: 'I2', x: 0, y: 200, name: 'North', roads: ['S'] },
      { id: 'I3', x: 190, y: 62, name: 'NE', roads: ['SW'] },
      { id: 'I4', x: 118, y: -162, name: 'SE', roads: ['NW'] },
      { id: 'I5', x: -118, y: -162, name: 'SW', roads: ['NE'] },
      { id: 'I6', x: -190, y: 62, name: 'NW', roads: ['SE'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 200 },
      { from: 'I1', to: 'I3', distance: 200 },
      { from: 'I1', to: 'I4', distance: 200 },
      { from: 'I1', to: 'I5', distance: 200 },
      { from: 'I1', to: 'I6', distance: 200 }
    ]
  },
  
  'bridge': {
    name: '🌉 River Bridge',
    description: 'Crossing over river with approach roads',
    intersections: [
      { id: 'I1', x: -250, y: 50, name: 'West Bank', roads: ['E'] },
      { id: 'I2', x: -100, y: 0, name: 'West Ramp', roads: ['E', 'W'] },
      { id: 'I3', x: 0, y: 0, name: 'Bridge Center', roads: ['E', 'W'] },
      { id: 'I4', x: 100, y: 0, name: 'East Ramp', roads: ['E', 'W'] },
      { id: 'I5', x: 250, y: 50, name: 'East Bank', roads: ['W'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 150 },
      { from: 'I2', to: 'I3', distance: 100 },
      { from: 'I3', to: 'I4', distance: 100 },
      { from: 'I4', to: 'I5', distance: 150 }
    ]
  },
  
  'industrial': {
    name: '🏭 Industrial Zone',
    description: 'Heavy truck route with wide roads',
    intersections: [
      { id: 'I1', x: -200, y: 100, name: 'Factory A', roads: ['S', 'E'] },
      { id: 'I2', x: 0, y: 100, name: 'Warehouse', roads: ['W', 'E', 'S'] },
      { id: 'I3', x: 200, y: 100, name: 'Factory B', roads: ['W', 'S'] },
      { id: 'I4', x: -200, y: -100, name: 'Loading Dock', roads: ['N', 'E'] },
      { id: 'I5', x: 0, y: -100, name: 'Main Gate', roads: ['W', 'E', 'N'] },
      { id: 'I6', x: 200, y: -100, name: 'Exit', roads: ['W', 'N'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 200 },
      { from: 'I2', to: 'I3', distance: 200 },
      { from: 'I1', to: 'I4', distance: 200 },
      { from: 'I2', to: 'I5', distance: 200 },
      { from: 'I3', to: 'I6', distance: 200 },
      { from: 'I4', to: 'I5', distance: 200 },
      { from: 'I5', to: 'I6', distance: 200 }
    ]
  },
  
  'campus': {
    name: '🎓 University Campus',
    description: 'Educational complex loop road',
    intersections: [
      { id: 'I1', x: -150, y: 100, name: 'Main Gate', roads: ['E', 'S'] },
      { id: 'I2', x: 0, y: 100, name: 'Library', roads: ['W', 'E', 'S'] },
      { id: 'I3', x: 150, y: 100, name: 'Science Bldg', roads: ['W', 'S'] },
      { id: 'I4', x: 150, y: -100, name: 'Dorms', roads: ['N', 'W'] },
      { id: 'I5', x: 0, y: -100, name: 'Student Center', roads: ['E', 'W', 'N'] },
      { id: 'I6', x: -150, y: -100, name: 'Parking', roads: ['E', 'N'] }
    ],
    roads: [
      { from: 'I1', to: 'I2', distance: 150 },
      { from: 'I2', to: 'I3', distance: 150 },
      { from: 'I3', to: 'I4', distance: 200 },
      { from: 'I4', to: 'I5', distance: 150 },
      { from: 'I5', to: 'I6', distance: 150 },
      { from: 'I6', to: 'I1', distance: 200 }
    ]
  }
};

interface RoadLayoutBuilderProps {
  onRunSimulation: (layout: any, startPoint: string, endPoint: string, conditions: any) => void;
  isSimulating: boolean;
}

const MIN_DISTANCE = 50;

const RoadLayoutBuilder = ({ 
  onRunSimulation, 
  isSimulating
}: RoadLayoutBuilderProps) => {
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const [startPoint, setStartPoint] = useState('I1');
  const [endPoint, setEndPoint] = useState('I4');
  const [weather, setWeather] = useState('clear');
  const [traffic, setTraffic] = useState('moderate');
  const [criticality, setCriticality] = useState('normal');
  const [vehiclePosition, setVehiclePosition] = useState<{x: number, y: number, rotation: number} | null>(null);
  const [signalStates, setSignalStates] = useState<Record<string, {north: string, south: string, east: string, west: string}>>({});  
  const [vehicleTrail, setVehicleTrail] = useState<{x: number, y: number}[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  const currentLayout = PRE_INSTALLED_LAYOUTS[selectedLayout as keyof typeof PRE_INSTALLED_LAYOUTS];
  
  // Reset selection when changing layouts
  useEffect(() => {
    setStartPoint('I1');
    setEndPoint(currentLayout.intersections[currentLayout.intersections.length - 1]?.id || 'I4');
  }, [selectedLayout]);
  
  const getLayoutIntersections = () => {
    return currentLayout.intersections;
  };
  
  const getLayoutRoads = () => {
    return currentLayout.roads;
  };
  
  const handleRun = () => {
    // Start animation
    animateVehicle();
    
    onRunSimulation(currentLayout, startPoint, endPoint, {
      weather,
      traffic,
      criticality
    });
  };
  
  // Animate emergency vehicle through intersections
  const animateVehicle = () => {
    const intersections = currentLayout.intersections;
    const roads = currentLayout.roads;
    
    if (!intersections || intersections.length === 0) return;
    
    // Find logical path through road network
    const pathIds = findPathThroughRoads(startPoint, endPoint, intersections, roads);
    
    // Generate detailed path points
    const detailedPath = generateDetailedPath(pathIds, intersections);
    
    // Clear trail at start
    setVehicleTrail([]);
    
    // Animate vehicle movement along the path
    detailedPath.forEach((point: {x: number, y: number}, index: number) => {
      setTimeout(() => {
        // Calculate rotation based on movement direction
        const prevPoint = index > 0 ? detailedPath[index - 1] : point;
        const dx = point.x - prevPoint.x;
        const dy = point.y - prevPoint.y;
        const rotation = Math.atan2(dy, dx) * (180 / Math.PI);
        
        setVehiclePosition({ x: point.x, y: point.y, rotation });
        
        // Add to trail (keep last 30 points)
        setVehicleTrail(prev => {
          const newTrail = [...prev, { x: point.x, y: point.y }];
          return newTrail.slice(-30);
        });
        
        // Change signal to green when vehicle approaches intersection
        const nearbyInter = intersections.find((i: any) => 
          Math.abs(i.x - point.x) < 100 && Math.abs(i.y - point.y) < 100
        );
        
        if (nearbyInter) {
          // ML Logic: Determine direction vehicle is coming from using accurate heading
          const heading = rotation; // Already calculated in degrees
          let direction = 'north';
          let confidence = 0.95;
          
          // Map heading to approach direction (0° = East in canvas, but we want compass directions)
          // Heading: 0° = East, 90° = South, 180° = West, 270° = North
          // Approach direction: where vehicle is coming FROM
          if (heading >= 315 || heading < 45) {
            direction = 'west'; // Moving East, coming from West
          } else if (heading >= 45 && heading < 135) {
            direction = 'north'; // Moving South, coming from North
          } else if (heading >= 135 && heading < 225) {
            direction = 'east'; // Moving West, coming from East
          } else {
            direction = 'south'; // Moving North, coming from South
          }
          
          // First, set yellow phase for vehicle direction (more realistic)
          setSignalStates((prev: Record<string, {north: string, south: string, east: string, west: string}>) => ({
            ...prev,
            [nearbyInter.id]: {
              north: direction === 'north' ? 'yellow' : 'red',
              south: direction === 'south' ? 'yellow' : 'red',
              east: direction === 'east' ? 'yellow' : 'red',
              west: direction === 'west' ? 'yellow' : 'red'
            }
          }));
          
          // Then switch to green after yellow phase
          setTimeout(() => {
            setSignalStates((prev: Record<string, {north: string, south: string, east: string, west: string}>) => ({
              ...prev,
              [nearbyInter.id]: {
                north: direction === 'north' ? 'green' : 'red',
                south: direction === 'south' ? 'green' : 'red',
                east: direction === 'east' ? 'green' : 'red',
                west: direction === 'west' ? 'green' : 'red'
              }
            }));
          }, 400); // Yellow phase duration
          
          // Reset signal after vehicle passes
          setTimeout(() => {
            setSignalStates((prev: Record<string, {north: string, south: string, east: string, west: string}>) => ({
              ...prev,
              [nearbyInter.id]: { north: 'red', south: 'red', east: 'red', west: 'red' }
            }));
          }, 1800);
        }
      }, index * 100); // Faster for smoother animation
    });
    
    // Clear vehicle after animation
    setTimeout(() => {
      setVehiclePosition(null);
      setVehicleTrail([]);
      setSignalStates({});
    }, detailedPath.length * 100 + 500);
  };
  
  // Find path through road network using BFS
  const findPathThroughRoads = (startId: string, endId: string, intersections: any[], roads: any[]) => {
    // Build adjacency list from roads
    const adjacency: Record<string, string[]> = {};
    intersections.forEach(inter => {
      adjacency[inter.id] = [];
    });
    
    roads.forEach(road => {
      adjacency[road.from].push(road.to);
      adjacency[road.to].push(road.from);
    });
    
    // BFS to find shortest path
    const queue: {id: string, path: string[]}[] = [{id: startId, path: [startId]}];
    const visited = new Set<string>([startId]);
    
    while (queue.length > 0) {
      const {id, path} = queue.shift()!;
      
      if (id === endId) {
        return path;
      }
      
      for (const neighbor of adjacency[id]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({id: neighbor, path: [...path, neighbor]});
        }
      }
    }
    
    return [startId, endId]; // Fallback if no path found
  };
  
  // Generate detailed path points along roads
  const generateDetailedPath = (intersectionIds: string[], intersections: any[]) => {
    const detailedPath: {x: number, y: number}[] = [];
    
    for (let i = 0; i < intersectionIds.length - 1; i++) {
      const current = intersections.find(inter => inter.id === intersectionIds[i]);
      const next = intersections.find(inter => inter.id === intersectionIds[i + 1]);
      
      if (current && next) {
        // Generate points along the road segment
        const steps = 15; // More points for smoother animation
        for (let j = 0; j <= steps; j++) {
          const ratio = j / steps;
          // Add some curve for more natural movement
          const ease = ratio < 0.5 ? 2 * ratio * ratio : 1 - Math.pow(-2 * ratio + 2, 2) / 2;
          detailedPath.push({
            x: current.x + (next.x - current.x) * ease,
            y: current.y + (next.y - current.y) * ease
          });
        }
      }
    }
    
    return detailedPath;
  };
  
  // Calculate average travel time
  const calculateTravelTime = (intersectionsCount: number) => {
    const weatherMultipliers: Record<string, number> = {
      clear: 1.0,
      rain: 0.85,
      fog: 0.75,
      night: 0.9
    };
    
    const trafficMultipliers: Record<string, number> = {
      smooth: 1.0,
      moderate: 0.8,
      heavy: 0.65,
      severe: 0.5
    };
    
    const baseTime = intersectionsCount * 45;
    const originalTime = intersectionsCount * 60;
    
    return {
      travelTime: baseTime * (weatherMultipliers[weather] || 1.0) * (trafficMultipliers[traffic] || 1.0),
      originalTime: originalTime * (weatherMultipliers[weather] || 1.0) * (trafficMultipliers[traffic] || 1.0)
    };
  };

  return (
    <div className="space-y-6">
      {/* Layout Selection */}
        <div className="card">
          <h3 className="font-display text-xl text-[#0F172A] mb-6">🗺️ Select Layout</h3>
          
          {/* Dropdown Menu */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#64748B] mb-2">Choose a road layout</label>
            <div className="relative">
              <select
                value={selectedLayout}
                onChange={(e) => {
                  const key = e.target.value;
                  setSelectedLayout(key);
                  const layout = PRE_INSTALLED_LAYOUTS[key as keyof typeof PRE_INSTALLED_LAYOUTS];
                  setStartPoint(layout.intersections[0]?.id || 'I1');
                  setEndPoint(layout.intersections[layout.intersections.length - 1]?.id || 'I4');
                }}
                className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium appearance-none cursor-pointer hover:border-[#0052FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
              >
                {Object.entries(PRE_INSTALLED_LAYOUTS).map(([key, layout]) => (
                  <option key={key} value={key}>
                    {layout.name}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-[#64748B] mt-2">
              {currentLayout.description} • {currentLayout.intersections.length} intersections
            </p>
          </div>
          
          {/* Visual Layout Preview */}
          <div className="well mb-6">
            <div className="text-sm text-[#64748B] mb-3">Layout Preview:</div>
            <div className="relative h-96 bg-[#F1F5F9] rounded-lg overflow-hidden border border-[#E2E8F0]">
              <svg viewBox="-500 -300 1200 700" className="w-full h-full">
                {/* Roads */}
                {currentLayout.roads.map((road, idx) => {
                  const from = currentLayout.intersections.find(i => i.id === road.from);
                  const to = currentLayout.intersections.find(i => i.id === road.to);
                  if (!from || !to) return null;
                  
                  // Calculate road direction for lane markings
                  const dx = to.x - from.x;
                  const dy = to.y - from.y;
                  const length = Math.sqrt(dx * dx + dy * dy);
                  const unitX = dx / length;
                  const unitY = dy / length;
                  const perpX = -unitY * 4;
                  const perpY = unitX * 4;
                  
                  return (
                    <g key={idx}>
                      {/* Main road */}
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="#475569"
                        strokeWidth="24"
                        strokeLinecap="round"
                      />
                      
                      {/* Road surface */}
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="#64748b"
                        strokeWidth="18"
                        strokeLinecap="round"
                      />
                      
                      {/* Lane divider (dashed line) */}
                      <line
                        x1={from.x + 15}
                        y1={from.y + 15}
                        x2={to.x + 15}
                        y2={to.y + 15}
                        stroke="#fbbf24"
                        strokeWidth="3"
                        strokeDasharray="12,12"
                        strokeLinecap="round"
                        opacity="0.6"
                      />
                      
                      {/* Road edges */}
                      <line
                        x1={from.x + perpX * 1.5}
                        y1={from.y + perpY * 1.5}
                        x2={to.x + perpX * 1.5}
                        y2={to.y + perpY * 1.5}
                        stroke="#ffffff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                      <line
                        x1={from.x - perpX * 1.5}
                        y1={from.y - perpY * 1.5}
                        x2={to.x - perpX * 1.5}
                        y2={to.y - perpY * 1.5}
                        stroke="#ffffff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                    </g>
                  );
                })}
                {/* Traffic Signals - R/G/Y lights for each direction */}
                {currentLayout.intersections.map((inter) => {
                  const signals = signalStates[inter.id] || { north: 'red', south: 'red', east: 'red', west: 'red' };
                  return (
                    <g key={`signal-${inter.id}`}>
                      {/* North signal */}
                      <g transform={`translate(${inter.x - 50}, ${inter.y - 75})`}>
                        <rect x={0} y={0} width={18} height={45} rx={5} fill="#1f2937" stroke="#374151" strokeWidth={3}/>
                        <circle cx={9} cy={9} r={6} fill={signals.north === 'red' ? '#ef4444' : '#7f1d1d'} className="transition-all duration-300"/>
                        <circle cx={9} cy={22} r={6} fill={signals.north === 'yellow' ? '#fbbf24' : '#78350f'} className="transition-all duration-300"/>
                        <circle cx={9} cy={36} r={6} fill={signals.north === 'green' ? '#22c55e' : '#14532d'} className="transition-all duration-300"/>
                      </g>
                      
                      {/* South signal */}
                      <g transform={`translate(${inter.x + 32}, ${inter.y + 30})`}>
                        <rect x={0} y={0} width={18} height={45} rx={5} fill="#1f2937" stroke="#374151" strokeWidth={3}/>
                        <circle cx={9} cy={9} r={6} fill={signals.south === 'red' ? '#ef4444' : '#7f1d1d'} className="transition-all duration-300"/>
                        <circle cx={9} cy={22} r={6} fill={signals.south === 'yellow' ? '#fbbf24' : '#78350f'} className="transition-all duration-300"/>
                        <circle cx={9} cy={36} r={6} fill={signals.south === 'green' ? '#22c55e' : '#14532d'} className="transition-all duration-300"/>
                      </g>
                      
                      {/* East signal */}
                      <g transform={`translate(${inter.x + 30}, ${inter.y - 50})`}>
                        <rect x={0} y={0} width={18} height={45} rx={5} fill="#1f2937" stroke="#374151" strokeWidth={3}/>
                        <circle cx={9} cy={9} r={6} fill={signals.east === 'red' ? '#ef4444' : '#7f1d1d'} className="transition-all duration-300"/>
                        <circle cx={9} cy={22} r={6} fill={signals.east === 'yellow' ? '#fbbf24' : '#78350f'} className="transition-all duration-300"/>
                        <circle cx={9} cy={36} r={6} fill={signals.east === 'green' ? '#22c55e' : '#14532d'} className="transition-all duration-300"/>
                      </g>
                      
                      {/* West signal */}
                      <g transform={`translate(${inter.x - 48}, ${inter.y + 5})`}>
                        <rect x={0} y={0} width={18} height={45} rx={5} fill="#1f2937" stroke="#374151" strokeWidth={3}/>
                        <circle cx={9} cy={9} r={6} fill={signals.west === 'red' ? '#ef4444' : '#7f1d1d'} className="transition-all duration-300"/>
                        <circle cx={9} cy={22} r={6} fill={signals.west === 'yellow' ? '#fbbf24' : '#78350f'} className="transition-all duration-300"/>
                        <circle cx={9} cy={36} r={6} fill={signals.west === 'green' ? '#22c55e' : '#14532d'} className="transition-all duration-300"/>
                      </g>
                    </g>
                  );
                })}
                
                {/* Vehicle Trail */}
                {vehicleTrail.length > 1 && (
                  <polyline
                    points={vehicleTrail.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.3}
                    style={{ transition: 'all 0.1s ease-out' }}
                  />
                )}
                
                {/* Emergency Vehicle */}
                {vehiclePosition && (
                  <g 
                    transform={`translate(${vehiclePosition.x}, ${vehiclePosition.y}) rotate(${vehiclePosition.rotation || 0})`}
                    style={{ transition: 'transform 0.1s ease-out' }}
                  >
                    {/* Siren lights effect */}
                    <defs>
                      <radialGradient id="sirenGlow">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="1"/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                      </radialGradient>
                      <radialGradient id="sirenGlowBlue">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="1"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                      </radialGradient>
                    </defs>
                    
                    {/* Massive siren glow effects */}
                    <circle 
                      cx={-20} 
                      cy={-30} 
                      r={65} 
                      fill="url(#sirenGlow)" 
                      className="animate-ping"
                    />
                    <circle 
                      cx={20} 
                      cy={-30} 
                      r={65} 
                      fill="url(#sirenGlowBlue)" 
                      className="animate-ping"
                      style={{animationDelay: '0.3s'}}
                    />
                    
                    {/* Vehicle body - massive ambulance */}
                    <rect 
                      x={-52} 
                      y={-30} 
                      width={105} 
                      height={60} 
                      rx={12} 
                      fill="#dc2626" 
                      stroke="white" 
                      strokeWidth={5}
                      className="shadow-2xl"
                    />
                    
                    {/* Vehicle windows */}
                    <rect 
                      x={-42} 
                      y={-22} 
                      width={30} 
                      height={20} 
                      rx={4} 
                      fill="#93c5fd"
                      stroke="white"
                      strokeWidth={3}
                    />
                    <rect 
                      x={12} 
                      y={-22} 
                      width={30} 
                      height={20} 
                      rx={4} 
                      fill="#93c5fd"
                      stroke="white"
                      strokeWidth={3}
                    />
                    
                    {/* Large siren lights on roof */}
                    <rect 
                      x={-28} 
                      y={-42} 
                      width={20} 
                      height={16} 
                      rx={4} 
                      fill="#1f2937"
                      stroke="white"
                      strokeWidth={3}
                    />
                    <circle 
                      cx={-18} 
                      cy={-34} 
                      r={5} 
                      fill="#ef4444" 
                      stroke="white" 
                      strokeWidth={2}
                      className="animate-pulse"
                    />
                    
                    <rect 
                      x={8} 
                      y={-42} 
                      width={20} 
                      height={16} 
                      rx={4} 
                      fill="#1f2937"
                      stroke="white"
                      strokeWidth={3}
                    />
                    <circle 
                      cx={18} 
                      cy={-34} 
                      r={5} 
                      fill="#3b82f6" 
                      stroke="white" 
                      strokeWidth={2}
                      className="animate-pulse"
                      style={{animationDelay: '0.2s'}}
                    />
                    
                    {/* Large emergency cross */}
                    <text 
                      x={0} 
                      y={15} 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize={42} 
                      fontWeight="bold"
                      stroke="#dc2626"
                      strokeWidth={1}
                    >
                      +
                    </text>
                    
                    {/* AMBULANCE text */}
                    <text 
                      x={0} 
                      y={12} 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize={14} 
                      fontWeight="bold"
                    >
                      AMBULANCE
                    </text>
                  </g>
                )}
                
                {/* Intersections */}
                {currentLayout.intersections.map((inter) => (
                  <g key={inter.id}>
                    <circle 
                      cx={inter.x} 
                      cy={inter.y} 
                      r={28} 
                      fill="#6C63FF" 
                      stroke="white" 
                      strokeWidth="5" 
                      className="cursor-pointer"
                    />
                    <text 
                      x={inter.x} 
                      y={inter.y + 10} 
                      textAnchor="middle" 
                      fill="#ffffff" 
                      fontSize="22" 
                      fontWeight="bold"
                    >
                      {inter.id}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="text-xs text-center text-gray-500 mt-2">
              {currentLayout.intersections.length} intersections • {currentLayout.roads.length} roads
            </div>
          </div>
          
          {/* Start/End Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">🚑 Start Point</label>
              <select
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                className="input-field"
              >
                {currentLayout.intersections.map((inter) => (
                  <option key={inter.id} value={inter.id}>
                    {inter.id} - {inter.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">🏥 Destination</label>
              <select
                value={endPoint}
                onChange={(e) => setEndPoint(e.target.value)}
                className="input-field"
              >
                {currentLayout.intersections.map((inter) => (
                  <option key={inter.id} value={inter.id}>
                    {inter.id} - {inter.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Road Conditions */}
          <div className="card">
            <h3 className="font-display text-lg text-[#0F172A] mb-4">🌤️ Road Conditions</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">Weather</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="clear">☀️ Clear</option>
                  <option value="rain">🌧️ Rain</option>
                  <option value="fog">🌫️ Fog</option>
                  <option value="night">🌙 Night</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">Traffic</label>
                <select
                  value={traffic}
                  onChange={(e) => setTraffic(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="smooth">🟢 Smooth</option>
                  <option value="moderate">🟡 Moderate</option>
                  <option value="heavy">🟠 Heavy</option>
                  <option value="severe">🔴 Severe</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">Criticality</label>
                <select
                  value={criticality}
                  onChange={(e) => setCriticality(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="normal">🟢 Normal</option>
                  <option value="high">🟡 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Run Simulation */}
          <button
            onClick={handleRun}
            disabled={isSimulating}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? '⏳ Simulating...' : `🚀 Run on ${currentLayout.name}`}
          </button>
        </div>
    </div>
  );
};

export default RoadLayoutBuilder;
