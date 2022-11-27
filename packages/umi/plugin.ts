import { type IApi } from "@mini-umi/core"

export default (IApi: IApi & { onStart: Function }) => {
  
  IApi.register({
    key: 'onStart',
    fn: () => {
      console.log('Command local-plugin running ---');
    }
  })

}
