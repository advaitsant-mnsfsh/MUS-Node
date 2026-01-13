import fetch from 'node-fetch'; // or built-in in Node 18+

const [, , baseUrlRaw, apiKey] = process.argv;

if (!baseUrlRaw || !apiKey) {
    console.error('Usage: npx ts-node src/scripts/verify_deployment.ts <YOUR_RENDER_URL> <YOUR_API_KEY>');
    console.error('Example: npx ts-node src/scripts/verify_deployment.ts https://mus-node.onrender.com mus_live_12345');
    process.exit(1);
}

// Normalize URL
const baseUrl = baseUrlRaw.replace(/\/$/, ''); // Remove trailing slash if present
const submitUrl = `${baseUrl}/api/v1/audit`;

console.log(`\nTesting API at: ${baseUrl}`);
console.log(`Using Key:      ${apiKey.substring(0, 12)}...`);

interface SubmitResponse {
    jobId: string;
}

interface StatusResponse {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    resultUrl?: string;
    errorMessage?: string;
}

async function runTest() {
    try {
        // 1. Submit Job
        console.log('\n1. Submitting Audit Job...');
        const submitResponse = await fetch(submitUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({
                inputs: [{ type: 'url', url: 'https://example.com' }] // Simple fast URL
            })
        });

        if (!submitResponse.ok) {
            const text = await submitResponse.text();
            throw new Error(`Submission Failed (${submitResponse.status}): ${text}`);
        }

        const submitData = (await submitResponse.json()) as SubmitResponse;
        const jobId = submitData.jobId;
        console.log(`   ✓ Job Started! ID: ${jobId}`);

        // 2. Poll Status
        const statusUrl = `${baseUrl}/api/v1/audit/${jobId}`;
        console.log(`\n2. Polling Status at: ${statusUrl}`);

        let attempts = 0;
        const maxAttempts = 30; // 30 * 5s = 2.5 mins (should satisfy simple example)

        while (attempts < maxAttempts) {
            attempts++;
            const statusRes = await fetch(statusUrl, {
                headers: { 'x-api-key': apiKey }
            });

            if (!statusRes.ok) {
                console.log(`   ⚠️ Status check failed (${statusRes.status}) - Retrying...`);
            } else {
                const statusData = (await statusRes.json()) as StatusResponse;
                const status = statusData.status;
                process.stdout.write(`   [Attempt ${attempts}] Status: ${status}\r`);

                if (status === 'completed') {
                    console.log('\n\n✅ SUCCESS! Audit Completed.');
                    console.log(`   View Report Here: ${statusData.resultUrl}`);
                    return;
                }

                if (status === 'failed') {
                    console.error('\n\n❌ FAILED. The job failed on the server.');
                    console.error(`   Error Message: ${statusData.errorMessage}`);
                    return;
                }
            }

            // Wait 5 seconds
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        console.error('\n\n❌ Timed out waiting for job completion.');

    } catch (error: any) {
        console.error('\n\n❌ TEST FAILED:', error.message);
    }
}

runTest();
