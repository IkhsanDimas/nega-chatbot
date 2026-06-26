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
    colorClass: 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-black',
    borderClass: 'hover:border-amber-500/25 hover:shadow-amber-500/5',
    accentLine: 'bg-amber-500'
  },
  {
    icon: <Code className="w-5 h-5" />,
    title: 'Bantuan Coding',
    desc: 'Pecahkan kode/bug',
    prompt: 'Jelaskan konsep async/await di JavaScript dengan contoh sederhana',
    colorClass: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black',
    borderClass: 'hover:border-emerald-500/25 hover:shadow-emerald-500/5',
    accentLine: 'bg-emerald-500'
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Analisis Dokumen',
    desc: 'Bedah file PDF & gambar',
    prompt: 'Apa yang bisa kamu bantu terkait analisis dokumen dan file?',
    colorClass: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-black',
    borderClass: 'hover:border-blue-500/25 hover:shadow-blue-500/5',
    accentLine: 'bg-blue-500'
  },
  {
    icon: <Languages className="w-5 h-5" />,
    title: 'Terjemahan',
    desc: 'Alih bahasa instan',
    prompt: 'Terjemahkan "The quick brown fox jumps over the lazy dog" ke bahasa Indonesia',
    colorClass: 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-black',
    borderClass: 'hover:border-purple-500/25 hover:shadow-purple-500/5',
    accentLine: 'bg-purple-500'
  },
];

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-start px-4 md:px-8 py-12 bg-transparent select-none overflow-y-auto scrollbar-thin">
      <div className="max-w-2xl w-full text-center my-auto py-6">
        {/* Glowing Brand Icon and Greetings */}
        <div className="mb-10 animate-fade-in-up">
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-500/10 group">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500 to-indigo-600 blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
            <Bot className="w-10 h-10 text-white relative z-10 animate-bounce-subtle" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-white leading-tight">
            Halo! Saya <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Nega</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg font-light max-w-lg mx-auto leading-relaxed">
            Asisten AI cerdas Anda yang siap diajak bertukar ide, menulis kode, menerjemahkan, dan menganalisis berkas.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/5 mt-5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-zinc-500 font-medium">Model Aktif: {AI_MODEL_NAME}</span>
          </div>
        </div>

        {/* Dynamic Interactive Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {suggestions.map((item, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(item.prompt)}
              className={`text-left bg-slate-950/20 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-slate-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group shadow-lg shadow-black/30 relative overflow-hidden ${item.borderClass}`}
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full ${item.accentLine} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${item.colorClass}`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-base transition-colors mb-0.5 group-hover:text-cyan-400">{item.title}</h3>
                  <p className="text-xs text-zinc-500 mb-2 font-medium">{item.desc}</p>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed italic">"{item.prompt}"</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Feature Pill Tags */}
        <div className="mt-12 animate-fade-in-up flex flex-wrap justify-center gap-3.5" style={{ animationDelay: '0.3s' }}>
          <span className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 text-xs text-zinc-400 font-semibold hover:text-white transition-colors cursor-default">💬 Obrolan Teks</span>
          <span className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 text-xs text-zinc-400 font-semibold hover:text-white transition-colors cursor-default">📎 Analisis Dokumen & Gambar</span>
          <span className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 text-xs text-zinc-400 font-semibold hover:text-white transition-colors cursor-default">🎤 Dikte Suara</span>
          <span className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 text-xs text-zinc-400 font-semibold hover:text-white transition-colors cursor-default">🌐 Multibahasa</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
