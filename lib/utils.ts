export const sanitizeInput = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const generateRoomId = (): string => {
  const adjectives = ['moon', 'star', 'night', 'dream', 'shadow', 'silver', 'cosmic', 'quiet', 'secret', 'velvet'];
  const nouns = ['river', 'sky', 'heart', 'whisper', 'echo', 'rose', 'breeze', 'silence', 'melody', 'light'];
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${randomAdj}-${randomNoun}-${randomNum}`;
};

export const getCurrentLocale = (): string => {
  return typeof window !== 'undefined' ? navigator.language : 'en-US';
};
