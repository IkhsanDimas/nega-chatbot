# Setup Google OAuth untuk Nega Chatbot

## Langkah 1: Setup Google Cloud Console

### 1.1 Buat Project di Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik "Select a project" → "New Project"
3. Nama project: `nega-chatbot`
4. Klik "Create"

### 1.2 Enable Google+ API
1. Di sidebar, pilih "APIs & Services" → "Library"
2. Cari "Google+ API" atau "Google Identity"
3. Klik dan pilih "Enable"

### 1.3 Buat OAuth 2.0 Credentials
1. Di sidebar, pilih "APIs & Services" → "Credentials"
2. Klik "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "Nega Chatbot"
5. Authorized JavaScript origins:
   - `http://localhost:5173` (untuk development)
   - `https://nega-chatbot.vercel.app` (untuk production)
6. Authorized redirect URIs:
   - `https://slsdltptkzrfzzcoqxjw.supabase.co/auth/v1/callback`
7. Klik "Create"
8. **Simpan Client ID dan Client Secret**

## Langkah 2: Setup Supabase

### 2.1 Konfigurasi Google OAuth di Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Sidebar → "Authentication" → "Providers"
4. Cari "Google" dan klik toggle untuk enable
5. Masukkan:
   - **Client ID**: dari Google Cloud Console
   - **Client Secret**: dari Google Cloud Console
6. Klik "Save"

### 2.2 Update Redirect URLs
Di Supabase Authentication → Settings → URL Configuration:
- Site URL: `https://nega-chatbot.vercel.app`
- Redirect URLs: 
  - `https://nega-chatbot.vercel.app/chat`
  - `http://localhost:5173/chat`

## Langkah 3: Test Login Google

### 3.1 Development
1. Jalankan `npm run dev`
2. Buka `http://localhost:5173/auth`
3. Klik "Masuk dengan Google"
4. Harus redirect ke Google login

### 3.2 Production
1. Deploy ke Vercel
2. Buka `https://nega-chatbot.vercel.app/auth`
3. Test login Google

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Pastikan redirect URI di Google Cloud Console sama dengan yang di Supabase
- Format: `https://[PROJECT_REF].supabase.co/auth/v1/callback`

### Error: "unauthorized_client"
- Pastikan domain sudah ditambahkan di Authorized JavaScript origins
- Pastikan Google+ API sudah di-enable

### Error: "access_denied"
- User membatalkan login atau tidak memberikan permission
- Ini normal behavior

## Keamanan

1. **Jangan commit Client Secret** ke repository
2. **Gunakan environment variables** untuk production
3. **Batasi domain** di Google Cloud Console
4. **Monitor usage** di Google Cloud Console

## Fitur yang Didapat

✅ **Login dengan Google** - User bisa login dengan akun Google
✅ **Auto-create profile** - Otomatis buat profile di database
✅ **Seamless experience** - Tidak perlu OTP jika pakai Google
✅ **Secure** - Menggunakan OAuth 2.0 standard
✅ **Fast** - Login lebih cepat dari OTP email