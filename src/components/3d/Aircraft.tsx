import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Cone } from '@react-three/drei';
import * as THREE from 'three';

interface AircraftProps {
  positions: [number, number, number][];
  progress: number;
}

export function Aircraft({ positions, progress }: AircraftProps) {
  const aircraftRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);

  // Create trail points
  const trailPoints = useRef<THREE.Vector3[]>([]);
  const maxTrailLength = 50;

  useFrame((state) => {
    if (!aircraftRef.current || positions.length < 2) return;

    // Calculate current position along the path
    const totalSegments = positions.length - 1;
    const currentSegment = Math.min(Math.floor(progress * totalSegments), totalSegments - 1);
    const segmentProgress = (progress * totalSegments) % 1;

    if (positions[currentSegment] && positions[currentSegment + 1]) {
      const currentPos = new THREE.Vector3(...positions[currentSegment]);
      const nextPos = new THREE.Vector3(...positions[currentSegment + 1]);
      
      // Interpolate position
      const position = currentPos.lerp(nextPos, segmentProgress);
      position.y += 2; // Fly above waypoints
      
      aircraftRef.current.position.copy(position);

      // Calculate direction for rotation
      const direction = nextPos.clone().sub(currentPos).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(up, direction).normalize();
      const newUp = new THREE.Vector3().crossVectors(direction, right);
      
      const matrix = new THREE.Matrix4();
      matrix.makeBasis(right, newUp, direction);
      aircraftRef.current.setRotationFromMatrix(matrix);

      // Add to trail
      trailPoints.current.push(position.clone());
      if (trailPoints.current.length > maxTrailLength) {
        trailPoints.current.shift();
      }

      // Gentle banking animation
      aircraftRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group>
      {/* Aircraft Model */}
      <group ref={aircraftRef}>
        {/* Fuselage */}
        <Cylinder
          args={[0.08, 0.12, 1.5]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial color="#e5e7eb" />
        </Cylinder>

        {/* Wings */}
        <Box
          args={[2, 0.05, 0.3]}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial color="#d1d5db" />
        </Box>

        {/* Tail */}
        <Box
          args={[0.4, 0.3, 0.05]}
          position={[-0.6, 0.15, 0]}
        >
          <meshStandardMaterial color="#d1d5db" />
        </Box>

        {/* Vertical Stabilizer */}
        <Box
          args={[0.05, 0.3, 0.2]}
          position={[-0.6, 0.15, 0]}
        >
          <meshStandardMaterial color="#d1d5db" />
        </Box>

        {/* Engine Cowling */}
        <Cone
          args={[0.12, 0.3]}
          position={[0.6, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial color="#6b7280" />
        </Cone>

        {/* Navigation Lights */}
        <mesh position={[1, 0, 0]}>
          <sphereGeometry args={[0.02]} />
          <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-1, 0, 0]}>
          <sphereGeometry args={[0.02]} />
          <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Contrail/Trail Effect */}
      {trailPoints.current.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={trailPoints.current.length}
              array={new Float32Array(trailPoints.current.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#87ceeb" transparent opacity={0.6} linewidth={2} />
        </line>
      )}
    </group>
  );
}