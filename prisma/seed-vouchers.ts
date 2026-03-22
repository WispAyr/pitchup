import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find Joanna's vendor
  const joanna = await prisma.vendor.findFirst({
    where: { name: { contains: 'Joanna' } },
  })

  if (!joanna) {
    console.log('Joanna\'s vendor not found. Looking for any vendor...')
    const anyVendor = await prisma.vendor.findFirst()
    if (!anyVendor) {
      console.log('No vendors found. Please create a vendor first.')
      return
    }
    console.log(`Using vendor: ${anyVendor.name} (${anyVendor.slug})`)
    await seedForVendor(anyVendor.id)
  } else {
    console.log(`Found Joanna's: ${joanna.name} (${joanna.slug})`)
    await seedForVendor(joanna.id)
  }
}

async function seedForVendor(vendorId: string) {
  // Vouchers
  const vouchers = [
    {
      code: 'CHIPPY10',
      type: 'percentage',
      value: 10,
      description: '10% off any order',
      expiresAt: new Date('2026-04-30T23:59:59Z'),
      isActive: true,
    },
    {
      code: 'FIRSTORDER',
      type: 'fixed',
      value: 2,
      description: '£2 off your first order',
      maxUsesPerCustomer: 1,
      isActive: true,
    },
    {
      code: 'IRNBRU',
      type: 'freeItem',
      value: null,
      description: 'Free Irn-Bru with any supper',
      isActive: true,
    },
    {
      code: 'GIFT50',
      type: 'giftCard',
      value: 5000,
      description: '£50 Gift Voucher',
      giftCardBalance: 5000,
      isActive: true,
    },
  ]

  for (const v of vouchers) {
    const existing = await prisma.voucher.findUnique({ where: { code: v.code } })
    if (existing) {
      console.log(`  Voucher ${v.code} already exists, skipping`)
      continue
    }
    await prisma.voucher.create({
      data: {
        vendorId,
        code: v.code,
        type: v.type,
        value: v.value,
        description: v.description,
        expiresAt: v.expiresAt || null,
        maxUsesPerCustomer: v.maxUsesPerCustomer || null,
        isActive: v.isActive,
        giftCardBalance: v.giftCardBalance || null,
        applicableTo: 'all',
      },
    })
    console.log(`  ✅ Created voucher: ${v.code}`)
  }

  // Deals
  const deals = [
    {
      title: 'Family Friday',
      description: '2 fish suppers + 2 kids meals + 4 cans for £25',
      type: 'bundle',
      price: 2500,
      savings: 'Save £8!',
      validDays: JSON.stringify([5]),
      isFeatured: true,
    },
    {
      title: 'Chippy Tea Deal',
      description: 'Any supper + can + mushy peas for £10',
      type: 'bundle',
      price: 1000,
      savings: 'Save £3!',
    },
    {
      title: 'Lunch Special',
      description: 'Any supper for £5 — weekday lunchtimes only',
      type: 'happyHour',
      price: 500,
      savings: 'Save £4!',
      validDays: JSON.stringify([1, 2, 3, 4, 5]),
      validFrom: '12:00',
      validTo: '14:00',
    },
  ]

  for (const d of deals) {
    const existing = await prisma.deal.findFirst({
      where: { vendorId, title: d.title },
    })
    if (existing) {
      console.log(`  Deal "${d.title}" already exists, skipping`)
      continue
    }
    await prisma.deal.create({
      data: {
        vendorId,
        title: d.title,
        description: d.description,
        type: d.type,
        price: d.price || null,
        savings: d.savings || null,
        validDays: d.validDays || null,
        validFrom: d.validFrom || null,
        validTo: d.validTo || null,
        isFeatured: d.isFeatured || false,
        isActive: true,
      },
    })
    console.log(`  ✅ Created deal: ${d.title}`)
  }

  console.log('\n🎉 Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
