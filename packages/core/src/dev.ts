// 插件 
export default (iApi) => {
  iApi.registerCommand({
    name: 'dev',
    fn: () => {
      console.log('devServer run!');
    }
  })
  iApi.registerCommand({
    name: 'name',
    fn: ({ n }) => {
      console.log(`Hello,${n}`);
    }
  })

  iApi.registerCommand({
    name: 't',
    fn: () => {
      console.log('t run!');
    }
  })
  iApi.register({
    key: 'onBuildStart',
    fn: (name) => {
      console.log('onBuildStart plugin-A');
      return name+'A'
    }
  })
}
