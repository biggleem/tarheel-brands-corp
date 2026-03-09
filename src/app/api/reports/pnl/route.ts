import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('org_id')
    const startDate = searchParams.get('start_date') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0]

    // Query journal entry lines grouped by account type
    const query = supabase
      .schema('corp' as any)
      .from('journal_entry_lines')
      .select(`
        debit,
        credit,
        account:account_id (
          id,
          account_number,
          name,
          type,
          normal_balance
        ),
        journal_entry:journal_entry_id (
          id,
          entry_date,
          org_id,
          status
        )
      `)

    const { data: lines, error } = await query

    if (error) throw error

    // Process lines into P&L categories
    const revenue: Record<string, number> = {}
    const cogs: Record<string, number> = {}
    const expenses: Record<string, number> = {}

    for (const line of (lines || []) as any[]) {
      if (!line.account || !line.journal_entry) continue
      if (line.journal_entry.status !== 'posted') continue

      const entryDate = line.journal_entry.entry_date
      if (entryDate < startDate || entryDate > endDate) continue
      if (orgId && line.journal_entry.org_id !== orgId) continue

      const accountType = line.account.type
      const accountName = line.account.name
      const netAmount = line.account.normal_balance === 'credit'
        ? (line.credit || 0) - (line.debit || 0)
        : (line.debit || 0) - (line.credit || 0)

      switch (accountType) {
        case 'revenue':
          revenue[accountName] = (revenue[accountName] || 0) + netAmount
          break
        case 'cogs':
          cogs[accountName] = (cogs[accountName] || 0) + netAmount
          break
        case 'expense':
          expenses[accountName] = (expenses[accountName] || 0) + netAmount
          break
      }
    }

    const totalRevenue = Object.values(revenue).reduce((s, v) => s + v, 0)
    const totalCogs = Object.values(cogs).reduce((s, v) => s + v, 0)
    const grossProfit = totalRevenue - totalCogs
    const totalExpenses = Object.values(expenses).reduce((s, v) => s + v, 0)
    const netIncome = grossProfit - totalExpenses

    return NextResponse.json({
      period_start: startDate,
      period_end: endDate,
      org_id: orgId || 'consolidated',
      revenue: Object.entries(revenue).map(([name, amount]) => ({ name, amount })),
      cogs: Object.entries(cogs).map(([name, amount]) => ({ name, amount })),
      expenses: Object.entries(expenses).map(([name, amount]) => ({ name, amount })),
      total_revenue: totalRevenue,
      total_cogs: totalCogs,
      gross_profit: grossProfit,
      total_expenses: totalExpenses,
      net_income: netIncome,
    })
  } catch (error: any) {
    console.error('P&L report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate P&L report' },
      { status: 500 }
    )
  }
}
