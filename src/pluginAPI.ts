import { Command } from "./command";

export class PluginAPi{
  service;
  plugin;
  constructor(opts: { service; plugin}) {
    this.service = opts.service;
    this.plugin = opts.plugin
  }

  registerCommand(opts) {
    const {name} = opts
    this.service.commands[name] = new Command({...opts,plugin:this.plugin})
  }
  
}
