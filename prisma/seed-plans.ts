import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding plans and features...')

  // Clear existing
  await prisma.vendorAddon.deleteMany()
  await prisma.vendorDiscount.deleteMany()
  await prisma.vendorCredit.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.planFeature.deleteMany()
  await prisma.plan.deleteMany()

  // Create Plan Features
  const features = [
    { slug: 'basic-menu', name: 'Basic Menu', category: 'core', isAddon: false },
    { slug: 'basic-orders', name: 'Basic Orders', category: 'core', isAddon: false },
    { slug: 'pre-ordering', name: 'Pre-ordering', category: 'core', isAddon: false },
    { slug: 'kds', name: 'Kitchen Display System', category: 'core', isAddon: false },
    { slug: 'schedule', name: 'Schedule Management', category: 'core', isAddon: false },
    { slug: 'events', name: 'Event Management', category: 'premium', isAddon: false },
    { slug: 'vouchers', name: 'Vouchers & Deals', category: 'premium', isAddon: false },
    { slug: 'analytics', name: 'Advanced Analytics', category: 'premium', isAddon: false },
    { slug: 'multi-route', name: 'Multi-Route Planning', category: 'premium', isAddon: false },
    { slug: 'custom-domain', name: 'Custom Domain', description: 'Use your own domain for your vendor page', category: 'premium', isAddon: true, monthlyPrice: 999, stripePriceId: null },
    { slug: 'api-access', name: 'API Access', description: 'Full API access for integrations', category: 'premium', isAddon: true, monthlyPrice: 1999, stripePriceId: null },
    { slug: 'white-label', name: 'White Label', description: 'Remove PitchUp branding', category: 'premium', isAddon: true, monthlyPrice: 2999, stripePriceId: null },
    { slug: 'priority-support', name: 'Priority Support', description: 'Fast-track support with dedicated team', category: 'addon', isAddon: true, monthlyPrice: 1499, stripePriceId: null },
    { slug: 'dedicated-support', name: 'Dedicated Support', description: 'Personal account manager', category: 'premium', isAddon: false },
    { slug: 'sms-notifications', name: 'SMS Notifications', description: 'Send SMS updates to customers', category: 'addon', isAddon: true, monthlyPrice: 499, stripePriceId: null },
  ]

  for (const f of features) {
    await prisma.planFeature.create({ data: f })
  }
  console.log('  Features created')

  // Create Plans
  await prisma.plan.create({
    data: {
      name: 'Free',
      slug: 'free',
      monthlyPrice: 0,
      yearlyPrice: null,
      maxVehicles: 1,
      features: JSON.stringify(['basic-menu', 'basic-orders']),
      sortOrder: 0,
    },
  })

  await prisma.plan.create({
    data: {
      name: 'Starter',
      slug: 'starter',
      monthlyPrice: 2900,
      yearlyPrice: 27900,
      maxVehicles: 3,
      features: JSON.stringify(['basic-menu', 'basic-orders', 'pre-ordering', 'kds', 'schedule']),
      sortOrder: 1,
    },
  })

  await prisma.plan.create({
    data: {
      name: 'Pro',
      slug: 'pro',
      monthlyPrice: 5900,
      yearlyPrice: 56900,
      maxVehicles: 99,
      features: JSON.stringify(['basic-menu', 'basic-orders', 'pre-ordering', 'kds', 'schedule', 'events', 'vouchers', 'analytics', 'priority-support', 'multi-route']),
      sortOrder: 2,
    },
  })

  await prisma.plan.create({
    data: {
      name: 'Enterprise',
      slug: 'enterprise',
      monthlyPrice: 9900,
      yearlyPrice: 95900,
      maxVehicles: 999,
      features: JSON.stringify(['basic-menu', 'basic-orders', 'pre-ordering', 'kds', 'schedule', 'events', 'vouchers', 'analytics', 'priority-support', 'multi-route', 'custom-domain', 'api-access', 'white-label', 'dedicated-support']),
      sortOrder: 3,
    },
  })

  console.log('  Plans created')
  console.log('Done!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
