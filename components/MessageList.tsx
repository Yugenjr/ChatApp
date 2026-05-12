'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Message as MessageType } from '@/lib/types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: MessageType[];
  nickname: string;
}

export default function MessageList({ messages, nickname }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
    >
      {messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-full flex items-center justify-center"
        >
          <div className="text-center">
            <p className="text-4xl mb-3">💌</p>
            <p className="text-gray-400 text-sm">No messages yet</p>
            <p className="text-gray-500 text-xs mt-2">Start a conversation...</p>
          </div>
        </motion.div>
      ) : (
        messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.02, 0.2) }}
          >
            <MessageBubble message={message} isOwn={message.sender_name === nickname} />
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
