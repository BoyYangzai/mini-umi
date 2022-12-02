export { type UserConfig as ViteUserConfig } from 'vite'
export { IpresetUmi } from './types'

export default () => {
  return {
    plugins: [
      require.resolve('./methods'),
      require.resolve('./writeTmpFile'),
      require.resolve('./commands/dev'),
      require.resolve('./commands/build'),
      require.resolve('./commands/preview')
    ]
  }
}
