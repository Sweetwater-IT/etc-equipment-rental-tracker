import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('equipment_entries')
    .select(`
      *,
      equipment:equipment_id (
        code,
        make,
        model,
        category
      )
    `)
    .order('start_date');

  if (error) {
    console.error('Supabase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Transform to flat structure
  const rentals = data.map((entry: any) => ({
    id: entry.id,
    equipment_id: entry.equipment_id,
    start_date: entry.start_date,
    end_date: entry.end_date,
    customer: entry.customer,
    rental_rate: entry.rental_rate,
    billing_start: entry.billing_start,
    billing_end: entry.billing_end,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
    equipment_code: entry.equipment.code,
    equipment_make: entry.equipment.make,
    equipment_model: entry.equipment.model,
    equipment_category: entry.equipment.category,
  }));

  return Response.json(rentals);
}
