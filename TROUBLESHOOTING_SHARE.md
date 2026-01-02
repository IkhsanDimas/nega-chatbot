# Troubleshooting Group Share

## Langkah Test Fitur Sharing

### 1. Buat Group Baru
- Masuk ke https://nega-chatbot.vercel.app/groups
- Klik tombol "+" untuk buat group baru
- Beri nama group dan klik "Buat Grup"

### 2. Test Tombol Bagikan
- Masuk ke group yang baru dibuat
- Klik tombol "BAGIKAN" di kanan atas
- Dialog sharing harus muncul dengan 3 opsi

### 3. Test Copy Link
- Klik tombol "Salin Link" (ikon copy biru)
- Harus muncul toast "Link grup berhasil disalin"
- Paste link di tab baru untuk test

### 4. Debug Console
Buka Developer Tools (F12) dan lihat console untuk debug logs:
```
GroupChat - Fetched group data: {name: "...", invite_code: "..."}
GroupInfoDialog - inviteCode: abc123def
GroupInfoDialog - link: https://nega-chatbot.vercel.app/join/abc123def
```

### 5. Test Manual Link
Format link: `https://nega-chatbot.vercel.app/join/INVITE_CODE`

Contoh: `https://nega-chatbot.vercel.app/join/a1b2c3d4e5f6`

## Kemungkinan Masalah

### Masalah 1: Invite Code Kosong
**Gejala:** Dialog muncul tapi ada pesan "Kode undangan tidak tersedia"
**Solusi:** 
- Cek console untuk error
- Group mungkin dibuat sebelum fix, coba buat group baru

### Masalah 2: Tombol Tidak Berfungsi
**Gejala:** Klik tombol tidak ada reaksi
**Solusi:**
- Cek console untuk JavaScript errors
- Pastikan browser support clipboard API
- Coba di browser lain

### Masalah 3: Link Tidak Berfungsi
**Gejala:** Link terbuka tapi tidak join ke group
**Solusi:**
- Pastikan sudah login sebelum klik link
- Cek apakah route `/join/:inviteCode` berfungsi
- Lihat console untuk error di JoinGroup page

## Test Commands

Untuk test di console browser:
```javascript
// Test clipboard
navigator.clipboard.writeText('test').then(() => console.log('Clipboard OK'));

// Test share API
if (navigator.share) {
  console.log('Share API supported');
} else {
  console.log('Share API not supported');
}
```