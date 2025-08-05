import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { 
  QubitState, 
  CircuitGate, 
  QuantumGate, 
  applyGate, 
  QUANTUM_GATES,
  PRESET_CIRCUITS 
} from '@/lib/quantum';
import { GatePalette } from '@/components/GatePalette';
import { CircuitWire } from '@/components/CircuitWire';
import { QubitVisualization } from '@/components/QubitVisualization';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RotateCcw, Play, Atom } from '@phosphor-icons/react';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [qubits, setQubits] = useKV<QubitState[]>('quantum-qubits', [
    {
      id: 'q0',
      amplitudes: [1, 0],
      position: { x: 0, y: 0, z: 1 }
    },
    {
      id: 'q1', 
      amplitudes: [1, 0],
      position: { x: 0, y: 0, z: 1 }
    }
  ]);

  const [circuitGates, setCircuitGates] = useKV<CircuitGate[]>('quantum-circuit', []);
  const [measurements, setMeasurements] = useKV<{ qubit: number; result: 0 | 1; timestamp: number }[]>('quantum-measurements', []);

  const handleGateDrop = useCallback((gate: QuantumGate, qubitIndex: number, position: number) => {
    const newGate: CircuitGate = {
      id: `${gate.id}-${qubitIndex}-${position}-${Date.now()}`,
      gateType: gate.id,
      qubit: qubitIndex,
      position,
      controlQubit: gate.id === 'cnot' ? (qubitIndex === 0 ? 1 : 0) : undefined
    };

    setCircuitGates(current => {
      const filtered = current.filter(g => !(g.qubit === qubitIndex && g.position === position));
      return [...filtered, newGate];
    });

    // Apply gate to qubit
    setQubits(current => {
      const newQubits = [...current];
      newQubits[qubitIndex] = applyGate(newQubits[qubitIndex], gate);
      return newQubits;
    });

    toast.success(`${gate.name} gate applied to qubit ${qubitIndex}`);
  }, [setCircuitGates, setQubits]);

  const handleGateRemove = useCallback((gateId: string) => {
    setCircuitGates(current => current.filter(g => g.id !== gateId));
    toast.info('Gate removed from circuit');
  }, [setCircuitGates]);

  const handleMeasurement = useCallback((qubitIndex: number, result: 0 | 1) => {
    const newMeasurement = {
      qubit: qubitIndex,
      result,
      timestamp: Date.now()
    };

    setMeasurements(current => [...current, newMeasurement]);

    // Collapse qubit to measured state
    setQubits(current => {
      const newQubits = [...current];
      newQubits[qubitIndex] = {
        ...newQubits[qubitIndex],
        amplitudes: result === 0 ? [1, 0] : [0, 1],
        position: result === 0 ? { x: 0, y: 0, z: 1 } : { x: 0, y: 0, z: -1 }
      };
      return newQubits;
    });

    toast.success(`Measured |${result}⟩ on qubit ${qubitIndex}`, {
      description: `Qubit collapsed to |${result}⟩ state`
    });
  }, [setMeasurements, setQubits]);

  const resetCircuit = useCallback(() => {
    setQubits([
      { id: 'q0', amplitudes: [1, 0], position: { x: 0, y: 0, z: 1 } },
      { id: 'q1', amplitudes: [1, 0], position: { x: 0, y: 0, z: 1 } }
    ]);
    setCircuitGates([]);
    setMeasurements([]);
    toast.info('Circuit reset to initial state');
  }, [setQubits, setCircuitGates, setMeasurements]);

  const loadPreset = useCallback((presetName: string) => {
    const preset = PRESET_CIRCUITS.find(p => p.name === presetName);
    if (!preset) return;

    resetCircuit();
    
    setTimeout(() => {
      const gates = preset.gates.map((g, index) => ({
        ...g,
        id: `preset-${index}-${Date.now()}`
      }));
      
      setCircuitGates(gates);

      // Apply gates sequentially
      let currentQubits = [
        { id: 'q0', amplitudes: [1, 0] as [number, number], position: { x: 0, y: 0, z: 1 } },
        { id: 'q1', amplitudes: [1, 0] as [number, number], position: { x: 0, y: 0, z: 1 } }
      ];

      gates.forEach(gate => {
        const quantumGate = QUANTUM_GATES.find(qg => qg.id === gate.gateType);
        if (quantumGate) {
          currentQubits[gate.qubit] = applyGate(currentQubits[gate.qubit], quantumGate);
        }
      });

      setQubits(currentQubits);
      toast.success(`Loaded ${preset.name} circuit`);
    }, 100);
  }, [resetCircuit, setCircuitGates, setQubits]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background text-foreground">
        <Toaster />
        
        {/* Header */}
        <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Atom className="w-8 h-8 text-accent quantum-glow" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                  Quantum Circuit Playground
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select onValueChange={loadPreset}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Load Preset Circuit" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_CIRCUITS.map(preset => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={resetCircuit}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Gate Palette */}
            <div className="xl:col-span-1">
              <GatePalette />
            </div>

            {/* Circuit Builder */}
            <div className="xl:col-span-2">
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="w-5 h-5 mr-2 text-accent" />
                    Quantum Circuit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {qubits.map((qubit, index) => (
                      <CircuitWire
                        key={qubit.id}
                        qubit={qubit}
                        qubitIndex={index}
                        gates={circuitGates}
                        onGateDrop={handleGateDrop}
                        onGateClick={handleGateRemove}
                      />
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {/* Measurement History */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recent Measurements</h4>
                    <div className="flex flex-wrap gap-2">
                      {measurements.slice(-10).map((measurement, index) => (
                        <div 
                          key={index}
                          className="px-2 py-1 bg-muted rounded text-xs font-mono"
                        >
                          q{measurement.qubit}: |{measurement.result}⟩
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Qubit Visualizations */}
            <div className="xl:col-span-1 space-y-6">
              {qubits.map((qubit, index) => (
                <QubitVisualization
                  key={qubit.id}
                  qubit={qubit}
                  qubitIndex={index}
                  onMeasure={handleMeasurement}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;