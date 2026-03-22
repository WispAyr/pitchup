import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if already exists
  const existing = await prisma.vendor.findUnique({ where: { slug: 'joannas-chippy' } })
  if (existing) {
    console.log('Joanna\'s Chippy already exists, skipping seed')
    return
  }

  const passwordHash = await bcrypt.hash('password123', 12)

  const vendor = await prisma.vendor.create({
    data: {
      slug: 'joannas-chippy',
      name: "Joanna's Chippy",
      description: 'Traditional Scottish chip van serving fresh fish & chips across Ayrshire. Family run, quality ingredients, proper chippy food.',
      cuisineType: 'Fish & Chips',
      email: 'joanna@example.com',
      primaryColor: '#D4380D',
      secondaryColor: '#7C1F08',
      preOrderingEnabled: true,
      templateId: 'bold',
      passwordHash,
    },
  })

  // Menu categories
  const categories = await Promise.all([
    prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Mains', sortOrder: 0 } }),
    prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Sides', sortOrder: 1 } }),
    prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Drinks', sortOrder: 2 } }),
    prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Kids', sortOrder: 3 } }),
    prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Specials', sortOrder: 4 } }),
  ])

  const [mains, sides, drinks, kids, specials] = categories

  // Mains
  const mainsItems = [
    { name: 'Fish Supper', description: 'Fresh haddock in crispy batter with chips', price: 850 },
    { name: 'Chips', description: 'Golden chunky chips', price: 350 },
    { name: 'Sausage Supper', description: 'Battered sausage with chips', price: 700 },
    { name: 'Chicken Supper', description: 'Battered chicken fillet with chips', price: 750 },
    { name: 'King Rib Supper', description: 'Battered king rib with chips', price: 750 },
    { name: 'Haggis Supper', description: 'Battered haggis with chips', price: 700 },
    { name: 'Pizza Crunch Supper', description: 'Battered pizza with chips', price: 700 },
    { name: 'Black Pudding Supper', description: 'Battered black pudding with chips', price: 700 },
    { name: 'White Pudding Supper', description: 'Battered white pudding with chips', price: 700 },
    { name: 'Smoked Sausage Supper', description: 'Battered smoked sausage with chips', price: 750 },
    { name: 'Half & Half', description: 'Half chips, half rice', price: 400 },
    { name: 'Burger Supper', description: 'Quarter pounder with chips', price: 750 },
    { name: 'Chicken Nuggets', description: '6 pcs with chips', price: 650 },
    { name: 'Scampi Supper', description: 'Battered scampi with chips', price: 800 },
  ]

  const sidesItems = [
    { name: 'Mushy Peas', description: null, price: 150 },
    { name: 'Curry Sauce', description: null, price: 180 },
    { name: 'Gravy', description: null, price: 150 },
    { name: 'Bread & Butter', description: null, price: 100 },
    { name: 'Pickled Onion', description: null, price: 60 },
    { name: 'Coleslaw', description: null, price: 150 },
    { name: 'Onion Rings', description: '5 pcs', price: 250 },
    { name: 'Battered Mushrooms', description: null, price: 250 },
    { name: 'Cheese (on chips)', description: null, price: 100 },
    { name: 'Salt & Sauce', description: null, price: 0 },
  ]

  const drinksItems = [
    { name: 'Irn-Bru', description: null, price: 150 },
    { name: 'Coca-Cola', description: null, price: 150 },
    { name: 'Diet Coke', description: null, price: 150 },
    { name: 'Fanta', description: null, price: 150 },
    { name: 'Water', description: null, price: 100 },
    { name: 'Tea', description: null, price: 150 },
    { name: 'Coffee', description: null, price: 200 },
  ]

  const kidsItems = [
    { name: 'Kids Fish & Chips', description: null, price: 500 },
    { name: 'Kids Chicken Nuggets (4 pcs) & Chips', description: null, price: 450 },
    { name: 'Kids Sausage & Chips', description: null, price: 450 },
  ]

  const specialsItems = [
    { name: 'Family Deal', description: '2 fish suppers + 2 kids meals + 4 cans', price: 2500 },
    { name: 'Chippy Tea Deal', description: 'Any supper + can + mushy peas', price: 1000 },
  ]

  const allItems = [
    ...mainsItems.map((item, i) => ({ ...item, categoryId: mains.id, sortOrder: i })),
    ...sidesItems.map((item, i) => ({ ...item, categoryId: sides.id, sortOrder: i })),
    ...drinksItems.map((item, i) => ({ ...item, categoryId: drinks.id, sortOrder: i })),
    ...kidsItems.map((item, i) => ({ ...item, categoryId: kids.id, sortOrder: i })),
    ...specialsItems.map((item, i) => ({ ...item, categoryId: specials.id, sortOrder: i })),
  ]

  await prisma.menuItem.createMany({
    data: allItems.map((item) => ({
      vendorId: vendor.id,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price,
      sortOrder: item.sortOrder,
    })),
  })

  // Locations
  const locations = await Promise.all([
    prisma.location.create({ data: { vendorId: vendor.id, name: 'Tesco Prestwick', lat: 55.4960, lng: -4.6130, isRegular: true } }),
    prisma.location.create({ data: { vendorId: vendor.id, name: 'Ayr Seafront', lat: 55.4583, lng: -4.6299, isRegular: true } }),
    prisma.location.create({ data: { vendorId: vendor.id, name: 'Troon Beach', lat: 55.5431, lng: -4.6623, isRegular: true } }),
    prisma.location.create({ data: { vendorId: vendor.id, name: 'Irvine Harbourside', lat: 55.6100, lng: -4.6850, isRegular: true } }),
  ])

  const [prestwick, ayr, troon, irvine] = locations

  // Schedule: Mon=1, Tue=2, Wed=3(off), Thu=4, Fri=5, Sat=6, Sun=0
  const schedules = [
    { locationId: prestwick.id, dayOfWeek: 1, startTime: '16:30', endTime: '20:30' },
    { locationId: ayr.id, dayOfWeek: 2, startTime: '17:00', endTime: '21:00' },
    // Wed off
    { locationId: troon.id, dayOfWeek: 4, startTime: '16:30', endTime: '20:30' },
    { locationId: ayr.id, dayOfWeek: 5, startTime: '16:30', endTime: '21:30' },
    { locationId: irvine.id, dayOfWeek: 6, startTime: '12:00', endTime: '20:00' },
    { locationId: prestwick.id, dayOfWeek: 0, startTime: '16:00', endTime: '20:00' },
  ]

  await prisma.schedule.createMany({
    data: schedules.map((s) => ({
      vendorId: vendor.id,
      locationId: s.locationId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      recurring: true,
    })),
  })

  console.log(`✅ Seeded Joanna's Chippy with ${allItems.length} menu items, ${locations.length} locations, ${schedules.length} schedules`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
