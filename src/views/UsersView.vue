<template>
  <div>
    <div class="conteudo-container">
      <div class="titulo-descricao">
        <h3>Gestão de Usuários</h3>
        <p>Gerenciamento e criação de usuários</p>
      </div>
      <button @click="novoUsuarioModal = true">Novo Usuário</button>
    </div>
    <div class="view-container">
      <div class="filtro-container">
        <label class="filtro-label" for="filtro">Filtrar Nome</label>
        <input type="text" id="filtro" v-model="filtroNome" placeholder="Digite o nome do usuário">
        <label class="filtro-label" for="filtro">Filtrar Matricula</label>
        <input type="text" id="filtro" v-model="filtroMatricula" placeholder="Digite a matrícula">
        <label class="filtro-label" for="filtro">Filtrar Role</label>
        <select id="filtroRole" v-model="filtroRole">
          <option :value="null" selected>Todos</option>
          <option v-for="(role, index) in roles" :key="index" :value="role.id">{{ role.name }}</option>
        </select>
        <label class="filtro-label" for="filtro">Filtrar Profile</label>
        <select id="filtroProfile" v-model="filtroProfile">
          <option :value="null" selected>Todos</option>
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
          <option value="viewer">Viewer</option>
        </select>

        <span class="filtro-label">Pendente</span>
        <label class="switch">
          <input
            type="checkbox"
            v-model="filtrarPendente"
          />
          <span class="slider"></span>
        </label>

      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Nome</th>
              <th>Email</th>
              <th>Matricula</th>
              <th>Roles</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td data-label="">
                <div class="avatar-container" style="height: 50px; width: 50px; margin: 0;">
                  <img :src="user.foto || avatarDefault" class="foto-perfil" />
                </div>
              </td>
              <td data-label="Nome">{{ user.name }}</td>
              <td data-label="Email">{{ user.email }}</td>
              <td data-label="Matricula">{{ user.matricula }}</td>
              <td data-label="Roles">
                <span
                  v-for="(role, index) in user.roles" :key="index"
                  :style="{ backgroundColor: role.color }"
                  class="role-badge"
                >
                  {{ role.name }}
                </span>
              </td>
              <td data-label="Perfil">{{ user.profile }}</td>
              <td class="actions" data-label="Ações">
                <button v-if="!user.pending" @click="editarUser(user)">Editar</button>
                <button v-if="!user.pending" @click="deleteUser(user)">Deletar</button>
                <button v-if="user.pending" @click="aprovarUser(user)">Aprovar</button>
                <button v-if="user.pending" @click="deleteUser(user)">Rejeitar</button>
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

    <div class="modal" v-if="novoUsuarioModal">
      <div class="modal-content">
        <button class="close-btn" @click="novoUsuarioModal = false; modoEdicao = false; this.limparForm(); this.getAllUsers()">&times;</button>
        <form @submit.prevent="createUser">
          <label for="matricula">Matricula</label>
          <input type="text" id="matricula" placeholder="Ex.: 203102" v-model="user.matricula">

          <label for="name">Nome</label>
          <input type="text" id="name" placeholder="Ex.: João Martins" v-model="user.name">

          <label for="email">Email</label>
          <input type="email" id="email" placeholder="Ex.: user@example.com" v-model="user.email">

          <label for="roles">Roles</label>
          <div>
            <span
            v-for="(role, index) in user.roles" :key="index"
            :style="{ backgroundColor: role.color }"
            class="role-badge">
              {{ role.name }}
              <button style="all: unset; cursor: pointer;" @click="removerRole(index)">&times;</button>
            </span>
          </div>
          <select id="roles" v-model="selectedRole">
            <option value="" disabled selected>Selecione uma role</option>
            <option v-for="(role, index) in roles" :key="index" :value="role">{{ role.name }}</option>
          </select>
          <button @click.prevent="adicionarRole">Adicionar Role</button>

          <label for="perfil">Perfil</label>
          <select id="perfil" v-model="user.profile">
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="viewer">Viewer</option>
          </select>

          <button type="submit">Salvar</button>
        </form>
      </div>
    </div>

    <div v-if="deleteModal" class="modal">
      <div class="modal-content">
        <h3>Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir este usuário?</p>
        <div class="botoes-confirmacao">
          <button style="background-color: red;" @click="confirmarDelete()">Sim, Excluir</button>
          <button @click="deleteModal = false; limparForm()">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import avatarDefault from '@/assets/icons/avatar-default.svg';
