import BusinessDetailClient from './business-detail-client'

export function generateStaticParams() {
  return [
    { orgId: 'brax-bbq' },
    { orgId: 'tarheel-burger' },
    { orgId: '1nc-blockchain' },
  ]
}

export default function BusinessDetailPage() {
  return <BusinessDetailClient />
}
