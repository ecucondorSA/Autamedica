'use client';

import { useRouter } from 'next/navigation';
import { ReproductiveHealthHub } from '@/components/medical/ReproductiveHealthHub';

export default function ReproductiveHealthPage() {
  const router = useRouter();

  const handleRequestConsultation = () => {
    // Navigate to video call page with reproductive health context
    router.push('/?consultation=reproductive-health');

    // Alternatively, if there's a dedicated call route:
    // router.push('/call/reproductive-health');
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <ReproductiveHealthHub onRequestConsultation={handleRequestConsultation} />
    </div>
  );
}
