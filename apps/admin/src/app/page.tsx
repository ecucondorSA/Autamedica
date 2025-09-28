export default function AdminHomePage(): React.ReactElement {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Panel de Administración
            </h2>
            <p className="text-gray-600 mb-8">
              Bienvenido al panel de administración de AutaMedica
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Usuarios
                </h3>
                <p className="text-gray-600 text-sm">
                  Gestionar médicos, pacientes y empresas
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sistema
                </h3>
                <p className="text-gray-600 text-sm">
                  Configuración y monitoreo del sistema
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Reportes
                </h3>
                <p className="text-gray-600 text-sm">
                  Analíticas y reportes de uso
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}