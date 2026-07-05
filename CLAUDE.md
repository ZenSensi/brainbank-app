# Brain Bank App - Project Context

## Project Overview
Brain Bank is an Expo (SDK 54) React Native app for BCA students to access notes (₹19), PYQs (₹29), and free YouTube playlists. The backend runs on Express, Firebase Admin, and Razorpay.

## Active Workspace Location
* All code is located at **`D:\Brainbank-app`**. Do not write code in the default C: drive workspace unless requested.

---

## Current State & Work Accomplished

### 1. Expanded Square Note Blocks & Semester Clean-up
* **Increased Grid Width** ([app/tabs/index.tsx](file:///D:/Brainbank-app/app/\(tabs\)/index.tsx)):
  * Expanded the width of `squareCard` elements to `"48.5%"` and tightened the horizontal padding margins of the parent `notesGrid` container to `16`. This utilizes more screen space, aligning with the diagram.
* **Semester Badge Removal**:
  * Removed all semester descriptions and tags (including the `semBadge` indicator) from Home screen listing cards to achieve a clean look.

### 2. User-Specific Recently Viewed History
* **Local Storage Service** ([src/services/recentService.ts](file:///D:/Brainbank-app/src/services/recentService.ts)):
  * Implemented client-side recently viewed tracking using `@react-native-async-storage/async-storage`.
* **Auto-Tracking on Detail Load** ([app/content/[id].tsx](file:///D:/Brainbank-app/app/content/[id].tsx)):
  * Automatically invokes `addRecentlyViewed(content)` when a note/PYQ is loaded in detail view.

### 3. Database-Wide Firestore Price Migrations
* **Migration Script** ([backend/src/updateDbPrices.ts](file:///D:/Brainbank-app/backend/src/updateDbPrices.ts)):
  * Wrote and ran a price migration script. Successfully scanned the Firestore `content` collection and batch-updated all database documents to set Notes to ₹19 and PYQs to ₹29.

### 4. Updated App-Wide Pricing Constants
* **New Prices** ([constants/index.ts](file:///D:/Brainbank-app/src/constants/index.ts)):
  * **Membership Price**: ₹149 (one-time lifetime payment).
  * **Note Price**: ₹19.
  * **PYQ Price**: ₹29.

---

## Seeding & Build Status
* **Seeding:** The database content is managed dynamically.
* **TypeScript Compilation:** The project compiles with zero typescript errors in both the frontend (`npx tsc --noEmit` succeeds) and backend.
* **Metro Server:** Running at http://localhost:8081.
