import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface FlightPathProps {
  positions: [number, number, number][];
  progress: number;
}

export function FlightPath({ positions, progress }: FlightPathProps) {
  // Create smooth curve through all waypoints
  const pathPoints = useMemo(() => {
    if (positions.length < 2) return [];

    const points: THREE.Vector3[] = [];
    
    // Add points between each waypoint for smooth curves
    for (let i = 0; i < positions.length - 1; i++) {
      const start = new THREE.Vector3(...positions[i]);
      const end = new THREE.Vector3(...positions[i + 1]);
      
      // Add intermediate points for smooth curve
      const steps = 20;
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        // Create a slight arc for more realistic flight path
        const mid = start.clone().lerp(end, t);
        mid.y += Math.sin(t * Math.PI) * 1; // Arc height
        points.push(mid);
      }
    }
    
    return points;
  }, [positions]);

  // Create progress-based coloring
  const completedPoints = useMemo(() => {
    const totalPoints = pathPoints.length;
    const completedCount = Math.floor(progress * totalPoints);
    return pathPoints.slice(0, completedCount);
  }, [pathPoints, progress]);

  const remainingPoints = useMemo(() => {
    const totalPoints = pathPoints.length;
    const completedCount = Math.floor(progress * totalPoints);
    return pathPoints.slice(completedCount);
  }, [pathPoints, progress]);

  if (positions.length < 2) return null;

  return (
    <group>
      {/* Completed path section (green) */}
      {completedPoints.length > 1 && (
        <Line
          points={completedPoints}
          color="#22c55e"
          lineWidth={4}
          transparent
          opacity={0.8}
        />
      )}

      {/* Remaining path section (gray) */}
      {remainingPoints.length > 1 && (
        <Line
          points={remainingPoints}
          color="#94a3b8"
          lineWidth={2}
          transparent
          opacity={0.4}
          dashed
          dashSize={0.5}
          gapSize={0.3}
        />
      )}

      {/* Connection pillars between waypoints */}
      {positions.map((pos, index) => {
        if (index === positions.length - 1) return null;
        
        const nextPos = positions[index + 1];
        const isCompleted = (index + 1) / positions.length <= progress;
        
        return (
          <Line
            key={index}
            points={[
              [pos[0], 0, pos[2]],
              [pos[0], pos[1], pos[2]]
            ]}
            color={isCompleted ? "#22c55e" : "#94a3b8"}
            lineWidth={1}
            transparent
            opacity={0.6}
          />
        );
      })}

      {/* Waypoint connectors at ground level */}
      <Line
        points={positions.map(pos => [pos[0], -1, pos[2]])}
        color="#e5e7eb"
        lineWidth={1}
        transparent
        opacity={0.3}
      />
    </group>
  );
}