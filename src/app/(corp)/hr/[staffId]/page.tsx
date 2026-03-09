import StaffDetailClient from './staff-detail-client'

export function generateStaticParams() {
  return [
    { staffId: 'staff-001' },
    { staffId: 'staff-002' },
  ]
}

export default function StaffDetailPage() {
  return <StaffDetailClient />
}
