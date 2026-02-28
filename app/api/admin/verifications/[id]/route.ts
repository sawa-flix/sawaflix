import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Maps a raw Supabase row into the shape VerificationDetails.tsx expects
function transformRow(row: Record<string, unknown>) {
  const fd = (row.form_data as Record<string, unknown>) ?? {};

  return {
    id: row.creator_id,
    status: row.status,
    identity: {
      fullName: row.full_name ?? fd.full_name ?? '',
      stageName: fd.stage_name as string | undefined,
      email: row.email ?? fd.email ?? '',
      phone: (row.phone ?? fd.phone ?? '') as string,
      dob: (fd.dob ?? fd.date_of_birth ?? '') as string,
      nationality: (fd.nationality ?? '') as string,
      avatarUrl: (row.avatar_url ?? fd.avatar_url ?? '') as string,
    },
    professional: {
      category: row.category ?? fd.category ?? '',
      bio: (fd.bio ?? '') as string,
      yearsActive: Number(fd.years_active ?? fd.yearsActive ?? 0),
      ethnicGroup: fd.ethnic_group as string | undefined,
      languages: fd.languages as string[] | undefined,
      focusArea: fd.focus_area as string | undefined,
      signatureDishes: fd.signature_dishes as string | undefined,
      roles: fd.roles as string[] | undefined,
      filmography: fd.filmography as string | undefined,
      genre: fd.genre as string[] | undefined,
      label: fd.label as string | undefined,
    },
    portfolio: {
      links: (fd.links as { url: string; type: 'youtube' | 'spotify' | 'other' }[]) ?? [],
      videos: (fd.videos as { url: string; title: string; description?: string }[]) ?? [],
    },
    documents: {
      idCardUrl: (fd.id_url ?? fd.id_card_url ?? row.id_url ?? '') as string,
      selfieUrl: (fd.selfie_url ?? '') as string,
      endorsementUrl: fd.endorsement_url as string | undefined,
      distributorProofUrl: fd.distributor_proof_url as string | undefined,
      productionProofUrl: fd.production_proof_url as string | undefined,
      foodLicenseUrl: fd.food_license_url as string | undefined,
      verificationVideoUrl: fd.verification_video_url as string | undefined,
    },
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('verification_submissions')
      .select('*')
      .eq('creator_id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    return NextResponse.json({ data: transformRow(data) });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
