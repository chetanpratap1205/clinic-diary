import "dotenv/config";
import { db } from "../src/db";
import { products } from "../src/db/schema";
import { v4 as uuidv4 } from "uuid";

async function main() {
  console.log("Seeding products...");

  const initialProducts = [
    {
      name: "Starter Kit (Digital + 1 Sticker)",
      description: "Get started for free. We will mail you 1 premium reception sticker and provide high-res PDFs of all your QR materials.",
      price: 0, // ₹0
      imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
      category: "sticker",
      isActive: true,
    },
    {
      name: "Vinyl Desk Stickers (Pack of 3)",
      description: "Durable, water-resistant vinyl stickers perfect for your reception desk, pharmacy window, or consultation room door.",
      price: 29900, // ₹299.00
      imageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=600&auto=format&fit=crop",
      category: "sticker",
      isActive: true,
    },
    {
      name: "Premium Acrylic QR Stand",
      description: "A beautiful, premium acrylic stand for your reception desk. Elevates your clinic's professional appearance and drastically increases scan rates.",
      price: 99900, // ₹999.00
      imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600&auto=format&fit=crop",
      category: "acrylic",
      isActive: true,
    },
    {
      name: "Weather-proof Outside Window Poster",
      description: "Capture foot traffic with this large, UV-resistant window poster. Patients can book appointments from the street even when you are closed.",
      price: 49900, // ₹499.00
      imageUrl: "https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=600&auto=format&fit=crop",
      category: "print",
      isActive: true,
    },
    {
      name: "Patient Medical Folders (Pack of 100)",
      description: "Standardize your physical records with these premium medical folders, featuring your clinic logo and a large QR code on the back.",
      price: 149900, // ₹1499.00
      imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop",
      category: "print",
      isActive: true,
    },
    {
      name: "Premium Prescription Pads (Pack of 500)",
      description: "High-quality, customized prescription pads. Every page features your clinic's branding and the QR code for easy follow-up booking.",
      price: 99900, // ₹999.00
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop",
      category: "print",
      isActive: true,
    }
  ];

  for (const p of initialProducts) {
    await db.insert(products).values(p);
  }

  console.log("Products seeded successfully.");
  process.exit(0);
}

main().catch(console.error);
