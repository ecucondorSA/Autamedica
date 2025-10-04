import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PatientOnboarding } from '@/components/onboarding/PatientOnboarding';
import { AutaFloatingButton } from '@/components/chat/AutaFloatingButton';
import '@/styles/onboarding.css';

// Force dynamic rendering for all dashboard pages (auth-protected)
export const dynamic = 'force-dynamic';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <PatientOnboarding autoStart={true} />
      <AutaFloatingButton />
    </>
  );
}
