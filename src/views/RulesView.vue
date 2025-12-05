<template>
  <div>
    <div class="conteudo-container">
      <div class="titulo-descricao">
        <h3>Gestão de Regras</h3>
        <p>Configure e gerencie as regras de monitoramento</p>
      </div>
      <div>
        <button @click="sandboxModal = true">SandBox</button>
        <button @click="regraModal = true">Nova Regra</button>
      </div>
    </div>
    <div class="view-container">
      <div class="filtro-container">
        <label class="filtro-label" for="filtro">Filtrar Regras</label>
        <input type="text" id="filtro" v-model="filtroRegra" placeholder="Digite o nome da regra" />
        <select id="filtro-database" v-model="filtroDatabase">
          <option :value="null">Database</option>
          <option value="POSTGRESQL">PostgreSQL</option>
          <option value="ORACLE">Oracle</option>
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
        <h2 v-if="regras.length == 0">Nenhuma Regra Registrada</h2>
        <table v-if="regras.length >= 1">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Banco</th>
              <th>Intervalo</th>
              <th>Prioridade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="regra in regras" :key="regra.id">
              <td class="regra-nome-descricao">
                <h4>{{ regra.name }}</h4>
                <p>{{ regra.description }}</p>
              </td>
              <td data-label="Banco">{{ regra.databaseType }}</td>
              <td data-label="Intervalo">{{ (regra.executionIntervalMs / 1000 / 60).toFixed(0) }} minutos</td>
              <td data-label="Prioridade">{{ regra.priority }}</td>
              <td data-label="Ações" class="actions">
                <button class="icon-btn" @click="executarRegra(regra)">
                  <img :src="regra.isActive ? pause : play" />
                </button>
                <button class="icon-btn" @click="silenciarRegra(regra)">
                  <img :src="regra.silenceMode ? volume_mute : volume_up" />
                </button>
                <button @click="editarRegra(regra)">Editar</button>
                <button @click="excluirRegra(regra)">Excluir</button>
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

    <div class="modal" v-if="regraModal">
      <div class="modal-content">
        <button class="close-btn" @click="regraModal = false; modoEdicao = false; this.limparForm()">&times;</button>
        <form @submit.prevent="salvarRegras">
          <label for="name">Nome</label>
          <input type="text" id="name" placeholder="Nome da regra" v-model="regra.name" />

          <label for="description">Descrição</label>
          <input
            type="text"
            id="description"
            placeholder="Descreva o propósito da regra"
            v-model="regra.description"
          />

          <label for="sql">SQL</label>
          <textarea id="sql" placeholder="SELECT * FROM ..." v-model="regra.sql"></textarea>
          <p>Apenas comandos SELECT são permitidos</p>

          <div class="row">
            <div class="col">
              <label for="databaseType">Banco de Dados</label>
              <select id="databaseType" v-model="regra.databaseType">
                <option value="POSTGRESQL">PostgreSQL</option>
                <option value="ORACLE">Oracle</option>
              </select>
            </div>
            <div class="col">
              <label for="priority">Prioridade</label>
              <select id="priority" v-model="regra.priority">
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <label for="executionIntervalMs">Intervalo de Execução (minutos)</label>
              <input
                type="number"
                id="executionIntervalMs"
                v-model.number="regra.executionIntervalMs"
                min="0"
              />
            </div>
            <div class="col">
              <label for="maxErrorCount">Máx. Erros</label>
              <input type="number" id="maxErrorCount" v-model.number="regra.maxErrorCount" min="0" />
            </div>
          </div>

          <label for="timeoutMs">Timeout (segundos)</label>
          <input type="number" id="timeoutMs" placeholder="0" v-model="regra.timeoutMs" min="0" />

          <div class="row">
            <div class="col">
              <label for="startTime">Hora Início</label>
              <input type="time" id="startTime" v-model="regra.startTime" step="1" />
            </div>
            <div class="col">
              <label for="endTime">Hora Final</label>
              <input type="time" id="endTime" v-model="regra.endTime" step="1" />
            </div>
          </div>
          <label for="roles">Roles</label>
          <div>
            <span
              v-for="(role, index) in regra.roles"
              :key="index"
              :style="{ backgroundColor: role.color }"
              class="role-badge"
            >
              {{ role.name }}
              <button style="all: unset; cursor: pointer" @click="removerRole(index)">
                &times;
              </button>
            </span>
          </div>
          <select id="roles" v-model="selectedRole">
            <option value="" disabled selected>Selecione uma role</option>
            <option v-for="(role, index) in roles" :key="index" :value="role">
              {{ role.name }}
            </option>
          </select>
          <button @click.prevent="adicionarRole">Adicionar Role</button>

          <div class="row">
            <div class="col">
              <div class="switch-container">
                <span class="switch-label">Silenciar</span>
                <label class="switch">
                  <input type="checkbox" v-model="regra.silenceMode" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <div class="col">
              <div class="switch-container">
                <span class="switch-label">Ativa</span>
                <label class="switch">
                  <input type="checkbox" v-model="regra.isActive" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <label for="postponeDate">Programar Adiamento</label>
          <input type="date" id="postponeDate" placeholder="DD/MM/AAAA" v-model="regra.postponeDate" />

          <button type="submit">Salvar</button>
        </form>
      </div>
    </div>
    <div v-if="sandboxModal" class="modal">
      <div class="modal-content">
        <button class="close-btn" @click="sandboxModal = false; this.limparSandbox()">&times;</button>
        <form @submit.prevent="executarSandbox">
          <label for="sql">SQL</label>
          <textarea id="sql" placeholder="SELECT * FROM ..." v-model="sandbox.sql"></textarea>
          <p>Apenas comandos SELECT são permitidos</p>

          <button type="submit">Executar</button>
        </form>
      </div>
    </div>

    <div v-if="deleteModal" class="modal">
      <div class="modal-content">
        <h3>Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir esta regra?</p>
        <div class="botoes-confirmacao">
          <button style="background-color: #b30d14" @click="confirmarDelete()">Sim, Excluir</button>
          <button @click="deleteModal = false; limparForm()">
            Cancelar
          </button>
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
import play from '@/assets/icons/play.svg'
import pause from '@/assets/icons/pause.svg'
import volume_up from '@/assets/icons/volume_up.svg'
import volume_mute from '@/assets/icons/volume_mute.svg'
import { sqlValidantion } from '@/services/validators.js'
import { getToken } from '@/services/token'
import api from '@/services/api'

