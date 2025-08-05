import React from 'react';
import { useDrop } from 'react-dnd';
import { QubitState, CircuitGate, QuantumGate } from '@/lib/quantum';
import { QuantumGateComponent } from './QuantumGateComponent';

interface CircuitWireProps {
  qubit: QubitState;
  qubitIndex: number;
  gates: CircuitGate[];
  onGateDrop: (gate: QuantumGate, qubit: number, position: number) => void;
  onGateClick: (gateId: string) => void;
}

export function CircuitWire({ 
  qubit, 
  qubitIndex, 
  gates, 
  onGateDrop, 
  onGateClick 
}: CircuitWireProps) {
  const wireGates = gates
    .filter(g => g.qubit === qubitIndex)
    .sort((a, b) => a.position - b.position);

  const maxPosition = Math.max(...wireGates.map(g => g.position), 5);

  return (
    <div className="flex items-center space-x-4 mb-6">
      {/* Qubit label */}
      <div className="w-20 text-right">
        <span className="text-sm font-mono text-muted-foreground">
          |q{qubitIndex}⟩
        </span>
      </div>

      {/* Circuit wire with drop zones */}
      <div className="flex items-center flex-1">
        <div className="quantum-wire h-1 flex-1 rounded-full relative">
          {/* Gate positions */}
          {Array.from({ length: maxPosition + 1 }, (_, position) => (
            <DropZone
              key={position}
              position={position}
              qubitIndex={qubitIndex}
              onGateDrop={onGateDrop}
              gate={wireGates.find(g => g.position === position)}
              onGateClick={onGateClick}
            />
          ))}
        </div>
      </div>

      {/* Probability display */}
      <div className="w-32 text-xs font-mono">
        <div className="text-muted-foreground">
          |0⟩: {(qubit.amplitudes[0] * qubit.amplitudes[0] * 100).toFixed(1)}%
        </div>
        <div className="text-muted-foreground">
          |1⟩: {(qubit.amplitudes[1] * qubit.amplitudes[1] * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

interface DropZoneProps {
  position: number;
  qubitIndex: number;
  onGateDrop: (gate: QuantumGate, qubit: number, position: number) => void;
  gate?: CircuitGate;
  onGateClick: (gateId: string) => void;
}

function DropZone({ position, qubitIndex, onGateDrop, gate, onGateClick }: DropZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'gate',
    drop: (item: { gate: QuantumGate }) => {
      onGateDrop(item.gate, qubitIndex, position);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`absolute w-16 h-16 -top-8 flex items-center justify-center rounded-lg transition-colors ${
        isOver ? 'bg-accent/20 border border-accent' : ''
      }`}
      style={{ left: `${position * 80}px` }}
    >
      {gate && (
        <div onClick={() => onGateClick(gate.id)}>
          <QuantumGateComponent 
            gate={{
              id: gate.gateType,
              name: gate.gateType.toUpperCase(),
              symbol: gate.gateType.toUpperCase(),
              description: '',
              matrix: [],
              color: 'oklch(0.7 0.25 200)'
            }}
            isInPalette={false}
          />
        </div>
      )}
    </div>
  );
}