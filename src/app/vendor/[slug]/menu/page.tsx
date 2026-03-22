import { prisma } from '@/lib/prisma'
import { MenuPageClient } from './page-client'

export default async function MenuPage({
  params,
}: {
  params: { slug: string }
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    include: {
      menuCategories: {
        orderBy: { sortOrder: 'asc' },
        include: {
          items: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  })

  if (!vendor) return null

  const categories = vendor.menuCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    items: cat.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      allergens: item.allergens,
      dietaryTags: item.dietaryTags,
      available: item.available,
    })),
  }))

  // Collect all unique allergens
  const allAllergens = Array.from(
    new Set(
      vendor.menuCategories.flatMap((cat) =>
        cat.items.flatMap((item) => item.allergens)
      )
    )
  )

  return (
    <MenuPageClient
      categories={categories}
      allAllergens={allAllergens}
      preOrderingEnabled={vendor.preOrderingEnabled}
    />
  )
}
