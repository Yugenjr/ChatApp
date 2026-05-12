'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const generateRoomId = () => {
    const adjectives = ['moon', 'star', 'night', 'dream', 'shadow', 'silver', 'cosmic', 'quiet', 'secret', 'velvet', 'amber', 'ocean', 'forest', 'frost', 'dawn'];
    const nouns = ['river', 'sky', 'heart', 'whisper', 'echo', 'rose', 'moon', 'star', 'breeze', 'silence', 'melody', 'moment', 'light', 'soul', 'dream'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    return `${randomAdj}-${randomNoun}-${randomNum}`;
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const roomId = generateRoomId();
      router.push(`/chat/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      setIsLoading(false);
    }
  };

  const parseRoomFromInput = (v: string) => {
    if (!v) return null;
    // Try to parse as URL
    try {
      const url = new URL(v, typeof window !== 'undefined' ? window.location.origin : undefined);
      const idx = url.pathname.indexOf('/chat/');
      if (idx !== -1) {
        const room = url.pathname.slice(idx + '/chat/'.length).replace(/^\//, '');
        return room || null;
      }
    } catch (e) {
      // not a full URL
    }

    // If contains /chat/ in string
    const i = v.indexOf('/chat/');
    if (i !== -1) return v.slice(i + 6).replace(/^\//, '') || null;

    // If it's just a path like /chat/room
    if (v.startsWith('/chat/')) return v.slice(6).replace(/^\//, '') || null;

    // If user pasted origin-less path like localhost:3000/chat/room
    const parts = v.split('/');
    const last = parts[parts.length - 1];
    if (last && last.includes('-')) return last;

    // fallback: return as-is
    return v;
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center space-y-8">
          {/* Logo/Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="text-5xl font-light tracking-tight mb-4">
              <span className="text-white">Private</span>
              <br />
              <span className="text-accent-red">Chat</span>
            </div>
            <p className="text-gray-400 text-sm">
              One link. Two hearts. Infinite conversations.
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-gray-500 text-sm leading-relaxed"
          >
            Create a private space to chat with someone special. No login, no signup, no complications.
            <br />
            Just open a link and start talking.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-3 pt-4"
          >
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full bg-accent-red hover:bg-accent-red-dark text-white font-medium py-3 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Creating...
                </>
              ) : (
                <>
                  ✨ Create New Chat
                </>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-dark-bg text-gray-500">or</span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-3">If you received a link:</p>
              <div className="flex gap-2">
                <input
                  id="join-input"
                  type="text"
                  placeholder="Paste full link or room ID (e.g., http://.../chat/moon-river-921 or moon-river-921)"
                  className="flex-1 bg-dark-secondary border border-gray-700 rounded-full px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-accent-red focus:bg-dark-tertiary transition"
                  onKeyDown={(e) => {
                    const target = e.currentTarget as HTMLInputElement;
                    if (e.key === 'Enter' && target.value.trim()) {
                      const room = parseRoomFromInput(target.value.trim());
                      if (room) router.push(`/chat/${room}`);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('join-input') as HTMLInputElement | null;
                    if (!el) return;
                    const room = parseRoomFromInput(el.value.trim());
                    if (room) router.push(`/chat/${room}`);
                  }}
                  className="bg-accent-red hover:bg-accent-red-dark text-white font-medium py-3 px-4 rounded-full transition-all"
                >
                  Join
                </button>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-gray-600 text-xs pt-8 space-y-2"
          >
            <p>💌 Designed for intimate conversations</p>
            <p className="text-gray-700">
              Private • Realtime • No accounts • No tracking
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
