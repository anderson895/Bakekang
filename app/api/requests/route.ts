import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('document_requests')
    .select(`
      *,
      residents (
        id, first_name, last_name, middle_name,
        address, contact_number, email, purok
      ),
      uploaded_documents (*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(
      `control_number.ilike.%${search}%,residents.first_name.ilike.%${search}%,residents.last_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count, page, limit });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const {
      first_name, last_name, middle_name, date_of_birth,
      address, purok, contact_number, email,
      document_type, purpose,
    } = body;

    // Upsert resident
    const { data: resident, error: residentError } = await supabase
      .from('residents')
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        middle_name: middle_name?.trim() || null,
        date_of_birth: date_of_birth || null,
        address: address.trim(),
        purok: purok?.trim() || null,
        contact_number: contact_number.trim(),
        email: email?.trim() || null,
      })
      .select()
      .single();

    if (residentError) {
      return NextResponse.json({ error: residentError.message }, { status: 500 });
    }

    // Create document request
    const { data: docRequest, error: reqError } = await supabase
      .from('document_requests')
      .insert({
        resident_id: resident.id,
        document_type,
        purpose: purpose.trim(),
        status: 'pending',
        control_number: '',
      })
      .select(`*, residents(*)`)
      .single();

    if (reqError) {
      return NextResponse.json({ error: reqError.message }, { status: 500 });
    }

    return NextResponse.json({ data: docRequest }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
