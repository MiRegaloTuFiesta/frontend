<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UiCard @click="router.push('/admin/payments')" class="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
        <UiCardContent class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 bg-primary-50 text-primary-600 rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-colors">💰</div>
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recaudación Total</span>
          </div>
          <div class="text-3xl font-extrabold text-zinc-900">${{ formatNumber(stats?.summary.total_collected) }}</div>
          <div class="mt-2 text-xs text-zinc-500">Aportes procesados exitosamente</div>
        </UiCardContent>
      </UiCard>

      <UiCard @click="router.push('/admin/events')" class="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
        <UiCardContent class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">📋</div>
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Eventos Totales</span>
          </div>
          <div class="text-3xl font-extrabold text-zinc-900">{{ stats?.summary.total_events }}</div>
          <div class="mt-2 text-xs text-zinc-500">Creados en la plataforma</div>
        </UiCardContent>
      </UiCard>

      <UiCard @click="router.push('/admin/users')" class="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
        <UiCardContent class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">👥</div>
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Usuarios</span>
          </div>
          <div class="text-3xl font-extrabold text-zinc-900">{{ stats?.summary.total_users }}</div>
          <div class="mt-2 text-xs text-zinc-500">Registrados en la plataforma</div>
        </UiCardContent>
      </UiCard>

      <UiCard class="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
        <UiCardContent class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">📈</div>
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Utilidad Plataforma</span>
          </div>
          <div class="text-3xl font-extrabold text-zinc-900">${{ formatNumber(stats?.summary.total_platform_profit) }}</div>
          <div class="mt-2 text-xs text-zinc-500">Ganancia neta acumulada</div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Alertas de Transferencia -->
    <div v-if="stats?.upcoming_alerts?.length > 0" class="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
      <h3 class="text-amber-800 font-bold flex items-center gap-2">
        <span class="text-xl">⚠️</span> Alertas de Transferencia (Próximos Eventos)
      </h3>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="alert in stats.upcoming_alerts" :key="alert.id" 
          class="bg-white p-4 rounded-xl shadow-sm border flex flex-col justify-between"
          :class="alert.alert_type === 'critical' ? 'border-rose-200' : 'border-amber-200'"
        >
          <div>
            <p class="font-bold text-zinc-900 line-clamp-1">{{ alert.name }}</p>
            <p class="text-xs text-zinc-500">{{ new Date(alert.date + 'T12:00:00').toLocaleDateString('es-CL') }}</p>
          </div>
          <div class="mt-4 flex justify-between items-center">
            <span :class="alert.alert_type === 'critical' ? 'text-rose-600' : 'text-amber-600'" class="text-xs font-bold uppercase">
              Faltan {{ alert.days_left }} días
            </span>
            <UiButton size="sm" variant="outline" class="h-8 text-[10px] uppercase font-bold" @click="router.push('/admin/events')">Ver Detalles</UiButton>
          </div>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-12 gap-8">
      <!-- Simple Chart (CSS based) -->
      <div class="lg:col-span-8 bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 pb-12">
        <h3 class="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
          Tendencia de Aportes (Últimos 7 días)
        </h3>
        <div class="h-64 flex items-end gap-2 border-b border-zinc-100 pb-2">
          <div v-for="day in chartDataPrepared" :key="day.date" class="flex-1 h-full flex flex-col justify-end items-center group relative">
            <div 
              class="bg-primary-500/10 group-hover:bg-primary-500 w-full rounded-t-lg transition-all relative overflow-hidden" 
              :style="{ height: Math.max(day.percent, 3) + '%' }"
            >
              <div class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
              <div class="opacity-0 group-hover:opacity-100 absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white whitespace-nowrap bg-zinc-900/80 px-1.5 py-0.5 rounded shadow-lg transition-all z-20">${{ formatNumber(day.total) }}</div>
            </div>
            <span class="text-[10px] text-zinc-400 mt-2 font-bold absolute -bottom-6">{{ day.label }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="lg:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
         <h3 class="text-lg font-bold text-zinc-900 mb-4">Actividad Reciente</h3>
         <div class="space-y-4">
            <div v-for="cont in stats?.recent_contributions" :key="cont.id" class="flex gap-4 p-3 hover:bg-zinc-50 rounded-xl transition-colors">
              <div class="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-sm font-bold text-zinc-600">{{ cont.donor_name[0] }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-zinc-900 truncate">{{ cont.donor_name }}</p>
                <p class="text-xs text-zinc-400 truncate">{{ cont.wish?.event?.name }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-extrabold text-primary-700">+${{ formatNumber(cont.amount) }}</p>
                <p class="text-[10px] text-zinc-400 uppercase">{{ new Date(cont.created_at).toLocaleDateString() }}</p>
              </div>
            </div>
         </div>
      </div>
    </div>

    <!-- Recent Activity: Users & Events -->
    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Recent Users -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <h3 class="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">🆕 Nuevos Usuarios</h3>
        <div class="space-y-3">
          <div v-for="u in stats?.recent_users" :key="u.id" class="flex gap-3 items-center p-2 hover:bg-zinc-50 rounded-xl">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">{{ u.name?.[0] }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-zinc-900 truncate">{{ u.name }}</p>
              <p class="text-xs text-zinc-400 truncate">{{ u.email }}</p>
            </div>
            <span class="text-[10px] text-zinc-400 shrink-0">{{ new Date(u.created_at).toLocaleDateString('es-CL') }}</span>
          </div>
          <p v-if="!stats?.recent_users?.length" class="text-sm text-zinc-400 py-2 text-center">Sin usuarios recientes</p>
        </div>
      </div>
      <!-- Recent Events -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <h3 class="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">📋 Nuevos Eventos</h3>
        <div class="space-y-3">
          <div v-for="ev in stats?.recent_events" :key="ev.id" class="flex gap-3 items-center p-2 hover:bg-zinc-50 rounded-xl">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">🎉</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-zinc-900 truncate">{{ ev.name }}</p>
              <p class="text-xs text-zinc-400 truncate">por {{ ev.user?.name }}</p>
            </div>
            <span class="text-[10px] text-zinc-400 shrink-0">{{ new Date(ev.created_at).toLocaleDateString('es-CL') }}</span>
          </div>
          <p v-if="!stats?.recent_events?.length" class="text-sm text-zinc-400 py-2 text-center">Sin eventos recientes</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCookie, useRouter, useHead, useFetch } from '#imports';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Dashboard Administrativo - Mi Regalo, Tu Fiesta' });

const router = useRouter();
const token = useCookie('auth_token');
const config = useRuntimeConfig();

// Data Fetching for Dashboard Stats
const { data: stats } = await useFetch<any>(`${config.public.apiBase}/api/admin/stats`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

// Chart Processing
const chartDataPrepared = computed(() => {
  if (!stats.value?.chart_data) return [];
  const max = Math.max(...stats.value.chart_data.map((d: any) => d.total), 1);
  return stats.value.chart_data.map((d: any) => {
    const [y, m, day] = d.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, day);
    return {
      ...d,
      percent: (d.total / max) * 100,
      label: dateObj.toLocaleDateString('es-CL', { weekday: 'short' })
    };
  });
});

const formatNumber = (num: number) => {
  if (!num) return '0';
  return new Intl.NumberFormat('es-CL').format(num);
};
</script>
