import { ICoreApi } from '@mini-umi/core'
import { IpresetUmi } from "./types"

export default (api: ICoreApi & IpresetUmi) => {
  [
    'modifyRoutesDir',
    'modifyViteConfig'
  ].forEach(name =>{
    api.registerMethod({
      name
    })
  })
  
}
