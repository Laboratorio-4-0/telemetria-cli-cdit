import type { BuildNestedRouter } from '@/modules/shared/types/router'
import type { RouteRecordRaw } from 'vue-router'

export const buildNestedSensoresRouter: BuildNestedRouter = (props: {
  parentPath: string
}): RouteRecordRaw => {
  const namePath = 'sensores'
  return {
    path: `/${props.parentPath}/${namePath}`,
    name: namePath,
    component: () => import('@/modules/svc-sensores/views/MainRouterView.vue'),
    children: [
      {
        path: `/${props.parentPath}/${namePath}/home`,
        name: 'home-sensores',
        component: () => import('@/modules/svc-sensores/views/SensoresView.vue')
      }
    ]
  }
}
