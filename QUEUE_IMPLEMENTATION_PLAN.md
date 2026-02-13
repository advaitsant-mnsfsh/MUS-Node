# Queue System Implementation Plan
## 2-Key Browserless + Priority Queue with Email Fallback

---

## Overview

**Goal**: Handle unlimited audit requests with only 2 free Browserless accounts, providing excellent UX through smart queuing and email delivery.

**Key Features**:
- 2 concurrent audits (1 per Browserless key)
- FIFO queue with priority system
- Email delivery option for users beyond position 4
- 45-minute timeout → forced priority processing
- User choice: wait in queue OR receive email

---

## Architecture

```
User Submits Audit
        ↓
   Queue Position?
        ↓
    ┌───┴────────────────┐
    ↓                    ↓
Position 1-4        Position 5+
(Real-time)      (Email Option)
    ↓                    ↓
    │              User Choice?
    │                    ↓
    │         ┌──────────┴──────────┐
    │         ↓                     ↓
    │    "Wait in Queue"      "Email Me"
    │         ↓                     ↓
    │    Priority Queue      Email Queue
    │         │                     │
    └─────────┼─────────────────────┘
              ↓
        Worker Pool
              ↓
         ┌────┴────┐
         ↓         ↓
      Key 1     Key 2
    (1 job)   (1 job)
```

---

## Database Schema

### 1. Update `audit_queue` Table

```sql
CREATE TABLE audit_queue (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES audit_jobs(id),
  status TEXT NOT NULL DEFAULT 'waiting', 
  -- 'waiting', 'processing', 'completed', 'failed', 'email_pending'
  
  queue_type TEXT NOT NULL DEFAULT 'realtime',
  -- 'realtime' = user wants to wait
  -- 'email' = user chose email delivery
  
  priority INTEGER DEFAULT 0,
  -- Higher = more urgent
  -- Realtime jobs: priority = 100
  -- Email jobs: priority = 50
  -- Email jobs after 45min: priority = 200 (HIGHEST)
  
  data JSONB NOT NULL,
  user_email TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  email_sent_at TIMESTAMP,
  
  browser_key INTEGER, -- 1 or 2
  error TEXT
);

CREATE INDEX idx_queue_priority ON audit_queue(status, priority DESC, created_at);
CREATE INDEX idx_queue_email_timeout ON audit_queue(queue_type, created_at) 
  WHERE status = 'waiting' AND queue_type = 'email';
```

### 2. Queue Event Logs Table (For Debugging)

```sql
CREATE TABLE queue_event_logs (
  id TEXT PRIMARY KEY,
  queue_id TEXT REFERENCES audit_queue(id),
  job_id TEXT REFERENCES audit_jobs(id),
  user_id TEXT, -- From auth system
  
  event_type TEXT NOT NULL,
  -- 'job_created', 'queue_added', 'priority_changed', 'key_assigned', 
  -- 'processing_started', 'processing_completed', 'processing_failed',
  -- 'email_sent', 'timeout_boosted', 'user_choice_updated'
  
  event_data JSONB,
  -- Stores context-specific data:
  -- { 
  --   queue_position: 5, 
  --   browser_key: 1, 
  --   priority: 100,
  --   wait_time_seconds: 120,
  --   error_message: "...",
  --   previous_priority: 50,
  --   new_priority: 200
  -- }
  
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_event_logs_job ON queue_event_logs(job_id, timestamp);
CREATE INDEX idx_event_logs_queue ON queue_event_logs(queue_id, timestamp);
CREATE INDEX idx_event_logs_type ON queue_event_logs(event_type, timestamp);
CREATE INDEX idx_event_logs_user ON queue_event_logs(user_id, timestamp);
```

### 3. Browser Key Usage Logs (For Testing & Debugging)

