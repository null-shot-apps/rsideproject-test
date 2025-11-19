'use client';

import { Reminder } from '../app/page';

interface ReminderListProps {
  reminders: Reminder[];
  onDeleteReminder: (id: string) => void;
}

export default function ReminderList({ reminders, onDeleteReminder }: ReminderListProps) {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Due now!';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>No active reminders</p>
        <p className="text-sm">Create your first reminder to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {reminders
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
        .map((reminder) => (
          <div
            key={reminder.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-medium text-gray-800 mb-1">{reminder.text}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📅 {formatDateTime(reminder.dateTime)}</p>
                  <p className="font-medium text-blue-600">⏰ {getTimeUntil(reminder.dateTime)}</p>
                  {reminder.isRepeating && (
                    <p className="text-green-600">
                      🔄 Repeats {reminder.repeatInterval}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {/* Color preview */}
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: reminder.color }}
                  title="Bubble color"
                />
                
                {/* Sound indicator */}
                {reminder.soundEnabled ? (
                  <span title="Sound enabled">🔊</span>
                ) : (
                  <span title="Sound disabled">🔇</span>
                )}
                
                {/* Delete button */}
                <button
                  onClick={() => onDeleteReminder(reminder.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                  title="Delete reminder"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
