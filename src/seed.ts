/**
 * Seed script: creates demo accounts (user + admin) and 12 yoga products.
 * Run with: npm run seed
 */
import dotenv from "dotenv";
dotenv.config();

import { client, db, connectDB } from "./lib/db.js";
import { auth } from "./lib/auth.js";
import { ProductDocument } from "./types/product.js";

const DEMO_USER = { name: "Maya Rahman", email: "user@yogaflow.com", password: "User@1234" };
const DEMO_ADMIN = { name: "Arif Hossain", email: "admin@yogaflow.com", password: "Admin@1234" };

async function ensureAccount(
  account: { name: string; email: string; password: string },
  role: "user" | "admin"
): Promise<string> {
  const users = db.collection("user");
  let existing = await users.findOne({ email: account.email });

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        name: account.name,
        email: account.email,
        password: account.password,
      },
    });
    existing = await users.findOne({ email: account.email });
  }

  if (!existing) throw new Error(`Failed to create account ${account.email}`);

  await users.updateOne(
    { _id: existing._id },
    { $set: { role, emailVerified: true } }
  );
  console.log(`✅ Account ready: ${account.email} (${role})`);
  return existing._id.toString();
}

function buildProducts(adminId: string, adminName: string): ProductDocument[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const base = (offsetDays: number) => new Date(now - offsetDays * day);

  return [
    {
      title: "EcoGrip Pro Yoga Mat",
      shortDescription: "Non-slip natural rubber mat with alignment lines for steady practice.",
      description:
        "The EcoGrip Pro is crafted from sustainably harvested natural rubber with a moisture-wicking top layer that grips better the more you sweat. Laser-etched alignment lines help you square your hands and feet in every pose, while the 5mm cushion protects knees and wrists during long floor sequences. Free of PVC, latex and toxic glues, it is biodegradable at end of life and ships in plastic-free packaging.",
      price: 89.0,
      category: "Mats",
      stock: 34,
      imageUrl: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.8,
      specs: {
        Material: "Natural tree rubber + polyurethane top",
        Thickness: "5 mm",
        Dimensions: "183 × 68 cm",
        Weight: "2.5 kg",
        Care: "Wipe with damp cloth after practice",
      },
      reviews: [
        { name: "Sofia L.", rating: 5, comment: "Best grip I have ever had in hot yoga. Zero slipping even in downward dog.", date: "2026-06-12" },
        { name: "Daniel K.", rating: 5, comment: "The alignment lines genuinely improved my warrior poses.", date: "2026-05-30" },
        { name: "Priya S.", rating: 4, comment: "Heavier than my old mat, but the cushioning is worth it.", date: "2026-05-02" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(2),
    },
    {
      title: "TravelLite Folding Mat",
      shortDescription: "Ultra-light 1.5mm foldable mat that fits inside any carry-on bag.",
      description:
        "Designed for yogis on the move, the TravelLite folds down to the size of a paperback book and weighs under a kilogram. The closed-cell surface keeps sweat and bacteria out, so you can practice in hotel rooms, parks or studios and simply wipe it clean afterwards. Despite its slim profile, the textured microfibre top delivers dependable traction for standing flows.",
      price: 49.0,
      category: "Mats",
      stock: 52,
      imageUrl: "https://images.unsplash.com/photo-1591291621164-2c6367723315?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1591291621164-2c6367723315?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.5,
      specs: {
        Material: "Recycled PU + natural rubber base",
        Thickness: "1.5 mm",
        Dimensions: "180 × 66 cm",
        Weight: "0.9 kg",
        Folded: "25 × 33 cm",
      },
      reviews: [
        { name: "Hannah B.", rating: 5, comment: "Took it across three countries this summer. Folds flat into my backpack.", date: "2026-06-20" },
        { name: "Marco T.", rating: 4, comment: "Thin as expected — pair it with a towel on hard floors.", date: "2026-04-18" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(5),
    },
    {
      title: "CorkFlow Balance Mat",
      shortDescription: "Antimicrobial cork surface mat that stays firm and dry in hot sessions.",
      description:
        "Cork is nature's answer to sweaty palms: its waxy suberin coating is naturally antimicrobial and becomes grippier when damp. The CorkFlow pairs a smooth cork top with a dense TPE base, giving you a firm, stable platform for balance work like tree pose and half moon. It rolls tight, never smells and looks beautiful in any studio.",
      price: 72.0,
      category: "Mats",
      stock: 27,
      imageUrl: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.6,
      specs: {
        Material: "Portuguese cork + TPE base",
        Thickness: "4 mm",
        Dimensions: "183 × 61 cm",
        Weight: "1.8 kg",
        Care: "Air dry, avoid direct sunlight",
      },
      reviews: [
        { name: "Elena V.", rating: 5, comment: "No more towel needed for vinyasa. The cork grip is unreal when wet.", date: "2026-07-01" },
        { name: "James O.", rating: 4, comment: "Firm and stable, exactly what I wanted for balance poses.", date: "2026-06-05" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(9),
    },
    {
      title: "CloudSoft High-Waist Leggings",
      shortDescription: "Buttery-soft squat-proof leggings with a hidden waistband pocket.",
      description:
        "Made from 73% recycled nylon with four-way stretch, the CloudSoft leggings move with you through every fold and twist. The high waistband sits flat without digging in, and a hidden pocket holds a key or card during outdoor sessions. Flatlock seams prevent chafing, and the fabric passed a full squat-proof opacity test in independent lab checks.",
      price: 64.0,
      category: "Apparel",
      stock: 88,
      imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.7,
      specs: {
        Fabric: "73% recycled nylon, 27% elastane",
        Rise: "High (28 cm)",
        Sizes: "XS – XXL",
        Features: "Hidden waistband pocket, flatlock seams",
        Care: "Machine wash cold, hang dry",
      },
      reviews: [
        { name: "Amara D.", rating: 5, comment: "Softest leggings I own and completely opaque in deep squats.", date: "2026-06-28" },
        { name: "Ruth N.", rating: 5, comment: "The waistband pocket fits my apartment key perfectly for park yoga.", date: "2026-05-22" },
        { name: "Kate W.", rating: 4, comment: "Runs slightly long — I cuffed them once and they are perfect.", date: "2026-04-30" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(3),
    },
    {
      title: "Breeze Open-Back Tank",
      shortDescription: "Featherweight breathable tank with a relaxed drape and open back.",
      description:
        "The Breeze tank is cut from a bamboo-modal blend that feels cool against the skin and wicks moisture through heated flows. The open-back silhouette keeps air moving while the double-lined front offers coverage in inversions. A longer hem means it stays put in downward dog, so you can stop tugging your shirt and stay in the flow.",
      price: 38.0,
      category: "Apparel",
      stock: 64,
      imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.4,
      specs: {
        Fabric: "70% bamboo modal, 30% organic cotton",
        Fit: "Relaxed drape",
        Sizes: "XS – XL",
        Care: "Machine wash cold",
      },
      reviews: [
        { name: "Lin M.", rating: 4, comment: "So breathable in hot classes. Wish it came in more colours.", date: "2026-06-15" },
        { name: "Grace P.", rating: 5, comment: "Stays in place during inversions, which is rare for a drapey tank.", date: "2026-05-11" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(12),
    },
    {
      title: "ThermaWrap Meditation Shawl",
      shortDescription: "Handwoven organic cotton shawl for savasana and cool-down.",
      description:
        "Body temperature drops quickly in stillness. The ThermaWrap is a generously sized handwoven shawl that keeps you warm through savasana, seated meditation and pranayama practice. Each piece is loomed by a women's weaving cooperative from GOTS-certified organic cotton and finished with hand-knotted tassels — no two shawls are exactly alike.",
      price: 55.0,
      category: "Apparel",
      stock: 31,
      imageUrl: "https://images.unsplash.com/photo-1602192509154-0b900ee1f851?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1602192509154-0b900ee1f851?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.9,
      specs: {
        Material: "GOTS-certified organic cotton",
        Dimensions: "200 × 100 cm",
        Weight: "480 g",
        Origin: "Handwoven, fair-trade cooperative",
        Care: "Hand wash, lay flat to dry",
      },
      reviews: [
        { name: "Noor A.", rating: 5, comment: "Beautiful weave and generous size. My savasana essential all winter.", date: "2026-07-03" },
        { name: "Tom H.", rating: 5, comment: "Bought one for my partner, came back for a second for myself.", date: "2026-06-01" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(15),
    },
    {
      title: "Calm Mind Essential Oil Set",
      shortDescription: "Lavender, eucalyptus and sandalwood oils for pre-practice rituals.",
      description:
        "This trio of steam-distilled essential oils was blended for the three phases of practice: eucalyptus to open the breath before you begin, sandalwood to ground your focus during meditation, and lavender to settle the nervous system in savasana. Each 10ml bottle is pure, undiluted and third-party tested for purity, with a dropper cap for use in diffusers or diluted skin application.",
      price: 42.0,
      category: "Wellness",
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.6,
      specs: {
        Contents: "3 × 10 ml (lavender, eucalyptus, sandalwood)",
        Extraction: "Steam distilled, undiluted",
        Testing: "Third-party GC/MS verified",
        Use: "Diffuser or diluted topical",
      },
      reviews: [
        { name: "Isabelle R.", rating: 5, comment: "The sandalwood is deep and true — instant focus when I diffuse it.", date: "2026-06-25" },
        { name: "Omar F.", rating: 4, comment: "Great quality oils, packaging protects them well.", date: "2026-05-19" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(7),
    },
    {
      title: "DeepRest Weighted Eye Pillow",
      shortDescription: "Flaxseed and lavender eye pillow that melts tension in savasana.",
      description:
        "Gentle pressure across the eyes signals the nervous system to slow down. The DeepRest pillow is filled with organic flaxseed and a whisper of French lavender, weighted to rest evenly across the brow without pressing on the eyelids. Chill it in the freezer for headaches or warm it briefly for sinus relief — the removable silk cover is machine washable.",
      price: 24.0,
      category: "Wellness",
      stock: 73,
      imageUrl: "https://images.unsplash.com/photo-1611800065908-233b597db552?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1611800065908-233b597db552?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620733723572-11c53f73a416?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.8,
      specs: {
        Fill: "Organic flaxseed + French lavender",
        Cover: "Mulberry silk, removable & washable",
        Weight: "280 g",
        Dimensions: "22 × 10 cm",
      },
      reviews: [
        { name: "Chloe S.", rating: 5, comment: "I fall asleep in savasana now. Worth every penny.", date: "2026-07-10" },
        { name: "Ben G.", rating: 5, comment: "Bought it for migraines — the freezer trick works wonders.", date: "2026-06-08" },
        { name: "Rita M.", rating: 4, comment: "Lavender scent is subtle, which I prefer.", date: "2026-05-27" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(4),
    },
    {
      title: "Herbal Calm Tea Collection",
      shortDescription: "Caffeine-free chamomile, tulsi and peppermint blends for wind-down.",
      description:
        "Curated to close your evening practice, this collection includes three loose-leaf blends: chamomile-lemon balm for sleep, tulsi-ginger for stress recovery, and peppermint-fennel for digestion. All herbs are certified organic and packed in compostable pouches with a reusable stainless steel infuser included. Around 25 cups per pouch.",
      price: 29.0,
      category: "Wellness",
      stock: 58,
      imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.5,
      specs: {
        Contents: "3 × 60 g loose-leaf pouches + infuser",
        Certification: "Certified organic, caffeine-free",
        Servings: "~75 cups total",
        Packaging: "Compostable pouches",
      },
      reviews: [
        { name: "Yuki T.", rating: 5, comment: "The tulsi blend after evening yin is my favourite ritual.", date: "2026-06-18" },
        { name: "Sam C.", rating: 4, comment: "Nice infuser included. Chamomile blend is very soothing.", date: "2026-05-06" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(18),
    },
    {
      title: "Stability Cork Block Set",
      shortDescription: "Two solid cork blocks that bring the floor closer in any pose.",
      description:
        "Whether you are bridging the gap in half moon or supporting a restorative fish pose, these solid cork blocks give you a rock-stable foundation that foam simply cannot match. The fine-grain cork is smooth against skin, naturally antimicrobial and dense enough to hold full body weight without flexing. Sold as a pair with rounded edges for comfortable gripping.",
      price: 34.0,
      category: "Accessories",
      stock: 96,
      imageUrl: "https://images.unsplash.com/photo-1601925228096-a5b34cba1112?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1601925228096-a5b34cba1112?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.7,
      specs: {
        Material: "Solid fine-grain cork",
        Dimensions: "23 × 15 × 10 cm each",
        Weight: "900 g each",
        Quantity: "Set of 2",
      },
      reviews: [
        { name: "Laura J.", rating: 5, comment: "So much sturdier than my old foam blocks. Great for supported bridge.", date: "2026-07-05" },
        { name: "Nick R.", rating: 4, comment: "Solid and smooth. A little heavy to carry to class, perfect at home.", date: "2026-06-11" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(6),
    },
    {
      title: "AlignPro Stretch Strap",
      shortDescription: "10-loop cotton strap that deepens stretches safely at any level.",
      description:
        "The AlignPro strap features ten numbered loops so you can measure progress in hamstring, shoulder and hip stretches week by week. Woven from thick organic cotton with reinforced stitching, it holds firm under tension without cutting into your hands. Includes a printed guide with twelve stretch sequences developed by a physiotherapist.",
      price: 19.0,
      category: "Accessories",
      stock: 120,
      imageUrl: "https://images.unsplash.com/photo-1518644961665-ed172691aaa1?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1518644961665-ed172691aaa1?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522845015757-50bce044e5ff?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.6,
      specs: {
        Material: "Organic cotton webbing",
        Length: "244 cm, 10 numbered loops",
        Width: "4 cm",
        Extras: "Physio-designed stretch guide included",
      },
      reviews: [
        { name: "Diego M.", rating: 5, comment: "The numbered loops make progress visible. Hamstrings finally opening up.", date: "2026-06-30" },
        { name: "Anna K.", rating: 4, comment: "Sturdy strap, helpful guide for beginners like me.", date: "2026-05-15" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(10),
    },
    {
      title: "ZenCarry Mat Bag",
      shortDescription: "Water-resistant canvas mat bag with pockets for keys, phone and towel.",
      description:
        "The ZenCarry swallows any mat up to 6mm thick and still leaves room for a towel, water bottle and change of clothes. Waxed organic canvas shrugs off rain, the full-length zip means no more wrestling your mat through a narrow tube, and an exterior quick-access pocket keeps your phone and keys reachable. An adjustable strap converts from shoulder to crossbody carry.",
      price: 45.0,
      category: "Accessories",
      stock: 41,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1593810450967-f9c42742e326?q=80&w=1200&auto=format&fit=crop",
      ],
      rating: 4.4,
      specs: {
        Material: "Waxed organic canvas",
        Fits: "Mats up to 66 cm wide, 6 mm thick",
        Pockets: "1 exterior zip, 2 interior slip",
        Strap: "Adjustable shoulder/crossbody",
      },
      reviews: [
        { name: "Fatima Z.", rating: 4, comment: "Fits my thick mat plus a towel. The outside pocket is so handy.", date: "2026-06-22" },
        { name: "Peter L.", rating: 5, comment: "Survived a rainy cycle commute with everything dry inside.", date: "2026-05-29" },
      ],
      createdBy: adminId,
      createdByName: adminName,
      createdAt: base(14),
    },
  ];
}

async function seed() {
  await connectDB();

  const adminId = await ensureAccount(DEMO_ADMIN, "admin");
  await ensureAccount(DEMO_USER, "user");

  const productsCol = db.collection<ProductDocument>("products");
  const count = await productsCol.countDocuments();
  if (count > 0) {
    console.log(`ℹ️ Products collection already has ${count} items — clearing and re-seeding.`);
    await productsCol.deleteMany({});
  }

  const docs = buildProducts(adminId, DEMO_ADMIN.name);
  await productsCol.insertMany(docs);
  console.log(`✅ Seeded ${docs.length} products.`);

  await client.close();
  console.log("🌱 Seeding complete.");
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
