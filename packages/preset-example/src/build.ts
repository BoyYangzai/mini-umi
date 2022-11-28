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
    name: 'build',
    fn: () => {
      console.log('building!!');
    }
  })
  IApi.onStart(() => {
    console.log('onStart 生命周期链式调用中----');
  })

  IApi.onStart(() => {
    console.log(`用户配置: ${JSON.stringify(IApi.userConfig)}`);
  })

  IApi.modifyConfig((memo) => {
    return {name:'洋-modify'}
  })

  IApi.modifyConfig((memo) => {
    return { name: '洋-last' }
  })
}
