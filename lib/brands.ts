import * as icons from 'simple-icons'

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const allBrandsRaw = Object.values(icons).map((icon) => ({
  name: icon.title,
  slug: icon.slug,
  url: `https://cdn.simpleicons.org/${icon.slug}`,
}))

export const allBrands = shuffleArray(allBrandsRaw)
