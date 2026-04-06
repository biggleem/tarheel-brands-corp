import CampaignDetailClient from './campaign-detail-client'

export function generateStaticParams() {
  return [
    { slug: 'koshu-sake-bar-expansion' },
    { slug: 'pittsboro-palooza-2026' },
    { slug: 'metal-brixx-food-truck' },
    { slug: 'carolina-cannabar-renovation' },
    { slug: '1nc-blockchain-dev-fund' },
    { slug: 'chatham-axes-tournament' },
    { slug: 'african-coffee-roastery' },
    { slug: 'trap-sours-brewery-equipment' },
  ]
}

export default function CampaignPage() {
  return <CampaignDetailClient />
}
