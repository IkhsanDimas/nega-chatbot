import { Bot, Lightbulb, Code, FileText, Languages } from 'lucide-react';

// AI Model Configuration
const AI_MODEL_NAME = "Gemini 2.5 Flash";

interface WelcomeScreenProps {
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: 'Ide Kreatif',
    prompt: 'Berikan saya 5 ide bisnis kreatif untuk anak muda di Indonesia',
  },
  {
    icon: <Code className="w-5 h-5" />,
    title: 'Bantuan Coding',
    prompt: 'Jelaskan konsep async/await di JavaScript dengan contoh sederhana',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Analisis Dokumen',
    prompt: 'Apa yang bisa kamu bantu terkait analisis dokumen dan file?',
  },
  {
    icon: <Languages className="w-5 h-5" />,
    title: 'Terjemahan',
    prompt: 'Terjemahkan "The quick brown fox jumps over the lazy dog" ke bahasa Indonesia',
  },
];

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo & Welcome */}
        <div className="mb-8 animate-fade-in-up">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center mx-auto mb-6 glow-primary animate-bounce-subtle shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3">
            Halo! Saya <span className="text-gradient">Nega</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Asisten AI cerdas yang siap membantu Anda. Ada yang bisa saya bantu hari ini?
          </p>
          <p className="text-sm text-muted-foreground/70">
            Powered by {AI_MODEL_NAME}
          </p>
        </div>

        {/* Suggestions */}
        <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {suggestions.map((item, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(item.prompt)}
              className="glass rounded-2xl p-4 text-left hover:border-primary/30 transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.prompt}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Capabilities */}
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-muted-foreground">
            💬 Chat teks • 📎 Upload file • 🎤 Voice • 🌐 Multibahasa
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
