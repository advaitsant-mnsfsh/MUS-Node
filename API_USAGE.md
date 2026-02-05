# Audit API Usage Guide

This guide explains how to use the External Audit API to generate UX/Product audits programmatically.

## 🚀 Quick Start

### 1. Prerequisite: Create API Key
Ask the admin to generate a key for you, or if you are the admin, run:
```bash
# In server directory
npx ts-node src/scripts/generateKey.ts "Your Client Name"
```
*Save the output key (e.g., `mus_live_8f3a...`).*

### 2. Submit an Audit (POST)
Send a request to start the audit job. This is asynchronous because audits take ~2 minutes.

**Endpoint:** `POST https://your-server-url.com/api/v1/audit`
**Headers:**
- `Content-Type: application/json`
- `x-api-key: YOUR_API_KEY`

**Body:**
```json
{
  "inputs": [
    { "type": "url", "url": "https://www.example.com" }
  ]
}
```

**Example Curl:**
```bash
curl -X POST http://localhost:3000/api/v1/audit \
  -H "Content-Type: application/json" \
  -H "x-api-key: mus_live_..." \
  -d '{"inputs": [{"type": "url", "url": "https://google.com"}]}'
```

**Response:**
```json
{
  "message": "Audit job submitted successfully",
  "jobId": "a1b2c3d4-...",
  "status": "pending",
  "statusUrl": "/api/v1/audit/a1b2c3d4-..."
}
```

### 3. Check Status (Polling)
You should poll this endpoint every 5-10 seconds until status is `completed`.

**Endpoint:** `GET https://your-server-url.com/api/v1/audit/{jobId}`
**Headers:** `x-api-key: YOUR_API_KEY`

**Response (In Progress):**
```json
{
  "jobId": "...",
  "status": "processing",
  "errorMessage": null
}
```

**Response (Completed):**
```json
{
  "jobId": "...",
  "status": "completed",
  "resultUrl": "https://your-client-app.com/report/123",
  "completedAt": "2024-01-01T12:00:00Z"
}
```

---

## 🛑 Limits & Errors

- **Rate Limit:** N/A (Admin controlled).
- **Batch Limit:** Max **5** inputs per request.
- **Timeouts:** The audit runs in the background, so your HTTP request won't timeout, but the job itself might fail if it takes >3 minutes.

### Error Codes
- `401 Unauthorized`: Missing or invalid API Key.
- `400 Bad Request`: Invalid input format or >5 items.
- `500 Internal Error`: Something went wrong on the server.

---

## 💻 Node.js Example Code

```javascript
const API_KEY = 'mus_live_...';
const BASE_URL = 'http://localhost:3000/api/v1';

async function runAudit(url) {
  // 1. Submit
  const submitRes = await fetch(`${BASE_URL}/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({ inputs: [{ url }] })
  });
  
  const { jobId } = await submitRes.json();
  console.log(`Job Started: ${jobId}`);

  // 2. Poll
  while (true) {
    await new Promise(r => setTimeout(r, 5000)); // Wait 5s
    const statusRes = await fetch(`${BASE_URL}/audit/${jobId}`, {
      headers: { 'x-api-key': API_KEY }
    });
    const job = await statusRes.json();
    
    console.log(`Status: ${job.status}`);
    
    if (job.status === 'completed') {
      console.log(`SUCCESS! Report: ${job.resultUrl}`);
      break;
    }
    if (job.status === 'failed') {
      console.error('Audit Failed:', job.errorMessage);
      break;
    }
  }
}

runAudit('https://apple.com');
```
