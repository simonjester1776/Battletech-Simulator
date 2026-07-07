// Campaign Management UI

import { useState, useMemo } from 'react';
import type { MercenaryCompany, Contract, StoreWeaponOffer, StoreMechOffer } from '@/lib/campaign';
import { CampaignManager } from '@/lib/campaign';
import type { Unit } from '@/types/battletech';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { MidiPlayer } from '@/components/MidiPlayer';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Wrench, 
  DollarSign, 
  Award,
  Shield,
  FileText,
  Plus,
  ShoppingCart,
  Trash2
} from 'lucide-react';
import { MechLab } from '@/components/MechLab';

const PILOT_POOL = [
  { name: 'Alex "Striker" Carson', gunnery: 3, piloting: 4 },
  { name: 'Jamie "Razor" Kovalski', gunnery: 4, piloting: 3 },
  { name: 'Morgan "Steel" Chen', gunnery: 3, piloting: 3 },
  { name: 'Devon "Hawk" Matthews', gunnery: 2, piloting: 4 },
  { name: 'Taylor "Blaze" Rodriguez', gunnery: 4, piloting: 4 },
  { name: 'Casey "Pulse" Anderson', gunnery: 3, piloting: 5 },
  { name: 'Blake "Viper" Thompson', gunnery: 2, piloting: 3 },
  { name: 'Jordan "Ghost" Williams', gunnery: 4, piloting: 2 },
];

interface CampaignScreenProps {
  campaignManager: CampaignManager;
  onStartMission: (contract: Contract) => void;
  onBack: () => void;
}

type CampaignTab = 'overview' | 'pilots' | 'mechs' | 'contracts' | 'store';

