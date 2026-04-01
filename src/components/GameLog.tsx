// Game Log Component - Displays combat log

import { useRef, useEffect } from 'react';
import type { LogEntry } from '@/types/battletech';
import { GamePhase } from '@/types/battletech';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Info, 
  Crosshair, 
  AlertTriangle, 
  Thermometer, 
  Move, 
  Settings
} from 'lucide-react';

interface GameLogProps {
  entries: LogEntry[];
  maxEntries?: number;
}

function getEntryIcon(type: LogEntry['type']) {
  switch (type) {
    case 'combat': return <Crosshair className="w-3 h-3" />;
    case 'critical': return <AlertTriangle className="w-3 h-3" />;
    case 'heat': return <Thermometer className="w-3 h-3" />;
    case 'movement': return <Move className="w-3 h-3" />;
    case 'system': return <Settings className="w-3 h-3" />;
    default: return <Info className="w-3 h-3" />;
  }
}

function getEntryColor(type: LogEntry['type']): string {
  switch (type) {
    case 'combat': return 'text-red-400';
    case 'critical': return 'text-orange-400 font-bold';
    case 'heat': return 'text-yellow-400';
    case 'movement': return 'text-blue-400';
    case 'system': return 'text-gray-400';
    default: return 'text-gray-300';
  }
}

function getPhaseName(phase: GamePhase): string {
  switch (phase) {
    case GamePhase.INITIATIVE: return 'INIT';
    case GamePhase.MOVEMENT: return 'MOVE';
    case GamePhase.COMBAT: return 'FIRE';
    case GamePhase.HEAT: return 'HEAT';
    case GamePhase.END: return 'END';
    default: return phase;
  }
}

export const GameLog: React.FC<GameLogProps> = ({ 
  entries,
  maxEntries = 100 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);
  
  const displayEntries = entries.slice(-maxEntries);
  
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-2 bg-gray-800 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">Combat Log</h3>
      </div>
      
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-2 space-y-1">
          {displayEntries.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              No events yet...
            </p>
          ) : (
            displayEntries.map((entry, index) => (
              <div 
                key={index}
                className={cn(
                  "text-xs py-1 px-2 rounded flex gap-2 items-start",
                  entry.type === 'critical' && "bg-red-900/30",
                  entry.type === 'combat' && "bg-gray-800/50"
                )}
              >
                <span className={cn("mt-0.5", getEntryColor(entry.type))}>
                  {getEntryIcon(entry.type)}
                </span>
                <div className="flex-1">
                  <span className="text-gray-500 text-[10px]">
                    T{entry.turn} {getPhaseName(entry.phase)}
                  </span>
                  <p className={cn("leading-tight", getEntryColor(entry.type))}>
                    {entry.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="p-1 bg-gray-800 border-t border-gray-700 text-[10px] text-gray-500 text-center">
        {entries.length} entries
      </div>
    </div>
  );
};

export default GameLog;
