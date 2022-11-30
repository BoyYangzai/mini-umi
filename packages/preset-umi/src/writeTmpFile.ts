import { BaseGenerator } from '@umijs/utils'
import { IpresetUmi } from "./types";
import { join } from 'path'
import {
  winPath,
} from '@umijs/utils';
export interface IWriteTmpFile {
  path: string 
  target: string
  data: object
}
export default (api: IpresetUmi) => {
  api.registerMethod({
    name: 'writeTmpFile',
    async fn(opts: IWriteTmpFile) {
     const generate = new BaseGenerator({
       path: winPath(join(join(__dirname, '../template'), opts.path)),
        target: opts.target,
        data: opts.data,
        questions: []
     })      
      await generate.run()
    }
  })
}
