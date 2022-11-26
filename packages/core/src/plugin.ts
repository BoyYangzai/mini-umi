
// plugin是为了获得PluginAPi 然后在指定的生命周期添加对应的功能

export class Plugin{
  private cwd;
  type;
  path;
  constructor(opts) {
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
    const ret = require(this.path)
    return ret.default
  }

}
