import { isSupabaseConfigured, supabase } from './supabase';
import { Message, Room } from './types';
import { sanitizeInput } from './utils';
// In-memory event system for same-tab mock updates
type MessageCallback = (message: Message) => void;
type TypingCallback = (data: { event: string; data: any }) => void;

const messageSubscribers = new Map<string, Set<MessageCallback>>();
const typingSubscribers = new Map<string, Set<TypingCallback>>();

const API_BASE = '/api/mock';

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const createMockRoom = async (roomSlug: string, passphrase?: string): Promise<Room> =>
  requestJson<Room>(`${API_BASE}/rooms`, {
    method: 'POST',
    body: JSON.stringify({ roomSlug, passphrase }),
  });

const getMockMessages = async (roomId: string, limit = 50): Promise<Message[]> =>
  requestJson<Message[]>(`${API_BASE}/messages?roomId=${encodeURIComponent(roomId)}&limit=${limit}`);
const sendMockMessage = async (
  roomId: string,
  senderName: string,
  content: string
): Promise<Message> => {
  const message = await requestJson<Message>(`${API_BASE}/messages`, {
    method: 'POST',
    body: JSON.stringify({ roomId, senderName, content }),
  });

  // Notify all subscribers in this room
  const subscribers = messageSubscribers.get(roomId);
  if (subscribers) {
    subscribers.forEach((callback) => {
      try {
        callback(message);
      } catch (err) {
        console.error('Error in message subscriber:', err);
      }
    });
  }

  return message;
};

const deleteMockMessage = async (messageId: string): Promise<void> => {
  await requestJson<{ ok: true }>(`${API_BASE}/messages`, {
    method: 'DELETE',
    body: JSON.stringify({ messageId }),
  });
};

const createMockSubscription = <T extends MessageCallback | TypingCallback>(
  roomId: string,
  callback: T,
  type: 'message' | 'typing' = 'message'
) => {
  if (type === 'message') {
    if (!messageSubscribers.has(roomId)) {
      messageSubscribers.set(roomId, new Set<MessageCallback>());
    }

    const roomSubscribers = messageSubscribers.get(roomId)!;
    roomSubscribers.add(callback as MessageCallback);

    console.debug('[mock] createMockSubscription', { roomId, subscriberCount: roomSubscribers.size });

    return {
      unsubscribe: () => {
        roomSubscribers.delete(callback as MessageCallback);
        if (roomSubscribers.size === 0) {
          messageSubscribers.delete(roomId);
        }
      },
    };
  }

  if (!typingSubscribers.has(roomId)) {
    typingSubscribers.set(roomId, new Set<TypingCallback>());
  }

  const roomSubscribers = typingSubscribers.get(roomId)!;
  roomSubscribers.add(callback as TypingCallback);

  console.debug('[mock] createMockSubscription', { roomId, subscriberCount: roomSubscribers.size });

  return {
    unsubscribe: () => {
      roomSubscribers.delete(callback as TypingCallback);
      if (roomSubscribers.size === 0) {
        typingSubscribers.delete(roomId);
      }
    },
  };
};

// Room operations
export const getRoomOrCreate = async (roomSlug: string, passphrase?: string): Promise<Room> => {
  if (!isSupabaseConfigured || !supabase) {
    return createMockRoom(roomSlug, passphrase);
  }

  // Try to get existing room
  const { data: existingRoom, error: getError } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_slug', roomSlug)
    .single();

  if (!getError && existingRoom) {
    return existingRoom as Room;
  }

  // Create new room
  const { data: newRoom, error: createError } = await supabase
    .from('rooms')
    .insert([
      {
        room_slug: roomSlug,
        passphrase: passphrase || null,
      },
    ])
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create room: ${createError.message}`);
  }

  return newRoom as Room;
};

// Message operations
export const sendMessage = async (
  roomId: string,
  senderName: string,
  content: string
): Promise<Message> => {
  if (!isSupabaseConfigured || !supabase) {
    return sendMockMessage(roomId, senderName, content);
  }

  const sanitizedContent = sanitizeInput(content);
  const sanitizedSender = sanitizeInput(senderName);

  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        room_id: roomId,
        sender_name: sanitizedSender,
        content: sanitizedContent,
        is_deleted: false,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return data as Message;
};

export const getMessages = async (roomId: string, limit = 50): Promise<Message[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return getMockMessages(roomId, limit);
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data as Message[];
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    await deleteMockMessage(messageId);
    return;
  }

  const { error } = await supabase
    .from('messages')
    .update({ is_deleted: true })
    .eq('id', messageId);

  if (error) {
    throw new Error(`Failed to delete message: ${error.message}`);
  }
};

export const subscribeToMessages = (roomId: string, callback: (message: Message) => void) => {
  if (!isSupabaseConfigured || !supabase) {
    return createMockSubscription(roomId, callback, 'message');
  }

  const subscription = supabase
    .channel(`messages:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as Message);
        }
      }
    )
    .subscribe();

  return subscription;
};

export const subscribeToTyping = (
  roomId: string,
  callback: (data: { event: string; data: any }) => void
) => {
  if (!isSupabaseConfigured || !supabase) {
    return createMockSubscription(roomId, callback, 'typing');
  }

  const subscription = supabase
    .channel(`typing:${roomId}`)
    .on('broadcast', { event: 'typing' }, (message) => {
      callback(message as any);
    })
    .subscribe();

  return subscription;
};

export const broadcastTyping = async (roomId: string, userName: string, isTyping: boolean) => {
  if (!isSupabaseConfigured || !supabase) {
    const subscribers = typingSubscribers.get(roomId);
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback({
            event: 'typing',
            data: { userName, isTyping, timestamp: Date.now() },
          });
        } catch (err) {
          console.error('Error in typing subscriber:', err);
        }
      });
    }
    return;
  }

  await supabase.channel(`typing:${roomId}`).send({
    type: 'broadcast',
    event: 'typing',
    data: {
      userName,
      isTyping,
      timestamp: Date.now(),
    },
  });
};
