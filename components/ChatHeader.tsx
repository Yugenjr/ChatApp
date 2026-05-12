'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  nickname: string;
  roomId: string;
  onEditNickname: () => void;
  onWallpaperClick: () => void;
  typingUser: string | null;
}

export default function ChatHeader({
  nickname,
  roomId,
  onEditNickname,
  onWallpaperClick,
  typingUser,
}: ChatHeaderProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copyFallback = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', 'true');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);
    return copied;
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/chat/${roomId}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const copied = copyFallback(link);
        if (!copied) {
          throw new Error('Clipboard copy failed');
        }
      }

      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      setCopyStatus('failed');
      window.setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 backdrop-blur-sm bg-dark-bg/80 border-b border-gray-800 px-4 py-3 flex items-center justify-between gap-3"
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-accent-red rounded-full animate-pulse" />
          {nickname || 'Chat'}
        </h1>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400 min-w-0">
          <span className="truncate rounded-full border border-gray-700 bg-black/20 px-3 py-1 max-w-[190px] sm:max-w-none">
            Share link: /chat/{roomId}
          </span>
          <button
            onClick={handleCopyLink}
            className="shrink-0 rounded-full border border-gray-700 bg-dark-secondary/60 px-3 py-1 text-[11px] text-white transition-colors hover:border-accent-red hover:text-accent-red"
            title="Copy room link to share"
            aria-label="Copy room link to share"
          >
            Copy link
          </button>
        </div>
        {typingUser && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-gray-400 mt-1"
          >
            {typingUser} is typing
            <span className="inline-block ml-1">
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ⋯
              </motion.span>
            </span>
          </motion.p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex items-center">
          <button
            onClick={handleCopyLink}
            className="text-lg hover:text-accent-red transition-colors p-2 rounded-full hover:bg-dark-secondary sm:hidden"
            title="Copy room link to share"
            aria-label="Copy room link to share"
          >
            🔗
          </button>
          {copyStatus !== 'idle' && (
            <motion.span
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className={`absolute right-0 top-full mt-2 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] shadow-lg ${
                copyStatus === 'copied'
                  ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200'
                  : 'border-red-500/30 bg-red-500/15 text-red-200'
              }`}
            >
              {copyStatus === 'copied' ? 'Link copied' : 'Copy failed'}
            </motion.span>
          )}
        </div>
        <button
          onClick={onWallpaperClick}
          className="text-lg hover:text-accent-red transition-colors p-2 rounded-full hover:bg-dark-secondary"
          title="Change wallpaper"
        >
          🎨
        </button>
        <button
          onClick={onEditNickname}
          className="text-lg hover:text-accent-red transition-colors p-2 rounded-full hover:bg-dark-secondary"
          title="Edit nickname"
        >
          ✏️
        </button>
      </div>
    </motion.div>
  );
}
