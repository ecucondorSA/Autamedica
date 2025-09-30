'use client'

import { useState, useEffect } from 'react'
import EnhancedLandingExperience from './EnhancedLandingExperience'
import MobileExperience from './MobileExperience'
import EnhancedLoader from '../ui/EnhancedLoader'

export default function ResponsiveExperience() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkDevice = () => {
      // Check multiple conditions for mobile detection
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const isMobileWidth = window.innerWidth <= 768
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      // Consider it mobile if any of these conditions are true
      const mobileDevice = isMobileUA || (isMobileWidth && isTouchDevice)

      setIsMobile(mobileDevice)
      setIsLoading(false)

      // Add appropriate class to body
      if (mobileDevice) {
        document.body.classList.add('mobile-device')
        document.body.classList.remove('desktop-device')
      } else {
        document.body.classList.add('desktop-device')
        document.body.classList.remove('mobile-device')
      }
    }

    // Initial check
    checkDevice()

    // Listen for resize events
    const handleResize = () => {
      checkDevice()
    }

    window.addEventListener('resize', handleResize)

    // Listen for orientation changes (mobile)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  if (isLoading) {
    return (
      <EnhancedLoader
        fullscreen
        type="spinner"
        message="Cargando AutaMedica..."
        size="lg"
      />
    )
  }

  return isMobile ? <MobileExperience /> : <EnhancedLandingExperience />
}