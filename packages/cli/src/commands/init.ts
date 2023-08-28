import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { Command } from 'commander'
import { execa } from 'execa'
import template from 'lodash.template'
import ora from 'ora'
import prompts from 'prompts'
import * as z from 'zod'
import * as templates from '@/src/utils/templates'
import {
  getRegistryBaseColor,
  getRegistryBaseColors,
  getRegistryStyles,
} from '@/src/utils/registry'
import { logger } from '@/src/utils/logger'
import { handleError } from '@/src/utils/handle-error'
import { getPackageManager } from '@/src/utils/get-package-manager'
import {
  type Config,
  DEFAULT_COMPONENTS,
  DEFAULT_TAILWIND_CONFIG,
  DEFAULT_TAILWIND_CSS,
  DEFAULT_TAILWIND_CSS_NUXT,
  DEFAULT_UTILS,
  getConfig,
  rawConfigSchema,
  resolveConfigPaths,
} from '@/src/utils/get-config'

const PROJECT_DEPENDENCIES = {
  base: [
    'tailwindcss-animate',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
  ],
  vue: [
    'tailwindcss',
    'postcss',
    'autoprefixer',
  ],
  nuxt: [
    '@nuxtjs/tailwindcss',
  ],
}

const initOptionsSchema = z.object({
  cwd: z.string(),
  yes: z.boolean(),
})

export const init = new Command()
  .name('init')
  .description('initialize your project and install dependencies')
  .option('-y, --yes', 'skip confirmation prompt.', false)
  .option(
    '-c, --cwd <cwd>',
    'the working directory. defaults to the current directory.',
    process.cwd(),
  )
  .action(async (opts) => {
    try {
      const options = initOptionsSchema.parse(opts)
      const cwd = path.resolve(options.cwd)

      // Ensure target directory exists.
      if (!existsSync(cwd)) {
        logger.error(`The path ${cwd} does not exist. Please try again.`)
        process.exit(1)
      }

      // Read config.
      const existingConfig = await getConfig(cwd)
      const config = await promptForConfig(cwd, existingConfig, options.yes)

      await runInit(cwd, config)

      logger.info('')
      logger.info(
        `${chalk.green('Success!')} Project initialization completed.`,
      )
      logger.info('')
    }
    catch (error) {
      handleError(error)
    }
  })

export async function promptForConfig(
  cwd: string,
  defaultConfig: Config | null = null,
  skip = false,
) {
  const highlight = (text: string) => chalk.cyan(text)

  const styles = await getRegistryStyles()
  const baseColors = await getRegistryBaseColors()

  const options = await prompts([
    {
      type: 'toggle',
      name: 'typescript',
      message: `Would you like to use ${highlight('TypeScript')} (recommended)?`,
      initial: defaultConfig?.typescript ?? true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'select',
      name: 'framework',
      message: `Which ${highlight('framework')} are you using?`,
      choices: [
        {title: 'Nuxt', value: 'nuxt'},
        {title: 'Vite + Vue', value: 'vue'},
      ],
    },
    {
      type: 'select',
      name: 'style',
      message: `Which ${highlight('style')} would you like to use?`,
      choices: styles.map(style => ({
        title: style.label,
        value: style.name,
      })),
    },
    {
      type: 'select',
      name: 'tailwindBaseColor',
      message: `Which color would you like to use as ${highlight(
        'base color',
      )}?`,
      choices: baseColors.map(color => ({
        title: color.label,
        value: color.name,
      })),
    },
    {
      type: 'text',
      name: 'tailwindCss',
      message: `Where is your ${highlight('Tailwind CSS')} file?`,
      initial: (prev,values) => defaultConfig?.tailwind.css ?? values.framework === 'nuxt' ? DEFAULT_TAILWIND_CSS_NUXT : DEFAULT_TAILWIND_CSS
    },
    {
      type: 'toggle',
      name: 'tailwindCssVariables',
      message: `Would you like to use ${highlight(
        'CSS variables',
      )} for colors?`,
      initial: defaultConfig?.tailwind.cssVariables ?? true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'text',
      name: 'tailwindConfig',
      message: `Where is your ${highlight('tailwind.config.js')} located?`,
      initial: defaultConfig?.tailwind.config ?? DEFAULT_TAILWIND_CONFIG,
    },
    {
      type: 'text',
      name: 'components',
      message: `Configure the import alias for ${highlight('components')}:`,
      initial: defaultConfig?.aliases.components ?? DEFAULT_COMPONENTS,
    },
    {
      type: 'text',
      name: 'utils',
      message: `Configure the import alias for ${highlight('utils')}:`,
      initial: defaultConfig?.aliases.utils ?? DEFAULT_UTILS,
    },
  ])

  const config = rawConfigSchema.parse({
    // $schema: 'https://ui.shadcn.com/schema.json',
    style: options.style,
    typescript: options.typescript,
    framework: options.framework,
    tailwind: {
      config: options.tailwindConfig,
      css: options.tailwindCss,
      baseColor: options.tailwindBaseColor,
      cssVariables: options.tailwindCssVariables,
    },
    aliases: {
      utils: options.utils,
      components: options.components,
    },
  })

  if (!skip) {
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: `Write configuration to ${highlight('components.json')}. Proceed?`,
      initial: true,
    })

    if (!proceed)
      process.exit(0)
  }

  // Write to file.
  logger.info('')
  const spinner = ora('Writing components.json...').start()
  const targetPath = path.resolve(cwd, 'components.json')
  await fs.writeFile(targetPath, JSON.stringify(config, null, 2), 'utf8')
  spinner.succeed()

  return await resolveConfigPaths(cwd, config)
}

