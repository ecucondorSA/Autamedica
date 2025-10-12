'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  FileText,
  Heart,
  User,
  LogOut,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import { TourHub } from '@/components/tours/TourHub';
import { AutaFloatingButton } from '@/components/chat/AutaFloatingButton';
import { usePatientSession } from '@/hooks/usePatientSession';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Mis Citas', href: '/appointments', icon: Calendar },
  { name: 'Mi Anamnesis', href: '/anamnesis', icon: BookOpen },
  { name: 'Historial Médico', href: '/medical-history', icon: FileText },
  { name: 'Salud Preventiva', href: '/preventive-health', icon: Heart },
  { name: 'Prevención Embarazo', href: '/pregnancy-prevention', icon: ShieldCheck },
  { name: 'Perfil', href: '/profile', icon: User },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // Obtener sesión de paciente
  const { user, profile, loading, signOut } = usePatientSession();

  // Datos del usuario con fallbacks personalizados
  const computedName = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  const metaName = (user?.user_metadata as any)?.full_name as string | undefined;
  const emailLocal = user?.email?.split('@')[0];
  const userName = computedName || metaName || emailLocal || 'Paciente';
  const userEmail = user?.email || '';

  const handleSignOut = async () => {
    await signOut();
    // Redirigir al login después de cerrar sesión
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex h-screen bg-ivory-base">
      {/* Sidebar - 12% del viewport */}
      <aside className="w-[12vw] min-w-[180px] max-w-[220px] bg-white border-r border-stone-200 shadow-sm flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-stone-200">
          <h1 className="text-xl font-bold text-stone-900">AutaMedica</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navegación principal">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-label={`Ir a ${item.name}`}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-800 text-white'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-stone-200">
          <div className="flex items-center gap-3 mb-3" role="group" aria-label="Información del usuario">
            <div className="h-10 w-10 rounded-full bg-stone-200 flex items-center justify-center" aria-hidden="true">
              <User className="h-5 w-5 text-stone-600" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-stone-500 truncate">
                {userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={loading}
            aria-label="Cerrar sesión y salir del portal"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content - flex-1 para que tome el resto (88% del viewport) */}
      <main id="main-content" className="flex-1 overflow-hidden" role="main">
        {children}
      </main>

      {/* Tour Hub - Guías interactivas flotantes */}
      <TourHub />

      {/* Auta AI - Asistente flotante */}
      <AutaFloatingButton />
    </div>
  );
}
