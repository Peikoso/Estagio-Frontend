<template>
  <div>
    <div class="conteudo-container">
      <div class="titulo-descricao">
        <h3>Relatorio & Metricas</h3>
        <p>Visão geral do desempenho do sistema</p>
      </div>
      <div>
        <button @click="exportarCSV">Exportar</button>
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
    </div>
    <div style="justify-content: center; text-align: center; margin-top: 20px; margin-bottom: 10px;">
      <h3>Incidentes e Performance de Resposta</h3>
    </div>
    <div class="small-views">
      <div class="small-view-container">
        <div>
          <h3>Total de Incidentes</h3>
          <br><br>
          <h3>{{ total_incidentes }}</h3>
          <br><br>
          <p>Incidentes registrados no período</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Tempo Médio de ACK</h3>
          <br><br>
          <h3>{{ tempo_medio_ack }} minutos</h3>
          <br><br>
          <p>Desde criação até reconhecimento</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Tempo Médio de Resolução</h3>
          <br><br>
          <h3>{{ tempo_medio_res }} minutos</h3>
          <br><br>
          <p>Desde criação até fechamento</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Taxa de Erro de Regra</h3>
          <br><br>
          <h3>{{ taxa_erro_regra }}%</h3>
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
          <h3>{{ tempo_medio_entre_incidentes }} minutos</h3>
          <br><br>
          <p>Intervalo médio entre falhas detectadas</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Execuções de Regras</h3>
          <br><br>
          <h3>{{ total_execucoes_regras }}</h3>
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
          <h3>{{ incidentes_escalonados }}</h3>
          <br><br>
          <p>Incidentes que precisaram de escalonamento manual</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Notificações Enviadas</h3>
          <br><br>
          <h3>{{ notificacoes_enviadas }}</h3>
          <br><br>
          <p>Total de notificações enviadas no período</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Regras Ativas</h3>
          <br><br>
          <h3>{{ regras_ativas }}</h3>
          <br><br>
          <p>Total de regras atualmente ativas</p>
        </div>
      </div>
      <div class="small-view-container">
        <div>
          <h3>Incidentes Abertos</h3>
          <br><br>
          <h3>{{ incidentes_abertos }}</h3>
          <br><br>
          <p>Incidentes atualmente em status OPEN</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      filtroDataInicio: new Date().toISOString().split('T')[0],
      filtroDataFim: new Date().toISOString().split('T')[0],
      total_incidentes: 120,
      tempo_medio_ack: 15,
      tempo_medio_res: 45,
      taxa_erro_regra: 5,
      tempo_medio_entre_incidentes: 60,
      total_execucoes_regras: 250,
      incidentes_escalonados: 15,
      notificacoes_enviadas: 420,
      regras_ativas: 25,
      incidentes_abertos: 12,
    };
  },
methods: {
  exportarCSV() {
      // Monta os dados em formato CSV
      const rows = [
        ['Métrica', 'Valor'], // cabeçalho
        ['Total de Incidentes', this.total_incidentes],
        ['Tempo Médio de ACK (min)', this.tempo_medio_ack],
        ['Tempo Médio de Resolução (min)', this.tempo_medio_res],
        ['Taxa de Erro de Regra (%)', this.taxa_erro_regra],
        ['Tempo Médio Entre Incidentes (min)', this.tempo_medio_entre_incidentes],
        ['Total de Execuções de Regras', this.total_execucoes_regras],
        ['Incidentes Escalonados', this.incidentes_escalonados],
        ['Notificações Enviadas', this.notificacoes_enviadas],
        ['Regras Ativas', this.regras_ativas],
        ['Incidentes Abertos', this.incidentes_abertos],
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
    },
  }
};
</script>
