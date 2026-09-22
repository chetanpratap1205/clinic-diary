// Doctor Diary Sales Training — Full Hinglish Content v2.0
// Written for real ground-level field sales. Not bookish theory.
// Every lead is a quality lead. Every objection is a door, not a wall.

export interface ScriptLine {
  speaker: "you" | "them" | "note" | "tip" | "warning";
  text: string;
}

export interface ObjectionBlock {
  objection: string;
  context?: string;
  counter: string;
  followUp?: string;
}

export interface ContentBlock {
  type:
    | "heading"
    | "subheading"
    | "para"
    | "script"
    | "objection-list"
    | "checklist"
    | "tip-box"
    | "warning-box"
    | "whatsapp-template"
    | "numbered-list"
    | "highlight"
    | "divider";
  title?: string;
  text?: string;
  items?: string[];
  lines?: ScriptLine[];
  objections?: ObjectionBlock[];
  templateLabel?: string;
  templateText?: string;
}

export interface Chapter {
  slug: string;
  title: string;
  emoji: string;
  tagline: string;
  readTime: string;
  color: string;
  blocks: ContentBlock[];
}

export const chapters: Chapter[] = [
  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 0 — MINDSET
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "mindset",
    title: "Mindset & Ground Reality",
    emoji: "🧠",
    tagline: "Sab se pehle ye samjho — field sales kya hoti hai asal mein",
    readTime: "8 min",
    color: "purple",
    blocks: [
      {
        type: "highlight",
        text: "\"Tu salesperson nahi hai. Tu ek doctor ka problem solver hai. Jab ye feel hoga, tabhi convert hoga.\" — Founder",
      },
      {
        type: "heading",
        title: "Ground Reality #1: Doctor nahi milta, Reception milti hai",
      },
      {
        type: "para",
        text: "90% cases mein jab tu call karega ya clinic jayega, pehle reception face karni padegi. Ye teri asli test hai. Reception ko convince kiya toh doctor tak pahuncho ge. Reception ko irritate kiya toh game over.",
      },
      {
        type: "tip-box",
        text: "Reception staff usually overworked aur stressed hoti hai. Teri call unke liye ek aur interruption hai. Tera kaam ye hai ki tu ek relief ban ke aaye, problem nahi.",
      },
      {
        type: "heading",
        title: "Ground Reality #2: Doctor ka time = Gold",
      },
      {
        type: "para",
        text: "Doctor ke paas genuinely 2-3 minute bhi nahi hote daytime mein. Woh 30-50 patients roz dekhte hain. Agar tu 10 minute ka lecture dega toh woh phone rakh dega. Simple rule: pehle 30 seconds mein value deliver karo ya mat karo.",
      },
      {
        type: "heading",
        title: "Ground Reality #3: Rejection = Direction",
      },
      {
        type: "para",
        text: "Har \"abhi nahi\" matlab NAHI nahi hota. Matlab hai \"mujhe abhi reason nahi diya\". Industry average: 7-12 touchpoints ke baad deal close hoti hai. Ek call mein close ki expectation mat rakh — process pe trust kar.",
      },
      {
        type: "heading",
        title: "Ground Reality #4: Jo cheez unke paas HAI — woh humara PLUS point hai",
      },
      {
        type: "para",
        text: "Doctor ke paas website hai? PLUS. Ads run kar raha hai? PLUS. Social media pe active hai? PLUS. Practo pe listed hai? PLUS. Receptionist hai? PLUS. Ye sab cheezein unki existing infrastructure hain — aur Doctor Diary in SABB ko 10x better banata hai. Ye sikhna iss training ka sabse important hissa hai.",
      },
      {
        type: "highlight",
        text: "Smart formula: Jo unke paas HAI = unka problem identify karo. Jo unke paas NAHI hai = unka gap fill karo. Doctor Diary dono situations mein fit baithta hai.",
      },
      {
        type: "checklist",
        title: "First Impression Checklist (Clinic Visit)",
        items: [
          "Clean press ki hui shirt/kurta — NO jhurriyan",
          "ID card ya company ID visible ho",
          "Phone silent mode pe rakho jab clinic mein ho",
          "Doctor ke naam se address karo — Dr. [Surname] Ji",
          "Visiting card ready rakho — dono haath se do",
          "Jaldi mat karo — Doctor ka rhythm follow karo",
          "Smell good — body odor deal killer hai",
        ],
      },
      {
        type: "heading",
        title: "The Golden Rule of Field Sales",
      },
      {
        type: "highlight",
        text: "LISTEN 70%, SPEAK 30%. Jo doctor zyada bolta hai, woh aage consider karta hai. Tu sunne wala ban, samajhne wala ban — pitch baad mein.",
      },
      {
        type: "numbered-list",
        title: "3 Types of Doctors You'll Meet",
        items: [
          "🔥 CURIOUS (20%) — Khud poochte hain 'ye kya hai?' — Ye hot lead hai. Demo abhi set karo.",
          "🤔 SKEPTICAL (50%) — 'Sab aise hi bolte hain' attitude. Inhe proof chahiye. Case studies aur numbers se baat karo.",
          "❌ RESISTANT (30%) — 'Mujhe kuch nahi chahiye.' Inpe zyada time mat lagao. Note karo aur 3 mahine baad phir try karo.",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 1 — PRODUCT KNOWLEDGE
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "product",
    title: "Product Knowledge — Sahi Framing",
    emoji: "📱",
    tagline: "Sirf 'booking software' mat bolo — ye teri sabse badi galti hai",
    readTime: "12 min",
    color: "teal",
    blocks: [
      {
        type: "warning-box",
        text: "⚠️ COMMON MISTAKE: 'Doctor Diary ek appointment booking app hai.' — Ye sunke doctor sochta hai 'Mujhe toh patients aa hi rahe hain.' GALAT FRAMING. Isko aise kabhi mat bolo.",
      },
      {
        type: "highlight",
        text: "SAHI FRAMING: Doctor Diary ek Autonomous Clinic Operating System hai — jo aapki clinic ko 24/7 work karta hai jab aap nahi karte. Patient aata kahan se bhi ho — Google, Instagram, ads, WhatsApp — woh directly aapki clinic mein land karta hai, book karta hai, reminder paata hai, aur actual aata hai.",
      },
      {
        type: "heading",
        title: "Doctor Diary = Poora Patient Lifecycle, Booking Sirf Ek Part Hai",
      },
      {
        type: "numbered-list",
        title: "7-Stage Patient Journey (Ye Doctor ko Dikhao):",
        items: [
          "🔍 DISCOVERY — Patient Google pe 'doctor near me' search karta hai → Aapki clinic website/listing dikhti hai",
          "📅 BOOKING — Patient 24/7 apne phone se appointment book karta hai — koi call nahi, koi wait nahi",
          "⏰ REMINDER — 24 hours pehle automatic WhatsApp reminder jaata hai — patient cancel nahi kar sakta 'bhool gaya' bolke",
          "🔴 LIVE QUEUE — Patient ghar se queue status dekh sakta hai — unnecessary early arrival nahi",
          "💊 CONSULT & Rx — Digital prescription in 30 seconds, patient ke WhatsApp pe directly",
          "⭐ REVIEW — Visit ke baad automatic review request — Google rating naturally badhti hai",
          "🔄 RE-ENGAGEMENT — Follow-up reminders, next appointment, patient wapas aata hai",
        ],
      },
      {
        type: "tip-box",
        text: "Jab doctor ye 7-stage sunta hai, woh realize karta hai ki abhi sirf Stage 1 aur 5 ho rahi hai uski clinic mein. Baaki 5 stages pe woh money chhod raha hai.",
      },
      {
        type: "heading",
        title: "30-Second Pitch — 3 Versions (Situation ke hisaab se choose karo)",
      },
      {
        type: "subheading",
        title: "Version A — Generic (jab kuch nahi pata)",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor Diary aapki clinic ka complete digital system hai — patient kisi bhi source se aaye, Google se, ads se, Instagram se — woh directly aapke paas book ho jaata hai. Automatic reminders se no-shows 60% tak kam hote hain. Aur ye sab aapki khud ki clinic website pe hota hai — koi Practo commission nahi. Ek baar demo mein dikhata hoon?",
          },
        ],
      },
      {
        type: "subheading",
        title: "Version B — Doctor runs ads (Ye gold hai — read Chapter 7 too)",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab, aap ads run karte hain — great! Mera ek question hai: Ads pe jo patient click karta hai, woh appointment book kahan karta hai? Phone pe? Tab ads ka 40-60% traffic waste ho raha hai because in India, 70% log phone call karna avoid karte hain after clicking an ad. Doctor Diary ek direct booking link deta hai — patient ad se directly book karta hai. Aapke ads ki conversion rate double ho jaayegi. Ek demo?",
          },
        ],
      },
      {
        type: "subheading",
        title: "Version C — Doctor has a website",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab, website hai — bahut achha! Ek quick check: Kya website pe patient abhi appointment book kar sakta hai? Queue dekh sakta hai? Digital prescription receive kar sakta hai? Doctor Diary aapki existing website ko ek complete smart clinic system mein convert karta hai. Website toh hai, ab use working bana dete hain.",
          },
        ],
      },
      {
        type: "heading",
        title: "Top 5 Features jo Doctor Actually Care Karta Hai",
      },
      {
        type: "numbered-list",
        title: "",
        items: [
          "💰 NO-SHOW RECOVERY — Average clinic loses ₹30,000-75,000/month in no-shows. Auto-reminders = real money back in pocket",
          "🌐 OWN ONLINE PRESENCE — clinic.doctordiary.in/dr-naam — Patient sirf AAPKO dekhta hai, competitors ko nahi",
          "📱 STAFF INDEPENDENCE — System khud kaam karta hai. Receptionist ki chutti pe bhi appointments chalta rehta hai",
          "⭐ GOOGLE REPUTATION ENGINE — Post-visit review automation — Rating naturally badhti hai without begging",
          "📊 PRACTICE ANALYTICS — Kaun patients most repeat karte hain, peak hours kab hain, revenue trends — doctor ka apna data",
        ],
      },
      {
        type: "heading",
        title: "Doctor Diary vs Everything Else",
      },
      {
        type: "checklist",
        title: "Comparison (Field mein use karo confidently):",
        items: [
          "Static Website: Brochure hai, system nahi | Doctor Diary: Live booking, queue, reminders — kaam karta hai",
          "Practo/BookMyDoctor: 15-20% commission, aapke patients competitors bhi dekhte hain | Doctor Diary: 0% commission, sirf aapki clinic",
          "Manual Phone Booking: Staff dependent, missed calls, no reminders | Doctor Diary: 24/7 automated, zero missed bookings",
          "Google Ads alone: Traffic aata hai, but kahan jaata hai? | Doctor Diary: Ad traffic seedha booking mein convert",
          "Instagram/Social Media: Followers hain, but book nahi kar sakte directly | Doctor Diary: Bio link se direct booking",
          "Current EMR/Software: Sirf records — koi patient acquisition nahi | Doctor Diary: Acquisition + Management + Retention",
        ],
      },
      {
        type: "heading",
        title: "ROI Math — Doctor ko Samjhao (Numbers Never Lie)",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — ek 2-minute calculation karte hain. Aap daily kitne patients dekhte hain? [Sunno] Aur roughly kitna consultation fee hai? [Sunno] Okay toh 10% no-show bhi ho toh — woh [X × consultation fee × 22 working days] ka monthly loss hai. Doctor Diary ke auto-reminders se 60% no-shows recover hote hain. Woh [60% of above] monthly extra revenue hai — bina ek bhi extra patient acquire kiye. Software ka cost iss recovery se kitna guna chhota hai — aap khud decide karo.",
          },
          {
            speaker: "note",
            text: "Doctor ke apne numbers se calculate karo — unke numbers, unka aha moment. Apne numbers mat bolna.",
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 2 — PROSPECTING
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "prospecting",
    title: "Leads Dhundna — Prospecting",
    emoji: "🎯",
    tagline: "Sahi doctor dhundho — aur unke paas kya hai ye pehle samjho",
    readTime: "8 min",
    color: "blue",
    blocks: [
      {
        type: "highlight",
        text: "Pro tip: Jab lead dhundho, pehle ye note karo — unke paas website hai kya? Ads run karte hain? Social media active hai? Ye information teri pitch customize karegi before first call.",
      },
      {
        type: "heading",
        title: "Method 1: Google Maps + Intel Gathering",
      },
      {
        type: "numbered-list",
        title: "Step by Step:",
        items: [
          "Google Maps kholo → 'Doctors near [city]' ya 'Clinics in [area]' search karo",
          "Filter: Rating 3.5+, Reviews 10+ (active clinic)",
          "Clinic ka website link check karo — static hai ya bookable? Note karo.",
          "Google pe 'Dr. [Name] [City]' search karo — Practo pe hain? Instagram hai? Ads run kar rahe hain?",
          "Facebook/Instagram pe @clinicname search karo — kitne followers, kitna engagement?",
          "Ye sab info note karo BEFORE calling — ye teri pitch blueprint hai",
        ],
      },
      {
        type: "tip-box",
        text: "5 minute ki research = 5x better pitch. Agar pata hai doctor Facebook ads run karta hai, call mein seedha woh angle use karo. Agar website hai but no booking, woh angle use karo. Generic pitch = generic results.",
      },
      {
        type: "heading",
        title: "Method 2: Employee Directory (Easiest!)",
      },
      {
        type: "para",
        text: "Humara apna Doctor Directory mein already 1000+ doctors listed hain. /employee/directory page pe jaao — 'Unclaimed' doctors = warmest leads. Already unka data hai, sirf connect karna hai.",
      },
      {
        type: "heading",
        title: "Method 3: Ads-Running Doctors = Premium Leads",
      },
      {
        type: "para",
        text: "Google pe 'Doctor [city]' search karo — jo doctors sponsored results mein aate hain, woh ads chala rahe hain. Ye premium leads hain kyunki: (1) Woh already growth mein invest kar rahe hain, (2) Decision maker hain (jo ads pe paisa lagata hai woh khud decide karta hai), (3) Doctor Diary unke ads ROI seedha improve karega.",
      },
      {
        type: "heading",
        title: "Lead Qualification Checklist",
      },
      {
        type: "checklist",
        title: "Priority Lead Score (3+ = High Priority):",
        items: [
          "✅ Independent practice (not hospital employed)",
          "✅ Daily 20+ patients",
          "✅ Running Google/Facebook/Instagram ads",
          "✅ Has a website but no online booking",
          "✅ Active on social media (Instagram/Facebook)",
          "✅ Listed on Practo/JustDial (paying commission already)",
          "✅ Has receptionist (admin load exists)",
          "✅ No current clinic management software",
        ],
      },
      {
        type: "warning-box",
        text: "Avoid: Government doctors (different procurement), retired doctors (low volume), hospital-employed doctors (no software authority), clinics that recently shut down.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 3 — COLD CALL: RECEPTION
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "call-reception",
    title: "Call Script — Reception Uthaye",
    emoji: "📞",
    tagline: "Jab receptionist phone uthaye — exact script + all rejection counters",
    readTime: "12 min",
    color: "green",
    blocks: [
      {
        type: "highlight",
        text: "GOLDEN RULE: Reception ko enemy mat samjho. Woh gatekeeper nahi, woh ally ban sakti hai. Receptionist ko genuinely help karna chahte ho — unka kaam easy karna chahte ho. Ye feel aaya toh conversation naturally flow karega.",
      },
      {
        type: "heading",
        title: "Opening — Pehli 10 Seconds (Most Important)",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "them",
            text: "Hello, [Clinic Name] Clinic.",
          },
          {
            speaker: "you",
            text: "Haan ji, namaskar! Main [Aapka Naam] bol raha hoon Doctor Diary se. Kya Doctor Sahab se 2 minute baat ho sakti hai? Unki clinic ke liye specifically kuch share karna tha.",
          },
          {
            speaker: "them",
            text: "Kya kaam hai?",
          },
          {
            speaker: "you",
            text: "Ji dekho — hum doctors ke liye ek system laaye hain jisse unki clinic ki appointments automatically manage hoti hain, patients ko WhatsApp reminders jaate hain, aur unki apni website bhi milti hai. Maine dekha aapki clinic [Google/directory] pe hai — toh socha personally share karun. Doctor Sahab available hain thodi der ke liye?",
          },
          {
            speaker: "note",
            text: "'Maine dekha aapki clinic pe' — ye personalization important hai. Generic call nahi laga, research ki hai.",
          },
        ],
      },
      {
        type: "heading",
        title: "The Empathy Bridge — Reception ko Apna Banao",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Ek baat puchhu — aap yahaan appointments manually handle karti hain na? Phone pe, register mein?",
          },
          {
            speaker: "them",
            text: "Haan...",
          },
          {
            speaker: "you",
            text: "Toh aapko pata hoga kitna hectic ho jaata hai — ek saath calls, patients waiting, doctor ke instructions bhi — sab aap pe. Doctor Diary exactly isi problem ko solve karta hai. Aapka kaam easy ho jaata hai — system automatically reminders bhejta hai, patients online book karte hain, aapko baar baar phone nahi uthana padta. Ek baar doctor sahab dekhein toh bahut khush ho jayenge. Aap help kar sakti hain unhe connect karwane mein?",
          },
          {
            speaker: "tip",
            text: "Ye technique kaam karti hai kyunki aapne receptionist ka dard acknowledge kiya. Ab woh aapki ally hai.",
          },
        ],
      },
      {
        type: "heading",
        title: "\"Doctor Busy Hain\" — Best Counter",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "them",
            text: "Doctor abhi patients dekh rahe hain.",
          },
          {
            speaker: "you",
            text: "Bilkul — main samajh sakta hoon. Aap ek kaam karo — doctor sahab ko bata dena ki Doctor Diary ki taraf se call aaya tha. Ye specifically unki clinic ki appointments aur no-show problem ke baare mein hai. Kab ka time sahi rahega — subah ya shaam ka?",
          },
          {
            speaker: "note",
            text: "ALWAYS give two options — 'Subah ya shaam?' Open-ended 'kab?' bologe toh answer hoga 'baad mein' — endless loop.",
          },
        ],
      },
      {
        type: "heading",
        title: "Getting Doctor's WhatsApp Number",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Ek request thi — doctor sahab ka WhatsApp number milega kya? Main unhe ek demo video aur clinic-specific information bhej sakta hoon. Unke apne time mein dekh lenge — unka koi time waste nahi hoga.",
          },
        ],
      },
      {
        type: "heading",
        title: "Common Reception Rejections & Counters",
      },
      {
        type: "objection-list",
        objections: [
          {
            objection: "\"Hume kuch nahi chahiye, sab theek hai\"",
            counter:
              "\"Bilkul ji — doctor sahab satisfied hain toh achhi baat hai. Main sirf 2 minute ka time chahta hoon — specifically unhe batana chahta hoon ki hamare system se no-show patients kitne kam hote hain. Ye dekhna useful hoga. Doctor kab free hote hain usually?\"",
          },
          {
            objection: "\"Pehle email karo\"",
            context: "Sirf dismiss karne ka excuse hai",
            counter:
              "\"Bilkul bhej dunga! Doctor sahab ka email milega? Aur WhatsApp pe bhi ek demo video bhejna chahta hoon — zyada convenient hoga. WhatsApp number de sakti hain?\"",
          },
          {
            objection: "\"Hum already kisi software pe hain\"",
            counter:
              "\"Woh software se kya kaam hota hai unka? [Sunno] Okay — aur usse kya patients khud online book kar sakte hain? Auto WhatsApp reminders jaate hain? Aapki khud ki website milti hai? Agar nahi, toh main exactly woh gap fill karne aaya hoon. Doctor se 5 minute milenge?\"",
          },
          {
            objection: "\"Doctor ne mana kiya hai aise calls ke liye\"",
            counter:
              "\"Perfectly samajh sakta hoon — main genuinely Doctor ki time waste nahi karna chahta. Bas doctor sahab ko bata dena ki kisi ne call kiya tha — clinic ki no-show problem aur appointment system ke baare mein. Unhe decide karne dena. Main kal subah try karunga. Aapka naam kya hai ji?\"",
          },
        ],
      },
      {
        type: "heading",
        title: "Appointment Set — Closing the Call",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Perfect — toh main [day] ko [time] pe aata hoon. Doctor sahab ka poora naam kya hai? Aur clinic ka address confirm kar dena. Bahut shukriya [Name] ji — aap bahut helpful hain!",
          },
          {
            speaker: "note",
            text: "Receptionist ka naam le ke thank you kaho — personalization matter karta hai. Woh aapka advocate ban sakti hai jab aap clinic aaoge.",
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 4 — COLD CALL: DOCTOR
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "call-doctor",
    title: "Call Script — Doctor Uthaye",
    emoji: "👨‍⚕️",
    tagline: "Doctor directly phone uthaye — har second counts, waste mat karo",
    readTime: "12 min",
    color: "indigo",
    blocks: [
      {
        type: "highlight",
        text: "Doctor ka time SACRED hai. Agar pehle 15 seconds mein value deliver nahi ki toh phone rakh dega. No fluff, no long intro — straight to value with respect.",
      },
      {
        type: "heading",
        title: "STEP 1: Research Before Calling (Non-Negotiable)",
      },
      {
        type: "checklist",
        title: "Pehle ye check karo — phir call karo:",
        items: [
          "Clinic ka naam kya hai?",
          "Doctor ki specialty kya hai?",
          "Kya unki website hai? Bookable hai?",
          "Kya woh Google/Facebook/Instagram ads run karte hain?",
          "Kya woh Practo/JustDial pe listed hain?",
          "Unke Google reviews kitne hain? Rating?",
          "Instagram/Facebook pe active hain? Kitne followers?",
        ],
      },
      {
        type: "tip-box",
        text: "Research karne ke baad tumhara opening line automatically relevant ho jaata hai. 'Maine dekha aap Facebook pe active hain' vs generic 'main Doctor Diary se bol raha hoon' — fark samajhte ho?",
      },
      {
        type: "heading",
        title: "Opening Script — Permission-Based",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "them",
            text: "Hello?",
          },
          {
            speaker: "you",
            text: "Namaskar Doctor sahab! Main [Naam] bol raha hoon — Doctor Diary se. Kya 30 second aapka le sakta hoon?",
          },
          {
            speaker: "note",
            text: "'30 second le sakta hoon?' — Doctor 'na' bolne ke liye phone nahi kaat ta because it feels rude to deny 30 seconds.",
          },
          {
            speaker: "them",
            text: "Haan, bolo jaldi.",
          },
          {
            speaker: "you",
            text: "[NOW USE THE RIGHT VERSION BASED ON YOUR RESEARCH — see below]",
          },
        ],
      },
      {
        type: "heading",
        title: "VERSION A — Doctor runs ads (MOST POWERFUL opener)",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — maine dekha aap Google/Facebook pe ads run kar rahe hain. Smart move! Ek quick question — jo patients ads pe click karte hain, woh appointment book karne ke liye aapko call karte hain ya directly book kar sakte hain? [Pause for answer] Exactly — wahi gap hum fill karte hain. Ads ka poora ROI tab milta hai jab click se seedhi booking ho. Doctor Diary woh exactly karta hai. 10 minute milenge demo ke liye?",
          },
          {
            speaker: "tip",
            text: "This opener works because: (1) You've done research = respect earned, (2) You're adding to their existing investment, not replacing it, (3) The gap question makes them realize the problem themselves.",
          },
        ],
      },
      {
        type: "heading",
        title: "VERSION B — Doctor has website but no booking",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — aapki website dekhi, bahut professional hai! Ek cheez notice ki — kya patients abhi website se directly appointment book kar sakte hain? [Usually: Nahi] Toh website traffic waste ho rahi hai. Log aate hain, dekhte hain, aur chale jaate hain — call nahi karte. Doctor Diary aapki website ko fully bookable bana deta hai — visitor seedha patient ban jaata hai. 10 minute demo mein dikhata hoon?",
          },
        ],
      },
      {
        type: "heading",
        title: "VERSION C — Doctor active on Instagram/Social Media",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — Instagram pe aapke [X] followers hain, bahut active page hai! Ek gap notice kiya — kya followers directly aapke paas appointment book kar sakte hain Instagram se? Abhi toh unhe phone karna padta hai ya DM karna padta hai. Doctor Diary ek direct booking link deta hai — bio mein lagao aur followers seedha aapki clinic mein appointment book kar lete hain. Social media traffic fully convert ho jaata hai. 10 minute?",
          },
        ],
      },
      {
        type: "heading",
        title: "VERSION D — Generic (jab kuch nahi pata)",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — aapki clinic mein jo patients no-show karte hain, jo manually calls handle hoti hain — ye sab automatically ho sakta hai. Automatic booking, WhatsApp reminders, digital prescription — aur ye sab aapki khud ki clinic website pe, koi Practo commission nahi. Ek 10-minute demo mein sab dikhata hoon. Kab sahi rahega?",
          },
        ],
      },
      {
        type: "heading",
        title: "Pain Probe — Problem Seedha Poochho",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — ek quick question. Abhi appointments kaise manage hoti hain? Phone pe ya koi system hai?",
          },
          {
            speaker: "them",
            text: "Phone pe hi — receptionist handle karti hai.",
          },
          {
            speaker: "you",
            text: "Aur no-shows hote hain? Patients appointment le ke nahi aate?",
          },
          {
            speaker: "them",
            text: "Haan, hota hai.",
          },
          {
            speaker: "you",
            text: "Ek mahine mein roughly kitne? [Sunno] Aur consultation fee roughly? [Sunno] Toh [X × fee] ka monthly loss sirf no-shows se. Doctor Diary ke auto-reminders se ye 60% recover hota hai. Ek baar practically dikhata hoon?",
          },
          {
            speaker: "note",
            text: "Pain probe ke baad solution bolna zyada effective hai. Doctor feel karta hai tu samjha, sirf pitch nahi kiya.",
          },
        ],
      },
      {
        type: "heading",
        title: "Closing the Call — Concrete Options Do",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — ek 10-minute demo. Ya aapki clinic pe aa sakta hoon ya online Google Meet pe. Kaunsa easy hoga? Aur time — kal subah 10 baje ya shaam 6 baje?",
          },
          {
            speaker: "note",
            text: "4 options give kiye — in-person or online, AND two times. Doctor sirf ek choose karta hai. Never ask 'kab milein?' — answer always hoga 'baad mein'.",
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 5 — WHATSAPP SCRIPTS
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "whatsapp",
    title: "WhatsApp Scripts",
    emoji: "💬",
    tagline: "Copy-paste ready templates — har situation ke liye, personalized",
    readTime: "10 min",
    color: "green",
    blocks: [
      {
        type: "highlight",
        text: "WhatsApp = Most effective follow-up channel. Doctor log emails ignore karte hain, calls miss karte hain — but WhatsApp almost ALWAYS read hota hai within 2-3 hours. Best time: 9-10 AM or 7-9 PM.",
      },
      {
        type: "tip-box",
        text: "PERSONALIZE every message: Doctor ka naam, clinic ka naam, city ka naam, aur agar pata hai toh unka specific situation (ads, website, Practo). Generic message = ignored message.",
      },
      {
        type: "heading",
        title: "Template 1 — Doctor Runs Ads (Best Opener)",
      },
      {
        type: "whatsapp-template",
        templateLabel: "Doctor Runs Ads — Opening Message",
        templateText: `Namaskar Dr. [Name] Ji! 🙏

Main [Aapka Naam] hoon — Doctor Diary se.

Aapke [Google/Facebook] ads dekhe — clearly growth-focused approach hai aapki!

Ek observation share karna chahta tha:
Ads se patients aate hain → Click karte hain → Phir kya? 
Agar koi direct booking link nahi hai toh 60%+ traffic call avoid karta hai aur bounce ho jaata hai.

Doctor Diary exactly ye problem solve karta hai:
→ Ad se seedhi online booking
→ Auto WhatsApp reminders (no-shows 60% kam)
→ Aapki apni clinic website (0% commission)

Aapके ads ki ROI 2x ho sakti hai.

Kya 10-minute demo ho sakta hai?
[Aapka Naam] | Doctor Diary`,
      },
      {
        type: "heading",
        title: "Template 2 — Doctor Has Website (No Booking)",
      },
      {
        type: "whatsapp-template",
        templateLabel: "Has Website — No Booking System",
        templateText: `Namaskar Dr. [Name] Ji! 🙏

Main [Aapka Naam] — Doctor Diary se.

Aapki website [website URL] dekhi — bahut professional presentation hai!

Ek gap notice kiya jo directly revenue affect karta hai:
Website pe visitors aate hain → Book nahi kar sakte → Bounce ho jaate hain.

India mein 70% patients phone call avoid karte hain — agar direct booking nahi hai, toh woh competitor ke paas chale jaate hain.

Doctor Diary aapki clinic ke liye deta hai:
✅ Website pe direct booking button
✅ Auto WhatsApp reminders
✅ Live queue system
✅ Digital prescription
✅ 0% commission — sirf aapki clinic

10 minute ka demo — aapke liye specifically website integration dikhata hoon?

[Aapka Naam] | Doctor Diary`,
      },
      {
        type: "heading",
        title: "Template 3 — Active on Social Media",
      },
      {
        type: "whatsapp-template",
        templateLabel: "Social Media Active Doctor",
        templateText: `Namaskar Dr. [Name] Ji! 🙏

[Aapka Naam] here — Doctor Diary se.

Instagram pe aapka content dekha — bahut valuable health education share karte hain aap!

Ek observation: [X] followers hain aapke — but kya woh directly aapke paas appointment book kar sakte hain Instagram se?

Abhi jo traffic aata hai woh ya toh DM karta hai ya forget kar deta hai.

Doctor Diary se:
📲 Bio mein ek link → Direct clinic booking
🔔 Auto-confirmation aur reminder automatically
📱 Patient ka experience seamless

Aapki social media mehnat directly patients mein convert ho jayegi.

Demo ke liye 10 minute denge?
[Aapka Naam] | Doctor Diary`,
      },
      {
        type: "heading",
        title: "Template 4 — Listed on Practo (Commission Pain)",
      },
      {
        type: "whatsapp-template",
        templateLabel: "Practo Listed Doctor",
        templateText: `Namaskar Dr. [Name] Ji! 🙏

Main [Aapka Naam] — Doctor Diary se.

Aap Practo pe listed hain — dekha. Samjha ki woh initial visibility ke liye useful hota hai.

Lekin ek concern share karna chahta tha:
• Practo pe aapke patient competitors bhi dekhte hain
• Commission per booking jaata hai
• Patient data Practo ka hai, aapka nahi

Doctor Diary mein:
✅ Aapka apna booking system — 0% commission
✅ Patient sirf AAPKO dekhta hai
✅ Patient data 100% aapka
✅ Aapki khud ki clinic website

Practo hatane ki zaroorat nahi — sirf ek parallel system jo aapka khud ka ho.

10 minute ka demo?
[Aapka Naam] | Doctor Diary`,
      },
      {
        type: "heading",
        title: "Template 5 — Follow-up Day 1 (No Reply)",
      },
      {
        type: "whatsapp-template",
        templateLabel: "Follow-up — Day 1",
        templateText: `Doctor Sahab, good evening! 🙏

Subah message kiya tha Doctor Diary ke baare mein — samjha aapka schedule bahut tight hoga.

Ek quick question bas: Clinic mein abhi sabse bada operational pain kya hai?
→ No-shows?
→ Missed calls aur missed bookings?
→ Staff dependency (receptionist absent toh sab ruk jaata hai)?
→ Patients online nahi dhoondh pa rahe?

Jo bhi hai — humne exactly wahi solve kiya hai. Reply karein, directly uss cheez ke baare mein baat karte hain.

[Aapka Naam] | Doctor Diary`,
      },
      {
        type: "heading",
        title: "Template 6 — Follow-up Day 3 (Still No Reply — Story)",
      },
      {
        type: "whatsapp-template",
        templateLabel: "Follow-up Day 3 — Success Story",
        templateText: `Doctor Sahab namaskar! 🙏

[Aapka Naam] here from Doctor Diary — last message, promise!

Ye share karna tha: [Aapke city] ke Dr. [Similar Specialty] ne last month Doctor Diary start kiya.

Pehle mahine ke results:
📉 No-shows: 61% reduction
💰 Recovered revenue: ₹38,000 extra
⏱️ Reception calls: 40% kam
⭐ Google reviews: 4.2 → 4.6

Aur woh already [platform] pe ads/social media use kar rahe the — Doctor Diary ne unka existing setup 3x effective bana diya.

Aapki situation similar lagti hai. Kya ek call ho sakti hai? 10 min?

[Aapka Naam] | [Your Number]`,
      },
      {
        type: "heading",
        title: "Template 7 — Demo Confirmed — Reminder",
      },
      {
        type: "whatsapp-template",
        templateLabel: "Demo Reminder — Day Before",
        templateText: `Namaskar Doctor Sahab! 🙏

Kal [Day], [Time] pe demo confirm hai — reminder de raha tha.

Main [Clinic Address] pe aaunga.

Confirm kar sakte hain ki time still sahi hai? Agar koi change ho toh bata dena — main adjust kar lunga.

Kal ke demo ke liye maine specifically aapke liye:
✅ [Specialty] clinic ka live demo setup taiyaar kiya
✅ [City] ke similar doctor ki case study
✅ Aapki website/ads ke saath integration plan (agar applicable)

Bahut eager hoon milne ke liye! 🙏
[Aapka Naam] | Doctor Diary`,
      },
      {
        type: "heading",
        title: "Template 8 — Post-Demo Follow-up",
      },
      {
        type: "whatsapp-template",
        templateLabel: "Post-Demo — Next Day",
        templateText: `Namaskar Doctor Sahab! 🙏

Kal demo ke liye time nikala — bahut shukriya!

Aapke liye specifically kuch taiyaar kiya:
→ [Clinic Name] ke naam se complete setup
→ [Specialty] ke liye optimized patient flow
→ [Ads/Website/Social] integration roadmap

Ek quick question: Kaun sa feature sabse useful laga?
1️⃣ Online Booking (24/7, no calls)
2️⃣ Auto WhatsApp Reminders (no-shows ka solution)  
3️⃣ Apni Clinic Website (Practo se azaadi)
4️⃣ [Ads/Social] Integration

Aage badhne ke liye ready hain? Setup mein 48 hours lagte hain. 🙏
[Aapka Naam]`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 6 — SOCIAL MEDIA DMs
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "social-media",
    title: "Social Media DM Scripts",
    emoji: "📲",
    tagline: "Instagram, LinkedIn, Facebook — har platform pe alag smart approach",
    readTime: "8 min",
    color: "pink",
    blocks: [
      {
        type: "highlight",
        text: "Social media DMs = Least competition channel. Most salespeople don't try here. Doctor ka Instagram DM almost empty hai — teri message stand out karegi automatically.",
      },
      {
        type: "heading",
        title: "Instagram DM Strategy",
      },
      {
        type: "tip-box",
        text: "Pehle doctor ki 2-3 recent posts pe genuine comment karo. Phir 24 hours baad DM karo. Warm approach = higher open rate. Cold DM without engagement = usually ignored.",
      },
      {
        type: "whatsapp-template",
        templateLabel: "Instagram DM — First Message",
        templateText: `Hi Dr. [Name]! 👋

Aapki [recent post topic] post bahut helpful thi — genuinely!

Main [Naam] hoon, Doctor Diary se. Aapko disturb karna nahi tha but ye relevant laga:

Aapke [X] followers hain — ye incredible hai. Lekin abhi woh followers → patients kaise bante hain? Phone karte hain? DM? Bahut friction hai.

Doctor Diary se ek booking link Bio mein — follower directly appointment book kar leta hai. Koi call nahi, koi DM nahi.

Aapki social media mehnat directly revenue mein convert ho sakti hai.

10-min call? 🙏`,
      },
      {
        type: "heading",
        title: "LinkedIn Message — Specialist/Senior Doctors",
      },
      {
        type: "whatsapp-template",
        templateLabel: "LinkedIn — Professional Approach",
        templateText: `Hello Dr. [Name],

I came across your profile — impressive work in [Specialty]!

I'm [Name] from Doctor Diary. We help independent practitioners turn their existing digital presence (website, ads, social media) into a fully automated patient acquisition and retention system.

Most doctors I speak with are already doing the right things — running ads, maintaining social media, having a website — but the conversion layer is missing. Patients see, but can't easily book.

We solve exactly that — and have done so for 50+ clinics in [City].

Would you be open to a 15-minute call to explore fit?

Best,
[Name] | Doctor Diary`,
      },
      {
        type: "heading",
        title: "Facebook — Individual DM (after group interaction)",
      },
      {
        type: "whatsapp-template",
        templateLabel: "Facebook — Individual DM",
        templateText: `Namaskar Doctor Sahab! 🙏

[Group Name] group mein aapki post padhi — [City] mein practice hai aapki?

Main [Naam] hoon, Doctor Diary se. [City] mein specifically expand kar rahe hain aur [Specialty] doctors ke saath kaam karna chahte hain.

Ek quick question — aapki clinic mein kya online booking available hai abhi?

Agar nahi, toh 5-minute WhatsApp call pe explain karta hoon kaise aapki existing setup (website/social media) ke saath integrate hota hai Doctor Diary.

Time milega? 🙏`,
      },
      {
        type: "heading",
        title: "JustDial/Practo Listed Doctors",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "note",
            text: "In platforms pe listed doctors ka pain point: competitors ke paas dikhte hain, commission dete hain, khud brand nahi bana paate. Isi angle se approach karo.",
          },
          {
            speaker: "you",
            text: "Doctor Sahab — Practo pe listed hain aap. Samjha wahan visibility ke liye useful hota hai. Lekin ek cheez notice ki — Practo pe aapke patient competitors bhi dekhte hain, aur woh 15-20% commission bhi lete hain. Doctor Diary pe aapka patient sirf aapki clinic dekhega, aur koi commission nahi. Ek baar side-by-side compare karke dikhaun?",
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 7 — SITUATIONAL SELLING
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "situational",
    title: "Situational Selling — Jo Unke Paas Hai Usi Se Sell Karo",
    emoji: "🎭",
    tagline: "Doctor ki existing setup ko weakness nahi, tumhara weapon banao",
    readTime: "15 min",
    color: "orange",
    blocks: [
      {
        type: "highlight",
        text: "MASTER KEY: Doctor jo bhi bol raha hai — 'hum ads run karte hain', 'website hai', 'social media pe active hain' — ye SABB Doctor Diary ke liye PLUS points hain. Teri job hai explain karna ki Doctor Diary IN SABB ko better banata hai.",
      },
      {
        type: "heading",
        title: "SITUATION 1 — \"Hum Already Ads Run Kar Rahe Hain\" 🔥",
      },
      {
        type: "tip-box",
        text: "Ye doctor GOLD lead hai. Woh already marketing mein invest kar raha hai. Woh growth-oriented hai. Woh decision maker hai. Sirf sahi angle chahiye.",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "them",
            text: "Hum already Google Ads aur Facebook Ads run kar rahe hain — patients aa rahe hain.",
          },
          {
            speaker: "you",
            text: "Doctor sahab — ye BAHUT achhi baat hai! Aap already invest kar rahe ho growth mein — samajhdaar decision. Mera ek observation hai — aur ye genuinely aapke ad budget ka ROI improve karega. Patients jo ad pe click karte hain — woh next kya karte hain? Call karte hain clinic pe?",
          },
          {
            speaker: "them",
            text: "Haan, phone karna padta hai.",
          },
          {
            speaker: "you",
            text: "Exactly. Aur statistics ye hai: India mein 65-70% patients — especially young patients jo Google pe search karte hain — phone call avoid karte hain. Woh call nahi karte, woh dusra option dhoondh lete hain jahan directly book ho sake. Matlab aapke ad clicks mein se 40-60% traffic actually convert nahi ho raha. Aap ₹[unka ad budget] spend kar rahe ho — aur almost aadha waste ja raha hai kyunki booking ka step easy nahi hai. Doctor Diary ek direct 'Book Now' link deta hai jo ad ke saath attach hota hai. Patient click karta hai → seedha book karta hai → auto-reminder jaata hai → actually aata hai. Aapke SAME ad budget se double patients. Ye dikhana chahta hoon — 10 minute?",
          },
          {
            speaker: "tip",
            text: "KEY INSIGHT to memorize: Ads = traffic. Doctor Diary = conversion. Bina Doctor Diary ke, ad budget ka 40-60% waste. Doctor Diary ads ka replacement nahi — ads ka MULTIPLIER hai.",
          },
        ],
      },
      {
        type: "heading",
        title: "SITUATION 2 — \"Humare Paas Website Hai\"",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "them",
            text: "Hum already website pe hain — [website naam].",
          },
          {
            speaker: "you",
            text: "Bilkul — website honi chahiye. Ek quick question Doctor sahab — abhi website pe patient directly appointment book kar sakta hai? [Yes/No] Aur live queue dekh sakta hai? Aur digital prescription directly phone pe milti hai visit ke baad?",
          },
          {
            speaker: "them",
            text: "Nahi, ye features nahi hain.",
          },
          {
            speaker: "you",
            text: "Toh abhi website ek digital brochure hai — information deta hai but kaam nahi karta. Patient aata hai, padhta hai, aur phir phone karna padta hai. 70% log woh call nahi karte — woh chale jaate hain. Doctor Diary aapki existing website ka replacement nahi hai — hum ek dedicated clinic.doctordiary.in/[your-name] page dete hain jo fully functional hai. Bookable, live queue, reminders, prescription — sab. Aapki static website + humara smart system = complete digital presence.",
          },
          {
            speaker: "note",
            text: "NEVER insult their website. 'Good foundation, let's make it work' approach. Not 'your website is useless'.",
          },
        ],
      },
      {
        type: "heading",
        title: "SITUATION 3 — \"Hum Social Media Pe Bahut Active Hain\"",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "them",
            text: "Hum Instagram aur Facebook pe bahut active hain — patients engage karte hain.",
          },
          {
            speaker: "you",
            text: "Doctor sahab — ye FANTASTIC hai! Social media presence aaj ke time mein bahut powerful hai. Ek gap point karna chahta hoon jo directly aapki social media mehnat ka return affect karta hai. Abhi ek follower jo aapki post dekhta hai aur appointment lena chahta hai — woh kya karta hai?",
          },
          {
            speaker: "them",
            text: "DM karte hain ya phone number pe call karte hain.",
          },
          {
            speaker: "you",
            text: "Exactly. DM ka jawab dena padta hai — usually manually. Call karna padta hai. Bahut friction hai. 80% log woh effort nahi karte. Doctor Diary se aapko ek dedicated booking link milta hai — Instagram bio mein, Facebook page pe — patient seedha click kare, choose kare slot, book ho jaaye. No DM, no call needed. Aapki [X] followers ki social media following directly patients mein convert hone lagegi. Social media aapka sabse powerful patient acquisition channel ban jaayega.",
          },
        ],
      },
      {
        type: "heading",
        title: "SITUATION 4 — \"Receptionist Sab Handle Karti Hai\" (Hidden Risk Approach)",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "them",
            text: "Meri receptionist bahut efficient hai — woh sab manage karti hai.",
          },
          {
            speaker: "you",
            text: "Doctor sahab — ye bahut achha hai ki ek reliable person hai. Ek practical question — last baar jab receptionist chutti pe thi ya beemar thi, us din clinic mein kya hua? Appointments miss hui? Patients confused the?",
          },
          {
            speaker: "them",
            text: "[Usually: Haan, kuch issues hue]",
          },
          {
            speaker: "you",
            text: "Exactly — ye single point of failure hai. Ek banda beemar = poori clinic affected. Doctor Diary ek parallel system hai — receptionist ke saath kaam karta hai, uske against nahi. Jab woh available hai, woh easily manage kar sakti hai. Jab nahi hai — system automatically chal raha hai. Patients book kar rahe hain, reminders ja rahe hain — clinic band nahi hoti. Aur receptionist ka kaam bhi actually easy ho jaata hai — 40% calls automatically handle ho jaate hain.",
          },
        ],
      },
      {
        type: "heading",
        title: "SITUATION 5 — \"Humara Khud Ka Software/EMR Hai\"",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "them",
            text: "Hum already [Clinic Software Name] use kar rahe hain.",
          },
          {
            speaker: "you",
            text: "Achha — [Software Name] use karte hain! Kya woh software patients ko WhatsApp pe automatically remind karta hai appointments ke liye? Kya patients us software se apne phone pe 24/7 appointment book kar sakte hain? Kya aapko clinic ki dedicated website milti hai usse? Kya Google pe aapki reviews automatically collect hoti hain?",
          },
          {
            speaker: "them",
            text: "[Usually some features missing]",
          },
          {
            speaker: "you",
            text: "Doctor sahab — woh software aapka INTERNAL tool hai — records manage karta hai, billing karta hai. Doctor Diary EXTERNAL facing system hai — patient-side: discovery, booking, reminders, reviews. Dono alag cheezein hain aur dono saath chal sakte hain. Woh software aapki clinic ko efficiently run karta hai — Doctor Diary patients ko efficiently acquire karta hai. Ek demo mein specifically dikhata hoon ye kaise complement karte hain.",
          },
        ],
      },
      {
        type: "heading",
        title: "SITUATION 6 — \"Patients Toh Walk-In Hain, Booking Nahi Chahiye\"",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "them",
            text: "Mere paas patients ki kami nahi — walk-in aate hain, booking ki zaroorat nahi.",
          },
          {
            speaker: "you",
            text: "Doctor sahab — ye toh bahut achhi baat hai! Strong word-of-mouth aur reputation hai aapki. Lekin ek angle sochaiye — walk-in clinic mein waiting room mein 20-30 patients baithe hain — unka experience kaisa hota hai? 2-3 ghante wait karke irritated ho jaate hain. Unhappy experience = less likely to refer, less likely to review. Doctor Diary ka Live Queue system — patient ghar se dekh sakta hai ki woh number 15 pe hain. Woh 30 minute pehle aata hai, fresh aata hai, happy aata hai. Same doctor, same clinic — better patient experience. Aur jab koi naya patient Google pe doctor search kare, aapki 4.8 star rating + online booking wala clinic pehle dikhega. Walk-in band nahi hote — naye patients bhi aane lagte hain.",
          },
        ],
      },
      {
        type: "heading",
        title: "SITUATION 7 — \"Sirf Booking Ke Liye Itna Kharcha?\"",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "them",
            text: "Ek booking app ke liye itna invest karna? Sirf toh appointment book hota hai na isse.",
          },
          {
            speaker: "you",
            text: "Doctor sahab — ye sab se common misconception hai jise main clear karna chahta hoon. Doctor Diary sirf booking app NAHI hai. Ye aapki clinic ka poora digital operating system hai. Socha aise karo — ek patient ka journey: Google pe search karta hai → aapki clinic website dikhti hai → book karta hai → reminder paata hai → queue mein apni position dekhta hai → consultation ke baad digital prescription milti hai → automatically review request aata hai → woh review deta hai → next appointment ke liye reminder aata hai. Ye POORA CYCLE Doctor Diary automate karta hai. Booking sirf ek step hai — aur woh step ek revenue recovery machine hai jo no-shows se har mahine ₹30,000-50,000 bachata hai. Ye booking app nahi — ye aapki clinic ka ROI machine hai.",
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 8 — OBJECTION HANDLING
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "objections",
    title: "Objection Handling — Baki Sab",
    emoji: "⚡",
    tagline: "Har 'na' ka jawab — jo Chapter 7 mein cover nahi hua",
    readTime: "12 min",
    color: "red",
    blocks: [
      {
        type: "highlight",
        text: "Objection = Interest ka signal. Agar doctor genuinely care na karta toh woh phone rakh deta. Objection matlab woh soch raha hai. Teri job: sahi direction mein sochne mein help karna.",
      },
      {
        type: "objection-list",
        objections: [
          {
            objection: "\"Bahut mehenga lagta hai\" / \"Budget nahi hai\"",
            context: "Most common objection — almost always about perceived value, not actual budget",
            counter:
              "\"Doctor sahab — ek calculation karte hain aapke apne numbers se. Monthly kitne patients dekhte ho? [X]. Consultation fee? [₹Y]. 10% no-show bhi ho toh ₹[X × Y × 22 × 0.1] monthly waste. Doctor Diary cost uss waste se kitna chhota hai? Software khud apna paisa nikaal deta hai pehle mahine mein. Ye kharcha nahi, ye recovery hai.\"",
            followUp: "Agar phir bhi resist kare: 'Trial period mein try karo — pehle result dekho, phir decide karo.'",
          },
          {
            objection: "\"Sab theek chal raha hai, koi problem nahi\"",
            counter:
              "\"Bilkul — satisfied rehna achha hai. Sirf ek question: Mahine mein roughly kitne no-shows hote hain? [Sunno] Aur ye kitne patients aapke competitor ke paas jaate hain Google pe dhoondh ke? Hum 'problem fix' nahi karte — hum 'already good ko great' banate hain. Ek demo mein dikhata hoon specifically aapki clinic ke liye kya improve ho sakta hai.\"",
          },
          {
            objection: "\"Mera staff nahi seekh payega\"",
            counter:
              "\"Doctor sahab — ye genuine concern hai. Ek fact: Agar aapki receptionist WhatsApp use kar sakti hai, woh Doctor Diary use kar sakti hai. Interface exactly utna hi simple hai. Aur setup mein main personally aata hoon — receptionist ko ek ghante mein train kar dunga. Agar koi bhi issue aaye toh 24/7 support. Complication kam karta hai, zyada nahi.\"",
          },
          {
            objection: "\"Ek baar soch ke batata hoon\"",
            context: "Ye polite 'no' ya real hesitation ho sakta hai — pata lagao",
            counter:
              "\"Doctor sahab — bilkul, time lena chahiye. Ek help karein: Specifically kya soch rahe hain? Price hai, ya feature hai, ya timing? Main abhi clear kar sakta hoon toh aapka soochna ka time bachega.\" [Agar vague remain kare]: \"Toh ek kaam — kya Saturday ko ek 5-minute call ho sakti hai? Main tab bhi available hoon final questions ke liye.\"",
          },
          {
            objection: "\"Pehle try kiya tha kisi aur software se — kaam nahi aya\"",
            counter:
              "\"Doctor sahab — bahut common experience hai, genuinely. Bahut software complicated hote hain. Isliye main pehle ek cheez suggest karunga — bina kisi commitment ke, 10 minute demo dekho. Agar Doctor Diary bhi waise hi complicated laga — main khud kehta hoon 'right fit nahi hai.' But agar simple laga — toh ek baar try karne layak hai. Fair deal hai?\"",
          },
          {
            objection: "\"Mujhe partner/wife se poochna hai\"",
            counter:
              "\"Bilkul — family decision important hoti hai. Main kya karunga — ek PDF summary bhejta hoon jo clearly dikhata hai: kya milega, kitna cost, aur kya ROI. Aap easily share kar sakte ho. Aur main ek WhatsApp message bhi bhejta hoon — partner ko directly bhi explain kar sakta hoon agar zaroorat ho. Kab tak decision ho sakta hai roughly?\"",
          },
          {
            objection: "\"Abhi busy season hai, baad mein\"",
            counter:
              "\"Doctor sahab — busy season matlab zyada patients, zyada no-shows, zyada staff load. Exactly yahi time hai jab Doctor Diary sabse zyada help karta hai. Setup mein 48 hours lagte hain — ek baar live hone ke baad busy season smoother ho jaata hai. Agar busy season baad mein setup karein toh iss season ka benefit miss ho jaayega. Is week ek slot nikalte hain?\"",
          },
          {
            objection: "\"Online booking nahi chahiye — patients confused ho jaayenge\"",
            counter:
              "\"Doctor sahab — ye interesting point hai. Reality mein: Young patients (20-40 age group) online booking PREFER karte hain over calling. Senior patients jo call prefer karte hain — woh call karte rehenge, Doctor Diary unhe force nahi karta. Dono groups serve hote hain simultaneously. Aur jo patient online book karta hai usse automatic reminder bhi jaata hai — woh less likely to no-show hota hai. Confusion add nahi hoti — convenience add hoti hai jo patients appreciate karte hain.\"",
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 9 — IN-CLINIC DEMO
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "demo",
    title: "In-Clinic Demo Playbook",
    emoji: "🏥",
    tagline: "Doctor ke saamne ho — kya karo, kya dikhao, kaise close karo",
    readTime: "15 min",
    color: "teal",
    blocks: [
      {
        type: "highlight",
        text: "Demo = 70% sale. Agar demo sahi gaya toh close easy hai. Prepare karo, impress karo, close karo.",
      },
      {
        type: "heading",
        title: "Demo Se Pehle — 30 Minute Preparation (Mandatory)",
      },
      {
        type: "checklist",
        title: "Ye cheezein ready rakho:",
        items: [
          "Phone/Laptop fully charged — demo app logged in with test account",
          "Doctor ki specialty ke liye sample data pre-loaded",
          "Doctor ka naam, clinic naam system mein already setup",
          "Unki specific situation ke liye angle ready: Ads? Website? Social media? Practo?",
          "Same city ka similar doctor ka case study (numbers real honay chahiye)",
          "2 visiting cards + pricing sheet in pocket",
          "Notebook & pen — jab doctor kuch bole, immediately note karo",
        ],
      },
      {
        type: "heading",
        title: "Clinic Mein Enter Karna — Etiquette",
      },
      {
        type: "numbered-list",
        title: "",
        items: [
          "Reception pe politely bolo: 'Main [Naam] hoon Doctor Diary se — Doctor Sahab ne [time] ka appointment tha'",
          "Waiting room mein patiently baitho — phone pe kaam karo, impatient mat lago",
          "While waiting: Reception se clinic info collect karo — patients daily kitne, koi software use hota hai, etc.",
          "Jab doctor bulaye — walk in confidently, genuine smile, firm but not aggressive handshake",
          "Pehle 30 seconds: Doctor baat kare — tum sunne ki position mein raho",
        ],
      },
      {
        type: "heading",
        title: "10-Minute Demo Script — Hook → Wow → Close",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "[0:00-1:00 — HOOK] Doctor sahab, thank you! Main directly start karta hoon — aapke time ka respect karta hoon. Ek quick question: [Choose based on their situation] Aap ads run karte ho — woh patients call karte hain book karne ke liye? / Website pe visitors aate hain — woh book kar sakte hain? / Mahine mein roughly kitne no-shows hote hain?",
          },
          {
            speaker: "note",
            text: "Hook question ek specific pain point reveal karta hai. STOP aur sunno unka answer. Ye answer demo ka center point ban jaayega.",
          },
          {
            speaker: "you",
            text: "[2:00-7:00 — WOW] Exactly — wahi gap main dikhata hoon. [Screen share start] Ye dekho — ye [Clinic Name] ki booking page hai — main ne already setup kiya. Patient koi bhi slot select karta hai. Done. Automatic WhatsApp confirmation jaata hai — abhi. [Book a test appointment live] Ab dekho — 24 hours baad patient ko automatic reminder jayega — ye wala message [show]. Ab Live Queue — patient ghar se dekh sakta hai queue position. Waiting room congestion 40% tak kam hoti hai. Ab prescription — [show Rx pad] 30 seconds mein complete prescription patient ke WhatsApp pe. Aur ye — aapki dedicated clinic website — clinic.doctordiary.in/dr-[aapkanaam]. Google pe rank karta hai.",
          },
          {
            speaker: "tip",
            text: "During WOW: Pause after each feature aur watch doctor's face. 'Kaisa lag raha hai abhi tak?' — agar interest dikhey, slow down and elaborate. Agar distracted lagein, speed up aur close karo.",
          },
          {
            speaker: "you",
            text: "[7:00-10:00 — CLOSE] Doctor sahab — ye poora setup specifically aapki clinic ke liye taiyaar kiya. [Agar ads run karta hai]: Aapke ad traffic ka conversion rate ye system se 2x ho jaayega. [Agar website hai]: Aapki static website ke saath ye parallel smart system chal sakta hai. [Agar social media active hai]: Instagram/Facebook followers seedha is link se book kar sakte hain. [Always]: Setup mein 48 hours lagte hain. Kab start karein?",
          },
        ],
      },
      {
        type: "heading",
        title: "Buying Signals — Kaun Se Lagein?",
      },
      {
        type: "checklist",
        title: "🟢 GREEN — Doctor is ready:",
        items: [
          "'Ye toh bahut achha hai!' / 'Useful lagta hai'",
          "Aage jhuk ke screen dekhne laga",
          "Apni receptionist ko bulane laga",
          "'Aur kya features hain?' — actively asking",
          "'Ye kitne mein milega?' — Price poochha = intent confirmed",
          "Phone rakh diya (daytime mein doctor ka phone rakhna = full attention dena)",
        ],
      },
      {
        type: "warning-box",
        text: "🔴 RED Signals: Baar baar phone dekhna, monosyllabic 'haan/theek hai', interrupting to go see a patient. Agar red signals dikh rahe hain — demo short karo aur re-schedule karo jab actual time ho. 'Doctor sahab — lagta hai abhi busy time hai, main kal subah dubaara aata hoon specifically ek ghante ke liye.'",
      },
      {
        type: "heading",
        title: "Post-Demo Soft Close",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — setup ke liye kaunsa din aana sahi rahega? Main personally aata hoon, receptionist ko bhi train kar dunga — 2 ghante mein sab live ho jaata hai.",
          },
          {
            speaker: "note",
            text: "'Sign karo' mat bolo. 'Setup ke liye kaunsa din?' — ye assume karta hai yes. Doctor sirf day choose karta hai.",
          },
          {
            speaker: "them",
            text: "Thoda soch ke batata hoon.",
          },
          {
            speaker: "you",
            text: "Bilkul — main ek PDF bhejta hoon jo aaj humne dekha uski summary hai. Family se discuss karna ho toh easily share kar sakte ho. Aur ek last thing — hamare [City] mein slots limited hain is quarter. Agar is hafte confirm karein toh [offer/priority setup]. Saturday ko ek 5-minute call? Main available rahunga.",
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 10 — CLOSING TECHNIQUES
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "closing",
    title: "Closing Techniques",
    emoji: "🏆",
    tagline: "Deal seal karna — art hai, science hai, practice hai",
    readTime: "10 min",
    color: "amber",
    blocks: [
      {
        type: "highlight",
        text: "Most sales fail not because doctor said no — but because salesperson never clearly asked for the decision. ALWAYS ask. Worst answer is still a no, which is better than silence.",
      },
      {
        type: "heading",
        title: "Close #1 — The Soft Assumption Close",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — setup ke liye [Day 1] ya [Day 2] sahi rahega? Main specifically aapka time arrange karta hoon.",
          },
          {
            speaker: "note",
            text: "Yes/No nahi maangta — sirf day. Doctor naturally respond karta hai with a day OR a real objection. Both useful.",
          },
        ],
      },
      {
        type: "heading",
        title: "Close #2 — The ROI Math Close",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — apni hi calculation dekho. Mahine mein [X] no-shows × [₹Y fee] = [₹Z] waste. Doctor Diary cost hai [₹A/month]. Month 1 se positive ROI. Software khud apna paisa nikaalta hai. Kya itna straightforward decision lene mein hesitation hai?",
          },
        ],
      },
      {
        type: "heading",
        title: "Close #3 — The Amplifier Close (For Ads/Website/Social Doctors)",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — aap already [ads/website/social media] pe invest kar rahe ho. Main ek multiplier add kar raha hoon. Wahi invest jo kar rahe ho, uska return 2-3x ho jaayega Doctor Diary se. Kya ek baar try karna worthwhile nahi lagta?",
          },
        ],
      },
      {
        type: "heading",
        title: "Close #4 — The Trial Close",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — main samajh sakta hoon naya system try karna risky feel hota hai. Isliye — pehle start karo, results dekho. 30 din mein agar helpful nahi laga toh koi lock-in nahi. Main guarantee karta hoon — 30 dino mein aap khud dekhenge fark. Ek baar shuru karte hain?",
          },
        ],
      },
      {
        type: "heading",
        title: "Close #5 — The \"What Would It Take\" Close",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — honestly batao: Aaj haan bolne ke liye specifically kya chahiye? [STOP. Sunno completely.] [Then address only that specific concern directly]",
          },
          {
            speaker: "note",
            text: "Sabse powerful close. Doctor khud apna objection batata hai. Ab sirf woh specific cheez solve karo.",
          },
        ],
      },
      {
        type: "heading",
        title: "After YES — Next 48 Hours Protocol",
      },
      {
        type: "numbered-list",
        title: "",
        items: [
          "Immediately: Congratulate genuinely — warm, not over-the-top",
          "Same day: Welcome WhatsApp message bhejo (Template 8)",
          "Same day: CRM mein 'Converted' mark karo + manager inform karo",
          "Within 24 hours: Setup date confirm karo",
          "Within 48 hours: Onboarding karo — doctor aur receptionist dono",
          "Day 7: Check-in call — sab smooth? Koi confusion?",
          "Day 14: Stats share — appointments booked, reminders sent",
          "Day 30: ROI review — no-shows mein kitna fark? Revenue?",
          "Day 30: Review/testimonial maango",
          "Day 30: Referral maango — 'Doctor friend hai koi?'",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 11 — POST SALE
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "post-sale",
    title: "Post-Sale & Relationship",
    emoji: "🤝",
    tagline: "Sale ke baad asli game shuru hoti hai — retention aur referral",
    readTime: "8 min",
    color: "emerald",
    blocks: [
      {
        type: "highlight",
        text: "Ek happy doctor = 3-5 referrals. Ek unhappy doctor = 10 negative word-of-mouth. Post-sale relationship is your best sales tool.",
      },
      {
        type: "heading",
        title: "Onboarding — First 48 Hours Critical",
      },
      {
        type: "numbered-list",
        title: "",
        items: [
          "Day 0: Welcome message + account setup confirmation",
          "Day 1: Onboarding call — doctor ke saath 30 min walkthrough",
          "Day 1: Receptionist training — in-person ya video call, 1 hour",
          "Day 2: First patient books online — doctor ko celebrate karo ('Pehli online booking aa gayi!')",
          "Day 7: Check-in — koi issue? Koi confusion?",
          "Day 14: Stats summary bhejo — bookings, reminders, no-show comparison",
          "Day 30: ROI review call — numbers real hain, dikhao",
        ],
      },
      {
        type: "heading",
        title: "Testimonial Maangna — Day 30",
      },
      {
        type: "whatsapp-template",
        templateLabel: "Testimonial Request — Day 30",
        templateText: `Doctor Sahab, namaskar! 🙏

Ek mahina ho gaya Doctor Diary ke saath!

Results:
📅 [X] appointments online book hue
⏰ [Y] auto-reminders sent
📉 No-shows: [Z]% kam
💰 Estimated recovered revenue: ₹[Amount]

Aapka experience helpful raha toh ek chhota sa favor: Google pe ya humari website pe ek quick review likh sakte hain?

Link: [Review Link]

2 minute mein hota hai — aur isse aur doctors ko bhi sahi decision lene mein help milegi. 🙏

[Aapka Naam]`,
      },
      {
        type: "heading",
        title: "Referral — Best Time Day 30",
      },
      {
        type: "script",
        lines: [
          {
            speaker: "you",
            text: "Doctor sahab — bahut khushi hui ki Doctor Diary helpful raha! Ek quick request: Aapke koi doctor friend hain jo abhi manually manage kar rahe hain? Agar aap introduce karo toh main personally demo dunga. Aur agar woh join karte hain toh aapko bhi [referral benefit] milega. Win-win hai.",
          },
          {
            speaker: "note",
            text: "Referral bonus real aur specific hona chahiye — 'ek month free' or specific voucher. Vague promises = no action.",
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CHAPTER 12 — DAILY ROUTINE
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "daily-routine",
    title: "Top Performer ki Daily Routine",
    emoji: "⏰",
    tagline: "Kya karo subah 9 baje se — proven daily system",
    readTime: "6 min",
    color: "slate",
    blocks: [
      {
        type: "highlight",
        text: "Top performers don't work harder — they work with a system. Consistent daily routine = consistent pipeline = consistent conversions.",
      },
      {
        type: "heading",
        title: "5-Minute Morning Intel Routine (Before Any Call)",
      },
      {
        type: "numbered-list",
        title: "For each lead you'll call today:",
        items: [
          "Google unka naam + city → Website hai? Bookable?",
          "Google Ads check → Sponsored results mein hain?",
          "Instagram/Facebook search → Active? Followers?",
          "Practo/JustDial check → Listed? Commission de rahe hain?",
          "Note: 'Ads chala raha hai' / 'Website hai no booking' / 'Social active' — ye teri pitch hook hai",
        ],
      },
      {
        type: "heading",
        title: "Ideal Daily Schedule",
      },
      {
        type: "numbered-list",
        title: "",
        items: [
          "9:00-9:30 AM — CRM review + lead intel research (5 min per lead)",
          "9:30-11:00 AM — Power Call Block: 15-20 calls/WhatsApp (doctors available pre-OPD)",
          "11:00-1:00 PM — Field Visits: Clinic visits (mid-morning doctors slightly less busy)",
          "1:00-2:00 PM — Lunch + CRM update: Notes likhao fresh memory mein",
          "2:00-5:00 PM — Demo Block: Pre-booked demos attend karo",
          "5:00-6:00 PM — Follow-up: Unhone aaj response nahi diya — ping karo",
          "6:00-7:30 PM — Evening Calls: Doctors evening mein zyada available hote hain",
          "7:30-8:00 PM — Day Wrap: CRM update, kal ka plan, wins note karo",
        ],
      },
      {
        type: "heading",
        title: "Weekly Self-Review (Every Friday)",
      },
      {
        type: "checklist",
        title: "Friday Review Checklist:",
        items: [
          "Kitne new leads add kiye? Intel gather kiya?",
          "Kitne calls kiye? Kitne connect hue? Kitne ne research-based opener use kiya?",
          "Kitne demos? Kitne close hue?",
          "Sabse common objection — aur counter kaisa tha?",
          "Kaunsa 'already has X' situation sabse zyada mili is hafte?",
          "Ek call jis pe proud ho — kyun?",
          "Ek call jo miss hui — lesson?",
        ],
      },
      {
        type: "tip-box",
        text: "Daily minimum: 15 calls/messages + 2 demos = consistent pipeline. Pipeline dry hone mein 2 weeks, fill hone mein 4 weeks. Ek din bhi skip mat karo.",
      },
      {
        type: "warning-box",
        text: "Kab chhodna hai ek lead: 5+ touchpoints, zero response. Lead ko 'Cold — Revisit 3 months' mark karo. Energy naye leads mein lagao. Time = money.",
      },
    ],
  },
];

export const chapterMap = Object.fromEntries(
  chapters.map((c) => [c.slug, c])
);

export const colorMap: Record<string, Record<string, string>> = {
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-800",
    dot: "bg-purple-500",
  },
  teal: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-800",
    dot: "bg-teal-500",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    dot: "bg-blue-500",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    badge: "bg-green-100 text-green-800",
    dot: "bg-green-500",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-800",
    dot: "bg-indigo-500",
  },
  pink: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
    badge: "bg-pink-100 text-pink-800",
    dot: "bg-pink-500",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    badge: "bg-red-100 text-red-800",
    dot: "bg-red-500",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-800",
    dot: "bg-orange-500",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  slate: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-800",
    dot: "bg-slate-500",
  },
};
