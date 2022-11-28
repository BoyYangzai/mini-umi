import { Command } from "./command";
import { Hook } from "./hook";
import { type Core } from './core'
import { Config } from "./config/config";
export enum EnableBy {
  register = 'register',
  config = 'config',
}
// tmp
import { Generator, makeGenerator } from './generator';
import { chalk, lodash, logger } from '@umijs/utils';
import { Plugin } from "./plugin";
export enum PluginType {
  preset = 'preset',
  plugin = 'plugin',
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

export class PluginAPi{
  service;
  plugin;
  onStart: Function =()=>{};
  modifyConfig: (memo: Config) => Config|undefined = (memo: Config)=> undefined;
  constructor(opts: { service; plugin}) {
    this.service = opts.service;
    this.plugin = opts.plugin 
  }

  register(opts: { key: string, fn: any }) {
    (this.service.hooks[opts.key] || (this.service.hooks[opts.key] = [])).push(new Hook({ ...opts, plugin: this.plugin }))
  }
  // tmp
  describe(opts: {
    key?: string;
    config?: any;
    enableBy?:any
  }) {
    // default 值 + 配置开启冲突，会导致就算用户没有配 key，插件也会生效
    if (opts.enableBy === EnableBy.config && opts.config?.default) {
      throw new Error(
        `[plugin: ${this.plugin.id}] The config.default is not allowed when enableBy is EnableBy.config.`,
      );
    }
    // no function merge
    this.plugin.merge(opts);
  }
  registerCommand(opts:{name:string,fn:Function}) {
    const { name } = opts
    this.service.commands[name] = new Command({...opts,plugin:this.plugin})
  }

  registerMethod(opts: { name: string, fn?: Function }) {
    this.service.pluginMethods[opts.name] = {
      plugin: this.plugin,
      fn:
        opts.fn ||
        function (fn: Function) {
          this.register({
            key: opts.name,
            fn
          });
        },
    };
  }
  // tmp
  registerPlugins(source: Plugin[], plugins: any[]) {
    let mappedPlugins = []
    if (plugins) {
      mappedPlugins = plugins.map((plugin) => {
        if (lodash.isPlainObject(plugin)) {
          plugin.type = PluginType.plugin;
          plugin.enableBy = plugin.enableBy || EnableBy.register;
          plugin.apply = plugin.apply || (() => () => { });
          plugin.config = plugin.config || {};
          plugin.time = { hooks: {} };
          return plugin;
        } else {
          return new Plugin({
            path: plugin,
            cwd: this.service.cwd,
            type: PluginType.plugin,
          });
        }
      })
      if (this.service.stage === ServiceStage.initPresets) {
        source.push(...mappedPlugins);
      } else {
        source.splice(0, 0, ...mappedPlugins);
      }
    }
  
   
  }

  // tmp
  registerGenerator(opts) {
    const { key } = opts;
    this.service.generators[key] = makeGenerator({
      ...opts,
      plugin: this.plugin,
    });
  }
  static proxyPluginAPI(opts: {
    pluginAPI: PluginAPi;
    service: Core;
    serviceProps: string[];
    staticProps: Record<string, any>;
  }) {
    return new Proxy(opts.pluginAPI, {
      get: (target, prop: string) => {
        if (opts.service.pluginMethods[prop]) {
          return opts.service.pluginMethods[prop].fn;
        }
        if (opts.serviceProps.includes(prop)) {
          // @ts-ignore
          const serviceProp = opts.service[prop];
          return typeof serviceProp === 'function'
            ? serviceProp.bind(opts.service)
            : serviceProp;
        }
        if (prop in opts.staticProps) {
          return opts.staticProps[prop];
        }
        // @ts-ignore
        return target[prop];
      },
    });
  }
}
