import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { generatePitch, type LeadAuditResult } from './lib/pitch-matrix';
import { auditDigitalFootprint } from './lib/digital-auditor';

function parseArgs() {
  const args = process.argv.slice(2);
  const options: Record<string, string> = {
    city: 'Indore',
    specialty: 'Dermatologist',
    country: 'India',
    limit: '10',
  };

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (key && value) {
        options[key] = value;
      }
    }
  });

  return {
    city: options.city,
    specialty: options.specialty,
    country: options.country,
    limit: parseInt(options.limit, 10) || 10,
  };
}

function formatE164Phone(rawPhone: string, country: string): { phone: string; whatsappLink: string } {
  if (!rawPhone) {
    return { phone: '', whatsappLink: '' };
  }

  // Remove non-digit characters except leading +
  let cleaned = rawPhone.replace(/[^\d+]/g, '');

  const isUAE = country.toLowerCase().includes('uae') || country.toLowerCase().includes('dubai');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  } else if (isUAE) {
    if (cleaned.startsWith('05')) {
      cleaned = '971' + cleaned.slice(1);
    } else if (!cleaned.startsWith('971')) {
      cleaned = '971' + cleaned;
    }
  } else {
    // India default (+91)
    if (cleaned.startsWith('0')) {
      cleaned = '91' + cleaned.slice(1);
    } else if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
  }

  const phone = `+${cleaned}`;
  const whatsappLink = `https://wa.me/${cleaned}`;

  return { phone, whatsappLink };
}

