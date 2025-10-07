'use client';

import { useState, useEffect } from 'react';
import type { UserProfile, AuditLogEntry, ProfileManager } from '@/lib/profile-manager';
import { logger } from '@autamedica/shared';

// This page is client-only, force dynamic rendering
// Note: 'prerender' is deprecated in Next.js 15.5+, use 'dynamic' instead
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileManager, setProfileManager] = useState<ProfileManager | null>(null);

  useEffect(() => {
    // Initialize ProfileManager only on client side
    const initializeProfileManager = async () => {
      const { ProfileManager } = await import('@/lib/profile-manager');
      const manager = ProfileManager.browser();
      setProfileManager(manager);

      // Load profile data after manager is initialized
      await loadProfileData(manager);
    };

    initializeProfileManager();
  }, []);

  const loadProfileData = async (manager: ProfileManager) => {
    if (!manager) return;

    setLoading(true);
    try {
      const [profileResult, auditResult] = await Promise.all([
        manager.getCurrentProfile(),
        manager.getAuditLog()
      ]);

      if (profileResult.success) {
        setProfile(profileResult.data);
      }
      if (auditResult.success) {
        setAuditLog(auditResult.data);
      }
    } catch (error) {
      logger.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePortalChange = async (newPortal: 'patients' | 'doctors' | 'companies' | 'admin') => {
    if (!profile || !profileManager) return;

    setUpdating(true);
    try {
      const result = await profileManager.setPortalAndRole(newPortal);
      if (result.success) {
        // Reload profile data
        await loadProfileData(profileManager);
      }
    } catch (error) {
      logger.error('Error updating portal:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-white/70 mt-4">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
            <p className="text-white/70">No se pudo cargar el perfil del usuario.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Profile Information */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6">Perfil de Usuario</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
            <div className="bg-white/5 rounded-lg p-3 text-white/70">
              {profile.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Nombre Completo</label>
            <div className="bg-white/5 rounded-lg p-3 text-white/70">
              {profile.full_name || 'No especificado'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Rol Actual</label>
            <div className="bg-white/5 rounded-lg p-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                profile.role === 'admin' ? 'bg-red-500/20 text-red-200' :
                profile.role === 'doctor' ? 'bg-blue-500/20 text-blue-200' :
                profile.role === 'company' ? 'bg-purple-500/20 text-purple-200' :
                'bg-green-500/20 text-green-200'
              }`}>
                {profile.role === 'admin' ? 'Administrador' :
                 profile.role === 'doctor' ? 'Médico' :
                 profile.role === 'company' ? 'Empresa' :
                 'Paciente'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Portal Actual</label>
            <div className="bg-white/5 rounded-lg p-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                profile.portal === 'admin' ? 'bg-red-500/20 text-red-200' :
                profile.portal === 'doctors' ? 'bg-blue-500/20 text-blue-200' :
                profile.portal === 'companies' ? 'bg-purple-500/20 text-purple-200' :
                'bg-green-500/20 text-green-200'
              }`}>
                {profile.portal === 'admin' ? 'Administración' :
                 profile.portal === 'doctors' ? 'Médicos' :
                 profile.portal === 'companies' ? 'Empresas' :
                 'Pacientes'}
              </span>
            </div>
          </div>
        </div>

        {/* Portal Change Section */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Cambiar Portal</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['patients', 'doctors', 'companies', 'admin'] as const).map((portal) => (
              <button
                key={portal}
                onClick={() => handlePortalChange(portal)}
                disabled={updating || profile.portal === portal}
                className={`p-3 rounded-lg text-center transition-all ${
                  profile.portal === portal
                    ? 'bg-autamedica-green/30 text-autamedica-light-green cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/20 text-white hover:scale-105'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-lg mb-1">
                  {portal === 'patients' ? '👤' :
                   portal === 'doctors' ? '👨‍⚕️' :
                   portal === 'companies' ? '🏢' : '⚙️'}
                </div>
                <div className="text-sm font-medium">
                  {portal === 'patients' ? 'Pacientes' :
                   portal === 'doctors' ? 'Médicos' :
                   portal === 'companies' ? 'Empresas' : 'Admin'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Historial de Actividad</h2>

        <div className="space-y-3">
          {auditLog.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No hay actividad registrada</p>
            </div>
          ) : (
            auditLog.map((entry) => (
              <div key={entry.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    entry.event === 'user_provisioned' ? 'bg-green-500/20 text-green-200' :
                    entry.event === 'role_changed' ? 'bg-blue-500/20 text-blue-200' :
                    entry.event === 'portal_changed' ? 'bg-purple-500/20 text-purple-200' :
                    'bg-gray-500/20 text-gray-200'
                  }`}>
                    {entry.event === 'user_provisioned' ? 'Usuario Creado' :
                     entry.event === 'role_changed' ? 'Rol Cambiado' :
                     entry.event === 'portal_changed' ? 'Portal Cambiado' :
                     entry.event}
                  </span>
                  <span className="text-white/50 text-xs">
                    {new Date(entry.created_at).toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="text-white/70 text-sm">
                  <pre className="whitespace-pre-wrap font-mono bg-black/20 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(entry.data, null, 2)}
                  </pre>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}