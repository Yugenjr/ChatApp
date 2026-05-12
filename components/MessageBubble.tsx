'use client';

import { format } from 'date-fns';
import { Message as MessageType } from '@/lib/types';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: MessageType;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formattedTime = format(new Date(message.created_at), 'h:mm a');

  return (
    <div className={clsx('flex gap-2', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={clsx('flex flex-col gap-1 max-w-xs', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && (
          <p className="text-xs text-gray-400 px-2">{message.sender_name}</p>
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={clsx(
            'px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg',
            isOwn
              ? 'bg-accent-red/70 text-white rounded-br-none'
              : 'bg-dark-secondary/50 text-gray-100 rounded-bl-none'
          )}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.is_deleted ? (
              <span className="italic text-gray-400">message deleted</span>
            ) : (
              message.content
            )}
          </p>
        </motion.div>
        <p className="text-xs text-gray-500 px-2">{formattedTime}</p>
      </div>
    </div>
  );
}

// Import motion inside the component
import { motion } from 'framer-motion';
