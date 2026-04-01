// Hex Grid Component for BattleTech

import { useCallback } from 'react';
import type { HexCoord, Hex, Unit } from '@/types/battletech';
import { TerrainType } from '@/types/battletech';
import { hexToPixel, getHexKey, TERRAIN_TYPES } from '@/engine/hexgrid';
import { cn } from '@/lib/utils';

interface HexGridProps {
  hexes: Map<string, Hex>;
  selectedUnit: Unit | null;
  validMoveHexes: HexCoord[];
  validTargetHexes: HexCoord[];
  onHexClick: (hex: Hex) => void;
  size?: number;
}

// Get terrain color
function getTerrainColor(terrain: TerrainType): string {
  switch (terrain) {
    case TerrainType.CLEAR: return '#8B7355';
    case TerrainType.LIGHT_WOODS: return '#4A7C59';
    case TerrainType.HEAVY_WOODS: return '#2D5016';
    case TerrainType.WATER: return '#4682B4';
    case TerrainType.ROUGH: return '#696969';
    case TerrainType.ROAD: return '#A9A9A9';
    case TerrainType.BUILDING: return '#8B4513';
    case TerrainType.HILL: return '#D2B48C';
    default: return '#8B7355';
  }
}

// Get terrain pattern
function getTerrainPattern(terrain: TerrainType): string {
  switch (terrain) {
    case TerrainType.LIGHT_WOODS:
      return 'url(#lightWoodsPattern)';
    case TerrainType.HEAVY_WOODS:
      return 'url(#heavyWoodsPattern)';
    case TerrainType.ROUGH:
      return 'url(#roughPattern)';
    default:
      return '';
  }
}

// Single Hex Component
const Hexagon: React.FC<{
  hex: Hex;
  size: number;
  isSelected: boolean;
  isValidMove: boolean;
  isValidTarget: boolean;
  onClick: () => void;
}> = ({ hex, size, isSelected, isValidMove, isValidTarget, onClick }) => {
  const { x, y } = hexToPixel(hex.coord, size);
  
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (60 * i - 30) * Math.PI / 180;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  
  const terrainColor = getTerrainColor(hex.terrain);
  const terrainPattern = getTerrainPattern(hex.terrain);
  
  return (
    <g 
      onClick={onClick}
      className="cursor-pointer hover:opacity-80 transition-opacity"
    >
      <polygon
        points={points.join(' ')}
        fill={terrainPattern || terrainColor}
        stroke={isSelected ? '#FFD700' : isValidMove ? '#00FF00' : isValidTarget ? '#FF0000' : '#333'}
        strokeWidth={isSelected ? 3 : isValidMove || isValidTarget ? 2 : 1}
        className={cn(
          "transition-all duration-200",
          isValidMove && "animate-pulse",
          isValidTarget && "animate-pulse"
        )}
      />
      
      {hex.elevation > 0 && (
        <text
          x={x}
          y={y - size * 0.3}
          textAnchor="middle"
          className="text-xs fill-white font-bold"
          style={{ fontSize: size * 0.25 }}
        >
          ↑{hex.elevation}
        </text>
      )}
      
      <text
        x={x}
        y={y + size * 0.2}
        textAnchor="middle"
        className="text-xs fill-white"
        style={{ fontSize: size * 0.2 }}
      >
        {TERRAIN_TYPES[hex.terrain].name.substring(0, 3)}
      </text>
      
      {hex.unit && (
        <g>
          <circle
            cx={x}
            cy={y}
            r={size * 0.5}
            fill={hex.unit.shutdown ? '#666' : '#1E90FF'}
            stroke="#FFF"
            strokeWidth={2}
          />
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            className="text-xs fill-white font-bold"
            style={{ fontSize: size * 0.2 }}
          >
            {hex.unit.name.substring(0, 3)}
          </text>
          
          <line
            x1={x}
            y1={y}
            x2={x + size * 0.6 * Math.cos((hex.unit.facing * 60 - 30) * Math.PI / 180)}
            y2={y + size * 0.6 * Math.sin((hex.unit.facing * 60 - 30) * Math.PI / 180)}
            stroke="#FFD700"
            strokeWidth={2}
          />
          
          {hex.unit.heat > 0 && (
            <circle
              cx={x + size * 0.35}
              cy={y - size * 0.35}
              r={size * 0.15}
              fill={hex.unit.heat > 20 ? '#FF0000' : hex.unit.heat > 10 ? '#FFA500' : '#FFFF00'}
            />
          )}
          
          {!hex.unit.alive && (
            <text
              x={x}
              y={y - size * 0.3}
              textAnchor="middle"
              className="fill-red-500 font-bold"
              style={{ fontSize: size * 0.3 }}
            >
              ✖
            </text>
          )}
        </g>
      )}
      
      <text
        x={x}
        y={y + size * 0.5}
        textAnchor="middle"
        className="text-xs fill-gray-400"
        style={{ fontSize: size * 0.15 }}
      >
        {hex.coord.q},{hex.coord.r}
      </text>
    </g>
  );
};

// Main Hex Grid Component
export const HexGrid: React.FC<HexGridProps> = ({
  hexes,
  selectedUnit,
  validMoveHexes,
  validTargetHexes,
  onHexClick,
  size = 30
}) => {
  const validMoveSet = new Set(validMoveHexes.map(getHexKey));
  const validTargetSet = new Set(validTargetHexes.map(getHexKey));
  
  const hexArray = Array.from(hexes.values());
  const minX = Math.min(...hexArray.map(h => hexToPixel(h.coord, size).x));
  const maxX = Math.max(...hexArray.map(h => hexToPixel(h.coord, size).x));
  const minY = Math.min(...hexArray.map(h => hexToPixel(h.coord, size).y));
  const maxY = Math.max(...hexArray.map(h => hexToPixel(h.coord, size).y));
  
  const width = maxX - minX + size * 4;
  const height = maxY - minY + size * 4;
  const offsetX = -minX + size * 2;
  const offsetY = -minY + size * 2;
  
  const handleHexClick = useCallback((hex: Hex) => {
    onHexClick(hex);
  }, [onHexClick]);
  
  return (
    <div className="overflow-auto bg-gray-900 rounded-lg border border-gray-700">
      <svg 
        width={width} 
        height={height}
        className="block"
      >
        <defs>
          <pattern id="lightWoodsPattern" patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill="#4A7C59" />
            <circle cx="2" cy="2" r="1" fill="#2D5016" />
            <circle cx="7" cy="7" r="1" fill="#2D5016" />
          </pattern>
          
          <pattern id="heavyWoodsPattern" patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill="#2D5016" />
            <circle cx="3" cy="3" r="1.5" fill="#1A3009" />
            <circle cx="8" cy="8" r="1.5" fill="#1A3009" />
          </pattern>
          
          <pattern id="roughPattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="#696969" />
            <rect x="1" y="1" width="2" height="2" fill="#555" />
            <rect x="5" y="5" width="2" height="2" fill="#777" />
          </pattern>
        </defs>
        
        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {hexArray.map(hex => {
            const hexKey = getHexKey(hex.coord);
            const isSelected = selectedUnit?.position && 
              getHexKey(selectedUnit.position) === hexKey;
            const isValidMove = validMoveSet.has(hexKey);
            const isValidTarget = validTargetSet.has(hexKey);
            
            return (
              <Hexagon
                key={hexKey}
                hex={hex}
                size={size}
                isSelected={!!isSelected}
                isValidMove={isValidMove}
                isValidTarget={isValidTarget}
                onClick={() => handleHexClick(hex)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default HexGrid;
