import { ViteUserConfig } from "../dist"
import { IWriteTmpFile } from "./writeTmpFile"


export type IpresetUmi = {
  writeTmpFile: (opts: IWriteTmpFile) => {},
  modifyViteConfig: (fn: (memo: ViteUserConfig) => ViteUserConfig)=>any
}
