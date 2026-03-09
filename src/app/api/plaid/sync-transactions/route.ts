import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { plaidClient } from '@/lib/plaid/client'
import { decrypt } from '@/lib/plaid/encryption'

export async function POST(request: Request) {
  try {
    const { item_id } = await request.json()
    const supabase = createAdminClient()

    // Get the Plaid item
    const { data: plaidItem, error } = await supabase
      .schema('corp' as any)
      .from('plaid_items')
      .select('*')
      .eq('id', item_id)
      .single()

    if (error || !plaidItem) {
      return NextResponse.json({ error: 'Plaid item not found' }, { status: 404 })
    }

    const item = plaidItem as any
    const accessToken = decrypt(item.access_token)
    let cursor = item.transaction_cursor || undefined
    let hasMore = true
    let added = 0
    let modified = 0
    let removed = 0

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor,
      })

      const data = response.data

      // Process added transactions
      for (const txn of data.added) {
        // Find which plaid_account this belongs to
        const { data: account } = await supabase
          .schema('corp' as any)
          .from('plaid_accounts')
          .select('id')
          .eq('plaid_account_id', txn.account_id)
          .single()

        if (account) {
          await supabase
            .schema('corp' as any)
            .from('plaid_transactions')
            .upsert({
              plaid_account_id: (account as any).id,
              org_id: item.org_id,
              plaid_transaction_id: txn.transaction_id,
              amount: txn.amount,
              date: txn.date,
              name: txn.name,
              merchant_name: txn.merchant_name,
              category: txn.category,
              pending: txn.pending,
              is_categorized: false,
            }, { onConflict: 'plaid_transaction_id' })
        }
        added++
      }

      // Process modified transactions
      for (const txn of data.modified) {
        await supabase
          .schema('corp' as any)
          .from('plaid_transactions')
          .update({
            amount: txn.amount,
            name: txn.name,
            merchant_name: txn.merchant_name,
            category: txn.category,
            pending: txn.pending,
          })
          .eq('plaid_transaction_id', txn.transaction_id)
        modified++
      }

      // Process removed transactions
      for (const txn of data.removed) {
        await supabase
          .schema('corp' as any)
          .from('plaid_transactions')
          .delete()
          .eq('plaid_transaction_id', txn.transaction_id)
        removed++
      }

      cursor = data.next_cursor
      hasMore = data.has_more
    }

    // Update cursor and last synced
    await supabase
      .schema('corp' as any)
      .from('plaid_items')
      .update({
        transaction_cursor: cursor,
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', item_id)

    return NextResponse.json({ added, modified, removed })
  } catch (error: any) {
    console.error('Transaction sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    )
  }
}
