import React from 'react';
import { useDrag } from 'react-dnd';
import { QuantumGate } from '@/lib/quantum';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuantumGateComponentProps {
  gate: QuantumGate;
  isInPalette?: boolean;
}

export function QuantumGateComponent({ gate, isInPalette = true }: QuantumGateComponentProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'gate',
    item: { gate },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const gateStyle = {
    borderColor: gate.color,
    backgroundColor: `${gate.color}20`,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            ref={isInPalette ? drag : undefined}
            className={`quantum-gate w-16 h-16 flex items-center justify-center cursor-pointer select-none ${
              isInPalette ? 'hover:scale-105' : ''
            }`}
            style={gateStyle}
          >
            <span 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'JetBrains Mono' }}
            >
              {gate.symbol}
            </span>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-semibold">{gate.name}</p>
            <p className="text-sm text-muted-foreground">{gate.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}