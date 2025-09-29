import baseConfig from './playwright.config'
import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  ...baseConfig,
  webServer: [],
  projects: baseConfig.projects?.map(project => {
    if (project.name === 'chromium') {
      return {
        ...project,
        use: {
          ...project.use,
          launchOptions: {
            ...(project.use?.launchOptions ?? {}),
            args: [
              ...((project.use?.launchOptions as any)?.args ?? []),
              '--no-sandbox',
              '--disable-setuid-sandbox'
            ]
          }
        }
      }
    }
    return project
  })
}

export default config
