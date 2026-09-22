import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

console.log('================================================================================');
console.log('   CHALLENGER M2.2: BUILD INTEGRITY & NON-REGRESSION VERIFICATION SUITE');
console.log('================================================================================\n');

const projectRoot = path.resolve('.');
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${name}`);
    if (details) console.error(`    Details: ${details}`);
  }
}

// ----------------------------------------------------------------------------
// SUITE 1: PWA Configuration & Assets Integrity
// ----------------------------------------------------------------------------
console.log('--- SUITE 1: PWA Integrity & Static Assets ---');

// 1.1 manifest.json syntax & fields
const manifestPath = path.join(projectRoot, 'public', 'manifest.json');
test('public/manifest.json exists', fs.existsSync(manifestPath));

let manifestObj: any = null;
try {
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  manifestObj = JSON.parse(manifestContent);
  test('public/manifest.json is valid JSON', true);
} catch (e: any) {
  test('public/manifest.json is valid JSON', false, e.message);
}

if (manifestObj) {
  test('manifest.json has valid id', typeof manifestObj.id === 'string' && manifestObj.id.length > 0);
  test('manifest.json has valid name', manifestObj.name?.includes('Doctor Diary'));
  test('manifest.json has start_url', manifestObj.start_url === '/?utm_source=pwa');
  test('manifest.json has display: standalone', manifestObj.display === 'standalone');
  test('manifest.json has icons array', Array.isArray(manifestObj.icons) && manifestObj.icons.length >= 2);

  // Check all manifest icons exist
  for (const icon of manifestObj.icons || []) {
    const iconRelPath = icon.src.replace(/^\//, '');
    const iconFullPath = path.join(projectRoot, 'public', iconRelPath);
    test(`Manifest icon exists: ${icon.src}`, fs.existsSync(iconFullPath), `Missing file at ${iconFullPath}`);
  }

  // Check all manifest screenshots exist
  for (const ss of manifestObj.screenshots || []) {
    const ssRelPath = ss.src.replace(/^\//, '');
    const ssFullPath = path.join(projectRoot, 'public', ssRelPath);
    test(`Manifest screenshot exists: ${ss.src}`, fs.existsSync(ssFullPath), `Missing file at ${ssFullPath}`);
  }

  // Check shortcuts exist
  test('manifest.json has shortcuts array', Array.isArray(manifestObj.shortcuts) && manifestObj.shortcuts.length >= 3);
}

// 1.2 public/sw.js
const swPath = path.join(projectRoot, 'public', 'sw.js');
test('public/sw.js exists', fs.existsSync(swPath));
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf-8');
  test('sw.js contains CACHE_NAME', swContent.includes('CACHE_NAME'));
  test('sw.js handles install and skipWaiting', swContent.includes('install') && swContent.includes('skipWaiting'));
  test('sw.js handles activate and clients.claim', swContent.includes('activate') && swContent.includes('clients.claim'));
  test('sw.js network-first for /dashboard and /track/', swContent.includes('/dashboard') && swContent.includes('/track/'));

  // Syntax check sw.js via vm.Script
  try {
    new vm.Script(swContent);
    test('public/sw.js passes JavaScript syntax validation', true);
  } catch (e: any) {
    test('public/sw.js passes JavaScript syntax validation', false, e.message);
  }
}

// 1.3 src/components/pwa-provider.tsx
const pwaProviderPath = path.join(projectRoot, 'src', 'components', 'pwa-provider.tsx');
test('src/components/pwa-provider.tsx exists', fs.existsSync(pwaProviderPath));
if (fs.existsSync(pwaProviderPath)) {
  const pwaContent = fs.readFileSync(pwaProviderPath, 'utf-8');
  test('pwa-provider.tsx exports registerServiceWorker', pwaContent.includes('export function registerServiceWorker'));
  test('pwa-provider.tsx exports PWAProvider', pwaContent.includes('export function PWAProvider'));
  test('pwa-provider.tsx registers /sw.js', pwaContent.includes('navigator.serviceWorker') && pwaContent.includes('.register("/sw.js"'));
}

// ----------------------------------------------------------------------------
// SUITE 2: Module Imports & Package Integrity for Milestone 2 Components
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Module Imports & Package Integrity ---');

const m2Files = [
  path.join(projectRoot, 'src', 'app', '_components', 'patient-journey-timeline.tsx'),
  path.join(projectRoot, 'src', 'app', '_components', 'doctor-dashboard.tsx'),
];

const pkgJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
const installedDeps = new Set([
  ...Object.keys(pkgJson.dependencies || {}),
  ...Object.keys(pkgJson.devDependencies || {}),
  'react',
  'react-dom',
  'next',
]);

for (const filePath of m2Files) {
  const filename = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /import\s+(?:(?:(?:\*\s+as\s+\w+)|(?:\{[^}]*\})|(?:\w+))\s+from\s+)?['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  const imports: string[] = [];

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  for (const imp of imports) {
    if (imp.startsWith('.')) {
      const resolved = path.resolve(path.dirname(filePath), imp);
      const exists = fs.existsSync(resolved) ||
                     fs.existsSync(`${resolved}.ts`) ||
                     fs.existsSync(`${resolved}.tsx`) ||
                     fs.existsSync(`${resolved}.js`) ||
                     fs.existsSync(path.join(resolved, 'index.ts')) ||
                     fs.existsSync(path.join(resolved, 'index.tsx'));
      test(`[${filename}] Relative import exists: ${imp}`, exists, `Target not found: ${resolved}`);
    } else if (imp.startsWith('@/')) {
      const relToSrc = imp.replace(/^@\//, '');
      const resolved = path.join(projectRoot, 'src', relToSrc);
      const exists = fs.existsSync(resolved) ||
                     fs.existsSync(`${resolved}.ts`) ||
                     fs.existsSync(`${resolved}.tsx`) ||
                     fs.existsSync(`${resolved}.js`) ||
                     fs.existsSync(path.join(resolved, 'index.ts')) ||
                     fs.existsSync(path.join(resolved, 'index.tsx'));
      test(`[${filename}] Path alias import exists: ${imp}`, exists, `Target not found: ${resolved}`);
    } else {
      const pkgName = imp.startsWith('@') ? imp.split('/').slice(0, 2).join('/') : imp.split('/')[0];
      const isDep = installedDeps.has(pkgName);
      test(`[${filename}] External package in package.json: ${pkgName}`, isDep, `Package not listed in package.json: ${pkgName}`);
    }
  }
}

// ----------------------------------------------------------------------------
// SUITE 3: Static Asset References in Landing Components
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Static Asset References in Landing Components ---');

// Check all asset path patterns in patient-journey-timeline.tsx and doctor-dashboard.tsx
for (const filePath of m2Files) {
  const filename = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Match any strings like "/assets/...", "/images/...", "/icons/...", etc.
  const assetRegex = /['"](\/(?:assets|images|icons|img|static)\/[^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  const assetRefs: string[] = [];

  while ((match = assetRegex.exec(content)) !== null) {
    assetRefs.push(match[1]);
  }

  if (assetRefs.length === 0) {
    test(`[${filename}] Zero hardcoded raster /assets/ paths found`, true);
  } else {
    for (const ref of assetRefs) {
      const fullPath = path.join(projectRoot, 'public', ref.replace(/^\//, ''));
      test(`[${filename}] Asset exists: ${ref}`, fs.existsSync(fullPath), `Asset missing: ${fullPath}`);
    }
  }
}

// ----------------------------------------------------------------------------
// SUITE 4: Cross-Portal Route Isolation
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Cross-Portal Route Isolation ---');

// Verify dashboard, clinic, track routes do NOT import from src/app/_components/*
const sensitiveDirs = [
  path.join(projectRoot, 'src', 'app', 'dashboard'),
  path.join(projectRoot, 'src', 'app', 'clinic'),
  path.join(projectRoot, 'src', 'app', 'track'),
];

function scanDirForImports(dir: string, forbiddenSubstr: string): string[] {
  const violations: string[] = [];
  if (!fs.existsSync(dir)) return violations;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      violations.push(...scanDirForImports(fullPath, forbiddenSubstr));
    } else if (/\.(tsx|ts|js|jsx)$/.test(entry.name)) {
      const code = fs.readFileSync(fullPath, 'utf-8');
      if (code.includes(forbiddenSubstr) || /from\s+['"].*_components/.test(code)) {
        violations.push(fullPath);
      }
    }
  }
  return violations;
}

for (const sDir of sensitiveDirs) {
  const dirName = path.basename(sDir);
  const violations = scanDirForImports(sDir, '_components');
  test(`Route /${dirName} does not import landing page _components`, violations.length === 0, `Violations: ${violations.join(', ')}`);
}

// Verify src/app/page.tsx dynamic import integrity
const pageFile = path.join(projectRoot, 'src', 'app', 'page.tsx');
const pageContent = fs.readFileSync(pageFile, 'utf-8');
test('src/app/page.tsx loads PatientJourneyTimeline via dynamic import', pageContent.includes('patient-journey-timeline'));
test('src/app/page.tsx loads DoctorDashboard via dynamic import', pageContent.includes('doctor-dashboard'));

// ----------------------------------------------------------------------------
// SUITE 5: Production Build Output & Route Server Bundles Verification
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 5: Next.js Production Build Artifacts ---');

const nextServerApp = path.join(projectRoot, '.next', 'server', 'app');
test('.next/server/app build directory exists', fs.existsSync(nextServerApp));

// In Next.js 16 (Turbopack), App Router routes compile into server directories with manifests
const routeBundles = [
  { name: 'Landing Page (/)', dir: path.join(nextServerApp, 'page') },
  { name: 'Doctor Dashboard (/dashboard)', dir: path.join(nextServerApp, 'dashboard') },
  { name: 'Clinic Portal (/clinic/[slug])', dir: path.join(nextServerApp, 'clinic', '[slug]') },
  { name: 'Patient Tracking (/track/[appointmentId])', dir: path.join(nextServerApp, 'track', '[appointmentId]') },
  { name: 'Login Portal (/login)', dir: path.join(nextServerApp, 'login') },
  { name: 'Signup Portal (/signup)', dir: path.join(nextServerApp, 'signup') },
  { name: 'Offline PWA Page (/offline)', dir: path.join(nextServerApp, 'offline') },
];

for (const rb of routeBundles) {
  test(`Compiled route artifact exists in .next: ${rb.name}`, fs.existsSync(rb.dir), `Missing directory: ${rb.dir}`);
}

// Check that landing page server bundle contains build-manifest.json
const pageBuildManifest = path.join(nextServerApp, 'page', 'build-manifest.json');
test('Landing page server build-manifest.json exists', fs.existsSync(pageBuildManifest));

// ----------------------------------------------------------------------------
// SUMMARY & VERDICT
// ----------------------------------------------------------------------------
console.log('\n================================================================================');
console.log('   CHALLENGER M2.2 VERIFICATION SUMMARY');
console.log('================================================================================');
console.log(`  Total Tests Executed : ${totalTests}`);
console.log(`  Passed               : ${passedTests}`);
console.log(`  Failed               : ${failedTests}`);

if (failedTests === 0) {
  console.log('\n  FINAL VERDICT: APPROVE');
  process.exit(0);
} else {
  console.error('\n  FINAL VERDICT: REJECT');
  process.exit(1);
}
