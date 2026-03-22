import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { plaidClient } from '@/lib/plaid/client'
import { CountryCode, Products } from 'plaid'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { org_id } = body

    if (!org_id) {
      return NextResponse.json({ error: 'org_id required' }, { status: 400 })
    }

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: 'South Armz Global Inc Manager',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/plaid/webhooks`,
    })

    return NextResponse.json({ link_token: response.data.link_token })
  } catch (error: any) {
    console.error('Plaid link token error:', error)
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    )
  }
}
