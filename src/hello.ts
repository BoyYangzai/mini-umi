export default (iApi) => {

  iApi.registerCommand({
    name: 'dev',
    fn: () => {
      console.log('Hello,Service Core');
    }
  })

}
