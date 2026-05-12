'use client';

import { motion } from 'framer-motion';
import { WALLPAPERS } from '@/lib/constants';
import { WallpaperOption } from '@/lib/types';

interface WallpaperPickerProps {
  currentWallpaper: WallpaperOption | null;
  onSelect: (wallpaper: WallpaperOption) => void;
  onClose: () => void;
}

export default function WallpaperPicker({
  currentWallpaper,
  onSelect,
  onClose,
}: WallpaperPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-dark-secondary/95 backdrop-blur-md rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Choose Wallpaper</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {WALLPAPERS.map((wallpaper) => (
            <motion.button
              key={wallpaper.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onSelect(wallpaper);
                onClose();
              }}
              className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all ${
                currentWallpaper?.id === wallpaper.id
                  ? 'ring-2 ring-accent-red'
                  : 'hover:ring-2 hover:ring-gray-600'
              }`}
            >
              <div className={`w-full h-full ${wallpaper.value}`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-medium text-center px-2">
                  {wallpaper.name}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onSelect({ id: 'none', name: 'None', type: 'dark', value: 'bg-dark-bg' });
            onClose();
          }}
          className="w-full mt-6 py-3 rounded-full border border-gray-600 text-white hover:bg-gray-900/50 transition-all"
        >
          Reset to Default
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
