import { Music, Volume2, VolumeX, SkipBack, SkipForward, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioManager } from '@/hooks/useAudioManager';
import { useEffect, useState } from 'react';

interface MidiPlayerProps {
  category?: 'menu' | 'campaign' | 'battle';
  autoPlay?: boolean;
  className?: string;
}

export function MidiPlayer({ category = 'menu', autoPlay = true, className = '' }: MidiPlayerProps) {
  const audioManager = useAudioManager();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    audioManager.setCategory(category);
  }, [category]);

  // Auto-play on first user interaction
  useEffect(() => {
    if (autoPlay && !initialized && audioManager.currentTrack) {
      // Set a flag to auto-play on next interaction
      setInitialized(true);
    }
  }, [autoPlay, initialized, audioManager.currentTrack]);

  const handlePlayClick = async () => {
    if (audioManager.isPlaying) {
      audioManager.stop();
    } else {
      await audioManager.play();
    }
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        {/* Track Info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Music className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 truncate">
              {audioManager.currentTrack?.name || 'No track loaded'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => audioManager.previousTrack()}
            className="text-gray-400 hover:text-white"
            title="Previous track"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handlePlayClick}
            className="text-gray-400 hover:text-white"
            title={audioManager.isPlaying ? 'Pause' : 'Play'}
          >
            {audioManager.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => audioManager.nextTrack()}
            className="text-gray-400 hover:text-white"
            title="Next track"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          {/* Volume Control */}
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-700">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => audioManager.setIsMuted(!audioManager.isMuted)}
              className="text-gray-400 hover:text-white"
              title={audioManager.isMuted ? 'Unmute' : 'Mute'}
            >
              {audioManager.isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioManager.volume}
              onChange={(e) => audioManager.setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              title="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
