import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { messages } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    const userMessage = messages[messages.length - 1].content

    // LANGKAH 1: Tanya ke Google model apa saja yang tersedia untuk KEY ini
    const listModels = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    const listData = await listModels.json()
    
    // LANGKAH 2: Cari model yang bisa dipakai untuk chat (generateContent)
    // Ini akan otomatis mengambil gemini-1.5-flash atau gemini-pro sesuai akun Anda
    const activeModel = listData.models?.find((m: any) => 
      m.supportedGenerationMethods.includes('generateContent') && 
      m.name.includes('gemini')
    )?.name || "models/gemini-1.5-flash"

    // LANGKAH 3: Kirim pesan ke model yang ditemukan tadi
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${activeModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: userMessage }] }] })
    })

    const data = await response.json()
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Ainya sudah terhubung tapi respon kosong."

    // UPDATE DATABASE
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      if (user) await supabase.rpc('increment_prompt_count', { user_id: user.id })
    }

    return new Response(JSON.stringify({ content: aiText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ content: "Sistem: " + error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})