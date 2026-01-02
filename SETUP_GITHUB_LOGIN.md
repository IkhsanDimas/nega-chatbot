# 🚀 Setup GitHub Login (5 Menit - Gratis!)

## Keuntungan GitHub Login
✅ **100% Gratis** - Tidak perlu kartu kredit sama sekali
✅ **Setup super mudah** - Hanya 5 menit
✅ **Professional look** - Menambah kredibilitas aplikasi
✅ **Target audience cocok** - Developer biasanya punya GitHub

---

## 📋 Step 1: Buat GitHub OAuth App

### 1.1 Login ke GitHub
- Buka: https://github.com
- Login dengan akun GitHub Anda

### 1.2 Buka Developer Settings
- Klik **profile picture** (kanan atas) → **Settings**
- Scroll ke bawah, klik **Developer settings** (sidebar kiri)
- Klik **OAuth Apps** → **New OAuth App**

### 1.3 Isi Form OAuth App
```
Application name: Nega Chatbot
Homepage URL: https://nega-chatbot.vercel.app
Application description: AI Chatbot Indonesia
Authorization callback URL: https://slsdltptkzrfzzcoqxjw.supabase.co/auth/v1/callback
```

### 1.4 Klik "Register application"

### 1.5 Simpan Credentials
Setelah dibuat, Anda akan dapat:
- **Client ID**: `Ov23xxxxxxxxxxxxx`
- **Client Secret**: Klik **"Generate a new client secret"**

**PENTING**: Salin dan simpan Client ID dan Client Secret!

---

## 🔧 Step 2: Setup Supabase

### 2.1 Buka Supabase Dashboard
- Login ke: https://supabase.com/dashboard
- Pilih project Anda

### 2.2 Enable GitHub Provider
- Sidebar kiri: **Authentication** → **Providers**
- Scroll ke bawah, cari **GitHub**
- **Toggle switch** untuk enable GitHub
- Masukkan:
  - **Client ID**: [dari GitHub]
  - **Client Secret**: [dari GitHub]
- Klik **Save**

### 2.3 Update Site URL (Jika Belum)
- Masih di Authentication → **URL Configuration**
- **Site URL**: `https://nega-chatbot.vercel.app`
- **Redirect URLs**: Pastikan ada:
  ```
  https://nega-chatbot.vercel.app/chat
  http://localhost:5173/chat
  ```

---

## ✅ Step 3: Test Login

### 3.1 Test Development
1. Jalankan: `npm run dev`
2. Buka: `http://localhost:5173/auth`
3. Klik **"Masuk dengan GitHub"**
4. Harus redirect ke GitHub login

### 3.2 Test Production
1. Buka: `https://nega-chatbot.vercel.app/auth`
2. Klik **"Masuk dengan GitHub"**
3. Login dengan GitHub
4. Harus redirect ke `/chat`

---

## 🎯 Hasil Akhir

Setelah setup selesai, user punya **2 pilihan login**:

### **Opsi 1: Email + OTP**
- Masukkan email
- Terima kode OTP 6 digit
- Verifikasi dan masuk

### **Opsi 2: GitHub Login** ⭐
- Klik "Masuk dengan GitHub"
- Login dengan akun GitHub
- Otomatis masuk ke aplikasi

---

## 🚨 Troubleshooting

### Error: "The redirect_uri MUST match..."
**Solusi**: Pastikan callback URL di GitHub sama persis:
```
https://slsdltptkzrfzzcoqxjw.supabase.co/auth/v1/callback
```

### Error: "Bad verification code"
**Solusi**: 
1. Cek Client ID dan Client Secret di Supabase
2. Pastikan tidak ada spasi atau karakter tambahan

### Tombol GitHub tidak muncul
**Solusi**: 
1. Refresh halaman setelah deploy
2. Cek console browser untuk error

---

## 💡 Tips

1. **GitHub OAuth gratis selamanya** - Tidak ada limit
2. **User bisa pakai email GitHub** - Otomatis sync
3. **Professional image** - Aplikasi terlihat lebih credible
4. **Fast login** - Lebih cepat dari OTP email

Mau saya bantu setup step by step? 🚀