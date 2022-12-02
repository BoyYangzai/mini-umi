import { Core } from './core'
import { PluginAPi } from './pluginAPI'

export * from './core'
export type ICoreApi = PluginAPi & Core
