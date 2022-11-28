import { type IApi } from "@mini-umi/core"

export default (IApi: IApi & { onStart: Function }) => {
  
  IApi.onStart(() => {
      console.log('onStart: Command local-plugin running ---');
  })
}
