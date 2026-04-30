<template>
  <div class="min-h-screen bg-zinc-50 flex overflow-hidden lg:static">
    <!-- Sidebar for Desktop -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 text-zinc-300 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-6 h-16 flex items-center justify-between border-b border-zinc-800">
        <NuxtLink to="/dashboard" class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <IconsLogoHorizontalIcon alt="Mi Regalo Tu Fiesta" class="h-8 w-auto text-white" />
          <span class="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded ml-1 uppercase text-zinc-500">Admin</span>
        </NuxtLink>
        <button @click="isMobileMenuOpen = false" class="lg:hidden text-zinc-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <NuxtLink 
          v-for="tab in tabs" :key="tab.id"
          :to="tab.path"
          @click="isMobileMenuOpen = false"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium"
          :class="$route.path === tab.path ? 'bg-zinc-800 text-white shadow-sm' : 'hover:bg-zinc-800/50 hover:text-white'"
        >
          <span class="text-lg" v-html="tab.icon"></span>
          {{ tab.name }}
          <span v-if="tab.id === 'reports' && pendingReports > 0" class="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {{ pendingReports }}
          </span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-zinc-800">
        <div class="bg-zinc-800/50 p-4 rounded-xl">
          <p class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Usuario Actual</p>
          <p class="text-sm font-semibold text-white truncate">{{ user?.name }}</p>
          <p class="text-[10px] text-zinc-500 truncate mb-3">{{ user?.email }}</p>
          <UiButton @click="logout" variant="ghost" size="sm" class="w-full justify-start text-zinc-400 hover:text-white p-0 h-auto font-normal">Cerrar Sesión</UiButton>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 z-40 bg-black/50 lg:hidden"></div>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Top Bar -->
      <header class="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
        <div class="flex items-center gap-4">
          <button @click="isMobileMenuOpen = true" class="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h2 class="text-lg font-bold text-zinc-900 capitalize">{{ pageTitle }}</h2>
        </div>
        <div class="flex items-center gap-3">
           <UiButton v-if="$route.path !== '/admin'" as="a" href="/admin" variant="outline" size="sm" class="hidden sm:flex">Dashboard</UiButton>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4 md:p-8 pt-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCookie, useRouter, useFetch, useRoute, useRuntimeConfig } from '#imports';

const router = useRouter();
const route = useRoute();
const token = useCookie('auth_token');
const config = useRuntimeConfig();

const isMobileMenuOpen = ref(false);

const tabs = [
  { id: 'dashboard', name: 'Dashboard Global', icon: '📊', path: '/admin' },
  { id: 'events', name: 'Gestión de Eventos', icon: '📅', path: '/admin/events' },
  { id: 'users', name: 'Usuarios', icon: '👥', path: '/admin/users' },
  { id: 'payments', name: 'Pagos Recibidos', icon: '💸', path: '/admin/payments' },
  { id: 'payouts', name: 'Gestionar Depósitos', icon: '💰', path: '/admin/payouts' },
  { id: 'categories', name: 'Categorías', icon: '🏷️', path: '/admin/categories' },
  { id: 'banks', name: 'Bancos y Cuentas', icon: '🏦', path: '/admin/banks' },
  { id: 'reports', name: 'Reportes', icon: '⚐', path: '/admin/reports' },
  { id: 'wish-templates', name: 'Plantillas de Deseos', icon: '📋', path: '/admin/wish-templates' },
  { id: 'settings', name: 'Configuración', icon: '⚙️', path: '/admin/settings' },
];

const pageTitle = computed(() => {
  return tabs.find(t => t.path === route.path)?.name || 'Panel Admin';
});

// Pending reports for badge
const { data: adminStats } = await useFetch<any>(`${config.public.apiBase}/api/admin/stats`, {
  headers: { Authorization: `Bearer ${token.value}` }
});
const pendingReports = computed(() => adminStats.value?.summary?.pending_reports ?? 0);

if (!token.value) {
  router.push('/login');
}

// Global Auth Check
const { data: user } = await useFetch<any>(`${config.public.apiBase}/api/user`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

if (user.value && user.value.role !== 'admin') {
  router.push('/dashboard');
}

const logout = () => {
  token.value = null;
  router.push('/login');
};
</script>

<style scoped>
</style>
