import { type ViteUserConfig } from "@mini-umi/preset-umi";
import { type ICoreApi } from "@mini-umi/core";
import { IpresetUmi } from "@mini-umi/preset-umi";

type routes = {
  path: string,
  name: string,
  component?: any,
  children?: routes
}[]
export type UserConfig = {
  routes: routes
  routesDir?: string
  viteConfig: ViteUserConfig
}


export type IApi = ICoreApi & IpresetUmi & {
  modifyConfig: ((
    fn: (memo: UserConfig) => UserConfig
  ) => UserConfig | undefined) 
}
