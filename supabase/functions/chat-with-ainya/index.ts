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
        JSON.stringify({ content: 'Tidak ada pesan yang dikirim.' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Trim manual untuk membuang spasi liar
    const rawKey = Deno.env.get('GEMINI_API_KEY') || ""
    const apiKey = rawKey.trim()
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ content: 'API Key tidak ditemukan. Silakan hubungi administrator.' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const userMessage = messages[messages.length - 1].content

    // Model gemini-2.5-flash yang memiliki quota di API key baru
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ 
          parts: [{ text: userMessage }] 
        }] 
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({ 
          content: `Error dari Gemini API: ${response.status} ${response.statusText}. ${errorText}` 
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const data = await response.json()

    if (data.error) {
      return new Response(
        JSON.stringify({ 
          content: `LOG ERROR: ${data.error.message} (Status: ${data.error.code}). Jika 401, kunci API Anda mungkin salah.` 
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
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
    return new Response(
      JSON.stringify({ 
        content: `Sistem Error: ${error.message}` 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }
})