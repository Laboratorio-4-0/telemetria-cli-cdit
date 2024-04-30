<script setup lang="ts">
import { useModalConfirmationMessage } from '../store/useModalConfirmation'
const useModal = useModalConfirmationMessage()
</script>

<template>
  <button
    v-show="false"
    id="modalConfirmationButtonTrigger"
    type="button"
    class="btn btn-primary"
    data-toggle="modal"
    data-target="#confirmationModalCenter"
  ></button>

  <!-- Modal -->
  <div
    class="modal fade"
    id="confirmationModalCenter"
    tabindex="-1"
    role="dialog"
    aria-labelledby="confirmationModalCenterTitle"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLongTitle">
            <img class="ico" src="/src/assets/cdmx_logo.svg" alt="" />
            {{ useModal.title }}
          </h5>
          <button type="button" class="close minimal-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body text-center">
          <img class="mb-3 animate__animated animate__rubberBand" :src="useModal.image" alt="" />
          <br>
          <p class="fs-4">{{ useModal.message }}</p>
          <br /><br />
          <div class="d-flex justify-content-end">
            <button id="canelConfirmationModal" class="btn btn-primary m-2" data-dismiss="modal">
              Cancelar
            </button>
            <button id="aceptConfirmationModal" class="btn btn-info m-2" data-dismiss="modal">
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-title {
  display: flex;
  align-items: flex-end;
  font-size: 19px;
}

.modal-title .ico {
  margin-right: 10px;
  margin-bottom: -2.8px;
  width: 30px;
}

.minimal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.minimal-close:hover {
  opacity: 1;
}
</style>
