'use client';

import { useState, useEffect } from 'react';
import ReminderForm from '../components/ReminderForm';
import ReminderList from '../components/ReminderList';
import OverlayBubble from '../components/OverlayBubble';

export interface Reminder {
  id: string;
  text: string;
  dateTime: Date;
  isRepeating: boolean;
  repeatInterval?: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  color?: string;
  soundEnabled: boolean;
}

export default function Home() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [isSnoozed, setIsSnoozed] = useState(false);

  // Load reminders from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('reminders');
    if (saved) {
      const parsed = JSON.parse(saved);
      setReminders(parsed.map((r: any) => ({
        ...r,
        dateTime: new Date(r.dateTime)
      })));
    }
  }, []);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Check for active reminders
  useEffect(() => {
    const checkReminders = () => {
      if (activeReminder || isSnoozed) return;

      const now = new Date();
      const dueReminder = reminders.find(reminder => {
        if (!reminder.isActive) return false;
        return reminder.dateTime <= now;
      });

      if (dueReminder) {
        setActiveReminder(dueReminder);
        
        // Play notification sound if enabled
        if (dueReminder.soundEnabled) {
          // Create a simple beep sound using Web Audio API
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          } catch {
            console.log('Notification sound played (Web Audio not supported)');
          }
        }

        // Handle repeating reminders
        if (dueReminder.isRepeating && dueReminder.repeatInterval) {
          const nextDate = new Date(dueReminder.dateTime);
          switch (dueReminder.repeatInterval) {
            case 'daily':
              nextDate.setDate(nextDate.getDate() + 1);
              break;
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7);
              break;
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
          }
          
          setReminders(prev => prev.map(r => 
            r.id === dueReminder.id 
              ? { ...r, dateTime: nextDate }
              : r
          ));
        } else {
          // Remove one-time reminders
          setReminders(prev => prev.filter(r => r.id !== dueReminder.id));
        }
      }
    };

    const interval = setInterval(checkReminders, 1000);
    return () => clearInterval(interval);
  }, [reminders, activeReminder, isSnoozed]);

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    setReminders(prev => [...prev, newReminder]);
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const dismissBubble = () => {
    setActiveReminder(null);
    setIsSnoozed(false);
  };

  const snoozeBubble = () => {
    setActiveReminder(null);
    setIsSnoozed(true);
    
    // Re-enable after 5 minutes
    setTimeout(() => {
      setIsSnoozed(false);
    }, 5 * 60 * 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Persistent Reminder App
          </h1>
          <p className="text-gray-600">
            Set reminders that won&apos;t let you ignore them!
          </p>
          
          {/* Demo button */}
          <button
            onClick={() => {
              const demoTime = new Date();
              demoTime.setSeconds(demoTime.getSeconds() + 5);
              addReminder({
                text: "🎉 Demo reminder! This bright bubble won't go away until you dismiss it!",
                dateTime: demoTime,
                isRepeating: false,
                isActive: true,
                color: '#FFFF00',
                soundEnabled: true,
              });
            }}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg border-2 border-red-500 transition-colors"
          >
            🚨 Try Demo (5 seconds)
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Create Reminder
            </h2>
            <ReminderForm onAddReminder={addReminder} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Active Reminders
            </h2>
            <ReminderList 
              reminders={reminders} 
              onDeleteReminder={deleteReminder}
            />
          </div>
        </div>
      </div>

      {/* Overlay Bubble */}
      {activeReminder && (
        <OverlayBubble
          reminder={activeReminder}
          onDismiss={dismissBubble}
          onSnooze={snoozeBubble}
        />
      )}
    </div>
  );
}





