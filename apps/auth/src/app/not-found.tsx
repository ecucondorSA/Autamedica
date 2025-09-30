export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#0f0f10'}}>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-6">Página no encontrada</p>
        <a
          href="/auth/select-role"
          className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}