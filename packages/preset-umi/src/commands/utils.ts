export function getRoutesString(routes){
  let str = '[\n'
  function dps(routes) {
    let t = ''
    routes.forEach(item => {
      t += '{'
      for (const [key, value] of Object.entries(item)) {
        t += key + ': '
        if (typeof value !== 'string' && Array.isArray(value)) {
          t += `[${dps(value)}]`
        } else if (typeof value !== 'string' && getType(value).includes("Function")) {
          t += `${value},\n`
        } else {
          t += `'${value}',\n`
        }
      }
      t += '},'
    })
    return t
  }
  str += dps(routes)
  str += ']'
  function getType(target) {
    return Object.prototype.toString.call(target)
  }

  return str
}
