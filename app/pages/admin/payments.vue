<template>
  <div class="space-y-8 animate-in slide-in-from-right duration-500">
     <!-- Filtros y Controles -->
     <div class="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-bold text-zinc-400 uppercase">Inicio</label>
            <input type="date" v-model="paymentFilters.start_date" class="px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-bold text-zinc-400 uppercase">Fin</label>
            <input type="date" v-model="paymentFilters.end_date" class="px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div class="flex flex-col gap-1 min-w-[200px]">
            <label class="text-[10px] font-bold text-zinc-400 uppercase">Creador</label>
            <select v-model="paymentFilters.user_id" class="px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option :value="null">Todos los creadores</option>
              <option v-for="user in creators" :key="user.id" :value="user.id">{{ user.name }} ({{ user.email }})</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-bold text-zinc-400 uppercase">Concepto</label>
            <select v-model="paymentFilters.payment_type" class="px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option value="all">Todo</option>
              <option value="automatic">Aportes Invitados (Flow/MP)</option>
              <option value="manual_event">Abonos a Evento</option>
              <option value="manual_service">Abonos a Servicio</option>
            </select>
          </div>
          <div class="flex flex-col gap-1 min-w-[150px]">
            <label class="text-[10px] font-bold text-zinc-400 uppercase">Categoría</label>
            <select v-model="paymentFilters.category_id" class="px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option :value="null">Todas</option>
              <option value="uncategorized">Sin Categoría</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1 min-w-[150px]">
            <label class="text-[10px] font-bold text-zinc-400 uppercase">Ciudad</label>
            <select v-model="paymentFilters.city_id" class="px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option :value="null">Todas</option>
              <option v-for="city in cities" :key="city.id" :value="city.id">{{ city.name }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1 min-w-[120px]">
            <label class="text-[10px] font-bold text-zinc-400 uppercase">Servicio</label>
            <select v-model="paymentFilters.requested_service" class="px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option value="all">Todo</option>
              <option value="yes">Con Servicio</option>
              <option value="no">Sin Servicio</option>
            </select>
          </div>
          <div class="flex items-end h-full gap-2 pt-5">
            <UiButton @click="setQuickPeriod(7)" variant="ghost" size="sm" class="text-xs">7D</UiButton>
            <UiButton @click="setQuickPeriod('month')" variant="ghost" size="sm" class="text-xs">Mes</UiButton>
            <UiButton @click="setQuickPeriod('all')" variant="ghost" size="sm" class="text-xs">Todo</UiButton>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UiButton @click="refreshPayments" :disabled="pendingPayments" variant="outline" size="sm" class="gap-2">
            <span :class="{'animate-spin': pendingPayments}">🔄</span> Refrescar
          </UiButton>
        </div>
     </div>

     <!-- Cards KPIs Periodo -->
     <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm bg-gradient-to-br from-white to-zinc-50">
          <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Bruto</p>
          <p class="text-2xl font-extrabold text-zinc-900">${{ formatNumber(paymentsResponse?.stats?.total_gross) }}</p>
          <p class="text-[10px] text-zinc-500 mt-2">{{ paymentsResponse?.stats?.count }} transacciones</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Comisión Plataforma</p>
          <p class="text-2xl font-extrabold text-emerald-600">${{ formatNumber(paymentsResponse?.stats?.total_platform_fee) }}</p>
          <p class="text-[10px] text-emerald-500/70 mt-2">Utilidad para el sitio</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Comisión Pasarela</p>
          <p class="text-2xl font-extrabold text-zinc-500">${{ formatNumber(paymentsResponse?.stats?.total_gateway_fee) }}</p>
          <p class="text-[10px] text-zinc-400 mt-2">Costo Flow / MP + IVA</p>
        </div>
        <div class="p-6 rounded-2xl border border-zinc-100 shadow-sm bg-primary-900 text-white">
          <p class="text-[10px] font-bold text-primary-300 uppercase tracking-widest mb-1">Neto a Transferir</p>
          <p class="text-2xl font-extrabold">${{ formatNumber(paymentsResponse?.stats?.total_net) }}</p>
          <p class="text-[10px] text-primary-400 mt-2">Monto final para anfitriones</p>
        </div>
     </div>

     <!-- Gráfico Contable -->
     <div class="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
        <div class="flex justify-between items-center mb-8">
          <h3 class="font-bold text-zinc-900">Análisis Contable del Periodo (Bruto vs Neto)</h3>
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-primary-500 rounded-sm"></div>
              <span class="text-xs text-zinc-500 font-bold">Monto Bruto</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-zinc-300 rounded-sm"></div>
              <span class="text-xs text-zinc-500 font-bold">Monto Neto</span>
            </div>
          </div>
        </div>
        
        <div v-if="processedPaymentChartData.length > 0" class="h-64 flex items-end gap-2 border-b border-zinc-100 pb-2">
          <div v-for="day in processedPaymentChartData" :key="day.date" class="flex-1 h-full flex flex-col justify-end items-center group relative">
            
            <!-- Barra Bruta (Fondo) -->
            <div 
              class="bg-zinc-100 group-hover:bg-primary-50 w-full rounded-t-lg transition-all absolute bottom-0 left-0" 
              :style="{ height: day.percent + '%' }"
            ></div>

            <!-- Barra Neta (Frente) -->
            <div 
              class="bg-primary-500 group-hover:bg-primary-600 w-full rounded-t-lg transition-all relative z-10" 
              :style="{ height: day.netPercent + '%' }"
            >
              <!-- Tooltip -->
              <div class="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white whitespace-nowrap bg-zinc-900 px-2 py-1 rounded shadow-xl transition-all z-20">
                 B: ${{ formatNumber(day.total) }} / N: ${{ formatNumber(day.net) }}
              </div>
            </div>
            
            <span class="text-[10px] text-zinc-400 mt-2 font-bold absolute -bottom-6">{{ day.label }}</span>
          </div>
        </div>
        <div v-else class="h-64 flex items-center justify-center text-zinc-400 italic">
          No hay datos para graficar en este periodo
        </div>
        <div class="h-6"></div>
     </div>

     <!-- Tabla Detallada -->
     <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
       <table class="w-full text-left">
         <thead>
           <tr class="bg-zinc-50 border-b border-zinc-100">
             <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Donante / Evento</th>
             <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Monto Bruto</th>
             <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Comisiones</th>
             <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Neto Anfitrión</th>
             <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Método</th>
             <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Fecha</th>
           </tr>
         </thead>
         <tbody v-if="!pendingPayments">
           <tr v-for="p in paymentsResponse?.data" :key="p.id" class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors" :class="{'opacity-75 bg-amber-50/20': p.type === 'manual_service'}">
             <td class="p-6">
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-bold text-zinc-900">{{ p.donor_name }}</p>
                  <span v-if="p.type === 'automatic'" class="bg-blue-100 text-blue-700 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Flow/MP</span>
                  <span v-else-if="p.type === 'manual_event'" class="bg-primary-100 text-primary-700 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Abono Evento</span>
                  <span v-else-if="p.type === 'manual_service'" class="bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Abono Servicio</span>
                </div>
                <p class="text-[10px] text-zinc-400 truncate w-32">{{ p.event_name }}</p>
             </td>
             <td class="p-6 text-zinc-900 font-bold">${{ formatNumber(p.amount) }}</td>
             <td class="p-6">
                <div v-if="p.type === 'automatic'" class="text-[11px] text-zinc-500">
                  <span class="text-emerald-600">P: ${{ formatNumber(p.platform_fee) }}</span><br/>
                  <span class="text-zinc-400">G: ${{ formatNumber(p.gateway_fee) }}</span>
                </div>
                <div v-else class="text-[10px] text-zinc-400 italic">Sin comisiones</div>
             </td>
             <td class="p-6">
                <span v-if="p.type !== 'manual_service'" class="bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-sm font-extrabold">
                  ${{ formatNumber(p.net_to_user) }}
                </span>
                <span v-else class="text-zinc-300 text-xs strike-through italic">No aplica</span>
             </td>
             <td class="p-6">
                <span class="bg-zinc-100 px-2 py-1 rounded text-[10px] font-bold uppercase text-zinc-600">{{ p.payment_method }}</span>
             </td>
             <td class="p-6 text-zinc-500 text-xs italic">{{ new Date(p.created_at).toLocaleDateString('es-CL') }}</td>
           </tr>
         </tbody>
       </table>
       <div v-if="pendingPayments" class="p-12 flex justify-center">
          <span class="animate-spin text-2xl">🔄</span>
       </div>
       <div v-if="!pendingPayments && paymentsResponse?.data?.length === 0" class="p-12 text-center text-zinc-400 italic">
          No hay transacciones registradas en este periodo.
       </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCookie, useRuntimeConfig, useFetch } from '#imports';