```sql
CREATE TABLE browser_key_logs (
  id TEXT PRIMARY KEY,
  browser_key INTEGER NOT NULL, -- 1 or 2
  job_id TEXT REFERENCES audit_jobs(id),
  queue_id TEXT REFERENCES audit_queue(id),
  
  action TEXT NOT NULL,
  -- 'acquired', 'released', 'failed', 'timeout'
  
  acquired_at TIMESTAMP,
  released_at TIMESTAMP,
  duration_seconds INTEGER, -- Calculated on release
  
  error TEXT,
  metadata JSONB
  -- {
  --   endpoint: "wss://chrome.browserless.io...",
  --   page_url: "https://example.com",
  --   screenshot_count: 2,
  --   memory_usage_mb: 150
  -- }
);

CREATE INDEX idx_browser_key_logs_key ON browser_key_logs(browser_key, acquired_at);
CREATE INDEX idx_browser_key_logs_job ON browser_key_logs(job_id);
```

---

## Logging & Debugging Strategy

### **Phase 0: Comprehensive Logging System** (Before Phase 1)

#### 0.1 Event Logger Service
**File**: `server/src/services/eventLogger.ts`

```typescript
import { db } from '../lib/db.js';
import { queueEventLogs, browserKeyLogs } from '../db/schema.js';

export class EventLogger {
  /**
   * Log queue events for debugging and analytics
   */
  static async logQueueEvent(
    eventType: string,
    jobId: string,
    queueId: string,
    userId: string | null,
    eventData: any
  ) {
    try {
      await db.insert(queueEventLogs).values({
        id: generateId(),
        queue_id: queueId,
        job_id: jobId,
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date()
      });
      
      console.log(`[EventLog] ${eventType} | Job: ${jobId} | Data:`, eventData);
    } catch (error) {
      console.error('[EventLog] Failed to log event:', error);
    }
  }

  /**
   * Log browser key acquisition/release
   */
  static async logBrowserKeyAction(
    browserKey: number,
    action: 'acquired' | 'released' | 'failed',
    jobId: string,
    queueId: string,
    metadata?: any
  ) {
    try {
      const logId = generateId();
      
      if (action === 'acquired') {
        await db.insert(browserKeyLogs).values({
          id: logId,
          browser_key: browserKey,
          job_id: jobId,
          queue_id: queueId,
          action: action,
          acquired_at: new Date(),
          metadata: metadata
        });
        
        console.log(`[BrowserKey] Key ${browserKey} ACQUIRED by Job ${jobId}`);
      } else if (action === 'released') {
        // Find the acquisition log
        const [acquisitionLog] = await db.select()
          .from(browserKeyLogs)
          .where(and(
            eq(browserKeyLogs.job_id, jobId),
            eq(browserKeyLogs.action, 'acquired')
          ))
          .orderBy(desc(browserKeyLogs.acquired_at))
          .limit(1);
        
        if (acquisitionLog) {
          const duration = Math.floor(
            (Date.now() - new Date(acquisitionLog.acquired_at).getTime()) / 1000
          );
          
          await db.update(browserKeyLogs)
            .set({
              released_at: new Date(),
              duration_seconds: duration,
              metadata: { ...acquisitionLog.metadata, ...metadata }
            })
            .where(eq(browserKeyLogs.id, acquisitionLog.id));
          
          console.log(`[BrowserKey] Key ${browserKey} RELEASED by Job ${jobId} (Duration: ${duration}s)`);
        }
      }
    } catch (error) {
      console.error('[BrowserKey] Failed to log action:', error);
    }
  }

  /**
   * Get detailed job timeline for debugging
   */
  static async getJobTimeline(jobId: string) {
    const events = await db.select()
      .from(queueEventLogs)
      .where(eq(queueEventLogs.job_id, jobId))
      .orderBy(queueEventLogs.timestamp);
    
    return events;
  }

  /**
   * Get browser key usage statistics
   */
  static async getBrowserKeyStats(browserKey: number, hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const logs = await db.select()
      .from(browserKeyLogs)
      .where(and(
        eq(browserKeyLogs.browser_key, browserKey),
        sql`${browserKeyLogs.acquired_at} > ${since}`
      ));
    
    const totalJobs = logs.length;
    const avgDuration = logs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / totalJobs;
    const failures = logs.filter(log => log.error).length;
    
    return {
      browserKey,
      totalJobs,
      avgDurationSeconds: Math.round(avgDuration),
      failures,
      successRate: ((totalJobs - failures) / totalJobs * 100).toFixed(2) + '%'
    };
  }
}
```

