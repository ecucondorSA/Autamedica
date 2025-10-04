'use client';

import { useRouter } from 'next/navigation';
import { ReproductiveHealthHub } from '@/components/medical/ReproductiveHealthHub';
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar';
import { CollapsibleRightPanel } from '@/components/layout/CollapsibleRightPanel';

export default function ReproductiveHealthPage() {
  const router = useRouter();

  const handleRequestConsultation = () => {
    // Navigate to video call page with reproductive health context
    router.push('/?consultation=reproductive-health');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ivory-base">
      <CollapsibleSidebar />

      <main className="flex flex-1 overflow-y-auto">
        <ReproductiveHealthHub onRequestConsultation={handleRequestConsultation} />
      </main>

      <CollapsibleRightPanel context="dashboard" />
    </div>
  );
}
