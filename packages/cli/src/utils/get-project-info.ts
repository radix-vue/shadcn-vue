import { existsSync } from 'node:fs'
import path from 'node:path'
import fs from 'fs-extra'

export async function getProjectInfo() {
  const info = {
    tsconfig: null,
    isNuxt: false,
    isVueVite: false,
    srcDir: false,
    componentsUiDir: false,
    srcComponentsUiDir: false,
  }

  try {
    const tsconfig = await getTsConfig()

    return {
      tsconfig,
      isNuxt: existsSync(path.resolve('./nuxt.config.js')) || existsSync(path.resolve('./nuxt.config.ts')),
      isVueVite: existsSync(path.resolve('./vite.config.js')) || existsSync(path.resolve('./vite.config.ts')),
      srcDir: existsSync(path.resolve('./src')),
      srcComponentsUiDir: existsSync(path.resolve('./src/components/ui')),
      componentsUiDir: existsSync(path.resolve('./components/ui')),
    }
  }
  catch (error) {
    return info
  }
}

export async function getTsConfig() {
  try {
    const tsconfigPath = path.join('tsconfig.json')
    const tsconfig = await fs.readJSON(tsconfigPath)

    if (!tsconfig)
      throw new Error('tsconfig.json is missing')

    return tsconfig
  }
  catch (error) {
    return null
  }
}