#### 0.2 Update Queue Service with Logging
**File**: `server/src/services/queueService.ts`

```typescript
export class QueueService {
  static async addJob(jobId: string, inputs: any, auditMode: string, email?: string, userId?: string) {
    const position = await this.getWaitingCount() + 1;
    const queueType = position <= 4 ? 'realtime' : 'email';
    const priority = queueType === 'realtime' ? 100 : 50;
    
    const queueId = generateId();
    
    await db.insert(auditQueue).values({
      id: queueId,
      job_id: jobId,
      status: 'waiting',
      queue_type: queueType,
      priority: priority,
      user_email: email,
      data: { inputs, auditMode }
    });
    
    // LOG: Job added to queue
    await EventLogger.logQueueEvent(
      'queue_added',
      jobId,
      queueId,
      userId,
      {
        queue_position: position,
        queue_type: queueType,
        priority: priority,
        email_provided: !!email
      }
    );
    
    return { position, queueType, queueId };
  }

  private static async processJob(queueJob: any, keyInfo: any) {
    const startTime = Date.now();
    
    try {
      // LOG: Key assigned
      await EventLogger.logBrowserKeyAction(
        keyInfo.keyId,
        'acquired',
        queueJob.job_id,
        queueJob.id,
        { endpoint: keyInfo.endpoint }
      );
      
      // LOG: Processing started
      await EventLogger.logQueueEvent(
        'processing_started',
        queueJob.job_id,
        queueJob.id,
        null,
        {
          browser_key: keyInfo.keyId,
          wait_time_seconds: Math.floor((Date.now() - new Date(queueJob.created_at).getTime()) / 1000)
        }
      );
      
      // Process the job
      await JobProcessor.processJob(/*...*/);
      
      const processingTime = Math.floor((Date.now() - startTime) / 1000);
      
      // LOG: Processing completed
      await EventLogger.logQueueEvent(
        'processing_completed',
        queueJob.job_id,
        queueJob.id,
        null,
        {
          browser_key: keyInfo.keyId,
          processing_time_seconds: processingTime
        }
      );
      
      // Send email if needed
      if (queueJob.queue_type === 'email' && queueJob.user_email) {
        await EmailService.sendAuditComplete(/*...*/);
        
        // LOG: Email sent
        await EventLogger.logQueueEvent(
          'email_sent',
          queueJob.job_id,
          queueJob.id,
          null,
          { email: queueJob.user_email }
        );
      }
      
    } catch (error: any) {
      // LOG: Processing failed
      await EventLogger.logQueueEvent(
        'processing_failed',
        queueJob.job_id,
        queueJob.id,
        null,
        {
          browser_key: keyInfo.keyId,
          error_message: error.message,
          error_stack: error.stack
        }
      );
      
      throw error;
      
    } finally {
      // LOG: Key released
      await EventLogger.logBrowserKeyAction(
        keyInfo.keyId,
        'released',
        queueJob.job_id,
        queueJob.id
      );
      
      BrowserPoolService.releaseKey(keyInfo.keyId);
    }
  }
}
```

---

## Testing & Debugging Tables

### Debug View: Real-time Queue Status

**Endpoint**: `GET /admin/queue-debug`

