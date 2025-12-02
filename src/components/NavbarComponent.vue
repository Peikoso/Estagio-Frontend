<template>
  <div :class="{ 'sidebar-aberta': sidebarAberta }">
    <header class="top-navbar">
      <div class="top-navbar-content">
        <button class="side-button" @click="toggleSidebar">☰</button>
        <button v-if="!sidebarAberta" class="top-alert" style="background-color: #269447; margin-right: 75px;">
          <img :src="help" @click="helpModal = true" />
        </button>
        <button v-if="incidentes.length > 0" class="top-alert" @click="notificacaoModal = true">
          <img :src="notificacaoImg" />
          <span class="alert-count">{{ incidentes.length }}</span>
        </button>
      </div>
    </header>
    <aside :class="['sidebar', { fechada: !sidebarAberta }]">
      <img style="" :src="logo" alt="logo" />
      <br />
      <h2 class="logo">Plantão Monitor</h2>
      <nav>
        <router-link :to="{ name: 'dashboard' }" class="link" active-class="ativo">
          Dashboard
        </router-link>
        <router-link :to="{ name: 'incidentes' }" class="link" active-class="ativo">
          Incidentes
        </router-link>
        <router-link
          v-if="!(userData.perfil === 'viewer')"
          :to="{ name: 'rules' }"
          class="link"
          active-class="ativo"
        >
          Regras
        </router-link>
        <router-link
          v-if="userData.perfil !== 'viewer'"
          :to="{ name: 'runners' }"
          class="link"
          active-class="ativo"
        >
          Runners
        </router-link>
        <div v-if="userData.perfil === 'admin'">
          <hr />
        </div>
        <router-link
          v-if="userData.perfil === 'admin'"
          :to="{ name: 'logs' }"
          class="link"
          active-class="ativo"
        >
          Logs de Execução
        </router-link>
        <router-link
          v-if="userData.perfil === 'admin'"
          :to="{ name: 'relatorios' }"
          class="link"
          active-class="ativo"
        >
          Relatórios e Métricas
        </router-link>
        <router-link
          v-if="userData.perfil === 'admin'"
          :to="{ name: 'rota' }"
          class="link"
          active-class="ativo"
        >
          Gestão de Rotas
        </router-link>
        <router-link
          v-if="userData.perfil === 'admin'"
          :to="{ name: 'users' }"
          class="link"
          active-class="ativo"
        >
          Gestão de Usuários
        </router-link>
        <router-link
          v-if="userData.perfil === 'admin'"
          :to="{ name: 'roles' }"
          class="link"
          active-class="ativo"
        >
          Gestão de Roles
        </router-link>
        <router-link
          v-if="userData.perfil === 'admin'"
          :to="{ name: 'settings' }"
          class="link settings-link"
          active-class="ativo"
        >
          Configurações
        </router-link>
      </nav>

      <div class="user-menu" @click="toggleDropdown">
        <div class="user-info">
          <span>{{ userData.nome }}</span>
        </div>
        <ul v-if="dropdownOpen" class="dropdown">
          <li v-if="!(userData.perfil === 'viewer')">
            <a class="link" @click="perfilModal = true">Perfil</a>
            <a class="link" @click="preferenciaModal = true">Preferências</a>
          </li>
          <li><a class="link" @click.prevent="logout">Sair</a></li>
        </ul>
      </div>
    </aside>

    <div class="modal" v-if="preferenciaModal" style="z-index: 4000">
      <div class="modal-content">
        <button class="close-btn" @click="preferenciaModal = false">&times;</button>
        <h2>Preferências</h2>
        <form @submit.prevent="salvarPreferencias">
          <h5 style="text-align: center">Janela de Não Perturbe</h5>
          <div class="row">
            <div class="col">
              <label for="hora_inicio">Hora Início</label>
              <input type="time" id="hora_inicio" v-model="preferencia.startTime"  step="1"/>
            </div>
            <div class="col">
              <label for="hora_final">Hora Final</label>
              <input type="time" id="hora_final" v-model="preferencia.endTime" step="1"/>
            </div>
          </div>
          <br />
          <h5 style="text-align: center">Canais de Notificação</h5>
          <div class="channels-grid">
            <div class="channel-row" v-for="canal in canais" :key="canal.id">
              <span class="channel-label">{{ canal.name }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  :value="canal.id"
                  v-model="preferencia.canais"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <button type="submit">Salvar</button>
        </form>
      </div>
    </div>

    <div class="modal" v-if="perfilModal" style="z-index: 4000">
      <div class="modal-content">
        <button
          class="close-btn"
          @click="perfilModal = false; getUserInfo()">&times;
        </button>
        <h2>Perfil</h2>
        <form @submit.prevent="salvarPerfil">
          <div class="row">
            <div class="col">
              <label for="nome">Nome</label>
              <input type="text" id="nome" v-model="userData.nome"/>
            </div>
            <div class="col">
              <div class="avatar-container">
                <img :src="userData.foto || avatarDefault" class="foto-perfil" />
                <label for="file-avatar" class="editar-overlay">Editar</label>
                <input id="file-avatar" type="file" @change="atualizarAvatar" accept="image/*" />
              </div>
            </div>
          </div>

          <label for="email">Email</label>
          <input type="email" id="email" v-model="userData.email"/>

          <div class="row">
            <div class="col">
              <label for="matricula">Matrícula</label>
              <input type="text" id="matricula" v-model="userData.matricula" :disabled="true"/>
            </div>
            <div class="col">
              <label for="perfil">Perfil</label>
              <input type="text" id="perfil" v-model="userData.perfil" :disabled="true"/>
            </div>
          </div>

          <label for="roles">Roles</label>
          <div id="roles" class="fake-input">
            <span
              v-for="(role, index) in userData.roles"
              :key="index"
              :style="{ backgroundColor: role.color }"
              class="role-badge"
            >
              {{ role.name }}
            </span>
          </div>

          <label for="telefone">Telefone</label>
          <input type="number" id="telefone" v-model="userData.telefone"/>

          <button type="submit">Salvar</button>
        </form>
      </div>
    </div>

    <div class="modal" v-if="notificacaoModal" style="z-index: 4000">
      <div class="modal-content" style="max-width: 800px">
        <button class="close-btn" style="top: 34px" @click="notificacaoModal = false">
          &times;
        </button>
        <div class="modal-details">
          <h2>Notificações</h2>
          <div class="table-responsive">
            <p v-if="incidentes.length == 0"><strong>Nenhuma Notificação Registrada</strong></p>
            <table v-if="incidentes.length >= 1">
              <thead>
                <tr>
                  <th>Incidente ID:</th>
                  <th>Prioridade</th>
                  <th>Aberta em</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="incidente in incidentes" :key="incidente.id">
                  <td data-label="ID">{{ incidente.id }}</td>
                  <td data-label="Prioridade">
                    {{ regras.find((regra) => regra.id === incidente.regra_id)?.prioridade }}
                  </td>
                  <td data-label="Aberta em">{{ incidente.created_at }} minutos</td>
                  <td class="actions" style="text-align: center">
                    <button
                      @click="notificacaoModal = false; sidebarAberta = false; this.$router.push({name: 'incidentes',query: { incidenteId: incidente.id }});">
                      Ir
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" v-if="helpModal" style="z-index: 4000">
      <div class="modal-content" style="max-width: 600px">
        <button class="close-btn" style="top: 34px" @click="helpModal = false">&times;</button>
        <div class="modal-details">
          <h4>Glossário</h4>
          <p><strong>Runner:</strong> Serviço que executa regras programadas.</p>
          <p>
            <strong>Incident:</strong> Agrupamento de ocorrências relacionadas a uma regra/erro.
          </p>
          <p>
            <strong>ACK:</strong> Confirmação recebida por um plantonista indicando que está ciente.
          </p>
          <p>
            <strong>Role:</strong> Etiqueta que mapeia regras a grupos de usuários (ex.:
            CANAIS_DIGITAIS).
          </p>
          <h4>Ajuda e Suporte</h4>
          <p>
            Para assistência, entre em contato com o suporte técnico pelo email suporte@exemplo.com
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from '../firebaseConfig.js'
import { getToken } from '../services/token.js'
import { signOut } from 'firebase/auth'
import logo from '@/assets/icons/logo.png'
import notificacaoImg from '@/assets/icons/notifications.svg'
import avatarDefault from '@/assets/icons/avatar-default.svg'
import help from '@/assets/icons/help.svg'
import api from '@/services/api.js'

export default {
  name: 'NavbarComponent',
  data() {
    return {
      userData: {
        id: '',
        matricula: '',
        nome: '',
        email: '',
        telefone: '',
        pending: '',
        perfil: '',
        roles: [],
        foto: '',
      },
      preferencia: {
        startTime: '00:00:00',
        endTime: '00:00:00',
        canais: [],
      },
      canais: [],
      incidente: {
        id: '',
        regra_id: '',
        user_id_ack: '',
        user_id_closed: '',
        status: '',
        comentario_ack: '',
        comentario_closed: '',
        created_at: '',
        ack_at: '',
        closed_at: '',
        logs: [],
      },
      incidentes: [],
      regras: [],
      preferenciaModal: false,
      perfilModal: false,
      notificacaoModal: false,
      helpModal: false,
      dropdownOpen: false,
      sidebarAberta: false,
      avatarDefault,
      logo,
      notificacaoImg,
      help,
    }
  },
  methods: {
    async getUserInfo() {
      if (auth.currentUser && !auth.currentUser.isAnonymous) {
        const token = await getToken();

        const response = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.userData.id = response.data.id
        this.userData.matricula = response.data.matricula
        this.userData.nome = response.data.name
        this.userData.email = response.data.email
        this.userData.telefone = response.data.phone || ''
        this.userData.pending = response.data.pending
        this.userData.perfil = response.data.profile
        this.userData.roles = response.data.roles
        this.userData.foto = response.data.picture || this.avatarDefault

        const preferenciasResponse = await api.get('/user-preferences', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.preferencia.startTime = preferenciasResponse.data.dndStartTime || '00:00:00'
        this.preferencia.endTime = preferenciasResponse.data.dndEndTime || '00:00:00'
        this.preferencia.canais = preferenciasResponse.data.channels.map(channel => channel.id) || []

      } else if (auth.currentUser.isAnonymous === true) {
        this.userData.id = 'visitante'
        this.userData.matricula = 'visitante'
        this.userData.name = 'visitante'
        this.userData.email = 'visitante'
        this.userData.pending = 'visitante'
        this.userData.profile = 'viewer'
        this.userData.roles = 'visitante'
        this.userData.foto = this.avatarDefault
      }

      localStorage.setItem('userData', JSON.stringify(this.userData))
    },
    clearUserInfo() {
      this.userData = {
        id: '',
        matricula: '',
        nome: '',
        email: '',
        telefone: '',
        pending: '',
        perfil: '',
        roles: '',
        foto: '',
      }
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen
    },
    logout() {
      signOut(auth)
        .then(() => {
          // Sign-out successful.
          this.$router.push({ name: 'login' })
          localStorage.removeItem('userData')
        })
        .catch((error) => {
          console.log(error)
          // An error happened.
        })
    },
    toggleSidebar() {
      this.sidebarAberta = !this.sidebarAberta
    },
    async getCanais() {
      const token = await getToken();

      const response = await api.get('/channels', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      this.canais = response.data
    },
    async salvarPreferencias() {
      const token = await getToken();

      const payload = {
        dndStartTime: this.preferencia.startTime,
        dndEndTime: this.preferencia.endTime,
        channels: this.preferencia.canais,
      };

      try {
        await api.get('/user-preferences', {
          headers: { Authorization: `Bearer ${token}` }
        });

        await api.put('/user-preferences', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

      } catch (err) {
        if (err.response && err.response.status === 404) {
          await api.post('/user-preferences', payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          console.error('Erro ao salvar preferências:', err);
          return;
        }
      }

      this.preferenciaModal = false;
    },
    carregarLocalStorage() {
      this.regras = JSON.parse(localStorage.getItem('regras')) || []
      const incidentesData = JSON.parse(localStorage.getItem('incidentes')) || []
      this.incidentes = incidentesData.filter((incidente) => incidente.status === 'open')
    },
    async salvarPerfil() {
      const token = await getToken();

      const data = {
        name: this.userData.nome,
        email: this.userData.email,
        phone: this.userData.telefone,
        picture: null,
      };

      await api.put('/users/me',data, {
          headers: { Authorization: `Bearer ${token}` }
      });

      this.perfilModal = false
      this.getUserInfo()
    },
    atualizarAvatar(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.userData.foto = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
  },
  created() {
    this.getUserInfo()
    this.getCanais()
    this.carregarLocalStorage()
  },
  beforeUnmount() {
    this.clearUserInfo()
  },
}
</script>
