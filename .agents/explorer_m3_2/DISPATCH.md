## 2026-08-15T00:09:43Z
You are explorer_m3_2 for Milestone 3 (UI Components & Fallback Experience).
Read:
- e:\doctor-appointment-saas-platform\.agents\ORIGINAL_REQUEST.md
- e:\doctor-appointment-saas-platform\PROJECT.md
- e:\doctor-appointment-saas-platform\.agents\orchestrator_1\handoff.md
- src/components/install-app-section.tsx
- src/components/install-app-banner.tsx
- src/components/pwa-provider.tsx
- src/hooks/use-pwa-install.ts

Your Mission:
1. Deeply investigate UI component fallback behaviors:
   - `src/components/install-app-section.tsx`: Identify exactly why and where the misleading toast "Please open this page in Chrome (Android) or Safari (iOS)..." was shown. Design the precise UI updates: when on Android Chrome without deferredPrompt, show toast "Tap Chrome menu (⋮) -> 'Install app' or 'Add to Home screen' 📱". When on iOS, show iOS step-by-step guidance. When on Desktop Chrome, show address bar install guidance.
   - `src/components/install-app-banner.tsx`: Identify all render branches. Currently does `android_manual` render anything? Design full banner support for Android manual install guidance, iOS guidance, and native prompt button.
   - `src/components/pwa-provider.tsx`: Audit `PatientInstallButton` and `InstallPWAButton`. Ensure patient install button is always helpful and never misleading on Android/iOS/Desktop.
2. Write your complete analysis and recommended component blueprints to:
   e:\doctor-appointment-saas-platform\.agents\explorer_m3_2\handoff.md
3. Send a message to parent when complete.
