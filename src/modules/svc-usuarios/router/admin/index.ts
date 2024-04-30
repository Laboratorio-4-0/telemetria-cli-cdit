import type { BuildNestedRouter } from '@/modules/shared/types/router'
import type { RouteRecordRaw } from 'vue-router'

export const buildNestedAdminRouter:BuildNestedRouter = (props: { parentPath: string }): RouteRecordRaw => {
  const namePath = "admin"
  return {
    path: `/${props.parentPath}/${namePath}`,
    name: 'admin',
    component: () => import('@/modules/svc-usuarios/views/admin/AdminRouterView.vue'),
    children: [
      {
        path: `/${props.parentPath}/${namePath}/home`,
        name: 'home',
        component: () => import('@/modules/svc-usuarios/views/admin/HomeView.vue')
      },
      {
        path: `/${props.parentPath}/${namePath}/gestion-usuarios`,
        name: 'gestion-usuarios',
        component: () => import('@/modules/svc-usuarios/views/admin/GestionUsuariosView.vue')
      },
      {
        path: `/${props.parentPath}/${namePath}/gestion-apis`,
        name: 'gestion-apis',
        component: () => import('@/modules/svc-usuarios/views/admin/GestionApisView.vue')
      }
    ]
  }
}
