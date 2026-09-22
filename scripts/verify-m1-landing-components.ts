/**
 * Challenger M1.1 Empirical Verification Test Suite
 * Milestone 1: Storytelling Arc Foundation (Clinic Diary Landing Page Overhaul)
 * 
 * Target Components:
 * 1. src/app/_components/the-mirror.tsx
 * 2. src/app/_components/zero-friction-guarantee.tsx
 * 3. src/app/_components/digital-clinic-ownership.tsx
 * 4. src/app/_components/experience-engine.tsx
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// ANSI Color Helpers
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function recordTest(suite: string, name: string, passed: boolean, error?: string, details?: any) {
  results.push({ suite, name, passed, error, details });
  if (passed) {
    console.log(`  ${GREEN}✓ PASS${RESET}: [${suite}] ${name}`);
  } else {
    console.error(`  ${RED}✗ FAIL${RESET}: [${suite}] ${name}`);
    if (error) console.error(`    ${RED}Error: ${error}${RESET}`);
    if (details) console.error(`    Details:`, details);
  }
}

// Target Paths
const projectRoot = path.resolve(__dirname, "..");
const componentsDir = path.join(projectRoot, "src", "app", "_components");

const targetFiles = {
  theMirror: path.join(componentsDir, "the-mirror.tsx"),
  zeroFriction: path.join(componentsDir, "zero-friction-guarantee.tsx"),
  digitalClinic: path.join(componentsDir, "digital-clinic-ownership.tsx"),
  experienceEngine: path.join(componentsDir, "experience-engine.tsx")
};

// Helper: Parse TypeScript source file to AST
function parseSourceFile(filePath: string): { content: string; sourceFile: ts.SourceFile } {
  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    path.basename(filePath),
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  return { content, sourceFile };
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: React Component Exports & Directive Conformance
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}=== SUITE 1: React Component Exports & "use client" Directives ===${RESET}`);

for (const [key, filePath] of Object.entries(targetFiles)) {
  const fileName = path.basename(filePath);
  const { content, sourceFile } = parseSourceFile(filePath);

  // Check 1.1: "use client" directive
  const hasUseClient = content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'");
  recordTest(
    "Exports & Directives",
    `${fileName} must have 'use client' directive`,
    hasUseClient,
    hasUseClient ? undefined : `Missing 'use client' at top of ${fileName}`
  );

  // Check 1.2: Identify exported function components
  let exportedFunctions: string[] = [];
  let hasDefaultExport = false;
  let propsInterfaces: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
      const isDefault = node.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword);
      if (isExported) {
        exportedFunctions.push(node.name.text);
        if (isDefault) hasDefaultExport = true;
      }
    } else if (ts.isInterfaceDeclaration(node)) {
      propsInterfaces.push(node.name.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  const expectedComponentNames: Record<string, string> = {
    theMirror: "TheMirror",
    zeroFriction: "ZeroFrictionGuarantee",
    digitalClinic: "DigitalClinicOwnership",
    experienceEngine: "ExperienceEngine"
  };

  const expectedName = expectedComponentNames[key];
  const hasExpectedExport = exportedFunctions.includes(expectedName);
  recordTest(
    "Exports & Directives",
    `${fileName} exports React component function '${expectedName}'`,
    hasExpectedExport,
    hasExpectedExport ? undefined : `Could not find exported function ${expectedName} in ${fileName}`,
    { foundExports: exportedFunctions }
  );

  // Check Props interface
  const hasProps = propsInterfaces.some(p => p.toLowerCase().includes("props"));
  recordTest(
    "Exports & Directives",
    `${fileName} declares clean Props interface (${expectedName}Props)`,
    hasProps,
    hasProps ? undefined : `Missing props interface in ${fileName}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Dynamic Import Alignment in src/app/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}=== SUITE 2: Alignment with src/app/page.tsx Dynamic Loaders ===${RESET}`);

const pageFilePath = path.join(projectRoot, "src", "app", "page.tsx");
const pageContent = fs.readFileSync(pageFilePath, "utf-8");

const expectedImports = [
  { component: "TheMirror", file: "the-mirror" },
  { component: "ZeroFrictionGuarantee", file: "zero-friction-guarantee" },
  { component: "DigitalClinicOwnership", file: "digital-clinic-ownership" },
  { component: "ExperienceEngine", file: "experience-engine" }
];

for (const exp of expectedImports) {
  const dynamicRegex = new RegExp(`dynamic\\(\\(\\)\\s*=>\\s*import\\(["']\\./_components/${exp.file}["']\\)\\.then\\(\\(m\\)\\s*=>\\s*m\\.${exp.component}\\)\\)`);
  const isCorrectlyImported = dynamicRegex.test(pageContent);
  recordTest(
    "Dynamic Loader Alignment",
    `src/app/page.tsx dynamically loads ${exp.component} from ./${exp.file}`,
    isCorrectlyImported,
    isCorrectlyImported ? undefined : `Dynamic import pattern mismatch in page.tsx for ${exp.component}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Zero Raster Assets & Pure Vector Compliance
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}=== SUITE 3: Zero Raster Assets & Pure Vector Compliance ===${RESET}`);

const rasterExtensionsRegex = /\.(png|jpg|jpeg|webp|gif|bmp|PNG|JPG|JPEG|WEBP|GIF|BMP)/;

for (const [key, filePath] of Object.entries(targetFiles)) {
  const fileName = path.basename(filePath);
  const { content, sourceFile } = parseSourceFile(filePath);

  let rasterImports: string[] = [];
  let rasterLiterals: string[] = [];
  let nextImageUsage: boolean = false;

  function checkRaster(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
      if (rasterExtensionsRegex.test(moduleSpecifier)) {
        rasterImports.push(moduleSpecifier);
      }
      if (moduleSpecifier === "next/image") {
        nextImageUsage = true;
      }
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (rasterExtensionsRegex.test(node.text)) {
        rasterLiterals.push(node.text);
      }
    } else if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText(sourceFile);
      if (tagName === "Image" || tagName === "img") {
        nextImageUsage = true;
      }
    }
    ts.forEachChild(node, checkRaster);
  }
  checkRaster(sourceFile);

  // Digital Clinic and Experience Engine specifically required NO raster images
  const isStrictZeroRasterTarget = key === "digitalClinic" || key === "experienceEngine";
  
  recordTest(
    "Vector Purity",
    `${fileName} must have ZERO raster image imports`,
    rasterImports.length === 0,
    rasterImports.length > 0 ? `Found raster imports: ${rasterImports.join(", ")}` : undefined,
    { rasterImports }
  );

  recordTest(
    "Vector Purity",
    `${fileName} must have ZERO raster string references (e.g. .png, .jpg)`,
    rasterLiterals.length === 0,
    rasterLiterals.length > 0 ? `Found raster literals: ${rasterLiterals.join(", ")}` : undefined,
    { rasterLiterals }
  );

  if (isStrictZeroRasterTarget) {
    recordTest(
      "Vector Purity",
      `${fileName} does not import or render next/image or <img>`,
      !nextImageUsage,
      nextImageUsage ? `Forbidden next/image or <img> detected in ${fileName}` : undefined
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: SVG Tag Attribute & ViewBox Integrity
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}=== SUITE 4: SVG Tag Attribute & ViewBox Integrity ===${RESET}`);

interface SvgInfo {
  file: string;
  viewBox?: string;
  className?: string;
  width?: string;
  height?: string;
  fill?: string;
  stroke?: string;
  validViewBox: boolean;
  hasSizing: boolean;
  hasStyling: boolean;
  line: number;
}

const allSvgs: SvgInfo[] = [];

for (const [key, filePath] of Object.entries(targetFiles)) {
  const fileName = path.basename(filePath);
  const { content, sourceFile } = parseSourceFile(filePath);

  function checkSvgElements(node: ts.Node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText(sourceFile);
      if (tagName === "svg") {
        let viewBox: string | undefined;
        let className: string | undefined;
        let width: string | undefined;
        let height: string | undefined;
        let fill: string | undefined;
        let stroke: string | undefined;

        for (const attr of node.attributes.properties) {
          if (ts.isJsxAttribute(attr) && attr.name) {
            const attrName = attr.name.getText(sourceFile);
            let attrVal: string | undefined;
            if (attr.initializer) {
              if (ts.isStringLiteral(attr.initializer)) {
                attrVal = attr.initializer.text;
              } else if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
                attrVal = attr.initializer.expression.getText(sourceFile);
              }
            }

            if (attrName === "viewBox") viewBox = attrVal;
            if (attrName === "className") className = attrVal;
            if (attrName === "width") width = attrVal;
            if (attrName === "height") height = attrVal;
            if (attrName === "fill") fill = attrVal;
            if (attrName === "stroke") stroke = attrVal;
          }
        }

        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        
        // Validate viewBox: 4 numbers separated by whitespace/commas
        const validViewBox = !!viewBox && /^-?\d+(\.\d+)?[\s,]+-?\d+(\.\d+)?[\s,]+\d+(\.\d+)?[\s,]+\d+(\.\d+)?$/.test(viewBox.trim());
        
        // Validate sizing: either explicit width/height or className with w- and h-
        const hasSizing = !!((width && height) || (className && /w-[\w\[\]\/\.]+/.test(className) && /h-[\w\[\]\/\.]+/.test(className)));

        // Validate styling: fill or stroke attribute or class
        const hasStyling = !!(fill !== undefined || stroke !== undefined || (className && (/stroke-|fill-|text-/.test(className))));

        allSvgs.push({
          file: fileName,
          viewBox,
          className,
          width,
          height,
          fill,
          stroke,
          validViewBox,
          hasSizing,
          hasStyling,
          line: line + 1
        });
      }
    }
    ts.forEachChild(node, checkSvgElements);
  }
  checkSvgElements(sourceFile);
}

recordTest(
  "SVG Integrity",
  `Found SVG elements in components for rich UI illustrations (Total found: ${allSvgs.length})`,
  allSvgs.length >= 2,
  allSvgs.length < 2 ? "Fewer SVGs found than expected" : undefined,
  { svgCount: allSvgs.length }
);

for (const svg of allSvgs) {
  recordTest(
    "SVG Integrity",
    `${svg.file}:${svg.line} <svg> has valid viewBox ('${svg.viewBox}')`,
    svg.validViewBox,
    svg.validViewBox ? undefined : `Invalid or missing viewBox in ${svg.file}:${svg.line}`
  );

  recordTest(
    "SVG Integrity",
    `${svg.file}:${svg.line} <svg> has responsive sizing (w/h or Tailwind)`,
    svg.hasSizing,
    svg.hasSizing ? undefined : `Missing w/h or sizing classes in ${svg.file}:${svg.line}`,
    { className: svg.className, width: svg.width, height: svg.height }
  );

  recordTest(
    "SVG Integrity",
    `${svg.file}:${svg.line} <svg> specifies fill/stroke or styling`,
    svg.hasStyling,
    svg.hasStyling ? undefined : `Missing fill/stroke in ${svg.file}:${svg.line}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: Specialty Marquee Count & Uniqueness
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}=== SUITE 5: Specialty Marquee Count & Uniqueness (experience-engine.tsx) ===${RESET}`);

const { content: eeContent, sourceFile: eeSource } = parseSourceFile(targetFiles.experienceEngine);

let extractedSpecialties: string[] = [];

function findSpecialtyList(node: ts.Node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(eeSource) === "SPECIALTY_LIST") {
    if (node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      for (const elem of node.initializer.elements) {
        if (ts.isStringLiteral(elem)) {
          extractedSpecialties.push(elem.text);
        }
      }
    }
  }
  ts.forEachChild(node, findSpecialtyList);
}
findSpecialtyList(eeSource);

const specialtyCount = extractedSpecialties.length;
recordTest(
  "Specialty Marquee",
  `SPECIALTY_LIST must contain at least 30 medical specialties (Found: ${specialtyCount})`,
  specialtyCount >= 30,
  specialtyCount < 30 ? `Only found ${specialtyCount} specialties; required 30+` : undefined,
  { specialtyCount, specialtiesSample: extractedSpecialties.slice(0, 5) }
);

// Check uniqueness
const uniqueSpecialties = new Set(extractedSpecialties);
const duplicateSpecialties = extractedSpecialties.filter((item, index) => extractedSpecialties.indexOf(item) !== index);
recordTest(
  "Specialty Marquee",
  `SPECIALTY_LIST has zero duplicate specialties`,
  duplicateSpecialties.length === 0,
  duplicateSpecialties.length > 0 ? `Duplicates detected: ${duplicateSpecialties.join(", ")}` : undefined,
  { duplicates: duplicateSpecialties }
);

// Check that double marquee array is constructed for infinite seamless loop
const hasDoubledMarquee = eeContent.includes("[...SPECIALTY_LIST, ...SPECIALTY_LIST]") ||
  eeContent.includes("MARQUEE_SPECIALTIES");
recordTest(
  "Specialty Marquee",
  `experience-engine.tsx implements seamless infinite marquee loop structure`,
  hasDoubledMarquee,
  hasDoubledMarquee ? undefined : `Marquee does not use doubled list for infinite loop`
);

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: Responsive Grid Classes & Viewport Breakpoints
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}=== SUITE 6: Responsive Grid Classes & Viewport Breakpoints ===${RESET}`);

// Helper to extract className strings from JSX elements
function extractAllClassNames(sourceFile: ts.SourceFile): string[] {
  const classNames: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isJsxAttribute(node) && node.name.getText(sourceFile) === "className" && node.initializer) {
      if (ts.isStringLiteral(node.initializer)) {
        classNames.push(node.initializer.text);
      } else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
        const text = node.initializer.expression.getText(sourceFile);
        classNames.push(text);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return classNames;
}

// 6.1 The Mirror
const mirrorClasses = extractAllClassNames(parseSourceFile(targetFiles.theMirror).sourceFile);
const mirrorHasResponsiveGrid = mirrorClasses.some(c => c.includes("grid-cols-1") && c.includes("lg:grid-cols-2"));
const mirrorHasMobileTabToggle = mirrorClasses.some(c => c.includes("flex sm:hidden"));

recordTest(
  "Responsive Grids",
  "the-mirror.tsx implements dual comparison grid (grid-cols-1 lg:grid-cols-2)",
  mirrorHasResponsiveGrid,
  mirrorHasResponsiveGrid ? undefined : "Missing grid-cols-1 lg:grid-cols-2 in the-mirror.tsx"
);

recordTest(
  "Responsive Grids",
  "the-mirror.tsx implements mobile tab toggle for small viewports (< sm)",
  mirrorHasMobileTabToggle,
  mirrorHasMobileTabToggle ? undefined : "Missing flex sm:hidden tab switcher in the-mirror.tsx"
);

// 6.2 Zero Friction Guarantee
const zfClasses = extractAllClassNames(parseSourceFile(targetFiles.zeroFriction).sourceFile);
const zfHas4ColResponsiveGrid = zfClasses.some(c => c.includes("grid-cols-1") && c.includes("md:grid-cols-2") && c.includes("lg:grid-cols-4"));

recordTest(
  "Responsive Grids",
  "zero-friction-guarantee.tsx implements 4-card responsive grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)",
  zfHas4ColResponsiveGrid,
  zfHas4ColResponsiveGrid ? undefined : "Missing grid-cols-1 md:grid-cols-2 lg:grid-cols-4 in zero-friction-guarantee.tsx"
);

// 6.3 Digital Clinic Ownership
const dcoClasses = extractAllClassNames(parseSourceFile(targetFiles.digitalClinic).sourceFile);
const dcoHas12ColLayout = dcoClasses.some(c => c.includes("grid-cols-1") && c.includes("lg:grid-cols-12"));
const dcoHasColSpans = dcoClasses.some(c => c.includes("lg:col-span-6"));

recordTest(
  "Responsive Grids",
  "digital-clinic-ownership.tsx implements 12-column responsive layout (grid-cols-1 lg:grid-cols-12, lg:col-span-6)",
  dcoHas12ColLayout && dcoHasColSpans,
  dcoHas12ColLayout && dcoHasColSpans ? undefined : "Missing grid-cols-1 lg:grid-cols-12 or lg:col-span-6 in digital-clinic-ownership.tsx"
);

// 6.4 Experience Engine
const eeClasses = extractAllClassNames(eeSource);
const eeHasBento12Col = eeClasses.some(c => c.includes("grid-cols-1") && c.includes("md:grid-cols-12"));
const eeHas7ColSpan = eeClasses.some(c => c.includes("md:col-span-7"));
const eeHas5ColSpan = eeClasses.some(c => c.includes("md:col-span-5"));

recordTest(
  "Responsive Grids",
  "experience-engine.tsx implements 12-column Bento Box grid (grid-cols-1 md:grid-cols-12)",
  eeHasBento12Col,
  eeHasBento12Col ? undefined : "Missing grid-cols-1 md:grid-cols-12 in experience-engine.tsx"
);

recordTest(
  "Responsive Grids",
  "experience-engine.tsx uses asymmetric Bento spans (md:col-span-7 and md:col-span-5)",
  eeHas7ColSpan && eeHas5ColSpan,
  eeHas7ColSpan && eeHas5ColSpan ? undefined : "Missing md:col-span-7 and md:col-span-5 in experience-engine.tsx"
);

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 7: Content & Storytelling Integrity
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}=== SUITE 7: Content & Storytelling Integrity ===${RESET}`);

// Check specific emotional copy required for Indian clinic context
const mirrorRaw = fs.readFileSync(targetFiles.theMirror, "utf-8");
const hasDoctorKabAayenge = mirrorRaw.includes("Doctor kab aayenge? Kitna time lagega?");
recordTest(
  "Content & Storytelling",
  "the-mirror.tsx includes authentic emotional hook 'Doctor kab aayenge? Kitna time lagega?'",
  hasDoctorKabAayenge,
  hasDoctorKabAayenge ? undefined : "Missing 'Doctor kab aayenge' copy in the-mirror.tsx"
);

const dcoRaw = fs.readFileSync(targetFiles.digitalClinic, "utf-8");
const hasDoctorUrl = dcoRaw.includes("clinic.doctordiary.in/dr-sharma");
recordTest(
  "Content & Storytelling",
  "digital-clinic-ownership.tsx includes mock doctor domain 'clinic.doctordiary.in/dr-sharma'",
  hasDoctorUrl,
  hasDoctorUrl ? undefined : "Missing doctor custom domain in digital-clinic-ownership.tsx"
);

const hasZeroCommissionClaim = dcoRaw.includes("0% commission") || dcoRaw.includes("₹0 Commission");
recordTest(
  "Content & Storytelling",
  "digital-clinic-ownership.tsx communicates 0% commission against aggregator model",
  hasZeroCommissionClaim,
  hasZeroCommissionClaim ? undefined : "Missing 0% commission statement in digital-clinic-ownership.tsx"
);

// Check 4 Guarantees in Zero Friction
const zfRaw = fs.readFileSync(targetFiles.zeroFriction, "utf-8");
const hasWalkinsGuarantee = zfRaw.includes("Walk-ins") || zfRaw.includes("walk-in");
const hasRxPadGuarantee = zfRaw.includes("Rx Pad") || zfRaw.includes("Rx");
const hasRegisterGuarantee = zfRaw.includes("48h") || zfRaw.includes("Migrated Free");
const has247Guarantee = zfRaw.includes("24/7");

recordTest(
  "Content & Storytelling",
  "zero-friction-guarantee.tsx covers all 4 core adoption pillars (Walk-ins, Paper Rx, 48h Migration, 24/7 Visibility)",
  hasWalkinsGuarantee && hasRxPadGuarantee && hasRegisterGuarantee && has247Guarantee,
  undefined,
  { hasWalkinsGuarantee, hasRxPadGuarantee, hasRegisterGuarantee, has247Guarantee }
);

// ─────────────────────────────────────────────────────────────────────────────
// Final Summary & Exit Code
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}======================================================${RESET}`);
console.log(`${BOLD}           EMPIRICAL VERIFICATION SUMMARY             ${RESET}`);
console.log(`${BOLD}======================================================${RESET}`);

const total = results.length;
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`Total Tests Executed: ${total}`);
console.log(`${GREEN}Passed: ${passed}${RESET}`);
if (failed > 0) {
  console.log(`${RED}Failed: ${failed}${RESET}`);
  console.log(`\n${RED}${BOLD}FINAL VERDICT: REJECT${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}${BOLD}FINAL VERDICT: APPROVE${RESET}\n`);
  process.exit(0);
}
