'use client';

import { useState, useRef, useEffect } from 'react';
import { Reminder } from '../app/page';

interface OverlayBubbleProps {
  reminder: Reminder;
  onDismiss: () => void;
  onSnooze: () => void;
}

export default function OverlayBubble({ reminder, onDismiss, onSnooze }: OverlayBubbleProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!bubbleRef.current) return;
    
    const rect = bubbleRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep bubble within viewport bounds
      const maxX = window.innerWidth - 200; // Approximate bubble width
      const maxY = window.innerHeight - 150; // Approximate bubble height

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Prevent text selection while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div
      ref={bubbleRef}
      className={`fixed z-[9999] select-none transition-shadow duration-200 ${
        isDragging ? 'shadow-2xl' : 'shadow-lg'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: reminder.color || '#FFFF00',
        border: '3px solid #FF0000',
        borderRadius: '20px',
        padding: '16px',
        minWidth: '200px',
        maxWidth: '300px',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Drag handle indicator */}
      <div className="flex justify-center mb-2">
        <div className="w-8 h-1 bg-gray-600 rounded-full opacity-50"></div>
      </div>

      {/* Reminder content */}
      <div className="text-black font-bold text-sm mb-4 leading-tight">
        {reminder.text}
      </div>

      {/* Time info */}
      <div className="text-xs text-gray-800 mb-4 font-medium">
        ⏰ {new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          month: 'short',
          day: 'numeric',
        }).format(reminder.dateTime)}
        {reminder.isRepeating && (
          <span className="ml-2">🔄 {reminder.repeatInterval}</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSnooze();
          }}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
          title="Snooze for 5 minutes"
        >
          😴 5min
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
          title="Dismiss reminder"
        >
          ✕ Dismiss
        </button>
      </div>

      {/* Pulsing animation for attention */}
      <div
        className="absolute inset-0 rounded-[17px] animate-pulse opacity-30 pointer-events-none"
        style={{
          backgroundColor: reminder.color || '#FFFF00',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-[17px] opacity-20 pointer-events-none"
        style={{
          backgroundColor: reminder.color || '#FFFF00',
          filter: 'blur(8px)',
          transform: 'scale(1.1)',
        }}
      />
    </div>
  );
}
