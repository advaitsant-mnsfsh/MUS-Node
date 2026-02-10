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
                const resendApiKey = process.env.RESEND_API_KEY || process.env.RESENT_API_KEY;
                const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

                if (!resendApiKey) {
                    console.error("[AUTH] ❌ RESEND_API_KEY is missing. OTP cannot be sent via email.");
                    console.log(`[AUTH] 🔑 FALLBACK OTP for ${email}: ${otp}`);
                    return;
                }

                try {
                    const { Resend } = await import("resend");
                    const resend = new Resend(resendApiKey);

                    console.log(`[AUTH] 📤 Sending ${type} OTP to ${email} (From: ${fromEmail})`);

                    const isReset = type === 'forget-password';
                    const subject = isReset ? 'Reset Your MUS Password' : 'Your MUS Verification Code';
                    const title = isReset ? 'Password Reset' : 'Verification Code';
                    const description = isReset
                        ? 'We received a request to reset your password. Use the code below to proceed.'
                        : 'Enter the code below to complete your sign-in to MUS.';

                    const { data, error } = await resend.emails.send({
                        from: fromEmail,
                        to: [email],
                        subject: subject,
                        html: `
                            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #f8fafc; text-align: center;">
                                <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 2px solid #000000; border-radius: 12px; padding: 40px; box-shadow: 8px 8px 0px 0px rgba(0,0,0,0.1);">
                                    <div style="margin-bottom: 24px;">
                                        <h1 style="color: #000000; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">MUS</h1>
                                    </div>
                                    <h2 style="color: #1a202c; margin-bottom: 8px; font-size: 20px; font-weight: 700;">${title}</h2>
                                    <p style="font-size: 16px; color: #4a5568; margin-bottom: 32px; line-height: 1.5;">${description}</p>
                                    
                                    <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                                        <div style="font-size: 38px; font-weight: 800; color: #6366f1; letter-spacing: 12px; margin-left: 12px;">${otp}</div>
                                    </div>
                                    
                                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">This code will expire in 10 minutes.</p>
                                    <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; pt: 20px;">
                                        <p style="font-size: 12px; color: #94a3b8;">If you didn't request this code, you can safely ignore this email.</p>
                                    </div>
                                </div>
                            </div>
                        `,
                    });

                    if (error) {
                        console.error("[AUTH] ❌ Resend API Error:", error);
                        console.log(`[AUTH] 🚩 FALLBACK OTP for ${email}: ${otp}`);
                    } else {
                        console.log(`[AUTH] ✅ OTP sent via Resend. ID: ${data?.id}`);
                    }
                } catch (err) {
                    console.error("[AUTH] 💥 Failed to send OTP via Resend:", err);
                    console.log(`[AUTH] 🚩 FALLBACK OTP for ${email}: ${otp}`);
                }
            },
            sendVerificationOnSignUp: true,
            otpLength: 6
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
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8080",
        "https://mus-node.vercel.app",
        "https://mus-node-client-ui.vercel.app",
        "https://mus-node-production.up.railway.app",
        // Add wildcards for Vercel preview branches
        "https://*-advait-sants-projects.vercel.app",
        "https://*-monsoonfish.vercel.app"
    ],
    cookies: {
        sessionToken: {
            name: 'better-auth.session_token', // Explicit cookie name
            attributes: {
                sameSite: 'none', // Required for cross-origin
                secure: process.env.BETTER_AUTH_URL?.startsWith("https://") ? true : false,
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
