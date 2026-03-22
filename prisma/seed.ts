import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.order.deleteMany();
  await prisma.liveSession.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.location.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // ──────────────────────────────────────────────
  // Vendor 1: Danny's Chippy
  // ──────────────────────────────────────────────
  const dannys = await prisma.vendor.create({
    data: {
      slug: 'dannys-chippy',
      name: "Danny's Chippy",
      description: 'Traditional fish & chips, battered to perfection. Serving Ayrshire since 2015.',
      primaryColor: '#1E40AF',
      secondaryColor: '#1E3A5F',
      cuisineType: 'Fish & Chips',
      email: 'danny@example.com',
      passwordHash,
      preOrderingEnabled: true,
    },
  });

  const dannysMains = await prisma.menuCategory.create({
    data: { vendorId: dannys.id, name: 'Mains', sortOrder: 0 },
  });
  const dannysSides = await prisma.menuCategory.create({
    data: { vendorId: dannys.id, name: 'Sides', sortOrder: 1 },
  });
  const dannysDrinks = await prisma.menuCategory.create({
    data: { vendorId: dannys.id, name: 'Drinks', sortOrder: 2 },
  });
  const dannysSpecials = await prisma.menuCategory.create({
    data: { vendorId: dannys.id, name: 'Specials', sortOrder: 3 },
  });

  // Danny's Mains
  const fishSupper = await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysMains.id,
      name: 'Fish Supper', description: 'Fresh haddock in crispy batter with chips.',
      price: 750, allergens: ['gluten', 'fish'], dietaryTags: [], sortOrder: 0,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysMains.id,
      name: 'Chips', description: 'Golden chunky chips.',
      price: 300, allergens: [], dietaryTags: ['vegan', 'gluten-free'], sortOrder: 1,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysMains.id,
      name: 'Battered Sausage Supper', description: 'Battered sausage with chips.',
      price: 650, allergens: ['gluten'], dietaryTags: [], sortOrder: 2,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysMains.id,
      name: 'Chicken Supper', description: 'Battered chicken fillet with chips.',
      price: 700, allergens: ['gluten'], dietaryTags: [], sortOrder: 3,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysMains.id,
      name: 'King Rib Supper', description: 'Classic king rib in batter with chips.',
      price: 700, allergens: ['gluten'], dietaryTags: [], sortOrder: 4,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysMains.id,
      name: 'Haggis Supper', description: 'Battered haggis with chips.',
      price: 650, allergens: ['gluten'], dietaryTags: [], sortOrder: 5,
    },
  });

  // Danny's Sides
  const mushyPeas = await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysSides.id,
      name: 'Mushy Peas', description: 'Classic mushy peas.',
      price: 150, allergens: [], dietaryTags: ['vegan'], sortOrder: 0,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysSides.id,
      name: 'Curry Sauce', description: 'Chippy curry sauce.',
      price: 150, allergens: [], dietaryTags: ['vegan'], sortOrder: 1,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysSides.id,
      name: 'Gravy', description: 'Rich brown gravy.',
      price: 150, allergens: [], dietaryTags: [], sortOrder: 2,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysSides.id,
      name: 'Bread & Butter', description: 'Sliced white bread with butter.',
      price: 80, allergens: ['gluten', 'dairy'], dietaryTags: [], sortOrder: 3,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysSides.id,
      name: 'Pickled Onion', description: 'Tangy pickled onion.',
      price: 60, allergens: [], dietaryTags: ['vegan'], sortOrder: 4,
    },
  });

  // Danny's Drinks
  const irnBru = await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysDrinks.id,
      name: 'Irn-Bru', description: 'Scotland\'s other national drink.',
      price: 150, allergens: [], dietaryTags: [], sortOrder: 0,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysDrinks.id,
      name: 'Coca-Cola', description: 'Classic Coca-Cola can.',
      price: 150, allergens: [], dietaryTags: [], sortOrder: 1,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysDrinks.id,
      name: 'Water', description: 'Still mineral water.',
      price: 100, allergens: [], dietaryTags: [], sortOrder: 2,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysDrinks.id,
      name: 'Tea', description: 'Builders tea with milk.',
      price: 150, allergens: ['dairy'], dietaryTags: [], sortOrder: 3,
    },
  });

  // Danny's Specials
  await prisma.menuItem.create({
    data: {
      vendorId: dannys.id, categoryId: dannysSpecials.id,
      name: 'Chippy Tea Deal', description: 'Fish supper + can + mushy peas.',
      price: 950, allergens: ['gluten', 'fish'], dietaryTags: [], sortOrder: 0,
    },
  });

  // Danny's Locations
  const tescoPrestwick = await prisma.location.create({
    data: {
      vendorId: dannys.id, name: 'Tesco Prestwick',
      lat: 55.4960, lng: -4.6130, isRegular: true,
    },
  });
  const ayrSeafront = await prisma.location.create({
    data: {
      vendorId: dannys.id, name: 'Ayr Seafront',
      lat: 55.4583, lng: -4.6299, isRegular: true,
    },
  });

  // Danny's Schedule (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
  await prisma.schedule.create({
    data: {
      vendorId: dannys.id, locationId: tescoPrestwick.id,
      dayOfWeek: 2, startTime: '17:00', endTime: '20:30',
    },
  });
  await prisma.schedule.create({
    data: {
      vendorId: dannys.id, locationId: ayrSeafront.id,
      dayOfWeek: 4, startTime: '16:30', endTime: '21:00',
    },
  });
  await prisma.schedule.create({
    data: {
      vendorId: dannys.id, locationId: ayrSeafront.id,
      dayOfWeek: 5, startTime: '16:30', endTime: '21:00',
    },
  });

  console.log('  ✅ Danny\'s Chippy created');

  // ──────────────────────────────────────────────
  // Vendor 2: Pizza Nomad
  // ──────────────────────────────────────────────
  const pizzaNomad = await prisma.vendor.create({
    data: {
      slug: 'pizza-nomad',
      name: 'Pizza Nomad',
      description: 'Wood-fired sourdough pizza from our converted horse box. Fresh, local, incredible.',
      primaryColor: '#DC2626',
      secondaryColor: '#7F1D1D',
      cuisineType: 'Pizza',
      email: 'pizza@example.com',
      passwordHash,
      preOrderingEnabled: true,
    },
  });

  const pizzasCat = await prisma.menuCategory.create({
    data: { vendorId: pizzaNomad.id, name: 'Pizzas', sortOrder: 0 },
  });
  const pizzaSides = await prisma.menuCategory.create({
    data: { vendorId: pizzaNomad.id, name: 'Sides', sortOrder: 1 },
  });
  const pizzaDrinks = await prisma.menuCategory.create({
    data: { vendorId: pizzaNomad.id, name: 'Drinks', sortOrder: 2 },
  });
  const pizzaDesserts = await prisma.menuCategory.create({
    data: { vendorId: pizzaNomad.id, name: 'Desserts', sortOrder: 3 },
  });

  // Pizza Nomad - Pizzas
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzasCat.id,
      name: 'Margherita', description: 'San Marzano tomato, fior di latte, fresh basil.',
      price: 900, allergens: ['gluten', 'dairy'], dietaryTags: ['vegetarian'], sortOrder: 0,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzasCat.id,
      name: 'Pepperoni', description: 'Spicy pepperoni, mozzarella, tomato sauce.',
      price: 1050, allergens: ['gluten', 'dairy'], dietaryTags: [], sortOrder: 1,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzasCat.id,
      name: "Nduja & Honey", description: "Spicy nduja, mozzarella, finished with local honey.",
      price: 1100, allergens: ['gluten', 'dairy'], dietaryTags: [], sortOrder: 2,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzasCat.id,
      name: 'Wild Mushroom', description: 'Mixed wild mushrooms, truffle oil, mozzarella.',
      price: 1000, allergens: ['gluten', 'dairy'], dietaryTags: ['vegetarian'], sortOrder: 3,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzasCat.id,
      name: 'The Nomad Special', description: 'Pepperoni, jalapeños, red onion, honey drizzle.',
      price: 1200, allergens: ['gluten', 'dairy'], dietaryTags: [], sortOrder: 4,
    },
  });

  // Pizza Nomad - Sides
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzaSides.id,
      name: 'Garlic Dough Balls', description: 'Freshly baked with garlic butter.',
      price: 450, allergens: ['gluten', 'dairy'], dietaryTags: [], sortOrder: 0,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzaSides.id,
      name: 'House Salad', description: 'Mixed leaves, cherry tomatoes, balsamic dressing.',
      price: 350, allergens: [], dietaryTags: ['vegan'], sortOrder: 1,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzaSides.id,
      name: 'Coleslaw', description: 'Creamy homemade coleslaw.',
      price: 250, allergens: ['dairy', 'eggs'], dietaryTags: [], sortOrder: 2,
    },
  });

  // Pizza Nomad - Drinks
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzaDrinks.id,
      name: 'Craft Lager', description: 'Local craft lager, 330ml.',
      price: 450, allergens: [], dietaryTags: [], sortOrder: 0,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzaDrinks.id,
      name: 'Natural Wine', description: 'Glass of natural wine, ask for today\'s selection.',
      price: 600, allergens: [], dietaryTags: [], sortOrder: 1,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzaDrinks.id,
      name: 'Lemonade', description: 'Homemade lemonade.',
      price: 250, allergens: [], dietaryTags: [], sortOrder: 2,
    },
  });

  // Pizza Nomad - Desserts
  await prisma.menuItem.create({
    data: {
      vendorId: pizzaNomad.id, categoryId: pizzaDesserts.id,
      name: 'Nutella Calzone', description: 'Warm calzone filled with Nutella.',
      price: 550, allergens: ['gluten', 'dairy', 'nuts'], dietaryTags: [], sortOrder: 0,
    },
  });

  // Pizza Nomad - Locations
  const troonBeach = await prisma.location.create({
    data: {
      vendorId: pizzaNomad.id, name: 'Troon Beach',
      lat: 55.5431, lng: -4.6623, isRegular: true,
    },
  });
  const glasgowWestEnd = await prisma.location.create({
    data: {
      vendorId: pizzaNomad.id, name: 'Glasgow West End',
      lat: 55.8724, lng: -4.2900, isRegular: true,
    },
  });

  // Pizza Nomad - Schedule
  await prisma.schedule.create({
    data: {
      vendorId: pizzaNomad.id, locationId: troonBeach.id,
      dayOfWeek: 3, startTime: '17:00', endTime: '21:00',
    },
  });
  await prisma.schedule.create({
    data: {
      vendorId: pizzaNomad.id, locationId: glasgowWestEnd.id,
      dayOfWeek: 6, startTime: '12:00', endTime: '20:00',
    },
  });

  console.log('  ✅ Pizza Nomad created');

  // ──────────────────────────────────────────────
  // Vendor 3: The Coffee Van
  // ──────────────────────────────────────────────
  const coffeeVan = await prisma.vendor.create({
    data: {
      slug: 'the-coffee-van',
      name: 'The Coffee Van',
      description: "Specialty coffee & fresh pastries from our vintage Citroën H. Find us at markets across Ayrshire.",
      primaryColor: '#059669',
      secondaryColor: '#064E3B',
      cuisineType: 'Coffee & Pastries',
      email: 'coffee@example.com',
      passwordHash,
      preOrderingEnabled: true,
    },
  });

  const hotDrinks = await prisma.menuCategory.create({
    data: { vendorId: coffeeVan.id, name: 'Hot Drinks', sortOrder: 0 },
  });
  const coldDrinks = await prisma.menuCategory.create({
    data: { vendorId: coffeeVan.id, name: 'Cold Drinks', sortOrder: 1 },
  });
  const pastries = await prisma.menuCategory.create({
    data: { vendorId: coffeeVan.id, name: 'Pastries', sortOrder: 2 },
  });
  const breakfast = await prisma.menuCategory.create({
    data: { vendorId: coffeeVan.id, name: 'Breakfast', sortOrder: 3 },
  });

  // Coffee Van - Hot Drinks
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: hotDrinks.id,
      name: 'Flat White', description: 'Double shot with velvety steamed milk.',
      price: 320, allergens: ['dairy'], dietaryTags: [], sortOrder: 0,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: hotDrinks.id,
      name: 'Americano', description: 'Double espresso with hot water.',
      price: 280, allergens: [], dietaryTags: ['vegan'], sortOrder: 1,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: hotDrinks.id,
      name: 'Cappuccino', description: 'Espresso with steamed milk and foam.',
      price: 320, allergens: ['dairy'], dietaryTags: [], sortOrder: 2,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: hotDrinks.id,
      name: 'Oat Latte', description: 'Espresso with oat milk.',
      price: 350, allergens: [], dietaryTags: ['vegan'], sortOrder: 3,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: hotDrinks.id,
      name: 'Hot Chocolate', description: 'Rich hot chocolate with steamed milk.',
      price: 350, allergens: ['dairy'], dietaryTags: [], sortOrder: 4,
    },
  });

  // Coffee Van - Cold Drinks
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: coldDrinks.id,
      name: 'Iced Latte', description: 'Espresso over ice with cold milk.',
      price: 380, allergens: ['dairy'], dietaryTags: [], sortOrder: 0,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: coldDrinks.id,
      name: 'Cold Brew', description: '18-hour steeped cold brew coffee.',
      price: 350, allergens: [], dietaryTags: ['vegan'], sortOrder: 1,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: coldDrinks.id,
      name: 'Fresh OJ', description: 'Freshly squeezed orange juice.',
      price: 300, allergens: [], dietaryTags: ['vegan'], sortOrder: 2,
    },
  });

  // Coffee Van - Pastries
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: pastries.id,
      name: 'Croissant', description: 'Flaky butter croissant.',
      price: 280, allergens: ['gluten', 'dairy', 'eggs'], dietaryTags: [], sortOrder: 0,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: pastries.id,
      name: 'Pain au Chocolat', description: 'Chocolate-filled pastry.',
      price: 300, allergens: ['gluten', 'dairy', 'eggs'], dietaryTags: [], sortOrder: 1,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: pastries.id,
      name: 'Cinnamon Roll', description: 'Freshly baked cinnamon roll with icing.',
      price: 350, allergens: ['gluten', 'dairy', 'eggs'], dietaryTags: [], sortOrder: 2,
    },
  });

  // Coffee Van - Breakfast
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: breakfast.id,
      name: 'Bacon Roll', description: 'Smoked bacon on a morning roll.',
      price: 450, allergens: ['gluten'], dietaryTags: [], sortOrder: 0,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: breakfast.id,
      name: 'Sausage Roll', description: 'Square sausage on a morning roll.',
      price: 400, allergens: ['gluten'], dietaryTags: [], sortOrder: 1,
    },
  });
  await prisma.menuItem.create({
    data: {
      vendorId: coffeeVan.id, categoryId: breakfast.id,
      name: 'Porridge', description: 'Creamy porridge oats with honey.',
      price: 350, allergens: ['gluten'], dietaryTags: [], sortOrder: 2,
    },
  });

  // Coffee Van - Locations
  const ayrFarmersMarket = await prisma.location.create({
    data: {
      vendorId: coffeeVan.id, name: 'Ayr Farmers Market',
      lat: 55.4608, lng: -4.6290, isRegular: true,
    },
  });
  const prestwickMainSt = await prisma.location.create({
    data: {
      vendorId: coffeeVan.id, name: 'Prestwick Main Street',
      lat: 55.4948, lng: -4.6147, isRegular: true,
    },
  });

  // Coffee Van - Schedule
  await prisma.schedule.create({
    data: {
      vendorId: coffeeVan.id, locationId: ayrFarmersMarket.id,
      dayOfWeek: 6, startTime: '08:00', endTime: '14:00',
    },
  });
  await prisma.schedule.create({
    data: {
      vendorId: coffeeVan.id, locationId: prestwickMainSt.id,
      dayOfWeek: 0, startTime: '09:00', endTime: '13:00',
    },
  });
  await prisma.schedule.create({
    data: {
      vendorId: coffeeVan.id, locationId: ayrFarmersMarket.id,
      dayOfWeek: 3, startTime: '08:00', endTime: '12:00',
    },
  });

  console.log('  ✅ The Coffee Van created');

  // ──────────────────────────────────────────────
  // Demo Customers
  // ──────────────────────────────────────────────
  const sarah = await prisma.customer.create({
    data: {
      name: 'Sarah Mitchell',
      email: 'sarah@example.com',
      passwordHash,
    },
  });

  const james = await prisma.customer.create({
    data: {
      name: 'James Wilson',
      email: 'james@example.com',
      passwordHash,
    },
  });

  console.log('  ✅ Demo customers created');

  // ──────────────────────────────────────────────
  // Follows
  // ──────────────────────────────────────────────
  await prisma.follow.createMany({
    data: [
      { customerId: sarah.id, vendorId: dannys.id },
      { customerId: sarah.id, vendorId: pizzaNomad.id },
      { customerId: james.id, vendorId: dannys.id },
      { customerId: james.id, vendorId: pizzaNomad.id },
      { customerId: james.id, vendorId: coffeeVan.id },
    ],
  });

  console.log('  ✅ Follows created');

  // ──────────────────────────────────────────────
  // Live Session for Danny's Chippy at Tesco Prestwick
  // ──────────────────────────────────────────────
  const liveSession = await prisma.liveSession.create({
    data: {
      vendorId: dannys.id,
      locationId: tescoPrestwick.id,
      lat: tescoPrestwick.lat,
      lng: tescoPrestwick.lng,
      startedAt: new Date(),
    },
  });

  console.log('  ✅ Live session created');

  // ──────────────────────────────────────────────
  // Sample Orders for Sarah from Danny's Chippy
  // ──────────────────────────────────────────────
  await prisma.order.create({
    data: {
      vendorId: dannys.id,
      customerId: sarah.id,
      liveSessionId: liveSession.id,
      customerName: 'Sarah Mitchell',
      items: [
        { menuItemId: fishSupper.id, name: 'Fish Supper', price: 750, quantity: 1 },
        { menuItemId: mushyPeas.id, name: 'Mushy Peas', price: 150, quantity: 1 },
        { menuItemId: irnBru.id, name: 'Irn-Bru', price: 150, quantity: 2 },
      ],
      subtotal: 1200,
      total: 1200,
      status: 'collected',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    },
  });

  await prisma.order.create({
    data: {
      vendorId: dannys.id,
      customerId: sarah.id,
      liveSessionId: liveSession.id,
      customerName: 'Sarah Mitchell',
      items: [
        { menuItemId: fishSupper.id, name: 'Fish Supper', price: 750, quantity: 2 },
        { menuItemId: mushyPeas.id, name: 'Mushy Peas', price: 150, quantity: 2 },
      ],
      subtotal: 1800,
      total: 1800,
      status: 'confirmed',
      createdAt: new Date(),
    },
  });

  console.log('  ✅ Sample orders created');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
