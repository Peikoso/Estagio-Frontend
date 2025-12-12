<template>
  <div>
    <div class="conteudo-container">
      <div class="titulo-descricao">
        <h3>Gestão de Usuários</h3>
        <p>Gerenciamento e criação de usuários</p>
      </div>
      <div>
        <button @click="novoUsuarioModal = true">Novo Usuário</button>
      </div>
    </div>
    <div class="view-container">
      <div class="filtro-container">
        <label class="filtro-label" for="filtro">Filtrar Usuários</label>
        <input type="text" id="filtro" v-model="filtroNome" placeholder="Digite o nome do usuário">
        <input type="text" id="filtro" v-model="filtroMatricula" placeholder="Digite a matrícula">
        <select id="filtroRole" v-model="filtroRole">
          <option :value="null" selected>Roles</option>
          <option v-for="(role, index) in roles" :key="index" :value="role.id">{{ role.name }}</option>
        </select>
        <select id="filtroProfile" v-model="filtroProfile">
          <option :value="null" selected>Perfis</option>
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
          <option value="viewer">Viewer</option>
        </select>
        <span class="filtro-label" style="margin-left: auto;">Pendente</span>
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
                <button v-if="!user.pending" @click="editarUser(user)" :disabled="isLoading">{{ isLoading ? 'Carregando...' : 'Editar'}}</button>
                <button v-if="!user.pending" @click="deleteUser(user)" :disabled="isLoading">{{ isLoading ? 'Carregando...' : 'Deletar'}}</button>
                <button v-if="user.pending" @click="aprovarUser(user)" :disabled="isLoading">{{ isLoading ? 'Carregando...' : 'Aprovar'}}</button>
                <button v-if="user.pending" @click="deleteUser(user)" :disabled="isLoading">{{ isLoading ? 'Carregando...' : 'Rejeitar'}}</button>
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
        <button class="close-btn" @click="novoUsuarioModal = false; modoEdicao = false; limparForm(); getAllUsers()">&times;</button>
        <form @submit.prevent="createUser">
          <label for="matricula">Matricula</label>
          <input type="text" id="matricula" placeholder="Ex.: 203102" v-model="user.matricula" required maxlength="30">

          <label for="name">Nome</label>
          <input type="text" id="name" placeholder="Ex.: João Martins" v-model="user.name" required maxlength="100">

          <label for="email">Email</label>
          <input type="email" id="email" placeholder="Ex.: user@example.com" v-model="user.email" required maxlength="120">

          <label for="roles">Roles</label>
          <div>
            <span
            v-for="(role, index) in user.roles" :key="index"
            :style="{ backgroundColor: role.color }"
            class="role-badge">
              {{ role.name }}
              <button class="role-badge-close-button" @click="removerRole(index)">&times;</button>
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

          <button type="submit" :disabled="isLoading">{{ isLoading ? 'Salvando...' : 'Salvar'}}</button>
        </form>
      </div>
    </div>

    <div v-if="deleteModal" class="modal">
      <div class="modal-content">
        <h3>Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir este usuário?</p>
        <div class="botoes-confirmacao">
          <button style="background-color: #b30d14;" @click="confirmarDelete()" :disabled="isLoading">{{ isLoading ? 'Excluindo...' : 'Sim, Excluir'}}</button>
          <button @click="deleteModal = false; limparForm()">Cancelar</button>
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
      avatarDefault,
      page: 1,
      perPage: 5,
      filtroNome: '',
      filtroMatricula: '',
      filtroRole: null,
      filtroProfile: null,
      filtrarPendente: false,
      timer: null,
      isLoading: false,
      toastMessage: '',
      showToast: false,
      errorMessage: false,
    }
  },
  methods: {
    adicionarRole(){
      const role = this.selectedRole;
      if(role && !this.user.roles.some(r => r.id === role.id)){
        this.user.roles.push(role);
      }

      this.selectedRole = '';
    },
    removerRole(index){
      this.user.roles.splice(index, 1);
    },
    async getAllUsers() {
      try{
        const token = await getToken();

        const params = {
          name: this.filtroNome || null,
          matricula: this.filtroMatricula || null,
          role: this.filtroRole || null,
          profile: this.filtroProfile || null,
          pending: this.filtrarPendente ? true : null,
          page: this.page,
          perPage: this.perPage,
        };

        const response = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: params
        });

        this.users = response.data;

      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    },

    async createUser() {
      this.isLoading = true;
      let hasError = false;
      const NAME_REGEX = /^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)*$/;
      try{
        if(!NAME_REGEX.test(this.user.name)){
          this.toast('O nome contém caracteres inválidos.', true);
          this.isLoading = false;
          hasError = true;
          return;
        }

        const token = await getToken();

        const data = {
          name: this.user.name,
          matricula: this.user.matricula,
          email: this.user.email,
          profile: this.user.profile,
          roles: this.user.roles.map(role => role.id),
        };

        if (this.modoEdicao) {
          await api.patch(`/users/${this.user.id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          await api.post('/users', data, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (error) {
        if(error.response && error.response.status === 403 || error.response.status === 401){
          this.toast('Você não tem permissão para criar/editar este usuário.', true);
          hasError = true;
          return;
        }
        if(error.response && error.response.status === 409 && error.response.data.error.includes('matricula')){
          this.toast('A matrícula já está em uso.', true);
          hasError = true;
          return;
        }
        if(error.response && error.response.status === 409 && error.response.data.error.includes('email')){
          this.toast('O email já está em uso.', true);
          hasError = true;
          return;
        }

        this.toast('Erro ao criar/editar usuário.', true);
        console.error('Erro ao criar/editar usuário:', error);
        hasError = true;
      } finally {
        if (!hasError) {
          this.limparForm();
          this.novoUsuarioModal = false;
          this.modoEdicao = false;
        }
        await this.getAllUsers()
        this.isLoading = false;
      }

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
      this.selectedRole = ''
    },
    deleteUser(user) {
      this.user.id = user.id
      this.deleteModal = true
    },
    async confirmarDelete(){
      this.isLoading = true;
      try{
        const token = await getToken();

        await api.delete(`/users/${this.user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        if(error.response && error.response.status === 403 || error.response.status === 401){
          this.toast('Você não tem permissão para deletar este usuário.', true);
          return;
        }
        this.toast('Erro ao deletar usuário.', true);
        console.error('Erro ao deletar usuário:', error);
      } finally {
        this.isLoading = false;
        await this.getAllUsers()
        this.limparForm()
        this.deleteModal = false
      }

    },
    async aprovarUser(user) {
      this.isLoading = true;

      try{
        const token = await getToken();

        await api.post(`/users/${user.id}/approve`,
          { fake: true },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
      );
      } catch (error) {
        if(error.response && error.response.status === 403 || error.response.status === 401){
          this.toast('Você não tem permissão para aprovar este usuário.', true);
          return;
        }
        this.toast('Erro ao aprovar usuário.', true);
        console.error('Erro ao aprovar usuário:', error);
      } finally {
        await this.getAllUsers()
        this.isLoading = false;
      }

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
      try{
        const token = await getToken();

        const response = await api.get('/roles', {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.roles = response.data;
      } catch (error) {
        console.error('Erro ao buscar roles:', error);
      }
    },
    applyFilters() {
      clearTimeout(this.timer);

      this.timer = setTimeout(() => {
        this.page = 1;
        this.getAllUsers();
      }, 500); // 500ms = meio segundo
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
    this.getRoles();
    this.getAllUsers();
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
