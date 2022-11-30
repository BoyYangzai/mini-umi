import { type IApi } from "@mini-umi/core"
import { IWriteTmpFile } from "./writeTmpFile"


export type IpresetUmi = IApi & {
  writeTmpFile: (opts: IWriteTmpFile)=>{}
}
