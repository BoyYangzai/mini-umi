import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { register } from '@umijs/utils'
// plugin是为了获得PluginAPi 然后在指定的生命周期添加对应的功能

export class Plugin{
  private cwd;
  type;
  path;
  constructor(opts: any) {
    this.type = opts.type;
    this.path = opts.path;
    this.cwd = opts.cwd;
  }

  static getPluginsAndPresets(opts: {
    cwd: string;
    pkg: any;
    userConfig: any;
    plugins?: string[];
    presets?: string[];
    prefix: string;
  }) {
    
  }

  apply() {
    register.register({
      implementor: esbuild,
      exts: ['.ts', '.mjs'],
    });
    register.clearFiles();
    let ret;
    try {
      ret = require(this.path);
    } catch (e: any) {
      throw new Error(
        `Register ${this.type} ${this.path} failed, since ${e.message}`,
      );
    } finally {
      register.restore();
    }
    // use the default member for es modules
    return ret.__esModule ? ret.default : ret;
  }
  merge(opts: any) {
    if (opts.key) this.key = opts.key;
    if (opts.config) this.config = opts.config;
    if (opts.enableBy) this.enableBy = opts.enableBy;
  }

}
