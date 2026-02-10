import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create services
  const services = await Promise.all(
    [
      { slug: "haircuts", name: "Haircuts" },
      { slug: "sewing", name: "Sewing" },
      { slug: "cleaning", name: "House Cleaning" },
      { slug: "repairs", name: "Home Repairs" },
      { slug: "cooking", name: "Cooking" },
      { slug: "beauty", name: "Beauty & Nails" },
      { slug: "tutoring", name: "Tutoring" },
      { slug: "childcare", name: "Childcare" },
      { slug: "translation", name: "Translation" },
      { slug: "photography", name: "Photography" },
    ].map((s) =>
      prisma.service.upsert({
        where: { slug: s.slug },
        update: {},
        create: s,
      })
    )
  );

  console.log(`Created ${services.length} services`);

  const passwordHash = await bcrypt.hash("password123", 12);

  // Swiss cities with coordinates and postal codes
  const cities = [
    { postalCode: "8001", city: "Zürich", canton: "Zürich", lat: 47.3769, lng: 8.5417 },
    { postalCode: "3001", city: "Bern", canton: "Bern", lat: 46.948, lng: 7.4474 },
    { postalCode: "1201", city: "Genève", canton: "Genève", lat: 46.2044, lng: 6.1432 },
    { postalCode: "4001", city: "Basel", canton: "Basel-Stadt", lat: 47.5596, lng: 7.5886 },
    { postalCode: "1003", city: "Lausanne", canton: "Vaud", lat: 46.5197, lng: 6.6323 },
  ];

  // Sample providers
  const providers = [
    {
      name: "Olena Kovalenko",
      email: "olena@example.com",
      bio: "Professional hairdresser with 10 years of experience. Specializing in modern cuts, coloring, and styling. I bring my equipment to your home.",
      languages: "uk,de,en",
      ...cities[0],
      serviceIds: ["haircuts", "beauty"],
      descriptions: [
        "Women's and men's haircuts, coloring, highlights, and styling at your location",
        "Manicure, pedicure, and basic beauty treatments",
      ],
      prices: [60, 45],
      priceTypes: ["HOURLY", "FIXED"],
    },
    {
      name: "Tetiana Shevchenko",
      email: "tetiana@example.com",
      bio: "Experienced seamstress offering alterations, repairs, and custom tailoring. I work with all types of fabrics and can create custom pieces from scratch.",
      languages: "uk,de,fr",
      ...cities[0],
      serviceIds: ["sewing"],
      descriptions: [
        "Alterations, repairs, custom tailoring, and traditional Ukrainian embroidery",
      ],
      prices: [50],
      priceTypes: ["HOURLY"],
    },
    {
      name: "Iryna Bondarenko",
      email: "iryna@example.com",
      bio: "Reliable and thorough house cleaning service. I use eco-friendly products and pay attention to every detail. Regular or one-time deep cleaning available.",
      languages: "uk,de",
      ...cities[1],
      serviceIds: ["cleaning"],
      descriptions: [
        "Regular cleaning, deep cleaning, move-in/move-out cleaning, and window cleaning",
      ],
      prices: [35],
      priceTypes: ["HOURLY"],
    },
    {
      name: "Dmytro Melnyk",
      email: "dmytro@example.com",
      bio: "Skilled handyman offering various home repair services. From fixing leaky faucets to assembling furniture and minor electrical work.",
      languages: "uk,de,en",
      ...cities[1],
      serviceIds: ["repairs"],
      descriptions: [
        "Plumbing, furniture assembly, painting, minor electrical work, and general repairs",
      ],
      prices: [55],
      priceTypes: ["HOURLY"],
    },
    {
      name: "Natalia Lysenko",
      email: "natalia@example.com",
      bio: "Passionate cook offering authentic Ukrainian and Eastern European cuisine. Available for meal prep, dinner parties, and cooking classes.",
      languages: "uk,fr,en",
      ...cities[2],
      serviceIds: ["cooking"],
      descriptions: [
        "Ukrainian cuisine, meal preparation, dinner parties, and cooking lessons",
      ],
      prices: [70],
      priceTypes: ["HOURLY"],
    },
    {
      name: "Viktoriia Tkachenko",
      email: "viktoriia@example.com",
      bio: "Professional nail artist and beauty specialist. Gel nails, nail art, eyelash extensions, and eyebrow shaping. I come to you!",
      languages: "uk,de,it",
      ...cities[3],
      serviceIds: ["beauty"],
      descriptions: [
        "Gel nails, nail art, eyelash extensions, eyebrow threading and tinting",
      ],
      prices: [80],
      priceTypes: ["FIXED"],
    },
    {
      name: "Andrii Kravchenko",
      email: "andrii@example.com",
      bio: "Mathematics and physics tutor. Helping students from primary school to university level. Patient, structured approach with great results.",
      languages: "uk,de,en",
      ...cities[3],
      serviceIds: ["tutoring"],
      descriptions: [
        "Mathematics, physics, and Ukrainian language tutoring for all levels",
      ],
      prices: [50],
      priceTypes: ["HOURLY"],
    },
    {
      name: "Maryna Savchenko",
      email: "maryna@example.com",
      bio: "Experienced childcare provider and early childhood educator. I offer babysitting, after-school care, and creative activities for children of all ages.",
      languages: "uk,fr",
      ...cities[4],
      serviceIds: ["childcare"],
      descriptions: [
        "Babysitting, after-school care, tutoring, and creative activities for ages 2-12",
      ],
      prices: [30],
      priceTypes: ["HOURLY"],
    },
    {
      name: "Oksana Ponomarenko",
      email: "oksana@example.com",
      bio: "Certified translator and interpreter for Ukrainian, German, French, and English. Available for document translation, appointments, and business meetings.",
      languages: "uk,de,fr,en",
      ...cities[4],
      serviceIds: ["translation"],
      descriptions: [
        "Document translation, interpretation for medical/legal appointments, business meetings",
      ],
      prices: [65],
      priceTypes: ["HOURLY"],
    },
    {
      name: "Yulia Zhukova",
      email: "yulia@example.com",
      bio: "Professional photographer specializing in portraits, family photos, and events. Natural light style with beautiful, authentic moments captured.",
      languages: "uk,de,en",
      ...cities[0],
      serviceIds: ["photography"],
      descriptions: [
        "Portrait photography, family sessions, events, and product photography",
      ],
      prices: [120],
      priceTypes: ["HOURLY"],
    },
  ];

  // Create a test user (non-provider)
  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "user@example.com",
      passwordHash,
      emailVerified: new Date(),
      postalCode: "8001",
      city: "Zürich",
      canton: "Zürich",
      latitude: 47.3769,
      longitude: 8.5417,
      languages: "en,de",
    },
  });

  // Create providers
  for (const p of providers) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        name: p.name,
        email: p.email,
        passwordHash,
        bio: p.bio,
        languages: p.languages,
        postalCode: p.postalCode,
        city: p.city,
        canton: p.canton,
        latitude: p.lat,
        longitude: p.lng,
        role: "PROVIDER",
        emailVerified: new Date(),
      },
    });

    // Create provider profile if not exists
    const existingProfile = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!existingProfile) {
      const profile = await prisma.providerProfile.create({
        data: { userId: user.id },
      });

      // Add services
      for (let i = 0; i < p.serviceIds.length; i++) {
        const service = services.find((s) => s.slug === p.serviceIds[i]);
        if (service) {
          await prisma.providerService.create({
            data: {
              profileId: profile.id,
              serviceId: service.id,
              description: p.descriptions[i] || null,
              price: p.prices[i] || null,
              priceType: (p.priceTypes[i] as any) || "NEGOTIABLE",
            },
          });
        }
      }
    }

    console.log(`Created provider: ${p.name} in ${p.city}`);
  }

  // Create some sample reviews
  const allUsers = await prisma.user.findMany();
  const providerUsers = allUsers.filter((u) => u.role === "PROVIDER");
  const testUser = allUsers.find((u) => u.email === "user@example.com");

  if (testUser && providerUsers.length >= 3) {
    const reviewData = [
      {
        reviewerId: testUser.id,
        providerId: providerUsers[0].id,
        rating: 5,
        text: "Olena did an amazing job with my hair! She was professional, on time, and the result was exactly what I wanted. Highly recommend!",
      },
      {
        reviewerId: testUser.id,
        providerId: providerUsers[1].id,
        rating: 5,
        text: "Tetiana altered my dress perfectly. The stitching is beautiful and she even added some lovely embroidery details. Will definitely use her services again.",
      },
      {
        reviewerId: testUser.id,
        providerId: providerUsers[2].id,
        rating: 4,
        text: "Iryna's cleaning service is excellent. My apartment has never looked better. She uses great eco-friendly products and is very thorough.",
      },
    ];

    for (const review of reviewData) {
      const existing = await prisma.review.findFirst({
        where: {
          reviewerId: review.reviewerId,
          providerId: review.providerId,
        },
      });
      if (!existing) {
        await prisma.review.create({ data: review });
      }
    }

    console.log("Created sample reviews");
  }

  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
      languages: "en",
    },
  });

  console.log("\nSeed completed!");
  console.log("\nTest accounts (password: password123):");
  console.log("  User:  user@example.com");
  console.log("  Admin: admin@example.com");
  console.log("  Providers: olena@example.com, tetiana@example.com, etc.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