definePageMeta({ layout: 'admin' });

const token = useCookie('auth_token');
const config = useRuntimeConfig();

const paymentFilters = ref({
  start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0],
  user_id: null as number | null,
  payment_type: 'all',
  category_id: null as string | number | null,
  city_id: null as number | null,
  requested_service: 'all'
});

const { data: categories } = await useFetch<any>(`${config.public.apiBase}/api/categories`);
const { data: cities } = await useFetch<any>(`${config.public.apiBase}/api/cities`);

const { data: creators } = await useFetch<any>(`${config.public.apiBase}/api/admin/users`, {
  headers: { Authorization: `Bearer ${token.value}` },
  query: { role: 'creator' }
});

const { data: paymentsResponse, refresh: refreshPayments, pending: pendingPayments } = await useFetch<any>(`${config.public.apiBase}/api/admin/payments`, {
  headers: { Authorization: `Bearer ${token.value}` },
  query: paymentFilters,
  watch: [paymentFilters]
});

const setQuickPeriod = (days: number | string) => {
  const end = new Date();
  let start = new Date();
  
  if (days === 'month') {
    start = new Date(end.getFullYear(), end.getMonth(), 1);
  } else if (typeof days === 'number') {
    start.setDate(end.getDate() - days);
  } else {
    paymentFilters.value.start_date = '';
    paymentFilters.value.end_date = '';
    return;
  }
  
  paymentFilters.value.start_date = start.toISOString().split('T')[0];
  paymentFilters.value.end_date = end.toISOString().split('T')[0];
};

const processedPaymentChartData = computed(() => {
  if (!paymentsResponse.value?.chart_data) return [];
  const entries = Object.entries(paymentsResponse.value.chart_data);
  if (entries.length === 0) return [];
  
  const max = Math.max(...entries.map(([_, val]: any) => val.total), 1);
  
  return entries.map(([date, val]: any) => {
    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return {
      date,
      total: val.total,
      net: val.net,
      percent: (val.total / max) * 100,
      netPercent: (val.net / max) * 100,
      label: dateObj.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
});

const formatNumber = (num: number) => {
  if (!num) return '0';
  return new Intl.NumberFormat('es-CL').format(num);
};
</script>
