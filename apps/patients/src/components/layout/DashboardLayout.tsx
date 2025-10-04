'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { useAuth, signOut } from '@autamedica/auth';

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
  const router = useRouter();
  const { session } = useAuth();
  const user = session?.user;

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Obtener nombre y email del usuario
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const userEmail = user?.email || 'No disponible';

  return (
    <div className="flex h-screen bg-ivory-base">
      {/* Sidebar - 12% del viewport */}
      <aside className="w-[12vw] min-w-[180px] max-w-[220px] bg-white border-r border-stone-200 shadow-sm flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-stone-200">
          <h1 className="text-xl font-bold text-stone-900">AutaMedica</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-800 text-white'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-stone-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-stone-200 flex items-center justify-center">
              <User className="h-5 w-5 text-stone-600" />
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
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content - flex-1 para que tome el resto (88% del viewport) */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Tour Hub - Guías interactivas flotantes */}
      <TourHub />

      {/* Auta AI - Asistente flotante */}
      <AutaFloatingButton />
    </div>
  );
}
