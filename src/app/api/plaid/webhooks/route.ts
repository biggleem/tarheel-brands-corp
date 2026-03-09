import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { webhook_type, webhook_code, item_id } = body
    const supabase = createAdminClient()

    switch (webhook_type) {
      case 'TRANSACTIONS': {
        if (webhook_code === 'SYNC_UPDATES_AVAILABLE') {
          // Find our plaid_item by Plaid's item_id
          const { data: plaidItem } = await supabase
            .schema('corp' as any)
            .from('plaid_items')
            .select('id')
            .eq('item_id', item_id)
            .single()

          if (plaidItem) {
            // Trigger transaction sync
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/plaid/sync-transactions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ item_id: (plaidItem as any).id }),
            })
          }
        }
        break
      }

      case 'ITEM': {
        if (webhook_code === 'ERROR') {
          await supabase
            .schema('corp' as any)
            .from('plaid_items')
            .update({
              status: 'error',
              error_code: body.error?.error_code,
              error_message: body.error?.error_message,
            })
            .eq('item_id', item_id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
