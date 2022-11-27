export default () => {
  return {
    plugins: [
      require.resolve('./dev'),
      require.resolve('./build')
    ]
  }
}
