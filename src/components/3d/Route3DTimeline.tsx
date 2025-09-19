import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera, Environment, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import { RouteWaypoint } from './RouteWaypoint';
import { Aircraft } from './Aircraft';
import { FlightPath } from './FlightPath';

extend({ OrbitControls });

interface Route3DTimelineProps {
  studentRoute: Array<{
    id: string;
    stepId: string;
    title: string;
    category: string;
    icon: string;
    completed: boolean;
    order: number;
    taskProgress: Record<string, boolean>;
  }>;
  routeSteps: any[];
  onWaypointClick: (stepId: string) => void;
  activeStep?: string;
}

function Scene({ studentRoute, routeSteps, onWaypointClick, activeStep }: Route3DTimelineProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<string | null>(null);

  // Create waypoint positions in 3D space
  const waypointPositions = studentRoute.map((step, index) => {
    const angle = (index / Math.max(studentRoute.length - 1, 1)) * Math.PI * 2;
    const radius = 8;
    const height = index * 2;
    return [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ] as [number, number, number];
  });

  // Calculate progress
  const completedSteps = studentRoute.filter(step => step.completed).length;
  const progress = studentRoute.length > 0 ? completedSteps / studentRoute.length : 0;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 20, 0]} intensity={0.5} color="#87CEEB" />

      {/* Environment */}
      <Environment preset="sunset" background blur={0.8} />

      {/* Flight Path Connections */}
      {waypointPositions.length > 1 && (
        <FlightPath 
          positions={waypointPositions}
          progress={progress}
        />
      )}

      {/* Route Waypoints */}
      {studentRoute.map((step, index) => {
        const fullStep = routeSteps.find(rs => rs.id === step.stepId);
        const position = waypointPositions[index];
        
        return (
          <RouteWaypoint
            key={step.id}
            position={position}
            step={step}
            fullStep={fullStep}
            isCompleted={step.completed}
            isActive={activeStep === step.id}
            isHovered={hoveredWaypoint === step.id}
            onClick={() => onWaypointClick(step.id)}
            onHover={(hovered) => setHoveredWaypoint(hovered ? step.id : null)}
            index={index}
          />
        );
      })}

      {/* Aircraft flying along the path */}
      {waypointPositions.length > 0 && (
        <Aircraft 
          positions={waypointPositions}
          progress={progress}
        />
      )}

      {/* Progress Display */}
      <Text
        position={[0, 15, 0]}
        fontSize={2}
        color="#2563eb"
        anchorX="center"
        anchorY="middle"
        font="/fonts/aviation-font.woff"
      >
        {`${completedSteps}/${studentRoute.length} Steps Complete`}
      </Text>

      {/* Title */}
      <Text
        position={[0, 18, 0]}
        fontSize={3}
        color="#1e40af"
        anchorX="center"
        anchorY="middle"
        font="/fonts/aviation-font.woff"
      >
        Your Aviation Career Path
      </Text>

      {/* Ground Reference */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[20, 64]} />
        <meshLambertMaterial color="#e5e7eb" transparent opacity={0.3} />
      </mesh>

      {/* Clouds */}
      {[...Array(8)].map((_, i) => (
        <Sphere
          key={i}
          position={[
            (Math.random() - 0.5) * 40,
            15 + Math.random() * 10,
            (Math.random() - 0.5) * 40
          ]}
          scale={[2 + Math.random() * 2, 1, 2 + Math.random() * 2]}
        >
          <meshLambertMaterial color="white" transparent opacity={0.6} />
        </Sphere>
      ))}
    </>
  );
}

export function Route3DTimeline(props: Route3DTimelineProps) {
  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-sky-200 to-blue-300">
      <Canvas
        shadows
        camera={{
          position: [15, 10, 15],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
      >
        <Scene {...props} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="font-bold text-lg mb-2">3D Flight Path</h3>
        <p className="text-sm text-muted-foreground">
          Navigate your aviation career journey in 3D
        </p>
        <div className="mt-2 text-xs text-muted-foreground">
          • Click waypoints to expand details<br/>
          • Drag to rotate view<br/>
          • Scroll to zoom in/out
        </div>
      </div>
    </div>
  );
}