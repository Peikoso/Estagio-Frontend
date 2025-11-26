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
import SettingsView from '../views/SettingsView.vue'
import RolesView from '../views/RolesView.vue'
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebaseConfig.js'


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
     meta: { requiresAuth: true}
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
    },
    {
      path: '/logs',
      name: 'logs',
      component: LogsView,
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
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
    {
      path: '/roles',
      name: 'roles',
      component: RolesView,
    }
  ],
})


router.beforeEach((to, from, next) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {

    if (!user && to.name !== "login" && to.name !== "senha" && to.name !== "acesso") {
      unsubscribe();
      return next({ name: "login" });
    }

    if (user && to.name === "login") {
      unsubscribe();
      return next({ name: "dashboard" });
    }

    unsubscribe();
    next();
  });
});




export default router
