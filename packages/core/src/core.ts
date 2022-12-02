import { ICommand } from "./command"
import { Plugin } from "./plugin"
import { PluginAPi } from "./pluginAPI"
import { Hook } from "./hook"
import {
  AsyncSeriesWaterfallHook,
} from '@umijs/bundler-utils/compiled/tapable';
import { Config, Env } from "./config/config";
import { UserConfig } from "./types";

export enum ApplyPluginsType {
  add = 'add',
  modify = 'modify',
  event = 'event',
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
  cwd: string;
  env: Env;
  commands: Cmmands = {};
  plugins: string[] = [];
  hooksByPluginId: hooksByPluginId = {};
  hooks: hooks = {};
  pluginMethods: Record<string, { plugin: Plugin, fn: Function }> = {};
  configManager: Config | undefined = undefined;
  userConfig: UserConfig|undefined = undefined;
  config: UserConfig | undefined = undefined;
  userPlugins: string[]=[];
  applyPlugins: (opts: {
    key: string;
    type?: ApplyPluginsType;
    initialValue?: any;
    args?: any;
    sync?: boolean;
  }) => Promise<any> | null
  constructor(opts: { cwd: string, env: Env, presets?: string[], plugins: string[], defaultConfigFiles?: string[] }) {
    this.opts = opts
    this.cwd = opts.cwd
    this.env = opts.env;
    this.hooksByPluginId = {}
    this.hooks = {}

    this.applyPlugins =function(
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
        return opts.initialValue
      }
      // 读取修改用户配置
      const waterFullHook = new AsyncSeriesWaterfallHook(['memo'])

      for (const hook of hooks) {
        waterFullHook.tapPromise({
          name: 'tmp'
        },
          async (memo: any) => {
            const items = await hook.fn(memo, opts.args);
            return Array.isArray(memo) ? [...memo, ...items] : { ...memo, ...items };
          },
        )
      }
      return waterFullHook.promise(opts.initialValue)
    }
  }

  async run(opts: { name: string; args?: any }) {
    const { name, args = {} } = opts;
    // 获取用户配置
    
    const configManager = new Config({
      cwd: this.cwd,
      env: this.env,
      defaultConfigFiles: this.opts.defaultConfigFiles,
    });
    this.configManager = configManager;
    this.userConfig = configManager.getUserConfig().config;
    
    // init Presets
    let { presets, plugins } = this.opts
    presets = [require.resolve('./servicePlugin')].concat(
      presets || [],
    )

    // userPlugins 要最后挂载
    this.userPlugins = plugins
    this.plugins = []
    if (presets) {
      while (presets.length) {
        await this.initPreset({
          preset: new Plugin({ path: presets.shift()! }),
          presets,
          plugins: this.plugins
        });
      }
    }
    this.plugins.push(...this.userPlugins)
    
    // init 所有插件
    this.plugins.forEach(async plugin => {
      await this.initPlugin({ plugin: new Plugin({ path: plugin }) })
    })

    await this.applyPlugins({
      key: 'onCheck',
    });

    await this.applyPlugins({
      key: 'onStart',
    });
    // 获取最终的配置
    this.config = await this.applyPlugins({
      key: 'modifyConfig',
      initialValue: { ...this.userConfig },
      args: {},
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
    
    const { presets = [], plugins = [] } = await this.initPlugin({
      plugin: opts.preset,
      presets: opts.presets,
      plugins: opts.plugins,
    });
    
    opts.presets.unshift(...(presets || []));
    opts.plugins.push(...(plugins || []));
  }
  // 用于执行特定 key 的 hook 相当于发布订阅的 emit
 
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
        'config'
      ],
      staticProps: {
        ApplyPluginsType,
        service: this,
      },
    });
    return opts.plugin.apply()(proxyPluginAPI) || {}
  }

  

}
