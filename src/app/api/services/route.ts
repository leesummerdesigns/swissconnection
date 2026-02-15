import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_SERVICES = [
  { slug: "haircuts", name: "Haircuts" },
  { slug: "cleaning", name: "Cleaning" },
  { slug: "massages", name: "Massages" },
  { slug: "nails", name: "Nails" },
  { slug: "fitness", name: "Fitness Trainer" },
  { slug: "sewing", name: "Sewing" },
  { slug: "repairs", name: "Home Repairs" },
  { slug: "cooking", name: "Cooking" },
  { slug: "beauty", name: "Beauty" },
  { slug: "tutoring", name: "Tutoring" },
  { slug: "childcare", name: "Childcare" },
  { slug: "translation", name: "Translation" },
  { slug: "photography", name: "Photography" },
];

export async function GET() {
  try {
    let services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });

    // Auto-seed if empty (e.g. after DB reset)
    if (services.length === 0) {
      await prisma.service.createMany({ data: DEFAULT_SERVICES });
      services = await prisma.service.findMany({
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error("Get services error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
