import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { lodash, register, semver } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path'
import {
  DEFAULT_CONFIG_FILES,
  LOCAL_EXT,
  SHORT_ENV,
} from '../constants';
import { addExt, getAbsFiles } from './utils';

export enum Env {
  development = 'development',
  production = 'production',
  test = 'test',
}

interface IOpts {
  cwd: string;
  env: Env;
  specifiedEnv?: string;
  defaultConfigFiles?: string[];
}

export class Config {
  public opts: IOpts;
  public mainConfigFile: string | null;
  public prevConfig: any;
  public files: string[] = [];
  
  constructor(opts: IOpts) {
    this.opts = opts;
    this.mainConfigFile = Config.getMainConfigFile(this.opts);
    this.prevConfig = null;
  }

  getUserConfig() {
    const configFiles = Config.getConfigFiles({
      mainConfigFile: this.mainConfigFile,
      env: this.opts.env,
      specifiedEnv: this.opts.specifiedEnv,
    });
    return Config.getUserConfig({
      configFiles: getAbsFiles({
        files: configFiles,
        cwd: this.opts.cwd,
      }),
    });
  }

  static getMainConfigFile(opts: {
    cwd: string;
    defaultConfigFiles?: string[];
  }) {
    let mainConfigFile = null;
    for (const configFile of opts.defaultConfigFiles || DEFAULT_CONFIG_FILES) {
      const absConfigFile = join(opts.cwd, configFile);
      if (existsSync(absConfigFile)) {
        mainConfigFile = absConfigFile;
        break;
      }
    }
    return mainConfigFile;
  }
  static getConfigFiles(opts: {
    mainConfigFile: string | null;
    env: Env;
    specifiedEnv?: string;
  }) {
    const ret: string[] = [];
    const { mainConfigFile } = opts;
    const specifiedEnv = opts.specifiedEnv || '';
    if (mainConfigFile) {
      const env = SHORT_ENV[opts.env] || opts.env;
      ret.push(
        ...[
          mainConfigFile,
          specifiedEnv &&
          addExt({ file: mainConfigFile, ext: `.${specifiedEnv}` }),
          addExt({ file: mainConfigFile, ext: `.${env}` }),
          specifiedEnv &&
          addExt({
            file: mainConfigFile,
            ext: `.${env}.${specifiedEnv}`,
          }),
        ].filter(Boolean),
      );

      if (opts.env === Env.development) {
        ret.push(addExt({ file: mainConfigFile, ext: LOCAL_EXT }));
      }
    }
    return ret;
  }

  static getUserConfig(opts: { configFiles: string[] }) {
    let config = {
      viteConfig: {
        
      }
    };
    let files: string[] = [];
    
    for (const configFile of opts.configFiles) {
      if (existsSync(configFile)) {
        register.register({
          implementor: esbuild,
        });
        register.clearFiles();
        config = lodash.merge(config, require(configFile).default);
        for (const file of register.getFiles()) {
          delete require.cache[file];
        }
        // includes the config File
        files.push(...register.getFiles());
        register.restore();
      } else {
        files.push(configFile);
      }
    }
    return {
      config,
      files,
    };
  }

}
