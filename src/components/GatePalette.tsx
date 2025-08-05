import React from 'react';
import { QUANTUM_GATES } from '@/lib/quantum';
import { QuantumGateComponent } from './QuantumGateComponent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function GatePalette() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="text-lg">Quantum Gates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {QUANTUM_GATES.map((gate) => (
            <div key={gate.id} className="flex flex-col items-center space-y-2">
              <QuantumGateComponent gate={gate} />
              <span className="text-xs text-center text-muted-foreground">
                {gate.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}