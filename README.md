# QQMonitor Frontend

Interface web moderna desenvolvida em Vue 3 para monitoramento de incidentes, gestão de regras e notificações em tempo real.


## 🚀 Tecnologias

- **Vue 3** - Framework JavaScript progressivo
- **Vite** - Build tool rápido
- **Vue Router** - Roteamento SPA
- **Firebase** - Autenticação e Push Notifications
- **Axios** - Cliente HTTP

## 📋 Pré-requisitos

- **Node.js** 20+
- **pnpm** (gerenciador de pacotes)
- **Firebase Project** configurado

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```sh
pnpm install
```

### 2. Configurar Firebase

Edite o arquivo `src/firebaseConfig.js` com suas credenciais Firebase.

### 3. Configurar Service Worker (Push Notifications)

Edite `public/firebase-messaging-sw.js` com suas credenciais Firebase.

### 4. Configurar URL da API

Em `src/services/api.js`, ajuste a baseURL para apontar para o backend.

## ▶️ Executar Aplicação

### Desenvolvimento (Hot-Reload)

```sh
pnpm dev
```

Acesse: `http://localhost:5173`

### Build para Produção

```sh
pnpm build
```

### Preview da Build

```sh
pnpm preview
```

### Lint com ESLint

```sh
pnpm lint
```

## 📁 Principais Views

```
src/views/
├── LoginView.vue           # Login com Firebase
├── DashboardView.vue       # Dashboard principal
├── IncidentesView.vue      # Gestão de incidentes
├── RulesView.vue           # Gestão de regras SQL
├── RunnersView.vue         # Gestão de runners
├── UsersView.vue           # Gestão de usuários
├── RolesView.vue           # Gestão de roles
├── ChannelsView.vue        # Gestão de canais 
├── RotasView.vue           # Escalas e políticas
└── LogsView.vue            # Logs de auditoria
```

## 🔐 Autenticação

A aplicação usa Firebase Authentication com token JWT armazenado localmente e middleware de autenticação em todas as rotas protegidas.


**Desenvolvido para QQTech** | Versão 1.0.0 |
