import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Share2, Copy, Check, Link2 } from 'lucide-react';

interface ShareDialogProps {
  conversationId: string;
  isShared: boolean;
  shareLink: string | null;
  onShareUpdate: (isShared: boolean, shareLink: string | null) => void;
}

const ShareDialog = ({ conversationId, isShared, shareLink, onShareUpdate }: ShareDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/shared/${conversationId}`;
    return link;
  };

  const handleToggleShare = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      const newShareLink = enabled ? generateShareLink() : null;
      
      const { error } = await supabase
        .from('conversations')
        .update({ 
          is_shared: enabled, 
          share_link: newShareLink 
        })
        .eq('id', conversationId);

      if (error) throw error;

      onShareUpdate(enabled, newShareLink);
      
      toast({
        title: enabled ? 'Link dibuat' : 'Link dihapus',
        description: enabled 
          ? 'Percakapan dapat diakses melalui link.' 
          : 'Percakapan tidak lagi dapat diakses publik.',
      });
    } catch (error) {
      console.error('Error updating share status:', error);
      toast({
        title: 'Gagal',
        description: 'Tidak dapat mengubah status berbagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: 'Berhasil',
        description: 'Link telah disalin ke clipboard.',
      });
    } catch {
      toast({
        title: 'Gagal',
        description: 'Tidak dapat menyalin link.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Share2 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bagikan Percakapan</DialogTitle>
          <DialogDescription>
            Buat link publik untuk membagikan percakapan ini dengan orang lain.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Toggle Share */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="share-toggle">Aktifkan Link Publik</Label>
              <p className="text-sm text-muted-foreground">
                Siapa saja dengan link dapat melihat percakapan
              </p>
            </div>
            <Switch
              id="share-toggle"
              checked={isShared}
              onCheckedChange={handleToggleShare}
              disabled={isLoading}
            />
          </div>

          {/* Share Link */}
          {isShared && shareLink && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="share-link">Link Berbagi</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="share-link"
                    value={shareLink}
                    readOnly
                    className="pl-10 pr-4 bg-muted"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
