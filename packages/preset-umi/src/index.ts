export default () => {
  return {
    plugins: [
      require.resolve('./writeTmpFile'),
      require.resolve('./commands/dev'),
      require.resolve('./commands/build'),
      require.resolve('./commands/preview')
    ]
  }
}
