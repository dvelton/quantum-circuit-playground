export interface QuantumGate {
  id: string;
  name: string;
  symbol: string;
  description: string;
  matrix: number[][];
  color: string;
}

export interface QubitState {
  id: string;
  amplitudes: [number, number]; // [alpha, beta] for |0⟩ and |1⟩
  position: { x: number; y: number; z: number }; // Bloch sphere coordinates
}

export interface CircuitGate {
  id: string;
  gateType: string;
  qubit: number;
  position: number; // position in circuit
  controlQubit?: number; // for CNOT gates
}

export interface QuantumCircuit {
  qubits: QubitState[];
  gates: CircuitGate[];
  measurements: { qubit: number; result: 0 | 1 }[];
}

export const QUANTUM_GATES: QuantumGate[] = [
  {
    id: 'h',
    name: 'Hadamard',
    symbol: 'H',
    description: 'Creates superposition - puts qubit in equal probability of |0⟩ and |1⟩',
    matrix: [[1, 1], [1, -1]].map(row => row.map(x => x / Math.sqrt(2))),
    color: 'oklch(0.7 0.25 200)'
  },
  {
    id: 'x',
    name: 'Pauli-X',
    symbol: 'X',
    description: 'Quantum NOT gate - flips |0⟩ to |1⟩ and vice versa',
    matrix: [[0, 1], [1, 0]],
    color: 'oklch(0.6 0.3 10)'
  },
  {
    id: 'y',
    name: 'Pauli-Y',
    symbol: 'Y',
    description: 'Rotates qubit around Y-axis of Bloch sphere',
    matrix: [[0, -1], [1, 0]], // Simplified - actual has complex i
    color: 'oklch(0.6 0.3 120)'
  },
  {
    id: 'z',
    name: 'Pauli-Z',
    symbol: 'Z',
    description: 'Phase flip - leaves |0⟩ unchanged, adds phase to |1⟩',
    matrix: [[1, 0], [0, -1]],
    color: 'oklch(0.7 0.25 280)'
  },
  {
    id: 'cnot',
    name: 'CNOT',
    symbol: '⊕',
    description: 'Controlled NOT - flips target qubit if control is |1⟩',
    matrix: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]],
    color: 'oklch(0.6 0.25 60)'
  }
];

export const PRESET_CIRCUITS = [
  {
    name: 'Bell State',
    description: 'Creates maximum entanglement between two qubits',
    gates: [
      { gateType: 'h', qubit: 0, position: 0 },
      { gateType: 'cnot', qubit: 1, position: 1, controlQubit: 0 }
    ]
  },
  {
    name: 'Superposition Demo',
    description: 'Shows single qubit in perfect superposition',
    gates: [
      { gateType: 'h', qubit: 0, position: 0 }
    ]
  },
  {
    name: 'Quantum Flip',
    description: 'Demonstrates quantum state manipulation',
    gates: [
      { gateType: 'x', qubit: 0, position: 0 },
      { gateType: 'h', qubit: 0, position: 1 },
      { gateType: 'z', qubit: 0, position: 2 }
    ]
  }
];

export function applyGate(state: QubitState, gate: QuantumGate): QubitState {
  const [alpha, beta] = state.amplitudes;
  const [[a, b], [c, d]] = gate.matrix;
  
  const newAlpha = a * alpha + b * beta;
  const newBeta = c * alpha + d * beta;
  
  // Convert to Bloch sphere coordinates
  const norm = Math.sqrt(newAlpha * newAlpha + newBeta * newBeta);
  const normalizedAlpha = newAlpha / norm;
  const normalizedBeta = newBeta / norm;
  
  // Simplified Bloch sphere mapping
  const theta = 2 * Math.acos(Math.abs(normalizedAlpha));
  const phi = Math.atan2(normalizedBeta, normalizedAlpha);
  
  return {
    ...state,
    amplitudes: [normalizedAlpha, normalizedBeta],
    position: {
      x: Math.sin(theta) * Math.cos(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(theta)
    }
  };
}

export function measureQubit(state: QubitState): { result: 0 | 1; probability: number } {
  const [alpha, beta] = state.amplitudes;
  const prob0 = alpha * alpha;
  const prob1 = beta * beta;
  
  const random = Math.random();
  const result = random < prob0 ? 0 : 1;
  
  return {
    result,
    probability: result === 0 ? prob0 : prob1
  };
}