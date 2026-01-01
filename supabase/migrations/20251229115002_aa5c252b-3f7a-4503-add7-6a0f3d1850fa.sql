-- Add DELETE policy for otp_codes table
CREATE POLICY "Service role can delete OTP"
ON public.otp_codes
FOR DELETE
USING (true);