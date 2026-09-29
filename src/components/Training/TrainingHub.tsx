import React, { useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Play, 
  Clock, 
  Award, 
  UserCheck, 
  FileCheck2, 
  ShieldCheck, 
  BookOpen, 
  Sparkles,
  Plus,
  Send,
  Video
} from 'lucide-react';
import { TrainingCourse, InstructorBooking } from '../../types';
import { INITIAL_COURSES, INITIAL_BOOKINGS } from '../../data/initialData';
import { audioService } from '../../services/audioService';

interface TrainingHubProps {
  onStartSim?: () => void;
}

export const TrainingHub: React.FC<TrainingHubProps> = ({ onStartSim }) => {
  const [courses, setCourses] = useState<TrainingCourse[]>(INITIAL_COURSES);
  const [bookings, setBookings] = useState<InstructorBooking[]>(INITIAL_BOOKINGS);
  const [activeCourse, setActiveCourse] = useState<TrainingCourse | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Instructor form state
  const [instructorName, setInstructorName] = useState('Marcus Vance (Senior CAT Certified Master)');
  const [topic, setTopic] = useState('3D Grade Assist & Trench Slope Calibration');
  const [bookingDate, setBookingDate] = useState('2025-05-12');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:30 AM');
  const [mode, setMode] = useState<InstructorBooking['mode']>('On-Site Cab Coaching');

  // Pre-shift inspection checklist state
  const [checklist, setChecklist] = useState<{ id: string; label: string; checked: boolean; category: string }[]>([
    { id: 'chk-1', label: 'Engine Oil & Coolant levels verified in safe range', checked: true, category: 'Fluids' },
    { id: 'chk-2', label: 'Hydraulic hoses, cylinders & swing drive inspected for leaks', checked: true, category: 'Hydraulics' },
    { id: 'chk-3', label: 'Track tension, sprockets, and bottom rollers checked', checked: true, category: 'Underbody' },
    { id: 'chk-4', label: '360° Sentinel radar sensors and cameras clean & unobstructed', checked: true, category: 'Sensors' },
    { id: 'chk-5', label: 'Operator seatbelt latch mechanism click & interlock tested', checked: true, category: 'Safety' },
    { id: 'chk-6', label: 'Cab reverse travel alarm, horn & roof strobe active', checked: true, category: 'Safety' },
    { id: 'chk-7', label: 'Emergency cab E-stop button verified functional', checked: false, category: 'Emergency' },
  ]);

  const [inspectionSigned, setInspectionSigned] = useState(false);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    audioService.playHydraulicClick();
  };

  const handleSignInspection = () => {
    const allChecked = checklist.every(item => item.checked);
    if (!allChecked) {
      alert('Please complete all 7 safety inspection items before signing clearance.');
      return;
    }
    setInspectionSigned(true);
    audioService.playSeatbeltChime(true);
    audioService.speakVoice('Pre-shift machine inspection signed and certified for today.');
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: InstructorBooking = {
      id: `BK-0${bookings.length + 1}`,
      instructorName,
      role: 'Certified CAT Instructor',
      topic,
      date: bookingDate,
      timeSlot,
      mode,
      status: 'Confirmed',
    };

    setBookings([newBooking, ...bookings]);
    setShowBookingModal(false);
    audioService.speakVoice(`Instructor coaching session with ${instructorName.split(' ')[0]} booked successfully.`);
  };

  const completedCount = courses.filter(c => c.completed).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Certification Badge */}
        <div className="hud-panel-active rounded-xl p-5 border border-cat-yellow/40 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400">OPERATOR CERTIFICATION</span>
            <div className="text-lg font-black text-white font-mono flex items-center gap-2">
              <Award className="w-5 h-5 text-cat-yellow" /> LEVEL III EXPERT
            </div>
            <div className="text-xs text-cat-yellow font-mono">{completedCount}/{courses.length} Modules Completed</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cat-yellow/10 border border-cat-yellow/30 flex items-center justify-center text-cat-yellow font-black text-xl">
            CAT
          </div>
        </div>

        {/* Card 2: Upcoming Instructor Sessions */}
        <div className="hud-panel-active rounded-xl p-5 border border-cat-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400">INSTRUCTOR COACHING</span>
            <div className="text-lg font-bold text-white font-mono">
              {bookings.filter(b => b.status === 'Confirmed').length} CONFIRMED SESSIONS
            </div>
            <div className="text-xs text-slate-400">Next: Marcus Vance (May 5)</div>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="px-3 py-1.5 bg-cat-yellow hover:bg-cat-gold text-black font-bold text-xs font-mono rounded-lg shadow"
          >
            BOOK NOW
          </button>
        </div>

        {/* Card 3: Pre-Shift Inspection Status */}
        <div className="hud-panel-active rounded-xl p-5 border border-cat-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400">PRE-SHIFT 360° INSPECTION</span>
            <div className={`text-lg font-bold font-mono ${inspectionSigned ? 'text-emerald-400' : 'text-amber-400'}`}>
              {inspectionSigned ? 'CERTIFIED ✓' : 'PENDING SIGN-OFF ⚠️'}
            </div>
            <div className="text-xs text-slate-400">7-point safety audit</div>
          </div>
          <FileCheck2 className={`w-8 h-8 ${inspectionSigned ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
      </div>

      {/* Main Learning Modules Grid */}
      <div className="hud-panel rounded-xl p-6 border border-cat-border space-y-4">
        <div className="flex items-center justify-between border-b border-cat-border pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cat-yellow" /> CAT Digital Operator Training Academy
            </h3>
            <p className="text-xs text-slate-400">
              Interactive video modules, hydraulic simulation exercises, and micro-learning certifications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`rounded-xl p-5 border transition-all flex flex-col justify-between ${
                course.completed
                  ? 'bg-cat-surface/80 border-emerald-500/40'
                  : 'bg-cat-surface border-cat-border hover:border-cat-yellow'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cat-black text-cat-yellow border border-cat-border font-bold">
                    {course.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.durationMin} MIN
                    </span>
                    {course.completed && (
                      <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500 font-bold">
                        PASS ({course.score}%)
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5">{course.title}</h4>
                <p className="text-xs text-slate-300 mb-3">{course.description}</p>

                {/* Steps Preview */}
                <div className="space-y-1 bg-cat-black/60 p-2.5 rounded-lg border border-cat-border/60 text-[11px] font-mono text-slate-400 mb-3">
                  <div className="text-slate-300 font-bold text-[10px]">MODULE HIGHLIGHTS:</div>
                  {course.steps.slice(0, 2).map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-cat-yellow">•</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-cat-border/60">
                <button
                  onClick={() => setActiveCourse(course)}
                  className="px-3 py-1.5 bg-cat-surface hover:bg-cat-card text-cat-yellow border border-cat-yellow/40 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" /> View Course Syllabus
                </button>

                {course.hasSimulation && onStartSim && (
                  <button
                    onClick={onStartSim}
                    className="px-3 py-1.5 bg-cat-yellow hover:bg-cat-gold text-black font-bold text-xs font-mono rounded-lg shadow flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Launch Sim
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-Shift Inspection Checklist & Instructor Bookings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pre-Shift Inspection Checklist */}
        <div className="hud-panel rounded-xl p-6 border border-cat-border space-y-4">
          <div className="flex items-center justify-between border-b border-cat-border pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cat-yellow" /> Pre-Shift 360° Walkaround Checklist
              </h3>
              <p className="text-xs text-slate-400">
                Mandatory pre-operational equipment safety audit before bucket ground engagement.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => !inspectionSigned && toggleChecklistItem(item.id)}
                className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition-all ${
                  item.checked
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-cat-surface border-cat-border text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    item.checked ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-slate-500'
                  }`}>
                    {item.checked && '✓'}
                  </div>
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase bg-cat-black px-1.5 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-cat-border flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              {checklist.filter(c => c.checked).length} of {checklist.length} verified
            </span>
            <button
              onClick={handleSignInspection}
              disabled={inspectionSigned}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow ${
                inspectionSigned
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500'
                  : 'bg-cat-yellow hover:bg-cat-gold text-black shadow-cat-yellow/20'
              }`}
            >
              {inspectionSigned ? '✓ CLEARANCE DIGITALLY SIGNED' : 'SIGN OPERATOR CLEARANCE'}
            </button>
          </div>
        </div>

        {/* Right: Instructor Bookings Schedule */}
        <div className="hud-panel rounded-xl p-6 border border-cat-border space-y-4">
          <div className="flex items-center justify-between border-b border-cat-border pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cat-yellow" /> Booked Instructor Coaching
              </h3>
              <p className="text-xs text-slate-400">
                1-on-1 field coaching with senior CAT application specialists.
              </p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-3 py-1.5 bg-cat-yellow hover:bg-cat-gold text-black font-bold text-xs font-mono rounded-lg shadow"
            >
              + Book Instructor
            </button>
          </div>

          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 bg-cat-surface rounded-xl border border-cat-border text-xs font-mono space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-cat-yellow" />
                    <span>{b.instructorName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    {b.status}
                  </span>
                </div>

                <div className="text-slate-300 font-sans text-xs">{b.topic}</div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-cat-border/40">
                  <span>📅 {b.date} ({b.timeSlot})</span>
                  <span className="text-cat-yellow">⚡ {b.mode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book Instructor Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cat-surface border-2 border-cat-yellow rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cat-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cat-yellow" /> Book CAT Certified Field Coach
              </h3>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3.5">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Select Certified Master Instructor</label>
                <select
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full bg-cat-black border border-cat-border rounded-lg px-3 py-2 text-sm text-white focus:border-cat-yellow focus:outline-none"
                >
                  <option value="Marcus Vance (Senior CAT Certified Master)">Marcus Vance (Senior Field Master)</option>
                  <option value="Elena Rostova (Telematics & Efficiency Specialist)">Elena Rostova (Telematics Specialist)</option>
                  <option value="Sam O'Connor (Safety & Excavation Expert)">Sam O'Connor (Safety Engineer)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Coaching Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-cat-black border border-cat-border rounded-lg px-3 py-2 text-sm text-white focus:border-cat-yellow focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Session Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-cat-black border border-cat-border rounded-lg px-3 py-2 text-sm text-white focus:border-cat-yellow focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Preferred Time</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-cat-black border border-cat-border rounded-lg px-3 py-2 text-sm text-white focus:border-cat-yellow focus:outline-none"
                  >
                    <option value="08:00 AM - 09:30 AM">08:00 AM - 09:30 AM</option>
                    <option value="10:00 AM - 11:30 AM">10:00 AM - 11:30 AM</option>
                    <option value="02:00 PM - 03:30 PM">02:00 PM - 03:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Training Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as InstructorBooking['mode'])}
                  className="w-full bg-cat-black border border-cat-border rounded-lg px-3 py-2 text-sm text-white focus:border-cat-yellow focus:outline-none"
                >
                  <option value="On-Site Cab Coaching">On-Site Cab Coaching</option>
                  <option value="Remote VR Simulator">Remote VR Simulator</option>
                  <option value="Telemetry Review">Telemetry Review</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-cat-border">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 bg-cat-surface hover:bg-cat-card text-slate-300 text-xs font-mono rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cat-yellow hover:bg-cat-gold text-black font-bold text-xs font-mono rounded-lg shadow-md shadow-cat-yellow/20 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Confirm Coaching
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cat-surface border-2 border-cat-yellow rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cat-border pb-3">
              <h3 className="text-base font-bold text-white">{activeCourse.title}</h3>
              <button 
                onClick={() => setActiveCourse(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">{activeCourse.description}</p>

            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-cat-yellow">CURRICULUM LESSONS:</div>
              {activeCourse.steps.map((step, idx) => (
                <div key={idx} className="p-2.5 bg-cat-black rounded-lg border border-cat-border text-xs text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cat-yellow text-black font-bold flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-xs text-emerald-200">
              <strong className="text-emerald-300">Key Takeaway:</strong> {activeCourse.keyTakeaways.join(' • ')}
            </div>

            <div className="flex justify-end pt-3 border-t border-cat-border">
              <button
                onClick={() => setActiveCourse(null)}
                className="px-4 py-2 bg-cat-yellow text-black font-bold text-xs font-mono rounded-lg"
              >
                Close Syllabus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
