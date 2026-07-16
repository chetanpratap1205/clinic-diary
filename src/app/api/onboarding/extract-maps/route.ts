import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || (!url.includes("google.com/maps") && !url.includes("maps.app.goo.gl") && !url.includes("goo.gl/maps"))) {
      return NextResponse.json({ error: "Invalid Google Maps URL" }, { status: 400 });
    }

    // Fetch the HTML from Google Maps (following redirects for shortlinks)
    const response = await fetch(url, {
      headers: {
        // Use a realistic user agent to avoid basic bot blockers
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Google Maps places usually have the name in the title, e.g., "City Care Clinic - Google Maps"
    const rawTitle = $("title").text();
    const clinicName = rawTitle.split(" - Google Maps")[0]?.trim() || "";

    // The description meta tag often contains address and phone number
    const metaDesc = $('meta[name="description"]').attr("content") || $('meta[itemprop="description"]').attr("content") || "";

    // Extract an Indian phone number (10 digits starting with 6-9, ignoring spaces/dashes)
    let phone = "";
    // Clean string by removing spaces, dashes, parentheses to make regex easier
    const cleanDesc = metaDesc.replace(/[\s\-\(\)]/g, "");
    
    // Look for 10 consecutive digits starting with 6,7,8,9
    const phoneMatch = cleanDesc.match(/[6-9]\d{9}/);
    if (phoneMatch) {
      phone = phoneMatch[0];
    } else {
      // Fallback: Check if the phone is in the final URL itself (sometimes they are)
      const urlDecoded = decodeURIComponent(response.url).replace(/[\s\-\(\)]/g, "");
      const urlPhoneMatch = urlDecoded.match(/[6-9]\d{9}/);
      if (urlPhoneMatch) {
        phone = urlPhoneMatch[0];
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        name: clinicName,
        phone: phone,
      }
    });

  } catch (error: any) {
    console.error("[Maps Extraction Error]:", error);
    return NextResponse.json(
      { error: "Could not extract details. Please enter manually." },
      { status: 500 }
    );
  }
}
