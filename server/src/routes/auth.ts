import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";

const router = Router();

// --- SECURE OTP-BASED PASSWORD RESET ---
router.post("/auth/reset-password-with-otp", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Missing email, otp, or newPassword" });
    }

    try {
        console.log(`[Auth] 🔄 Reset Password with OTP requested for: ${email}`);

        // Use the Native Better-Auth API for OTP Password Reset
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
            if (value) headers.append(key, Array.isArray(value) ? value.join(', ') : value);
        }

        const result = await (auth.api as any).resetPasswordEmailOTP({
            body: {
                email,
                otp,
                password: newPassword, // Standard field name usually 'password' or 'newPassword'
                newPassword: newPassword // Sending both to be safe against API variations
            },
            headers
        });

        if (result?.error) {
            console.error(`[Auth] ❌ Failed to reset password via API:`, result.error);
            throw new Error(result.error.message || "Failed to reset password via API");
        }

        console.log(`[Auth] ✅ Password reset successfully via OTP for: ${email}`);
        return res.json({ success: true, ...result });
    } catch (e: any) {
        console.error(`[Auth] 💥 Error:`, e);
        return res.status(500).json({ error: e.message || "Internal Server Error" });
    }
});

// This SINGLE route handles ALL auth endpoints
router.all("/auth/*", toNodeHandler(auth));

export default router;
