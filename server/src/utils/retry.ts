const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getRetryDelay(error: any) {
    const text = error.message || JSON.stringify(error);
    const match = text.match(/retry in (\d+(\.\d+)?)s/i) || text.match(/retry-after.*?(\d+)/i);
    if (match) {
        return parseFloat(match[1]) * 1000;
    }
    return null;
}

export async function retryWithBackoff(operation: any, retries = 10, initialDelay = 1000, operationName = "Operation") {
    let attempt = 0;
    while (true) {
        try {
            attempt++;
            return await operation(attempt);
        } catch (error: any) {
            const msg = error.message || JSON.stringify(error);
            const isRetriable = msg.includes('503') || msg.includes('429') || msg.includes('overloaded') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('UNAVAILABLE') || msg.includes('Timeout') || msg.includes('internal error') || msg.includes('socket hang up') || msg.includes('ECONNRESET');

            if (attempt > retries || !isRetriable) {
                console.error(`${operationName} failed permanently on attempt ${attempt}. Error: ${msg}`);
                throw error;
            }

            const base = initialDelay;
            const max = 60000;
            const slot = Math.pow(2, attempt - 1);
            const cap = Math.min(max, base * slot);
            let delay = Math.floor(Math.random() * cap);
            if (delay < initialDelay) delay = initialDelay + Math.random() * 1000;

            const serverDelay = getRetryDelay(error);
            if (serverDelay) {
                delay = serverDelay + 1000;
                console.warn(`${operationName} hit limit. Server requested wait of ${serverDelay / 1000}s.`);
            }

            console.warn(`${operationName} failed (Attempt ${attempt}/${retries}). Retrying in ${delay / 1000}s... Error: ${msg.substring(0, 150)}...`);
            await sleep(delay);
        }
    }
}
