import * as cheerio from 'cheerio';
import type { Page } from 'playwright';

export interface AuditOutput {
  hasWebsite: boolean;
  hasOnlineBooking: boolean;
  instagramHandle: string | null;
  isInstaActive: boolean;
  hasMetaAds: boolean;
}

export async function auditWebsite(url: string | null): Promise<{ hasWebsite: boolean; hasOnlineBooking: boolean }> {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return { hasWebsite: false, hasOnlineBooking: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { hasWebsite: false, hasOnlineBooking: false };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Look for online booking footprints
    const pageText = $('body').text().toLowerCase();
    const bookingKeywords = [
      'book appointment',
      'online booking',
      'schedule appointment',
      'book now',
      'calendly.com',
      'practo.com',
      'select slot',
      'choose time slot',
      'instant booking',
      'book online'
    ];

    const hasOnlineBooking = bookingKeywords.some(kw => pageText.includes(kw));
    return { hasWebsite: true, hasOnlineBooking };
  } catch {
    return { hasWebsite: true, hasOnlineBooking: false };
  }
}

export async function auditMetaAds(page: Page, clinicName: string): Promise<boolean> {
  try {
    const searchUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=${encodeURIComponent(clinicName)}&search_type=keyword_unordered`;
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 7000 });
    await page.waitForTimeout(1500);

    const content = await page.content();
    
    // Strict check: Only return true if explicit active ad card metadata is rendered
    const hasActiveAdCard = content.includes('Library ID:') || content.includes('Started running on');
    
    return hasActiveAdCard;
  } catch {
    return false;
  }
}

export async function auditDigitalFootprint(
  page: Page,
  websiteUrl: string | null,
  clinicName: string
): Promise<AuditOutput> {
  const webAudit = await auditWebsite(websiteUrl);
  let hasMetaAds = false;

  try {
    hasMetaAds = await auditMetaAds(page, clinicName);
  } catch {
    hasMetaAds = false;
  }

  return {
    hasWebsite: webAudit.hasWebsite,
    hasOnlineBooking: webAudit.hasOnlineBooking,
    instagramHandle: null,
    isInstaActive: false,
    hasMetaAds
  };
}
