import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Mic, 
  Cpu,
  AlertTriangle,
  Lightbulb,
  Radio
} from 'lucide-react';
import { audioService } from '../../services/audioService';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  category?: 'safety' | 'telematics' | 'estimation' | 'general';
}

interface CatCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  seatbeltFastened: boolean;
}

export const CatCopilotDrawer: React.FC<CatCopilotDrawerProps> = ({
  isOpen,
  onClose,
  seatbeltFastened
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: "CAT Copilot AI Online. I'm connected to machine EXC001 telemetry, 360° radar sentinel, and the predictive shift scheduler. How can I assist you on the site today, Mack?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'general'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const quickPrompts = [
    "Explain the safety alert on 2025-05-02 (60 min idle)",
    "Why did Demolition (T005) take 105 min instead of 90?",
    "How to reduce fuel consumption during trenching?",
    "Run 360° proximity radar sensor diagnostic",
    "What is the allowable slope angle before rollover risk?"
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Generate intelligent contextual response
    setTimeout(() => {
      let reply = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('idle') || qLower.includes('2025-05-02') || qLower.includes('alert')) {
        reply = "Analysis of Table 1 on 2025-05-02 09:00 shows an excessive 60-minute engine idle with only 1 load cycle completed and the seatbelt unlatched. This wasted 2.8 liters of diesel ($4.62) and triggered Safety Alert SEC-04. I recommend activating CAT Auto-Idle Stop (AIS) to shut down after 5 minutes of inactivity.";
      } else if (qLower.includes('t005') || qLower.includes('demolition') || qLower.includes('105')) {
        reply = "Task T005 (Demolition) was estimated at 90 minutes but took 105 minutes (+15 min delta) due to high windy weather conditions and a 6-year-old machine with hydraulic lag. Demolition under wind gusts requires slower slewing to prevent boom buffeting and dust hazards.";
      } else if (qLower.includes('fuel') || qLower.includes('trenching')) {
        reply = "To cut fuel by ~18% in trenching: (1) Switch to 'ECO SAVE' throttle mode, (2) Smoothly feather joystick return strokes to capture hydraulic regenerative flow, and (3) Bench spoil piles within a 45° swing angle instead of full 90° swings.";
      } else if (qLower.includes('radar') || qLower.includes('proximity')) {
        reply = "All 4 ultrasonic radar transceivers and the right-rear blindspot optical sensor are operational. Currently scanning 30-meter radius. Auto-swing brake lock is primed if any ground worker enters the 8-meter red zone.";
      } else if (qLower.includes('slope') || qLower.includes('rollover') || qLower.includes('angle')) {
        reply = "The maximum safe lateral working slope for CAT 336 on compacted soil is 18.0°. Current live gyro reads +2.8° Pitch and +1.4° Roll. Never swing a loaded bucket uphill when cab lateral angle exceeds 15°.";
      } else {
        reply = `Acknowledged. I'm monitoring machine EXC001 telemetry (1530.2 hrs). Seatbelt status is currently ${seatbeltFastened ? 'FASTENED (Compliant)' : 'UNFASTENED (Non-compliant hazard)'}. What else would you like to know?`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
      audioService.speakVoice(reply);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#121316] border-l-2 border-cat-yellow/60 shadow-2xl flex flex-col justify-between">
      {/* Drawer Header */}
      <div className="p-4 bg-cat-surface border-b border-cat-border flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cat-yellow flex items-center justify-center text-black">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-white font-mono flex items-center gap-1.5">
              <span>CAT COPILOT AI</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500 font-mono">
                VOICE ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Intelligent Machine Companion</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-cat-card"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-sans leading-relaxed shadow ${
                m.sender === 'user'
                  ? 'bg-cat-yellow text-black font-semibold rounded-br-none'
                  : 'bg-cat-surface text-slate-100 border border-cat-border rounded-bl-none'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-cat-border/60 bg-cat-surface/50">
        <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-cat-yellow" /> SUGGESTED QUERIES:
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="text-[10px] font-mono text-slate-300 hover:text-cat-yellow bg-cat-black px-2.5 py-1 rounded-full border border-cat-border hover:border-cat-yellow whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-4 bg-cat-surface border-t border-cat-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask CAT Copilot or type voice query..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-cat-black border border-cat-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-cat-yellow focus:outline-none font-sans"
          />
          <button
            type="submit"
            className="p-2.5 bg-cat-yellow hover:bg-cat-gold text-black rounded-xl shadow-md transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
