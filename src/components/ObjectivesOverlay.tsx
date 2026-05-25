// Simple Mission Objectives Overlay for Battle

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Circle, Clock } from 'lucide-react';
import type { MissionObjective } from '@/lib/mission-objectives';
import { ObjectiveStatus } from '@/lib/mission-objectives';

interface ObjectivesOverlayProps {
  objectives: MissionObjective[];
}

export function ObjectivesOverlay({ objectives }: ObjectivesOverlayProps) {
  if (!objectives || objectives.length === 0) {
    return null;
  }

  const getStatusIcon = (status: ObjectiveStatus) => {
    switch (status) {
      case ObjectiveStatus.COMPLETED:
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case ObjectiveStatus.FAILED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case ObjectiveStatus.IN_PROGRESS:
        return <Circle className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-gray-900/95 border-gray-700 p-3 backdrop-blur-sm">
      <h3 className="text-sm font-semibold mb-2 text-gray-300">Mission Objectives</h3>
      <div className="space-y-3">
        {objectives.map((objective) => (
          <div key={objective.id} className="rounded-md border border-gray-700 bg-slate-950/80 p-2">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon(objective.status)}
              <span className="text-xs text-gray-300 font-semibold flex-1">
                {objective.title}
              </span>
              {objective.required && (
                <Badge variant="destructive" className="text-xs px-1 py-0">
                  REQ
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px] text-gray-400 mb-2">
              <span className="truncate">{objective.description}</span>
              {objective.turnsRemaining !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-500" />
                  <span>{objective.turnsRemaining}t</span>
                </div>
              )}
            </div>
            <div className="h-1 rounded-full bg-gray-800 overflow-hidden mb-2">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${objective.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>{objective.progress}%</span>
              <span>
                {objective.reward.cbills.toLocaleString()} cbills • {objective.reward.salvage} salvage
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
