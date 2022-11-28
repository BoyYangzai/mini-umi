import { ICommand } from "./command"
import { Plugin } from "./plugin"
import { PluginAPi } from "./pluginAPI"
import { Hook } from "./hook"
import {
  AsyncSeriesWaterfallHook,
  SyncWaterfallHook,
} from '@umijs/bundler-utils/compiled/tapable';
import { Config, Env } from "./config/config";
// tmp
import { lodash, pkgUp, winPath } from '@umijs/utils';
import { basename, dirname, extname, join, relative } from 'path';
import { getPaths } from "./paths";

export const DEFAULT_FRAMEWORK_NAME = 'umi';


export enum EnableBy {
  register = 'register',
  config = 'config',
}
export enum ConfigChangeType {
  reload = 'reload',
  regenerateTmpFiles = 'regenerateTmpFiles',
}
enum ApplyPluginsType {
  add = 'add',
  modify = 'modify',
  event = 'event',
}
export enum ServiceStage {
  uninitialized,
  init,
  initPresets,
  initPlugins,
  resolveConfig,
  collectAppData,
  onCheck,
  onStart,
  runCommand,
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
  cwd: string;
  env: Env;
  path: string=''
  commands: Cmmands = {};
  plugins: string[] = [];
  hooksByPluginId: hooksByPluginId = {};
  hooks: hooks = {};
  pluginMethods: Record<string, { plugin: Plugin, fn: Function }> = {};
  configManager: Config | null = null;
  userConfig: object = {};
  config: object = {};
  generators: Record<string, Generator> = {};
  pkg: any = {}
  appData: any = {}
  paths: any = {}
  constructor(opts: {
    cwd: string,
    path: string;
    env: Env, presets?: string[], plugins?: string[], defaultConfigFiles?: string[]
  }) {
    this.opts = opts
    this.cwd = opts.cwd
    this.env = opts.env;
    this.hooksByPluginId = {}
    this.hooks = {}
  }

  async run(opts: { name: string; args?: any }) {
    
    // tmp this.pkg
    // get pkg from package.json
    let pkg: Record<string, string | Record<string, any>> = {};
    let pkgPath: string = '';
    try {
      pkg = require(join(this.cwd, 'package.json'));
      pkgPath = join(this.cwd, 'package.json');
    } catch (_e) {
      // APP_ROOT
      if (this.cwd !== process.cwd()) {
        try {
          pkg = require(join(process.cwd(), 'package.json'));
          pkgPath = join(process.cwd(), 'package.json');
        } catch (_e) { }
      }
    }
    this.pkg = pkg;
    
    this.paths = await this.getPaths();

    const { name, args = {} } = opts;
    // 获取用户配置
    const configManager = new Config({
      cwd: this.cwd,
      env: this.env,
      defaultConfigFiles: this.opts.defaultConfigFiles,
    });
    this.configManager = configManager;
    this.userConfig = configManager.getUserConfig().config;
    this.config = this.userConfig
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
    // init 所有插件
    this.plugins.forEach(async plugin => {
      await this.initPlugin({plugin:new Plugin({path: plugin})})
    })
    
    for (const id of Object.keys(this.plugins)) {
      const { config, key } = this.plugins[id];
      if (config.schema) this.configSchemas[key] = config.schema;
      if (config.default !== undefined) {
        this.configDefaults[key] = config.default;
      }
      this.configOnChanges[key] = config.onChange || ConfigChangeType.reload;
    }
    const { config, defaultConfig } = await this.resolveConfig();

    this.appData = await this.applyPlugins({
      key: 'modifyAppData',
      initialValue: {
        // base
        cwd: this.cwd,
        pkg,
        pkgPath,
        plugins,
        presets,
        name,
        args,
        // config
        userConfig: this.userConfig,
        mainConfigFile: configManager.mainConfigFile,
        // todo
        config,
        defaultConfig: ,
        // TODO
        // moduleGraph,
        // routes,
        // npmClient,
        // nodeVersion,
        // gitInfo,
        // gitBranch,
        // debugger info,
        // devPort,
        // devHost,
        // env
      },
    });
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
      args: { },
    });
    console.log(`最终的配置为${JSON.stringify(this.config)}`);

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

    // tmp
    const proxyPluginAPI = PluginAPi.proxyPluginAPI({
      service: this,
      pluginAPI: pluginApi,
      serviceProps: [
        'appData',
        'applyPlugins',
        'args',
        'config',
        'cwd',
        'pkg',
        'pkgPath',
        'name',
        'paths',
        'userConfig',
        'env',
        'isPluginEnable',
      ],
      staticProps: {
        ApplyPluginsType,
        ConfigChangeType,
        EnableBy,
        ServiceStage,
        service: this,
      },
    });
    // const proxyPluginAPI = PluginAPi.proxyPluginAPI({
    //   service: this,
    //   pluginAPI: pluginApi,
    //   serviceProps: [
    //     'appData',
    //     'applyPlugins',
    //     'args',
    //     'cwd',
    //     'userConfig',
    //     'config'
    //   ],
    //   staticProps: {
    //     ApplyPluginsType,
    //     service: this,
    //     EnableBy
    //   },
    // });
    return opts.plugin.apply()(proxyPluginAPI) || {}
  }
  // tmp
  async getPaths() {
    // get paths
    const paths = getPaths({
      cwd: this.cwd,
      env: this.env,
      prefix: this.opts.frameworkName || DEFAULT_FRAMEWORK_NAME,
    });
    
    return paths;
  }

  // tmp
  async resolveConfig() {
    // configManager and paths are not available until the init stage

    const config = await this.applyPlugins({
      key: 'modifyConfig',
      // why clone deep?
      // user may change the config in modifyConfig
      // e.g. memo.alias = xxx
      initialValue: lodash.cloneDeep(this.configManager!.getUserConfig().config
      ),
      args: { paths: this.paths },
    });
    const defaultConfig = await this.applyPlugins({
      key: 'modifyDefaultConfig',
      // 避免 modifyDefaultConfig 时修改 this.configDefaults
      initialValue: lodash.cloneDeep(this.configDefaults),
    });
    this.config = lodash.merge(defaultConfig, config) as Record<string, any>;

    return { config, defaultConfig };
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
          return Array.isArray(opts.initialValue) ? [ ...memo, ...items ]:{...memo,...items};
        },
      )
    }
    return waterFullHook.promise(opts.initialValue)
  }
  
}
