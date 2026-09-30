import React, { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { LiveCockpitHUD } from './components/Dashboard/LiveCockpitHUD';
import { ScheduledTasksList } from './components/Dashboard/ScheduledTasksList';
import { SafetySuite } from './components/Safety/SafetySuite';
import { TaskEstimator } from './components/Estimator/TaskEstimator';
import { AnomalyDetectionView } from './components/Anomaly/AnomalyDetectionView';
import { InteractiveMachinerySim } from './components/Simulator/InteractiveMachinerySim';
import { TrainingHub } from './components/Training/TrainingHub';
import { CatCopilotDrawer } from './components/Copilot/CatCopilotDrawer';
import { SosModal } from './components/Safety/SosModal';
import { 
  INITIAL_TASKS, 
  INITIAL_TELEMETRY_LOGS, 
  INITIAL_HAZARDS, 
  INITIAL_INCIDENTS 
} from './data/initialData';
import { TaskItem, TelemetryRecord, HazardObject, IncidentReport } from './types';
import { Flame, ShieldAlert, Cpu, HeartHandshake } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [seatbeltFastened, setSeatbeltFastened] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);

  // Core Data States
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryRecord[]>(INITIAL_TELEMETRY_LOGS);
  const [hazards, setHazards] = useState<HazardObject[]>(INITIAL_HAZARDS);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  
  // Selected task to estimate
  const [estimatingTask, setEstimatingTask] = useState<TaskItem | null>(null);

  // Handlers
  const handleUpdateTask = (updated: TaskItem) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleAddTask = (newTask: TaskItem) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleEstimateTask = (task: TaskItem) => {
    setEstimatingTask(task);
    setActiveTab('estimator');
  };

  const handleAddHazard = (newHazard: HazardObject) => {
    setHazards(prev => [...prev, newHazard]);
  };

  const handleRemoveHazard = (id: string) => {
    setHazards(prev => prev.filter(h => h.id !== id));
  };

  const handleAddIncident = (newIncident: IncidentReport) => {
    setIncidents(prev => [newIncident, ...prev]);
  };

  const handleAddTelemetry = (record: TelemetryRecord) => {
    setTelemetryLogs(prev => [record, ...prev]);
  };

  const activeAlertCount = (!seatbeltFastened ? 1 : 0) + hazards.filter(h => Math.sqrt(h.x * h.x + h.y * h.y) < 8).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-slate-100 selection:bg-cat-yellow selection:text-black">
      {/* Top Industrial Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        seatbeltFastened={seatbeltFastened}
        setSeatbeltFastened={setSeatbeltFastened}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onTriggerSos={() => setIsSosOpen(true)}
        activeAlertCount={activeAlertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Live Cockpit Gauges */}
            <LiveCockpitHUD
              seatbeltFastened={seatbeltFastened}
              onOpenRadar={() => setActiveTab('safety')}
            />

            {/* Shift Work Orders & Tasks */}
            <ScheduledTasksList
              tasks={tasks}
              onUpdateTask={handleUpdateTask}
              onAddTask={handleAddTask}
              onEstimateTask={handleEstimateTask}
            />
          </div>
        )}

        {activeTab === 'safety' && (
          <SafetySuite
            seatbeltFastened={seatbeltFastened}
            setSeatbeltFastened={setSeatbeltFastened}
            hazards={hazards}
            onAddHazard={handleAddHazard}
            onRemoveHazard={handleRemoveHazard}
            incidents={incidents}
            onAddIncident={handleAddIncident}
          />
        )}

        {activeTab === 'estimator' && (
          <TaskEstimator
            prefillTask={estimatingTask}
            onScheduleEstimatedTask={(newTask) => {
              handleAddTask(newTask);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'anomalies' && (
          <AnomalyDetectionView
            telemetryLogs={telemetryLogs}
            onAddTelemetryRecord={handleAddTelemetry}
          />
        )}

        {activeTab === 'simulator' && (
          <InteractiveMachinerySim />
        )}

        {activeTab === 'training' && (
          <TrainingHub
            onStartSim={() => setActiveTab('simulator')}
          />
        )}
      </main>

      {/* AI Voice Copilot Drawer */}
      <CatCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        seatbeltFastened={seatbeltFastened}
      />

      {/* Emergency Satellite SOS Modal */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />

      {/* Industrial Footer */}
      <footer className="mt-auto border-t border-cat-border/60 bg-[#0d0e12] py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>CAT SENTINEL™ TELEMETRICS V4.8 • SYSTEM OPTIMAL</span>
          </div>
          <div className="text-slate-400 text-center sm:text-right">
            Connected to Caterpillar On-Board ECM & Iridium Fleet Satellite Network
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
