<template>
    <div class="conteudo-container">
      <div class="titulo-descricao">
        <h3>Gestão de Runners</h3>
        <p>Gerencie e monitore os runners do sistema</p>
      </div>
    </div>
    <div class="view-container">
      <div class="filtro-container">
        <label class="filtro-label" for="filtro">Filtrar Runners</label>
        <input type="text" id="filtro" v-model="filtroRegra" placeholder="Digite o nome da regra" />
        <select id="filtro-status" v-model="filtroStatus">
          <option :value="null">Status</option>
          <option value="IDLE">IDLE</option>
          <option value="SCHEDULED">Agendado</option>
          <option value="RUNNING">Executando</option>
          <option value="FAILED">Falhou</option>
        </select>
        <select id="filtro-prioridade" v-model="filtroPrioridade">
          <option :value="null">Prioridades</option>
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
        </select>
        <select id="filtro-database" v-model="filtroDatabase">
          <option :value="null">Database</option>
          <option value="POSTGRESQL">PostgreSQL</option>
          <option value="ORACLE">Oracle</option>
        </select>
      </div>
      <div class="table-responsive">
        <h2 v-if="runners.length === 0">Nenhum Runner encontrado.</h2>
        <table  v-if="runners.length >= 1">
          <thead>
            <tr>
              <th>Status</th>
              <th>Regra</th>
              <th>Prioridade</th>
              <th>Database</th>
              <th>Ciclo de Execução</th>
              <th>Última Execução</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="runner in runners" :key="runner.id">
              <td data-label="Status">{{ runner.status }}</td>
              <td data-label="Regra">{{ runner.rule.name }}</td>
              <td data-label="Prioridade">{{ formatPriority(runner.rule.priority) }}</td>
              <td data-label="Database">{{ runner.rule.database_type }}</td>
              <td data-label="Ciclo de Execução">{{ (runner.rule.execution_interval_ms / 1000 / 60).toFixed(0) }} minutos</td>
              <td data-label="Última Execução">{{ runner.lastRunAt ? formatDate(runner.lastRunAt) : 'Nunca executado' }}</td>
              <td class="actions"><button @click="toggleRunner(runner.ruleId)" :disabled="isLoading">{{ runner.rule.is_active ? 'Parar' : 'Iniciar' }}</button></td>
            </tr>
          </tbody>
        </table>
        <div style="display: flex; justify-content: center; margin-top: 20px;">
          <button @click="pagAnteriorRunners">Anterior</button>
          <button @click="pagSeguinteRunners">Seguinte</button>
        </div>
      </div>
    </div>
    <br>
    <div class="view-container">
      <div class="filtro-container">
        <label class="filtro-label" for="filtro">Filtrar Fila Runners</label>
        <input type="text" id="filtro" v-model="filtroRegraQueue" placeholder="Digite o nome da regra" />
        <select id="filtro-status" v-model="filtroStatusQueue">
          <option :value="null">Status</option>
          <option value="PENDING">Pendente</option>
          <option value="PROCESSING">Processando</option>
          <option value="COMPLETED">Concluído</option>
          <option value="FAILED">Falhou</option>
        </select>
        <select id="filtro-prioridade" v-model="filtroPrioridadeQueue">
          <option :value="null">Prioridades</option>
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
        </select>
      </div>
      <div class="table-responsive">
        <h2 v-if="runnerQueue.length === 0">Nenhum Runner na fila.</h2>
        <table  v-if="runnerQueue.length >= 1">
          <thead>
            <tr>
              <th>Status</th>
              <th>Regra</th>
              <th>Prioridade</th>
              <th>Agendado Para</th>
              <th>Iniciado Em</th>
              <th>Terminou Em</th>
              <th>Tentativas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in runnerQueue" :key="job.id">
              <td data-label="Status">{{ job.status }}</td>
              <td data-label="Regra">{{ job.rule.name }}</td>
              <td data-label="Prioridade">{{ formatPriority(job.rule.priority) }}</td>
              <td data-label="Agendado Para">{{ formatDate(job.scheduledFor) }}</td>
              <td data-label="Iniciado Em">{{ job.startedAt ? formatDate(job.startedAt) : 'N/A' }}</td>
              <td data-label="Terminou Em">{{ job.finishedAt ? formatDate(job.finishedAt) : 'N/A' }}</td>
              <td data-label="Tentativas">{{ job.attemptCount }}</td>
            </tr>
          </tbody>
        </table>
        <div style="display: flex; justify-content: center; margin-top: 20px;">
          <button @click="pagAnteriorQueue">Anterior</button>
          <button @click="pagSeguinteQueue">Seguinte</button>
        </div>
      </div>
    </div>

