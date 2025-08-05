import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Atom, Target, Zap, Globe } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  action?: string;
  icon: React.ReactNode;
  highlight?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Quantum Computing',
    content: 'Quantum computers use the strange properties of quantum mechanics to process information in fundamentally different ways than classical computers. Let\'s explore the basics!',
    icon: <Atom className="w-6 h-6" />,
  },
  {
    id: 'qubits',
    title: 'What are Qubits?',
    content: 'Unlike classical bits that are either 0 or 1, qubits can exist in a "superposition" of both states simultaneously. This is visualized on the right with Bloch spheres - 3D representations of qubit states.',
    target: '.qubit-visualization',
    icon: <Globe className="w-6 h-6" />,
    highlight: 'qubit-viz'
  },
  {
    id: 'gates',
    title: 'Quantum Gates',
    content: 'Quantum gates are operations that manipulate qubits. They\'re like the building blocks of quantum algorithms. Try dragging a Hadamard (H) gate from the palette to create superposition!',
    target: '.gate-palette',
    action: 'Drag an H gate to a circuit wire',
    icon: <Zap className="w-6 h-6" />,
    highlight: 'gate-palette'
  },
  {
    id: 'superposition',
    title: 'Superposition',
    content: 'The H gate puts a qubit into superposition - it becomes 50% |0⟩ and 50% |1⟩ simultaneously. Watch how the Bloch sphere moves to the equator, representing this quantum uncertainty.',
    icon: <Globe className="w-6 h-6" />,
  },
  {
    id: 'measurement',
    title: 'Quantum Measurement',
    content: 'When you measure a qubit in superposition, it "collapses" to either |0⟩ or |1⟩ randomly. Click on a qubit sphere to measure it and see this quantum collapse in action!',
    target: '.qubit-sphere',
    action: 'Click on a qubit to measure it',
    icon: <Target className="w-6 h-6" />,
    highlight: 'measurement'
  },
  {
    id: 'entanglement',
    title: 'Quantum Entanglement',
    content: 'Try the Bell State preset! CNOT gates can create "entanglement" - a spooky quantum connection where measuring one qubit instantly affects another, no matter the distance.',
    action: 'Load the "Bell State" preset',
    icon: <Zap className="w-6 h-6" />,
    highlight: 'presets'
  },
  {
    id: 'exploration',
    title: 'Start Exploring!',
    content: 'You now understand the quantum basics! Experiment with different gates, try the preset circuits, and watch how quantum states evolve. The quantum world awaits your exploration!',
    icon: <Atom className="w-6 h-6" />,
  }
];

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialOverlay({ isOpen, onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const step = TUTORIAL_STEPS[currentStep];
      if (step.highlight) {
        setHighlightedElement(step.highlight);
        // Add highlight class to targeted elements
        const elements = document.querySelectorAll(getElementSelector(step.highlight));
        elements.forEach(el => el.classList.add('tutorial-highlight'));
      } else {
        clearHighlights();
      }
    } else {
      clearHighlights();
    }

    return () => clearHighlights();
  }, [isOpen, currentStep]);

  const clearHighlights = () => {
    setHighlightedElement(null);
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
  };

  const getElementSelector = (highlight: string): string => {
    switch (highlight) {
      case 'qubit-viz': return '[data-tutorial="qubit-viz"]';
      case 'gate-palette': return '[data-tutorial="gate-palette"]';
      case 'measurement': return '[data-tutorial="measurement"]';
      case 'presets': return '[data-tutorial="presets"]';
      default: return '';
    }
  };

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTutorial = () => {
    clearHighlights();
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = TUTORIAL_STEPS[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={closeTutorial}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-lg w-full"
        >
          <Card className="bg-card/95 backdrop-blur-md border-accent/20 shadow-2xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {currentStepData.title}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeTutorial}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / TUTORIAL_STEPS.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent to-secondary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-foreground/90 leading-relaxed">
                  {currentStepData.content}
                </p>
                
                {currentStepData.action && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-sm font-medium text-accent">
                      Try this: {currentStepData.action}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex space-x-1">
                  {TUTORIAL_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? 'bg-accent scale-125'
                          : index < currentStep
                          ? 'bg-accent/60'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                {currentStep === TUTORIAL_STEPS.length - 1 ? (
                  <Button
                    onClick={closeTutorial}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Start Exploring!
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    className="flex items-center bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}