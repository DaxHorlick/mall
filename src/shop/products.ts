import type { CatalogSlug } from '../i18n/zh.ts'
import campaign from '../assets/campaign.png'
import emptyBag from '../assets/empty-bag.png'
import hoodie from '../assets/hoodie.png'
import studio from '../assets/studio.png'
import teeFlower from '../assets/tee-flower.png'
import teeSun from '../assets/tee-sun.png'

export type Product = {
  slug: CatalogSlug
  name: string
  creator: string
  code: string
  priceCents: number
  homeTag: string
  tag: string
  group: 'bestseller' | 'community' | 'new'
  color: string
  material: string
  sizes: string[]
  details: string[]
  image: string
  votable: boolean
}

export const products: Product[] = [
  {
    slug: 'a-little-outside-the-lines',
    name: 'A little outside the lines',
    creator: 'Studio Mellow',
    code: 'STUDIO MELLOW / ORIGINAL 001',
    priceCents: 2900,
    homeTag: 'BESTSELLER',
    tag: 'BESTSELLER',
    group: 'bestseller',
    color: 'Natural',
    material: 'Organic cotton tee · XS–XXL',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    details: [
      'An original idea on your new everyday favorite.',
      '100% organic cotton. Relaxed unisex fit. Made for repeat wear.',
    ],
    image: teeSun,
    votable: true,
  },
  {
    slug: 'stay-a-little-wild',
    name: 'Stay a little wild',
    creator: 'Odd Garden',
    code: 'ODD GARDEN / ORIGINAL 002',
    priceCents: 3200,
    homeTag: 'COMMUNITY',
    tag: 'COMMUNITY PICK',
    group: 'community',
    color: 'Washed Black',
    material: 'Organic cotton tee · XS–XXL',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    details: [
      'An original idea on your new everyday favorite.',
      '100% organic cotton. Relaxed unisex fit. Made for repeat wear.',
    ],
    image: teeFlower,
    votable: true,
  },
  {
    slug: 'less-noise-more-space',
    name: 'Less noise. More space.',
    creator: 'Off Hours',
    code: 'OFF HOURS / ORIGINAL 003',
    priceCents: 5400,
    homeTag: 'NEW DROP',
    tag: 'NEW DROP',
    group: 'new',
    color: 'Cobalt Blue',
    material: 'Heavyweight hoodie · S–XXL',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: [
      'A little more room. A little less noise. A heavyweight',
      'hoodie with a relaxed fit and a quietly original print.',
    ],
    image: hoodie,
    votable: false,
  },
]

export const campaignImage = campaign
export const studioImage = studio
export const emptyBagImage = emptyBag
export const shippingCents = 490

export function formatEuro(cents: number, decimals = false) {
  const amount = cents / 100
  if (decimals) return `€${amount.toFixed(2)}`
  return `€${Math.round(amount)}`
}

export function goodsCents(slugs: string[]) {
  return slugs.reduce((sum, slug) => {
    const product = products.find((item) => item.slug === slug)
    return sum + (product?.priceCents ?? 0)
  }, 0)
}
