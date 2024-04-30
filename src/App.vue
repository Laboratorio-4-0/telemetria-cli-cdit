<script lang="ts" setup>
import { RouterView } from 'vue-router'
import CustomModalVue from '@/modules/shared/components/CustomModal.vue'
import CustomConfirmationModal from './modules/shared/components/CustomConfirmationModal.vue'
</script>
<template>
  <CustomModalVue />
  <CustomConfirmationModal />
  <RouterView />
</template>