```typescript
router.get('/admin/queue-debug', async (req, res) => {
  // Get all waiting jobs with full details
  const waitingJobs = await db.select({
    queueId: auditQueue.id,
    jobId: auditQueue.job_id,
    userId: auditJobs.user_id,
    status: auditQueue.status,
    queueType: auditQueue.queue_type,
    priority: auditQueue.priority,
    position: sql`ROW_NUMBER() OVER (ORDER BY ${auditQueue.priority} DESC, ${auditQueue.created_at})`,
    browserKey: auditQueue.browser_key,
    createdAt: auditQueue.created_at,
    waitTimeSeconds: sql`EXTRACT(EPOCH FROM (NOW() - ${auditQueue.created_at}))`,
    userEmail: auditQueue.user_email
  })
  .from(auditQueue)
  .leftJoin(auditJobs, eq(auditQueue.job_id, auditJobs.id))
  .where(eq(auditQueue.status, 'waiting'))
  .orderBy(desc(auditQueue.priority), auditQueue.created_at);
  
  // Get currently processing jobs
  const processingJobs = await db.select({
    queueId: auditQueue.id,
    jobId: auditQueue.job_id,
    userId: auditJobs.user_id,
    browserKey: auditQueue.browser_key,
    startedAt: auditQueue.started_at,
    processingTimeSeconds: sql`EXTRACT(EPOCH FROM (NOW() - ${auditQueue.started_at}))`
  })
  .from(auditQueue)
  .leftJoin(auditJobs, eq(auditQueue.job_id, auditJobs.id))
  .where(eq(auditQueue.status, 'processing'));
  
  // Get browser key status
  const key1Status = BrowserPoolService.isKeyBusy(1);
  const key2Status = BrowserPoolService.isKeyBusy(2);
  
  res.json({
    timestamp: new Date().toISOString(),
    browserKeys: {
      key1: { busy: key1Status, currentJob: processingJobs.find(j => j.browserKey === 1) },
      key2: { busy: key2Status, currentJob: processingJobs.find(j => j.browserKey === 2) }
    },
    queue: {
      waiting: waitingJobs,
      processing: processingJobs,
      totalWaiting: waitingJobs.length
    }
  });
});
```

### Sample Debug Output:

```json
{
  "timestamp": "2026-02-11T16:30:00Z",
  "browserKeys": {
    "key1": {
      "busy": true,
      "currentJob": {
        "queueId": "q_abc123",
        "jobId": "job_xyz789",
        "userId": "user_456",
        "browserKey": 1,
        "startedAt": "2026-02-11T16:28:30Z",
        "processingTimeSeconds": 90
      }
    },
    "key2": {
      "busy": false,
      "currentJob": null
    }
  },
  "queue": {
    "waiting": [
      {
        "queueId": "q_def456",
        "jobId": "job_abc123",
        "userId": "user_789",
        "status": "waiting",
        "queueType": "realtime",
        "priority": 100,
        "position": 1,
        "browserKey": null,
        "createdAt": "2026-02-11T16:29:00Z",
        "waitTimeSeconds": 60,
        "userEmail": null
      },
      {
        "queueId": "q_ghi789",
        "jobId": "job_def456",
        "userId": null,
        "status": "waiting",
        "queueType": "email",
        "priority": 200,
        "position": 2,
        "browserKey": null,
        "createdAt": "2026-02-11T15:45:00Z",
        "waitTimeSeconds": 2700,
        "userEmail": "user@example.com"
      }
    ],
    "processing": [
      {
        "queueId": "q_abc123",
        "jobId": "job_xyz789",
        "userId": "user_456",
        "browserKey": 1,
        "startedAt": "2026-02-11T16:28:30Z",
        "processingTimeSeconds": 90
      }
    ],
    "totalWaiting": 2
  }
}
```

---

## Testing Checklist with Expected Logs

### Test 1: Basic FIFO Queue
**Steps**:
1. Submit 5 audits simultaneously
2. Check queue positions
3. Verify processing order

**Expected Logs**:
```
[EventLog] queue_added | Job: job_1 | Data: { queue_position: 1, priority: 100 }
[EventLog] queue_added | Job: job_2 | Data: { queue_position: 2, priority: 100 }
[EventLog] queue_added | Job: job_3 | Data: { queue_position: 3, priority: 100 }
[EventLog] queue_added | Job: job_4 | Data: { queue_position: 4, priority: 100 }
[EventLog] queue_added | Job: job_5 | Data: { queue_position: 5, priority: 50 }

[BrowserKey] Key 1 ACQUIRED by Job job_1
[BrowserKey] Key 2 ACQUIRED by Job job_2
[EventLog] processing_started | Job: job_1 | Data: { browser_key: 1, wait_time_seconds: 2 }
[EventLog] processing_started | Job: job_2 | Data: { browser_key: 2, wait_time_seconds: 2 }

[BrowserKey] Key 1 RELEASED by Job job_1 (Duration: 60s)
[BrowserKey] Key 2 ACQUIRED by Job job_3
[EventLog] processing_started | Job: job_3 | Data: { browser_key: 2, wait_time_seconds: 65 }
```

### Test 2: Priority System
**Steps**:
1. Submit job at position 5 (email queue)
2. User chooses "wait"
3. Verify priority boost to 100

