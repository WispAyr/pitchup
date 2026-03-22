const ALLERGEN_MAP: Record<string, { label: string; color: string; bg: string }> = {
  gluten: { label: 'Gluten', color: 'text-amber-800', bg: 'bg-amber-100' },
  dairy: { label: 'Dairy', color: 'text-blue-800', bg: 'bg-blue-100' },
  eggs: { label: 'Eggs', color: 'text-yellow-800', bg: 'bg-yellow-100' },
  fish: { label: 'Fish', color: 'text-cyan-800', bg: 'bg-cyan-100' },
  nuts: { label: 'Nuts', color: 'text-amber-900', bg: 'bg-amber-200' },
  soya: { label: 'Soya', color: 'text-green-800', bg: 'bg-green-100' },
  celery: { label: 'Celery', color: 'text-lime-800', bg: 'bg-lime-100' },
  mustard: { label: 'Mustard', color: 'text-yellow-900', bg: 'bg-yellow-200' },
  sesame: { label: 'Sesame', color: 'text-orange-800', bg: 'bg-orange-100' },
  sulphites: { label: 'Sulphites', color: 'text-purple-800', bg: 'bg-purple-100' },
  lupin: { label: 'Lupin', color: 'text-pink-800', bg: 'bg-pink-100' },
  molluscs: { label: 'Molluscs', color: 'text-teal-800', bg: 'bg-teal-100' },
  crustaceans: { label: 'Crustaceans', color: 'text-red-800', bg: 'bg-red-100' },
  peanuts: { label: 'Peanuts', color: 'text-amber-800', bg: 'bg-amber-100' },
}

export function AllergenBadge({ allergen }: { allergen: string }) {
  const info = ALLERGEN_MAP[allergen.toLowerCase()] || {
    label: allergen,
    color: 'text-gray-800',
    bg: 'bg-gray-100',
  }

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${info.bg} ${info.color}`}
    >
      {info.label}
    </span>
  )
}
