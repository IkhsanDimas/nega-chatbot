import { Bot, Lightbulb, Code, FileText, Languages, Sparkles } from 'lucide-react';

const AI_MODEL_NAME = "Gemini 2.5 Flash";

interface WelcomeScreenProps {
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: 'Ide Kreatif',
    desc: 'Cari ide bisnis baru',
    prompt: 'Berikan saya 5 ide bisnis kreatif untuk anak muda di Indonesia',
  },
  {
    icon: <Code className="w-5 h-5" />,
    title: 'Bantuan Coding',
    desc: 'Pecahkan kode/bug',
    prompt: 'Jelaskan konsep async/await di JavaScript dengan contoh sederhana',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Analisis Dokumen',
    desc: 'Bedah file PDF & gambar',
    prompt: 'Apa yang bisa kamu bantu terkait analisis dokumen dan file?',
  },
  {
    icon: <Languages className="w-5 h-5" />,
    title: 'Terjemahan',
    desc: 'Alih bahasa instan',
    prompt: 'Terjemahkan "The quick brown fox jumps over the lazy dog" ke bahasa Indonesia',
  },
];

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 md:px-8 py-12 bg-transparent select-none overflow-y-auto">
      <div className="max-w-2xl w-full text-center">
        {/* Glowing Brand Icon and Greetings */}
        <div className="mb-10 animate-fade-in-up">
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-500/10 group">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-500" />
            <Bot className="w-10 h-10 text-white relative z-10 animate-bounce-subtle" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-white">
            Halo! Saya <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Nega</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-light max-w-lg mx-auto leading-relaxed">
            Asisten kecerdasan buatan Anda yang siap diajak berdiskusi, menulis kode, dan menganalisis file.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 mt-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-zinc-500">Powered by {AI_MODEL_NAME}</span>
          </div>
        </div>

        {/* Dynamic Interactive Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {suggestions.map((item, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(item.prompt)}
              className="text-left bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:bg-slate-900/50 hover:border-cyan-500/20 hover:scale-[1.01] transition-all duration-300 group shadow-lg shadow-black/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/0 group-hover:bg-cyan-500/60 transition-all duration-300" />
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all duration-300 shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white text-base group-hover:text-cyan-400 transition-colors mb-0.5">{item.title}</h3>
                  <p className="text-xs text-zinc-500 mb-2 font-medium">{item.desc}</p>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed italic">"{item.prompt}"</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Feature Pill Tags */}
        <div className="mt-12 animate-fade-in-up flex flex-wrap justify-center gap-3" style={{ animationDelay: '0.3s' }}>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400 font-medium">💬 Obrolan Teks</span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400 font-medium">📎 Unggah Dokumen & Gambar</span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400 font-medium">🎤 Dikte Suara</span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400 font-medium">🌐 Multibahasa</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
