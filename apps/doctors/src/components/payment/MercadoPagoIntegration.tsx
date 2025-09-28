'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Lock, Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface PaymentMethod {
  id: string
  type: 'credit_card' | 'debit_card'
  last_four_digits: string
  payment_method_id: string
  issuer: {
    id: string
    name: string
  }
  security_code?: {
    length: number
    card_location: string
  }
}

interface MercadoPagoCheckoutProps {
  _planId: string
  amount: number
  currency: string
  description: string
  onSuccess: (paymentData: any) => void
  onError: (error: any) => void
  onPending?: (paymentData: any) => void
}

interface MercadoPagoSubscriptionManagerProps {
  currentPlanId: string
  onPlanChange: (newPlanId: string) => void
}

export function MercadoPagoCheckout({
  _planId,
  amount,
  currency,
  description,
  onSuccess,
  onError,
  onPending
}: MercadoPagoCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    cardholderName: '',
    identificationType: 'DNI',
    identificationNumber: ''
  })

  useEffect(() => {
    initializeMercadoPago()
    loadSavedPaymentMethods()
  }, [])

  const initializeMercadoPago = async () => {
    try {
      // En producción, esto se cargaría desde las variables de entorno
      const publicKey = 'TEST-your-public-key'

      // Simulación de inicialización del SDK
      console.log('Inicializando MercadoPago SDK con clave:', publicKey)

      // En implementación real:
      // await window.MercadoPago.initialize({ locale: 'es-AR', environment: 'sandbox' })
      // await window.MercadoPago.setPublishableKey(publicKey)
    } catch (error) {
      console.error('Error inicializando MercadoPago:', error)
      onError(error)
    }
  }

  const loadSavedPaymentMethods = async () => {
    try {
      // Simulación de carga de métodos de pago guardados
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: 'pm_1',
          type: 'credit_card',
          last_four_digits: '4321',
          payment_method_id: 'visa',
          issuer: {
            id: '25',
            name: 'Visa'
          },
          security_code: {
            length: 3,
            card_location: 'back'
          }
        }
      ]

      setPaymentMethods(mockPaymentMethods)
    } catch (error) {
      console.error('Error cargando métodos de pago:', error)
    }
  }

  const processPayment = async () => {
    if (!selectedPaymentMethod && !cardData.cardNumber) {
      onError({ message: 'Debe seleccionar o agregar un método de pago' })
      return
    }

    setIsLoading(true)

    try {
      // Simulación del proceso de pago con MercadoPago
      await new Promise(resolve => setTimeout(resolve, 2000))

      const paymentData = {
        id: 'payment_' + Date.now(),
        status: 'approved',
        status_detail: 'accredited',
        operation_type: 'regular_payment',
        date_approved: new Date().toISOString(),
        transaction_amount: amount,
        currency_id: currency,
        description,
        payment_method_id: selectedPaymentMethod || 'visa',
        payer: {
          id: 'payer_' + Date.now(),
          email: 'medico@autamedica.com'
        }
      }

      // Simular diferentes resultados
      const random = Math.random()
      if (random > 0.8) {
        // 20% chance de error
        throw new Error('Error en el procesamiento del pago')
      } else if (random > 0.7) {
        // 10% chance de pendiente
        onPending?.({ ...paymentData, status: 'pending' })
      } else {
        // 70% chance de éxito
        onSuccess(paymentData)
      }
    } catch (error) {
      onError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches?.[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  return (
    <div className="space-y-6">
      {/* Métodos de pago guardados */}
      {paymentMethods.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-slate-100 mb-3">Métodos de pago guardados</h3>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPaymentMethod === method.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-slate-100 font-medium">
                        {method.issuer.name} •••• {method.last_four_digits}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {method.type === 'credit_card' ? 'Tarjeta de crédito' : 'Tarjeta de débito'}
                      </p>
                    </div>
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agregar nueva tarjeta */}
      <div>
        <h3 className="text-lg font-medium text-slate-100 mb-3">
          {paymentMethods.length > 0 ? 'Agregar nueva tarjeta' : 'Información de la tarjeta'}
        </h3>

        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Número de tarjeta
            </label>
            <input
              type="text"
              value={cardData.cardNumber}
              onChange={(e) => setCardData(prev => ({
                ...prev,
                cardNumber: formatCardNumber(e.target.value)
              }))}
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fecha de vencimiento
              </label>
              <input
                type="text"
                value={cardData.expirationDate}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '')
                  if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4)
                  }
                  setCardData(prev => ({ ...prev, expirationDate: value }))
                }}
                placeholder="MM/AA"
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Código de seguridad
              </label>
              <input
                type="text"
                value={cardData.securityCode}
                onChange={(e) => setCardData(prev => ({
                  ...prev,
                  securityCode: e.target.value.replace(/\D/g, '')
                }))}
                placeholder="123"
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre del titular
            </label>
            <input
              type="text"
              value={cardData.cardholderName}
              onChange={(e) => setCardData(prev => ({
                ...prev,
                cardholderName: e.target.value.toUpperCase()
              }))}
              placeholder="JUAN PÉREZ"
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo de documento
              </label>
              <select
                value={cardData.identificationType}
                onChange={(e) => setCardData(prev => ({ ...prev, identificationType: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="DNI">DNI</option>
                <option value="CUIL">CUIL</option>
                <option value="CUIT">CUIT</option>
                <option value="LC">Libreta Cívica</option>
                <option value="LE">Libreta de Enrolamiento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Número de documento
              </label>
              <input
                type="text"
                value={cardData.identificationNumber}
                onChange={(e) => setCardData(prev => ({
                  ...prev,
                  identificationNumber: e.target.value.replace(/\D/g, '')
                }))}
                placeholder="12345678"
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen del pago */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
        <h4 className="text-md font-medium text-slate-100 mb-3">Resumen del pago</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Plan:</span>
            <span className="text-slate-100">{description}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal:</span>
            <span className="text-slate-100">${amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">IVA (21%):</span>
            <span className="text-slate-100">${(amount * 0.21).toLocaleString()}</span>
          </div>
          <div className="border-t border-slate-600 pt-2">
            <div className="flex justify-between font-medium">
              <span className="text-slate-100">Total:</span>
              <span className="text-slate-100">${(amount * 1.21).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Lock className="w-4 h-4" />
        <Shield className="w-4 h-4" />
        <span>Transacción segura encriptada por MercadoPago</span>
      </div>

      {/* Botón de pago */}
      <button
        onClick={processPayment}
        disabled={isLoading || (!selectedPaymentMethod && !cardData.cardNumber)}
        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:text-slate-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pagar ${(amount * 1.21).toLocaleString()}
          </>
        )}
      </button>
    </div>
  )
}

export function MercadoPagoSubscriptionManager({
  currentPlanId,
  onPlanChange
}: MercadoPagoSubscriptionManagerProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'cancelled' | 'past_due'>('active')
  const [nextBillingDate, setNextBillingDate] = useState('2024-10-15')
  const [paymentHistory, setPaymentHistory] = useState([
    {
      id: 'pay_001',
      date: '2024-09-15',
      amount: 99000,
      status: 'approved',
      description: 'Suscripción Plan Profesional'
    },
    {
      id: 'pay_002',
      date: '2024-08-15',
      amount: 99000,
      status: 'approved',
      description: 'Suscripción Plan Profesional'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10'
      case 'cancelled': return 'text-red-400 bg-red-400/10'
      case 'past_due': return 'text-amber-400 bg-amber-400/10'
      default: return 'text-slate-400 bg-slate-400/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-400" />
      default: return <AlertCircle className="w-4 h-4 text-amber-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Estado de suscripción */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-100">Estado de Suscripción</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(subscriptionStatus)}`}>
            {subscriptionStatus === 'active' ? 'Activa' : subscriptionStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Próxima facturación:</span>
            <p className="text-slate-100 font-medium">{nextBillingDate}</p>
          </div>
          <div>
            <span className="text-slate-400">Plan actual:</span>
            <p className="text-slate-100 font-medium">Profesional</p>
          </div>
        </div>
      </div>

      {/* Historial de pagos */}
      <div>
        <h3 className="text-lg font-medium text-slate-100 mb-3">Historial de Pagos</h3>
        <div className="space-y-2">
          {paymentHistory.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(payment.status)}
                <div>
                  <p className="text-slate-100 font-medium">{payment.description}</p>
                  <p className="text-slate-400 text-sm">{payment.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-100 font-medium">${payment.amount.toLocaleString()}</p>
                <p className="text-slate-400 text-sm capitalize">{payment.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gestión de suscripción */}
      <div className="flex gap-3">
        <button
          onClick={() => onPlanChange('paused')}
          className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800/40 transition-colors"
        >
          Pausar suscripción
        </button>
        <button
          onClick={() => onPlanChange('cancelled')}
          className="flex-1 px-4 py-2 border border-red-600 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors"
        >
          Cancelar suscripción
        </button>
      </div>
    </div>
  )
}