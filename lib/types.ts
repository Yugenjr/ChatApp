export interface Room {
  id: string;
  room_slug: string;
  passphrase: string | null;
  created_at: string;
  wallpaper?: any;
}

export interface Message {
  id: string;
  room_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
}

export interface WallpaperOption {
  id: string;
  name: string;
  type: 'gradient' | 'image' | 'dark';
  value: string;
  thumbnail?: string;
}
