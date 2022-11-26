export type ICommand = {
  name: string;
  fn: (object:any)=>{};
}
export class Command{
  name;
  description;
  options;
  details;
  fn;
  plugin;
  configResolveMode;
  constructor(opts: any) {
    this.name = opts.name;
    this.description = opts.description;
    this.options = opts.options;
    this.details = opts.details;
    this.fn = opts.fn;
    this.plugin = opts.plugin;
    this.configResolveMode = opts.configResolveMode || 'strict';
  }
}
