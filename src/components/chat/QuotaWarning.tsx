import { AlertTriangle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuotaWarningProps {
  onUpgrade: () => void;
}

const QuotaWarning = ({ onUpgrade }: QuotaWarningProps) => {
  return (
    <div className="border-t border-destructive/30 bg-destructive/5 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-foreground">Kuota Harian Habis</p>
            <p className="text-sm text-muted-foreground">
              Anda telah menggunakan 12 prompt hari ini. Reset dalam 24 jam.
            </p>
          </div>
        </div>
        
        <Button
          onClick={onUpgrade}
          className="gradient-accent text-accent-foreground hover:opacity-90 shrink-0"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade PRO
        </Button>
      </div>
    </div>
  );
};

export default QuotaWarning;
