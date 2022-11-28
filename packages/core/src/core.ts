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
  plugins: string[] = []
  hooksByPluginId: hooksByPluginId = {}
  hooks: hooks = {}
  pluginMethods: Record<string, { plugin: Plugin, fn: Function }>={}
  constructor(opts: { presets?: string[], plugins?: string[]}) {
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
    let { presets, plugins } = this.opts
    presets = [require.resolve('./servicePlugin')].concat(
      presets || [],
    )

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
    this.plugins.forEach(async plugin => {
      await this.initPlugin({plugin:new Plugin({path: plugin})})
    })
    // this.initPlugin({ plugin: new Plugin({ path: require.resolve('../../example-plugins/dist/dev.js') }) })
    // this.initPlugin({ plugin: new Plugin({ path: require.resolve('../../example-plugins/dist/build.js') }) })

    await this.applyPlugins({
      key: 'modifyConfig',
    });
    
    await this.applyPlugins({
      key: 'onCheck',
    });

    await this.applyPlugins({
      key: 'onStart',
    });

    await this.applyPlugins({
      key: 'onBuildStart',
    })

    const command = this.commands[name]
    await command.fn({ ...args })
  }
  
  async initPreset(opts: {
    preset: Plugin;
    presets: string[];
    plugins: string[];
  }) {
    const { presets=[], plugins=[] } = await this.initPlugin({
      plugin: opts.preset,
      presets: opts.presets,
      plugins: opts.plugins,
    });
    
    opts.presets.unshift(...(presets || []));
    opts.plugins.push(...(plugins || []));
  }

  async initPlugin(opts: { plugin: Plugin, presets?: string[], plugins?: string[] }) {
    const pluginApi = new PluginAPi({ service: this, plugin: opts.plugin })
    const proxyPluginAPI = PluginAPi.proxyPluginAPI({
      service: this,
      pluginAPI: pluginApi,
      serviceProps: [
        'appData',
        'applyPlugins',
        'args',
        'cwd',
        'userConfig',
      ],
      staticProps: {
        ApplyPluginsType,
        service: this,
      },
    });
    return opts.plugin.apply()(proxyPluginAPI) || {}
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
    if (!hooks) {
      return {}
    }
    // 读取修改用户配置
    const waterFullHook = new AsyncSeriesWaterfallHook(['memo'])
    
    for (const hook of hooks) {
      waterFullHook.tapPromise({
        name: 'tmp'
      },
        async (memo: any) => {
          const items = await hook.fn(opts.args);
          return memo && memo.concat(items);
        },
      )
    }
    return waterFullHook.promise(opts.initialValue)
  }
  
}
