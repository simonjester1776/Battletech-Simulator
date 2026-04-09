// Campaign Management UI

import { useState } from 'react';
import type { MercenaryCompany, Contract } from '@/lib/campaign';
import { CampaignManager } from '@/lib/campaign';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Wrench, 
  DollarSign, 
  Award,
  Shield,
  FileText
} from 'lucide-react';

interface CampaignScreenProps {
  campaignManager: CampaignManager;
  onStartMission: (contract: Contract) => void;
  onBack: () => void;
}

export function CampaignScreen({ campaignManager, onStartMission, onBack }: CampaignScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'pilots' | 'mechs' | 'contracts' | 'salvage'>('overview');
  const [availableContracts] = useState<Contract[]>(campaignManager.generateContracts(5));
  
  const company = campaignManager.getCompany();
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'pilots', label: 'Pilots', icon: Users },
    { id: 'mechs', label: 'Mech Bay', icon: Wrench },
    { id: 'contracts', label: 'Contracts', icon: FileText },
    { id: 'salvage', label: 'Salvage', icon: Award }
  ];
  
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
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
              <p className="text-xl font-bold">{company.pilots.length}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <Wrench className="w-4 h-4" />
                <span className="text-xs">Mechs</span>
              </div>
              <p className="text-xl font-bold">{company.mechBays.length}</p>
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
          {activeTab === 'pilots' && <PilotsTab company={company} />}
          {activeTab === 'mechs' && <MechsTab company={company} manager={campaignManager} />}
          {activeTab === 'contracts' && (
            <ContractsTab 
              contracts={availableContracts}
              currentContract={company.currentContract}
              onAccept={(contract) => {
                campaignManager.acceptContract(contract);
                onStartMission(contract);
              }}
            />
          )}
          {activeTab === 'salvage' && <SalvageTab company={company} manager={campaignManager} />}
        </div>
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
              <span className="text-gray-400">Missions Completed:</span>
              <span className="font-bold">{company.completedMissions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Contract:</span>
              <span className="font-bold">{company.currentContract ? company.currentContract.title : 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Available Pilots:</span>
              <span className="font-bold">{company.pilots.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Operational Mechs:</span>
              <span className="font-bold">{company.mechBays.filter(b => b.condition >= 80).length}/{company.mechBays.length}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-400">Recent Activity</h3>
          <div className="text-sm text-gray-400">
            <p>• Company established {new Date(company.dateEstablished).toLocaleDateString()}</p>
            <p>• Current funds: {company.funds.toLocaleString()} C-Bills</p>
            <p>• Reputation level: {company.reputation >= 75 ? 'Excellent' : company.reputation >= 50 ? 'Good' : company.reputation >= 25 ? 'Average' : 'Poor'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PilotsTab({ company }: { company: MercenaryCompany }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Pilot Roster</h2>
        <Button size="sm" data-testid="hire-pilot-btn">Hire Pilot</Button>
      </div>
      
      <div className="grid gap-4">
        {company.pilots.map(pilot => (
          <div key={pilot.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4" data-testid={`pilot-${pilot.id}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{pilot.name}</h3>
                <p className="text-sm text-blue-400">{pilot.callsign}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-green-400">{pilot.salary.toLocaleString()} C-Bills/month</p>
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
                <span className="text-gray-400">XP:</span>
                <span className="ml-2 font-bold">{pilot.experience}</span>
              </div>
              <div>
                <span className="text-gray-400">Kills:</span>
                <span className="ml-2 font-bold">{pilot.kills}</span>
              </div>
            </div>
            
            {pilot.specialAbilities.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-400">Abilities:</span>
                <div className="flex gap-1 mt-1">
                  {pilot.specialAbilities.map(ability => (
                    <span key={ability} className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                      {ability.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MechsTab({ company, manager }: { company: MercenaryCompany; manager: CampaignManager }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mech Bay</h2>
      
      <div className="grid gap-4">
        {company.mechBays.map((bay, index) => (
          <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4" data-testid={`mechbay-${index}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{bay.mech.name}</h3>
                <p className="text-sm text-gray-400">{bay.mech.tonnage} tons | BV: {bay.mech.bv2}</p>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-sm font-bold",
                  bay.condition >= 80 ? "text-green-400" :
                  bay.condition >= 50 ? "text-yellow-400" :
                  "text-red-400"
                )}>
                  {bay.condition}% Condition
                </div>
                {bay.condition < 100 && (
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => manager.repairMech(index)}
                    disabled={company.funds < bay.repairCost}
                    data-testid={`repair-mech-${index}`}
                  >
                    Repair ({bay.repairCost.toLocaleString()} C-Bills)
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-3 text-sm">
              <span className="text-gray-400">Assigned Pilot:</span>
              <span className="ml-2">
                {bay.assignedPilot 
                  ? company.pilots.find(p => p.id === bay.assignedPilot)?.name || 'Unknown'
                  : 'Unassigned'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContractsTab({ 
  contracts, 
  currentContract, 
  onAccept 
}: { 
  contracts: Contract[]; 
  currentContract: Contract | null;
  onAccept: (contract: Contract) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Available Contracts</h2>
      
      {currentContract && (
        <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-300 mb-1">ACTIVE CONTRACT</p>
          <h3 className="font-bold text-lg">{currentContract.title}</h3>
          <p className="text-sm text-gray-400">{currentContract.employer}</p>
        </div>
      )}
      
      <div className="grid gap-4">
        {contracts.map(contract => (
          <div key={contract.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4" data-testid={`contract-${contract.id}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{contract.title}</h3>
                <p className="text-sm text-gray-400">{contract.employer}</p>
                <p className="text-xs text-gray-500 mt-1">{contract.description}</p>
              </div>
              <Button 
                onClick={() => onAccept(contract)}
                disabled={!!currentContract}
                data-testid={`accept-contract-${contract.id}`}
              >
                Accept
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
              <div>
                <span className="text-gray-400">Payment:</span>
                <p className="font-bold text-green-400">{contract.payment.toLocaleString()} C-Bills</p>
              </div>
              <div>
                <span className="text-gray-400">Difficulty:</span>
                <p className="font-bold">{contract.difficulty}/10</p>
              </div>
              <div>
                <span className="text-gray-400">Salvage:</span>
                <p className="font-bold">{contract.salvageRights}%</p>
              </div>
              <div>
                <span className="text-gray-400">Duration:</span>
                <p className="font-bold">{contract.duration} days</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalvageTab({ company, manager }: { company: MercenaryCompany; manager: CampaignManager }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Salvage Yard</h2>
      
      {company.salvage.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No salvage available</p>
      ) : (
        <div className="grid gap-4">
          {company.salvage.map(item => (
            <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between" data-testid={`salvage-${item.id}`}>
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
                <p className="text-xs text-gray-500 mt-1">Condition: {item.condition}%</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold">{item.value.toLocaleString()} C-Bills</p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => manager.sellSalvage(item.id)}
                  data-testid={`sell-salvage-${item.id}`}
                >
                  Sell
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
