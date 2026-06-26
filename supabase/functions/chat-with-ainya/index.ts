import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()
    
    // Validasi input
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Tidak ada pesan yang dikirim.',
          message: 'Tidak ada pesan yang dikirim.',
          content: 'Tidak ada pesan yang dikirim.' 
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Trim manual untuk membuang spasi liar
    const rawKey = Deno.env.get('GEMINI_API_KEY') || ""
    const apiKey = rawKey.trim()
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'API Key tidak ditemukan. Silakan hubungi administrator.',
          message: 'API Key tidak ditemukan. Silakan hubungi administrator.',
          content: 'API Key tidak ditemukan. Silakan hubungi administrator.' 
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Model gemini-2.5-flash yang memiliki quota di API key baru
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    // Memetakan seluruh pesan agar AI memiliki memori percakapan (konteks)
    // Gemini memerlukan role 'user' (pengguna) atau 'model' (AI)
    const geminiContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: geminiContents
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      const errorMsg = `Error dari Gemini API: ${response.status} ${response.statusText}. ${errorText}`
      return new Response(
        JSON.stringify({ 
          error: errorMsg,
          message: errorMsg,
          content: errorMsg
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status || 500
        }
      )
    }

    const data = await response.json()

    if (data.error) {
      const errorMsg = `LOG ERROR: ${data.error.message} (Status: ${data.error.code}).`
      return new Response(
        JSON.stringify({ 
          error: errorMsg,
          message: errorMsg,
          content: errorMsg 
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Respon AI kosong."
    
    return new Response(
      JSON.stringify({ content: aiText }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('Edge Function Error:', error)
    const errorMsg = `Sistem Error: ${error.message}`
    return new Response(
      JSON.stringify({ 
        error: errorMsg,
        message: errorMsg,
        content: errorMsg 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})