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

  // Function to get sticker background gradient
  const getStickerBackground = (style: string) => {
    const gradients = {
      'gradient-blue': 'bg-gradient-to-br from-blue-400 to-blue-600',
      'gradient-pink': 'bg-gradient-to-br from-pink-400 to-pink-600',
      'gradient-orange': 'bg-gradient-to-br from-orange-400 to-orange-600',
      'gradient-rainbow': 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500',
      'gradient-purple': 'bg-gradient-to-br from-purple-400 to-purple-600',
      'gradient-yellow': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'gradient-red': 'bg-gradient-to-br from-red-400 to-red-600',
      'gradient-green': 'bg-gradient-to-br from-green-400 to-green-600',
      'gradient-gray': 'bg-gradient-to-br from-gray-400 to-gray-600',
      'gradient-white': 'bg-gradient-to-br from-gray-100 to-gray-300',
      'gradient-brown': 'bg-gradient-to-br from-amber-600 to-amber-800',
      'default': 'bg-gradient-to-br from-cyan-400 to-cyan-600'
    };
    return gradients[style] || gradients.default;
  };

  // Emoji categories
  const emojiCategories = {
    'Senyum': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
    'Sedih': ['😢', '😭', '😤', '😠', '😡', '🤬', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬'],
    'Tangan': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏'],
    'Hati': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
    'Objek': ['🔥', '💯', '💢', '💨', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤']
  };

  // Sticker collection (actual image stickers)
  const stickers = [
    // Anime/Manga style stickers
    { id: 'happy_anime', url: 'https://media.tenor.com/images/f9b2c9b5c5c5c5c5c5c5c5c5c5c5c5c5/tenor.gif', name: 'Happy Anime' },
    { id: 'sad_anime', url: 'https://media.tenor.com/images/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/tenor.gif', name: 'Sad Anime' },
    { id: 'love_anime', url: 'https://media.tenor.com/images/q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6/tenor.gif', name: 'Love Anime' },
    
    // Simple but distinct stickers using emoji combinations and styling
    { id: 'thumbs_up', content: '👍', style: 'gradient-blue' },
    { id: 'heart_eyes', content: '😍', style: 'gradient-pink' },
    { id: 'fire', content: '🔥', style: 'gradient-orange' },
    { id: 'party', content: '🎉', style: 'gradient-rainbow' },
    { id: 'cool', content: '😎', style: 'gradient-purple' },
    { id: 'laugh', content: '🤣', style: 'gradient-yellow' },
    { id: 'angry', content: '😡', style: 'gradient-red' },
    { id: 'sleepy', content: '😴', style: 'gradient-blue' },
    { id: 'shocked', content: '😱', style: 'gradient-orange' },
    { id: 'thinking', content: '🤔', style: 'gradient-green' },
    { id: 'kiss', content: '😘', style: 'gradient-pink' },
    { id: 'wink', content: '😉', style: 'gradient-purple' },
    { id: 'cry', content: '😭', style: 'gradient-blue' },
    { id: 'devil', content: '😈', style: 'gradient-red' },
    { id: 'angel', content: '😇', style: 'gradient-yellow' },
    { id: 'robot', content: '🤖', style: 'gradient-gray' },
    { id: 'alien', content: '👽', style: 'gradient-green' },
    { id: 'ghost', content: '👻', style: 'gradient-white' },
    { id: 'poop', content: '💩', style: 'gradient-brown' },
    { id: 'clown', content: '🤡', style: 'gradient-rainbow' }
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
          <div className="grid grid-cols-4 gap-3">
            {stickers.map((sticker, index) => (
              <button
                key={index}
                onClick={() => onStickerSelect(`STICKER:${sticker.id}:${sticker.content || sticker.url}:${sticker.style || 'default'}`)}
                className="relative w-16 h-16 flex items-center justify-center hover:bg-zinc-700 rounded-xl transition-all border-2 border-zinc-700 hover:border-cyan-500/50 group overflow-hidden"
              >
                {sticker.url ? (
                  <img 
                    src={sticker.url} 
                    alt={sticker.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-3xl rounded-lg ${getStickerBackground(sticker.style)}`}>
                    {sticker.content}
                  </div>
                )}
                {sticker.url && (
                  <div className="hidden w-full h-full items-center justify-center text-2xl bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                    🎭
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;