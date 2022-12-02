import { IWriteTmpFile } from "./writeTmpFile"
import { type UserConfig as ViteUserConfig } from 'vite'


export type IpresetUmi = {
  writeTmpFile: (opts: IWriteTmpFile) => {},
  modifyViteConfig: (fn: (memo: ViteUserConfig) => ViteUserConfig) => any,

}
