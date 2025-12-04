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
      <div>
        <label class="filtro-label" for="filtro">Filtrar Regras</label>
        <input type="text" id="filtro" v-model="filtro" placeholder="Digite o nome da regra">
      </div>
      <div class="table-responsive">
        <h2 v-if="regras.length == 0">Nenhuma Regra Registrada </h2>
        <table  v-if="regras.length >= 1">
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
            <tr v-for="regra in regras.slice(pagInicio, pagFim)" :key="regra.id">
              <td class="regra-nome-descricao">
                <h4>{{ regra.nome }}</h4>
                <p>{{ regra.descricao }}</p>
              </td>
              <td data-label="Banco">{{ regra.banco }}</td>
              <td data-label="Intervalo">{{ regra.minuto_atualizacao }} minutos</td>
              <td data-label="Prioridade">{{ regra.prioridade }}</td>
              <td data-label="Ações" class="actions">
                <button class="icon-btn" @click="executarRegra(regra)"><img :src="regra.executar ? pause : play"></button>
                <button class="icon-btn" @click="silenciarRegra(regra)"><img :src="regra.silenciar ? volume_mute : volume_up"></button>
                <button @click="editarRegra(regra)">Editar</button>
                <button @click="excluirRegra(regra)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="display: flex; justify-content: center; margin-top: 20px;">
          <button @click="pagAnterior">Anterior</button>
          <button @click="pagSeguinte">Seguinte</button>
        </div>
      </div>
    </div>

    <div class="modal" v-if="regraModal">
      <div class="modal-content">
        <button class="close-btn" @click="regraModal = false; modoEdicao = false; this.limparForm()">&times;</button>
        <form @submit.prevent="salvarRegras">
          <label for="nome">Nome</label>
          <input type="text" id="nome" placeholder="Nome da regra" v-model="regra.nome">

          <label for="descricao">Descrição</label>
          <input type="text" id="descricao" placeholder="Descreva o propósito da regra" v-model="regra.descricao">

          <label for="sql">SQL</label>
          <textarea id="sql" placeholder="SELECT * FROM ..." v-model="regra.sql"></textarea>
          <p>Apenas comandos SELECT são permitidos</p>

          <div class="row">
            <div class="col">
              <label for="banco">Banco de Dados</label>
              <select id="banco" v-model="regra.banco">
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="Oracle">Oracle</option>
              </select>
            </div>
            <div class="col">
              <label for="prioridade">Prioridade</label>
              <select id="prioridade" v-model="regra.prioridade">
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <label for="minuto_atualizacao">Intervalo de Execução (minutos)</label>
              <input type="number" id="minuto_atualizacao" v-model.number="regra.minuto_atualizacao" min="0">
            </div>
            <div class="col">
              <label for="qtd_erro_max">Máx. Erros</label>
              <input type="number" id="qtd_erro_max" v-model.number="regra.qtd_erro_max" min="0">
            </div>
          </div>

          <label for="timeout">Timeout (segundos)</label>
          <input type="number" id="timeout" placeholder="0" v-model="regra.timeout" min="0">

          <div class="row">
            <div class="col">
              <label for="hora_inicio">Hora Início</label>
              <input type="time" id="hora_inicio" v-model="regra.hora_inicio" step="1">
            </div>
            <div class="col">
              <label for="hora_final">Hora Final</label>
              <input type="time" id="hora_final" v-model="regra.hora_final" step="1">
            </div>
          </div>
          <label for="roles">Roles</label>
          <div>
            <span
            v-for="(role, index) in regra.roles" :key="index"
            :style="{ backgroundColor: getRoleColor(role) }"
            class="role-badge">
              {{ role }}
              <button style="all: unset; cursor: pointer;" @click="removerRole(index)">&times;</button>
            </span>
          </div>
          <select id="roles" v-model="selectedRole">
            <option value="" disabled selected>Selecione uma role</option>
            <option v-for="(role, index) in roles" :key="index" :value="role">{{ role.nome }}</option>
          </select>
          <button @click.prevent="adicionarRole">Adicionar Role</button>

          <div class="row">
            <div class="col">
              <div class="switch-container">
                <span class="switch-label">Notificação</span>
                <label class="switch">
                  <input type="checkbox" v-model="regra.notificacao">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <div class="col">
              <div class="switch-container">
                <span class="switch-label">Silenciar</span>
                <label class="switch">
                  <input type="checkbox" v-model="regra.silenciar">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <div class="col">
              <div class="switch-container">
                <span class="switch-label">Ativa</span>
                <label class="switch">
                  <input type="checkbox" v-model="regra.executar">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <label for="data_adiar">Programar Adiamento</label>
          <input type="date" id="data_adiar" placeholder="DD/MM/AAAA" v-model="regra.data_adiar">

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
          <button style="background-color: red;" @click="confirmarDelete()">Sim, Excluir</button>
          <button @click="deleteModal = false; limparForm()">Cancelar</button>
        </div>
      </div>
    </div>

    <div class="overlay-bloqueio" v-if="showToast">
      <div v-if="toastMessage && !errorMessage" class="mensagem-salvo">
        {{ toastMessage }}
      </div>
      <div style="background-color: red;" v-if="toastMessage && errorMessage" class="mensagem-salvo">
        {{ toastMessage }}
      </div>
    </div>


  </div>
</template>

<script>
import play from '@/assets/icons/play.svg';
import pause from '@/assets/icons/pause.svg';
import volume_up from '@/assets/icons/volume_up.svg';
import volume_mute from '@/assets/icons/volume_mute.svg';
import { sqlValidantion } from '@/services/validators.js';

