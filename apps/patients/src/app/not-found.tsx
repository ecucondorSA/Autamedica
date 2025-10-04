export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1b2f]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Página no encontrada</h2>
        <p className="text-slate-400 mb-6">Lo sentimos, no pudimos encontrar la página que buscas.</p>
        <a
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors"
        >
          Volver al portal
        </a>
      </div>
    </div>
  )
}