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
        <input type="text" id="filtro" v-model="filtroNome" placeholder="Digite o nome da role">
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
            <tr v-for="role in roles.slice(pagInicio, pagFim)" :key="role.id">
              <td data-label="Nome">{{ role.name }}</td>
              <td data-label="Descrição">{{ role.description }}</td>
              <td data-label="Cor"><span :style="{ backgroundColor: role.color, width: '20px', height: '20px', display: 'inline-block' }"></span></td>
              <td class="actions" data-label="Ações">
                <button @click="editarRole(role)">Editar</button>
                <button @click="excluirRole(role)">Deletar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="display: flex; justify-content: center; margin-top: 20px;">
          <button @click="pagAnterior()">Anterior</button>
          <button @click="pagSeguinte()">Seguinte</button>
        </div>
      </div>
    </div>

    <div class="modal" v-if="roleModal">
      <div class="modal-content">
        <button class="close-btn" @click="roleModal = false; this.limparForm()">&times;</button>
        <form @submit.prevent="salvarRole">
          <h2>Editar Role</h2>
          <label for="name">Nome:</label>
          <input type="text" id="name" v-model="role.name" required>

          <label for="description">Descrição:</label>
          <input type="text" id="description" v-model="role.description" required>

          <div style="justify-content: center; align-items: center; display: flex; flex-direction: column; margin-top: 10px; margin-bottom: 10px;">
            <label for="color">Cor:</label>
            <input :style="{width: '100px', height: '100px',}" type="color" id="color" v-model="role.color" required>
          </div>
          <button type="submit">Salvar</button>
        </form>
      </div>
    </div>

    <div v-if="deleteModal" class="modal">
      <div class="modal-content">
        <h3>Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir esta role?</p>
        <div class="botoes-confirmacao">
          <button style="background-color: red;" @click="confirmarDelete()">Sim, Excluir</button>
          <button @click="deleteModal = false; limparForm()">Cancelar</button>
        </div>
      </div>
    </div>

</template>

<script>
import api from '@/services/api';
import { getToken } from '../services/token.js'

export default {
  data() {
    return {
      role:{
        id: '',
        name: '',
        description: '',
        color: '#000000',
      },
      filtroNome: '',
      filtroMatricula: '',
      pagInicio: 0,
      pagFim: 5,
      roles: [],
      roleModal: false,
      editRole: false,
      deleteModal: false,
    };
  },
  methods: {
    pagAnterior(){
      if(this.pagInicio > 0){
        this.pagInicio -= 5;
        this.pagFim -= 5;
      }
    },
    pagSeguinte(){
      if(this.pagFim < this.roles.length){
        this.pagInicio += 5;
        this.pagFim += 5;
      }
    },
    async getRoles() {
      const token = await getToken();

      const response = await api.get('/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });

      this.roles = response.data;
    },
    async salvarRole() {
      const data = {
        name: this.role.name,
        description: this.role.description,
        color: this.role.color,
      };

      const token = await getToken();

      if(this.editRole == false){
        await api.post('/roles', data, {
          headers: { Authorization: `Bearer ${token}` }
        });

      }else{
        await api.put(`/roles/${this.role.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      await this.getRoles();
      this.limparForm();
      this.editRole = false;
      this.roleModal = false;
    },
    editarRole(role) {
      this.roleModal = true;
      this.editRole = true;

      this.role.id = role.id;
      this.role.name = role.name;
      this.role.description = role.description;
      this.role.color = role.color;
    },
    excluirRole(role) {
      this.role.id = role.id
      this.deleteModal = true
    },
    async confirmarDelete(){
      const token = await getToken();

      await api.delete(`/roles/${this.role.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      this.limparForm()
      await this.getRoles();
      this.deleteModal = false
    },
    limparForm(){
      this.role.name = '';
      this.role.description = '';
      this.role.color = '#000000';
    },
  },
  created() {
    this.getRoles();
  },
};
</script>
