import { Core } from '@mini-umi/core'
import {
  winPath,
  chalk,
  chokidar
} from '@umijs/utils';
import { IpresetUmi } from '../types';
import { createServer} from 'vite'
import { join } from 'path'
import { getRoutesString } from './utils';
import { getRoutes } from './getRoutes';

export default (api: IpresetUmi & Core) => {
  const cwd = process.cwd()
  api.registerCommand({
    name: 'dev',
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
      
      const server =await createServer({
        configFile: join(__dirname, '../../src/vite.config.ts'),
        root: join(process.cwd(), './.mini-umi'),
        server: {
          port: 8001,
          host: true
        }
      })
      
      await server.listen()
      server.printUrls()

      console.log();
      console.log();
      console.log(
        chalk.greenBright('🎉🎉🎉恭喜你，mini-umi + Vue3.2 + Vite 启动成功！')
      );
      console.log();
      console.log();
      console.log();


      // 约定式路由重新生成
      chokidar.watch(join(cwd, './pages'), {
        ignoreInitial: true,
      }).on('all', async () => {
        const routes = getRoutes()
        const routesString = getRoutesString(routes)
        await api.writeTmpFile({
          target: winPath(join(cwd, `./.mini-umi/routes.ts`)),
          path: `./routes.ts.tpl`,
          data: {
            routes: routesString
          }
        });
      })

    }
  })
}
