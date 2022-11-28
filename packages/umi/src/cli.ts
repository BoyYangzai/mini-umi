import { Core } from "@mini-umi/core";
import yParser from '@umijs/utils/compiled/yargs-parser'
import { existsSync } from 'fs'
import { Env } from "@mini-umi/core/dist/config/config";
import { join } from 'path'

const cwd = process.cwd()

const core = new Core({
  cwd: process.cwd(),
  env: Env.development,
  presets: [ require.resolve('@umijs/preset-umi')],
  plugins: [
    existsSync(join(cwd, 'plugin.ts')) && join(cwd, 'plugin.ts'),
    existsSync(join(cwd, 'plugin.js')) && join(cwd, 'plugin.js'),
  ].filter(Boolean),
})

// const args = yParse(process.argv.slice(2))

// tmp
const args = yParser(process.argv.slice(2), {
  alias: {
    version: ['v'],
    help: ['h'],
  },
  boolean: ['version'],
});
const currentCommand = args._[0]
const restArgs = { ...args }

core.run({name: currentCommand,args: restArgs})

