<template>
  <div>
    <div class="conteudo-container">
      <div class="titulo-descricao">
        <h3>Dashboard de Monitoramento</h3>
        <p>Visão geral do sistema de plantão em tempo real</p>
      </div>
    </div>
    <div class="small-views">
      <div class="small-view-container">
        <div>
          <h3>Incidentes Abertos</h3>
          <br /><br />
          <h3>{{ metrics.totalOpen }}</h3>
          <br />
          <br />
          <p>Aguardando ação</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Em Tratamento</h3>
          <br /><br />
          <h3>{{ metrics.totalAck }}</h3>
          <br />
          <br />
          <p>Reconhecidos</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Fechados</h3>
          <br /><br />
          <h3>{{ metrics.totalClosed }}</h3>
          <br />
          <br />
          <p>Resolvidos</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Regras Ativas</h3>
          <br /><br />
          <h3>{{ metrics.totalRulesActive }}</h3>
          <br />
          <br />
          <p>Em execução</p>
        </div>
      </div>
    </div>
    <div class="small-views">
      <div class="small-view-container">
        <div>
          <h3>Tempo Médio de ACK</h3>
          <br /><br />
          <h3>{{ (metrics.avgAckTimeSeconds / 60).toFixed(0) }} minutos</h3>
          <br />
          <br />
          <p>Desde criação até reconhecimento</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Tempo Médio de Resolução</h3>
          <br /><br />
          <h3>{{ (metrics.avgResolutionTimeSeconds / 60).toFixed(0) }} minutos</h3>
          <br />
          <br />
          <p>Desde criação até fechamento</p>
        </div>
      </div>
    </div>
    <div class="view-container">
      <p>Feed de Incidentes</p>
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
      </div>
      <div class="table-responsive">
        <h2 v-if="incidentes.length == 0">Nenhum incidente</h2>
        <table v-if="incidentes.length >= 1">
          <thead>
            <tr>
              <th>Regra</th>
              <th>Prioridade</th>
              <th>Aberta em</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="incidente in incidentes" :key="incidente.id">
              <td data-label="Regra">{{ incidente.rule.name }}</td>
              <td data-label="Prioridade">{{ formatPriority(incidente.priority) }}</td>
              <td data-label="Aberta em">{{ formatDate(incidente.createdAt) }}</td>
              <td data-label="Status" class="actions">
                <button :disabled="user.profile === 'viewer'" class="button-status" :class="buttonStatus(incidente.status)" @click="mudarStatus(incidente)">{{ incidente.status }}</button>
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
    <div v-if="comentarioModal" class="modal">
      <div class="modal-content">
        <button class="close-btn" @click="comentarioModal = false; limparIncidente()">&times;</button>
        <form @submit.prevent="adicionarComentario()">
          <label for="comentario">Comentário</label>
          <textarea id="comentario" v-model="novoComentario"></textarea>
          <br /><br />
          <button type="submit">Salvar</button>
        </form>
      </div>
    </div>

    <div class="overlay-bloqueio" v-if="showToast">
      <div v-if="toastMessage && !errorMessage" class="mensagem-salvo">
        {{ toastMessage }}
      </div>
      <div style="background-color: #b30d14"  v-if="toastMessage && errorMessage" class="mensagem-salvo">
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
  name: 'DashboardView',
  data() {
    return {
      incidente: {
        id: '',
        assignedUserId: '',
        ruleId: '',
        status: '',
        priority: '',
        ackAt: '',
        closedAt: '',
        rule: '',
        createdAt: '',
      },
      incidentes: [],
      metrics: {},
      user: {},
      roles: [],
      filtroRegra: '',
      filtroStatus: null,
      filtroPrioridade: null,
      filtroRole: null,
      comentarioModal: false,
      novoComentario: '',
      page: 1,
      perPage: 5,
      showToast: false,
      toastMessage: '',
      errorMessage: false,
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

      } catch(error){
        console.error("Erro ao obter o usuário atual:", error);
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
          page: this.page,
          perPage: this.perPage,
        }

        const response = await api.get('/incidents', {
          headers: { Authorization: `Bearer ${token}` },
          params: params,
        })

        this.incidentes = response.data
      } catch(error){
        console.error("Erro ao obter incidentes:", error);
      }
    },
    async getRoles() {
      try{
        const token = await getToken()

        const response = await api.get('/roles', {
          headers: { Authorization: `Bearer ${token}` },
        })

        this.roles = response.data
      } catch(error){
        console.error("Erro ao obter roles:", error);
      }
    },
    async getMetrics() {
      try{
        const token = await getToken()

        const response = await api.get('/metrics/basic', {
          headers: { Authorization: `Bearer ${token}` },
        })

        this.metrics = response.data
      } catch(error){
        console.error("Erro ao obter métricas:", error);
      }
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
    mudarStatus(incidente) {
      if (incidente.status === 'ACK' || incidente.status === 'OPEN') {
        this.incidente.id = incidente.id
        this.comentarioModal = true
      }
    },
    async adicionarComentario() {
      const token = await getToken()

      if (!this.novoComentario.trim()) {
        this.toast('O comentário não pode ser vazio.', true)
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

        this.toast('Comentário adicionado com sucesso!', false)
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.toast('Você não tem permissão para realizar esta ação.', true)
        } else {
          this.toast('Erro ao adicionar comentário. Tente novamente.', true)
        }
      }

      this.getIncidents()
      this.getMetrics()
      this.comentarioModal = false
      this.limparIncidente()
    },
    limparIncidente() {
      this.incidente.id = ''
      this.incidente.assignedUserId = ''
      this.incidente.ruleId = ''
      this.incidente.status = ''
      this.incidente.priority = ''
      this.incidente.createdAt = ''
      this.incidente.ackAt = ''
      this.incidente.closedAt = ''
      this.incidente.rule = ''
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
    applyFilters() {
      clearTimeout(this.timer)

      this.timer = setTimeout(() => {
        this.page = 1
        this.getIncidents()
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
  },
  created() {
    this.getCurrentUser()
    this.getIncidents()
    this.getRoles()
    this.getMetrics()
  },
  watch: {
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
  },
}
</script>
