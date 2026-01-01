import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email diperlukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate 6-digit OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTP codes for this email
    await supabase.from("otp_codes").delete().eq("email", email);

    // Insert new OTP code
    const { error: insertError } = await supabase.from("otp_codes").insert({
      email,
      code: otpCode,
      expires_at: expiresAt.toISOString(),
      verified: false,
    });

    if (insertError) {
      console.error("Insert OTP error:", insertError);
      throw new Error("Gagal menyimpan OTP");
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Nega <onboarding@resend.dev>",
      to: [email],
      subject: "Kode Verifikasi Nega",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
          <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; padding: 40px; text-align: center; border: 1px solid rgba(45, 212, 191, 0.2);">
              
              <!-- Logo -->
              <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #2dd4bf 0%, #3b82f6 100%); border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 36px; color: white;">🤖</span>
              </div>
              
              <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px; font-weight: 600;">Nega</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 32px;">AI Chatbot Indonesia</p>
              
              <p style="color: #e2e8f0; font-size: 16px; margin: 0 0 24px;">Gunakan kode berikut untuk masuk ke akun Anda:</p>
              
              <!-- OTP Code -->
              <div style="background: rgba(45, 212, 191, 0.1); border: 2px solid rgba(45, 212, 191, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <span style="font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #2dd4bf;">${otpCode}</span>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">Kode berlaku selama <strong style="color: #2dd4bf;">10 menit</strong></p>
              
              <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
              
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                Jika Anda tidak meminta kode ini, abaikan email ini.
              </p>
            </div>
            
            <p style="text-align: center; color: #475569; font-size: 12px; margin-top: 24px;">
              © 2024 Nega. Hanya untuk pengguna Indonesia.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "OTP berhasil dikirim" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
