import { Core } from "@mini-umi/core";
import yParse from '@umijs/utils/compiled/yargs-parser'
const core = new Core({})

const args = yParse(process.argv.slice(2))

const currentCommand = args._[0]
const restArgs = { ...args }

core.run({name: currentCommand,args: restArgs})

