import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface RouteWaypointProps {
  position: [number, number, number];
  step: {
    id: string;
    title: string;
    category: string;
    completed: boolean;
    taskProgress?: Record<string, boolean>;
  };
  fullStep?: any;
  isCompleted: boolean;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  index: number;
}

export function RouteWaypoint({ 
  position, 
  step, 
  fullStep,
  isCompleted, 
  isActive, 
  isHovered,
  onClick, 
  onHover,
  index 
}: RouteWaypointProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Animation
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.2;
      
      // Rotation for active/hovered states
      if (isActive || hovered) {
        groupRef.current.rotation.y += 0.02;
      }
      
      // Scale animation
      const targetScale = isActive ? 1.2 : (hovered ? 1.1 : 1);
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  // Colors based on state
  const getWaypointColor = () => {
    if (isCompleted) return "#22c55e"; // Green
    if (isActive) return "#3b82f6"; // Blue
    if (hovered) return "#f59e0b"; // Amber
    return "#64748b"; // Gray
  };

  const getEmissionColor = () => {
    if (isCompleted) return "#16a34a";
    if (isActive) return "#2563eb";
    if (hovered) return "#d97706";
    return "#475569";
  };

  return (
    <group
      ref={groupRef}
      position={[position[0], 0, position[2]]}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHover(false);
      }}
    >
      {/* Main Waypoint Sphere */}
      <Sphere args={[0.8]} castShadow receiveShadow>
        <meshStandardMaterial
          color={getWaypointColor()}
          emissive={getEmissionColor()}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.7}
        />
      </Sphere>

      {/* Completion Ring */}
      {isCompleted && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.4, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Active Pulse Effect */}
      {isActive && (
        <mesh>
          <sphereGeometry args={[1.5]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Support Pillar */}
      <Cylinder
        args={[0.1, 0.1, position[1] + 2]}
        position={[0, -(position[1] + 2) / 2, 0]}
      >
        <meshStandardMaterial
          color="#94a3b8"
          transparent
          opacity={0.6}
        />
      </Cylinder>

      {/* Step Title */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.4}
        color={isActive ? "#1e40af" : "#374151"}
        anchorX="center"
        anchorY="middle"
        maxWidth={6}
        textAlign="center"
      >
        {step.title}
      </Text>

      {/* Category Badge */}
      <Text
        position={[0, 1.1, 0]}
        fontSize={0.25}
        color="#6b7280"
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
        textAlign="center"
      >
        {step.category}
      </Text>

      {/* Step Number */}
      <Text
        position={[0, 0, 0.9]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {index + 1}
      </Text>

      {/* Progress Indicator for Individual Step */}
      {fullStep && fullStep.details && (
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.2}
          color="#6b7280"
          anchorX="center"
          anchorY="middle"
        >
          {`${fullStep.details.filter((d: any) => step.taskProgress?.[d.id] || false).length}/${fullStep.details.length} tasks`}
        </Text>
      )}
    </group>
  );
}