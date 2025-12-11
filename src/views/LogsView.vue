<template>
  <div>
    <div class="conteudo-container">
      <div class="titulo-descricao">
        <h3> Logs e Auditoria</h3>
        <p>Monitore as atividades do sistema</p>
      </div>
    </div>
    <div class="view-container">
      <p>Logs de Execuções de Regras</p>
      <div class="filtro-container">
        <label class="filtro-label" for="filtro">Filtrar Incidentes</label>
        <input type="text" id="filtro" v-model="filtroRegraRunner" placeholder="Digite o nome da regra" />
        <select id="filtro-status" v-model="filtroStatusRunner">
          <option :value="null">Status</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="TIMEOUT">TIMEOUT</option>
          <option value="ERROR">ERROR</option>
        </select>
      </div>
      <div class="table-responsive">
        <h2 v-if="runnerLogs.length == 0">Nenhum log registrado</h2>
        <table  v-if="runnerLogs.length >= 1">
          <thead>
            <tr>
              <th>Detalhes</th>
              <th>Status de Execução</th>
              <th>Tempo de Execução</th>
              <th>Executado Em</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in runnerLogs" :key="log.id">
              <td data-label="Detalhes">
                <button
                  @click=" runnerLogModal = true; runnerLogDetails(log)">
                  Ver
                </button></td>
              <td data-label="Status de Execução">{{ log.executionStatus }}</td>
              <td data-label="Tempo de Execução">{{ log.runTimeMs }} ms</td>
              <td data-label="Executado Em">{{ formatDate(log.executedAt) }}</td>
            </tr>
          </tbody>
        </table>
        <div style="display: flex; justify-content: center; margin-top: 20px;">
          <button @click="this.pageRunner--; getRunnerLogs()">Anterior</button>
          <button @click="this.pageRunner++; getRunnerLogs()">Seguinte</button>
        </div>
      </div>
    </div>

    <br><br><br>

    <div class="view-container">
      <p>Logs Notificações</p>
      <div class="table-responsive">
        <h2 v-if="notificationLogs.length == 0">Nenhum log registrado</h2>
        <table  v-if="notificationLogs.length >= 1">
          <thead>
            <tr>
              <th>Detalhes</th>
              <th>Tipo</th>
              <th>Ação</th>
              <th>Data de Criação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in notificationLogs" :key="log.id">
              <td data-label="Detalhes">
                <button
                  @click=" notificationLogModal = true; notificationLogDetails(log)">
                  Ver
                </button></td>
              <td data-label="Tipo">{{ log.entityType }}</td>
              <td data-label="Ação">{{ log.actionType }}</td>
              <td data-label="Data de Criação">{{ formatDate(log.createdAt )}}</td>
            </tr>
          </tbody>
        </table>
        <div style="display: flex; justify-content: center; margin-top: 20px;">
          <button @click="pagAnterior">Anterior</button>
          <button @click="pagSeguinte">Seguinte</button>
        </div>
      </div>
    </div>

    <div v-if="runnerLogModal" class="modal">
      <div class="modal-content">
         <button class="close-btn" style="top: 34px" @click="runnerLogModal = false;"> &times;</button>
         <div class="modal-details">
          <h4>Detalhes do Log</h4>
          <p><strong>id:</strong> {{ runnerLog.id }}</p>
          <p><strong>Fila ID:</strong> {{ runnerLog.queueId }}</p>
          <p><strong>Regra</strong> {{ runnerLog.rule?.name ?? 'N/A' }}</p>
          <p><strong>Status de Execução:</strong> {{ runnerLog.executionStatus }}</p>
          <p><strong>Tempo de Execução:</strong> {{ runnerLog.runTimeMs }} ms</p>
          <p><strong>Executado Em:</strong> {{ formatDate(runnerLog.executedAt) }}</p>
          <p><strong>Linhas Afetadas:</strong> {{ runnerLog.rowsAffected }}</p>
          <p><strong>Resultado:</strong> {{ runnerLog.result}}</p>
          <p><strong>Error:</strong> {{ runnerLog.error ?? 'N/A' }}</p>
         </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { formatDate } from '@/services/format';
import { getToken } from '@/services/token';



export default {
  name: 'LogsView',
  data() {
    return {
      runnerLog: {},
      runnerLogs: [],
      runnerLogModal: false,
      filtroRegraRunner: '',
      filtroStatusRunner: null,
      notificationLog: {},
      notificationLogs: [],
      notificationLogModal: false,
      filtroTipo: null,
      pageRunner:  1,
      pageNotification: 1,
      pageAuditLogs: 1,
      perPage: 5,
      timer: null,
    };
  },
  methods: {
    formatDate,
    async getAuditLogs() {
      const params = {
        page: this.pageAuditLogs,
        perPage: this.perPage,
      }

      try{
        const token = await getToken();

        const response = await api.get('/audit-logs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
        });

        this.logs = response.data

      } catch (error){
        console.error('Erro ao buscar logs de auditoria:', error);
      }
    },
    async getRunnerLogs() {
      const params = {
        ruleName: this.filtroRegraRunner || null,
        executionStatus: this.filtroStatusRunner || null,
        page: this.pageRunner,
        perPage: this.perPage,
      }

      try{
        const token = await getToken();

        const response = await api.get('/runners/logs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
        });

        this.runnerLogs = response.data

      } catch (error){
        console.error('Erro ao buscar logs de auditoria:', error);
      }
    },
    runnerLogDetails(log) {
      this.runnerLog = log;
      this.runnerLogModal = true;
    },
    applyRunnerFilters() {
      clearTimeout(this.timer)

      this.timer = setTimeout(() => {
        this.pageRunner = 1
        this.getRunnerLogs()
      }, 500) // 500ms = meio segundo
    },
  },
  created() {
    this.getRunnerLogs();
    this.getAuditLogs();
  },
  watch: {
    filtroRegraRunner() {
      this.applyRunnerFilters()
    },
    filtroStatusRunner() {
      this.applyRunnerFilters()
    },
  },
};
</script>
