import type { BuildNestedRouter } from '@/modules/shared/types/router'
import type { RouteRecordRaw } from 'vue-router'

export const buildNestedRedLoraWanRouter: BuildNestedRouter = (props: {
  parentPath: string
}): RouteRecordRaw => {
  const namePath = 'alcantarillas'
  return {
    path: `/${props.parentPath}/alcantarillas`,
    name: namePath,
    component: () => import('@/modules/svc-alcantarillas/views/MainRouterView.vue'),
    children: [
      {
        path: `/${props.parentPath}/${namePath}/home`,
        name: 'home-alcantarillas',
        component: () => import('@/modules/svc-alcantarillas/views/mapa/MapaAlcantarillasView.vue')
      }
    ]
  }
}
