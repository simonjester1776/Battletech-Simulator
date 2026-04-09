import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

export interface Track {
  name: string;
  path: string;
  category: 'menu' | 'campaign' | 'battle';
}

const TRACKS: Track[] = [
  { name: 'Splash', path: '/midi/splash.mid', category: 'menu' },
  { name: 'JF Training', path: '/midi/jftrain.mid', category: 'campaign' },
  { name: 'JF Ready Room', path: '/midi/jfready.mid', category: 'campaign' },
  { name: 'JF Hall', path: '/midi/jfhall.mid', category: 'campaign' },
  { name: 'WO Training', path: '/midi/wotrain.mid', category: 'battle' },
  { name: 'WO Ready Room', path: '/midi/woready.mid', category: 'battle' },
  { name: 'WO Hall', path: '/midi/wohall.mid', category: 'battle' },
  { name: 'Trial by Combat', path: '/midi/trial.mid', category: 'battle' },
];

interface MidiNote {
  midi: number;
  time: number;
  duration: number;
}

interface ParsedMidi {
  notes: MidiNote[];
  tempo: number;
  totalTime: number;
}

// Parse MIDI file with proper running status support
async function parseMidiFile(filepath: string): Promise<ParsedMidi> {
  try {
    const response = await fetch(filepath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const allNotes: MidiNote[] = [];
    let tempo = 500000; // 120 BPM default
    let divisionsPerQuarter = 480;

    // Parse header to get divisions (bytes 12-13, not 14-15!)
    if (data[0] === 0x4d && data[1] === 0x54 && data[2] === 0x68 && data[3] === 0x64) {
      divisionsPerQuarter = (data[12] << 8) | data[13];
      console.log(`   Header: divisions=${divisionsPerQuarter}`);
    }

    // Parse ALL tracks
    let i = 0;
    while (i < data.length - 8) {
      if (data[i] === 0x4d && data[i + 1] === 0x54 && data[i + 2] === 0x72 && data[i + 3] === 0x6b) {
        i += 4;
        const trackLength = (data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3];
        i += 4;
        const trackEnd = Math.min(i + trackLength, data.length);

        let currentTime = 0;
        let runningStatus = 0;
        // Use array to track multiple instances of same note
        const noteStack: Record<number, number[]> = {};
        let noteOnCount = 0;
        let noteOffCount = 0;
        let trackNotesAdded = 0;

        while (i < trackEnd) {
          // Parse variable-length delta time
          let deltaTime = 0;
          while (i < trackEnd) {
            const byte = data[i++];
            deltaTime = (deltaTime << 7) | (byte & 0x7f);
            if (!(byte & 0x80)) break;
          }
          currentTime += deltaTime;

          if (i >= trackEnd) break;

          let eventByte = data[i];
          
          // Check if this is a status byte (bit 7 set) or running status (bit 7 clear)
          if (eventByte & 0x80) {
            // New status byte
            runningStatus = eventByte;
            i++;
          } else {
            // Running status - use previous status byte
            eventByte = runningStatus;
          }

          if (eventByte === 0xff) {
            // Meta event
            if (i >= trackEnd) break;
            const metaType = data[i++];
            let metaLength = 0;
            while (i < trackEnd) {
              const byte = data[i++];
              metaLength = (metaLength << 7) | (byte & 0x7f);
              if (!(byte & 0x80)) break;
            }

            if (metaType === 0x51 && metaLength === 3) {
              tempo = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
            }
            i += metaLength;
          } else if ((eventByte & 0xf0) === 0x90) {
            // Note On
            if (i + 1 >= trackEnd) break;
            const note = data[i++];
            const velocity = data[i++];
            if (velocity > 0) {
              // Push to array to handle multiple instances of same note
              if (!noteStack[note]) noteStack[note] = [];
              noteStack[note].push(currentTime);
              noteOnCount++;
            }
          } else if ((eventByte & 0xf0) === 0x80) {
            // Note Off
            if (i + 1 >= trackEnd) break;
            const note = data[i++];
            i++; // velocity
            if (noteStack[note] && noteStack[note].length > 0) {
              // Pop from array (FIFO - match oldest note-on)
              const startTime = noteStack[note].shift();
              const duration = Math.max(currentTime - startTime, 10);
              const timeInSeconds = (startTime / divisionsPerQuarter) * (tempo / 1000000);
              const durationInSeconds = (duration / divisionsPerQuarter) * (tempo / 1000000);
              allNotes.push({
                midi: note,
                time: Math.max(timeInSeconds, 0),
                duration: Math.max(durationInSeconds, 0.05),
              });
              trackNotesAdded++;
              noteOffCount++;
            }
          } else if ((eventByte & 0xf0) === 0xc0) {
            // Program change - 1 byte
            if (i < trackEnd) i++;
          } else if ((eventByte & 0xf0) === 0xd0) {
            // Channel pressure - 1 byte
            if (i < trackEnd) i++;
          } else if ((eventByte & 0xf0) === 0xb0) {
            // Control change - 2 bytes
            if (i + 1 < trackEnd) i += 2;
          } else if ((eventByte & 0xf0) === 0xe0) {
            // Pitch bend - 2 bytes
            if (i + 1 < trackEnd) i += 2;
          } else if (eventByte === 0xf0 || eventByte === 0xf7) {
            // Sysex - variable length
            let sysexLength = 0;
            while (i < trackEnd) {
              const byte = data[i++];
              sysexLength = (sysexLength << 7) | (byte & 0x7f);
              if (!(byte & 0x80)) break;
            }
            i += Math.min(sysexLength, trackEnd - i);
            runningStatus = 0; // Sysex ends running status
          } else if (eventByte === 0xf4 || eventByte === 0xf5 || eventByte === 0xf6) {
            // System common - no data bytes
            runningStatus = 0;
          }
        }

        // Log track details
        if (noteOnCount > 0 || noteOffCount > 0) {
          console.log(`  [Track] ${noteOnCount} Note-Ons, ${noteOffCount} Note-Offs → ${trackNotesAdded} notes added (total: ${allNotes.length})`);
        }

        i = trackEnd;

        i = trackEnd;
      } else {
        i++;
      }
    }

    // Sort notes by time and deduplicate simultaneous same-note events
    allNotes.sort((a, b) => a.time - b.time);

    // Calculate total time
    let totalTime = 0;
    if (allNotes.length > 0) {
      totalTime = Math.max(...allNotes.map(n => n.time + n.duration));
    }
    totalTime = Math.max(totalTime, 0.5);

    console.log(`🎵 Parsed ${filepath}: ${allNotes.length} notes`);
    console.log(`   Divisions: ${divisionsPerQuarter}, Tempo: ${Math.round(60000000/tempo)}BPM, Duration: ${totalTime.toFixed(2)}s`);
    if (allNotes.length > 0) {
      const unique = new Set(allNotes.map(n => n.midi));
      const sortedUnique = Array.from(unique).sort((a, b) => a - b);
      console.log(`   Unique pitches (${unique.size}): ${sortedUnique.slice(0, 30).join(', ')}`);
    }
    
    return { notes: allNotes, tempo, totalTime };
  } catch (err) {
    console.error('❌ MIDI parse error for', filepath, ':', err);
    return { notes: [], tempo: 500000, totalTime: 0.5 };
  }
}


export function useAudioManager() {
  const synthRef = useRef<Tone.PolySynth<Tone.Synth> | null>(null);
  const volumeNodeRef = useRef<Tone.Volume | null>(null);
  const parsedMidiRef = useRef<Record<string, ParsedMidi>>({});
  const isPlayingRef = useRef(false);
  const currentFilepathRef = useRef<string>('');
  const loopIdRef = useRef<number | null>(null);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const categoryTracksRef = useRef<Track[]>([]);

  // Initialize Tone.js
  useEffect(() => {
    const initTone = async () => {
      try {
        if (Tone.Destination.state === 'suspended') {
          await Tone.start();
        }

        if (!synthRef.current) {
          const volumeNode = new Tone.Volume(Tone.gainToDb(0.3));
          volumeNodeRef.current = volumeNode;

          // Create synth for MIDI playback
          const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { 
              attack: 0.05,
              decay: 0.2,
              sustain: 0.3,
              release: 0.8
            },
          });

          synth.connect(volumeNode);
          volumeNode.toDestination();
          synthRef.current = synth;

          console.log('✓ Synth initialized');
        }
      } catch (err) {
        console.error('Tone init error:', err);
      }
    };

    initTone();
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (volumeNodeRef.current) {
      const db = isMuted ? -Infinity : Tone.gainToDb(volume);
      volumeNodeRef.current.volume.rampTo(db, 0.1);
    }
  }, [volume, isMuted]);

  // Pre-load all MIDI files
  useEffect(() => {
    const loadAll = async () => {
      for (const track of TRACKS) {
        const parsed = await parseMidiFile(track.path);
        parsedMidiRef.current[track.path] = parsed;
        if (parsed.notes.length > 0) {
          console.log(`✓ Loaded ${track.name}: ${parsed.notes.length} notes, ${parsed.totalTime.toFixed(1)}s`);
        }
      }
    };
    loadAll();
  }, []);

  const schedulePlayback = (filepath: string) => {
    const parsed = parsedMidiRef.current[filepath];
    if (!parsed || !parsed.notes.length) {
      console.warn('No parsed MIDI data for', filepath);
      return;
    }

    if (!synthRef.current) {
      console.error('Synth not ready');
      return;
    }

    // Clear any existing notes
    synthRef.current.triggerRelease();

    // Schedule all notes with Tone.js
    const now = Tone.now();
    
    // Get unique note values for logging
    const uniqueNotes = new Set(parsed.notes.map(n => n.midi));
    console.log(`🎼 Scheduling ${parsed.notes.length} notes (${uniqueNotes.size} unique pitches): ${Array.from(uniqueNotes).sort((a, b) => a - b).join(', ')}`);
    
    for (const note of parsed.notes) {
      synthRef.current.triggerAttackRelease(
        Tone.Midi(note.midi).toFrequency(),
        note.duration,
        now + note.time
      );
    }

    // Schedule next loop with proper spacing
    const loopDelay = Math.max((parsed.totalTime + 0.8) * 1000, 1000); // Minimum 1 second
    console.log(`▶ Next loop in ${(loopDelay / 1000).toFixed(1)}s`);
    
    if (isPlayingRef.current && currentFilepathRef.current === filepath) {
      loopIdRef.current = window.setTimeout(() => {
        if (isPlayingRef.current && currentFilepathRef.current === filepath) {
          schedulePlayback(filepath);
        }
      }, loopDelay);
    }
  };

  const setCategory = (category: 'menu' | 'campaign' | 'battle') => {
    console.log('Switching to category:', category);
    // Stop current playback when switching categories
    if (isPlayingRef.current) {
      stop();
    }
    const tracks = TRACKS.filter(t => t.category === category);
    categoryTracksRef.current = tracks;
    setCurrentTrackIndex(0);
  };

  const play = async () => {
    try {
      if (!categoryTracksRef.current.length) return;

      // Stop any currently playing track first
      stop();
      
      await Tone.start();

      const track = categoryTracksRef.current[currentTrackIndex];
      isPlayingRef.current = true;
      currentFilepathRef.current = track.path;
      
      console.log('Playing:', track.name);
      setIsPlaying(true);
      schedulePlayback(track.path);
    } catch (err) {
      console.error('Play error:', err);
      isPlayingRef.current = false;
    }
  };

  const stop = () => {
    console.log('Stopping audio...');
    
    isPlayingRef.current = false;
    currentFilepathRef.current = '';
    
    // Clear any pending loop timeout
    if (loopIdRef.current) {
      window.clearTimeout(loopIdRef.current);
      loopIdRef.current = null;
    }

    // Immediately release all notes
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      // Dispose and recreate synth to fully clear state
      synthRef.current.dispose();
    }
    
    // Recreate synth
    const volumeNode = new Tone.Volume(Tone.gainToDb(0.3));
    volumeNodeRef.current = volumeNode;

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { 
        attack: 0.05,
        decay: 0.2,
        sustain: 0.3,
        release: 0.8
      },
    });

    synth.connect(volumeNode);
    volumeNode.toDestination();
    synthRef.current = synth;

    setIsPlaying(false);
    console.log('Audio stopped, synth reset');
  };

  const nextTrack = () => {
    const next = (currentTrackIndex + 1) % categoryTracksRef.current.length;
    setCurrentTrackIndex(next);
    
    if (isPlaying) {
      stop();
      setTimeout(() => {
        if (synthRef.current && categoryTracksRef.current[next]) {
          isPlayingRef.current = true;
          const track = categoryTracksRef.current[next];
          currentFilepathRef.current = track.path;
          console.log('Next track:', track.name);
          schedulePlayback(track.path);
        }
      }, 100);
    }
  };

  const previousTrack = () => {
    const prev = (currentTrackIndex - 1 + categoryTracksRef.current.length) % categoryTracksRef.current.length;
    setCurrentTrackIndex(prev);
    
    if (isPlaying) {
      stop();
      setTimeout(() => {
        if (synthRef.current && categoryTracksRef.current[prev]) {
          isPlayingRef.current = true;
          const track = categoryTracksRef.current[prev];
          currentFilepathRef.current = track.path;
          console.log('Previous track:', track.name);
          schedulePlayback(track.path);
        }
      }, 100);
    }
  };
      }, 50);
    }
  };

  const getCurrentTrack = () => {
    return categoryTracksRef.current[currentTrackIndex];
  };

  return {
    play,
    stop,
    nextTrack,
    previousTrack,
    setCategory,
    setVolume,
    setIsMuted,
    isPlaying,
    volume,
    isMuted,
    currentTrack: getCurrentTrack(),
    allTracks: categoryTracksRef.current,
  };
}
