import { createRouter, createWebHistory } from 'vue-router'
import { getUserPayloadFromToken, verifyIfUserIsLoggedIn } from '@/modules/shared/utils/jwt-decode'
import { UserType } from '@/modules/svc-usuarios/types/users'
import { buildNestedAdminRouter } from '@/modules/svc-usuarios/router/admin'
import { buildNestedRedLoraWanRouter } from '@/modules/svc-alcantarillas/router'
import { buildNestedSensoresRouter } from '@/modules/svc-sensores/router'
import { buildNestedTrenLigeroRouterRouter } from '@/modules/svc-tren-ligero/router'
import { ListaDependencias } from '../types/dependencias'
import { isUserDependenciaAllowed } from '@/modules/shared/utils/jwt-decode'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/modules/shared/views/LoginView.vue'),
      meta: {
        requiresAuthentication: false
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/modules/shared/views/DashboardView.vue'),
      meta: {
        requiresAuthentication: true
      },
      children: [
        {
          path: '/dashboard/profile',
          name: 'profile',
          component: () => import('@/modules/svc-usuarios/views/ProfileView.vue'),
          meta: {
            requiresAuthentication: true,
            isAdminView: false
          }
        },
        {
          ...buildNestedTrenLigeroRouterRouter({ parentPath: 'dashboard' }),
          meta: {
            requiresAuthentication: true,
            isAdminView: false,
            isDependenciaView: true,
            tagNameDependencia: ListaDependencias.TrenLigero
          }
        },
        {
          ...buildNestedSensoresRouter({ parentPath: 'dashboard' }),
          meta: {
            requiresAuthentication: true,
            isAdminView: false,
            isDependenciaView: true,
            tagNameDependencia: ListaDependencias.Sensores
          }
        },
        {
          ...buildNestedRedLoraWanRouter({ parentPath: 'dashboard' }),
          meta: {
            requiresAuthentication: true,
            isAdminView: false,
            isDependenciaView: true,
            tagNameDependencia: ListaDependencias.Alcantarillas
          }
        },
        {
          ...buildNestedAdminRouter({ parentPath: 'dashboard' }),
          meta: {
            requiresAuthentication: true,
            isAdminView: true
          }
        },
        {
          path: '/:pathMatch(.*)*',
          redirect: '/dashboard/profile'
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard/profile'
    }
  ]
})

/* Proección del router */
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuthentication)
  // ¿La ruta requiere autenticación?
  const isUserLoggedIn = await verifyIfUserIsLoggedIn()
  if (requiresAuth) {
    // ¿ El usuario esta logeado ?
    if (isUserLoggedIn) {
      const userTokenInfo = getUserPayloadFromToken()
      const isAdminRoute = to.matched.some((r) => r.meta.isAdminView)
      const isDependenciaRoute = to.matched.some((r) => r.meta.isDependenciaView)

      // ¿Acceder a ruta de admin
      if (isAdminRoute) {
        if (userTokenInfo?.rol === UserType.Admin) {
          next()
        } else {
          next('/')
        }
      } else if (isDependenciaRoute) {
        if (isUserDependenciaAllowed(to.meta.tagNameDependencia as ListaDependencias)) {
          next()
        } else {
          next('/')
        }
      } else {
        next()
      }
    } else {
      // Redirige al login
      next('/')
    }
  } else {
    if (isUserLoggedIn) {
      // si el usuario ya está logeado, redirigir a la ruta principal
      next('/dashboard/profile')
    } else {
      // Redirige al login
      next()
    }
  }
})

export default router
