import { Core } from '@mini-umi/core'
import {
  chalk,
  winPath,
} from '@umijs/utils';
import { IpresetUmi } from '../types';
import { build as viteBuild } from 'vite'
import { join, resolve } from 'path'
import vue from 'rollup-plugin-vue'
import css from 'rollup-plugin-css-only'
import nodeResolve from '@rollup/plugin-node-resolve'
import { getRoutesString } from './utils';
import { getRoutes } from './getRoutes';

export default (api: IpresetUmi & Core) => {
  const cwd = process.cwd()
  api.registerCommand({
    name: 'build',
    async fn() {
      // directCopyFiles
      const directCopyFiles = ['app.vue', 'main.ts', 'index.html']
      directCopyFiles.forEach(fileName => {
        api.writeTmpFile({
          target: winPath(join(cwd, `./.mini-umi/${fileName}`)),
          path: `./${fileName}.tpl`,
          data: {
          }
        })
      });

      // routes.ts
      const routes = getRoutes()
      const routesString = getRoutesString(routes)
      await api.writeTmpFile({
        target: winPath(join(cwd, `./.mini-umi/routes.ts`)),
        path: `./routes.ts.tpl`,
        data: {
          routes: routesString
        }
      });

    
      // build
      await viteBuild({
        root: resolve(cwd, './.mini-umi'),
        base: './',
        build: {
          rollupOptions: {
            plugins: [
              css(),
              vue({ css: false }),
              nodeResolve()
            ]
          }
        }
      })
      console.log();
      console.log();
      console.log();

      console.log(
        chalk.greenBright('----------构建产物成功-----------')
        );
      console.log();
      console.log();
      console.log(
        `${chalk.yellowBright('请使用')} ${chalk.blueBright('npm run preview')} ${ chalk.yellowBright('预览') }`
      );
      console.log();
      console.log();
    }
  })
}
