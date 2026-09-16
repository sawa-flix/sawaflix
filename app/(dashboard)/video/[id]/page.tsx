'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import SawaFlix from '@/components/Dashboard/SawaFlix';
import BrandLoader from '@/components/BrandLoader';

export default function VideoPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-full">
      <Suspense fallback={
        <BrandLoader label="Loading Video" className="h-[60vh]" />
      }>
        <SawaFlix videoId={id} />
      </Suspense>
    </div>
  );
}
