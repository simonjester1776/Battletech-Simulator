// Unit Panel Component - Displays unit status, armor, structure, heat, and weapons

import type { Unit, Weapon, Location } from '@/types/battletech';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Crosshair, Thermometer, User, Shield, Heart } from 'lucide-react';
import { getMechIcon, hasMechImages } from '@/lib/mech-images';

interface UnitPanelProps {
  unit: Unit | null;
  isSelected: boolean;
  onSelect?: () => void;
  onWeaponClick?: (weaponId: string) => void;
  showWeapons?: boolean;
  disabled?: boolean;
}

function getStatusColor(percent: number): string {
  if (percent > 66) return 'bg-green-500';
  if (percent > 33) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getHeatWarning(heat: number): string | null {
  if (heat >= 30) return 'AUTO-SHUTDOWN!';
  if (heat >= 28) return 'Ammo Explosion Risk!';
  if (heat >= 20) return 'Shutdown Risk!';
  if (heat >= 15) return 'Movement Penalty';
  if (heat >= 10) return 'Heat Building';
  return null;
}

const LocationBar: React.FC<{
  name: string;
  location: Location;
  compact?: boolean;
}> = ({ name, location, compact = false }) => {
  const armorPercent = location.maxArmor > 0 
    ? (location.armor / location.maxArmor) * 100 
    : 0;
  const structurePercent = location.maxStructure > 0 
    ? (location.structure / location.maxStructure) * 100 
    : 0;
  
  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs">
        <span className="w-8 font-mono text-gray-400">{name}</span>
        <div className="flex-1 flex gap-0.5">
          <div 
            className={cn(
              "h-2 flex-1 rounded-sm",
              armorPercent > 50 ? 'bg-blue-500' : armorPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${armorPercent}%` }}
          />
        </div>
        <div className="flex gap-0.5">
          <div 
            className={cn(
              "h-2 w-1 rounded-sm",
              structurePercent > 50 ? 'bg-green-500' : structurePercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
            )}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-mono text-gray-300">{name}</span>
        <span className="text-gray-400">
          A:{location.armor}/{location.maxArmor} S:{location.structure}/{location.maxStructure}
        </span>
      </div>
      <div className="flex gap-1">
        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className={cn("h-full transition-all", getStatusColor(armorPercent))}
            style={{ width: `${armorPercent}%` }}
          />
        </div>
        <div className="w-8 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className={cn("h-full transition-all", getStatusColor(structurePercent))}
            style={{ width: `${structurePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const WeaponItem: React.FC<{
  weapon: Weapon;
  canFire: boolean;
  onClick?: () => void;
}> = ({ weapon, canFire, onClick }) => {
  const rangeText = `${weapon.minRange > 0 ? weapon.minRange + '-' : ''}${weapon.shortRange}/${weapon.mediumRange}/${weapon.longRange}`;
  
  return (
    <div 
      onClick={canFire ? onClick : undefined}
      className={cn(
        "p-2 rounded border text-sm",
        canFire 
          ? "bg-gray-800 border-gray-600 cursor-pointer hover:bg-gray-700" 
          : "bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex justify-between items-start">
        <span className={cn("font-medium", canFire ? 'text-white' : 'text-gray-500')}>
          {weapon.name}
        </span>
        <div className="flex gap-1">
          {weapon.shotsRemaining !== 999 && (
            <Badge variant="outline" className="text-xs">
              {weapon.shotsRemaining}
            </Badge>
          )}
          <Badge 
            variant={canFire ? "default" : "secondary"}
            className="text-xs"
          >
            {weapon.damage}
          </Badge>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>H:{weapon.heat}</span>
        <span>{rangeText}</span>
        <span>{weapon.location}</span>
      </div>
    </div>
  );
};

export const UnitPanel: React.FC<UnitPanelProps> = ({
  unit,
  isSelected,
  onSelect,
  onWeaponClick,
  showWeapons = true,
  disabled = false
}) => {
  if (!unit) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center text-gray-500">
        <p>No unit selected</p>
      </div>
    );
  }
  
  let totalArmor = 0;
  let maxArmor = 0;
  let totalStructure = 0;
  let maxStructure = 0;
  
  unit.locations.forEach(loc => {
    totalArmor += loc.armor;
    maxArmor += loc.maxArmor;
    totalStructure += loc.structure;
    maxStructure += loc.maxStructure;
  });
  
  const armorPercent = maxArmor > 0 ? (totalArmor / maxArmor) * 100 : 0;
  const structurePercent = maxStructure > 0 ? (totalStructure / maxStructure) * 100 : 0;
  const heatWarning = getHeatWarning(unit.heat);
  
  const hasEngineDamage = unit.engineHits > 0;
  const hasGyroDamage = unit.gyroHits > 0;
  const hasSensorDamage = unit.sensorHits > 0;
  
  return (
    <div 
      className={cn(
        "bg-gray-900 border rounded-lg overflow-hidden",
        isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-700',
        disabled && 'opacity-50'
      )}
    >
      <div 
        className="p-3 bg-gray-800 border-b border-gray-700 cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {/* Mech Icon */}
            <div className="mech-icon w-12 h-12 flex-shrink-0">
              <img 
                src={getMechIcon(unit.name)} 
                alt={unit.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/madcat_icon.gif';
                }}
              />
            </div>
            <div>
              <h3 className="font-bold text-white mech-label">{unit.name}</h3>
              <p className="text-xs text-gray-400">
                {unit.tonnage}t | {unit.walkingMP}/{unit.runningMP}{unit.jumpingMP > 0 ? `/${unit.jumpingMP}` : ''} MP
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge 
              variant={unit.alive ? "default" : "destructive"}
              className="text-xs"
            >
              {unit.alive ? (unit.shutdown ? 'SHUTDOWN' : 'ACTIVE') : 'DESTROYED'}
            </Badge>
            <span className="text-xs text-gray-400">
              BV: {unit.bv2}
            </span>
          </div>
        </div>
        
        <div className="mt-2 flex items-center gap-2 text-xs">
          <User className="w-3 h-3 text-gray-400" />
          <span className="text-gray-300">{unit.pilot.name}</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">G{unit.pilot.gunnery}/P{unit.pilot.piloting}</span>
          {unit.pilot.hits > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unit.pilot.hits} Hits
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-300">
              <Shield className="w-3 h-3" /> Armor
            </span>
            <span className="text-gray-400">{totalArmor}/{maxArmor}</span>
          </div>
          <Progress value={armorPercent} className="h-2" />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-300">
              <Heart className="w-3 h-3" /> Structure
            </span>
            <span className="text-gray-400">{totalStructure}/{maxStructure}</span>
          </div>
          <Progress value={structurePercent} className="h-2" />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-300">
              <Thermometer className="w-3 h-3" /> Heat
            </span>
            <span className={cn(
              "font-mono",
              unit.heat > 15 ? 'text-red-400' : 'text-gray-400'
            )}>
              {unit.heat}/{unit.heatSinks * (unit.doubleHeatSinks ? 2 : 1)}
            </span>
          </div>
          <Progress 
            value={(unit.heat / 30) * 100} 
            className="h-2"
          />
          {heatWarning && (
            <p className={cn(
              "text-xs",
              unit.heat > 20 ? 'text-red-400 font-bold' : 'text-yellow-400'
            )}>
              ⚠ {heatWarning}
            </p>
          )}
        </div>
        
        {(hasEngineDamage || hasGyroDamage || hasSensorDamage) && (
          <div className="flex flex-wrap gap-1">
            {hasEngineDamage && (
              <Badge variant="destructive" className="text-xs">
                Engine Hit #{unit.engineHits}
              </Badge>
            )}
            {hasGyroDamage && (
              <Badge variant="destructive" className="text-xs">
                Gyro Hit #{unit.gyroHits}
              </Badge>
            )}
            {hasSensorDamage && (
              <Badge variant="destructive" className="text-xs">
                Sensors Hit #{unit.sensorHits}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {unit.hasECM && <Badge variant="outline" className="text-xs">ECM</Badge>}
          {unit.hasAMS && <Badge variant="outline" className="text-xs">AMS</Badge>}
          {unit.hasCASE && <Badge variant="outline" className="text-xs">CASE</Badge>}
          {unit.hasXLEngine && <Badge variant="outline" className="text-xs">XL</Badge>}
          {unit.doubleHeatSinks && <Badge variant="outline" className="text-xs">DHS</Badge>}
          {unit.hasTSM && <Badge variant="outline" className="text-xs">TSM</Badge>}
          {unit.hasMASC && <Badge variant="outline" className="text-xs">MASC</Badge>}
        </div>
      </div>
      
      <div className="px-3 pb-2">
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
            Location Status
          </summary>
          <div className="mt-2 space-y-1">
            {Array.from(unit.locations.entries()).map(([name, loc]) => (
              <LocationBar key={name} name={name} location={loc} compact />
            ))}
          </div>
        </details>
      </div>
      
      {showWeapons && (
        <div className="border-t border-gray-700">
          <div className="p-2 bg-gray-800">
            <h4 className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              <Crosshair className="w-3 h-3" /> Weapons
            </h4>
          </div>
          <ScrollArea className="h-48">
            <div className="p-2 space-y-1">
              {unit.weapons.map(weapon => {
                const canFire = weapon.damage > 0 && 
                  (weapon.shotsRemaining > 0 || weapon.shotsRemaining === 999) &&
                  !unit.shutdown &&
                  unit.alive;
                
                return (
                  <WeaponItem
                    key={weapon.id}
                    weapon={weapon}
                    canFire={canFire}
                    onClick={() => onWeaponClick?.(weapon.id)}
                  />
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default UnitPanel;
