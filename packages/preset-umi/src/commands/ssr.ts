// @ts-check
import fs from 'fs'
import path from 'path'
import express from 'express'
import { winPath, deepmerge, BaseGenerator, chokidar, chalk, fsExtra } from '@umijs/utils'
import http from 'http'
const isTest = process.env.VITEST
import vuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { getRoutes } from './getRoutes.js'
import { getRoutesString } from './utils.js'
const virtualFile = '@virtual-file'
const virtualId = '\0' + virtualFile
const nestedVirtualFile = '@nested-virtual-file'
const nestedVirtualId = '\0' + nestedVirtualFile

const base = './'

// preserve this to test loading __filename & __dirname in ESM as Vite polyfills them.
// if Vite incorrectly load this file, node.js would error out.
globalThis.__vite_test_filename = __filename
globalThis.__vite_test_dirname = __dirname




export default (api: any) => {
  api.registerCommand({
    name: 'ssr',
    async fn() {
      let vite;
      const cwd = process.cwd()
      async function resolveRoutes() {
        const routesDirPath = await api.applyPlugins({
          key: 'modifyRoutesDir',
          initialValue: api.userConfig!.routesDir
        })
        const userRoutes = api.userConfig.routes ? api.userConfig.routes : []

        const routes = deepmerge(getRoutes({
          dirPath: routesDirPath || './pages'
        }), userRoutes)
        return getRoutesString(routes)
      }

      // layout/index.vue
      function layout() {
        try {
          const layoutContent = fsExtra.readFileSync(winPath(path.join(cwd, './layout/index.vue')), 'utf-8')
          fsExtra.writeFileSync(winPath(path.join(cwd, './.mini-umi-ssr/App.vue')), layoutContent)
        } catch (err) {
          console.log(`${err}: ${cwd}`);
        }
      }

      let hmrPort = 8006
      async function createServer(
        root = process.cwd(),
        isProd = process.env.NODE_ENV === 'production',
        
      ) {
        const generate = new BaseGenerator({
          path: winPath(path.join(__dirname, '../../ssrtemplate')),
          target: path.join(cwd, './.mini-umi-ssr/'),
          data: {
            routes: await resolveRoutes()
          },
          questions: []
        })
        await generate.run()

        // generate layout
        layout()

        const resolve = (p) => path.resolve(process.cwd(), p)
        const indexProd = isProd
          ? fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')
          : ''

        const manifest = isProd
          ? JSON.parse(
            fs.readFileSync(resolve('dist/client/ssr-manifest.json'), 'utf-8')
          )
          : {}

        // start dev server
        const app = express()
        const defaultViteConfig = {
          base,
          plugins: [
            vuePlugin(),
            vueJsx(),
            {
              name: 'virtual',
              resolveId(id) {
                if (id === '@foo') {
                  return id
                }
              },
              load(id, options) {
                const ssrFromOptions = options?.ssr ?? false
                if (id === '@foo') {
                  // Force a mismatch error if ssrBuild is different from ssrFromOptions
                  return `export default { msg: '${command === 'build' && !!ssrBuild !== ssrFromOptions
                    ? `defineConfig ssrBuild !== ssr from load options`
                    : 'hi'
                    }' }`
                }
              }
            },
            {
              name: 'virtual-module',
              resolveId(id) {
                if (id === virtualFile) {
                  return virtualId
                } else if (id === nestedVirtualFile) {
                  return nestedVirtualId
                }
              },
              load(id) {
                if (id === virtualId) {
                  return `export { msg } from "@nested-virtual-file";`
                } else if (id === nestedVirtualId) {
                  return `export const msg = "[success] from conventional virtual file"`
                }
              }
            },
            // Example of a plugin that injects a helper from a virtual module that can
            // be used in renderBuiltUrl
            (function () {
              const queryRE = /\?.*$/s
              const hashRE = /#.*$/s
              const cleanUrl = (url) => url.replace(hashRE, '').replace(queryRE, '')
              let config

              const virtualId = '\0virtual:ssr-vue-built-url'
              return {
                name: 'built-url',
                enforce: 'post',
                configResolved(_config) {
                  config = _config
                },
                resolveId(id) {
                  if (id === virtualId) {
                    return id
                  }
                },
                load(id) {
                  if (id === virtualId) {
                    return {
                      code: `export const __ssr_vue_processAssetPath = (url) => '${base}' + url`,
                      moduleSideEffects: 'no-treeshake'
                    }
                  }
                },
                transform(code, id) {
                  const cleanId = cleanUrl(id)
                  if (
                    config.build.ssr &&
                    (cleanId.endsWith('.js') || cleanId.endsWith('.vue')) &&
                    !code.includes('__ssr_vue_processAssetPath')
                  ) {
                    return {
                      code:
                        `import { __ssr_vue_processAssetPath } from '${virtualId}';__ssr_vue_processAssetPath;` +
                        code,
                      sourcemap: null // no sourcemap support to speed up CI
                    }
                  }
                }
              }
            })()
          ],
          experimental: {
            renderBuiltUrl(filename, { hostType, type, ssr }) {
              if (ssr && type === 'asset' && hostType === 'js') {
                return {
                  runtime: `__ssr_vue_processAssetPath(${JSON.stringify(filename)})`
                }
              }
            }
          },
          build: {
            minify: false
          },
          ssr: {
            noExternal: [
              // this package has uncompiled .vue files
              'example-external-component'
            ]
          },
          optimizeDeps: {
            exclude: ['example-external-component']
          },
          resolve: {
            alias: {
              '@': '../'
            }
          }
        }
        const userViteConfig = await api.applyPlugins({
          key: 'modifyViteConfig',
          initialValue: api.config!.viteConfig
        })
        const viteConfig = deepmerge(userViteConfig, defaultViteConfig)
        /**
         * @type {import('vite').ViteDevServer}
         */
        if (!isProd) {
          vite = await (
            await import('vite')
            //@ts-ignore
          ).createServer({
            ...viteConfig,
            configFile: false,
            base: './',
            root,
            logLevel: isTest ? 'error' : 'info',
            server: {
              middlewareMode: true,
              watch: {
                // During tests we edit the files too fast and sometimes chokidar
                // misses change events, so enforce polling for consistency
                usePolling: true,
                interval: 100
              },
              hmr: {
                port: hmrPort
              }
            },
            appType: 'custom'
          })
          // use vite's connect instance as middleware
          app.use(vite.middlewares)
        } else {
          app.use((await import('compression')).default())
          app.use(
            '/test/',
            (await import('serve-static')).default(resolve('dist/client'), {
              index: false
            })
          )
        }

        app.use('*', async (req, res) => {
          try {
            // const url = req.originalUrl.replace('/test/', '/')

            let template, render
            if (!isProd) {
              // always read fresh template in dev
              template = fs.readFileSync(resolve('./.mini-umi-ssr/index.html'), 'utf-8')
              template = await vite.transformIndexHtml(req.originalUrl, template)
              render = (await vite.ssrLoadModule(path.join(process.cwd(), '/.mini-umi-ssr/entry-server.js'))).render
            } else {
              template = indexProd
              // @ts-ignore
              render = (await import('./dist/server/entry-server.js')).render
            }

            const [appHtml, preloadLinks] = await render(req.originalUrl, manifest)

            const html = template
              .replace(`<!--preload-links-->`, preloadLinks)
              .replace(`<!--app-html-->`, appHtml)

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
          } catch (e) {
            vite && vite.ssrFixStacktrace(e)
            console.log(e.stack)
            res.status(500).end(e.stack)
          }
        })

        return { app, vite }
      }
      const { app } = await createServer()
      let server;
      if (!isTest) {
        server = http.createServer(app)
        server.listen(8005, () => {
          console.log();
          console.log();
          console.log(
            chalk.greenBright('🎉🎉🎉恭喜你，mini-umi + Vue3.2 + Vite 启动成功！'),
          );
          console.log();
          console.log();

          console.log(
            chalk.blueBright(' .  🎉 SSR模式启动---------------------- ')
          );
          console.log(
            chalk.yellowBright(' .  🎉 请访问host: http://localhost:8005')
          );
          console.log(
            chalk.redBright(' .  🎉 请访问host: http://localhost:8005')
          );

          console.log();
          console.log();
        })
      }

      // page route 热更新
      chokidar.watch(path.join(cwd, './pages'), {
        ignoreInitial: true,
      }).on('all', async () => {
        await resolveRoutes()
      })
      console.log(path.join(cwd, './layout'));

      // layout 重新生成
      chokidar.watch(path.join(cwd, './layout'), {
        ignoreInitial: true,
      }).on('all', async () => {
        hmrPort++;
         await createServer()
      })

    }
  })
}
