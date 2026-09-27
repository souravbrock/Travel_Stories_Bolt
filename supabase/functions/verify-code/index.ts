import { createClient } from "npm:@supabase/supabase-js@2.117.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find the most recent unused, non-expired code for this email
    const { data, error } = await supabase
      .from("verification_codes")
      .select("id, code, expires_at, consumed")
      .eq("email", normalizedEmail)
      .eq("consumed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: "No valid verification code found. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Verification code has expired. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check code matches
    if (data.code !== code.toString()) {
      return new Response(
        JSON.stringify({ error: "Invalid verification code. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Mark code as consumed
    await supabase
      .from("verification_codes")
      .update({ consumed: true })
      .eq("id", data.id);

    return new Response(
      JSON.stringify({ success: true, message: "Email verified successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
