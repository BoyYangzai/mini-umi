import { fsExtra,winPath } from '@umijs/utils'
import { join } from 'path'

type routes = {
  path: string
  name: string
  component?: Function
  children?:routes
}[]
export function getRoutes(opts: { dir: string } = { dir: './pages' }) {
  
  const routes: routes = []

  
  const cwd =process.cwd()

  function dps(pPath: string='',dir = 'pages' ) {
    const alllFiles = fsExtra.readdirSync(winPath(join(cwd, dir)))
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
          component: eval(`() => import('../pages${path}.vue')`),
        })
      } else {
        if (pPath !== '') {
          path = `/${path}`
        }
        tRoutesArray.push({
          path,
          name: name,
          component: eval(`() => import('../pages${path}.vue')`),
        })
      }
      
    })
    dirFiles.forEach(item => {
      const name = getName(item)
      const path = `${dir}/${name}`
      tRoutesArray.push({
        path: '',
        name: '',
        children: dps(name, path)
      })
    })
    return tRoutesArray
  }
  routes.push(...dps())

  function getName(fileName) {
    return fileName.replace('.vue','').replace('.tsx','')
  }

  return routes
}