**Expected Logs**:
```
[EventLog] queue_added | Job: job_6 | Data: { queue_position: 5, priority: 50, queue_type: 'email' }
[EventLog] user_choice_updated | Job: job_6 | Data: { previous_priority: 50, new_priority: 100, choice: 'wait' }
```

### Test 3: 45-Minute Timeout
**Steps**:
1. Submit email job
2. Wait 45 minutes (or simulate)
3. Verify priority boost to 200

**Expected Logs**:
```
[EventLog] queue_added | Job: job_7 | Data: { queue_position: 8, priority: 50, queue_type: 'email' }
[TimeoutMonitor] Job job_7 boosted to priority 200 after 45min wait
[EventLog] timeout_boosted | Job: job_7 | Data: { previous_priority: 50, new_priority: 200, wait_time_seconds: 2700 }
```

### Test 4: Browser Key Assignment
**Steps**:
1. Submit 3 audits
2. Verify keys 1 and 2 are used
3. Verify 3rd job waits for free key

**Expected Logs**:
```
[BrowserKey] Key 1 ACQUIRED by Job job_8
[BrowserKey] Key 2 ACQUIRED by Job job_9
[Queue] Job job_10 waiting for available key...
[BrowserKey] Key 1 RELEASED by Job job_8 (Duration: 55s)
[BrowserKey] Key 1 ACQUIRED by Job job_10
```

---

## Admin Dashboard Queries

### Query 1: Jobs by User
```sql
SELECT 
  u.email,
  COUNT(aq.id) as total_jobs,
  SUM(CASE WHEN aq.status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN aq.status = 'failed' THEN 1 ELSE 0 END) as failed,
  AVG(EXTRACT(EPOCH FROM (aq.completed_at - aq.created_at))) as avg_time_seconds
FROM audit_queue aq
JOIN audit_jobs aj ON aq.job_id = aj.id
JOIN users u ON aj.user_id = u.id
GROUP BY u.email
ORDER BY total_jobs DESC;
```

### Query 2: Browser Key Utilization
```sql
SELECT 
  browser_key,
  COUNT(*) as total_uses,
  AVG(duration_seconds) as avg_duration,
  MAX(duration_seconds) as max_duration,
  SUM(CASE WHEN error IS NOT NULL THEN 1 ELSE 0 END) as errors
FROM browser_key_logs
WHERE acquired_at > NOW() - INTERVAL '24 hours'
GROUP BY browser_key;
```

### Query 3: Queue Performance
```sql
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as jobs_submitted,
  AVG(EXTRACT(EPOCH FROM (started_at - created_at))) as avg_wait_seconds,
  MAX(EXTRACT(EPOCH FROM (started_at - created_at))) as max_wait_seconds
FROM audit_queue
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```


---

## Implementation Phases

### **Phase 1: Basic Queue System** (Week 1)

#### 1.1 Browser Pool Service
**File**: `server/src/services/browserPoolService.ts`

```typescript
export class BrowserPoolService {
  private static endpoints = [
    process.env.BROWSERLESS_ENDPOINT_1,
    process.env.BROWSERLESS_ENDPOINT_2,
  ];

  private static keyStatus = new Map<number, boolean>([
    [0, false], // Key 1 free
    [1, false], // Key 2 free
  ]);

  static async acquireKey(): Promise<{ endpoint: string; keyId: number } | null> {
    for (let i = 0; i < this.endpoints.length; i++) {
      if (!this.keyStatus.get(i)) {
        this.keyStatus.set(i, true);
        return { endpoint: this.endpoints[i], keyId: i + 1 };
      }
    }
    return null; // Both keys busy
  }

  static releaseKey(keyId: number) {
    this.keyStatus.set(keyId - 1, false);
  }

  static getAvailableKeys(): number {
    return Array.from(this.keyStatus.values()).filter(busy => !busy).length;
  }
}
```

#### 1.2 Queue Service (Basic FIFO)
**File**: `server/src/services/queueService.ts`

