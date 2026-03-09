import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { plaidClient } from '@/lib/plaid/client'
import { encrypt } from '@/lib/plaid/encryption'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { public_token, org_id, metadata } = await request.json()

    if (!public_token || !org_id) {
      return NextResponse.json({ error: 'public_token and org_id required' }, { status: 400 })
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const { access_token, item_id } = exchangeResponse.data
    const encryptedToken = encrypt(access_token)

    // Save Plaid item
    const { data: plaidItem, error: itemError } = await supabase
      .schema('corp' as any)
      .from('plaid_items')
      .insert({
        org_id,
        access_token: encryptedToken,
        item_id,
        institution_id: metadata?.institution?.institution_id,
        institution_name: metadata?.institution?.name,
        status: 'active',
      })
      .select()
      .single()

    if (itemError) throw itemError

    // Fetch and save accounts
    const accountsResponse = await plaidClient.accountsGet({ access_token })

    for (const account of accountsResponse.data.accounts) {
      await supabase
        .schema('corp' as any)
        .from('plaid_accounts')
        .insert({
          plaid_item_id: (plaidItem as any).id,
          org_id,
          plaid_account_id: account.account_id,
          name: account.name,
          official_name: account.official_name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
          current_balance: account.balances.current,
          available_balance: account.balances.available,
          currency_code: account.balances.iso_currency_code || 'USD',
          last_balance_update: new Date().toISOString(),
        })
    }

    return NextResponse.json({ success: true, item_id: (plaidItem as any).id })
  } catch (error: any) {
    console.error('Plaid exchange error:', error)
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    )
  }
}
