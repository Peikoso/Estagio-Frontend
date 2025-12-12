<template>
  <div>
    <div class="conteudo-container">
      <div class="titulo-descricao">
        <h3>Gestão de Incidentes</h3>
        <p>Configure e gerencie os incidentes</p>
      </div>
    </div>
    <div class="view-container">
      <div class="filtro-container">
        <label class="filtro-label" for="filtro">Filtrar Incidentes</label>
        <input type="text" id="filtro" v-model="filtroRegra" placeholder="Digite o nome da regra" />
        <select id="filtro-status" v-model="filtroStatus">
          <option :value="null">Status</option>
          <option value="OPEN">Open</option>
          <option value="ACK">ACK</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select id="filtro-prioridade" v-model="filtroPrioridade">
          <option :value="null">Prioridades</option>
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
        </select>
        <select id="filtroRole" v-model="filtroRole">
          <option :value="null" selected>Roles</option>
          <option v-for="(role, index) in roles" :key="index" :value="role.id">
            {{ role.name }}
          </option>
        </select>
        <span class="filtro-label" style="margin-left: auto;">Meus Incidentes</span>
        <label class="switch">
          <input
          type="checkbox"
          v-model="filtrarMeusIncidentes"
          />
          <span class="slider"></span>
        </label>
      </div>
      <div class="table-responsive">
        <h2 v-if="incidentes.length == 0">Nenhum Incidente Registrado</h2>
        <table v-if="incidentes.length >= 1">
          <thead>
            <tr>
              <th>Detalhes</th>
              <th>Regra</th>
              <th>Prioridade</th>
              <th>Aberta em</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="incidente in incidentes" :key="incidente.id">
              <td data-label="Detalhes" class="actions">
                <button
                  @click=" incidenteModal = true; detalhesIncidente(incidente.id)">
                  Ver
                </button>
              </td>
              <td data-label="Regra">{{ incidente.rule?.name ?? 'N/A' }}</td>
              <td data-label="Prioridade">{{ formatPriority(incidente.priority) }}</td>
              <td data-label="Aberta em">{{ formatDate(incidente.createdAt) }}</td>
              <td data-label="Status" class="actions">
                <button
                  :disabled="user.profile === 'viewer'"
                  class="button-status"
                  :class="buttonStatus(incidente.status)"
                  @click="statusIncidente(incidente)"
                >
                  {{ incidente.status }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="display: flex; justify-content: center; margin-top: 20px">
          <button @click="pagAnterior">Anterior</button>
          <button @click="pagSeguinte">Seguinte</button>
        </div>
      </div>
    </div>

    <div class="modal" v-if="incidenteModal">
      <div class="modal-content" style="max-width: 800px">
        <button
          class="close-btn"
          style="top: 34px"
          @click="incidenteModal = false; limparIncidente(); $router.push({ name: $route.name, query: {} })">
          &times;
        </button>
        <div class="modal-details">
          <h4>Detalhes do Incidente</h4>
          <p><strong>ID do Incidente:</strong> {{ incidente.id }}</p>
          <p><strong>Criado em:</strong> {{ formatDate(incidente.createdAt) }}</p>
          <p><strong>Regra:</strong> {{ incidente.rule?.name ?? 'N/A' }}</p>
          <p><strong>Prioridade:</strong> {{ formatPriority(incidente.priority) }}</p>
          <p><strong>Status:</strong> {{ incidente.status }}</p>
          <p><strong>Ack em:</strong> {{ formatDate(incidente.ackAt) }}</p>
          <p><strong>Closed em:</strong> {{ formatDate(incidente.closedAt) }}</p>
          <p><strong>Usuário Designado:</strong> {{ incidente.assignedUserName }}</p>
        </div>
        <div style="justify-content: center; display: flex; margin: 10px">
          <button
            :disabled="user.profile === 'viewer'"
            class="button-status"
            :class="buttonStatus(incidente.status)"
            @click="statusIncidente(incidente)"
          >
            {{ incidente.status }}
          </button>
          <button
            :disabled="user.profile === 'viewer'"
            class="button-status"
            style="width: 90px"
            @click="reexecuteIncidente(incidente)"
          >
            Reexecutar
          </button>
        </div>
        <div style="justify-content: center; display: flex; margin: 10px">
          <label for="user" style="margin: 10px">Escalonamento Manual</label>
          <select v-model="selectedUserId" id="user">
            <option disabled value="">Selecione um usuário</option>
            <option v-for="user in eligibleUsers" :key="user.id" :value="user.id">
              {{ user.email }}
            </option>
          </select>
          <button class="button-status" style="margin: 10px" @click="escalonarIncidente()" :disabled="user.profile !== 'admin' || isLoading">
            {{isLoading ? 'Carregando...' : 'Salvar'}}
          </button>
        </div>
        <hr />
        <div class="modal-details">
          <h2>Ações do Incidente</h2>
          <div class="table-responsive">
            <p v-if="incidentLogs.length == 0"><strong>Nenhuma Ação Registrada</strong></p>
            <table v-if="incidentLogs.length >= 1">
              <thead>
                <tr>
                  <th>De</th>
                  <th>Para</th>
                  <th>Comentário</th>
                  <th>Usuário</th>
                  <th>Tempo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in incidentLogs" :key="log.id">
                  <td data-label="De">{{ log.previousStatus }}</td>
                  <td data-label="Para">{{ log.currentStatus }}</td>
                  <td data-label="Comentário">{{ log.comment }}</td>
                  <td data-label="Usuário">{{ log.actionUser.name ?? '' }}</td>
                  <td data-label="Feita Em">{{ formatDate(log.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="comentarioModal" class="modal">
      <div class="modal-content">
        <button class="close-btn" @click="comentarioModal = false; limparComentario()">&times;</button>
        <form @submit.prevent="salvarComentario()">
          <label for="comentario">Comentário</label>
          <textarea id="comentario" v-model="novoComentario" required></textarea>
          <br /><br />
          <button type="submit" :disabled="isLoading">{{isLoading ? 'Carregando...' : 'Salvar'}}</button>
        </form>
      </div>
    </div>

    <div v-if="reexecuteModal" class="modal">
      <div class="modal-content">
        <button class="close-btn" @click="reexecuteModal = false">&times;</button>
        <div>
          <h2>Reexecutar Regra</h2>
          <p>Tem certeza que deseja reexecutar a regra?</p>
          <button @click="confirmReexecuteIncidente()" :disabled="isLoading">{{isLoading ? 'Carregando...' : 'Sim'}}</button>
          <button style="background-color: #b30d14" @click="reexecuteModal = false">Não</button>
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
  </div>
</template>

<script>
import api from '@/services/api'
import { getToken } from '@/services/token'
import { formatDate, formatPriority } from '@/services/format'

export default {
  name: 'IncidentesView',
  data() {
    return {
      incidente: {
        id: '',
        assignedUserId: '',
        assignedUserName: '',
        ruleId: '',
        status: '',
        priority: '',
        ackAt: '',
        closedAt: '',
        rule: '',
        createdAt: '',
      },
      incidentes: [],
      incidentLogs: [],
      user: {},
      selectedUserId: '',
      novoComentario: '',
      eligibleUsers: [],
      roles: [],
      filtroRegra: '',
      filtroStatus: null,
      filtroPrioridade: null,
      filtroRole: null,
      filtrarMeusIncidentes: false,
      incidenteModal: false,
      comentarioModal: false,
      reexecuteModal: false,
      page: 1,
      perPage: 5,
      showToast: false,
      toastMessage: '',
      errorMessage: false,
      isLoading: false,
      pollingTime: 5000, // 5 segundos
      pollingInterval: null,
      timer: null,
    }
  },
  methods: {
    formatDate,
    formatPriority,
    async getCurrentUser() {
      try{
        const token = await getToken()

        const response = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        this.user = response.data
      } catch (error) {
        console.error('Erro ao buscar usuário atual. Tente novamente.', error)
      }
    },
    async getIncidents() {
      try{
        const token = await getToken()

        const params = {
          status: this.filtroStatus || null,
          ruleName: this.filtroRegra || null,
          priority: this.filtroPrioridade || null,
          roleId: this.filtroRole || null,
          ownIncidents: this.filtrarMeusIncidentes ? true : null,
          page: this.page,
          perPage: this.perPage,
        }

        const response = await api.get('/incidents', {
          headers: { Authorization: `Bearer ${token}` },
          params: params,
        })

        this.incidentes = response.data
      } catch (error) {
        console.error('Erro ao buscar incidentes. Tente novamente.', error)
      }
    },
    async getAllRoles() {
      try{
        const token = await getToken()

        const response = await api.get('/roles', {
          headers: { Authorization: `Bearer ${token}` },
        })

        this.roles = response.data
      } catch (error) {
        console.error('Erro ao buscar roles. Tente novamente.', error)
      }
    },
    async getEligibleUsers(incidenteId) {
      try{
        const token = await getToken()

        const response = await api.get(`/incidents/${incidenteId}/eligible-users`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        this.eligibleUsers = response.data
      } catch (error) {
        console.error('Erro ao buscar usuários elegíveis. Tente novamente.', error)
      }
    },
    async detalhesIncidente(incidenteId) {
      this.incidente = await this.getIncidenteById(incidenteId)

      if (this.incidente.assignedUserId) {
        this.incidente.assignedUserName = await this.getUserName(this.incidente.assignedUserId)
      }

      this.incidentLogs = await this.getIncidentLogs(this.incidente.id)

      await this.getEligibleUsers(this.incidente.id)
    },

    async getIncidenteById(id) {
      try{
        const token = await getToken()

        const response = await api.get(`/incidents/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        return response.data
      } catch (error) {
        console.error('Erro ao buscar incidente. Tente novamente.', error)
      }
    },

    async getIncidentLogs(incidenteId) {
      try{
        const token = await getToken()

        const response = await api.get(`/incidents/${incidenteId}/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        return response.data
      } catch (error) {
        console.error('Erro ao buscar logs do incidente. Tente novamente', error)
      }
    },

    async getUserName(userId) {
      try{
        const token = await getToken()

        const response = await api.get(`/users/${userId}/name`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        return response.data.name
      } catch (error) {
        console.error('Erro ao buscar nome do usuário. Tente novamente', error)
      }
    },

    async statusIncidente(incidente) {
      this.incidente = incidente

      if (this.incidente.status === 'CLOSED') {
        this.reexecuteModal = true
        return
      }

      this.comentarioModal = true
    },
    reexecuteIncidente(incidente) {
      this.incidente = incidente

      this.reexecuteModal = true
    },

    async confirmReexecuteIncidente() {
      this.isLoading = true
      const token = await getToken()

      try {
        await api.post(
          `/incidents/${this.incidente.id}/reexecute`,
          { fake: true },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        this.toast('Regra reexecutada com sucesso.', false)
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.toast('Você não tem permissão para realizar esta ação.', true)
          return;
        }
        this.toast('Erro ao reexecutar incidente. Tente novamente.', true)

      } finally {
        await this.getIncidents()
        await this.detalhesIncidente(this.incidente.id)
        this.isLoading = false
      }

      this.reexecuteModal = false
    },

    buttonStatus(status) {
      if (status === 'OPEN') {
        return 'button-red'
      } else if (status === 'ACK') {
        return 'button-yellow'
      } else {
        return ''
      }
    },

    async salvarComentario() {
      this.isLoading = true
      const token = await getToken()

      if (!this.novoComentario.trim()) {
        this.toast('O comentário não pode ser vazio.', true)
        this.isLoading = false
        return
      }

      try {
        await api.post(
          `/incidents/${this.incidente.id}/action`,
          { comment: this.novoComentario },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        this.toast('Comentário adicionado com sucesso.', false)

      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.toast('Você não tem permissão para realizar esta ação.', true)
          return;
        }
        this.toast('Erro ao adicionar comentário. Tente novamente.', true)
      } finally {
        this.limparComentario()
        await this.getIncidents()
        await this.detalhesIncidente(this.incidente.id)
        this.comentarioModal = false
        this.isLoading = false
      }
    },
    async escalonarIncidente() {
      this.isLoading = true

      if (!this.selectedUserId) {
        this.toast('Por favor, selecione um usuário para escalonamento.', true)
        return
      }

      if (this.incidente.status === 'closed') {
        this.toast('Não é possível escalonar um incidente fechado.', true)
        return
      }

      try{
        const token = await getToken()

        await api.patch(
          `/incidents/${this.incidente.id}/manual-escalation`,
          {assignedUserId: this.selectedUserId},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        this.toast('Incidente escalonado com sucesso.', false)
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.toast('Você não tem permissão para realizar esta ação.', true)
          return;
        }
        this.toast('Erro ao escalonar incidente. Tente novamente.', true)
      } finally {
        await this.getIncidents()
        await this.detalhesIncidente(this.incidente.id)
        this.isLoading = false
      }

      this.selectedUserId = ''
    },

    limparIncidente() {
      this.incidente.id = ''
      this.incidente.assignedUserName = ''
      this.incidente.assignedUserId = ''
      this.incidente.ruleId = ''
      this.incidente.status = ''
      this.incidente.priority = ''
      this.incidente.createdAt = ''
      this.incidente.ackAt = ''
      this.incidente.closedAt = ''
      this.incidente.rule = ''
      this.novoComentario = ''
      this.eligibleUsers = []

      this.incidentLogs = []
    },
    limparComentario() {
      this.novoComentario = ''
    },
    async pagAnterior() {
      if (this.page > 1) {
        this.page--
        await this.getIncidents()
      }
    },
    async pagSeguinte() {
      this.page++
      await this.getIncidents()
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
    applyFilters() {
      clearTimeout(this.timer)

      this.timer = setTimeout(() => {
        this.page = 1
        this.getIncidents()
      }, 500) // 500ms = meio segundo
    },
    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.getIncidents()
      }, this.pollingTime)
    },
  },
  created() {
    this.getCurrentUser()
    this.getIncidents()
    this.getAllRoles()
    this.startPolling()

  },
  beforeUnmount() {
    clearInterval(this.pollingInterval)
  },
  watch: {
    '$route.query.incidenteId': {
      immediate: true,
      async handler(novoId) {
        if (!novoId) {
          return
        }
        const response = await this.getIncidenteById(novoId)

        this.incidenteModal = true
        this.detalhesIncidente(response.id)
      },
    },
    filtroRegra() {
      this.applyFilters()
    },
    filtroRole() {
      this.applyFilters()
    },
    filtroPrioridade() {
      this.applyFilters()
    },
    filtroStatus() {
      this.applyFilters()
    },
    filtrarMeusIncidentes() {
      this.applyFilters()
    },
  },
}
</script>
