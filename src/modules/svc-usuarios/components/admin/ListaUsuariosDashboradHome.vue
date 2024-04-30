<script setup lang="ts">
import { UserType, type UserModel } from '../../types/users'
import EmptyRecords from '@/modules/shared/components/EmptyContent.vue'
import type { PropType } from 'vue'

const props = defineProps({
  users: Object as PropType<UserModel[]>
})
</script>
<template>
  <EmptyRecords v-if="props.users?.length === 0"></EmptyRecords>
  <table v-else class="table table-hover">
    <thead>
      <tr>
        <th>ID</th>
        <th class="">Estado</th>
        <th class="">Nombre</th>
        <th class="">Apellidos</th>
        <th class="">Correo electronico</th>
        <th class="">Rol</th>
        <th class="">Servicios visibles</th>
        <th class=""></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item, idx) in props.users"
        :key="idx"
        class="animate__animated animate__bounceInRight"
      >
        <td class="">{{ item.id }}</td>
        <td>
          {{ item.activo ? 'Activo' : 'Inactivo' }}
          <span v-if="item.activo" class="badge bg-success"
            ><i class="bi bi-check-circle"></i
          ></span>
          <span v-else class="badge bg-danger"><i class="bi bi-x-circle"></i></span>
        </td>
        <td class="">{{ item.nombre }}</td>
        <td class="">
          {{ item.apellidoPaterno + ' ' + item.apellidoMaterno }}
        </td>
        <td class="">{{ item.email }}</td>
        <td class="">
          {{ item.rol === UserType.Admin ? 'Administrador' : 'Usuario común' }}
        </td>
        <td class="">
          <ul style="list-style-type: none; padding-left: 0">
            <li v-for="(itemm, idxx) of item.dependenciasVisibles" :key="idxx">
              {{ itemm }}
            </li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</template>
