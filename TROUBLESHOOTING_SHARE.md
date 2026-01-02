# Troubleshooting Group Share & Reply Feature

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

## Test Fitur Reply (Balas Pesan)

### 1. Test Reply Button
- Hover mouse di atas pesan orang lain → tombol reply muncul di kanan
- Klik pesan sendiri → menu aksi muncul dengan tombol "Balas"
- Klik tombol reply → preview muncul di input area

### 2. Test Reply Preview
- Setelah klik reply, harus muncul preview di atas input
- Preview menampilkan nama pengirim dan sebagian isi pesan
- Ada tombol X untuk cancel reply

### 3. Test Send Reply
- Ketik pesan balasan dan kirim
- Pesan harus muncul dengan preview pesan yang dibalas di atasnya
- Visual: border cyan di kiri pesan yang merupakan reply

### 4. Database Migration Status
**PENTING:** Fitur reply memerlukan database migration!
- Lihat file `MIGRATION_INSTRUCTIONS.md` untuk langkah-langkah
- Tanpa migration, reply tetap berfungsi tapi tidak tersimpan relasi

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

### Masalah 4: Reply Tidak Tersimpan
**Gejala:** Reply berfungsi tapi tidak muncul setelah refresh
**Solusi:**
- Jalankan database migration (lihat MIGRATION_INSTRUCTIONS.md)
- Cek console untuk SQL errors
- Fallback handling akan tetap kirim pesan tanpa relasi

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

// Test reply functionality
console.log('Reply feature status:', {
  replyButtons: document.querySelectorAll('[title="Balas pesan"]').length,
  replyPreview: document.querySelector('.border-cyan-500') !== null
});
```