```typescript
export class QueueService {
  static async addJob(jobId: string, inputs: any, auditMode: string, email?: string) {
    const position = await this.getWaitingCount() + 1;
    
    // Determine queue type based on position
    const queueType = position <= 4 ? 'realtime' : 'email';
    const priority = queueType === 'realtime' ? 100 : 50;
    
    await db.insert(auditQueue).values({
      id: generateId(),
      job_id: jobId,
      status: 'waiting',
      queue_type: queueType,
      priority: priority,
      user_email: email,
      data: { inputs, auditMode }
    });
    
    return { position, queueType };
  }

  static async getWaitingCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` })
      .from(auditQueue)
      .where(eq(auditQueue.status, 'waiting'));
    return Number(result[0].count);
  }

  static async getQueuePosition(jobId: string): Promise<number> {
    const queue = await db.select()
      .from(auditQueue)
      .where(eq(auditQueue.status, 'waiting'))
      .orderBy(desc(auditQueue.priority), auditQueue.created_at);
    
    return queue.findIndex(job => job.job_id === jobId) + 1;
  }
}
```

#### 1.3 Update API Route
**File**: `server/src/api/routes.ts`

```typescript
router.post('/audit', async (req, res) => {
  const jobId = generateId();
  const { inputs, auditMode, email } = req.body;
  
  // Create job record
  await db.insert(auditJobs).values({
    id: jobId,
    status: 'queued',
    input_data: { inputs }
  });
  
  // Add to queue
  const { position, queueType } = await QueueService.addJob(
    jobId, inputs, auditMode, email
  );
  
  res.json({
    jobId,
    status: 'queued',
    queuePosition: position,
    queueType: queueType,
    message: position <= 4 
      ? `You're in position ${position}. Your audit will start soon!`
      : `You're in position ${position}. You can wait or receive results via email.`
  });
});
```

---

### **Phase 2: User Choice System** (Week 1-2)

#### 2.1 Frontend: Queue Position Modal
**File**: `client/components/QueueChoiceModal.tsx`

```typescript
interface QueueChoiceModalProps {
  position: number;
  jobId: string;
  onChoice: (choice: 'wait' | 'email') => void;
}

