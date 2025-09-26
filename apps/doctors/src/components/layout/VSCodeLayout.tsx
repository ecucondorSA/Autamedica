'use client';

import React, { ReactNode } from 'react';

interface VSCodeLayoutProps {
  children?: ReactNode;
}

export default function VSCodeLayout({ children }: VSCodeLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* VSCode-style title bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="ml-4 text-gray-200 text-sm">
            AutaMedica Doctor Portal - Dr. Invitado
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-green-400 text-sm">●</span>
          <span className="text-gray-400 text-sm">Conectado</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex h-[calc(100vh-3rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h3 className="text-gray-200 font-semibold mb-4 text-sm uppercase tracking-wider">
            Portal Médico
          </h3>
          {/* Sidebar content would go here */}
          <div className="space-y-2">
            <div className="p-2 rounded hover:bg-gray-700 cursor-pointer">
              <span className="text-gray-300 text-sm">📹 Videollamada</span>
            </div>
            <div className="p-2 rounded hover:bg-gray-700 cursor-pointer">
              <span className="text-gray-300 text-sm">📋 Historial Médico</span>
            </div>
            <div className="p-2 rounded hover:bg-gray-700 cursor-pointer">
              <span className="text-gray-300 text-sm">💊 Prescripciones</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 bg-gray-900">
          {children}
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-blue-600 px-4 py-1 flex items-center justify-between text-xs text-white">
        <div className="flex items-center space-x-4">
          <span>🏥 AutaMedica</span>
          <span>●</span>
          <span>Consultas activas 8/12</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>● API Online</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}