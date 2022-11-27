import { ICommand } from "./command"
import { Plugin } from "./plugin"
import { PluginAPi } from "./pluginAPI"
import { Hook } from "./hook"
import {
  AsyncSeriesWaterfallHook,
  SyncWaterfallHook,
} from '@umijs/bundler-utils/compiled/tapable';


enum ApplyPluginsType {
  add = 'add',
  modify = 'modify',
  event = 'event',
}
type IPlugin = {
  key: string,
  config: object
}
type Cmmands = {
  [key: string]: ICommand
}

type hooksByPluginId = {
  [id: string]: Hook[]
}

type hooks = {
  [key: string]: Hook[]
}

export class Core {
  private opts;
  commands: Cmmands = {}
  plugins: Plugin[] = []
  hooksByPluginId: hooksByPluginId = {}
  hooks: hooks = {}
  constructor(opts: { presets?: Plugin[], plugins?: Plugin[]}) {
    this.opts = opts
    // TODO: hook
    this.hooksByPluginId = {}
    this.hooks = {}
  }

  async run(opts: { name: string; args?: any}) {
    const { name, args = {} } = opts;
    // TODO: 收集插件自带的 defalutConfig
    for (const id of Object.keys(this.plugins)) {
      const { config, key } = this.plugins[id] 
      
    }

    // init Presets
    const { presets, plugins } = this.opts
    if (presets) {
      while (presets.length) {
        await this.initPreset({
          preset: new Plugin({ path: presets.shift()! }),
          presets,
          plugins: this.plugins
        });
      }
    }
    while (plugins!.length) {
      await this.initPreset({
        preset: new Plugin({ path: plugins!.shift()! }),
        presets: plugins!,
        plugins: this.plugins
      });
    }
 
    // TODO: initPlugin
    this.plugins.forEach(plugin => {
      this.initPlugin({plugin:new Plugin({path: plugin})})
    })
    // this.initPlugin({ plugin: new Plugin({ path: require.resolve('../../example-plugins/dist/dev.js') }) })
    // this.initPlugin({ plugin: new Plugin({ path: require.resolve('../../example-plugins/dist/build.js') }) })

    await this.applyPlugins({
      key: 'onBuildStart',
      initialValue:'daodao'
    })

    await this.applyPlugins({
      key: 'onStart',
      initialValue: 'daodao'
    })

    const command = this.commands[name]
    await command.fn({ ...args })
  }
  
  async initPreset(opts: {
    preset: Plugin;
    presets: Plugin[];
    plugins: Plugin[];
  }) {
    const { presets=[], plugins=[] } = await this.initPlugin({
      plugin: opts.preset,
      presets: opts.presets,
      plugins: opts.plugins,
    });
    
    opts.presets.unshift(...(presets || []));
    opts.plugins.push(...(plugins || []));
  }

  async initPlugin(opts: { plugin: Plugin, presets?: Plugin[], plugins?: Plugin[] }) {
    const pluginApi = new PluginAPi({ service: this, plugin: opts.plugin })
    return opts.plugin.apply()(pluginApi) || {}
  }

  // 用于执行特定 key 的 hook 相当于发布订阅的 emit
  applyPlugins(
    opts: {
      key: string;
      type?: ApplyPluginsType;
      initialValue?: any;
      args?: any;
      sync?: boolean;
    }
  ) {
    
    const hooks = this.hooks[opts.key]
    // 读取修改用户配置
    const waterFullHook = new AsyncSeriesWaterfallHook(['memo'])
    
    for (const hook of hooks) {
      waterFullHook.tapPromise({
        name: 'tmp'
      },
        async (memo: any) => {
          const items = await hook.fn(opts.args);
          return memo.concat(items);
        },
      )
    }
    return waterFullHook.promise(opts.initialValue)
  }
  
}
