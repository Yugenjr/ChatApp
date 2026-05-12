import { create } from 'zustand';

interface TypingUser {
  name: string;
  roomId: string;
  timestamp: number;
}

interface ChatStore {
  nickname: string;
  setNickname: (nickname: string) => void;
  typingUsers: TypingUser[];
  addTypingUser: (user: TypingUser) => void;
  removeTypingUser: (name: string) => void;
  clearTypingUsers: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  nickname: '',
  setNickname: (nickname: string) => set({ nickname }),
  typingUsers: [],
  addTypingUser: (user: TypingUser) =>
    set((state) => ({
      typingUsers: [
        ...state.typingUsers.filter((u) => u.name !== user.name),
        user,
      ],
    })),
  removeTypingUser: (name: string) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((u) => u.name !== name),
    })),
  clearTypingUsers: () => set({ typingUsers: [] }),
}));
