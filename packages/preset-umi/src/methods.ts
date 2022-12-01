import { IApi } from "mini-umi";

export default (api: IApi) => {
  api.registerMethod({
    name: 'modifyViteConfig'
  })
}
