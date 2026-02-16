import 'dotenv/config';
import { sendReportReadyEmail } from '../src/lib/auth.js';

/**
 * TEST REPORT EMAIL
 * Run this: npm run script scripts/send_test_email.ts <YOUR_EMAIL>
 */
async function testEmail() {
    const email = process.argv[2];

    if (!email) {
        console.error("❌ Please provide an email address.");
        console.log("Usage: npm run script scripts/send_test_email.ts your@email.com");
        process.exit(1);
    }

    console.log(`📤 Sending test report email to: ${email}...`);

    // Using a fake but valid-looking UUID format for the link
    const mockJobId = "550e8400-e29b-41d4-a716-446655440000";
    const mockName = "Explorer";

    try {
        await sendReportReadyEmail(email, mockJobId, mockName);
        console.log("✅ Email sent successfully! Check your inbox (and spam).");
    } catch (err) {
        console.error("💥 Failed to send email:", err);
    }

    process.exit(0);
}

testEmail();
