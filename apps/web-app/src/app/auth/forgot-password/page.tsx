export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-autamedica-negro via-autamedica-secondary to-autamedica-negro flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold text-autamedica-blanco hover:text-autamedica-primary transition-colors">
            AutaMedica
          </a>
          <p className="text-white mt-2">Desarrollado por E.M Medicina - UBA</p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-autamedica-negro/50 backdrop-blur-lg rounded-2xl p-8 border border-autamedica-secondary/30">
          <h1 className="text-2xl font-bold text-autamedica-blanco mb-6 text-center">Recuperar Contraseña</h1>

          <p className="text-white text-center mb-6">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>

          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-autamedica-negro/20 border border-autamedica-secondary/30 rounded-lg text-autamedica-blanco placeholder-autamedica-text-light focus:outline-none focus:ring-2 focus:ring-autamedica-primary focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-autamedica-primary to-autamedica-primary-dark text-white py-3 px-4 rounded-lg font-semibold hover:from-autamedica-primary-dark hover:to-autamedica-beige transition-all duration-200 transform hover:scale-105"
            >
              Enviar Enlace de Recuperación
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-white text-sm">
              ¿Recordaste tu contraseña?{' '}
              <a href="/auth/login" className="text-autamedica-primary hover:text-white font-medium underline">
                Iniciar Sesión
              </a>
            </p>
            <p className="text-white text-sm">
              ¿No tienes cuenta?{' '}
              <a href="/auth/register" className="text-autamedica-primary hover:text-white font-medium underline">
                Registrarse
              </a>
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-white mt-6">
          Al continuar, aceptas nuestros{' '}
          <a href="/terms" className="text-autamedica-primary hover:text-white underline">
            Términos de Servicio
          </a>{' '}
          y{' '}
          <a href="/privacy" className="text-autamedica-primary hover:text-white underline">
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}