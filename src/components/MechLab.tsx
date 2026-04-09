// Mech Lab - Custom Mech Builder

import { useState, useMemo } from 'react';
import type { Unit, Weapon } from '@/types/battletech';
import { WEAPON_DATABASE } from '@/lib/weapon-database';
import { getAllUnitsAndVehicles, cloneUnit } from '@/engine/units';
import { getMechSmallImage, hasMechImages } from '@/lib/mech-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Wrench, Plus, Trash2, Save } from 'lucide-react';

interface MechLabProps {
  onSave: (customizedMech: Unit) => void;
  onCancel: () => void;
}

interface MechConfig {
  name: string;
  baseUnit: Unit;
  selectedWeapons: Weapon[];
  heatSinks: number;
  doubleHeatSinks: boolean;
}

export function MechLab({ onSave, onCancel }: MechLabProps) {
  const allUnits = useMemo(() => getAllUnitsAndVehicles(), []);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [config, setConfig] = useState<MechConfig>({
    name: allUnits[0]?.name || 'Custom Mech',
    baseUnit: cloneUnit(allUnits[0]),
    selectedWeapons: allUnits[0]?.weapons ? [...allUnits[0].weapons] : [],
    heatSinks: allUnits[0]?.heatSinks || 10,
    doubleHeatSinks: allUnits[0]?.doubleHeatSinks || false
  });

  const currentUnit = allUnits[selectedUnitIndex];

  const handleUnitChange = (index: number) => {
    setSelectedUnitIndex(index);
    const newBase = cloneUnit(allUnits[index]);
    setConfig({
      name: newBase.name,
      baseUnit: newBase,
      selectedWeapons: [...newBase.weapons],
      heatSinks: newBase.heatSinks,
      doubleHeatSinks: newBase.doubleHeatSinks
    });
  };

  const handleRemoveWeapon = (index: number) => {
    setConfig({
      ...config,
      selectedWeapons: config.selectedWeapons.filter((_, i) => i !== index)
    });
  };

  const handleAddWeapon = (weaponName: string) => {
    const weaponData = WEAPON_DATABASE[weaponName];
    if (!weaponData) return;

    const newWeapon: Weapon = {
      id: `weapon-${Date.now()}-${Math.random()}`,
      name: weaponName,
      damage: weaponData.damage,
      heat: weaponData.heat,
      minRange: weaponData.minRange || 0,
      shortRange: weaponData.shortRange,
      mediumRange: weaponData.mediumRange,
      longRange: weaponData.longRange,
      type: weaponData.type,
      shotsRemaining: Infinity,
      location: 'CT',
      criticalSlots: weaponData.criticalSlots || 1,
      tonnage: weaponData.tonnage
    };

    setConfig({
      ...config,
      selectedWeapons: [...config.selectedWeapons, newWeapon]
    });
  };

  const handleSave = () => {
    const customMech = cloneUnit(config.baseUnit);
    customMech.name = config.name;
    customMech.heatSinks = config.heatSinks;
    customMech.doubleHeatSinks = config.doubleHeatSinks;
    customMech.weapons = [...config.selectedWeapons];
    onSave(customMech);
  };

  const getAvailableWeapons = (): string[] => {
    return Object.keys(WEAPON_DATABASE).slice(0, 20); // Limit to first 20 for simplicity
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-2">
            <Wrench className="w-8 h-8" />
            Mech Lab
          </h1>
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline">Cancel</Button>
            <Button onClick={handleSave} className="bg-blue-600">
              <Save className="w-4 h-4 mr-2" />Save Mech
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column: Base Mech Selection */}
          <div className="col-span-2 space-y-4">
            {/* Mech Selection */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <label className="block text-sm font-semibold mb-2">Base Mech</label>
              <select
                value={selectedUnitIndex}
                onChange={(e) => handleUnitChange(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 p-3 rounded text-white"
              >
                {allUnits.map((u, i) => (
                  <option key={u.id} value={i}>{u.name} ({u.tonnage}t)</option>
                ))}
              </select>
            </Card>

            {/* Name Input */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <label className="block text-sm font-semibold mb-2">Custom Name</label>
              <Input
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="bg-gray-700 border-gray-600"
                placeholder="Enter custom mech name..."
              />
            </Card>

            {/* Heat Sink Configuration */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Heat Management</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Standard Heat Sinks:</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfig({ ...config, heatSinks: Math.max(0, config.heatSinks - 1) })}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-bold">{config.heatSinks}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfig({ ...config, heatSinks: config.heatSinks + 1 })}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.doubleHeatSinks}
                    onChange={(e) => setConfig({ ...config, doubleHeatSinks: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-400">Use Double Heat Sinks</span>
                </label>
              </div>
            </Card>

            {/* Weapons */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Weapons ({config.selectedWeapons.length})</h3>
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {config.selectedWeapons.length > 0 ? (
                  config.selectedWeapons.map((weapon, idx) => (
                    <div key={weapon.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                      <div className="flex-1">
                        <p className="font-semibold">{weapon.name}</p>
                        <p className="text-xs text-gray-400">{weapon.damage}dmg | {weapon.heat}ht | {weapon.tonnage}t</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveWeapon(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No weapons selected</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">Add Weapon:</p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {getAvailableWeapons().map(weaponName => (
                    <Button
                      key={weaponName}
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddWeapon(weaponName)}
                      className="text-xs h-auto"
                    >
                      <Plus className="w-3 h-3 mr-1" />{weaponName}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="text-center">
                {currentUnit && hasMechImages(currentUnit.name) && (
                  <img
                    src={getMechSmallImage(currentUnit.name)}
                    alt={currentUnit.name}
                    className="w-full max-w-48 mx-auto mb-4"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" fill="%23444"%3E%3C/rect%3E%3C/svg%3E';
                    }}
                  />
                )}
                <h3 className="text-xl font-bold mt-4 text-blue-400">{config.name}</h3>
                <p className="text-sm text-gray-400">{currentUnit?.tonnage}t {currentUnit?.class || 'Unit'}</p>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h4 className="font-semibold mb-3">Configuration Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Heat Sinks:</span>
                  <span className="font-bold">{config.heatSinks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="font-bold">{config.doubleHeatSinks ? 'Double' : 'Standard'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weapons:</span>
                  <span className="font-bold">{config.selectedWeapons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Heat:</span>
                  <span className="font-bold text-yellow-400">
                    {config.selectedWeapons.reduce((sum, w) => sum + w.heat, 0)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
