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
                    const subject = isReset ? 'Reset Your Password' : 'Your Verification Code';
                    const title = 'Verification Code';
                    const description = 'Please enter this code on the screen where you started your sign in';

                    const { data, error } = await resend.emails.send({
                        from: fromEmail,
                        to: [email],
                        subject: subject,
                        html: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <meta name="color-scheme" content="light dark">
                                <meta name="supported-color-schemes" content="light dark">
                                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                                <style>
                                    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
                                    .light-logo { display: block !important; }
                                    .dark-logo { display: none !important; max-height: 0 !important; overflow: hidden !important; }
                                    .email-container { padding: 40px 20px; }
                                    .main-card { max-width: 540px; width: 100%; padding: 48px 40px; }
                                    .otp-box { min-width: 320px; padding: 28px 24px; }
                                    .otp-text { font-size: 48px; letter-spacing: 0.3em; }
                                    .title-text { font-size: 32px; }
                                    @media only screen and (max-width: 600px) {
                                        .email-container { padding: 20px 16px !important; }
                                        .main-card { padding: 32px 20px !important; max-width: 100% !important; }
                                        .otp-box { min-width: auto !important; width: 100% !important; padding: 20px 16px !important; box-sizing: border-box !important; }
                                        .otp-text { font-size: 32px !important; letter-spacing: 0.2em !important; }
                                        .title-text { font-size: 24px !important; }
                                        .desc-text { font-size: 14px !important; }
                                        .footer-text { font-size: 12px !important; }
                                    }
                                    @media (prefers-color-scheme: dark) {
                                        .bg-gradient { background: linear-gradient(180deg, #1A1A1A 0%, #3D3416 100%) !important; }
                                        .card-bg { background: #262626 !important; border-color: #404040 !important; }
                                        .text-primary { color: #FFFFFF !important; }
                                        .text-secondary { color: #A3A3A3 !important; }
                                        .text-muted { color: #737373 !important; }
                                        .otp-box { background: #624F04 !important; border-color: #78350F !important; }
                                        .otp-text { color: #FFFFFF !important; }
                                        .footer-bg { background: #292524 !important; }
                                        .light-logo { display: none !important; max-height: 0 !important; overflow: hidden !important; }
                                        .dark-logo { display: block !important; max-height: none !important; }
                                    }
                                    /* Dark mode support for email clients */
                                    [data-ogsc] .light-logo { display: none !important; max-height: 0 !important; }
                                    [data-ogsc] .dark-logo { display: block !important; max-height: none !important; }
                                </style>
                            </head>
                            <body class="bg-gradient" style="background: linear-gradient(180deg, #FEFEFE 0%, #FFFBF0 100%); min-height: 100vh; padding: 40px 20px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td align="center">
                                            <!-- Logo -->
                                            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                                                <tr>
                                                    <td align="center">
                                                        <!-- Light mode logo -->
                                                        <img src="${process.env.CLIENT_URL || 'https://mus-node.vercel.app'}/logo.png" alt="MyUXScore" class="light-logo" style="height: 48px; width: auto; max-width: 100%; display: block;" />
                                                        <!-- Dark mode logo -->
                                                        <div class="dark-logo" style="display: none; max-height: 0; overflow: hidden;">
                                                            <img src="${process.env.CLIENT_URL || 'https://mus-node.vercel.app'}/logo-white.png" alt="MyUXScore" style="height: 48px; width: auto; max-width: 100%; display: block;" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Main Card -->
                                            <table class="card-bg main-card" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; width: 100%; background: #FAFAFA; border: 1px solid #E0E0E0; border-radius: 24px; padding: 48px 40px;">
                                                <tr>
                                                    <td align="center" style="padding-bottom: 32px;">
                                                        <h1 class="text-primary title-text" style="margin: 0; font-size: 32px; font-weight: 600; color: #1A1A1A;">Verification Code</h1>
                                                    </td>
                                                </tr>
                                                
                                                <tr>
                                                    <td align="center" style="padding-bottom: 24px;">
                                                        <div class="otp-box" style="background: #FEF3C7; border: 2px dotted #D4A574; border-radius: 16px; padding: 28px 24px;">
                                                            <div class="otp-text" style="font-size: 48px; font-weight: 700; color: #1A1A1A; letter-spacing: 0.3em;">${otp}</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                
                                                <tr>
                                                    <td align="center" style="padding-bottom: 16px;">
                                                        <p class="text-secondary desc-text" style="margin: 0; font-size: 15px; font-weight: 400; color: #666666; line-height: 1.6;">Please enter this code on the screen<br/>where you started your sign in</p>
                                                    </td>
                                                </tr>
                                                
                                                <tr>
                                                    <td align="center" style="padding-bottom: 48px;">
                                                        <p class="text-muted desc-text" style="margin: 0; font-size: 14px; font-weight: 400; color: #999999;">This code is valid for next 10 minutes</p>
                                                    </td>
                                                </tr>
                                                
                                                <tr>
                                                    <td align="center" style="padding-top: 32px; border-top: 1px solid rgba(0,0,0,0.08);">
                                                        <p class="text-muted footer-text" style="margin: 0; font-size: 14px; font-weight: 400; color: #999999;">MyUXScore, stop guessing and start growing.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Footer -->
                                            <table class="footer-bg" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; width: 100%; margin-top: 24px; background: #FFF9E6; padding: 24px; border-radius: 16px;">
                                                <tr>
                                                    <td align="center">
                                                        <p class="text-secondary footer-text" style="margin: 0 0 8px 0; font-size: 13px; font-weight: 400; color: #666666;">If you didn't request this code, please ignore this mail</p>
                                                        <p class="text-secondary footer-text" style="margin: 0; font-size: 13px; font-weight: 400; color: #666666;">© ${new Date().getFullYear()} MyUXScore. All rights reserved.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </body>
                            </html>
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
