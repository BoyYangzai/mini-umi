import { type ViteUserConfig } from "@mini-umi/preset-umi";
import {type IApi } from "@mini-umi/core";
import { IpresetUmi } from "@mini-umi/preset-umi";
export type UserConfig = {
  routesPageDir?: string
  viteConfig: ViteUserConfig
}


export type IApi = IApi & IpresetUmi
