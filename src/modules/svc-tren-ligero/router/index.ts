import type { BuildNestedRouter } from '@/modules/shared/types/router'
import type { RouteRecordRaw } from 'vue-router'

export const buildNestedTrenLigeroRouterRouter: BuildNestedRouter = (props: {
  parentPath: string
}): RouteRecordRaw => {
  const namePath = "tren-ligero"
  return {
    path: `/${props.parentPath}/${namePath}`,
    name: 'tren-ligero',
    component: () => import('@/modules/svc-tren-ligero/views/MainRouterView.vue'),
    children: [
      {
        path: `${props.parentPath}/${namePath}/mapa-tren-ligero`,
        name: 'mapa-tren-ligero',
        component: () => import('@/modules/svc-tren-ligero/views/mapa/MapaTrenLigeroView.vue')
      }
    ]
  }
}
