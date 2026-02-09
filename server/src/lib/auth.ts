import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js"; // Our Drizzle Client
import { google } from "better-auth/social-providers";
import { emailOTP, bearer } from "better-auth/plugins";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL, // e.g. https://mus-node-production.up.railway.app
    secret: process.env.BETTER_AUTH_SECRET,
    debug: true,
    database: drizzleAdapter(db, {
        provider: "pg", // PostgreSQL
    }),

    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 Days (Feel free to make it longer)
        updateAge: 60 * 60 * 24, // Update session once a day if active
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 min local cookie cache for speed
        }
    },

    emailAndPassword: {
        enabled: true,
        // autoSignIn: false // We verify email first!
    },

    // 📧 Plugin: Email OTP (One-Time Password)
    plugins: [
        bearer(),
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

                    console.log(`[AUTH] 📤 Attempting to send OTP to ${email} via Resend...`);

                    const { data, error } = await resend.emails.send({
                        from: 'onboarding@resend.dev',
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
                        console.error("[AUTH] ❌ Resend Error Detail:", JSON.stringify(error, null, 2));
                        console.log(`[AUTH] 💡 Quick Tip: If you are in Resend Sandbox, you can ONLY send to yourself unless you verify your domain.`);
                        console.log(`[AUTH] FALLBACK OTP for ${email}: ${otp}`);
                    } else {
                        console.log(`[AUTH] ✅ OTP sent successfully to ${email}. ID: ${data?.id}`);
                    }
                } catch (err) {
                    console.error("[AUTH] Failed to send OTP via Resend:", err);
                    console.log(`[AUTH] FALLBACK OTP for ${email}: ${otp} (Because code crashed)`);
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

    // 🔒 Security & Cookie Config
    trustedOrigins: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "https://mus-node.vercel.app",
        "https://mus-node-client-ui.vercel.app", // Common Vercel pattern
        "https://mus-node-client-ui-advait-sants-projects.vercel.app" // Full Vercel URL
    ],
    cookies: {
        sessionToken: {
            name: 'better-auth.session_token', // Explicit cookie name
            attributes: {
                sameSite: 'none', // Required for cross-origin
                secure: true, // Required for sameSite: none
                httpOnly: true, // Security best practice
                path: '/', // Available on all paths
                maxAge: 60 * 60 * 24 * 30 // 30 days in seconds
            }
        }
    }

    // Rate Limiting (Disabled for dev/performance testing)
    // rateLimit: {
    //     window: 60, // 60 seconds
    //     max: 100, // 100 requests
    // }
});
