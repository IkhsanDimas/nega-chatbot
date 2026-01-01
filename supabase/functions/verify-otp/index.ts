import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email dan kode OTP diperlukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check OTP code
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("verified", false)
      .single();

    if (otpError || !otpData) {
      console.error("OTP not found:", otpError);
      return new Response(
        JSON.stringify({ error: "Kode OTP tidak valid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (new Date(otpData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Kode OTP sudah kadaluarsa" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as verified
    await supabaseAdmin
      .from("otp_codes")
      .update({ verified: true })
      .eq("id", otpData.id);

    // Generate magic link for this email to create a session
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
    });

    if (linkError || !linkData) {
      console.error("Generate link error:", linkError);
      throw new Error("Gagal membuat sesi login");
    }

    // Get the token_hash from the generated link
    const tokenHash = linkData.properties?.hashed_token;

    if (!tokenHash) {
      throw new Error("Token tidak valid");
    }

    console.log("OTP verified successfully for:", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        token_hash: tokenHash,
        message: "OTP berhasil diverifikasi" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