async function scrapeGoogleMapsLeads() {
  const { city, specialty, country, limit } = parseArgs();
  console.log(`\n🚀 Doctor Diary Lead Generator Started!`);
  console.log(`📍 Location: ${city}, ${country}`);
  console.log(`🩺 Specialty: ${specialty}`);
  console.log(`🎯 Target Limit: ${limit} leads\n`);

  const searchQuery = `${specialty} in ${city}, ${country}`;

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch {
    try {
      browser = await chromium.launch({
        headless: true,
        channel: 'chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch {
      browser = await chromium.launch({
        headless: true,
        channel: 'msedge',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  const page = await context.newPage();

  console.log(`🔍 Navigating to Google Maps search...`);
  await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  await page.waitForTimeout(3000);

  // Scroll side panel to load listing URLs
  const feedSelector = 'div[role="feed"]';
  try {
    await page.waitForSelector(feedSelector, { timeout: 10000 });
  } catch {
    console.log(`⚠️ Side panel feed selector waiting...`);
  }

  console.log(`📜 Scrolling feed to gather listings...`);
  const scrollSteps = Math.max(3, Math.ceil(limit / 3));
  for (let i = 0; i < scrollSteps; i++) {
    await page.evaluate((selector) => {
      const feed = document.querySelector(selector);
      if (feed) {
        feed.scrollTop += 1800;
      }
    }, feedSelector);
    await page.waitForTimeout(1500);
  }

  // Gather all unique place URLs
  const rawHrefs = await page.$$eval('a[href*="/maps/place/"]', els => 
    els.map(el => el.getAttribute('href')).filter((h): h is string => Boolean(h))
  );

  const placeUrls: string[] = [];
  const seen = new Set<string>();

  for (const href of rawHrefs) {
    const fullUrl = href.startsWith('http') ? href : `https://www.google.com${href}`;
    if (!seen.has(fullUrl)) {
      seen.add(fullUrl);
      placeUrls.push(fullUrl);
    }
  }

  console.log(`📊 Collected ${placeUrls.length} unique place URLs on Google Maps.\n`);

  const results: any[] = [];
  for (let i = 0; i < placeUrls.length && results.length < limit; i++) {
    const placeUrl = placeUrls[i];
    const leadPage = await context.newPage();
    try {
      console.log(`⏳ Scraping Lead (${results.length + 1}/${limit})...`);
      await leadPage.goto(placeUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await leadPage.waitForSelector('h1', { timeout: 5000 }).catch(() => null);

      // Extract Clinic Name
      const clinicName = await leadPage.$eval('h1', el => el.textContent?.trim() || '').catch(() => '');
      if (!clinicName || clinicName.toLowerCase().includes('results')) {
        await leadPage.close();
        continue;
      }

      // Extract Rating
      let rating = 0;
      let reviewCount = 0;

      const ratingStr = await leadPage.$eval('div.F7L8fd span.ceMgBc, span.fsA2s, div.fontBodyMedium span[aria-hidden="true"]', el => el.textContent?.trim() || '').catch(() => '');
      if (ratingStr && !isNaN(parseFloat(ratingStr))) {
        rating = parseFloat(ratingStr);
      }

      const reviewStr = await leadPage.$eval('button.HH2rfc span, button[aria-label*="reviews"] span', el => el.textContent?.trim() || '').catch(() => '');
      if (reviewStr) {
        reviewCount = parseInt(reviewStr.replace(/[^\d]/g, ''), 10) || 0;
      }

      // Extract Phone
      const rawPhone = await leadPage.$eval('button[data-tooltip*="phone"], button[data-item-id*="phone"]', el => el.textContent?.trim() || '').catch(() => '');

      // Extract Website
      const websiteUrl = await leadPage.$eval('a[data-tooltip*="website"], a[data-item-id*="authority"]', el => el.getAttribute('href') || '').catch(() => null);

      // Extract Address
      const address = await leadPage.$eval('button[data-item-id*="address"]', el => el.textContent?.trim() || '').catch(() => '');

      const { phone, whatsappLink } = formatE164Phone(rawPhone, country);

      // Derive Doctor Name if included in clinic name
      let doctorName = 'Doctor';
      const docMatch = clinicName.match(/Dr\.?\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
      if (docMatch) {
        doctorName = docMatch[1];
      }

      console.log(`  ✅ Extracted: ${clinicName} (${phone || 'No Phone'}) - ${rating}★ (${reviewCount} reviews)`);

      // Run Digital Audit & Pitch Matrix
      const audit = await auditDigitalFootprint(leadPage, websiteUrl, clinicName);

      const leadRecord: LeadAuditResult = {
        clinicName,
        doctorName,
        city,
        country,
        phone,
        whatsappLink,
        specialty,
        rating,
        reviewCount,
        websiteUrl,
        hasWebsite: audit.hasWebsite,
        hasOnlineBooking: audit.hasOnlineBooking,
        instagramHandle: audit.instagramHandle,
        isInstaActive: audit.isInstaActive,
        hasMetaAds: audit.hasMetaAds,
      };

      const pitch = generatePitch(leadRecord);

      results.push({
        ...leadRecord,
        address,
        primaryPainPoint: pitch.primaryPainPoint,
        whatsappScript: pitch.whatsappScript,
        coldCallHook: pitch.coldCallHook,
      });

    } catch (err: any) {
      console.log(`  ⚠️ Skipping lead index ${i}: ${err.message}`);
    } finally {
      await leadPage.close().catch(() => null);
    }
  }
  await browser.close();

  // Save to CSV
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const csvFileName = `leads_${city.toLowerCase().replace(/\s+/g, '_')}_${specialty.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.csv`;
  const csvFilePath = path.join(outputDir, csvFileName);

  const headers = [
    'Clinic Name',
    'Doctor Name',
    'Specialty',
    'City',
    'Country',
    'Phone',
    'WhatsApp Link',
    'Rating',
    'Reviews',
    'Website',
    'Has Website?',
    'Has Online Booking?',
    'Has Meta Ads?',
    'Primary Pain Point',
    'WhatsApp Script',
    'Cold Call Hook',
    'Address'
  ];

  const csvLines = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...results.map(r => [
      `"${r.clinicName.replace(/"/g, '""')}"`,
      `"${r.doctorName.replace(/"/g, '""')}"`,
      `"${r.specialty.replace(/"/g, '""')}"`,
      `"${r.city.replace(/"/g, '""')}"`,
      `"${r.country.replace(/"/g, '""')}"`,
      `"${r.phone.replace(/"/g, '""')}"`,
      `"${r.whatsappLink.replace(/"/g, '""')}"`,
      `"${r.rating}"`,
      `"${r.reviewCount}"`,
      `"${(r.websiteUrl || '').replace(/"/g, '""')}"`,
      `"${r.hasWebsite ? 'YES' : 'NO'}"`,
      `"${r.hasOnlineBooking ? 'YES' : 'NO'}"`,
      `"${r.hasMetaAds ? 'YES' : 'NO'}"`,
      `"${r.primaryPainPoint.replace(/"/g, '""')}"`,
      `"${r.whatsappScript.replace(/"/g, '""')}"`,
      `"${r.coldCallHook.replace(/"/g, '""')}"`,
      `"${(r.address || '').replace(/"/g, '""')}"`
    ].join(','))
  ];

  fs.writeFileSync(csvFilePath, csvLines.join('\n'), 'utf-8');

  console.log(`\n🎉 SUCCESS! Scraped & Audited ${results.length} Qualified Doctor Leads.`);
  console.log(`📁 Saved output CSV file to: ${csvFilePath}\n`);
}

scrapeGoogleMapsLeads().catch(console.error);
