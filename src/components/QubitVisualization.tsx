import React from 'react';
import { QubitState, measureQubit } from '@/lib/quantum';
import { BlochSphere } from './BlochSphere';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from '@phosphor-icons/react';

interface QubitVisualizationProps {
  qubit: QubitState;
  qubitIndex: number;
  onMeasure: (qubitIndex: number, result: 0 | 1) => void;
}

export function QubitVisualization({ 
  qubit, 
  qubitIndex, 
  onMeasure 
}: QubitVisualizationProps) {
  const handleMeasure = () => {
    const { result } = measureQubit(qubit);
    onMeasure(qubitIndex, result);
  };

  const prob0 = qubit.amplitudes[0] * qubit.amplitudes[0];
  const prob1 = qubit.amplitudes[1] * qubit.amplitudes[1];

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Qubit {qubitIndex}</h3>
        <p className="text-sm text-muted-foreground">
          α|0⟩ + β|1⟩
        </p>
      </div>

      {/* Bloch Sphere */}
      <div className="flex justify-center mb-4" data-tutorial="measurement">
        <BlochSphere qubit={qubit} size={180} />
      </div>

      {/* Probability Bars */}
      <div className="space-y-2 mb-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>|0⟩ state</span>
            <span>{(prob0 * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${prob0 * 100}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>|1⟩ state</span>
            <span>{(prob1 * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-secondary h-2 rounded-full transition-all duration-500"
              style={{ width: `${prob1 * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Measure Button */}
      <Button 
        onClick={handleMeasure}
        className="w-full quantum-glow"
        variant="outline"
      >
        <Eye className="w-4 h-4 mr-2" />
        Measure
      </Button>

      {/* State Information */}
      <div className="mt-4 text-xs font-mono text-muted-foreground">
        <div>α = {qubit.amplitudes[0].toFixed(3)}</div>
        <div>β = {qubit.amplitudes[1].toFixed(3)}</div>
        <div className="mt-2">
          Position: ({qubit.position.x.toFixed(2)}, {qubit.position.y.toFixed(2)}, {qubit.position.z.toFixed(2)})
        </div>
      </div>
    </Card>
  );
}