export async function runInit(cwd: string, config: Config) {
  const spinner = ora('Initializing project...')?.start()

  // Ensure all resolved paths directories exist.
  for (const [key, resolvedPath] of Object.entries(config.resolvedPaths)) {
    // Determine if the path is a file or directory.
    // TODO: is there a better way to do this?
    let dirname = path.extname(resolvedPath)
      ? path.dirname(resolvedPath)
      : resolvedPath

    // If the utils alias is set to something like "@/lib/utils",
    // assume this is a file and remove the "utils" file name.
    // TODO: In future releases we should add support for individual utils.
    if (key === 'utils' && resolvedPath.endsWith('/utils')) {
      // Remove /utils at the end.
      dirname = dirname.replace(/\/utils$/, '')
    }

    if (!existsSync(dirname))
      await fs.mkdir(dirname, { recursive: true })
  }

  const extension = config.typescript ? 'ts' : 'js'

  // Write tailwind config.
  await fs.writeFile(
    config.resolvedPaths.tailwindConfig,
    config.tailwind.cssVariables
      ? template(config.framework === 'nuxt' ? templates.NUXT_TAILWIND_CONFIG_WITH_VARIABLES : templates.TAILWIND_CONFIG_WITH_VARIABLES)({ extension })
      : template(config.framework === 'nuxt' ? templates.NUXT_TAILWIND_CONFIG : templates.TAILWIND_CONFIG)({ extension }),
    'utf8',
  )

  // Write css file.
  const baseColor = await getRegistryBaseColor(config.tailwind.baseColor)
  if (baseColor) {
    await fs.writeFile(
      config.resolvedPaths.tailwindCss,
      config.tailwind.cssVariables
        ? baseColor.cssVarsTemplate
        : baseColor.inlineColorsTemplate,
      'utf8',
    )
  }

  // Write cn file.
  await fs.writeFile(
    `${config.resolvedPaths.utils}.${extension}`,
    extension === 'ts' ? templates.UTILS : templates.UTILS_JS,
    'utf8',
  )

  spinner?.succeed()

  // Install dependencies.
  const dependenciesSpinner = ora('Installing dependencies...')?.start()
  const packageManager = await getPackageManager(cwd)

  // TODO: add support for other icon libraries.
  const deps =  PROJECT_DEPENDENCIES.base.concat(
    config.framework === 'nuxt' ? PROJECT_DEPENDENCIES.nuxt : PROJECT_DEPENDENCIES.vue,
  ).concat(
    config.style === 'new-york' ? [] : ['lucide-vue-next'],
  )

  await execa(
    packageManager,
    [packageManager === 'npm' ? 'install' : 'add', ...deps],
    {
      cwd,
    },
  )
  dependenciesSpinner?.succeed()
}
