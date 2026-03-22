import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Delete existing Joanna's data
  const existing = await prisma.vendor.findUnique({ where: { slug: 'joannas-chippy' } })
  if (existing) {
    console.log("Deleting existing Joanna's Chippy data...")
    await prisma.vendor.delete({ where: { id: existing.id } })
  }

  const passwordHash = await bcrypt.hash('password123', 12)

  // Create vendor
  const vendor = await prisma.vendor.create({
    data: {
      slug: 'joannas-chippy',
      name: "Joanna's Chippy Van",
      description: "Multi award-winning traditional fish & chips, serving communities across Ayrshire. Winner of Best Mobile Fish & Chips at the Scottish Fish & Chip Awards 2025. Nominee at The Vendies.",
      cuisineType: 'Fish & Chips',
      email: 'joanna@example.com',
      phone: '07711 800 507',
      facebook: 'https://facebook.com/JoannasChippy',
      instagram: '@joannachippy',
      primaryColor: '#2979FF',
      secondaryColor: '#64B5F6',
      preOrderingEnabled: true,
      templateId: 'bold',
      passwordHash,
    },
  })
  console.log(`Created vendor: ${vendor.name} (${vendor.id})`)

  // Vehicles
  const van1 = await prisma.vehicle.create({ data: { vendorId: vendor.id, name: 'Van 1 "Big Alex"', make: 'Peugeot', model: 'Boxer', role: 'route', status: 'active' } })
  const van2 = await prisma.vehicle.create({ data: { vendorId: vendor.id, name: 'Van 2', make: 'Renault', model: 'Master (MaxiMover)', registration: 'WP75 NDU', role: 'route', status: 'active' } })
  const van3 = await prisma.vehicle.create({ data: { vendorId: vendor.id, name: 'Van 3 "Chris"', make: 'Renault', model: 'Master', role: 'route', status: 'active' } })
  const van4 = await prisma.vehicle.create({ data: { vendorId: vendor.id, name: 'Van 4 (Events)', make: 'Renault', model: 'Master', role: 'events', status: 'active', notes: 'Dedicated events/hire van, separate from route vans. White/silver.' } })
  console.log('Created 4 vehicles')

  // Locations
  const locs: Record<string, { name: string; lat: number; lng: number }> = {
    moorfield:       { name: 'Moorfield, Dumfries Drive', lat: 55.612, lng: -4.495 },
    johnwalker:      { name: 'John Walker Drive', lat: 55.610, lng: -4.490 },
    altonhill:       { name: 'Alton Hill, Woodhill Road', lat: 55.605, lng: -4.485 },
    mossblown:       { name: 'Mossblown, Old Library', lat: 55.460, lng: -4.580 },
    annbank:         { name: 'Annbank, Weston Avenue', lat: 55.445, lng: -4.560 },
    auchinleck:      { name: 'Auchinleck Indoor Bowling Club', lat: 55.470, lng: -4.295 },
    monkton:         { name: 'Monkton, at the Nursery', lat: 55.465, lng: -4.615 },
    symington:       { name: 'Symington, at the Co-op', lat: 55.520, lng: -4.565 },
    newcumnock:      { name: 'New Cumnock Swimming Pool', lat: 55.395, lng: -4.185 },
    highpark:        { name: 'Highpark Avenue', lat: 55.400, lng: -4.180 },
    fenwick:         { name: 'Fenwick Main Street', lat: 55.575, lng: -4.435 },
    bourtreehill:    { name: 'Bourtreehill, Crofthead Court', lat: 55.625, lng: -4.670 },
    dalry:           { name: 'Dalry Community Centre', lat: 55.710, lng: -4.720 },
    beith:           { name: 'Beith', lat: 55.750, lng: -4.635 },
    saltcoats:       { name: 'Saltcoats, Glenbanks Rd', lat: 55.635, lng: -4.790 },
    ardrossan:       { name: 'Ardrossan, Stanley Rd', lat: 55.645, lng: -4.815 },
    whitehurst:      { name: 'Whitehurst Park', lat: 55.620, lng: -4.680 },
    pennyburn:       { name: 'Pennyburn', lat: 55.615, lng: -4.685 },
    castlepark:      { name: 'Castlepark Community Centre', lat: 55.625, lng: -4.665 },
    turnpike:        { name: 'Turnpike Way, Montgomerie Park', lat: 55.630, lng: -4.660 },
    stevenstontop:   { name: 'Stevenston Top End', lat: 55.640, lng: -4.755 },
    stevenstonbot:   { name: 'Stevenston Bottom End', lat: 55.635, lng: -4.760 },
  }

  const locDb: Record<string, any> = {}
  for (const [key, loc] of Object.entries(locs)) {
    locDb[key] = await prisma.location.create({
      data: { vendorId: vendor.id, name: loc.name, lat: loc.lat, lng: loc.lng, isRegular: true },
    })
  }
  console.log(`Created ${Object.keys(locDb).length} locations`)

  // Routes — Van 1 "Big Alex"
  const van1Routes = [
    { name: 'Tuesday Evening Route', dayOfWeek: 2, stops: [
      { loc: 'moorfield', start: '17:00', end: '18:00' },
      { loc: 'johnwalker', start: '18:15', end: '19:00' },
      { loc: 'altonhill', start: '19:15', end: '20:00' },
    ]},
    { name: 'Wednesday Route', dayOfWeek: 3, stops: [
      { loc: 'mossblown', start: '16:30', end: '17:30' },
      { loc: 'annbank', start: '17:40', end: '19:00' },
    ]},
    { name: 'Thursday Route', dayOfWeek: 4, stops: [
      { loc: 'auchinleck', start: '17:00', end: '19:00' },
    ]},
    { name: 'Friday Route', dayOfWeek: 5, stops: [
      { loc: 'monkton', start: '16:30', end: '18:00' },
      { loc: 'symington', start: '18:30', end: '19:30' },
    ]},
    { name: 'Saturday Route', dayOfWeek: 6, stops: [
      { loc: 'newcumnock', start: '17:00', end: '19:00' },
      { loc: 'highpark', start: '19:15', end: '20:00' },
    ]},
    { name: 'Sunday Route', dayOfWeek: 0, stops: [
      { loc: 'fenwick', start: '17:00', end: '19:00' },
    ]},
  ]

  const van3Routes = [
    { name: 'Tuesday Route', dayOfWeek: 2, stops: [
      { loc: 'bourtreehill', start: '17:00', end: '19:00' },
    ]},
    { name: 'Wednesday Route', dayOfWeek: 3, stops: [
      { loc: 'dalry', start: '16:30', end: '18:00' },
      { loc: 'beith', start: '18:30', end: '20:00' },
    ]},
    { name: 'Thursday Route', dayOfWeek: 4, stops: [
      { loc: 'saltcoats', start: '16:30', end: '18:00' },
      { loc: 'ardrossan', start: '18:30', end: '20:00' },
    ]},
    { name: 'Friday Route', dayOfWeek: 5, stops: [
      { loc: 'whitehurst', start: '16:30', end: '18:00' },
      { loc: 'pennyburn', start: '18:30', end: '20:00' },
    ]},
    { name: 'Saturday Route', dayOfWeek: 6, stops: [
      { loc: 'castlepark', start: '16:30', end: '18:00' },
      { loc: 'turnpike', start: '18:30', end: '20:00' },
    ]},
    { name: 'Sunday Route', dayOfWeek: 0, stops: [
      { loc: 'stevenstontop', start: '16:30', end: '18:00' },
      { loc: 'stevenstonbot', start: '18:30', end: '20:00' },
    ]},
  ]

  let routeCount = 0
  for (const r of van1Routes) {
    await prisma.route.create({
      data: {
        vendorId: vendor.id,
        vehicleId: van1.id,
        name: r.name,
        dayOfWeek: r.dayOfWeek,
        isActive: true,
        stops: {
          create: r.stops.map((s, i) => ({
            locationId: locDb[s.loc].id,
            startTime: s.start,
            endTime: s.end,
            sortOrder: i,
          })),
        },
      },
    })
    routeCount++
  }
  for (const r of van3Routes) {
    await prisma.route.create({
      data: {
        vendorId: vendor.id,
        vehicleId: van3.id,
        name: r.name,
        dayOfWeek: r.dayOfWeek,
        isActive: true,
        stops: {
          create: r.stops.map((s, i) => ({
            locationId: locDb[s.loc].id,
            startTime: s.start,
            endTime: s.end,
            sortOrder: i,
          })),
        },
      },
    })
    routeCount++
  }
  console.log(`Created ${routeCount} routes`)

  // Menu categories
  const mains = await prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Mains (Suppers)', sortOrder: 0 } })
  const singles = await prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Singles (No Chips)', sortOrder: 1 } })
  const chips = await prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Chips', sortOrder: 2 } })
  const sides = await prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Sides', sortOrder: 3 } })
  const kids = await prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Kids Meals', sortOrder: 4 } })
  const drinks = await prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Drinks', sortOrder: 5 } })
  const specials = await prisma.menuCategory.create({ data: { vendorId: vendor.id, name: 'Specials & Deals', sortOrder: 6 } })

  // Menu items
  const mainsItems = [
    { name: 'Fish Supper', desc: 'Fresh haddock in crispy batter with chips', price: 850 },
    { name: 'Sausage Supper', desc: 'Battered sausage with chips', price: 700 },
    { name: 'Chicken Supper', desc: 'Battered chicken fillet with chips', price: 750 },
    { name: 'King Rib Supper', desc: 'Battered king rib with chips', price: 750 },
    { name: 'Haggis Supper', desc: 'Battered haggis with chips', price: 700 },
    { name: 'Pizza Supper', desc: 'Battered pizza with chips', price: 700 },
    { name: 'Black Pudding Supper', desc: 'Battered black pudding with chips', price: 700 },
    { name: 'White Pudding Supper', desc: 'Battered white pudding with chips', price: 700 },
    { name: 'Smoked Sausage Supper', desc: 'Battered smoked sausage with chips', price: 750 },
    { name: 'Burger Supper', desc: 'Quarter pounder with chips', price: 750 },
    { name: 'Hamburger Supper', desc: 'Classic hamburger with chips', price: 750 },
    { name: 'Scampi Supper', desc: 'Battered scampi with chips', price: 800 },
    { name: 'Chicken Nuggets & Chips', desc: '6 pcs with chips', price: 650 },
  ]

  const singlesItems = [
    { name: 'Fish Single', desc: null, price: 550 },
    { name: 'Sausage Single', desc: null, price: 400 },
    { name: 'Chicken Single', desc: null, price: 450 },
    { name: 'King Rib Single', desc: null, price: 450 },
    { name: 'Haggis Single', desc: null, price: 400 },
    { name: 'Pizza Single', desc: null, price: 400 },
  ]

  const chipsItems = [
    { name: 'Small Chips', desc: null, price: 300 },
    { name: 'Large Chips', desc: null, price: 350 },
    { name: 'Chips & Cheese', desc: null, price: 450 },
    { name: 'Chips & Curry', desc: null, price: 500 },
    { name: 'Chips & Cheese & Curry', desc: null, price: 550 },
  ]

  const sidesItems = [
    { name: 'Potato Rings', desc: null, price: 250 },
    { name: 'Onion Rings', desc: null, price: 250 },
    { name: 'Tub Curry Sauce', desc: null, price: 100 },
    { name: 'Tub Mushy Peas', desc: null, price: 100 },
    { name: 'Tub Gravy', desc: null, price: 100 },
    { name: 'Pickled Onion', desc: null, price: 60 },
    { name: 'Pickled Egg', desc: null, price: 80 },
    { name: 'Bread & Butter', desc: null, price: 100 },
  ]

  const kidsItems = [
    { name: 'Kids Fish & Chips', desc: null, price: 500 },
    { name: 'Kids Chicken Nuggets & Chips', desc: null, price: 450 },
    { name: 'Kids Sausage & Chips', desc: null, price: 450 },
  ]

  const drinksItems = [
    { name: 'Irn-Bru', desc: null, price: 150 },
    { name: 'Coca-Cola', desc: null, price: 150 },
    { name: 'Diet Coke', desc: null, price: 150 },
    { name: 'Fanta', desc: null, price: 150 },
    { name: 'Water', desc: null, price: 100 },
  ]

  const specialsItems = [
    { name: 'Family Deal', desc: '2 fish suppers + 2 kids meals + 4 cans', price: 2500 },
    { name: 'Chippy Tea Deal', desc: 'Any supper + can + mushy peas', price: 1000 },
    { name: 'Gift Voucher', desc: '£50 gift voucher', price: 5000 },
  ]

  type ItemDef = { name: string; desc: string | null; price: number }
  const allGroups: { catId: string; items: ItemDef[] }[] = [
    { catId: mains.id, items: mainsItems },
    { catId: singles.id, items: singlesItems },
    { catId: chips.id, items: chipsItems },
    { catId: sides.id, items: sidesItems },
    { catId: kids.id, items: kidsItems },
    { catId: drinks.id, items: drinksItems },
    { catId: specials.id, items: specialsItems },
  ]

  const createdItems: Record<string, string> = {} // name -> id
  let itemCount = 0
  for (const group of allGroups) {
    for (let i = 0; i < group.items.length; i++) {
      const item = group.items[i]
      const created = await prisma.menuItem.create({
        data: {
          vendorId: vendor.id,
          categoryId: group.catId,
          name: item.name,
          description: item.desc,
          price: item.price,
          sortOrder: i,
        },
      })
      createdItems[item.name] = created.id
      itemCount++
    }
  }
  console.log(`Created ${itemCount} menu items`)

  // Lunch special pricing (12:00-14:00 Mon-Fri)
  const lunchItems: { name: string; price: number }[] = [
    { name: 'Fish Supper', price: 600 },
    { name: 'Sausage Supper', price: 500 },
    { name: 'Chicken Nuggets & Chips', price: 500 },
    { name: 'Hamburger Supper', price: 500 },
    { name: 'Pizza Supper', price: 500 },
    { name: 'Small Chips', price: 300 },
  ]

  let pricingCount = 0
  for (const lp of lunchItems) {
    const itemId = createdItems[lp.name]
    if (itemId) {
      await prisma.menuPricing.create({
        data: {
          menuItemId: itemId,
          label: 'Lunch Special',
          price: lp.price,
          startTime: '12:00',
          endTime: '14:00',
          daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
          isActive: true,
        },
      })
      pricingCount++
    }
  }

  // Also add lunch-only items: Add Curry and ½ Pizza Single as pricing variants
  // Add Curry (lunch) = Tub Curry Sauce at £1.00 — already £1.00 so same
  // ½ Pizza Single at lunch = Pizza Single at £3.00
  const pizzaSingleId = createdItems['Pizza Single']
  if (pizzaSingleId) {
    await prisma.menuPricing.create({
      data: {
        menuItemId: pizzaSingleId,
        label: 'Lunch Special',
        price: 300,
        startTime: '12:00',
        endTime: '14:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        isActive: true,
      },
    })
    pricingCount++
  }

  console.log(`Created ${pricingCount} lunch pricing rules`)

  console.log('\n✅ Joanna\'s Chippy Van seeded successfully!')
  console.log(`   ${Object.keys(locDb).length} locations, ${routeCount} routes, ${itemCount} menu items, ${pricingCount} pricing rules`)
  console.log(`   4 vehicles (3 route + 1 events)`)
  console.log(`   Login: joanna@example.com / password123`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
