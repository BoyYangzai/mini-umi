import { ICoreApi } from '@mini-umi/core'
import { IpresetUmi } from "./types"

export default (api: ICoreApi & IpresetUmi) => {
  api.registerMethod({
    name: 'modifyViteConfig'
  })
}
