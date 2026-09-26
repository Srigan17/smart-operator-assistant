import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Play, 
  AlertCircle, 
  Plus, 
  Filter, 
  MapPin, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  CloudSun,
  ShieldCheck
} from 'lucide-react';
import { TaskItem, TaskStatus, TaskType } from '../../types';
import { audioService } from '../../services/audioService';

interface ScheduledTasksListProps {
  tasks: TaskItem[];
  onUpdateTask: (task: TaskItem) => void;
  onAddTask: (task: TaskItem) => void;
  onEstimateTask: (task: TaskItem) => void;
}

export const ScheduledTasksList: React.FC<ScheduledTasksListProps> = ({
  tasks,
  onUpdateTask,
  onAddTask,
  onEstimateTask
}) => {
  const [filter, setFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newTaskType, setNewTaskType] = useState<TaskType>('Earth Excavation');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newEstTime, setNewEstTime] = useState(45);
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  const handleStartTask = (task: TaskItem) => {
    onUpdateTask({
      ...task,
      status: 'In Progress',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    audioService.playHydraulicClick();
    audioService.speakVoice(`Started task ${task.taskType} at ${task.location}`);
  };

  const handleCompleteTask = (task: TaskItem) => {
    onUpdateTask({
      ...task,
      status: 'Completed',
      progressPercent: 100,
      actualTimeMin: task.actualTimeMin || task.estimatedTimeMin + Math.floor(Math.random() * 6 - 3)
    });
    audioService.speakVoice(`Task ${task.taskType} marked completed. Great job!`);
  };

  const handleProgressChange = (task: TaskItem, percent: number) => {
    onUpdateTask({
      ...task,
      progressPercent: percent,
      status: percent === 100 ? 'Completed' : percent > 0 ? 'In Progress' : 'Scheduled'
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const created: TaskItem = {
      id: `T00${tasks.length + 1}`,
      taskType: newTaskType,
      description: newDesc || `${newTaskType} operation`,
      weather: 'Sunny',
      operatorSkill: 'Expert',
      machineAgeYears: 2,
      estimatedTimeMin: Number(newEstTime),
      status: 'Scheduled',
      priority: newPriority,
      assignedOperator: 'OP1001 (Mack Vance)',
      machineId: 'EXC001 - CAT 336 NextGen',
      progressPercent: 0,
      location: newLocation || 'Sector Active Zone',
    };
    onAddTask(created);
    setShowAddModal(false);
    setNewDesc('');
    setNewLocation('');
    audioService.speakVoice('New task scheduled on daily shift log.');
  };

  return (
    <div className="hud-panel rounded-xl p-6 border border-cat-border space-y-5">
      {/* Header with Title and Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cat-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Clock className="w-5 h-5 text-cat-yellow" /> Daily Shift Tasks & Work Orders
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cat-yellow/10 text-cat-yellow border border-cat-yellow/30">
              {tasks.filter(t => t.status === 'Completed').length}/{tasks.length} DONE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time assignment scheduling, progress tracking, and AI precision duration monitoring.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter buttons */}
          <div className="inline-flex rounded-lg p-1 bg-cat-black border border-cat-border text-xs font-mono">
            {(['ALL', 'In Progress', 'Scheduled', 'Completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filter === s ? 'bg-cat-yellow text-black font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cat-yellow hover:bg-cat-gold text-black text-xs font-bold rounded-lg shadow-md shadow-cat-yellow/20 transition-all font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>ADD TASK</span>
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => {
          const isCompleted = task.status === 'Completed';
          const isInProgress = task.status === 'In Progress';

          return (
            <div
              key={task.id}
              className={`rounded-xl p-4 transition-all border relative flex flex-col justify-between ${
                isInProgress
                  ? 'bg-cat-surface border-cat-yellow shadow-lg shadow-cat-yellow/10'
                  : isCompleted
                  ? 'bg-cat-surface/50 border-emerald-500/30 opacity-85'
                  : 'bg-cat-surface/80 border-cat-border hover:border-slate-500'
              }`}
            >
              <div>
                {/* Card Top: ID + Priority + Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-cat-yellow px-2 py-0.5 rounded bg-cat-black border border-cat-border">
                      {task.id}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      task.priority === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-500' :
                      task.priority === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-500' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
                    isInProgress ? 'text-cat-yellow animate-pulse' :
                    isCompleted ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {isInProgress && <span className="w-2 h-2 rounded-full bg-cat-yellow animate-ping" />}
                    {task.status}
                  </span>
                </div>

                {/* Task Title & Description */}
                <h4 className="text-sm font-bold text-white mb-1">{task.taskType}</h4>
                <p className="text-xs text-slate-300 line-clamp-2 mb-3">{task.description}</p>

                {/* Metadata details */}
                <div className="space-y-1.5 text-[11px] font-mono text-slate-400 mb-3 bg-cat-black/60 p-2.5 rounded-lg border border-cat-border/60">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3 text-cat-yellow" /> Location:
                    </span>
                    <span className="text-slate-200">{task.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Estimated Time:
                    </span>
                    <span className="text-cat-yellow font-bold">{task.estimatedTimeMin} min</span>
                  </div>

                  {task.actualTimeMin && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Actual Time:
                      </span>
                      <span className="text-emerald-300 font-bold">{task.actualTimeMin} min</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CloudSun className="w-3 h-3 text-amber-400" /> Weather:
                    </span>
                    <span className="text-slate-200">{task.weather} ({task.operatorSkill})</span>
                  </div>
                </div>

                {/* Progress bar and slider */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Task Progress</span>
                    <span className="font-bold text-white">{task.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-cat-black h-2 rounded-full overflow-hidden border border-cat-border">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-cat-yellow'
                      }`}
                      style={{ width: `${task.progressPercent}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progressPercent}
                    onChange={(e) => handleProgressChange(task, Number(e.target.value))}
                    className="w-full accent-cat-yellow cursor-pointer h-1 bg-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-cat-border/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => onEstimateTask(task)}
                  className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-mono text-cat-yellow hover:bg-cat-yellow/10 rounded transition-colors border border-cat-yellow/30"
                  title="Run AI Task Duration Estimator for this job"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Predict</span>
                </button>

                {task.status === 'Scheduled' && (
                  <button
                    onClick={() => handleStartTask(task)}
                    className="flex items-center space-x-1 px-3 py-1 bg-cat-yellow hover:bg-cat-gold text-black font-bold text-xs rounded transition-all font-mono"
                  >
                    <Play className="w-3 h-3" />
                    <span>START</span>
                  </button>
                )}

                {task.status === 'In Progress' && (
                  <button
                    onClick={() => handleCompleteTask(task)}
                    className="flex items-center space-x-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded transition-all font-mono shadow-md shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>COMPLETE</span>
                  </button>
                )}

                {isCompleted && (
                  <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> LOGGED
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cat-surface border-2 border-cat-yellow rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cat-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cat-yellow" /> Schedule Shift Work Order
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Task Operation Type</label>
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value as TaskType)}
                  className="w-full bg-cat-black border border-cat-border rounded-lg px-3 py-2 text-sm text-white focus:border-cat-yellow focus:outline-none"
                >
                  <option value="Earth Excavation">Earth Excavation</option>
                  <option value="Trenching">Trenching</option>
                  <option value="Material Loading">Material Loading</option>
                  <option value="Grading">Grading</option>
                  <option value="Demolition">Demolition</option>
                  <option value="Quarry Hauling">Quarry Hauling</option>
                  <option value="Foundation Digging">Foundation Digging</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Description / Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Trench depth 2.5m for storm drainage"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-cat-black border border-cat-border rounded-lg px-3 py-2 text-sm text-white focus:border-cat-yellow focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Location / Zone</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector B-7"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-cat-black border border-cat-border rounded-lg px-3 py-2 text-sm text-white focus:border-cat-yellow focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Est. Time (min)</label>
                  <input
                    type="number"
                    value={newEstTime}
                    onChange={(e) => setNewEstTime(Number(e.target.value))}
                    className="w-full bg-cat-black border border-cat-border rounded-lg px-3 py-2 text-sm text-white focus:border-cat-yellow focus:outline-none"
                    min="10"
                    max="300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                        newPriority === p
                          ? 'bg-cat-yellow text-black font-bold border-cat-yellow'
                          : 'bg-cat-black text-slate-400 border-cat-border'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-cat-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-cat-surface hover:bg-cat-card text-slate-300 text-xs font-mono rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cat-yellow hover:bg-cat-gold text-black font-bold text-xs font-mono rounded-lg shadow-md shadow-cat-yellow/20"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