import { getToken } from '@/services/token.js';

export default {
  name: 'UsersView',
  data() {
    return {
      user: {
        id: '',
        firebaseId: '',
        name: '',
        matricula: '',
        email: '',
        profile: 'viewer',
        roles: [],
        pending: false,
      },
      users: [],
      roles: [],
      selectedRole: '',
      novoUsuarioModal: false,
      modoEdicao: false,
      deleteModal: false,
      unsubscribe: null,
      avatarDefault,
      page: 1,
      per_page: 5,
      filtroNome: '',
      filtroMatricula: '',
      filtroRole: null,
      filtroProfile: null,
      filtrarPendente: false,
      timer: null,
    }
  },
  methods: {
    adicionarRole(){
      const role = this.selectedRole;
      if(role && !this.user.roles.some(r => r.id === role.id)){
        this.user.roles.push(role);
      }

      this.selectedRole = ""
    },
    removerRole(index){
      this.user.roles.splice(index, 1);
    },
    async getAllUsers() {
      const token = await getToken();

      const params = {
        name: this.filtroNome || null,
        matricula: this.filtroMatricula || null,
        role: this.filtroRole || null,
        profile: this.filtroProfile || null,
        pending: this.filtrarPendente ? true : null,
        page: this.page,
        per_page: this.per_page,
      };

      const response = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: params
      });

      this.users = response.data;
    },

    async createUser() {
      const token = await getToken();

      const data = {
        name: this.user.name,
        matricula: this.user.matricula,
        email: this.user.email,
        profile: this.user.profile,
        roles: this.user.roles.map(role => role.id),
      };

      if (this.modoEdicao) {
        await api.put(`/users/${this.user.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/users', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      this.limparForm()
      this.getAllUsers()
      this.novoUsuarioModal = false
      this.modoEdicao = false
    },
    editarUser(user) {
      this.user.id = user.id
      this.user.firebaseId = user.firebaseId
      this.user.name = user.name
      this.user.matricula = user.matricula
      this.user.email = user.email
      this.user.profile = user.profile
      this.user.roles = user.roles

      this.novoUsuarioModal = true
      this.modoEdicao = true
    },
    limparForm() {
      this.user.matricula = ''
      this.user.name = ''
      this.user.email = ''
      this.user.password = ''
      this.user.roles = []
      this.user.profile = 'viewer'
    },
    deleteUser(user) {
      this.user.id = user.id
      this.deleteModal = true
    },
    async confirmarDelete(){
      const token = await getToken();

      await api.delete(`/users/${this.user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      this.getAllUsers()
      this.limparForm()
      this.deleteModal = false
    },
    async aprovarUser(user) {
      const token = await getToken();

      await api.post(`/users/${user.id}/approve`,
        { fake: true },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      this.getAllUsers()
    },
    pagAnterior(){
      if(this.page > 1){
        this.page--;
        this.getAllUsers();
      }
    },
    pagSeguinte(){
      this.page++;
      this.getAllUsers();
    },
    async getRoles() {
      const token = await getToken();

      const response = await api.get('/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });

      this.roles = response.data;
    },
    applyFilters() {
      clearTimeout(this.timer);

      this.timer = setTimeout(() => {
        this.page = 1;
        this.getAllUsers();
      }, 500); // 500ms = meio segundo
    },
  },
  created() {
    this.getRoles();
    this.getAllUsers();
  },
  beforeUnmount() {
    if(this.unsubscribe){
      this.unsubscribe();
    }
  },
  watch: {
    filtroNome() { this.applyFilters() },
    filtroMatricula() { this.applyFilters() },
    filtroRole() { this.applyFilters() },
    filtroProfile() { this.applyFilters() },
    filtrarPendente() { this.applyFilters() },
  },
}
</script>
