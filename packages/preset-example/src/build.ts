import { type IApi } from "@mini-umi/core";

// 插件 
export default (IApi:IApi) => {
  IApi.register({
    key: 'onBuildStart',
    fn: (name) => {
      console.log('onBuildStart plugin-B');
    }
  })
  IApi.registerCommand({
    name: 'example-build',
    fn: () => {
      console.log('building!!');
    }
  })
 
}
