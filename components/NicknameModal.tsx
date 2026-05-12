'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface NicknameModalProps {
  currentNickname: string;
  onSave: (nickname: string) => void;
  onClose: () => void;
}

export default function NicknameModal({
  currentNickname,
  onSave,
  onClose,
}: NicknameModalProps) {
  const [nickname, setNickname] = useState(currentNickname);

  const handleSave = () => {
    if (nickname.trim()) {
      onSave(nickname.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-dark-secondary/95 backdrop-blur-md rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">What's your name?</h2>

        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your name..."
          autoFocus
          maxLength={20}
          className="w-full bg-dark-tertiary border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent-red mb-4 transition-colors"
        />

        <p className="text-xs text-gray-500 mb-6">
          {nickname.length}/20 characters
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg bg-dark-tertiary/50 text-gray-300 hover:bg-dark-tertiary transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!nickname.trim()}
            className="flex-1 py-2 px-4 rounded-lg bg-accent-red text-white hover:bg-accent-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
