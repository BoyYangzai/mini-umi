import { defineMumiConfig } from "mini-umi";
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineMumiConfig({
  routes: [{
    path: '/localUserRoute',
    name: 'localUserRoute',
    component: () => import('./localUserRoute.vue'),
  }],
  // 约定式路由存放目录 如有需求可更改为 docs 或其他
  // 这里生效的是 pages 目录，在插件里被拦截更改了
  routesDir: './docs',
  // 请移步 Vite配置: https://vitejs.dev/config/
  viteConfig: {
    plugins: [
      // TODO： Autoimport 在 CSR没问题 在SSR会丢失CSS
      // AutoImport({
      //   resolvers: [ElementPlusResolver()]
      // }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ],
    resolve: {
      alias: {
      },
    }
  }
})
