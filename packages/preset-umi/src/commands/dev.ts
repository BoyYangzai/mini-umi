import {
  winPath,
  chalk,
  chokidar,
  lodash
} from '@umijs/utils';
import { createServer} from 'vite'
import { join } from 'path'
import { getRoutesString } from './utils';
import { getRoutes } from './getRoutes';
import vue from '@vitejs/plugin-vue';
import { type IApi } from 'mini-umi';

export default (api: IApi) => {
  
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
      

      // start server
      const userViteConfig = await api.applyPlugins({
        key: 'modifyViteConfig',
        initialValue: api.config!.viteConfig
      })
      userViteConfig.plugins.push(vue())
      const viteConfig = lodash.merge({},  userViteConfig)
      
      const server = await createServer({
        ...viteConfig,
        root: join(process.cwd(), './.mini-umi'),
        server: {
          port: 8000,
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
