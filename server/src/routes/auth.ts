import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { db } from "../lib/db.js";
import { verification } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

const router = Router();

// --- UNSECURE RESET PASSWORD (For Dev/Simplified Flow) ---
router.post("/auth/reset-password-unsecure", async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ error: "Missing email or newPassword" });
    }

    try {
        console.log(`[Auth] 🔄 Unsecure Reset Password requested for: ${email}`);

        // 1. Generate a reset token (internal call)
        await (auth.api as any).forgotPassword({
            body: { email }
        });

        // 2. Grab the token from the DB immediately
        const [tokenRecord] = await db.select()
            .from(verification)
            .where(eq(verification.identifier, email))
            .orderBy(desc(verification.createdAt))
            .limit(1);

        if (!tokenRecord) {
            console.error(`[Auth] ❌ Failed to find reset token for ${email}`);
            return res.status(404).json({ error: "User not found or token generation failed." });
        }

        // 3. Apply the reset
        await auth.api.resetPassword({
            body: {
                token: tokenRecord.value,
                newPassword: newPassword
            }
        });

        console.log(`[Auth] ✅ Password reset successfully for: ${email}`);
        return res.json({ success: true });
    } catch (e: any) {
        console.error(`[Auth] 💥 Reset Password Error:`, e);
        return res.status(500).json({ error: e.message || "Internal Server Error" });
    }
});

// This SINGLE route handles ALL auth endpoints
router.all("/auth/*", toNodeHandler(auth));

export default router;