export default {
  name: 'RulesView',
  data() {
    return {
      regra: {
        id: '',
        name: '',
        description: '',
        databaseType: 'POSTGRESQL',
        sql: '',
        priority: 'MEDIUM',
        executionIntervalMs: 0,
        maxErrorCount: 0,
        timeoutMs: 0,
        startTime: '00:00:00',
        endTime: '00:00:00',
        isActive: true,
        silenceMode: false,
        postponeDate: null,
        userCreatorId: '',
        roles: [],
      },
      regras: [],
      selectedRole: '',
      roles: [],
      filtroRegra: '',
      filtroDatabase: null,
      filtroPrioridade: null,
      filtroRole: null,
      regraModal: false,
      modoEdicao: false,
      deleteModal: false,
      sandboxModal: false,
      sandbox: {
        sql: '',
      },
      play,
      pause,
      volume_up,
      volume_mute,
      page: 1,
      perPage: 5,
      showToast: false,
      toastMessage: '',
      errorMessage: false,
    }
  },
  methods: {
    sqlValidantion,
    async getRules() {
      try{
        const token = await getToken();

        const params = {
          name: this.filtroRegra || null,
          databaseType: this.filtroDatabase || null,
          priority: this.filtroPrioridade || null,
          roleId: this.filtroRole || null,
          page: this.page,
          perPage: this.perPage
        }

        const response = await api.get('/rules', {
          headers: {Authorization: `Bearer ${token}`},
          params: params
        });

        console.log('Regras carregadas:', response.data);

        this.regras = response.data;
      } catch(error){
        console.error('Erro ao carregar as regras:', error);
      }
    },
    async getRoles() {
      try{
        const token = await getToken();

        const response = await api.get('/roles', {
          headers: {Authorization: `Bearer ${token}`}
        });

        console.log('Roles carregadas:', response.data);

        this.roles = response.data;
      } catch(error){
        console.error('Erro ao carregar as roles:', error);
      }
    },
    adicionarRole() {
      const role = this.selectedRole
      if (!this.regra.roles.includes(role.name)) {
        this.regra.roles.push(role.name)
      }
      this.selectedRole = ''
    },
    removerRole(index) {
      this.regra.roles.splice(index, 1)
    },
    getRoleColor(roleName) {
      const role = this.roles.find((r) => r.name === roleName)
      return role ? role.cor : '#bdc3c7'
    },
    salvarRegras() {
      if (!sqlValidantion(this.regra.sql)) {
        this.toast('SQL inválido. Apenas comandos SELECT são permitidos.', true)
        return
      }

      const data = {
        name: this.regra.name,
        description: this.regra.description,
        sql: this.regra.sql,
        databaseType: this.regra.databaseType,
        priority: this.regra.priority,
        executionIntervalMs: this.regra.executionIntervalMs,
        maxErrorCount: this.regra.maxErrorCount,
        timeoutMs: this.regra.timeoutMs,
        startTime: this.regra.startTime,
        endTime: this.regra.endTime,
        roles: this.regra.roles,
        silenceMode: this.regra.silenceMode,
        isActive: this.regra.isActive,
        postponeDate: this.regra.postponeDate,
      }

      if (this.modoEdicao == false) {
        const novoData = {
          id: crypto.randomUUID(),
          ...data,
        }
        this.regras.push(novoData)
      } else {
        const novoData = {
          id: this.regra.id,
          ...data,
        }
        const index = this.regras.findIndex((regra) => regra.id === this.regra.id)
        this.regras[index] = novoData
      }

      this.salvarLocalStorageRegras()
      this.limparForm()
      this.modoEdicao = false
      this.regraModal = false
    },
    editarRegra(regra) {
      this.modoEdicao = true
      this.regraModal = true

      this.regra.id = regra.id
      this.regra.name = regra.name
      this.regra.description = regra.description
      this.regra.sql = regra.sql
      this.regra.databaseType = regra.databaseType
      this.regra.priority = regra.priority
      this.regra.executionIntervalMs = (regra.executionIntervalMs / 1000 / 60).toFixed(0)
      this.regra.maxErrorCount = regra.maxErrorCount
      this.regra.timeoutMs = (regra.timeoutMs / 1000).toFixed(0)
      this.regra.startTime = regra.startTime
      this.regra.endTime = regra.endTime
      this.regra.roles = regra.roles
      this.regra.silenceMode = regra.silenceMode
      this.regra.isActive = regra.isActive
      this.regra.postponeDate = regra.postponeDate
    },
    silenciarRegra(regra) {
      regra.silenceMode = !regra.silenceMode
      this.salvarLocalStorageRegras()
    },
    executarRegra(regra) {
      regra.isActive = !regra.isActive
      this.salvarLocalStorageRegras()
    },
    excluirRegra(regra) {
      this.regra.id = regra.id
      this.deleteModal = true
    },
    confirmarDelete() {
      const index = this.regras.findIndex((r) => r.id === this.regra.id)
      this.regras.splice(index, 1)
      this.salvarLocalStorageRegras()
      this.limparForm()
      this.deleteModal = false
    },
    salvarLocalStorageRegras() {
      localStorage.setItem('regras', JSON.stringify(this.regras))
    },
    limparForm() {
      this.regra.id = ''
      this.regra.name = ''
      this.regra.description = ''
      this.regra.sql = ''
      this.regra.databaseType = 'POSTEGRESQL'
      this.regra.priority = 'MEDIUM'
      this.regra.executionIntervalMs = 0
      this.regra.maxErrorCount = 0
      this.regra.timeoutMs = 0
      this.regra.startTime = '00:00:00'
      this.regra.endTime = '00:00:00'
      this.regra.roles = []
      this.regra.silenceMode = false
      this.regra.isActive = false
      this.regra.postponeDate = null
      this.selectedRole = ''
    },
    limparSandbox() {
      this.sandbox.sql = ''
    },
    async executarSandbox() {
      if (!sqlValidantion(this.sandbox.sql)) {
        this.toast('SQL inválido. Apenas comandos SELECT são permitidos.', true)
        return
      }
      if(this.sandbox.sql.trim() === ''){
        this.toast('O campo SQL não pode estar vazio.', true)
        return
      }

      try{
        const token = await getToken();

        const response = await api.post('/sql-tests', { sql: this.sandbox.sql }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if(response.data.result.includes('ERROR')){
          this.toast(`${response.data.result}`, true)
          return
        }

        this.toast(`${response.data.result}`, false)

      } catch(error){
        this.toast('Erro ao executar o SQL no sandbox, tente novamente mais tarde.', true)
        console.error('Error ao executar o SQL no sandbox', error);
      }

    },
    pagAnterior() {
      if (this.pagInicio > 0) {
        this.pagInicio -= 5
        this.pagFim -= 5
      }
    },
    pagSeguinte() {
      if (this.pagFim < this.regras.length) {
        this.pagInicio += 5
        this.pagFim += 5
      }
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
    this.getRules();
    this.getRoles();
  },
}
</script>
