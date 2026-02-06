import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // Our Drizzle Client
import { google } from "better-auth/social-providers";
import { emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
    debug: true, // Enable detailed logging for debugging 500 errors
    database: drizzleAdapter(db, {
        provider: "pg", // PostgreSQL
    }),

    emailAndPassword: {
        enabled: true,
        // autoSignIn: false // We verify email first!
    },

    // 📧 Plugin: Email OTP (One-Time Password)
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                const resendApiKey = process.env.RESEND_API_KEY;
                if (!resendApiKey) {
                    console.error("[AUTH] RESEND_API_KEY is missing. OTP cannot be sent.");
                    console.log(`[AUTH] FALLBACK OTP for ${email}: ${otp}`);
                    return;
                }

                try {
                    const { Resend } = await import("resend");
                    const resend = new Resend(resendApiKey);

                    const { error } = await resend.emails.send({
                        from: 'MUS <onboarding@resend.dev>', // Update this to your verified domain later
                        to: [email],
                        subject: 'Your Verification Code',
                        html: `
                            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                                <h1 style="color: #333;">Verification Code</h1>
                                <p style="font-size: 16px; color: #666;">Use the following code to sign in to MUS:</p>
                                <div style="font-size: 32px; font-weight: bold; color: #000; letter-spacing: 5px; margin: 20px 0;">${otp}</div>
                                <p style="font-size: 14px; color: #999;">This code will expire in 10 minutes.</p>
                            </div>
                        `,
                    });

                    if (error) {
                        console.error("[AUTH] Resend Error:", error);
                    } else {
                        console.log(`[AUTH] OTP sent successfully to ${email}`);
                    }
                } catch (err) {
                    console.error("[AUTH] Failed to send OTP via Resend:", err);
                }
            },
            sendVerificationOnSignUp: true,
        }),
    ],

    // 🌐 Social Providers (Google) - Only enabled if keys are provided
    socialProviders: (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ? {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    } : undefined,

    // 🔒 Security Config
    trustedOrigins: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "https://mus-node.vercel.app"
    ],

    // Rate Limiting (Disabled for dev/performance testing)
    // rateLimit: {
    //     window: 60, // 60 seconds
    //     max: 100, // 100 requests
    // }
});
