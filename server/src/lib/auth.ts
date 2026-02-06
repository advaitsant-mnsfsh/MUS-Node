import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // Our Drizzle Client
import { google } from "better-auth/social-providers";
import { emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // PostgreSQL
    }),

    emailAndPassword: {
        enabled: true,
        // autoSignIn: false // We verify email first!
    },

    // 📧 Plugin: Email OTP (One-Time Password)
    // This replaces Supabase Magic Links
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                // Here we integrate with RESEND to send the email
                // We will implement the actual email sending logic separately
                console.log(`[AUTH] Sending OTP to ${email}: ${otp}`);

                // Example Resend call:
                // await resend.emails.send({ ... })
            },
            sendVerificationOnSignUp: true,
        }),
    ],

    // 🌐 Social Providers (Google)
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },

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
