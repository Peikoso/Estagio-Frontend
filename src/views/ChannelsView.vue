<template>
  <div class="conteudo-container">
    <div class="titulo-descricao">
      <h3>Gestão de Canais de Notificação</h3>
      <p>Gerenciamento e criação de canais de notificação</p>
    </div>
    <button @click="channelModal = true">Novo Canal</button>
  </div>
  <div class="view-container">
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="channel in channels" :key="channel.id">
            <td data-label="Nome">{{ channel.name }}</td>
            <td data-label="Tipo">{{ channel.type }}</td>
            <td data-label="Ativo">{{ channel.isActive ? 'Sim' : 'Não' }}</td>
            <td class="actions" data-label="Ações">
              <button @click="editarChannel(channel)">Editar</button>
              <button @click="excluirChannel(channel)">Deletar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div style="display: flex; justify-content: center; margin-top: 20px">
      </div>
    </div>
  </div>
  <div style="align-items: center; display: flex; justify-content: center;">
    <button @click="refresh()" :disabled="isLoading">Recarregar</button>
  </div>

  <div class="modal" v-if="channelModal">
    <div class="modal-content">
      <button class="close-btn" @click="channelModal = false; this.limparForm()">&times;</button>
      <form @submit.prevent="salvarChannel">
        <h2>Editar Canal</h2>
        <label for="name">Nome:</label>
        <input type="text" id="name" v-model="channel.name" required />

        <label for="type">Tipo:</label>
        <input type="text" id="type" v-model="channel.type" required />

        <div class="switch-container">
          <span class="switch-label">Ativo: </span>
          <label class="switch">
            <input type="checkbox" v-model="channel.isActive" />
            <span class="slider"></span>
          </label>
        </div>

        <label for="config">Configuração (JSON):</label>
        <textarea style="height: 150px;" id="config" v-model="channel.config" rows="4" required></textarea>
        <button type="submit" :disabled="isLoading">{{ isLoading ? 'Salvando...' : 'Salvar' }}</button>
      </form>
    </div>
  </div>

  <div v-if="deleteModal" class="modal">
    <div class="modal-content">
      <h3>Confirmar Exclusão</h3>
      <p>Tem certeza que deseja excluir este canal?</p>
      <div class="botoes-confirmacao">
        <button style="background-color: #b30d14" @click="confirmarDelete()" :disabled="isLoading">{{ isLoading ? 'Excluindo...' : 'Sim, Excluir' }}</button>
        <button @click="deleteModal = false; limparForm()">Cancelar</button>
      </div>
    </div>
  </div>

  <div class="overlay-bloqueio" v-if="showToast">
    <div v-if="toastMessage && !errorMessage" class="mensagem-salvo">
      {{ toastMessage }}
    </div>
    <div
      style="background-color: #b30d14"
      v-if="toastMessage && errorMessage"
      class="mensagem-salvo"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import { getToken } from '../services/token.js'

export default {
  data() {
    return {
      channel: {
        id: '',
        type: '',
        name: '',
        config: {},
        isActive: false,
      },
      filtroNome: '',
      channels: [],
      page: 0,
      perPage: 5,
      channelModal: false,
      editChannel: false,
      deleteModal: false,
      isLoading: false,
      showToast: false,
      toastMessage: '',
      errorMessage: false,
    }
  },
  methods: {
    async getchannels() {
      const token = await getToken()

      const response = await api.get('/config', {
        headers: { Authorization: `Bearer ${token}` },
      })

      this.channels = response.data
    },
    async salvarChannel() {
      this.isLoading = true

      const payload = {
        type: this.channel.type,
        name: this.channel.name,
        config: JSON.parse(this.channel.config),
        isActive: this.channel.isActive,
      }

      try{
        const token = await getToken()

        if (this.editChannel == false) {
          await api.post('/config', payload, {
            headers: { Authorization: `Bearer ${token}` },
          })

          return;
        }

        await api.patch(`/config/${this.channel.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        })


      }     catch (error) {
        this.toast('Erro ao salvar canal', true)
        console.error('Erro ao salvar canal:', error)
      } finally {
        await this.getchannels()
        this.limparForm()
        this.editChannel = false
        this.channelModal = false
        this.isLoading = false
      }

    },
    editarChannel(channel) {
      this.channelModal = true
      this.editChannel = true

      this.channel.id = channel.id
      this.channel.type = channel.type
      this.channel.name = channel.name
      this.channel.config = JSON.stringify(channel.config, null, 2)
      this.channel.isActive = channel.isActive
    },
    excluirChannel(channel) {
      this.channel.id = channel.id
      this.deleteModal = true
    },
    async confirmarDelete() {
      this.isLoading = true
      try{
        const token = await getToken()

        await api.delete(`/config/${this.channel.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

      } catch (error) {
        this.toast('Erro ao deletar canal', true)
        console.error('Erro ao deletar canal:', error)
      } finally {
        this.isLoading = false
        this.limparForm()
        await this.getchannels()
        this.deleteModal = false
      }
    },
    limparForm() {
      this.channel.id = ''
      this.channel.type = ''
      this.channel.name = ''
      this.channel.config = JSON.stringify({}, null, 2)
      this.channel.isActive = false
      this.editChannel = false
    },
    toast(message, isError) {
      this.toastMessage = message
      this.showToast = true
      if (isError) {
        this.errorMessage = true
      }
      setTimeout(() => {
        this.showToast = false
        this.toastMessage = ''
        this.errorMessage = false
      }, 2500)
    },
    async refresh() {
      this.isLoading = true

      try {
        await this.getchannels()
      } catch (error) {
        console.error('Erro ao recarregar canais:', error)
      } finally {
        this.isLoading = false
      }
    }
  },
  async created() {
    await this.getchannels()
  },
}
</script>
