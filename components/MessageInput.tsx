'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({ onSendMessage, onTyping }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Typing indicator
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
      onTyping(false);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 px-4 py-4 bg-dark-bg/95 backdrop-blur-sm border-t border-gray-800"
    >
      <div className="flex items-end gap-3">
        <div className="flex-1 bg-dark-secondary/50 rounded-full px-4 py-2 backdrop-blur-md border border-gray-700 focus-within:border-accent-red focus-within:bg-dark-secondary transition-all">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type something..."
            className="w-full bg-transparent resize-none focus:outline-none text-white placeholder-gray-500 text-sm"
            rows={1}
          />
            <div className="mt-1 text-[11px] text-gray-400">Press Enter to send — Shift+Enter for newline</div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
            type="button"
          disabled={!message.trim()}
            aria-label="Send message (Enter)"
            className="flex-shrink-0 w-12 h-12 rounded-full bg-accent-red text-white flex items-center justify-center hover:bg-accent-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <motion.span
            animate={isTyping ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.4, repeat: isTyping ? Infinity : 0 }}
          >
            ✈️
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}
