import { type IApi } from "mini-umi"

export default (api: IApi) => {
  /**
   * 这里是示例生命周期，生命周期可以无限扩展...
   */
  api.register({
    key: 'onStart',
    fn: () => {
      console.log('本地Plugin onStart！');
    }
  })
  api.register({
    key: 'onBuildStart',
    fn: () => {
      console.log('BuildStart------------');
    }
  })

  /**
   * 自定义 cli 指令
   * 执行 npx mini-umi test 试试
   */
  api.registerCommand({
    name: 'test',
    fn() {
      console.log('test Command 正在执行----');
    }
  })

  /**
   * 修改配置文件中的 viteConfig
   * 亦或者直接使用 api.modifyConfig 修改全部配置
   */
  api.modifyViteConfig(memo => {
    memo.resolve!.alias = {
      '@': '../'
    }
    return memo
  })
}
