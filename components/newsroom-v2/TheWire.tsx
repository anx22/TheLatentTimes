import React, { useContext } from 'react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { AutonomousPipeline } from './AutonomousPipeline';
import { ThreeZonePipeline } from './ThreeZonePipeline';
import { SignalSourcingBar } from './SignalSourcingBar';
import { Layers } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EditorialMethodology } from '../../types';

export const TheWire: React.FC = () => {
  const context = useContext(NewsroomContext);
  
  if (!context) return null;
  const { activeMethodology, setActiveMethodology } = context;

  const renderPipeline = () => {
    switch (activeMethodology) {
      case 'three-zone':
        return <ThreeZonePipeline />;
      case 'autonomous':
        return <AutonomousPipeline />;
      default:
        return <div className="p-8 font-mono text-zinc-500">Methodology under construction.</div>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 overflow-hidden">
      {/* Global Sourcing Configuration Row */}
      <SignalSourcingBar />

      {/* Render Active Pipeline */}
      <div className="flex-1 overflow-hidden relative">
          {renderPipeline()}
      </div>
    </div>
  );
};
