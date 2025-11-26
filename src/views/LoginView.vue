<template>
  <div class="login-container">
    <div class="login-form-container">
      <div class="login-form">
        <h2 class="form-title">Login</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email:</label>
            <input
              class="form-input"
              type="email"
              id="email"
              v-model="email"
              required
              placeholder="Digite seu email"
              autocomplete="email"
            />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input
              class="form-input"
              type="password"
              id="password"
              v-model="password"
              required
              placeholder="Digite sua senha"
              autocomplete="current-password"
            />
          </div>
          <div class="form-group">
            <button :disabled="isLoadingLogin || isLoadingVisitante" class="login-button">{{ isLoadingLogin ? 'Carregando...' : 'Login' }}</button>
          </div>
        </form>
        <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
          <router-link :to="{ name: 'senha' }" class="link" style="width: 48%; text-align: center; background-color:  #24723b;">Esqueci minha senha</router-link>
          <router-link :to="{ name: 'acesso' }" class="link" style="width: 48%; text-align: center; background-color:  #24723b;">Solicitar Acesso</router-link>
        </div>
        <div class="form-group">
          <button :disabled="isLoadingLogin || isLoadingVisitante" @click="anonymousLogin" class="anonymous-button">{{ isLoadingVisitante ? 'Carregando...' : 'Visitante' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth'
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      isLoadingLogin: false,
      isLoadingVisitante: false,
    }
  },
  methods: {
    async handleLogin() {
      this.isLoadingLogin = true
      const auth = getAuth()
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password)
        this.$router.push({ name: 'dashboard' })
      } catch (error) {
          console.error('error with login', error.code, error.message)
      } finally {
        this.isLoadingLogin = false
      }
    },
    async anonymousLogin() {
      this.isLoadingVisitante = true
      const auth = getAuth()
      try {
        await signInAnonymously(auth)
        this.$router.push({ name: 'dashboard' })
      } catch (error) {
        console.error('error with login: ', error.code, error.message)
      } finally {
        this.isLoadingVisitante = false
      }
    },
  },
}
</script>
