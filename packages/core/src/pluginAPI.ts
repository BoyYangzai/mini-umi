import { Command } from "./command";
import { Hook } from "./hook";
import { type Core } from './core'


export class PluginAPi{
  service;
  plugin;
  onStart: Function =()=>{};
  constructor(opts: { service; plugin}) {
    this.service = opts.service;
    this.plugin = opts.plugin
  }

  register(opts: { key: string, fn: any }) {
    (this.service.hooks[opts.key] || (this.service.hooks[opts.key] = [])).push(new Hook({ ...opts, plugin: this.plugin }))
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
