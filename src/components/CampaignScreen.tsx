// Campaign Management UI

import { useState, useMemo, useEffect } from 'react';
import type { MercenaryCompany, Contract } from '@/lib/campaign';
import { CampaignManager } from '@/lib/campaign';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { MidiPlayer } from '@/components/MidiPlayer';
import { useAudioManager } from '@/hooks/useAudioManager';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Wrench, 
  DollarSign, 
  Award,
  Shield,
  FileText,
  Plus
} from 'lucide-react';

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

export function CampaignScreen({ campaignManager, onStartMission, onBack }: CampaignScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'pilots' | 'mechs' | 'contracts'>('overview');
  const [availableContracts] = useState<Contract[]>(campaignManager.generateContracts(5));
  const [showHirePilot, setShowHirePilot] = useState(false);
  const [company, setCompany] = useState(campaignManager.getCompany());
  
  const availablePilots = useMemo(() => {
    const currentPilotNames = new Set(company?.pilots?.map(p => p.name) || []);
    return PILOT_POOL.filter(p => !currentPilotNames.has(p.name));
  }, [company]);
  
  const handleHirePilot = (pilot: typeof PILOT_POOL[0]) => {
    if (!company || (company.funds || 0) < 50000) return;
    
    campaignManager.addPilot({
      id: `pilot-${Date.now()}`,
      name: pilot.name,
      gunnery: pilot.gunnery,
      piloting: pilot.piloting,
      hits: 0,
      conscious: true,
      rank: 'Recruit'
    });
    campaignManager.addFunds(-50000);
    setCompany(campaignManager.getCompany());
    setShowHirePilot(false);
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'pilots', label: 'Pilots', icon: Users },
    { id: 'mechs', label: 'Mech Bay', icon: Wrench },
    { id: 'contracts', label: 'Contracts', icon: FileText }
  ];
  
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
          <div className="grid grid-cols-4 gap-4 mt-4">
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
          </div>
        </header>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
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
          {activeTab === 'mechs' && <MechsTab company={company} />}
          {activeTab === 'contracts' && (
            <ContractsTab 
              contracts={availableContracts}
              onAccept={(contract) => onStartMission(contract)}
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
              <span className="text-gray-400">Contracts Available:</span>
              <span className="font-bold">{company.contracts?.length || 0}</span>
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
              <span className="text-gray-400">Total Funds:</span>
              <span className="font-bold text-green-400">{company.funds.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-400">Company Info</h3>
          <div className="text-sm text-gray-400">
            <p>• Company Name: <span className="text-white font-bold">{company.name}</span></p>
            <p>• Current Funds: <span className="text-green-400 font-bold">{company.funds.toLocaleString()} C-Bills</span></p>
            <p>• Reputation: <span className="text-blue-400 font-bold">{company.reputation}/100</span></p>
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
                  <span className="text-gray-400">XP:</span>
                  <span className="ml-2 font-bold">{pilot.experience}</span>
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

function MechsTab({ company }: { company: MercenaryCompany }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mech Bay ({company.mechs?.length || 0})</h2>
      
      {company.mechs && company.mechs.length > 0 ? (
        <div className="grid gap-4">
          {company.mechs.map((mech, index) => (
            <div key={mech.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4" data-testid={`mech-${index}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{mech.name}</h3>
                  <p className="text-sm text-gray-400">{mech.tonnage} tons</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                <div>
                  <span className="text-gray-400">Armor:</span>
                  <p className="font-bold">{mech.armor}/{mech.maxArmor}</p>
                </div>
                <div>
                  <span className="text-gray-400">Internal:</span>
                  <p className="font-bold">{mech.internals}/{mech.maxInternals}</p>
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
                  <span className="text-gray-400">Difficulty:</span>
                  <p className="font-bold">{contract.difficulty}/5</p>
                </div>
                <div>
                  <span className="text-gray-400">Faction:</span>
                  <p className="font-bold">{contract.faction}</p>
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
