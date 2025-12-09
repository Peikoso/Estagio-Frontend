<template>
  <div>
    <div class="conteudo-container">
      <div class="titulo-descricao">
        <h3>Gestão de Escalas</h3>
        <p>Gerenciamento e criação de Escalas</p>
      </div>
      <div>
        <button @click="politicaRotaModal = true; getEscalationPolicy()">Política de Escala</button>
        <button @click="novaRotaModal = true">Nova Escala</button>
      </div>
    </div>
    <div class="view-container">
      <div class="filtros-container">
        <label class="filtro-label" for="filtro">Filtrar escalas</label>
        <input type="text" id="filtro" v-model="filtroNome" placeholder="Digite o nome do usuário"/>
        <select id="filtroRole" v-model="filtroRole">
          <option :value="null" selected>Roles</option>
          <option v-for="(role, index) in roles" :key="index" :value="role.id">
            {{ role.name }}
          </option>
        </select>
      </div>
      <div class="table-responsive">
        <h2 v-if="escalas.length == 0">Nenhuma escala atual registrada</h2>
        <table v-if="escalas.length >= 1">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Hora Inicio</th>
              <th>Hora Fim</th>
              <th>Roles</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="escala in escalas" :key="escala.uid">
              <td data-label="Nome">{{ escala.user.name }}</td>
              <td data-label="Email">{{ escala.user.email }}</td>
              <td data-label="Hora Inicio">{{ formatDate(escala.startTime) }}</td>
              <td data-label="Hora Fim">{{ formatDate(escala.endTime) }}</td>
              <td data-label="Roles">
                <span
                  v-for="(role, index) in escala.user.roles"
                  :key="index"
                  :style="{ backgroundColor: role.color }"
                  class="role-badge"
                >
                  {{ role.name }}
                </span>
              </td>
              <td data-label="Perfil">{{ escala.user.profile }}</td>
              <td class="actions" data-label="Ações">
                <button @click="editarEscala(escala)">Editar</button>
                <button @click="deleteEscala(escala)">Deletar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="display: flex; justify-content: center; margin-top: 20px">
          <button @click="pagAnterior()">Anterior</button>
          <button @click="pagSeguinte()">Seguinte</button>
        </div>
      </div>
    </div>

    <div class="modal" v-if="novaRotaModal">
      <div class="modal-content" style="min-height: 800px; max-width: 100vh; overflow-y: auto;">
        <button class="close-btn" @click="novaRotaModal = false; modoEdicao = false; this.limparForm()">&times;</button>
        <form @submit.prevent="createEscala">
          <div>
            <div>
              <label for="user">Usuário</label>
              <input type="text" id="user" v-model="filtroUserNome" placeholder="Filtrar usuários por nome" />

              <label for="userId">Usuário ID:</label>
              <input type="text" id="userId" v-model="selectedUserId" :disabled="true" />

              <label for="startTime">Hora Inicio</label>
              <input type="datetime-local" id="startTime" v-model="escala.startTime" />

              <label for="endTime">Hora Fim</label>
              <input type="datetime-local" id="endTime" v-model="escala.endTime" />

              <button type="submit" :disabled="isLoading">{{isLoading ? 'Salvando...' : 'Salvar'}}</button>
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
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id" @click="selectUser(user)">
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
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="modal" v-if="politicaRotaModal">
      <div class="modal-content">
        <button class="close-btn" @click="politicaRotaModal = false">&times;</button>
        <h2>Política de Rota</h2>
        <p>
          Aqui você pode definir as políticas relacionadas ao escalonamento automático. Se não
          houver ACK, o sistema irá considerar o timeout definido.
        </p>

        <label for="timeout">Tempo de timeout (minutos)</label>
        <input
          type="number"
          id="timeout"
          v-model="timeout"
          placeholder="Tempo de timeout (minutos)"
        />

        <button @click="salvarPoliticaRota(timeout)" :disabled="isLoading">{{ isLoading ? 'Salvando...' : 'Salvar' }}</button>
      </div>
    </div>

    <div v-if="deleteModal" class="modal">
      <div class="modal-content">
        <h3>Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir esta escala?</p>
        <div class="botoes-confirmacao">
          <button style="background-color: #b30d14" @click="confirmarDelete()" :disabled="isLoading">{{isLoading ? 'Excluindo...' : 'Sim, Excluir'}}</button>
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
import { getToken } from '@/services/token';
import { formatDate, formatToInput } from '@/services/format';
import avatarDefault from '@/assets/icons/avatar-default.svg';

