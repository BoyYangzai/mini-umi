import { Command } from "./command";
import { Hook } from "./hook";
import { Plugin } from "./plugin";

export class PluginAPi{
  service;
  plugin;
  constructor(opts: { service; plugin}) {
    this.service = opts.service;
    this.plugin = opts.plugin
  }

  register(opts: {key:string,fn: any}) {
    (this.service.hooks[opts.key] || (this.service.hooks[opts.key]=[])).push(new Hook({ ...opts ,plugin: this.plugin}))
  }

  registerCommand(opts:{name:string,fn:Function}) {
    const { name } = opts
    this.service.commands[name] = new Command({...opts,plugin:this.plugin})
  }
  
}
