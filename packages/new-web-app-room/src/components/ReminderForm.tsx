'use client';

import { useState } from 'react';
import { Reminder } from '../app/page';

interface ReminderFormProps {
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
}

const colorOptions = [
  { name: 'Bright Yellow', value: '#FFFF00', border: '#FF0000' },
  { name: 'Hot Pink', value: '#FF69B4', border: '#8B0000' },
  { name: 'Lime Green', value: '#32CD32', border: '#FF4500' },
  { name: 'Orange', value: '#FFA500', border: '#8B0000' },
  { name: 'Cyan', value: '#00FFFF', border: '#FF0000' },
];

export default function ReminderForm({ onAddReminder }: ReminderFormProps) {
  const [text, setText] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim() || !dateTime) {
      alert('Please fill in all required fields');
      return;
    }

    const reminderDateTime = new Date(dateTime);
    if (reminderDateTime <= new Date()) {
      alert('Please select a future date and time');
      return;
    }

    onAddReminder({
      text: text.trim(),
      dateTime: reminderDateTime,
      isRepeating,
      repeatInterval: isRepeating ? repeatInterval : undefined,
      isActive: true,
      color: selectedColor.value,
      soundEnabled,
    });

    // Reset form
    setText('');
    setDateTime('');
    setIsRepeating(false);
    setRepeatInterval('daily');
    setSelectedColor(colorOptions[0]);
    setSoundEnabled(true);
  };

  // Get current datetime for min attribute
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
          Reminder Text *
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What do you want to be reminded about?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          required
        />
      </div>

      <div>
        <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time *
        </label>
        <input
          type="datetime-local"
          id="dateTime"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          min={minDateTime}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isRepeating"
          checked={isRepeating}
          onChange={(e) => setIsRepeating(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isRepeating" className="text-sm font-medium text-gray-700">
          Repeating Reminder
        </label>
      </div>

      {isRepeating && (
        <div>
          <label htmlFor="repeatInterval" className="block text-sm font-medium text-gray-700 mb-1">
            Repeat Every
          </label>
          <select
            id="repeatInterval"
            value={repeatInterval}
            onChange={(e) => setRepeatInterval(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">Day</option>
            <option value="weekly">Week</option>
            <option value="monthly">Month</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bubble Color
        </label>
        <div className="grid grid-cols-3 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`p-2 rounded-md border-2 text-xs font-medium transition-all ${
                selectedColor.value === color.value
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{
                backgroundColor: color.value,
                color: color.value === '#FFFF00' ? '#000' : '#000',
              }}
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="soundEnabled"
          checked={soundEnabled}
          onChange={(e) => setSoundEnabled(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="soundEnabled" className="text-sm font-medium text-gray-700">
          Play notification sound
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
      >
        Create Reminder
      </button>
    </form>
  );
}
