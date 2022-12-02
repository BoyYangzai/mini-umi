import { type ICoreApi } from '@mini-umi/core'
import { IpresetUmi } from '../types';
import { createServer } from 'vite'
import { join } from 'path'
export default (api: IpresetUmi & ICoreApi) => {
  const cwd = process.cwd()
  api.registerCommand({
    name: 'preview',
    async fn() {
      // start server
      const server = await createServer({
        // 任何合法的用户配置选项，加上 `mode` 和 `configFile`
        configFile: false,
        root: join(cwd, './.mini-umi/dist'),
        server: {
          port: 8000
        }
      })
      await server.listen()
      server.printUrls()
    }
  })
}