export const QueueChoiceModal: React.FC<QueueChoiceModalProps> = ({ 
  position, jobId, onChoice 
}) => {
  const [email, setEmail] = useState('');
  
  if (position <= 4) {
    return (
      <div className="modal">
        <h2>You're in Queue Position {position}</h2>
        <p>Your audit will start in approximately {position * 2} minutes.</p>
        <button onClick={() => onChoice('wait')}>
          Continue Waiting
        </button>
      </div>
    );
  }
  
  return (
    <div className="modal">
      <h2>Queue Position: {position}</h2>
      <p>There are {position - 1} people ahead of you.</p>
      
      <div className="choice-options">
        <div className="option">
          <h3>⏱️ Wait in Queue</h3>
          <p>Estimated wait: {position * 2} minutes</p>
          <button onClick={() => onChoice('wait')}>
            I'll Wait
          </button>
        </div>
        
        <div className="option">
          <h3>📧 Email Me Results</h3>
          <p>Get your report within 1 hour</p>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
          <button onClick={() => onChoice('email')}>
            Email Me
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### 2.2 API: Update Queue Choice
**File**: `server/src/api/routes.ts`

```typescript
router.patch('/queue/:jobId/choice', async (req, res) => {
  const { jobId } = req.params;
  const { choice, email } = req.body; // 'wait' or 'email'
  
  const queueType = choice === 'wait' ? 'realtime' : 'email';
  const priority = choice === 'wait' ? 100 : 50;
  
  await db.update(auditQueue)
    .set({ 
      queue_type: queueType,
      priority: priority,
      user_email: email 
    })
    .where(eq(auditQueue.job_id, jobId));
  
  res.json({ success: true, queueType });
});
```

---

### **Phase 3: Priority System** (Week 2)

#### 3.1 Timeout Monitor Service
**File**: `server/src/services/timeoutMonitor.ts`

```typescript
export class TimeoutMonitor {
  private static TIMEOUT_MINUTES = 45;
  
  static async start() {
    setInterval(() => this.checkTimeouts(), 60000); // Check every minute
  }
  
  private static async checkTimeouts() {
    const timeoutThreshold = new Date(
      Date.now() - this.TIMEOUT_MINUTES * 60 * 1000
    );
    
    // Find email jobs that have been waiting > 45 minutes
    const timedOutJobs = await db.select()
      .from(auditQueue)
      .where(
        and(
          eq(auditQueue.status, 'waiting'),
          eq(auditQueue.queue_type, 'email'),
          sql`${auditQueue.created_at} < ${timeoutThreshold}`
        )
      );
    
    for (const job of timedOutJobs) {
      // Boost priority to HIGHEST (200)
      await db.update(auditQueue)
        .set({ priority: 200 })
        .where(eq(auditQueue.id, job.id));
      
      console.log(`[TimeoutMonitor] Job ${job.job_id} boosted to priority 200 after 45min wait`);
    }
  }
}
```

#### 3.2 Update Queue Worker
**File**: `server/src/services/queueService.ts`

```typescript
private static async startWorker() {
  this.isRunning = true;
  
  // Start timeout monitor
  TimeoutMonitor.start();
  
  while (true) {
    const keyInfo = await BrowserPoolService.acquireKey();
    
    if (keyInfo) {
      // Get next job by PRIORITY (highest first), then FIFO
      const [nextJob] = await db.select()
        .from(auditQueue)
        .where(eq(auditQueue.status, 'waiting'))
        .orderBy(
          desc(auditQueue.priority),  // Priority first
          auditQueue.created_at       // Then FIFO
        )
        .limit(1);
      
      if (nextJob) {
        await this.processJob(nextJob, keyInfo);
      } else {
        BrowserPoolService.releaseKey(keyInfo.keyId);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
```

---

### **Phase 4: Email Service** (Week 2-3)

#### 4.1 Email Service
**File**: `server/src/services/emailService.ts`

```typescript
import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  static async sendAuditComplete(email: string, jobId: string, reportUrl: string) {
    const mailOptions = {
      from: 'noreply@yourapp.com',
      to: email,
      subject: '✅ Your Website Audit is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Your Audit is Complete!</h2>
          <p>Thank you for your patience. Your website audit has been completed.</p>
          <div style="margin: 30px 0;">
            <a href="${reportUrl}" 
               style="background: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Report
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will be available for 30 days.
          </p>
        </div>
      `
    };
    
    await this.transporter.sendMail(mailOptions);
    console.log(`[Email] Sent audit complete email to ${email}`);
  }
}
```

#### 4.2 Update Queue Worker to Send Emails
**File**: `server/src/services/queueService.ts`

```typescript
private static async processJob(queueJob: any, keyInfo: any) {
  try {
    await JobProcessor.processJob(/*...*/);
    
    await db.update(auditQueue)
      .set({ status: 'completed', completed_at: new Date() })
      .where(eq(auditQueue.id, queueJob.id));
    
    // Send email if user chose email delivery
    if (queueJob.queue_type === 'email' && queueJob.user_email) {
      const reportUrl = `${process.env.FRONTEND_URL}/report/${queueJob.job_id}`;
      await EmailService.sendAuditComplete(
        queueJob.user_email,
        queueJob.job_id,
        reportUrl
      );
      
      await db.update(auditQueue)
        .set({ email_sent_at: new Date() })
        .where(eq(auditQueue.id, queueJob.id));
    }
    
  } catch (error) {
    // Error handling
  } finally {
    BrowserPoolService.releaseKey(keyInfo.keyId);
  }
}
```

---

## Priority System Summary

### Queue Priority Levels:

| Priority | Queue Type | Condition | Description |
|----------|------------|-----------|-------------|
| **200** | Email | Waited 45+ min | HIGHEST - Forced processing |
| **100** | Realtime | Position 1-4 OR user chose "wait" | High priority |
| **50** | Email | Position 5+ | Normal email delivery |

### Processing Order:
1. Email jobs that waited 45+ minutes (priority 200)
2. Realtime jobs (priority 100)
3. Email jobs (priority 50)
4. Within same priority: FIFO (first come, first served)

---

## Environment Variables

```env
# Browserless Keys
BROWSERLESS_ENDPOINT_1=wss://chrome.browserless.io?token=TOKEN_1
BROWSERLESS_ENDPOINT_2=wss://chrome.browserless.io?token=TOKEN_2

