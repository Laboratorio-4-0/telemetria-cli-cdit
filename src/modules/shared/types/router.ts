import type { RouteRecordRaw } from 'vue-router'

export interface BuildNestedRouter {
  (props: { parentPath: string }): RouteRecordRaw
}
