# Audit Queueing & Email Opt-in Implementation Plan

## Objective
Enhance the audit queueing system to provide a better user experience when the system is busy (more than 5 jobs in queue).

## Requirements
1. **Queue Position Awareness**: Display "Position in line" (including active analysis).
2. **Email Opt-in**: For positions > 5, offer "Email me results instead".
3. **Auth Bridge**: Require login/signup for opt-in if not authenticated.
4. **Reliable Processing**: Ensure jobs are prioritized correctly and emails sent on completion.

## Tasks

### Phase 1: Backend (Queue & API)
- [ ] **Extend `QueueService`**: Add `getTotalQueueDepth` which sums `waiting` + `processing`.
- [ ] **Update `/api/v1/audit` Response**:
    - Include `queuePosition` (Total Depth).
    - Logic: `canOptForEmail = queuePosition > 5`.
- [ ] **Email Opt-in Endpoint**: `POST /api/v1/audit/opt-in`.
    - Map `jobId` to user email.
- [ ] **Worker Notification**: Trigger `resend` email when job status moves to `completed`.

### Phase 2: Frontend (UI/UX)
- [ ] **Loading Screen Update**:
    - Show real-time queue position.
    - Conditionally render "Receive results via Email" button.
- [ ] **Opt-in Flow**:
    - If user clicks "Email me":
        - If Auth: Show success message.
        - If No-Auth: Open login modal -> return to success message.

### Phase 3: Reporting & Monitoring
- [ ] **Live Admin Dashboard**: Create `/admin/monitor` (Console Log style updates).
- [ ] **Audit Detail Sync**: Ensure background audits appear in user profile immediately.
