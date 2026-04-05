import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const requestId = formData.get('requestId') as string;

    if (!file || !requestId) {
      return NextResponse.json({ error: 'Missing file or requestId' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { public_id, secure_url } = await uploadToCloudinary(
      buffer,
      file.name,
      'bakakeng/documents'
    );

    const { data, error } = await supabase
      .from('uploaded_documents')
      .insert({
        request_id: requestId,
        cloudinary_public_id: public_id,
        cloudinary_url: secure_url,
        file_name: file.name,
        file_type: file.type,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
