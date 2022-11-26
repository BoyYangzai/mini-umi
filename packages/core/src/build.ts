// 插件 
export default (iApi) => {
  iApi.register({
    key: 'onBuildStart',
    fn: (name) => {
      console.log('onBuildStart plugin-B');
      return name+'B'
    }
  })
}
