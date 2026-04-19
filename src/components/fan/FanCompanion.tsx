'use client';
import ActionCard from './ActionCard';
import GeminiAssist from './GeminiAssist';
import ExitTimer from './ExitTimer';
import { useState, useEffect } from 'react';

export default function FanCompanion() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const [messages] = useState([
    { id: '1', body: 'Welcome to Wankhede! North gates are now open for entry.', time: '14:00' },
    { id: '2', body: 'Expect a surge at concourses during the innings break. Grab your snacks early.', time: '14:30' }
  ]);

  return (
    <div className="flex flex-col gap-6 p-4">
      <ActionCard />
      
      <GeminiAssist />
      
      <ExitTimer />
      
      <section className="mt-4">
        <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-3 flex items-center gap-2">
          <span className="w-4 border-t border-slate-700"></span>
          From Venue Command
          <span className="flex-1 border-t border-slate-700"></span>
        </h3>
        
        <div className="flex flex-col gap-3">
          {messages.map(msg => (
            <div key={msg.id} className="bg-[#1E293B] border border-slate-700 p-3 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <div className="text-[10px] text-slate-400 font-mono-numbers mb-1">{msg.time}</div>
              <div className="text-sm text-slate-200">{msg.body}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
