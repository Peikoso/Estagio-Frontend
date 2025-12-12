<template>
  <div :class="{ 'sidebar-aberta': sidebarAberta }">
    <header class="top-navbar">
      <div class="top-navbar-content">
        <button class="side-button" @click="toggleSidebar">☰</button>
        <button v-if="!sidebarAberta" class="top-alert" style="background-color: #269447; margin-right: 75px;">
          <img :src="help" @click="helpModal = true" />
        </button>
        <button v-if="notificacoes.length > 0" class="top-alert" @click="notificacaoModal = true">
          <img :src="notificacaoImg" />
          <span class="alert-count">{{ notificacoes.length }}</span>
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
          :to="{ name: 'rota' }"
          class="link"
          active-class="ativo"
        >
          Gestão de Escalas
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
          :to="{ name: 'logs' }"
          class="link"
          active-class="ativo"
        >
          Logs e Auditoria
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
          v-if="isSuperAdmin"
          :to="{ name: 'roles' }"
          class="link"
          active-class="ativo"
        >
          Gestão de Roles
        </router-link>
        <router-link
          v-if="isSuperAdmin"
          :to="{ name: 'channels' }"
          class="link"
          active-class="ativo"
        >
          Gestão de Canais
        </router-link>
      </nav>

      <div class="user-menu" @click="toggleDropdown">
        <div class="user-info">
          <span>{{ userData.nome }}</span>
        </div>
        <ul v-if="dropdownOpen" class="dropdown">
          <li v-if="!(userData.perfil === 'viewer')">
            <a class="link" @click="perfilModal = true">Perfil</a>
            <a class="link" @click="preferenciaModal = true; getCanais()">Preferências</a>
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
          <button type="submit" :disabled="isLoading">{{ isLoading ? 'Salvando...' : 'Salvar'}}</button>
        </form>
      </div>
    </div>

    <div class="modal" v-if="perfilModal" style="z-index: 4000">
      <div class="modal-content">
        <button
          class="close-btn"
          @click="perfilModal = false; getUserInfo(); savePictureButton=false">&times;
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
                <img v-if="!savePictureButton" :src="`${apiBaseUrl}/uploads/${userData.foto}`" class="foto-perfil" />
                <img v-if="savePictureButton" :src="userData.foto" class="foto-perfil" />
                <label for="file-avatar" class="editar-overlay">Editar</label>
                <input id="file-avatar" type="file" @change="atualizarAvatar" accept="image/*" />
                <button v-if="savePictureButton" type="button" @click="savePicture">Salvar Foto</button>
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

          <input type="text" id="telefone" v-model="formattedPhone" placeholder="(99) 99999-9999"/>

          <button type="submit" :disabled="isLoading">{{ isLoading ? 'Salvando...' : 'Salvar'}}</button>
          <button type="button" @click.prevent="mudarSenha" :disabled="isLoading">{{ isLoading ? 'Carregando...' : 'Mudar Senha'}}</button>
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
            <p v-if="notificacoes.length == 0"><strong>Nenhuma Notificação Registrada</strong></p>
            <table v-if="notificacoes.length >= 1">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Menssagem</th>
                  <th>Enviada em</th>
                  <th>Visualizar Incidente</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="notificacao in notificacoes" :key="notificacao.id">
                  <td data-label="Título">{{ notificacao.title }}</td>
                  <td data-label="Menssagem">{{ notificacao.message }}</td>
                  <td data-label="Enviada em">{{ formatDate(notificacao.sentAt) }}</td>
                  <td class="actions" style="text-align: center">
                    <button
                      @click="notificacaoModal = false; sidebarAberta = false; readNotification(notificacao.id); $router.push({name: 'incidentes',query: { incidenteId: notificacao.incidentId }});">
                      Ver
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
import { auth } from '../firebaseConfig.js'
import { sendPasswordResetEmail } from 'firebase/auth'
import { getToken } from '../services/token.js'
import { signOut } from 'firebase/auth'
import logo from '@/assets/icons/logo.png'
import notificacaoImg from '@/assets/icons/notifications.svg'
import help from '@/assets/icons/help.svg'
import api from '@/services/api.js'
import { formatDate, formatPhone } from '@/services/format.js'
import { requestNotificationPermission } from '@/services/fcm.js'
import { VerifySuperAdmin } from '@/services/auth.js'

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
      selectedAvatarFile: null,
      preferencia: {
        startTime: '00:00:00',
        endTime: '00:00:00',
        canais: [],
      },
      canais: [],
      notificacao: {
        id: '',
        incidentId: '',
        userId: '',
        title: '',
        message: '',
        status: '',
      },
      notificacoes: [],
      preferenciaModal: false,
      perfilModal: false,
      notificacaoModal: false,
      helpModal: false,
      dropdownOpen: false,
      sidebarAberta: false,
      avatarDefault: 'avatar-default.svg',
      logo,
      notificacaoImg,
      help,
      pollingTime: 5000, // 5 segundos
      pollingInterval: null,
      originalTitle: '',
      isLoading: false,
      isSuperAdmin: false,
      showToast: false,
      toastMessage: '',
      errorMessage: false,
      formattedPhone: '',
      savePictureButton: false,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    }
  },
  methods: {
    formatDate,
    VerifySuperAdmin,
    formatPhone,
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

        this.formattedPhone = this.formatPhone(this.userData.telefone);

        this.isSuperAdmin = VerifySuperAdmin(response.data);

        try{
          const preferenciasResponse = await api.get('/user-preferences', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          this.preferencia.startTime = preferenciasResponse.data.dndStartTime || '00:00:00'
          this.preferencia.endTime = preferenciasResponse.data.dndEndTime || '00:00:00'
          this.preferencia.canais = preferenciasResponse.data.channels.map(channel => channel.id) || []

        } catch (error) {
          if (error.response && error.response.status === 404) {
            //Usuário sem preferências, então usamos valores padrão...
          } else {
            console.error('Erro ao buscar preferências do usuário:', error)
          }
          this.preferencia.startTime = '00:00:00'
          this.preferencia.endTime = '00:00:00'
          this.preferencia.canais = []
        }
      }
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
          document.title = this.originalTitle;
          this.$router.push({ name: 'login' })
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
      try{
        const token = await getToken();

        const response = await api.get('/config/active', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.canais = response.data
      } catch (error) {
        this.canais = []
        console.error('Erro ao buscar canais:', error)
      }
    },
    async salvarPreferencias() {
      this.isLoading = true;
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

        await api.patch('/user-preferences', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

      } catch (err) {
        if (err.response && err.response.status === 404) {
          await api.post('/user-preferences', payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return;
        }
        console.error('Erro ao salvar preferências:', err);
        return;
      } finally {
        this.isLoading = false;
        this.preferenciaModal = false;
      }
    },
    async getNotifications() {
      try{
        const token = await getToken();

        const response = await api.get('/notifications/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.notificacoes = response.data;
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        this.notificacoes = []
      }

    },
    async readNotification(notificationId) {
      try{
        const token = await getToken();
        await api.patch(`/notifications/${notificationId}`, {
          status: 'READED',
          readAt: new Date().toLocaleString('sv-SE')
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.getNotifications()

      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error)
      }
    },
    async salvarPerfil() {
      this.isLoading = true;
      try{
        const token = await getToken();

        const data = {
          name: this.userData.nome,
          email: this.userData.email,
          phone: this.formattedPhone.replace(/\D/g, ""),
          picture: null,
        };

        await api.patch('/users/me',data, {
            headers: { Authorization: `Bearer ${token}` }
        });

        this.perfilModal = false
        this.getUserInfo()

      } catch (error) {
        if(error.response && error.response.status === 409 && error.response.data.error.includes('email')){
          this.toast('Email já está em uso por outro usuário.', true)
          return;
        }
        this.toast('Erro ao salvar perfil.', true)
        console.error('Erro ao salvar perfil:', error)
      } finally {
        this.isLoading = false
      }
    },
    async mudarSenha() {
      this.isLoading = true
      try {
        await sendPasswordResetEmail(auth, this.userData.email)
        this.toast('Link de troca de senha enviado!', false)
      } catch (error) {
        this.toast('Erro ao enviar link de troca de senha.', true)
        console.error('Erro ao enviar link de troca de senha', error)
      } finally {
        this.isLoading = false
      }
    },
    atualizarAvatar(event) {
      this.savePictureButton = true
      const file = event.target.files[0]
      if (file) {
        this.selectedAvatarFile = file;

        const reader = new FileReader()
        reader.onload = (e) => {
          this.userData.foto = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    async savePicture() {
      if(!this.userData.foto || this.userData.foto === this.avatarDefault) {
        this.toast('Nenhuma foto selecionada.', true)
        this.savePictureButton = false
        return;
      }

      try{
        const token = await getToken();

        const formData = new FormData()
        formData.append('picture', this.selectedAvatarFile)

        const response = await api.patch('/users/me/picture', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        this.userData.foto = response.data.picture
        this.toast('Foto salva com sucesso!', false)
      } catch (error) {
        if(error.response && error.response.status === 422) {
          this.toast('Formato de imagem ou nome de imagem inválido.', true)
          return;
        }
        this.toast('Erro ao salvar foto.', true)
        console.error('Erro ao salvar foto:', error)
      } finally {
        this.savePictureButton = false
      }

    },
    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.getNotifications()
        this.setTabNotifications()
      }, this.pollingTime)
    },
    setTabNotifications() {
      const notificationCount = this.notificacoes.length

      if (notificationCount > 0) {
        document.title = `(${notificationCount  }) ${this.originalTitle}`
      }
      if(notificationCount === 0) {
        document.title = this.originalTitle
      }

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
    this.originalTitle = document.title;
    this.getUserInfo()
    this.getCanais()
    this.getNotifications()
    this.startPolling()
    requestNotificationPermission()
  },
  beforeUnmount() {
    clearInterval(this.pollingInterval)
    this.clearUserInfo()
  },
  watch: {
    "formattedPhone"(newValue) {
      this.formattedPhone = this.formatPhone(newValue);
    }
  },
}
</script>
