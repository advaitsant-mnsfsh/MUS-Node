# UI Migration Execution Plan

## Strategy: Copy Everything EXCEPT Dashboard & API Keys

### Files to PRESERVE (Don't overwrite):
1. `pages/DashboardPage.tsx`
2. `pages/APIKeysPage.tsx`  
3. `pages/AboutPage.tsx`
4. `pages/PricingPage.tsx`
5. `services/userAuditsService.ts`
6. `components/GlobalNavbar.tsx` (has our auth logic)
7. `components/AuthBlocker.tsx` (our custom auth modal)
8. `components/UserBadge.tsx` (our user dropdown)
9. `components/Layout.tsx` (our layout with navbar)

### Files to COPY from updated folder:
1. `App.tsx` - New architecture with views
2. `hooks/useAudit.ts` - Centralized audit logic
3. `components/LoginPanel.tsx` - New login UI
4. `components/ScanningPreview.tsx` - ✅ Already copied
5. `components/SplitLayout.tsx` - ✅ Already copied
6. `components/URLInputForm.tsx` - ✅ Already copied
7. `components/LandingHero.tsx` - ✅ Already copied
8. `components/views/*` - ✅ Already copied
9. `components/inputs/*` - ✅ Already copied
10. `components/report/*` - All report display components
11. `components/ui/*` - UI utility components
12. `types.ts` - Type definitions
13. `index.css` - Styles

### Execution Order:
1. Copy `hooks/useAudit.ts`
2. Copy `components/LoginPanel.tsx`
3. Copy `components/ui/*` folder
4. Copy `components/report/*` folder
5. Copy `types.ts` (merge with existing)
6. Copy `App.tsx` (update to use our preserved pages)
7. Test and verify

Let's begin!