export default {
  name: 'RotasView',
  data() {
    return {
      escala: {
        id: '',
        startTime: '',
        endTime: '',
        userId: '',
        user: {},
      },
      escalas: [],
      roles: [],
      users: [],
      selectedUserId: '',
      novaRotaModal: false,
      modoEdicao: false,
      deleteModal: false,
      filtroNome: '',
      filtroRole: null,
      filtroUserNome: '',
      politicaRotaModal: false,
      timeout: 0,
      escalationPolicy: {},
      page: 1,
      perPage: 5,
      isLoading: false,
      avatarDefault,
      showToast: false,
      toastMessage: '',
      errorMessage: false,
    }
  },
  methods: {
    formatDate,
    formatToInput,
    async getEscalas() {
      const token = await getToken();

      const params = {
        userName: this.filtroNome,
        roleId: this.filtroRole,
        page: this.page,
        perPage: this.perPage,
      };

      try{
        const response = await api.get('/schedules', {
          headers: { Authorization: `Bearer ${token}` },
          params: params,
        });

        this.escalas = response.data;
      } catch (error) {
        console.error('Erro ao buscar escalas:', error);
      }
    },
    async getRoles() {
      const token = await getToken();

      try{
        const response = await api.get('/roles', {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.roles = response.data;
      } catch (error) {
        console.error('Erro ao buscar roles:', error);
      }
    },
    async getUsers() {
      const token = await getToken();

      const params = {
        name: this.filtroUserNome || null,
      }

      try{
        const response = await api.get('/users/basic-info', {
          headers: { Authorization: `Bearer ${token}` },
          params: params,
        });

        this.users = response.data;
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    },
    selectUser(user) {
      this.selectedUserId = user.id
      this.filtroUserNome = user.name
    },
    async createEscala() {
      this.isLoading = true

      try{
        const token = await getToken();

        const payload = {
          startTime: new Date(this.escala.startTime).toLocaleString('sv-SE'),
          endTime: new Date(this.escala.endTime).toLocaleString('sv-SE'),
          userId: this.selectedUserId,
        };

        console.log('Payload da escala:', payload);

        if (this.modoEdicao == false) {
          await api.post('/schedules', payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

          return;
        }

        await api.patch(`/schedules/${this.escala.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

      } catch (error) {
        this.toast('Erro ao salvar escala', true);
        console.error('Erro ao salvar escala:', error);
      } finally {
        this.limparForm()
        await this.getEscalas();
        this.novaRotaModal = false
        this.modoEdicao = false
        this.isLoading = false
      }

    },

    editarEscala(escala) {
      this.escala.id = escala.id
      this.escala.startTime = formatToInput(formatDate(escala.startTime)),
      this.escala.endTime = formatToInput(formatDate(escala.endTime)),
      this.selectedUserId = escala.userId
      this.filtroUserNome = escala.user.name

      this.novaRotaModal = true
      this.modoEdicao = true
    },
    limparForm() {
      this.filtroUserNome = ''
      this.selectedUserId = ''
      this.escala.start_dt = ''
      this.escala.end_dt = ''
    },
    async deleteEscala(escala) {
      this.escala.id = escala.id
      this.deleteModal = true
    },
    async confirmarDelete() {
      this.isLoading = true

      try{
        const token = await getToken();

        await api.delete(`/schedules/${this.escala.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error('Erro ao deletar escala:', error);
      } finally {
        await this.getEscalas();
        this.limparForm()
        this.deleteModal = false
        this.isLoading = false
      }
    },
    async getEscalationPolicy() {
      const token = await getToken();

      try{
        const response = await api.get('/escalation-policies', {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.escalationPolicy = response.data;
        this.timeout = this.escalationPolicy.timeoutMs / 1000 / 60;

      } catch (error) {
        console.error('Erro ao buscar política de escalonamento:', error);
      }
    },
    async salvarPoliticaRota(timeout) {
      this.isLoading = true
      this.timeout = timeout

      const token = await getToken();

      try{
        await api.get('/escalation-policies', {
          headers: { Authorization: `Bearer ${token}` },
        });

        await api.patch('/escalation-policies', { timeoutMs: this.timeout * 60 * 1000 }, {
          headers: { Authorization: `Bearer ${token}` },
        });

      } catch (error) {
        if(error.response && error.response.status === 404){
          try{
            await api.post('/escalation-policies', { timeoutMs: this.timeout * 60 * 1000 }, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (postError) {
            console.error('Erro ao criar política de escalonamento:', postError);
            this.toast('Erro ao criar política de escalonamento', true);
            return
          }
        }
        console.error('Erro ao buscar política de escalonamento:', error);
        this.toast('Erro ao atualizar política de escalonamento', true);
        return
      } finally {
        this.politicaRotaModal = false
        this.toast('Política de escalonamento salva com sucesso', false)
        this.isLoading = false
      }

    },
    pagAnterior() {
      this.page--
      this.getEscalas()
    },
    pagSeguinte() {
      this.page++
      this.getEscalas()
    },
    applyFilters() {
      clearTimeout(this.timer)

      this.timer = setTimeout(() => {
        this.page = 1
        this.getEscalas()
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
    this.getEscalas()
    this.getRoles()
    this.getUsers()
  },
  watch: {
    filtroNome() {
      this.applyFilters()
    },
    filtroRole() {
      this.applyFilters()
    },
    filtroUserNome() {
      this.getUsers()
    },
  },
}
</script>
