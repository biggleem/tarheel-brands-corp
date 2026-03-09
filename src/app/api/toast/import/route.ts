import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import Papa from 'papaparse'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const orgId = formData.get('org_id') as string
    const importType = formData.get('import_type') as string

    if (!file || !orgId || !importType) {
      return NextResponse.json(
        { error: 'file, org_id, and import_type required' },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing errors', details: parsed.errors.slice(0, 5) },
        { status: 400 }
      )
    }

    // Get staff profile for imported_by
    const { data: staffProfile } = await supabase
      .schema('corp' as any)
      .from('staff_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Create import record
    const { data: importRecord, error: importError } = await supabase
      .schema('corp' as any)
      .from('toast_imports')
      .insert({
        org_id: orgId,
        file_name: file.name,
        import_type: importType,
        row_count: parsed.data.length,
        status: 'processing',
        imported_by: staffProfile ? (staffProfile as any).id : null,
      })
      .select()
      .single()

    if (importError) throw importError

    const importId = (importRecord as any).id
    let successCount = 0
    const errors: string[] = []

    if (importType === 'sales') {
      for (const row of parsed.data as any[]) {
        try {
          await supabase
            .schema('corp' as any)
            .from('toast_sales')
            .insert({
              import_id: importId,
              org_id: orgId,
              order_id: row['Order ID'] || row['order_id'],
              order_date: row['Date'] || row['order_date'] || new Date().toISOString(),
              order_type: row['Order Type'] || row['order_type'],
              item_name: row['Item'] || row['item_name'],
              item_category: row['Category'] || row['item_category'],
              quantity: parseInt(row['Qty'] || row['quantity'] || '1'),
              gross_amount: parseFloat(row['Gross Amount'] || row['gross_amount'] || '0'),
              discount: parseFloat(row['Discount'] || row['discount'] || '0'),
              net_amount: parseFloat(row['Net Amount'] || row['net_amount'] || '0'),
              tax: parseFloat(row['Tax'] || row['tax'] || '0'),
              tip: parseFloat(row['Tip'] || row['tip'] || '0'),
              payment_type: row['Payment Type'] || row['payment_type'],
              server_name: row['Server'] || row['server_name'],
              customer_email: row['Email'] || row['customer_email'],
              customer_phone: row['Phone'] || row['customer_phone'],
            })
          successCount++
        } catch (e: any) {
          errors.push(`Row error: ${e.message}`)
        }
      }
    } else if (importType === 'customers') {
      for (const row of parsed.data as any[]) {
        try {
          await supabase
            .schema('corp' as any)
            .from('toast_customers')
            .upsert({
              org_id: orgId,
              email: row['Email'] || row['email'],
              phone: row['Phone'] || row['phone'],
              first_name: row['First Name'] || row['first_name'],
              last_name: row['Last Name'] || row['last_name'],
              first_visit: row['First Visit'] || row['first_visit'],
              last_visit: row['Last Visit'] || row['last_visit'],
              total_visits: parseInt(row['Visits'] || row['total_visits'] || '1'),
              total_spent: parseFloat(row['Total Spent'] || row['total_spent'] || '0'),
              source: 'toast',
              opted_in_marketing: (row['Marketing'] || row['opted_in']) === 'true',
            }, { onConflict: 'email' as any })
          successCount++
        } catch (e: any) {
          errors.push(`Row error: ${e.message}`)
        }
      }
    }

    // Update import record
    await supabase
      .schema('corp' as any)
      .from('toast_imports')
      .update({
        status: errors.length === 0 ? 'completed' : 'completed',
        error_log: errors.length > 0 ? errors.join('\n') : null,
        row_count: successCount,
      })
      .eq('id', importId)

    return NextResponse.json({
      success: true,
      import_id: importId,
      rows_imported: successCount,
      errors: errors.slice(0, 10),
    })
  } catch (error: any) {
    console.error('Toast import error:', error)
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    )
  }
}
