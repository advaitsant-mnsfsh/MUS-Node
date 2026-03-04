# Implementation Plan: Subdomain-based Beta Access

This plan outlines the steps to implement an access code protection layer for the beta launch on a specific subdomain (`beta.abcd.com`).

## 1. Environment Configuration
- **Server `.env`**: Add a secret for the beta access.
  ```env
  BETA_ACCESS_CODE=your-secret-code-here
  ```

## 2. Subdomain Detection Logic
### A. Frontend Detection
Instead of using path prefixes, we will detect the environment based on the current hostname.
```typescript
// client/lib/env.ts (or similar utility)
export const isBetaSubdomain = () => {
    return window.location.hostname.startsWith('beta.');
};
```

### B. React Router Configuration
We will **NOT** use `basename="/beta"` anymore. The app will run at the root of the `beta.abcd.com` domain.

## 3. The "Beta Gate" System
### A. User Flow for Subdomain Beta
1. **Entry Point**: A button on the WordPress site (`www.abcd.com`) redirects to `https://beta.abcd.com`.
2. **Detection**: Upon landing, the app checks if `isBetaSubdomain()` is true.
3. **The Gate**: If on the beta subdomain and the `beta_authorized` cookie is missing, the `BetaAuthGate` intercepts the user.
4. **Authorization**: User enters the beta code.
5. **Access Granted**: Upon success, a `beta_authorized` cookie is set, and the user can access the full tool.

### B. Backend Verification Endpoint
Create a new route in the server to verify the access code and set a persistent cookie.
- **Path**: `POST /api/verify-beta`
- **Logic**: 
  1. Compare `req.body.code` with `process.env.BETA_ACCESS_CODE`.
  2. If match, set a cookie `beta_authorized=true` with:
     - `maxAge: 30 days`
     - `SameSite: Lax`
     - `Path: /` (since it's a subdomain root)
     - `Domain: .abcd.com` (to ensure it works across subdomains if needed)
  3. Return success.

### C. Beta Guard Component (Frontend)
Create a `BetaGuard` component that wraps all routes in `AppRouter.tsx`.
- **Logic**: 
  ```tsx
  if (isBetaSubdomain() && !hasBetaCookie()) {
      return <BetaAccessPage />;
  }
  return <>{children}</>;
  ```

### D. Beta Access Page (The Gate UI)
A high-end, premium landing page designed to "WOW" the user:
- **Visuals**: Dark glassmorphism, glowing borders, and MUS Node branding.
- **Form**: A single, sleek input field for the access code.

## 4. Security Enforcement
- **Frontend**: The `BetaGuard` ensures no UI is visible on `beta.abcd.com` without the code.
- **Backend API**: 
  - The server middleware will check the `Referer` or `Origin` header.
  - If the request comes from `beta.abcd.com`, it will enforce the `beta_authorized` cookie check for all protected API routes.

## 5. Implementation Workflow
1.  **Phase 1**: Implement the `isBetaSubdomain` utility and detection logic.
2.  **Phase 2**: Build the `BetaAccessPage` with premium aesthetics. 
3.  **Phase 3**: Create the `/api/verify-beta` endpoint and cookie management.
4.  **Phase 4**: Wrap the Router with `BetaGuard`.
5.  **Phase 5**: Update Server middleware to conditionalize auth based on the request origin/subdomain.
6.  **Phase 7**: Local testing (mocking `beta.localhost` for verification).
