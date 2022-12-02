import { type ViteUserConfig } from "@mini-umi/preset-umi";
import { type ICoreApi } from "@mini-umi/core";
import { IpresetUmi } from "@mini-umi/preset-umi";
export type UserConfig = {
  routesPageDir?: string
  viteConfig: ViteUserConfig
}


export type IApi = ICoreApi & IpresetUmi & {
  modifyConfig: ((
    fn: (memo: UserConfig) => UserConfig
  ) => UserConfig | undefined) 
}
