import { fsExtra,winPath} from '@umijs/utils'
import { join,isAbsolute ,basename} from 'path'
type routes = {
  path: string
  name: string
  component?: Function
  children?:routes
}[]
export function getRoutes(opts: { dirPath: string } = { dirPath: './pages' }) {
  
  const routes: routes = []
  const cwd =process.cwd()

  const routesDir = isAbsolute(opts.dirPath) ? opts.dirPath : winPath(join(cwd, opts.dirPath))
  const dirname = basename(routesDir)

  
  function dps(pPath: string = '', dir = routesDir) {
    const alllFiles = fsExtra.readdirSync(dir)
    const dirFiles = alllFiles.filter(item => !item.includes('.'))
    const componentFiles = alllFiles.filter(item => item.endsWith('.vue') || item.endsWith('.tsx'))

    const tRoutesArray=[]
    componentFiles.forEach(item => {
      const name = getName(item)
      let path = `${pPath}/${name}`
      if (path === '/index') {
        tRoutesArray.push({
          path:'/',
          name: name,
          component: eval(`() => import('../${dirname}${path}.vue')`),
        })
      } else {
        if (pPath !== '') {
          path = `/${path}`
        }
        tRoutesArray.push({
          path,
          name: name,
          component: eval(`() => import('../${dirname}${path}.vue')`),
        })
      }
      
    })
    dirFiles.forEach(item => {
      const name: string = getName(item)
      if (name.startsWith(':')) {
        let path = `${pPath}/${name}`
        if (pPath !== '') {
          path = `/${path}`
        }
        tRoutesArray.push({
          path,
          name: name,
          component: eval(`() => import('../${dirname}${path}/index.vue')`)
        })
      } else {
        const path = `${dir}/${name}`
        tRoutesArray.push({
          path: '',
          name: '',
          children: dps(name, path)
        })
      }
     
    })
    return tRoutesArray
  }
  routes.push(...dps())

  function getName(fileName) {
    return fileName.replace('.vue','').replace('.tsx','')
  }
  
  return routes
}