export default {
  name: 'RulesView',
  data(){
    return{
      regra: {
        id: '',
        nome: '',
        descricao: '',
        sql: '',
        banco: 'PostgreSQL',
        prioridade: 'Média',
        minuto_atualizacao: 0,
        qtd_erro_max: 0,
        timeout: 0,
        hora_inicio: '00:00:00',
        hora_final: '00:00:00',
        notificacao: true,
        silenciar: false,
        executar: false,
        data_adiar: null,
        roles: [],
      },
      regras: [],
      selectedRole: '',
      roles: [],
      filtro: '',
      regraModal: false,
      modoEdicao: false,
      deleteModal: false,
      sandboxModal: false,
      sandbox: {
        sql: '',
        resultado: '',
      },
      showToast: false,
      toastMessage: '',
      errorMessage: false,
      play,
      pause,
      volume_up,
      volume_mute,
      pagInicio: 0,
      pagFim: 5,
    }
  },
  methods: {
    sqlValidantion,
    adicionarRole(){
      const role = this.selectedRole;
      if(!this.regra.roles.includes(role.nome)){
        this.regra.roles.push(role.nome);
      }
      this.selectedRole = ""
    },
    removerRole(index){
      this.regra.roles.splice(index, 1);
    },
    getRoleColor(roleName){
      const role = this.roles.find(r => r.nome === roleName);
      return role ? role.cor : '#bdc3c7';
    },
    salvarRegras() {
      if (!sqlValidantion(this.regra.sql)) {
        alert('SQL inválido. Apenas comandos SELECT são permitidos.');
        return;
      }

      const data = {
        nome: this.regra.nome,
        descricao: this.regra.descricao,
        sql: this.regra.sql,
        banco: this.regra.banco,
        prioridade: this.regra.prioridade,
        minuto_atualizacao: this.regra.minuto_atualizacao,
        qtd_erro_max: this.regra.qtd_erro_max,
        timeout: this.regra.timeout,
        hora_inicio: this.regra.hora_inicio,
        hora_final: this.regra.hora_final,
        roles: this.regra.roles,
        notificacao: this.regra.notificacao,
        silenciar: this.regra.silenciar,
        executar: this.regra.executar,
        data_adiar: this.regra.data_adiar
      }

      if(this.modoEdicao == false){
        const novoData = {
          id: crypto.randomUUID(),
          ...data
        }
        this.regras.push(novoData);
      }else{
        const novoData = {
          id: this.regra.id,
          ...data
        }
        const index = this.regras.findIndex(regra => regra.id === this.regra.id)
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
      this.regra.nome = regra.nome
      this.regra.descricao = regra.descricao
      this.regra.sql = regra.sql
      this.regra.banco = regra.banco
      this.regra.prioridade = regra.prioridade
      this.regra.minuto_atualizacao = regra.minuto_atualizacao
      this.regra.qtd_erro_max = regra.qtd_erro_max
      this.regra.timeout = regra.timeout
      this.regra.hora_inicio = regra.hora_inicio
      this.regra.hora_final = regra.hora_final
      this.regra.roles = regra.roles
      this.regra.notificacao = regra.notificacao
      this.regra.silenciar = regra.silenciar
      this.regra.executar = regra.executar
      this.regra.data_adiar = regra.data_adiar
    },
    silenciarRegra(regra){
      regra.silenciar = !regra.silenciar
      this.salvarLocalStorageRegras()
    },
    executarRegra(regra){
      regra.executar = !regra.executar
      this.salvarLocalStorageRegras()
    },
    excluirRegra(regra) {
      this.regra.id = regra.id
      this.deleteModal = true
    },
    confirmarDelete(){
      const index = this.regras.findIndex(r => r.id === this.regra.id)
      this.regras.splice(index, 1)
      this.salvarLocalStorageRegras()
      this.limparForm()
      this.deleteModal = false
    },
    carregarLocalStorage() {
      this.regras = JSON.parse(localStorage.getItem('regras')) || [];
      this.roles = JSON.parse(localStorage.getItem('roles')) || [];
    },
    salvarLocalStorageRegras() {
      localStorage.setItem('regras', JSON.stringify(this.regras))
    },
    limparForm() {
      this.regra.id = '';
      this.regra.nome = '';
      this.regra.descricao = '';
      this.regra.sql = '';
      this.regra.banco = 'POSTEGRESQL';
      this.regra.prioridade = 'MEDIUM';
      this.regra.minuto_atualizacao = 0;
      this.regra.qtd_erro_max = 0;
      this.regra.timeout = 0;
      this.regra.hora_inicio = '00:00:00';
      this.regra.hora_final = '00:00:00';
      this.regra.roles = [];
      this.regra.notificacao = true;
      this.regra.silenciar = false;
      this.regra.executar = false;
      this.regra.data_adiar = null;
      this.selectedRole = '';
    },
    limparSandbox(){
      this.sandbox.sql = '';
      this.sandbox.resultado = '';
    },
    executarSandbox(){
      if (!sqlValidantion(this.sandbox.sql)) {
        this.toast('SQL inválido. Apenas comandos SELECT são permitidos.', true);
        return;
      }
      this.toast('Sucesso: A consulta foi executada corretamente.', false);
    },
    toast(message, isError){
      this.toastMessage = message;
      this.showToast = true;
      if(isError){
        this.errorMessage = true;
      }
      setTimeout(() => {
        this.showToast = false;
        this.toastMessage = '';
        this.errorMessage = false;
      }, 2500);

    },
    pagAnterior(){
      if(this.pagInicio > 0){
        this.pagInicio -= 5;
        this.pagFim -= 5;
      }
    },
    pagSeguinte(){
      if(this.pagFim < this.regras.length){
        this.pagInicio += 5;
        this.pagFim += 5;
      }
    },
  },
  created() {
    this.carregarLocalStorage();
  }
}
</script>
