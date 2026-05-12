import { promises as fs } from 'fs';
import path from 'path';
import { Message, Room } from './types';
import { sanitizeInput } from './utils';

type MockState = {
  rooms: Room[];
  messages: Message[];
};

type GlobalMockStore = typeof globalThis & {
  __chatappMockState?: MockState;
};

const DATA_DIR = path.join(process.cwd(), '.chatapp-data');
const STATE_FILE = path.join(DATA_DIR, 'mock-state.json');

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const createEmptyMockState = (): MockState => ({
  rooms: [],
  messages: [],
});

const getStore = (): MockState => {
  const globalStore = globalThis as GlobalMockStore;

  if (!globalStore.__chatappMockState) {
    globalStore.__chatappMockState = createEmptyMockState();
  }

  return globalStore.__chatappMockState;
};

const readStoreFromDisk = async (): Promise<MockState> => {
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8');
    return JSON.parse(raw) as MockState;
  } catch {
    return createEmptyMockState();
  }
};

const writeStoreToDisk = async (state: MockState) => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
};

export const getOrCreateMockRoom = (roomSlug: string, passphrase?: string): Room => {
  const state = getStore();
  const existingRoom = state.rooms.find((room) => room.room_slug === roomSlug);

  if (existingRoom) {
    return existingRoom;
  }

  const newRoom: Room = {
    id: roomSlug,
    room_slug: roomSlug,
    passphrase: passphrase || null,
    created_at: new Date().toISOString(),
  };

  state.rooms.push(newRoom);
  return newRoom;
};

export const getOrCreateMockRoomAsync = async (roomSlug: string, passphrase?: string): Promise<Room> => {
  const state = await readStoreFromDisk();
  const existingRoom = state.rooms.find((room) => room.room_slug === roomSlug);

  if (existingRoom) {
    return existingRoom;
  }

  const newRoom: Room = {
    id: roomSlug,
    room_slug: roomSlug,
    passphrase: passphrase || null,
    created_at: new Date().toISOString(),
  };

  state.rooms.push(newRoom);
  await writeStoreToDisk(state);
  return newRoom;
};

export const getMockMessages = (roomId: string, limit = 50): Message[] => {
  const state = getStore();

  return state.messages
    .filter((message) => message.room_id === roomId)
    .sort((left, right) => left.created_at.localeCompare(right.created_at))
    .slice(-limit);
};

export const setRoomWallpaperAsync = async (roomSlug: string, wallpaper: any): Promise<Room> => {
  const state = await readStoreFromDisk();
  const room = state.rooms.find((r) => r.room_slug === roomSlug);
  if (!room) {
    const newRoom: Room = {
      id: roomSlug,
      room_slug: roomSlug,
      passphrase: null,
      created_at: new Date().toISOString(),
      wallpaper,
    };
    state.rooms.push(newRoom);
    await writeStoreToDisk(state);
    return newRoom;
  }

  room.wallpaper = wallpaper;
  await writeStoreToDisk(state);
  return room;
};

export const getMockMessagesAsync = async (roomId: string, limit = 50): Promise<Message[]> => {
  const state = await readStoreFromDisk();

  return state.messages
    .filter((message) => message.room_id === roomId)
    .sort((left, right) => left.created_at.localeCompare(right.created_at))
    .slice(-limit);
};

export const sendMockMessage = (roomId: string, senderName: string, content: string): Message => {
  const state = getStore();
  const message: Message = {
    id: createId(),
    room_id: roomId,
    sender_name: sanitizeInput(senderName),
    content: sanitizeInput(content),
    created_at: new Date().toISOString(),
    is_deleted: false,
  };

  state.messages.push(message);
  return message;
};

export const sendMockMessageAsync = async (
  roomId: string,
  senderName: string,
  content: string
): Promise<Message> => {
  const state = await readStoreFromDisk();
  const message: Message = {
    id: createId(),
    room_id: roomId,
    sender_name: sanitizeInput(senderName),
    content: sanitizeInput(content),
    created_at: new Date().toISOString(),
    is_deleted: false,
  };

  state.messages.push(message);
  await writeStoreToDisk(state);
  return message;
};

export const deleteMockMessage = (messageId: string): void => {
  const state = getStore();
  state.messages = state.messages.map((message) =>
    message.id === messageId ? { ...message, is_deleted: true } : message
  );
};

export const deleteMockMessageAsync = async (messageId: string): Promise<void> => {
  const state = await readStoreFromDisk();
  state.messages = state.messages.map((message) =>
    message.id === messageId ? { ...message, is_deleted: true } : message
  );
  await writeStoreToDisk(state);
};
