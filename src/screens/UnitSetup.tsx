import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowLeft, Play } from 'lucide-react';
import type { Unit } from '@/types/battletech';

interface UnitSetupProps {
  availableUnits: Unit[];
  playerSelections: string[];
  aiSelections: string[];
  onPlayerSelectionChange: (selections: string[]) => void;
  onAiSelectionChange: (selections: string[]) => void;
  onStartGame: () => void;
  onBack: () => void;
}

export function UnitSetup({
  availableUnits,
  playerSelections,
  aiSelections,
  onPlayerSelectionChange,
  onAiSelectionChange,
  onStartGame,
  onBack,
}: UnitSetupProps) {
  const togglePlayerUnit = (unitId: string) => {
    if (playerSelections.includes(unitId)) {
      onPlayerSelectionChange(playerSelections.filter(id => id !== unitId));
    } else {
      onPlayerSelectionChange([...playerSelections, unitId]);
    }
  };
  
  const toggleAiUnit = (unitId: string) => {
    if (aiSelections.includes(unitId)) {
      onAiSelectionChange(aiSelections.filter(id => id !== unitId));
    } else {
      onAiSelectionChange([...aiSelections, unitId]);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold">Unit Selection</h1>
          
          <Button
            onClick={onStartGame}
            disabled={playerSelections.length === 0 || aiSelections.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="start-battle-btn"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Battle
          </Button>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Player Forces */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              Player Forces ({playerSelections.length})
            </h2>
            <div className="grid gap-3">
              {availableUnits.map((unit) => {
                const isSelected = playerSelections.includes(unit.id);
                return (
                  <Card
                    key={unit.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all border-2",
                      isSelected
                        ? "bg-blue-900/30 border-blue-500"
                        : "bg-gray-900 border-gray-700 hover:border-gray-600"
                    )}
                    onClick={() => togglePlayerUnit(unit.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{unit.name}</h3>
                        <p className="text-sm text-gray-400">{unit.unitType}</p>
                      </div>
                      <Badge variant={isSelected ? "default" : "outline"}>
                        {unit.tonnage}t
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {/* AI Forces */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-red-400">
              Enemy Forces ({aiSelections.length})
            </h2>
            <div className="grid gap-3">
              {availableUnits.map((unit) => {
                const isSelected = aiSelections.includes(unit.id);
                return (
                  <Card
                    key={unit.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all border-2",
                      isSelected
                        ? "bg-red-900/30 border-red-500"
                        : "bg-gray-900 border-gray-700 hover:border-gray-600"
                    )}
                    onClick={() => toggleAiUnit(unit.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{unit.name}</h3>
                        <p className="text-sm text-gray-400">{unit.unitType}</p>
                      </div>
                      <Badge variant={isSelected ? "default" : "outline"}>
                        {unit.tonnage}t
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
