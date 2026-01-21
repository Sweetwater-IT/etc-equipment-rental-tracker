import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Transform functions
function transformFromDB(row: any) {
  return {
    id: row.id,
    type: row.category,
    code: row.code,
    make: row.make,
    model: row.model,
    branch: row.etc_location,
    status: row.status,
    customer: row.customer,
    rentalRate: parseFloat(row.rental_rate) || 0,
    startDate: row.rental_start_date,
    endDate: row.rental_end_date,
  };
}

function transformToDB(equipment: any) {
  return {
    category: equipment.type,
    code: equipment.code,
    make: equipment.make,
    model: equipment.model,
    etc_location: equipment.branch,
    status: equipment.status,
    customer: equipment.customer,
    rental_rate: equipment.rentalRate,
    rental_start_date: equipment.startDate,
    rental_end_date: equipment.endDate,
    updated_at: new Date().toISOString(),
  };
}

export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('equipments')
    .select('*')
    .order('code');

  console.log('API GET: data length', data?.length, 'error', error);

  if (error) {
    console.error('Supabase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const transformed = data.map(transformFromDB);
  console.log('API GET: transformed length', transformed.length);
  return Response.json(transformed);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  const equipment = await request.json();
  const dbData = transformToDB(equipment);

  const { data, error } = await supabase
    .from('equipments')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(transformFromDB(data));
}

export async function PUT(request: NextRequest) {
  const supabase = getSupabaseClient();
  const equipment = await request.json();
  const dbData = transformToDB(equipment);

  const { data, error } = await supabase
    .from('equipments')
    .update(dbData)
    .eq('id', equipment.id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(transformFromDB(data));
}

export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'ID required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('equipments')
    .delete()
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
