import {
  winPath,
  chalk,
  chokidar,
  deepmerge,
  fsExtra
} from '@umijs/utils';
import { createServer} from 'vite'
import { join } from 'path'
import { getRoutesString } from './utils';
import { getRoutes } from './getRoutes';
import vue from '@vitejs/plugin-vue';
import { type ICoreApi } from '@mini-umi/core'
import { IpresetUmi } from '../types';

export default (api: ICoreApi & IpresetUmi) => {
  
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
      async function resolveRoutes() {
        const routesDirPath = await api.applyPlugins({
          key: 'modifyRoutesDir',
          initialValue: api.userConfig!.routesDir
        })
        const userRoutes = api.userConfig.routes ? api.userConfig.routes:[]
        const routes = deepmerge(getRoutes({
          dirPath: routesDirPath
        }), userRoutes)
        const routesString = getRoutesString(routes)
        await api.writeTmpFile({
          target: winPath(join(cwd, `./.mini-umi/routes.ts`)),
          path: `./routes.ts.tpl`,
          data: {
            routes: routesString
          }
        });
     }
      await resolveRoutes()


      // layout/index.vue
      function layout() {
        try {
          const layoutContent = fsExtra.readFileSync(winPath(join(cwd, './layout/index.vue')), 'utf-8')
          fsExtra.writeFileSync(winPath(join(cwd, './.mini-umi/App.vue')), layoutContent)
        } catch (err) {
          // no file          
        }    
      }
      layout()
      // start server
      const userViteConfig = await api.applyPlugins({
        key: 'modifyViteConfig',
        initialValue: api.config!.viteConfig
      })
      const defaultViteConfig = {
        plugins: [vue()]
      }
      // userViteConfig.plugins.push()
      const viteConfig = deepmerge(userViteConfig,defaultViteConfig)
      
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
        await resolveRoutes()
      })

      // layout 重新生成
      chokidar.watch(join(cwd, './layout'), {
        ignoreInitial: true,
      }).on('all', async () => {
        layout()
       await server.restart()
      })

    }
  })
}
