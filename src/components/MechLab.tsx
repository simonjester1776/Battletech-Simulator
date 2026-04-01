// Mech Lab - Custom Mech Builder

import { useState } from 'react';
import type { Unit } from '@/types/battletech';
import { WEAPON_DATABASE, type WeaponData } from '@/lib/weapon-database';
import { getAllUnitsAndVehicles } from '@/engine/units';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Wrench, Plus, Trash2, Save, Download, ArrowLeft } from 'lucide-react';

interface MechLabProps {
  onSave: (customizedMech: Unit) => void;
  onCancel: () => void;
}

export function MechLab({ onSave, onCancel }: MechLabProps) {
  const allUnits = getAllUnitsAndVehicles();
  const [selectedUnitId, setSelectedUnitId] = useState(allUnits[0]?.id || '');
  const baseMech = allUnits.find(u => u.id === selectedUnitId) || allUnits[0];
  
  const [mechName, setMechName] = useState(baseMech.name);
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>(
    baseMech.weapons.map(w => w.name)
  );
  const [selectedLocation, setSelectedLocation] = useState<string>('CT');
  const [techBase, setTechBase] = useState<'IS' | 'CLAN' | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<string>('all');
  
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
  
  const handleChassisChange = (newUnitId: string) => {
    const newUnit = allUnits.find(u => u.id === newUnitId);
    if (newUnit) {
      setSelectedUnitId(newUnitId);
      setMechName(newUnit.name);
      // Reset weapons to the new chassis default loadout
      setSelectedWeapons(newUnit.weapons.map(w => w.name));
    }
  };
  
  const locations = ['HD', 'CT', 'RT', 'LT', 'RA', 'LA', 'RL', 'LL'];
  
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-2">
                <Wrench className="w-8 h-8" />
                Mech Lab
              </h1>
              <p className="text-gray-400">Custom Mech Builder & Loadout Designer</p>
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
            <h2 className="text-xl font-bold mb-4 text-blue-400">Mech Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Select Chassis</label>
                <Select value={selectedUnitId} onValueChange={handleChassisChange}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-96">
                    <div className="px-2 py-1.5 text-xs font-semibold text-blue-400">BATTLEMECHS</div>
                    {allUnits.filter(u => u.unitType === 'Mech').map(unit => (
                      <SelectItem key={unit.id} value={unit.id} className="text-white">
                        {unit.name} ({unit.tonnage}t)
                      </SelectItem>
                    ))}
                    
                    {allUnits.some(u => u.unitType === 'Vehicle') && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-blue-400 mt-2">COMBAT VEHICLES</div>
                        {allUnits.filter(u => u.unitType === 'Vehicle').map(unit => (
                          <SelectItem key={unit.id} value={unit.id} className="text-white">
                            {unit.name} ({unit.tonnage}t)
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    {allUnits.some(u => u.unitType === 'BattleArmor') && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-blue-400 mt-2">BATTLE ARMOR</div>
                        {allUnits.filter(u => u.unitType === 'BattleArmor').map(unit => (
                          <SelectItem key={unit.id} value={unit.id} className="text-white">
                            {unit.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
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
                <p className="font-bold">{baseMech.name}</p>
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
                <h3 className="font-semibold mb-3 text-yellow-400">Loadout Summary</h3>
                
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
            <h2 className="text-xl font-bold mb-4 text-blue-400">Current Loadout</h2>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
                        <p className="font-semibold text-sm">{weapon.name}</p>
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
          </div>
          
          {/* Right Panel - Available Weapons */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Weapon Database</h2>
            
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
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {availableWeapons.map(weapon => (
                <div
                  key={weapon.name}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-3"
                  data-testid={`weapon-${weapon.name.replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{weapon.name}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
