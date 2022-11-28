import { Plugin } from "./plugin";

export class Hook{
  fn = Function;
  plugin = {} as Plugin
  constructor({ key, plugin, fn }: { key: string, plugin: Plugin, fn: any }) {
    this.plugin = plugin
    this.fn = fn
  }
}
