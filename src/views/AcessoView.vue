<template>
  <div class="login-container">
    <div class="login-form-container">
      <div class="login-form">
        <h2 class="form-title">Solicitar Acesso</h2>
        <form @submit.prevent="createUser">
          <div class="form-group">
            <label for="matricula">Matricula</label>
            <input
              class="form-input"
              type="text"
              id="matricula"
              placeholder="Ex.: 203102"
              v-model="user.matricula"
            />
          </div>

          <div class="form-group">
            <label for="name">Nome</label>
            <input
              class="form-input"
              type="text"
              id="name"
              placeholder="Ex.: João Martins"
              v-model="user.name"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              class="form-input"
              type="email"
              id="email"
              placeholder="Ex.: user@example.com"
              v-model="user.email"
              :disabled="modoEdicao"
            />
          </div>

          <div class="form-group">
            <button class="login-button" type="submit">Salvar</button>
          </div>
        </form>
        <router-link
          class="link"
          :to="{ name: 'login' }"
          style="text-align: center; background-color: #24723b"
          >Voltar ao Login</router-link
        >
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
import api from '@/services/api'

export default {
  name: 'AcessoView',
  data() {
    return {
      modoEdicao: false,
      user: {
        matricula: '',
        name: '',
        email: '',
      },
      showToast: false,
      toastMessage: '',
      errorMessage: false,
    }
  },
  methods: {
    async createUser() {
      if (!this.user.matricula || !this.user.name || !this.user.email) {
        this.toast('Por favor, preencha todos os campos.', true)
        return
      }

      try {
        await api.post('/users/register', {
          matricula: this.user.matricula,
          name: this.user.name,
          email: this.user.email,
        })
      } catch (error) {
        if (error.status === 409) {
          this.toast('Já existe uma solicitação de acesso com este email ou matrícula.', true)
          return
        }

        this.toast(
          'Erro ao enviar solicitação de acesso. Verifique os dados e tente novamente.',
          true,
        )
        return
      }

      this.toast(
        'Solicitação de acesso enviada com sucesso! Após a aprovação digite a senha que deseja utilizar no primeiro login.',
      )

      setTimeout(() => {
        this.$router.push({ name: 'login' })
      }, 2500)
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
}
</script>
