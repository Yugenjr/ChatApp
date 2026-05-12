'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message as MessageType, Room } from '@/lib/types';
import { storage } from '@/lib/storage';
import { useChatStore } from '@/lib/store';
import {
  getRoomOrCreate,
  getMessages,
  sendMessage,
  subscribeToMessages,
  subscribeToTyping,
  broadcastTyping,
} from '@/lib/api';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import WallpaperPicker from './WallpaperPicker';
import NicknameModal from './NicknameModal';
import { isSupabaseConfigured } from '@/lib/supabase';

interface ChatRoomProps {
  roomId: string;
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const roomLink = typeof window !== 'undefined' ? `${window.location.origin}/chat/${roomId}` : `/chat/${roomId}`;
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [wallpaper, setWallpaper] = useState<any>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [roomLinkStatus, setRoomLinkStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { nickname, setNickname } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize room and load messages
  useEffect(() => {
    const initializeRoom = async () => {
      try {
        const roomData = await getRoomOrCreate(roomId);
        setRoom(roomData);

        const loadedMessages = await getMessages(roomData.id);
        setMessages(loadedMessages);

        // Load stored nickname
        const storedNickname = storage.nickname.get(roomId);
        if (storedNickname) {
          setNickname(storedNickname);
        } else {
          setShowNicknameModal(true);
        }

        // Prefer server wallpaper if present, otherwise load stored wallpaper
        if (roomData?.wallpaper) {
          setWallpaper(roomData.wallpaper);
        } else {
          const storedWallpaper = storage.wallpaper.get(roomId);
          if (storedWallpaper) setWallpaper(storedWallpaper);
        }
      } catch (err) {
        console.error('Error initializing room:', err);
        setError('Failed to initialize chat room');
      } finally {
        setIsLoading(false);
      }
    };

    initializeRoom();
  }, [roomId, setNickname]);

  // Subscribe to new messages
  useEffect(() => {
    if (!room) return;

    const subscription = subscribeToMessages(room.id, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [room]);

  // Fallback: listen for localStorage changes and reload messages for this room.
  // This ensures tabs that miss subscription callbacks still sync.
  useEffect(() => {
    if (!room) return;

    const handler = async (e: StorageEvent) => {
      if (e.key !== 'chatapp_mock_state') return;
      try {
        console.debug('[chatroom] storage event received, reloading messages', { roomId: room.id });
        const refreshed = await getMessages(room.id);
        setMessages(refreshed);
      } catch (err) {
        console.error('[chatroom] failed reloading messages on storage event', err);
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [room]);

  // Polling fallback: periodically fetch messages in mock mode to ensure sync across tabs.
  useEffect(() => {
    if (!room) return;

    let cancelled = false;

    const mergeMessages = (prev: any[], refreshed: any[]) => {
      const ids = new Set(prev.map((m) => m.id));
      let changed = false;
      const merged = [...prev];
      refreshed.forEach((m) => {
        if (!ids.has(m.id)) {
          merged.push(m);
          changed = true;
        }
      });
      if (!changed) return prev;
      return merged.sort((a, b) => a.created_at.localeCompare(b.created_at));
    };

    const poll = async () => {
      try {
        const refreshed = await getMessages(room.id);
        if (cancelled) return;
        setMessages((prev) => mergeMessages(prev, refreshed));
        // Also poll room metadata to pick up wallpaper changes
        try {
          const latestRoom = await getRoomOrCreate(room.room_slug);
          if (latestRoom?.wallpaper && latestRoom.wallpaper !== wallpaper) {
            setWallpaper(latestRoom.wallpaper);
            storage.wallpaper.set(roomId, latestRoom.wallpaper);
          }
        } catch (e) {
          // ignore metadata polling errors
        }
      } catch (err) {
        // ignore
      }
    };

    // initial poll + interval
    poll();
    const id = window.setInterval(poll, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [room]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!room || !nickname) return;

    const subscription = subscribeToTyping(room.id, (data) => {
      if (data.data.userName !== nickname && data.data.isTyping) {
        setTypingUser(data.data.userName);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [room, nickname]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!room || !nickname || !content.trim()) return;

      try {
        const newMessage = await sendMessage(room.id, nickname, content);
        setMessages((prev) =>
          prev.some((message) => message.id === newMessage.id)
            ? prev
            : [...prev, newMessage]
        );
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message');
      }
    },
    [room, nickname]
  );

  const handleTyping = useCallback(
    async (isTyping: boolean) => {
      if (!room || !nickname) return;

      try {
        await broadcastTyping(room.id, nickname, isTyping);
      } catch (err) {
        console.error('Error broadcasting typing:', err);
      }
    },
    [room, nickname]
  );

  const handleWallpaperChange = useCallback(
    async (newWallpaper: any) => {
      try {
        if (!isSupabaseConfigured()) {
          const res = await fetch('/api/mock/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomSlug: roomId, wallpaper: newWallpaper }),
          });
          if (res.ok) {
            const roomRes = await res.json();
            setWallpaper(roomRes.wallpaper ?? newWallpaper);
            storage.wallpaper.set(roomId, roomRes.wallpaper ?? newWallpaper);
            return;
          }
        }

        // Supabase or fallback
        setWallpaper(newWallpaper);
        storage.wallpaper.set(roomId, newWallpaper);
      } catch (err) {
        console.error('Failed updating wallpaper:', err);
        setWallpaper(newWallpaper);
        storage.wallpaper.set(roomId, newWallpaper);
      }
    },
    [roomId]
  );

  const handleNicknameChange = useCallback(
    (newNickname: string) => {
      setNickname(newNickname);
      storage.nickname.set(roomId, newNickname);
      setShowNicknameModal(false);
    },
    [roomId, setNickname]
  );

  const handleCopyRoomLink = useCallback(async () => {
    const link = `${window.location.origin}/chat/${roomId}`;

    const fallbackCopy = () => {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.setAttribute('readonly', 'true');
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textArea);
      return copied;
    };

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else if (!fallbackCopy()) {
        throw new Error('Clipboard copy failed');
      }

      setRoomLinkStatus('copied');
      window.setTimeout(() => setRoomLinkStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy room link:', err);
      setRoomLinkStatus('failed');
      window.setTimeout(() => setRoomLinkStatus('idle'), 2000);
    }
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="h-screen bg-dark-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl"
        >
          ⟳
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-dark-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-accent-red text-lg mb-2">Error</p>
          <p className="text-gray-300">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`h-screen flex flex-col bg-dark-bg overflow-hidden ${
        wallpaper?.value || 'bg-dark-bg'
      }`}
    >
      {!isSupabaseConfigured && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-[11px] text-amber-200">
          Demo mode: Supabase credentials are missing, so the UI runs with local storage only.
        </div>
      )}

      {/* Debug panel: shows shared mock message count + last message for this room */}
      <StorageDebug messages={messages} />

      <div className="border-b border-gray-800 bg-black/30 px-4 py-2 text-xs text-gray-300 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-white">Invite another user</p>
          <p className="truncate text-gray-400">{roomLink}</p>
        </div>
        <button
          onClick={handleCopyRoomLink}
          className="self-start rounded-full border border-gray-700 bg-dark-secondary/70 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-accent-red hover:text-accent-red"
        >
          {roomLinkStatus === 'copied'
            ? 'Link copied'
            : roomLinkStatus === 'failed'
              ? 'Copy failed'
              : 'Copy invite link'}
        </button>
      </div>

      <ChatHeader
        nickname={nickname}
        roomId={roomId}
        onEditNickname={() => setShowNicknameModal(true)}
        onWallpaperClick={() => setShowWallpaperPicker(true)}
        typingUser={typingUser}
      />

      <MessageList messages={messages} nickname={nickname} />

      <div ref={messagesEndRef} />

      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />

      <AnimatePresence>
        {showWallpaperPicker && (
          <WallpaperPicker
            currentWallpaper={wallpaper}
            onSelect={handleWallpaperChange}
            onClose={() => setShowWallpaperPicker(false)}
          />
        )}
        {showNicknameModal && (
          <NicknameModal
            currentNickname={nickname}
            onSave={handleNicknameChange}
            onClose={() => setShowNicknameModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StorageDebug({ messages }: { messages: MessageType[] }) {
  const last = messages.length ? messages[messages.length - 1] : null;

  return (
    <div className="border-b border-gray-800 bg-black/20 px-4 py-2 text-xs text-gray-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] text-gray-400">Debug storage (mock):</div>
          <div className="text-sm text-white">messages: {messages.length}</div>
          <div className="text-[11px] text-gray-400 truncate">last id: {last?.id ?? '—'}</div>
        </div>
        <div className="text-[11px] text-gray-400">last content: {last?.content ?? '—'}</div>
      </div>
    </div>
  );
}
