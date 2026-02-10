import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { db } from "../lib/db.js";
import { verification } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

const router = Router();

// --- SECURE OTP-BASED PASSWORD RESET ---
router.post("/auth/reset-password-with-otp", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Missing email, otp, or newPassword" });
    }

    try {
        console.log(`[Auth] 🔄 Reset Password with OTP requested for: ${email}`);

        // 1. Verify OTP using the email-otp plugin API
        // Note: verifyEmail will throw or return error if invalid
        const verifyResult = await (auth.api as any).verifyEmail({
            body: { email, otp }
        });

        if (verifyResult.error) {
            console.error(`[Auth] ❌ OTP Verification failed for ${email}:`, verifyResult.error);
            return res.status(400).json({ error: "Invalid or expired verification code." });
        }

        // 2. OTP is valid! Now we need to actually change the password.
        // Since the user is now "verified", we can use the internal resetPassword API.
        // We still need a token because Better-Auth's resetPassword requires one.

        // Generate a reset token
        await (auth.api as any).forgotPassword({
            body: { email }
        });

        // Grab the token from the DB
        const [tokenRecord] = await db.select()
            .from(verification)
            .where(eq(verification.identifier, email))
            .orderBy(desc(verification.createdAt))
            .limit(1);

        if (!tokenRecord) {
            return res.status(500).json({ error: "Failed to generate security token." });
        }

        // Apply the reset
        await auth.api.resetPassword({
            body: {
                token: tokenRecord.value,
                newPassword: newPassword
            }
        });

        console.log(`[Auth] ✅ Password reset successfully via OTP for: ${email}`);
        return res.json({ success: true });
    } catch (e: any) {
        console.error(`[Auth] 💥 Reset Password OTP Error:`, e);
        return res.status(500).json({ error: e.message || "Internal Server Error" });
    }
});

// This SINGLE route handles ALL auth endpoints
router.all("/auth/*", toNodeHandler(auth));

export default router;