</template>

<script>
import api from '@/services/api';
import { formatDate, formatPriority } from '@/services/format';
import { getToken } from '@/services/token';

export default {
  data() {
    return {
      user: {},
      runners: [],
      runnerQueue: [],
      filtroRegra: '',
      filtroStatus: null,
      filtroPrioridade: null,
      filtroDatabase: null,
      filtroRegraQueue: '',
      filtroStatusQueue: null,
      filtroPrioridadeQueue: null,
      pageRunners: 1,
      perPageRunners: 5,
      pageQueue: 1,
      perPageQueue: 5,
      isLoading: false,
      pollingTime: 5000, // 5 segundos
      pollingInterval: null,
    };
  },
  methods: {
    formatDate,
    formatPriority,
    async getCurrentUser() {
      const token = await getToken();

      try{
        const response = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.user = response.data;

      } catch (error) {
        console.error('Erro ao obter o utilizador atual:', error);
      }
    },
    async getRunners() {
      const token = await getToken();

      const params = {
        ruleName: this.filtroRegra || null,
        status: this.filtroStatus || null,
        priority: this.filtroPrioridade || null,
        databaseType: this.filtroDatabase || null,
        page: this.pageRunners,
        perPage: this.perPageRunners,
      };

      try {
        const response = await api.get('/runners', {
          headers: { Authorization: `Bearer ${token}` },
          params: params
        });

        this.runners = response.data;

      } catch (error) {
        console.error('Erro ao obter os runners:', error);
      }
    },
    async getRunnerQueue() {
      const token = await getToken();

      const params = {
        ruleName: this.filtroRegraQueue || null,
        status: this.filtroStatusQueue || null,
        rulePriority: this.filtroPrioridadeQueue || null,
        page: this.pageQueue,
        perPage: this.perPageQueue,
      };

      try {
        const response = await api.get('/runners/queue', {
          headers: { Authorization: `Bearer ${token}` },
          params: params
        });

        this.runnerQueue = response.data;

      } catch (error) {
        console.error('Erro ao obter a fila de runners:', error);
      }
    },
    async toggleRunner(ruleId) {
      this.isLoading = true;
      try{
        const token = await getToken();

        await api.post(`/rules/${ruleId}/toggle-execution`, {fake: true}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch(error){
        console.error('Erro ao executar/pausar a regra:', error);
      } finally {
        await this.getRunners()
        this.isLoading = false;
      }
    },
    pagAnteriorRunners(){
      this.pageRunners--;
      this.getRunners();
    },
    pagSeguinteRunners(){
      this.pageRunners++;
      this.getRunners();
    },
    pagAnteriorQueue(){
      this.pageQueue--;
      this.getRunnerQueue();
    },
    pagSeguinteQueue(){
      this.pageQueue++;
      this.getRunnerQueue();
    },
    applyFiltersRunners() {
      clearTimeout(this.timer)

      this.timer = setTimeout(() => {
        this.pageRunners = 1
        this.getRunners()
      }, 500) // 500ms = meio segundo
    },
    applyFiltersQueue() {
      clearTimeout(this.timer)

      this.timer = setTimeout(() => {
        this.pageQueue = 1
        this.getRunnerQueue()
      }, 500) // 500ms = meio segundo
    },
    startPolling(){
      this.pollingInterval = setInterval(() => {
        this.getRunners();
        this.getRunnerQueue();
      }, this.pollingTime);
    }

  },
  created() {
    this.getCurrentUser();
    this.getRunners();
    this.getRunnerQueue();
    this.startPolling();
  },
  beforeUnmount() {
    clearInterval(this.pollingInterval);
  },
  watch:{
    filtroRegra(){
      this.applyFiltersRunners();
    },
    filtroStatus(){
      this.applyFiltersRunners();
    },
    filtroPrioridade(){
      this.applyFiltersRunners();
    },
    filtroDatabase(){
      this.applyFiltersRunners();
    },
    filtroRegraQueue(){
      this.applyFiltersQueue();
    },
    filtroStatusQueue(){
      this.applyFiltersQueue();
    },
    filtroPrioridadeQueue(){
      this.applyFiltersQueue();
    },
  }
};
</script>
