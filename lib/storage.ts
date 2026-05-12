const NICKNAME_KEY = 'chatapp_nickname';
const WALLPAPER_KEY = 'chatapp_wallpaper';
const ROOM_PREFERENCES_KEY = 'chatapp_preferences';

export const storage = {
  nickname: {
    get: (roomId: string): string => {
      if (typeof window === 'undefined') return '';
      const data = localStorage.getItem(`${NICKNAME_KEY}_${roomId}`);
      return data ? JSON.parse(data) : '';
    },
    set: (roomId: string, nickname: string): void => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(`${NICKNAME_KEY}_${roomId}`, JSON.stringify(nickname));
    },
    remove: (roomId: string): void => {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(`${NICKNAME_KEY}_${roomId}`);
    },
  },
  wallpaper: {
    get: (roomId: string) => {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem(`${WALLPAPER_KEY}_${roomId}`);
      return data ? JSON.parse(data) : null;
    },
    set: (roomId: string, wallpaper: any): void => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(`${WALLPAPER_KEY}_${roomId}`, JSON.stringify(wallpaper));
    },
    remove: (roomId: string): void => {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(`${WALLPAPER_KEY}_${roomId}`);
    },
  },
  preferences: {
    get: (roomId: string) => {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem(`${ROOM_PREFERENCES_KEY}_${roomId}`);
      return data ? JSON.parse(data) : null;
    },
    set: (roomId: string, preferences: any): void => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(`${ROOM_PREFERENCES_KEY}_${roomId}`, JSON.stringify(preferences));
    },
  },
};
