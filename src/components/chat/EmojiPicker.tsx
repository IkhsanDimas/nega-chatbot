import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onStickerSelect: (sticker: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onStickerSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'sticker'>('emoji');

  // Emoji categories
  const emojiCategories = {
    'Senyum': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
    'Sedih': ['😢', '😭', '😤', '😠', '😡', '🤬', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬'],
    'Tangan': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏'],
    'Hati': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
    'Objek': ['🔥', '💯', '💢', '💨', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤']
  };

  // Sticker collection (large emojis)
  const stickers = [
    '😀', '😍', '🤣', '😭', '😱', '🤔', '👍', '👎', '❤️', '🔥',
    '💯', '🎉', '🎊', '🥳', '😎', '🤩', '🥰', '😘', '🤗', '🙄',
    '😴', '🤤', '🤢', '🤮', '🤧', '🤒', '🤕', '🥴', '😵', '🤯',
    '🥺', '😈', '👿', '💀', '☠️', '👻', '👽', '🤖', '💩', '🤡'
  ];

  return (
    <div className="absolute bottom-16 right-0 w-80 h-96 bg-zinc-900 border border-cyan-500/30 rounded-lg shadow-xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-700">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('emoji')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'emoji' 
                ? 'bg-cyan-500 text-black' 
                : 'text-cyan-400 hover:bg-cyan-500/20'
            }`}
          >
            😊 Emoji
          </button>
          <button
            onClick={() => setActiveTab('sticker')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'sticker' 
                ? 'bg-cyan-500 text-black' 
                : 'text-cyan-400 hover:bg-cyan-500/20'
            }`}
          >
            🎭 Stiker
          </button>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 h-80 overflow-y-auto">
        {activeTab === 'emoji' ? (
          <div className="space-y-4">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category}>
                <h4 className="text-xs text-slate-400 mb-2 font-medium">{category}</h4>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => onEmojiSelect(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-zinc-700 rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {stickers.map((sticker, index) => (
              <button
                key={index}
                onClick={() => onStickerSelect(sticker)}
                className="w-12 h-12 flex items-center justify-center text-2xl hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700 hover:border-cyan-500/50"
              >
                {sticker}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;