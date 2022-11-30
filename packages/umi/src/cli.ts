import { Core } from "@mini-umi/core";
import yParse from '@umijs/utils/compiled/yargs-parser'
import { existsSync } from 'fs'
import { join } from 'path'

const cwd = process.cwd()

const core = new Core({
  cwd: process.cwd(),
  env: 'development',
  presets: [require.resolve('@mini-umi/preset-example'), require.resolve('@mini-umi/preset-umi')],
  plugins: [
    existsSync(join(cwd, 'plugin.ts')) && join(cwd, 'plugin.ts'),
    existsSync(join(cwd, 'plugin.js')) && join(cwd, 'plugin.js'),
  ].filter(Boolean),
})

const args = yParse(process.argv.slice(2))

const currentCommand = args._[0]
const restArgs = { ...args }

core.run({name: currentCommand,args: restArgs})

