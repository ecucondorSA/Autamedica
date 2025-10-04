"use client"

import { useState } from 'react'
import type { JSX } from 'react'
import {
  Check,
  Crown,
  Star,
  Users,
  Calendar,
  BarChart3,
  Brain,
  X,
  ArrowLeft
} from 'lucide-react'
import { MercadoPagoCheckout, MercadoPagoSubscriptionManager } from '@/components/payment/MercadoPagoIntegration'

type PlanFeature = {
  title: string
  included: boolean
  highlight?: boolean
}

type SubscriptionPlan = {
  id: string
  name: string
  price: number
  period: string
  description: string
  popular?: boolean
  features: PlanFeature[]
  color: string
}

export function SubscriptionPanel(): JSX.Element {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [showCheckout, setShowCheckout] = useState(false)
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false)
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null)

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Básico',
      price: billingPeriod === 'monthly' ? 49000 : 490000,
      period: billingPeriod === 'monthly' ? '/mes' : '/año',
      description: 'Ideal para médicos independientes que inician en telemedicina',
      color: 'slate',
      features: [
        { title: 'Hasta 50 consultas por mes', included: true },
        { title: 'Videollamadas HD', included: true },
        { title: 'Grabación de consultas', included: true },
        { title: 'Historiales médicos básicos', included: true },
        { title: 'Soporte por email', included: true },
        { title: 'Análisis de IA básico', included: false },
        { title: 'Integración con laboratorios', included: false },
        { title: 'Plantillas de prescripción', included: false },
        { title: 'Dashboard avanzado', included: false },
        { title: 'API para integraciones', included: false }
      ]
    },
    {
      id: 'pro',
      name: 'Profesional',
      price: billingPeriod === 'monthly' ? 99000 : 990000,
      period: billingPeriod === 'monthly' ? '/mes' : '/año',
      description: 'Perfecto para médicos establecidos con práctica activa',
      popular: true,
      color: 'emerald',
      features: [
        { title: 'Consultas ilimitadas', included: true, highlight: true },
        { title: 'Videollamadas 4K', included: true },
        { title: 'Grabación y transcripción IA', included: true, highlight: true },
        { title: 'Historiales médicos completos', included: true },
        { title: 'Soporte prioritario 24/7', included: true },
        { title: 'Análisis de IA avanzado', included: true, highlight: true },
        { title: 'Integración con laboratorios', included: true },
        { title: 'Plantillas de prescripción', included: true },
        { title: 'Dashboard avanzado', included: true },
        { title: 'API para integraciones', included: false }
      ]
    },
    {
      id: 'enterprise',
      name: 'Empresa',
      price: billingPeriod === 'monthly' ? 199000 : 1990000,
      period: billingPeriod === 'monthly' ? '/mes' : '/año',
      description: 'Solución completa para clínicas y hospitales',
      color: 'purple',
      features: [
        { title: 'Todo del plan Profesional', included: true },
        { title: 'Gestión de múltiples médicos', included: true, highlight: true },
        { title: 'Panel administrativo completo', included: true },
        { title: 'Integración HIPAA completa', included: true, highlight: true },
        { title: 'Gerente de cuenta dedicado', included: true },
        { title: 'API completa para integraciones', included: true, highlight: true },
        { title: 'Análisis predictivo IA', included: true },
        { title: 'Cumplimiento regulatorio', included: true },
        { title: 'Backup y recuperación', included: true },
        { title: 'Formación personalizada', included: true }
      ]
    }
  ]

  const currentPlan = plans.find(p => p.id === 'pro') // Simulamos que tienen el plan Pro activo

  const getColorClasses = (color: string, variant: 'border' | 'bg' | 'text' | 'button') => {
    const colorMap = {
      slate: {
        border: 'border-slate-600',
        bg: 'bg-slate-600',
        text: 'text-slate-400',
        button: 'bg-slate-600 hover:bg-slate-700'
      },
      emerald: {
        border: 'border-emerald-500',
        bg: 'bg-emerald-500',
        text: 'text-emerald-400',
        button: 'bg-emerald-500 hover:bg-emerald-600'
      },
      purple: {
        border: 'border-purple-500',
        bg: 'bg-purple-500',
        text: 'text-purple-400',
        button: 'bg-purple-500 hover:bg-purple-600'
      }
    }
    return colorMap[color as keyof typeof colorMap]?.[variant] || ''
  }

  const handlePlanUpgrade = (plan: SubscriptionPlan) => {
    setCheckoutPlan(plan)
    setShowCheckout(true)
  }

  const handlePaymentSuccess = (paymentData: any) => {
    // console.log('Pago exitoso:', paymentData)
    setShowCheckout(false)
    setCheckoutPlan(null)
    // Aquí actualizarías el plan del usuario en el backend
  }

  const handlePaymentError = (error: any) => {
    console.error('Error en el pago:', error)
    // Mostrar notificación de error al usuario
  }

  const handlePlanChange = (action: string) => {
    // console.log('Acción de plan:', action)
    // Manejar cambios en la suscripción
  }

  // Modal de checkout
  if (showCheckout && checkoutPlan) {
    return (
      <div className="h-full rounded-xl border border-slate-800/60 bg-[#101d32] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCheckout(false)}
              className="p-2 hover:bg-slate-800/40 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Finalizar Suscripción</h2>
              <p className="text-sm text-slate-400">Plan {checkoutPlan.name}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCheckout(false)}
            className="p-2 hover:bg-slate-800/40 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <MercadoPagoCheckout
            _planId={checkoutPlan.id}
            amount={checkoutPlan.price}
            currency="ARS"
            description={`Plan ${checkoutPlan.name} - AutaMedica`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </div>
    )
  }

  // Modal de gestión de suscripción
  if (showSubscriptionManager) {
    return (
      <div className="h-full rounded-xl border border-slate-800/60 bg-[#101d32] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSubscriptionManager(false)}
              className="p-2 hover:bg-slate-800/40 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Gestión de Suscripción</h2>
              <p className="text-sm text-slate-400">Administra tu plan y pagos</p>
            </div>
          </div>
          <button
            onClick={() => setShowSubscriptionManager(false)}
            className="p-2 hover:bg-slate-800/40 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <MercadoPagoSubscriptionManager
            currentPlanId="pro"
            onPlanChange={handlePlanChange}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full rounded-xl border border-slate-800/60 bg-[#101d32] p-6 shadow-xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <Crown className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Suscripción AutaMedica</h2>
            <p className="text-sm text-slate-400">Gestiona tu plan y funcionalidades</p>
          </div>
        </div>

        {/* Plan actual */}
        {currentPlan && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-200">Plan Actual: {currentPlan.name}</p>
                  <p className="text-sm text-emerald-300/70">Renovación: 15 de octubre, 2024</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-200">${currentPlan.price}</p>
                <p className="text-sm text-emerald-300/70">{currentPlan.period}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toggle de facturación */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-slate-200' : 'text-slate-400'}`}>
          Mensual
        </span>
        <button
          type="button"
          onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            billingPeriod === 'yearly' ? 'bg-emerald-500' : 'bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-slate-200' : 'text-slate-400'}`}>
          Anual
          <span className="ml-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white">-20%</span>
        </span>
      </div>

      {/* Planes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl border p-6 transition-all hover:shadow-lg ${
              plan.popular
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-700/60 bg-slate-900/20'
            } ${selectedPlan === plan.id ? 'ring-2 ring-emerald-500/30' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                  MÁS POPULAR
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-100">{plan.name}</h3>
              <p className="text-sm text-slate-400">{plan.description}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-100">${plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
            </div>

            <ul className="mb-6 space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className={`h-4 w-4 mt-0.5 ${feature.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  ) : (
                    <div className="h-4 w-4 mt-0.5 rounded-full border border-slate-600" />
                  )}
                  <span className={`text-sm ${
                    feature.included
                      ? feature.highlight
                        ? 'text-emerald-200 font-medium'
                        : 'text-slate-200'
                      : 'text-slate-500'
                  }`}>
                    {feature.title}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => plan.id === currentPlan?.id ? setShowSubscriptionManager(true) : handlePlanUpgrade(plan)}
              className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition ${
                plan.id === currentPlan?.id
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : getColorClasses(plan.color, 'button') + ' text-white'
              }`}
            >
              {plan.id === currentPlan?.id ? 'Gestionar Plan' : `Cambiar a ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Estadísticas de uso */}
      <div className="mt-8 rounded-lg border border-slate-700/60 bg-slate-900/20 p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Uso del mes actual</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="text-center">
            <Users className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
            <p className="text-2xl font-bold text-slate-100">47</p>
            <p className="text-sm text-slate-400">Consultas</p>
          </div>
          <div className="text-center">
            <Calendar className="mx-auto mb-2 h-6 w-6 text-blue-400" />
            <p className="text-2xl font-bold text-slate-100">23h</p>
            <p className="text-sm text-slate-400">Tiempo total</p>
          </div>
          <div className="text-center">
            <BarChart3 className="mx-auto mb-2 h-6 w-6 text-purple-400" />
            <p className="text-2xl font-bold text-slate-100">92%</p>
            <p className="text-sm text-slate-400">Satisfacción</p>
          </div>
          <div className="text-center">
            <Brain className="mx-auto mb-2 h-6 w-6 text-amber-400" />
            <p className="text-2xl font-bold text-slate-100">15</p>
            <p className="text-sm text-slate-400">Análisis IA</p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowSubscriptionManager(true)}
          className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800/40"
        >
          Ver historial de pagos
        </button>
        <button
          type="button"
          onClick={() => setShowSubscriptionManager(true)}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
        >
          Gestionar suscripción
        </button>
      </div>
    </div>
  )
}