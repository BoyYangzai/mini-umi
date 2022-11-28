import { PluginAPi } from "./pluginAPI";

export default (api: PluginAPi) => {
  [
    'onCheck',
    'onStart',
    // todo :
    'modifyAppData',
    'modifyConfig',
    'modifyDefaultConfig',
  ].forEach((name) => {
    api.registerMethod({ name });
  });
};
