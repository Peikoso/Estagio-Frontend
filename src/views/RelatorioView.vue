<template>
  <div>
    <div class="conteudo-container">
      <div class="titulo-descricao">
        <h3>Relatorio & Metricas</h3>
        <p>Visão geral do desempenho do sistema</p>
      </div>
      <div>
        <button @click="exportarCSV" :disabled="isLoading">{{ isLoading ? 'Exportando...' : 'Exportar'}}</button>
      </div>
    </div>
    <div class="view-container">
      <p>Período</p>
      <div class="filtro-container">
        <div>
          <label>Início</label>
          <input type="date" id="filtro" v-model="filtroDataInicio" />
        </div>
        <div>
          <label>Fim</label>
          <input type="date" id="filtro" v-model="filtroDataFim" />
        </div>
      </div>
      <div>
        <button @click="getMetrics(filtroDataInicio, filtroDataFim)" :disabled="isLoading">{{ isLoading ? 'Carregando...' : 'Aplicar Filtro'}}</button>
      </div>
    </div>
    <div style="justify-content: center; text-align: center; margin-top: 20px; margin-bottom: 10px;">
      <h3>Incidentes e Performance de Resposta</h3>
    </div>
    <div class="small-views">
      <div class="small-view-container">
        <div>
          <h3>Total de Incidentes</h3>
          <br><br>
          <h3>{{ metrics.total_incidentes ?? 'N/A' }}</h3>
          <br><br>
          <p>Incidentes registrados no período</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Tempo Médio de ACK</h3>
          <br><br>
          <h3>{{ metrics.tempo_medio_ack?.toFixed(0) ?? 'N/A' }} minutos</h3>
          <br><br>
          <p>Desde criação até reconhecimento</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Tempo Médio de Resolução</h3>
          <br><br>
          <h3>{{ metrics.tempo_medio_res?.toFixed(0) ?? 'N/A' }} minutos</h3>
          <br><br>
          <p>Desde criação até fechamento</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Taxa de Erro de Regra</h3>
          <br><br>
          <h3>{{ metrics.taxa_erro_regra?.toFixed(0) ?? 'N/A' }}%</h3>
          <br><br>
          <p>Incidentes que falharam na validação de regras</p>
        </div>
      </div>
    </div>

    <div style="justify-content: center; text-align: center; margin-top: 20px; margin-bottom: 10px;">
      <h3>Execuções de Regras e Frequência</h3>
    </div>
    <div class="small-views">
      <div class="small-view-container">
        <div>
          <h3>Tempo Médio Entre Incidentes</h3>
          <br><br>
          <h3>{{ metrics.tempo_medio_entre_incidentes?.toFixed(0) ?? 'N/A' }} minutos</h3>
          <br><br>
          <p>Intervalo médio entre falhas detectadas</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Execuções de Regras</h3>
          <br><br>
          <h3>{{ metrics.total_execucoes_regras ?? 'N/A' }}</h3>
          <br><br>
          <p>Total de execuções realizadas no período</p>
        </div>
      </div>
    </div>

    <div style="justify-content: center; text-align: center; margin-top: 20px; margin-bottom: 10px;">
      <h3>Métricas Complementares</h3>
    </div>
    <div class="small-views">
      <div class="small-view-container">
        <div>
          <h3>Incidentes Escalonados</h3>
          <br><br>
          <h3>{{ metrics.incidentes_escalonados ?? 'N/A' }}</h3>
          <br><br>
          <p>Incidentes que precisaram de escalonamento manual</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Notificações Enviadas</h3>
          <br><br>
          <h3>{{ metrics.notificacoes_enviadas ?? 'N/A' }}</h3>
          <br><br>
          <p>Total de notificações enviadas no período</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Regras Ativas</h3>
          <br><br>
          <h3>{{ metrics.regras_ativas ?? 'N/A' }}</h3>
          <br><br>
          <p>Total de regras atualmente ativas</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Incidentes Abertos</h3>
          <br><br>
          <h3>{{ metrics.incidentes_abertos ?? 'N/A' }}</h3>
          <br><br>
          <p>Incidentes atualmente em status OPEN</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { getToken } from '@/services/token';

export default {
  data() {
    return {
      filtroDataInicio: new Date().toISOString().split('T')[0],
      filtroDataFim: new Date().toISOString().split('T')[0],
      metrics: {
        total_incidentes: 0,
        tempo_medio_ack: 0,
        tempo_medio_res: 0,
        taxa_erro_regra: 0,
        tempo_medio_entre_incidentes: 0,
        total_execucoes_regras: 0,
        incidentes_escalonados: 0,
        notificacoes_enviadas: 0,
        regras_ativas: 0,
        incidentes_abertos: 0,
      }
    };
  },
  methods: {
    async getMetrics(startDate, endDate) {
      this.isLoading = true;
      try{
        const token = await getToken();

        console.log('Buscando métricas de', startDate, 'a', endDate);
        const response = await api.get(`/metrics/${startDate}/${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Métricas recebidas:', response.data);

        this.metrics = response.data;
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      } finally {
        this.isLoading = false;
      }

    },
    exportarCSV() {
      this.isLoading = true;

      try {
        // Monta os dados em formato CSV
        const rows = [
          ['Metrica', 'Valor'], // cabeçalho
          ['Total de Incidentes', this.metrics.total_incidentes],
          ['Tempo Medio de ACK (min)', this.metrics.tempo_medio_ack],
          ['Tempo Medio de Resolucao (min)', this.metrics.tempo_medio_res],
          ['Taxa de Erro de Regra (%)', this.metrics.taxa_erro_regra],
          ['Tempo MMedio Entre Incidentes (min)', this.metrics.tempo_medio_entre_incidentes],
          ['Total de Execucoes de Regras', this.metrics.total_execucoes_regras],
          ['Incidentes Escalonados', this.metrics.incidentes_escalonados],
          ['Notificações Enviadas', this.metrics.notificacoes_enviadas],
          ['Regras Ativas', this.metrics.regras_ativas],
          ['Incidentes Abertos', this.metrics.incidentes_abertos],
        ];

        // Converte para CSV
        const csvContent = rows.map(e => e.join(',')).join('\n');

        // Cria um blob e link para download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_${this.filtroDataInicio}_a_${this.filtroDataFim}.csv`);
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Erro ao exportar CSV:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
  created() {
    this.getMetrics(this.filtroDataInicio, this.filtroDataFim);
  },
};
</script>
