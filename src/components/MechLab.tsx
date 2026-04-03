// Mech Lab - Custom Mech Builder

import { useState, useMemo, useEffect } from 'react';
import type { Unit } from '@/types/battletech';
import { WEAPON_DATABASE } from '@/lib/weapon-database';
import { getAllUnitsAndVehicles, cloneUnit } from '@/engine/units';
import { getMechFullImage, getMechIcon, hasMechImages } from '@/lib/mech-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Wrench, Plus, Trash2, Save, Download, ChevronDown } from 'lucide-react';

interface MechLabProps {
  onSave: (customizedMech: Unit) => void;
  onCancel: () => void;
}

export function MechLab({ onSave, onCancel }: MechLabProps) {
  const allUnits = useMemo(() => getAllUnitsAndVehicles(), []);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [showChassisSelector, setShowChassisSelector] = useState(false);
  
  const baseMech = useMemo(() => {
    const unit = allUnits[selectedUnitIndex];
    return unit ? cloneUnit(unit) : cloneUnit(allUnits[0]);
  }, [allUnits, selectedUnitIndex]);
  
  const [mechName, setMechName] = useState(baseMech.name);
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>(
    baseMech.weapons.map(w => w.name)
  );
  const [selectedLocation, setSelectedLocation] = useState<string>('CT');
  const [techBase, setTechBase] = useState<'IS' | 'CLAN' | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Update weapons when chassis changes
  useEffect(() => {
    setMechName(baseMech.name);
    setSelectedWeapons(baseMech.weapons.map(w => w.name));
  }, [baseMech]);
  
  const availableWeapons = Object.values(WEAPON_DATABASE).filter(weapon => {
    if (techBase !== 'ALL' && weapon.techBase !== 'BOTH' && weapon.techBase !== techBase) {
      return false;
    }
    if (filterType !== 'all' && weapon.type !== filterType) {
      return false;
    }
    return true;
  });
  
  const totalTonnage = selectedWeapons.reduce((sum, weaponName) => {
    const weapon = WEAPON_DATABASE[weaponName];
    return sum + (weapon?.tonnage || 0);
  }, 0);
  
  const totalCost = selectedWeapons.reduce((sum, weaponName) => {
    const weapon = WEAPON_DATABASE[weaponName];
    return sum + (weapon?.cost || 0);
  }, 0);
  
  const totalCritSlots = selectedWeapons.reduce((sum, weaponName) => {
    const weapon = WEAPON_DATABASE[weaponName];
    return sum + (weapon?.criticalSlots || 0);
  }, 0);
  
  const totalHeat = selectedWeapons.reduce((sum, weaponName) => {
    const weapon = WEAPON_DATABASE[weaponName];
    return sum + (weapon?.heat || 0);
  }, 0);
  
  const addWeapon = (weaponName: string) => {
    setSelectedWeapons([...selectedWeapons, weaponName]);
  };
  
  const removeWeapon = (index: number) => {
    setSelectedWeapons(selectedWeapons.filter((_, i) => i !== index));
  };
  
  const handleChassisSelect = (index: number) => {
    setSelectedUnitIndex(index);
    setShowChassisSelector(false);
  };
  
  const locations = ['HD', 'CT', 'RT', 'LT', 'RA', 'LA', 'RL', 'LL'];
  
  // Group units by type
  const mechUnits = allUnits.filter(u => u.unitType === 'Mech');
  const vehicleUnits = allUnits.filter(u => u.unitType === 'Vehicle');
  const battleArmorUnits = allUnits.filter(u => u.unitType === 'BattleArmor');
  
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 mech-cursor">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-2 battletech-title">
                <Wrench className="w-8 h-8" />
                Mech Lab
              </h1>
              <p className="text-gray-400 mech-label">Custom Mech Builder & Loadout Designer</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onCancel} variant="outline" data-testid="mechlab-cancel">
                Cancel
              </Button>
              <Button onClick={() => onSave(baseMech)} className="bg-blue-600 hover:bg-blue-700" data-testid="mechlab-save">
                <Save className="w-4 h-4 mr-2" />
                Save Design
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" data-testid="mechlab-export">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel - Mech Info & Stats */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400 battletech-title">Mech Configuration</h2>
            
            {/* Mech Preview Image */}
            <div className="mb-4 flex justify-center">
              <div className="mech-icon w-32 h-32 mech-spotlight">
                {hasMechImages(baseMech.name) ? (
                  <img 
                    src={getMechFullImage(baseMech.name)} 
                    alt={baseMech.name}
                    className="max-w-full max-h-full object-contain mech-animated"
                  />
                ) : (
                  <img 
                    src="/images/madcat.gif" 
                    alt="Mech"
                    className="max-w-full max-h-full object-contain mech-animated"
                  />
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Custom Chassis Selector */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Select Chassis</label>
                <div className="relative">
                  <button
                    onClick={() => setShowChassisSelector(!showChassisSelector)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center justify-between hover:border-blue-500 transition-colors"
                    data-testid="chassis-selector-btn"
                  >
                    <div className="flex items-center gap-3">
                      <div className="mech-icon w-10 h-10">
                        <img 
                          src={getMechIcon(baseMech.name)} 
                          alt={baseMech.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-white">{baseMech.name}</p>
                        <p className="text-xs text-gray-400">{baseMech.tonnage}t {baseMech.unitType}</p>
                      </div>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", showChassisSelector && "rotate-180")} />
                  </button>
                  
                  {/* Chassis Dropdown */}
                  {showChassisSelector && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-hidden">
                      <ScrollArea className="h-96">
                        <div className="p-2">
                          {/* BattleMechs */}
                          <div className="px-2 py-1.5 text-xs font-semibold text-blue-400 battletech-title sticky top-0 bg-gray-800">BATTLEMECHS</div>
                          {mechUnits.map((unit, i) => {
                            const globalIndex = allUnits.indexOf(unit);
                            return (
                              <button
                                key={unit.id}
                                onClick={() => handleChassisSelect(globalIndex)}
                                className={cn(
                                  "w-full p-2 flex items-center gap-3 rounded hover:bg-gray-700 transition-colors",
                                  selectedUnitIndex === globalIndex && "bg-blue-900/50"
                                )}
                                data-testid={`chassis-option-${unit.name.replace(/\s+/g, '-')}`}
                              >
                                <div className="mech-icon w-8 h-8">
                                  <img 
                                    src={getMechIcon(unit.name)} 
                                    alt={unit.name}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                                <div className="text-left flex-1">
                                  <p className="text-sm font-medium text-white">{unit.name}</p>
                                  <p className="text-xs text-gray-400">{unit.tonnage}t</p>
                                </div>
                              </button>
                            );
                          })}
                          
                          {/* Vehicles */}
                          {vehicleUnits.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-blue-400 battletech-title sticky top-0 bg-gray-800 mt-2">COMBAT VEHICLES</div>
                              {vehicleUnits.map((unit) => {
                                const globalIndex = allUnits.indexOf(unit);
                                return (
                                  <button
                                    key={unit.id}
                                    onClick={() => handleChassisSelect(globalIndex)}
                                    className={cn(
                                      "w-full p-2 flex items-center gap-3 rounded hover:bg-gray-700 transition-colors",
                                      selectedUnitIndex === globalIndex && "bg-blue-900/50"
                                    )}
                                    data-testid={`chassis-option-${unit.name.replace(/\s+/g, '-')}`}
                                  >
                                    <div className="mech-icon w-8 h-8">
                                      <img 
                                        src="/images/madcat_icon.gif" 
                                        alt={unit.name}
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    </div>
                                    <div className="text-left flex-1">
                                      <p className="text-sm font-medium text-white">{unit.name}</p>
                                      <p className="text-xs text-gray-400">{unit.tonnage}t</p>
                                    </div>
                                  </button>
                                );
                              })}
                            </>
                          )}
                          
                          {/* Battle Armor */}
                          {battleArmorUnits.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-blue-400 battletech-title sticky top-0 bg-gray-800 mt-2">BATTLE ARMOR</div>
                              {battleArmorUnits.map((unit) => {
                                const globalIndex = allUnits.indexOf(unit);
                                return (
                                  <button
                                    key={unit.id}
                                    onClick={() => handleChassisSelect(globalIndex)}
                                    className={cn(
                                      "w-full p-2 flex items-center gap-3 rounded hover:bg-gray-700 transition-colors",
                                      selectedUnitIndex === globalIndex && "bg-blue-900/50"
                                    )}
                                    data-testid={`chassis-option-${unit.name.replace(/\s+/g, '-')}`}
                                  >
                                    <div className="mech-icon w-8 h-8">
                                      <img 
                                        src="/images/madcat_icon.gif" 
                                        alt={unit.name}
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    </div>
                                    <div className="text-left flex-1">
                                      <p className="text-sm font-medium text-white">{unit.name}</p>
                                    </div>
                                  </button>
                                );
                              })}
                            </>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Designation</label>
                <Input
                  value={mechName}
                  onChange={(e) => setMechName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  data-testid="mech-name-input"
                />
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Base Chassis</p>
                <p className="font-bold mech-label">{baseMech.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Tonnage</p>
                <p className="font-bold">{baseMech.tonnage} tons</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Movement</p>
                <p className="font-bold">{baseMech.walkingMP}/{baseMech.runningMP}/{baseMech.jumpingMP}</p>
              </div>
              
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="font-semibold mb-3 text-yellow-400 battletech-title">Loadout Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Weapons:</span>
                    <span className="font-bold">{selectedWeapons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Tonnage:</span>
                    <span className={cn(
                      "font-bold",
                      totalTonnage > baseMech.tonnage ? "text-red-400" : "text-green-400"
                    )}>
                      {totalTonnage.toFixed(1)} / {baseMech.tonnage}t
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Critical Slots:</span>
                    <span className={cn(
                      "font-bold",
                      totalCritSlots > 78 ? "text-red-400" : "text-green-400"
                    )}>
                      {totalCritSlots} / 78
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Heat Load:</span>
                    <span className={cn(
                      "font-bold",
                      totalHeat > baseMech.heatSinks * 2 ? "text-red-400" : 
                      totalHeat > baseMech.heatSinks ? "text-yellow-400" : "text-green-400"
                    )}>
                      {totalHeat} / {baseMech.heatSinks * 2}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated Cost:</span>
                    <span className="font-bold text-green-400">
                      {totalCost.toLocaleString()} C-Bills
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Location Selection */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="font-semibold mb-3">Mount Location</h3>
                <div className="grid grid-cols-4 gap-2">
                  {locations.map(loc => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocation(loc)}
                      className={cn(
                        "p-2 rounded border text-xs font-bold transition-colors",
                        selectedLocation === loc
                          ? "bg-blue-600 border-blue-500"
                          : "bg-gray-800 border-gray-700 hover:bg-gray-750"
                      )}
                      data-testid={`location-${loc}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Middle Panel - Current Loadout */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400 battletech-title">Current Loadout</h2>
            
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {selectedWeapons.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No weapons installed</p>
                ) : (
                  selectedWeapons.map((weaponName, index) => {
                    const weapon = WEAPON_DATABASE[weaponName];
                    if (!weapon) return null;
                    
                    return (
                      <div
                        key={index}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center justify-between"
                        data-testid={`loadout-weapon-${index}`}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm mech-label">{weapon.name}</p>
                          <div className="flex gap-4 text-xs text-gray-400 mt-1">
                            <span>DMG: {weapon.damage}</span>
                            <span>Heat: {weapon.heat}</span>
                            <span>{weapon.tonnage}t</span>
                            <span>{weapon.criticalSlots} slots</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeWeapon(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          data-testid={`remove-weapon-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Right Panel - Available Weapons */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400 battletech-title">Weapon Database</h2>
            
            {/* Filters */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tech Base</label>
                <div className="flex gap-2">
                  {(['ALL', 'IS', 'CLAN'] as const).map(tech => (
                    <button
                      key={tech}
                      onClick={() => setTechBase(tech)}
                      className={cn(
                        "px-3 py-1 rounded text-xs font-semibold transition-colors",
                        techBase === tech
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-750"
                      )}
                      data-testid={`filter-tech-${tech}`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Weapon Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  data-testid="filter-weapon-type"
                >
                  <option value="all">All Types</option>
                  <option value="energy">Energy</option>
                  <option value="ballistic">Ballistic</option>
                  <option value="missile">Missile</option>
                  <option value="machine_gun">Machine Gun</option>
                </select>
              </div>
            </div>
            
            {/* Weapons List */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {availableWeapons.map(weapon => (
                  <div
                    key={weapon.name}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-3"
                    data-testid={`weapon-${weapon.name.replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm mech-label">{weapon.name}</p>
                        <p className="text-xs text-gray-400">
                          {weapon.techBase === 'BOTH' ? 'IS/Clan' : weapon.techBase}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addWeapon(weapon.name)}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid={`add-weapon-${weapon.name.replace(/\s+/g, '-')}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>DMG: {weapon.damage}</div>
                      <div>Heat: {weapon.heat}</div>
                      <div>Range: {weapon.shortRange}/{weapon.mediumRange}/{weapon.longRange}</div>
                      <div>{weapon.tonnage}t / {weapon.criticalSlots} slots</div>
                    </div>
                    
                    <div className="mt-2 text-xs text-green-400">
                      {weapon.cost.toLocaleString()} C-Bills
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