export function CampaignScreen({ campaignManager, onStartMission, onBack }: CampaignScreenProps) {
  const [activeTab, setActiveTab] = useState<CampaignTab>('overview');
  const [availableContracts, setAvailableContracts] = useState<Contract[]>(() => {
    const offers = campaignManager.getAvailableOffers();
    return offers.length > 0 ? offers : campaignManager.generateContractOffers(5);
  });
  const [showHirePilot, setShowHirePilot] = useState(false);
  const [showMechLab, setShowMechLab] = useState(false);
  const [company, setCompany] = useState(campaignManager.getCompany());
  const [message, setMessage] = useState<string | null>(null);
  const [storeWeaponOffers] = useState<StoreWeaponOffer[]>(() => campaignManager.getStoreWeaponOffers());
  const [storeMechOffers] = useState<StoreMechOffer[]>(() => campaignManager.getStoreMechOffers());
  
  const availablePilots = useMemo(() => {
    const currentPilotNames = new Set(company?.pilots?.map(p => p.name) || []);
    return PILOT_POOL.filter(p => !currentPilotNames.has(p.name));
  }, [company]);
  
  const refreshCompany = () => setCompany(campaignManager.getCompany());

  const handleHirePilot = (pilot: typeof PILOT_POOL[0]) => {
    if (!company || company.funds < 50000) return;
    
    campaignManager.addPilot({
      id: `pilot-${Date.now()}`,
      name: pilot.name,
      gunnery: pilot.gunnery,
      piloting: pilot.piloting,
      rank: 'Recruit',
      experience: 0
    }, 50000);
    refreshCompany();
    setShowHirePilot(false);
  };

  const handleAcceptContract = (contract: Contract) => {
    campaignManager.addContract(contract);
    campaignManager.removeContractOffer(contract.id);
    refreshCompany();
    setAvailableContracts(campaignManager.getAvailableOffers());
    onStartMission(contract);
  };

  const handleSellMech = (mechId: string) => {
    if (campaignManager.sellMech(mechId)) {
      refreshCompany();
      setMessage('Mech sold and funds recovered.');
    }
  };

  const handlePurchaseWeapon = (offer: StoreWeaponOffer) => {
    if (campaignManager.purchaseWeapon(offer.weapon, offer.price)) {
      refreshCompany();
      setMessage(`${offer.weapon.name} purchased for ${offer.price.toLocaleString()} C-Bills.`);
    } else {
      setMessage('Insufficient funds to purchase this weapon.');
    }
  };

  const handlePurchaseMech = (offer: StoreMechOffer) => {
    if (campaignManager.purchaseMech(offer.mech, offer.price)) {
      refreshCompany();
      setMessage(`${offer.mech.name} purchased for ${offer.price.toLocaleString()} C-Bills.`);
    } else {
      setMessage('Insufficient funds to purchase this mech.');
    }
  };

  const handleConvertSalvage = (points: number) => {
    if (campaignManager.convertSalvageToFunds(points)) {
      refreshCompany();
      setMessage(`${points} salvage points converted into funds.`);
    } else {
      setMessage('Not enough salvage points for conversion.');
    }
  };

  const handleSaveCustomMech = (customizedMech: Unit) => {
    const buildCost = campaignManager.getCustomMechBuildCost(customizedMech);
    if (!campaignManager.addCustomMech(customizedMech, buildCost)) {
      setMessage('Not enough funds to build this custom mech.');
      return;
    }
    refreshCompany();
    setShowMechLab(false);
    setMessage(`${customizedMech.name} added to your bay for ${buildCost.toLocaleString()} C-Bills.`);
  };

  if (showMechLab) {
    return (
      <MechLab
        onSave={handleSaveCustomMech}
        onCancel={() => setShowMechLab(false)}
      />
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading campaign</p>
          <Button onClick={onBack}>Back to Main Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* MIDI Player */}
        <div className="mb-4">
          <MidiPlayer category="campaign" autoPlay={true} />
        </div>
        
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-400">{company.name}</h1>
              <p className="text-gray-400">Mercenary Company Management</p>
            </div>
            <Button onClick={onBack} variant="outline" data-testid="campaign-back-btn">
              Back to Main Menu
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-5 gap-4 mt-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">C-Bills</span>
              </div>
              <p className="text-xl font-bold">{company.funds.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs">Reputation</span>
              </div>
              <p className="text-xl font-bold">{company.reputation}/100</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">Pilots</span>
              </div>
              <p className="text-xl font-bold">{company.pilots?.length || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <Wrench className="w-4 h-4" />
                <span className="text-xs">Mechs</span>
              </div>
              <p className="text-xl font-bold">{company.mechs?.length || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs">Salvage</span>
              </div>
              <p className="text-xl font-bold">{company.salvagePoints}</p>
            </div>
          </div>
        </header>

        {message && (
          <div className="mb-6 rounded-lg border border-blue-700 bg-blue-950 p-4 text-sm text-blue-200">
            {message}
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 overflow-x-auto">
          {[
            { id: 'overview' as CampaignTab, label: 'Overview', icon: Shield },
            { id: 'pilots' as CampaignTab, label: 'Pilots', icon: Users },
            { id: 'mechs' as CampaignTab, label: 'Mech Bay', icon: Wrench },
            { id: 'store' as CampaignTab, label: 'Store', icon: ShoppingCart },
            { id: 'contracts' as CampaignTab, label: 'Contracts', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                )}
                data-testid={`campaign-tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        {/* Content */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          {activeTab === 'overview' && <OverviewTab company={company} />}
          {activeTab === 'pilots' && <PilotsTab company={company} onHirePilot={() => setShowHirePilot(true)} />}
          {activeTab === 'mechs' && <MechsTab company={company} onOpenMechLab={() => setShowMechLab(true)} onSellMech={handleSellMech} />}
          {activeTab === 'store' && (
            <StoreTab
              company={company}
              weaponOffers={storeWeaponOffers}
              mechOffers={storeMechOffers}
              onPurchaseWeapon={handlePurchaseWeapon}
              onPurchaseMech={handlePurchaseMech}
              onConvertSalvage={handleConvertSalvage}
            />
          )}
          {activeTab === 'contracts' && (
            <ContractsTab 
              contracts={availableContracts}
              onAccept={handleAcceptContract}
            />
          )}
        </div>
        
        {/* Hire Pilot Dialog */}
        <Dialog open={showHirePilot} onOpenChange={setShowHirePilot}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle>Hire Pilot</DialogTitle>
              <DialogDescription>
                Select a pilot to hire. Cost: $50,000 per pilot.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availablePilots.length > 0 ? (
                availablePilots.map(pilot => (
                  <div key={pilot.name} className="bg-gray-800 border border-gray-700 rounded p-3 hover:border-blue-500 cursor-pointer transition-colors"
                    onClick={() => handleHirePilot(pilot)}>
                    <p className="font-bold">{pilot.name}</p>
                    <p className="text-xs text-gray-400">Gunnery: {pilot.gunnery} | Piloting: {pilot.piloting}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">All available pilots have been hired!</p>
              )}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setShowHirePilot(false)} variant="outline">Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function OverviewTab({ company }: { company: MercenaryCompany }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Company Status</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-400">Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Active Contracts:</span>
              <span className="font-bold">{company.contracts?.filter(c => !c.completed).length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pilots:</span>
              <span className="font-bold">{company.pilots?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mechs:</span>
              <span className="font-bold">{company.mechs?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Outstanding Salvage:</span>
              <span className="font-bold text-yellow-300">{company.salvagePoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Funds:</span>
              <span className="font-bold text-green-400">{company.funds.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-400">Company Info</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p>• Company Name: <span className="text-white font-bold">{company.name}</span></p>
            <p>• Current Funds: <span className="text-green-400 font-bold">{company.funds.toLocaleString()} C-Bills</span></p>
            <p>• Reputation: <span className="text-blue-400 font-bold">{company.reputation}/100</span></p>
            <p>• Salvage Inventory: <span className="text-yellow-300 font-bold">{company.weaponInventory.length} weapons</span></p>
            <p>• Status: {company.reputation >= 75 ? 'Excellent' : company.reputation >= 50 ? 'Good' : company.reputation >= 25 ? 'Average' : 'Poor'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PilotsTab({ company, onHirePilot }: { company: MercenaryCompany; onHirePilot?: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Pilot Roster ({company.pilots?.length || 0})</h2>
        <Button size="sm" onClick={onHirePilot} data-testid="hire-pilot-btn"><Plus className="w-4 h-4 mr-2" /> Hire Pilot</Button>
      </div>
      
      {company.pilots && company.pilots.length > 0 ? (
        <div className="grid gap-4">
          {company.pilots.map(pilot => (
            <div key={pilot.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4" data-testid={`pilot-${pilot.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{pilot.name}</h3>
                  <p className="text-sm text-blue-400">{pilot.rank}</p>
                </div>
                <span className="text-xs text-gray-400">XP: {pilot.experience}</span>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                <div>
                  <span className="text-gray-400">Gunnery:</span>
                  <span className="ml-2 font-bold">{pilot.gunnery}</span>
                </div>
                <div>
                  <span className="text-gray-400">Piloting:</span>
                  <span className="ml-2 font-bold">{pilot.piloting}</span>
                </div>
                <div>
                  <span className="text-gray-400">Rank:</span>
                  <span className="ml-2 font-bold">{pilot.rank}</span>
                </div>
                <div>
                  <span className="text-gray-400">Progress:</span>
                  <span className="ml-2 font-bold">{pilot.experience < 250 ? 'Recruit' : pilot.experience < 600 ? 'Veteran' : pilot.experience < 1200 ? 'Elite' : 'Ace'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No pilots hired yet</p>
      )}
    </div>
  );
}

function MechsTab({ company, onOpenMechLab, onSellMech }: { company: MercenaryCompany; onOpenMechLab: () => void; onSellMech: (mechId: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Mech Bay ({company.mechs?.length || 0})</h2>
        <Button size="sm" onClick={onOpenMechLab} data-testid="open-mech-lab-btn"><Plus className="w-4 h-4 mr-2" /> Build Custom Mech</Button>
      </div>
      
      {company.mechs && company.mechs.length > 0 ? (
        <div className="grid gap-4">
          {company.mechs.map((mech, index) => (
            <div key={mech.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4" data-testid={`mech-${index}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{mech.name}</h3>
                  <p className="text-sm text-gray-400">{mech.tonnage} tons</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => onSellMech(mech.id)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Sell
                </Button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                <div>
                  <span className="text-gray-400">Armor:</span>
                  <p className="font-bold">
                    {Array.from(mech.locations.values()).reduce((sum, loc) => sum + loc.armor, 0)}/
                    {Array.from(mech.locations.values()).reduce((sum, loc) => sum + loc.maxArmor, 0)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Internal:</span>
                  <p className="font-bold">
                    {Array.from(mech.locations.values()).reduce((sum, loc) => sum + loc.structure, 0)}/
                    {Array.from(mech.locations.values()).reduce((sum, loc) => sum + loc.maxStructure, 0)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Heat Sinks:</span>
                  <p className="font-bold">{mech.heatSinks}</p>
                </div>
                <div>
                  <span className="text-gray-400">Weapons:</span>
                  <p className="font-bold">{mech.weapons.length}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No mechs in bay</p>
      )}

      <div className="mt-6 bg-gray-850 rounded-lg border border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 text-blue-400">Salvaged Weapon Cache</h3>
        {company.weaponInventory.length > 0 ? (
          <div className="grid gap-3">
            {company.weaponInventory.map((weapon, idx) => (
              <div key={`${weapon.id}-${idx}`} className="flex items-center justify-between rounded bg-gray-800 p-3">
                <div>
                  <p className="font-semibold">{weapon.name}</p>
                  <p className="text-xs text-gray-400">Damage: {weapon.damage} | Heat: {weapon.heat} | Range: {weapon.mediumRange}</p>
                </div>
                <span className="text-sm text-yellow-300">Inventory</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No salvaged weapons in inventory yet.</p>
        )}
      </div>
    </div>
  );
}

function StoreTab({
  company,
  weaponOffers,
  mechOffers,
  onPurchaseWeapon,
  onPurchaseMech,
  onConvertSalvage
}: {
  company: MercenaryCompany;
  weaponOffers: StoreWeaponOffer[];
  mechOffers: StoreMechOffer[];
  onPurchaseWeapon: (offer: StoreWeaponOffer) => void;
  onPurchaseMech: (offer: StoreMechOffer) => void;
  onConvertSalvage: (points: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-blue-400">Salvage Exchange</h3>
          <p className="text-sm text-gray-400 mb-4">Convert salvage points into usable funds or hold them for rare weapons purchase.</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Salvage Points</span>
              <span className="font-bold text-yellow-300">{company.salvagePoints}</span>
            </div>
            <Button size="sm" onClick={() => onConvertSalvage(Math.min(company.salvagePoints, 5))} disabled={company.salvagePoints === 0}>
              Convert up to 5 points
            </Button>
            <p className="text-xs text-gray-500">Each salvage point converts to 22,000 C-Bills.</p>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-blue-400">Weapon Inventory</h3>
          <p className="text-sm text-gray-400 mb-4">Salvaged weapons can be rearmed into your custom mechs in the Mech Bay.</p>
          <p className="text-sm text-yellow-300 font-bold">{company.weaponInventory.length} salvaged items</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Weapon Store</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {weaponOffers.map(offer => (
            <div key={offer.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{offer.weapon.name}</h4>
                  <p className="text-xs text-gray-400">{offer.weapon.type.toUpperCase()}</p>
                </div>
                <span className="font-bold text-green-400">{offer.price.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Damage {offer.weapon.damage}, Heat {offer.weapon.heat}, Range {offer.weapon.mediumRange}</p>
              <Button size="sm" onClick={() => onPurchaseWeapon(offer)} disabled={company.funds < offer.price}>
                Buy Weapon
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Mech Market</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mechOffers.map(offer => (
            <div key={offer.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{offer.mech.name}</h4>
                <span className="font-bold text-green-400">{offer.price.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{offer.mech.tonnage}t | {offer.mech.weapons.length} weapons</p>
              <Button size="sm" onClick={() => onPurchaseMech(offer)} disabled={company.funds < offer.price}>
                Buy Mech
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContractsTab({ 
  contracts, 
  onAccept 
}: { 
  contracts: Contract[];
  onAccept: (contract: Contract) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Available Contracts ({contracts.length})</h2>
      
      {contracts.length > 0 ? (
        <div className="grid gap-4">
          {contracts.map(contract => (
            <div key={contract.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4" data-testid={`contract-${contract.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{contract.name}</h3>
                  <p className="text-sm text-gray-400">{contract.employer}</p>
                  <p className="text-xs text-gray-500 mt-1">{contract.description}</p>
                </div>
                <Button 
                  onClick={() => onAccept(contract)}
                  data-testid={`accept-contract-${contract.id}`}
                  className="ml-4"
                >
                  Accept
                </Button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-gray-400">Reward:</span>
                  <p className="font-bold text-green-400">{contract.reward.toLocaleString()} C-Bills</p>
                </div>
                <div>
                  <span className="text-gray-400">Reputation:</span>
                  <p className="font-bold text-blue-300">{contract.reputation}</p>
                </div>
                <div>
                  <span className="text-gray-400">Difficulty:</span>
                  <p className="font-bold">{contract.difficulty}/5</p>
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>
                  <p className="font-bold">{contract.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No contracts available</p>
      )}
    </div>
  );
}
