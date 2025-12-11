import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import IncidentesView from '../views/IncidentesView.vue'
import RulesView from '../views/RulesView.vue'
import RotasView from '@/views/RotasView.vue'
import UsersView from '../views/UsersView.vue'
import LogsView from '../views/LogsView.vue'
import LoginView from '../views/LoginView.vue'
import SenhaView from '../views/SenhaView.vue'
import AcessoView from '../views/AcessoView.vue'
import RunnersView from '../views/RunnersView.vue'
import RelatorioView from '../views/RelatorioView.vue'
import RolesView from '../views/RolesView.vue'
import ChannelsView from '@/views/ChannelsView.vue'
import api from '@/services/api'
import { getCurrentUser, VerifySuperAdmin } from '@/services/auth'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/senha',
      name: 'senha',
      component: SenhaView
    },
    {
      path: '/acesso',
      name: 'acesso',
      component: AcessoView
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/incidentes',
      name: 'incidentes',
      component: IncidentesView,
    },
    {
      path: '/rules',
      name: 'rules',
      component: RulesView,
    },
    {
     path: '/rota',
     name: 'rota',
     component: RotasView,
     meta: { requiresAdmin: true}
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAdmin: true}
    },
    {
      path: '/logs',
      name: 'logs',
      component: LogsView,
      meta: { requiresAdmin: true}
    },
    {
      path: '/runners',
      name: 'runners',
      component: RunnersView,
    },
    {
      path: '/relatorios',
      name: 'relatorios',
      component: RelatorioView,
      meta: { requiresAdmin: true}
    },
    {
      path: '/canais',
      name: 'channels',
      component: ChannelsView,
      meta: { requiresAdmin: true, requiresSuperAdmin: true }
    },
    {
      path: '/roles',
      name: 'roles',
      component: RolesView,
      meta: { requiresAdmin: true, requiresSuperAdmin: true }
    }
  ],
})


router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser();
  let userData = null;
  let isSuperAdmin = false;

  if (user) {
    try {
      const token = await user.getIdToken(true);
      const response = await api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      userData = response.data;

      isSuperAdmin = VerifySuperAdmin(userData);

    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  }

  if (!user && to.name !== "login" && to.name !== "senha" && to.name !== "acesso") {
    return next({ name: "login" });
  }

  if (user && to.name === "login") {
    return next({ name: "dashboard" });
  }

  if(userData && to.meta.requiresAdmin && userData.profile !== 'admin'){
    return next({ name: "dashboard" });
  }

  if(userData && to.meta.requiresSuperAdmin && !isSuperAdmin){
    return next({ name: "dashboard" });
  }

  next();
});





export default router
