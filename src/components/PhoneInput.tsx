import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, placeholder = "812345678", disabled }: PhoneInputProps) {
  const [countryCode] = useState('+62'); // Indonesia default

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value.replace(/\D/g, ''); // Only numbers
    onChange(phoneNumber);
  };

  const formatDisplayValue = (phone: string) => {
    // Format: 0812-3456-7890
    if (phone.length >= 4) {
      return phone.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Nomor HP</Label>
      <div className="flex">
        {/* Country Code */}
        <div className="flex items-center px-3 bg-secondary border border-r-0 border-border rounded-l-md">
          <span className="text-sm font-medium text-muted-foreground">🇮🇩 {countryCode}</span>
        </div>
        
        {/* Phone Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder={placeholder}
            value={formatDisplayValue(value)}
            onChange={handlePhoneChange}
            disabled={disabled}
            className="pl-10 rounded-l-none border-l-0 focus:border-primary"
            maxLength={13} // Max phone length with formatting
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Format: {countryCode}{formatDisplayValue(value || placeholder)}
      </p>
    </div>
  );
}