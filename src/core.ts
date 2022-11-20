import { ICommand } from "./command"
import { Plugin } from "./plugin"
import { PluginAPi } from "./pluginAPI"

type IPlugin = {
  key: string,
  config: object
}
type Cmmands = {
  [key: string]: ICommand
}
type Plugins = {
  [key: string]: IPlugin
}

export class Core {
  private opts;
  commands: Cmmands = {}
  plugins: Plugins = {}
  constructor(opts: any) {
    this.opts = opts
    // TODO: hook
  }

  async run(opts: { name: string; args?: any}) {
    const { name, args = {} } = opts;
    // TODO: 收集插件自带的 defalutConfig
    for (const id of Object.keys(this.plugins)) {
      const { config, key } = this.plugins[id] 
      
    }
    // TODO: initPlugin
    this.initPlugin({ plugin: new Plugin({ path: require.resolve('./hello') }) })
    const command = this.commands[name]
    await command.fn({ ...args })
  }

  async initPlugin(opts:{ plugin }) {
    const pluginApi = new PluginAPi({ service: this, plugin: opts.plugin })
    opts.plugin.apply()(pluginApi)
  }
}