# Email Service
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=https://yourapp.com

# Queue Settings
EMAIL_TIMEOUT_MINUTES=45
MAX_CONCURRENT_AUDITS=2
```

---

## User Experience Flow

### Scenario 1: Position 1-4 (Realtime)
```
User submits → Position 3 → "Starting soon!" → Waits 6 min → Report ready
```

### Scenario 2: Position 5+ (User chooses to wait)
```
User submits → Position 7 → "Wait or Email?" → Chooses "Wait" 
→ Priority 100 → Moves ahead of email jobs → Waits ~14 min → Report ready
```

### Scenario 3: Position 5+ (User chooses email)
```
User submits → Position 7 → "Wait or Email?" → Chooses "Email" 
→ Priority 50 → Closes tab → Gets email in 30 min → Opens report
```

### Scenario 4: Email job timeout (45 min)
```
User chose email → 45 min passes → Priority boosted to 200 
→ Next available slot → Processed immediately → Email sent
```

---

## Monitoring Dashboard

### Admin Endpoint
**File**: `server/src/api/routes.ts`

```typescript
router.get('/admin/queue-stats', async (req, res) => {
  const stats = {
    keys: {
      available: BrowserPoolService.getAvailableKeys(),
      total: 2
    },
    queue: {
      waiting: await db.select({ count: sql`count(*)` })
        .from(auditQueue)
        .where(eq(auditQueue.status, 'waiting')),
      processing: await db.select({ count: sql`count(*)` })
        .from(auditQueue)
        .where(eq(auditQueue.status, 'processing')),
      realtime: await db.select({ count: sql`count(*)` })
        .from(auditQueue)
        .where(and(
          eq(auditQueue.status, 'waiting'),
          eq(auditQueue.queue_type, 'realtime')
        )),
      email: await db.select({ count: sql`count(*)` })
        .from(auditQueue)
        .where(and(
          eq(auditQueue.status, 'waiting'),
          eq(auditQueue.queue_type, 'email')
        )),
    }
  };
  res.json(stats);
});
```

---

## Testing Plan

### Test Cases:

1. **Basic Queue**: Submit 5 audits, verify FIFO processing
2. **User Choice**: Submit audit at position 5, test both "wait" and "email" choices
3. **Priority Boost**: Submit email job, wait 45 min, verify priority increase
4. **Email Delivery**: Complete email job, verify email sent
5. **Concurrent Processing**: Submit 10 audits, verify only 2 run simultaneously
6. **Key Assignment**: Verify jobs distributed across both keys
7. **Error Handling**: Simulate job failure, verify key released

---

## Deployment Checklist

- [ ] Add Browserless endpoints to Railway secrets
- [ ] Set up Gmail app password for email service
- [ ] Run database migration for `audit_queue` table
- [ ] Deploy queue worker service
- [ ] Test with 2-3 concurrent audits
- [ ] Monitor memory usage on Railway
- [ ] Set up error alerts
- [ ] Create admin dashboard for queue monitoring

---

## Cost Analysis

### Current Setup:
- Railway: $5/month (Hobby plan)
- Browserless: $0/month (2 free accounts)
- Email: $0/month (Gmail)
- **Total: $5/month**

### Capacity:
- **Concurrent**: 2 audits
- **Daily**: ~10-15 audits
- **Monthly**: ~200-300 audits
- **Queue**: Unlimited

---

## Future Enhancements

1. **SMS Notifications**: Send SMS when audit starts (Twilio)
2. **Webhook Support**: POST results to user's endpoint
3. **Scheduled Audits**: Run audits at specific times
4. **Batch Processing**: Submit multiple URLs at once
5. **Priority Tiers**: Paid users get higher priority
6. **Auto-scaling**: Add more Browserless keys dynamically

---

## Success Metrics

- Queue wait time < 5 minutes for realtime users
- Email delivery < 1 hour (target: 30 min)
- 45-min timeout jobs processed within 5 min
- 99% email delivery success rate
- 0 key conflicts or deadlocks
- <2% job failure rate

---

**Implementation Timeline: 2-3 weeks**
**Maintenance: Minimal (monitor queue, rotate Browserless keys if needed)**
