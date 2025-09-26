import VSCodeLayout from '@/components/layout/VSCodeLayout';
import IntegratedDoctorVideoCall from '@/components/telemedicine/IntegratedDoctorVideoCall';

export default function DoctorsPage() {
  return (
    <VSCodeLayout>
      <IntegratedDoctorVideoCall
        sessionId="demo"
        patientData={{
          id: "demo-patient",
          name: "Paciente Demo",
          age: 45,
          gender: "M"
        }}
      />
    </VSCodeLayout>
  );
}