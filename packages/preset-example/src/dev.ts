import { IApi } from "@mini-umi/core";

// 插件 
export default (IApi: IApi) => {
  IApi.registerCommand({
    name: 'example-dev',
    fn: () => {
      console.log('devServer run!');
    }
  })
  IApi.registerCommand({
    name: 'name',
    fn: ({ n }) => {
      console.log(`Hello,${n}`);
    }
  })
  IApi.register({
    key: 'onBuildStart',
    fn: (name) => {
      console.log('onBuildStart plugin-A');
    }
  })
}
