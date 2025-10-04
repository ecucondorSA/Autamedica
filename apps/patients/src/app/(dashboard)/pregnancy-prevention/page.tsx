'use client';

import { useRouter } from 'next/navigation';
import { ReproductiveHealthHub } from '@/components/medical/ReproductiveHealthHub';

export default function PregnancyPreventionPage() {
  const router = useRouter();

  const handleRequestConsultation = () => {
    // Navigate to video call page with reproductive health context
    router.push('/?consultation=reproductive-health');
  };

  return (
    <div className="min-h-screen bg-ivory-base overflow-y-auto">
      <ReproductiveHealthHub
        onRequestConsultation={handleRequestConsultation}
        className="p-8 max-w-7xl mx-auto"
      />
    </div>
  );
}
