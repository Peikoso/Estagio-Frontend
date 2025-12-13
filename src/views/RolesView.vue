<template>
  <div class="conteudo-container">
    <div class="titulo-descricao">
      <h3>Gestão de Roles</h3>
      <p>Gerenciamento e criação de roles</p>
    </div>
    <button @click="roleModal = true">Nova Role</button>
  </div>
  <div class="view-container">
    <div>
      <label class="filtro-label" for="filtro">Filtrar Nome</label>
      <input type="text" id="filtro" v-model="filtroNome" placeholder="Digite o nome da role" />
    </div>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Cor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in roles" :key="role.id">
            <td data-label="Nome">{{ role.name }}</td>
            <td data-label="Descrição">{{ role.description }}</td>
            <td data-label="Cor">
              <span
                :style="{
                  backgroundColor: role.color,
                  width: '20px',
                  height: '20px',
                  display: 'inline-block',
                }"
              ></span>
            </td>
            <td class="actions" data-label="Ações">
              <button @click="editarRole(role)">Editar</button>
              <button @click="excluirRole(role)">Deletar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div style="display: flex; justify-content: center; margin-top: 20px">
        <button @click="pagAnterior()">Anterior</button>
        <button @click="pagSeguinte()">Seguinte</button>
      </div>
    </div>
  </div>
  <div style="align-items: center; display: flex; justify-content: center;">
    <button @click="refresh()" :disabled="isLoading">Recarregar</button>
  </div>

  <div class="modal" v-if="roleModal">
    <div class="modal-content">
      <button class="close-btn" @click="roleModal = false; this.limparForm()">&times;</button>
      <form @submit.prevent="salvarRole">
        <h2>Editar Role</h2>
        <label for="name">Nome:</label>
        <input type="text" id="name" v-model="role.name" required maxlength="20"/>

        <label for="description">Descrição:</label>
        <input type="text" id="description" v-model="role.description" required maxlength="150"/>

        <div
          style="
            justify-content: center;
            align-items: center;
            display: flex;
            flex-direction: column;
            margin-top: 10px;
            margin-bottom: 10px;
          "
        >
          <label for="color">Cor:</label>
          <input
            :style="{ width: '100px', height: '100px' }"
            type="color"
            id="color"
            v-model="role.color"
            required
          />
        </div>

        <div class="switch-container">
          <span class="switch-label">Super ADM</span>
          <label class="switch">
            <input type="checkbox" v-model="role.isSuperadmin" />
            <span class="slider"></span>
          </label>
        </div>
        <button type="submit" :disabled="isLoading">{{ isLoading ? 'Salvando...' : 'Salvar'}}</button>
      </form>
    </div>
  </div>

  <div v-if="deleteModal" class="modal">
    <div class="modal-content">
      <h3>Confirmar Exclusão</h3>
      <p>Tem certeza que deseja excluir esta role?</p>
      <div class="botoes-confirmacao">
        <button style="background-color: #b30d14" @click="confirmarDelete()" :disabled="isLoading">{{ isLoading ? 'Excluindo...' : 'Sim, Excluir'}}</button>
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
      role: {
        id: '',
        name: '',
        description: '',
        color: '#000000',
        isSuperadmin: false,
      },
      filtroNome: '',
      page: 1,
      perPage: 5,
      roles: [],
      roleModal: false,
      editRole: false,
      deleteModal: false,
      isLoading: false,
      showToast: false,
      toastMessage: '',
      errorMessage: false,
      timer: null,
    }
  },
  methods: {
    pagAnterior() {
      this.page--
      this.getRoles()
    },
    pagSeguinte() {
      this.page++
      this.getRoles()
    },
    async getRoles() {
      const params = {
        name: this.filtroNome,
        page: this.page,
        perPage: this.perPage,
      }

      try{
        const token = await getToken()

        const response = await api.get('/roles', {
          headers: { Authorization: `Bearer ${token}` },
          params: params,
        })

        this.roles = response.data
      } catch (error) {
        console.error('Erro ao buscar roles:', error)
      }
    },
    async salvarRole() {
      this.isLoading = true

      const data = {
        name: this.role.name,
        description: this.role.description,
        color: this.role.color,
        isSuperadmin: this.role.isSuperadmin,
      }

      try{
        const token = await getToken()

        if (this.editRole == false) {
          await api.post('/roles', data, {
            headers: { Authorization: `Bearer ${token}` },
          })
          return;
        }

        await api.patch(`/roles/${this.role.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        })

      } catch (error) {
        if(error.response && error.response.status === 403 || error.response.status === 401){
          this.toast(`Erro: Permissão negada`, true)
          return;
        }
        console.error('Erro ao salvar role:', error)
        this.toast('Erro ao salvar role', true)
      } finally {
        await this.getRoles()
        this.limparForm()
        this.editRole = false
        this.roleModal = false
        this.isLoading = false
      }


    },
    editarRole(role) {
      this.roleModal = true
      this.editRole = true

      this.role.id = role.id
      this.role.name = role.name
      this.role.description = role.description
      this.role.color = role.color
      this.role.isSuperadmin = role.isSuperadmin
    },
    excluirRole(role) {
      this.role.id = role.id
      this.deleteModal = true
    },
    async confirmarDelete() {
      this.isLoading = true

      try{
        const token = await getToken()

        await api.delete(`/roles/${this.role.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

      } catch (error) {
        this.toast('Erro ao deletar role', true)
        console.error('Erro ao deletar role:', error)
      } finally {
        this.limparForm()
        await this.getRoles()
        this.deleteModal = false
        this.isLoading = false
      }
    },
    limparForm() {
      this.role.name = ''
      this.role.description = ''
      this.role.color = '#000000'
      this.role.id = ''
      this.role.isSuperadmin = false
      this.editRole = false
    },
    applyFilters() {
      clearTimeout(this.timer)

      this.timer = setTimeout(() => {
        this.page = 1
        this.getRoles()
      }, 500) // 500ms = meio segundo
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
      
      try{
        await this.getRoles()
      } catch (error) {
        console.error('Erro ao recarregar:', error)
      } finally {
        this.isLoading = false
      }
    }
  },
  created() {
    this.getRoles()
  },
  watch: {
    filtroNome() {
      this.applyFilters()
    }
  },
}
</script>
