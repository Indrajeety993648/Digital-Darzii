import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const templates = [
  { gender: "female", bodyType: "m", skinTone: "medium", pose: "front", category: "ethnic_female", imageUrl: "/templates/female_medium_front.jpg" },
  { gender: "female", bodyType: "m", skinTone: "medium", pose: "ethnic", category: "ethnic_female", imageUrl: "/templates/female_medium_ethnic.jpg" },
  { gender: "male", bodyType: "m", skinTone: "medium", pose: "front", category: "ethnic_male", imageUrl: "/templates/male_medium_front.jpg" },
  { gender: "male", bodyType: "m", skinTone: "medium", pose: "ethnic", category: "ethnic_male", imageUrl: "/templates/male_medium_ethnic.jpg" },
  { gender: "female", bodyType: "s", skinTone: "light", pose: "front", category: "western", imageUrl: "/templates/female_small_front.jpg" },
  { gender: "female", bodyType: "l", skinTone: "dark", pose: "front", category: "western", imageUrl: "/templates/female_large_front.jpg" },
  { gender: "male", bodyType: "l", skinTone: "dark", pose: "front", category: "ethnic_male", imageUrl: "/templates/male_large_front.jpg" },
  { gender: "female", bodyType: "m", skinTone: "deep", pose: "side", category: "western", imageUrl: "/templates/female_medium_side.jpg" },
  { gender: "female", bodyType: "m", skinTone: "medium", pose: "mock", category: "western", imageUrl: "/mock/female-model.jpeg" },
  { gender: "female", bodyType: "m", skinTone: "medium", pose: "mock-2", category: "western", imageUrl: "/mock/female-model-2.jpeg" },
];

async function main() {
  console.log("Seeding model templates...");
  // Clear existing and re-seed
  await prisma.modelTemplate.deleteMany();
  for (const template of templates) {
    await prisma.modelTemplate.create({ data: template });
  }
  console.log(`Seeded ${templates.length} model templates.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
