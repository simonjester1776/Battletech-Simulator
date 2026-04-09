import { Button } from '@/components/ui/button';
import { Swords, Users, BookOpen, Gamepad2, Wifi } from 'lucide-react';

interface MainMenuProps {
  onSinglePlayer: () => void;
  onCampaign: () => void;
  onHotseat: () => void;
  onNetworkPlay: () => void;
  onMechLab: () => void;
}

export function MainMenu({ onSinglePlayer, onCampaign, onHotseat, onNetworkPlay, onMechLab }: MainMenuProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" style={{ fontFamily: "'Battletech', 'HeavyMetal1', sans-serif", letterSpacing: '0.15em' }}>
            BATTLETECH
          </h1>
          <p className="text-xl text-gray-400" style={{ fontFamily: "'Battletech', 'HeavyMetal1', sans-serif" }}>Tactical Simulator</p>
        </div>
        
        <div className="grid gap-4">
          <Button
            onClick={onSinglePlayer}
            className="h-20 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/20"
            data-testid="singleplayer-btn"
          >
            <Swords className="w-6 h-6 mr-3" />
            Single Player
          </Button>
          
          <Button
            onClick={onCampaign}
            className="h-20 text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-lg shadow-purple-500/20"
            data-testid="campaign-btn"
          >
            <BookOpen className="w-6 h-6 mr-3" />
            Campaign Mode
          </Button>
          
          <Button
            onClick={onHotseat}
            className="h-20 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-lg shadow-green-500/20"
            data-testid="hotseat-btn"
          >
            <Users className="w-6 h-6 mr-3" />
            Local Hotseat
          </Button>
          
          <Button
            onClick={onNetworkPlay}
            className="h-20 text-lg bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 shadow-lg shadow-cyan-500/20"
            data-testid="network-btn"
          >
            <Wifi className="w-6 h-6 mr-3" />
            Online Multiplayer
          </Button>
          
          <Button
            onClick={onMechLab}
            className="h-20 text-lg bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 shadow-lg shadow-orange-500/20"
            data-testid="mechlab-btn"
          >
            <Gamepad2 className="w-6 h-6 mr-3" />
            Mech Lab
          </Button>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Use keyboard shortcuts: Ctrl+S (Save) | Ctrl+L (Load) | Space (Next Phase)</p>
        </div>
      </div>
    </div>
  );
}
