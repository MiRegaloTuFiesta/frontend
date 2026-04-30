<template>
  <div class="animate-in slide-in-from-right duration-500 space-y-6">
    <!-- Buscador -->
    <div class="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-wrap items-center gap-4">
      <div class="relative flex-1 min-w-[300px]">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">🔍</span>
        <UiInput v-model="searchQuery" placeholder="Buscar por nombre, UUID o creador..." class="pl-10 h-11" />
      </div>
      
      <!-- Filtro Categoría -->
      <div class="flex flex-col gap-1 min-w-[150px]">
        <label class="text-[10px] font-bold text-zinc-400 uppercase">Categoría</label>
        <select v-model="filterCategory" class="px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          <option value="">Todas</option>
          <option value="uncategorized">Sin Categoría</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <!-- Filtro Ciudad -->
      <div class="flex flex-col gap-1 min-w-[150px]">
        <label class="text-[10px] font-bold text-zinc-400 uppercase">Ciudad</label>
        <select v-model="filterCity" class="px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          <option value="">Todas</option>
          <option v-for="city in cities" :key="city.id" :value="city.id">{{ city.name }}</option>
        </select>
      </div>

      <!-- Filtro Servicio -->
      <div v-if="globalSettings?.enable_internal_service === '1'" class="flex flex-col gap-1 min-w-[150px]">
        <label class="text-[10px] font-bold text-zinc-400 uppercase">Servicio</label>
        <select v-model="filterService" class="px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          <option value="all">Todo</option>
          <option value="yes">Con Servicio</option>
          <option value="no">Sin Servicio</option>
        </select>
      </div>

      <div v-if="pending" class="text-zinc-400 animate-spin text-xl self-end mb-2">🔄</div>
    </div>

    <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-zinc-50 border-b border-zinc-100">
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Evento y UUID</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Creador</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Meta / Recaudado</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Estado</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="evt in events" :key="evt.id" class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
            <td class="p-6">
              <p class="font-bold text-zinc-900">{{ evt.name }}</p>
              <p v-if="evt.city" class="text-[10px] text-primary-600 font-bold uppercase tracking-wider">📍 {{ evt.city.name }}</p>
              <div v-if="evt.requests_internal_service" class="mt-1 text-[9px] inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold uppercase tracking-tight">
                🔧 Pide Servicio
              </div>
              <p class="text-[10px] text-zinc-400 font-mono">{{ evt.uuid }}</p>
            </td>
            <td class="p-6">
              <p class="text-sm font-semibold text-zinc-700">{{ evt.user?.name }}</p>
              <p class="text-xs text-zinc-400">{{ evt.user?.email }}</p>
            </td>
            <td class="p-6">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-zinc-900">${{ formatNumber(evt.total_price) }}</span>
                <span class="text-xs text-zinc-400">/</span>
                <span class="text-sm font-bold text-primary-600">${{ formatNumber(evt.collected_amount) }}</span>
              </div>
            </td>
            <td class="p-6">
              <span 
                :class="{
                  'bg-amber-100 text-amber-700': evt.status === 'pending',
                  'bg-green-100 text-green-700': evt.status === 'approved',
                  'bg-rose-100 text-rose-700': evt.status === 'rejected'
                }" 
                class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              >
                {{ evt.status === 'pending' ? 'Borrador / Pendiente' : (evt.status === 'approved' ? 'Aprobado y Activo' : 'Rechazado') }}
              </span>
            </td>
            <td class="p-6 text-right">
              <div class="flex items-center justify-end gap-2">
                <UiButton 
                  v-if="evt.status === 'approved'"
                  as="a" 
                  :href="'/evento/' + evt.uuid" 
                  target="_blank" 
                  size="sm" 
                  variant="outline" 
                  class="font-bold flex items-center gap-2"
                >
                  <span class="hidden md:inline">Compartir lista de deseos</span><span class="md:hidden">Compartir</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </UiButton>
                <UiButton @click="openApprovalModal(evt)" size="sm" variant="secondary" class="font-bold">Gestionar</UiButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Gestionar Evento -->
    <div v-if="isApprovalModalOpen && selectedEvent" class="fixed inset-0 z-[60] bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[90vh]">
        <div class="p-8 border-b border-zinc-50 flex justify-between items-center shrink-0">
          <div>
            <h3 class="text-xl font-bold text-zinc-900">Gestionar Evento</h3>
            <p class="text-sm text-zinc-400">{{ selectedEvent.name }}</p>
          </div>
          <button @click="closeApprovalModal" class="text-zinc-300 hover:text-zinc-900 text-2xl transition-colors">&times;</button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-zinc-100 px-8 bg-zinc-50/50 shrink-0">
          <button 
            @click="activeTab = 'config'" 
            :class="activeTab === 'config' ? 'border-primary-600 text-primary-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'"
            class="py-4 px-6 border-b-2 font-bold text-sm transition-all"
          >
            ⚙️ Configuración
          </button>
          <button 
            v-if="globalSettings?.enable_manual_payments === '1' || manualPaymentsSum > 0"
            @click="activeTab = 'payments'" 
            :class="activeTab === 'payments' ? 'border-primary-600 text-primary-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'"
            class="py-4 px-6 border-b-2 font-bold text-sm transition-all flex items-center gap-2"
          >
            💰 Abonos Manuales
            <span v-if="manualPaymentsSum > 0" class="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-[10px]">
              ${{ formatNumber(manualPaymentsSum) }}
            </span>
          </button>
          <button 
            @click="activeTab = 'transfers'" 
            :class="activeTab === 'transfers' ? 'border-amber-600 text-amber-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'"
            class="py-4 px-6 border-b-2 font-bold text-sm transition-all flex items-center gap-2"
          >
            🏦 Transferencias
            <span v-if="pendingTransfers?.length > 0" class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px]">
              {{ pendingTransfers.length }}
            </span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-8">
          <!-- Tab: Configuración -->
          <form v-if="activeTab === 'config'" @submit.prevent="approveEvent" class="space-y-6">
            <div class="bg-primary-50 p-6 rounded-2xl border border-primary-100">
              <h4 class="text-primary-800 font-bold text-sm mb-2 flex items-center gap-2">
                <span class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                Estado del Evento
              </h4>
              <p class="text-xs text-primary-600 leading-relaxed">Este evento requiere una meta total para activarse. El creador verá el progreso contra este valor.</p>
            </div>

            <div class="space-y-3">
              <UiLabel for="totalPrice" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Meta de Recaudación (CLP)</UiLabel>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">$</span>
                <UiInput id="totalPrice" type="number" v-model="approvalForm.total_price" class="pl-8 h-12 text-lg font-bold" placeholder="Ej: 500000" required />
              </div>
              <p v-if="manualPaymentsSum > 0" class="text-[10px] text-emerald-600 font-bold italic mt-2">
                * Tienes {{ formatNumber(manualPaymentsSum) }} en abonos manuales registrados. Estos se depositarán al anfitrión como un ingreso adicional y no restan de esta meta de recaudación.
              </p>
            </div>


            <div v-if="globalSettings?.enable_internal_service === '1' || selectedEvent.requests_internal_service" class="p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
              <h4 class="text-amber-800 font-bold text-sm flex items-center gap-2">
                🔧 Gestión de Servicio Interno
              </h4>
              
              <div v-if="globalSettings?.enable_internal_service === '1'" class="space-y-3">
                <UiLabel for="serviceCost" class="text-amber-700 font-bold uppercase text-[10px] tracking-widest">Valor por el Servicio (CLP)</UiLabel>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-amber-400">$</span>
                  <UiInput id="serviceCost" type="number" v-model="approvalForm.service_cost" class="pl-8 h-10 border-amber-200 focus:ring-amber-500" placeholder="Ej: 150000" />
                </div>
              </div>
              <div v-else class="space-y-1">
                <p class="text-xs font-bold text-amber-800">Costo del Servicio: ${{ formatNumber(selectedEvent.service_cost) }}</p>
                <p class="text-[10px] text-amber-600 italic">(Configuración global deshabilitada para nuevos servicios)</p>
              </div>

              <div v-if="globalSettings?.enable_internal_service === '1'" class="flex items-center gap-2">
                <input type="checkbox" id="addsToTotal" v-model="approvalForm.service_adds_to_total" class="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
                <UiLabel for="addsToTotal" class="text-xs font-bold text-amber-800 cursor-pointer">Sumar al valor del evento</UiLabel>
              </div>

              <div v-if="approvalForm.service_cost > 0" class="pt-2 border-t border-amber-100 mt-2">
                <div class="flex justify-between text-xs">
                  <span class="text-amber-600 font-medium uppercase tracking-tighter">Abonado al servicio:</span>
                  <span class="text-amber-800 font-bold">${{ formatNumber(servicePaymentsSum) }}</span>
                </div>
                <div class="flex justify-between text-xs mt-1">
                  <span class="text-amber-600 font-medium uppercase tracking-tighter">Pendiente servicio:</span>
                  <span class="text-amber-800 font-black">${{ formatNumber(approvalForm.service_cost - servicePaymentsSum) }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <UiLabel for="adminAssigned" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Ejecutivo Asignado</UiLabel>
              <select id="adminAssigned" v-model="approvalForm.assigned_admin_id" class="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none">
                <option :value="null">Sin asignar</option>
                <option v-for="admin in adminsList" :key="admin.id" :value="admin.id">{{ admin.name }}</option>
              </select>
            </div>

            <div class="space-y-3">
              <UiLabel for="adminNotes" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Notas del Administrador (Solo para Creador)</UiLabel>
              <textarea 
                id="adminNotes" 
                v-model="approvalForm.admin_notes" 
                placeholder="Escribe un mensaje o recomendación para el creador del evento..."
                class="w-full h-32 p-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              ></textarea>
            </div>
            
            <div class="pt-4 flex gap-3">
              <UiButton type="submit" class="flex-1 h-12 bg-zinc-900 text-white hover:bg-primary-600 rounded-xl font-bold transition-all" :disabled="isSubmitting">
                {{ isSubmitting ? 'Procesando...' : (selectedEvent.status === 'pending' ? 'Aprobar y Publicar' : 'Guardar Cambios') }}
              </UiButton>
              
              <UiButton 
                v-if="selectedEvent.status !== 'rejected'"
                type="button" 
                @click="rejectEvent"
                variant="outline"
                class="flex-1 h-12 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-all" 
                :disabled="isSubmitting"
              >
                Rechazar Evento
              </UiButton>
            </div>
          </form>

          <!-- Tab: Abonos Manuales -->
          <div v-if="activeTab === 'payments'" class="space-y-8">
            <!-- Formulario Nuevo Abono -->
            <div v-if="globalSettings?.enable_manual_payments === '1'" class="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
              <h4 class="font-bold text-zinc-800 text-sm">Registrar Nuevo Abono</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <UiLabel class="text-[10px] uppercase tracking-wider text-zinc-400">Monto (CLP)</UiLabel>
                  <UiInput type="number" v-model="manualPaymentForm.amount" placeholder="Ej: 50000" class="h-10" />
                </div>
                <div class="space-y-2">
                  <UiLabel class="text-[10px] uppercase tracking-wider text-zinc-400">Descripción</UiLabel>
                  <UiInput v-model="manualPaymentForm.description" placeholder="Ej: Pago en efectivo" class="h-10" />
                </div>
              </div>
              <div v-if="selectedEvent.requests_internal_service" class="space-y-2">
                <UiLabel class="text-[10px] uppercase tracking-wider text-zinc-400">Destino del Abono</UiLabel>
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="event" v-model="manualPaymentForm.type" class="w-4 h-4 text-primary-600" />
                    <span class="text-xs font-bold text-zinc-700">Al Evento</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="service" v-model="manualPaymentForm.type" class="w-4 h-4 text-amber-600" />
                    <span class="text-xs font-bold text-zinc-700">Al Servicio</span>
                  </label>
                </div>
              </div>
              <UiButton @click="storeManualPayment" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold h-10" :disabled="isStoringPayment">
                {{ isStoringPayment ? 'Guardando...' : 'Agregar Abono Manual' }}
              </UiButton>
              <p class="text-[10px] text-zinc-400 italic text-center">Se enviará un correo de notificación al creador.</p>
            </div>
            <div v-else-if="manualPayments?.length > 0" class="p-4 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-700 italic text-center">
              ⚠️ Los abonos manuales están deshabilitados globalmente. Solo se muestra el historial.
            </div>

            <!-- Listado Histórico -->
            <div class="space-y-4">
              <h4 class="font-bold text-zinc-800 text-sm flex justify-between">
                Historial de Abonos
                <span class="text-zinc-400 font-medium">{{ manualPayments?.length || 0 }} registros</span>
              </h4>
              
              <div v-if="isLoadingPayments" class="space-y-3">
                <UiSkeleton v-for="i in 3" :key="i" class="h-16 w-full rounded-xl" />
              </div>
              
              <div v-else-if="manualPayments?.length > 0" class="space-y-3">
                <div v-for="pay in manualPayments" :key="pay.id" class="p-4 border border-zinc-100 rounded-xl flex justify-between items-center hover:bg-zinc-50 transition-colors">
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="font-bold text-zinc-900">${{ formatNumber(pay.amount) }}</p>
                      <span v-if="pay.type === 'service'" class="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black uppercase">Servicio</span>
                    </div>
                    <p class="text-xs text-zinc-500">{{ pay.description }}</p>
                  </div>
                  <p class="text-[10px] text-zinc-400 font-medium">{{ new Date(pay.created_at).toLocaleDateString('es-CL') }}</p>
                </div>
              </div>
              
              <div v-else class="text-center py-10 border border-dashed border-zinc-200 rounded-2xl">
                <p class="text-xs text-zinc-400">No hay abonos registrados para este evento.</p>
              </div>
            </div>
          </div>

          <!-- Tab: Transferencias Bancarias -->
          <div v-if="activeTab === 'transfers'" class="space-y-6">
            <div class="p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-[11px] text-amber-700 leading-tight">
              Acepta los aportes realizados por transferencia bancaria tras confirmar el depósito en la cuenta del comercio. Esto marcará el deseo como completado.
            </div>

            <div v-if="isLoadingTransfers" class="space-y-3">
              <UiSkeleton v-for="i in 2" :key="i" class="h-24 w-full rounded-xl" />
            </div>

            <div v-else-if="pendingTransfers?.length > 0" class="space-y-4">
              <div v-for="trf in pendingTransfers" :key="trf.id" class="p-5 border border-zinc-100 rounded-2xl bg-white shadow-sm flex flex-col gap-4">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{{ trf.wish?.name }}</p>
                    <p class="text-lg font-black text-zinc-900">${{ formatNumber(trf.amount) }}</p>
                  </div>
                  <div class="text-right text-[10px] text-zinc-400 font-medium">
                    {{ new Date(trf.created_at).toLocaleDateString('es-CL') }}
                  </div>
                </div>
                
                <div class="bg-zinc-50 p-3 rounded-lg flex items-center justify-between">
                  <div class="text-xs">
                    <p class="font-bold text-zinc-700">{{ trf.donor_name }}</p>
                    <p class="text-zinc-500">{{ trf.email }} • {{ trf.rut }}</p>
                  </div>
                  <UiButton @click="approveBankTransfer(trf.id)" size="sm" class="bg-amber-600 hover:bg-amber-700 text-white font-bold h-8">
                    Aprobar Depósito
                  </UiButton>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12 border border-dashed border-zinc-200 rounded-3xl">
              <p class="text-xs text-zinc-400">No hay transferencias pendientes para este evento.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCookie, useRuntimeConfig, useFetch } from '#imports';
import { refDebounced } from '@vueuse/core';

definePageMeta({ layout: 'admin' });

const token = useCookie('auth_token');
const config = useRuntimeConfig();

const { data: globalSettings } = await useFetch<any>(`${config.public.apiBase}/api/admin/settings`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const searchQuery = ref('');
const debouncedSearch = refDebounced(searchQuery, 400);

const filterCategory = ref('');
const filterCity = ref('');
const filterService = ref('all');

const { data: events, refresh: refreshEvents, pending } = await useFetch<any>(`${config.public.apiBase}/api/events`, {
  headers: { Authorization: `Bearer ${token.value}` },
  query: { 
    search: debouncedSearch,
    category_id: filterCategory,
    city_id: filterCity,
    requested_service: filterService
  },
  watch: [debouncedSearch, filterCategory, filterCity, filterService]
});

const { data: categories } = await useFetch<any>(`${config.public.apiBase}/api/categories`);
const { data: cities } = await useFetch<any>(`${config.public.apiBase}/api/cities`);

const { data: adminsList } = await useFetch<any>(`${config.public.apiBase}/api/admin/users`, {
  headers: { Authorization: `Bearer ${token.value}` },
  query: { role: 'admin' }
});

const isApprovalModalOpen = ref(false);
const selectedEvent = ref<any>(null);
const isSubmitting = ref(false);
const activeTab = ref('config');
const approvalForm = ref({ 
  total_price: 0, 
  admin_notes: '', 
  assigned_admin_id: null as number | null,
  service_cost: 0,
  service_adds_to_total: false
});

// Manual Payments State
const manualPayments = ref<any[]>([]);
const pendingTransfers = ref<any[]>([]);
const isLoadingPayments = ref(false);
const isLoadingTransfers = ref(false);
const isStoringPayment = ref(false);
const manualPaymentForm = ref({ amount: '', description: '', type: 'event' });

const manualPaymentsSumTotal = computed(() => {
  return manualPayments.value.reduce((acc, curr) => acc + curr.amount, 0);
});

const eventPaymentsSum = computed(() => {
  return manualPayments.value.filter(p => p.type === 'event').reduce((acc, curr) => acc + curr.amount, 0);
});

const servicePaymentsSum = computed(() => {
  return manualPayments.value.filter(p => p.type === 'service').reduce((acc, curr) => acc + curr.amount, 0);
});

const manualPaymentsSum = computed(() => {
  return eventPaymentsSum.value; // For the tab badge, we might want just event payments or total. Let's show event.
});

const openApprovalModal = async (evt: any) => {
  selectedEvent.value = evt;
  approvalForm.value = { 
    total_price: evt.total_price || 0,
    admin_notes: evt.admin_notes || '',
    assigned_admin_id: evt.assigned_admin_id || null,
    service_cost: evt.service_cost || 0,
    service_adds_to_total: evt.service_adds_to_total || false
  };
  activeTab.value = 'config';
  isApprovalModalOpen.value = true;
  
  // Load payments & transfers
  loadManualPayments();
  loadPendingTransfers();
};

const loadManualPayments = async () => {
  if (!selectedEvent.value) return;
  isLoadingPayments.value = true;
  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/admin/events/${selectedEvent.value.id}/manual-payments`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    manualPayments.value = res;
  } catch (err) {
    console.error('Error loading payments', err);
  } finally {
    isLoadingPayments.value = false;
  }
};

const loadPendingTransfers = async () => {
  if (!selectedEvent.value) return;
  isLoadingTransfers.value = true;
  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/admin/events/${selectedEvent.value.id}/pending-transfers`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    pendingTransfers.value = res;
  } catch (err) {
    console.error('Error loading transfers', err);
  } finally {
    isLoadingTransfers.value = false;
  }
};

const approveBankTransfer = async (id: number) => {
  if (!confirm('¿Confirmas que el dinero ha sido recibido exitosamente?')) return;
  try {
    await $fetch(`${config.public.apiBase}/api/admin/contributions/${id}/approve-transfer`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    await loadPendingTransfers();
    await refreshEvents();
  } catch (err) {
    console.error(err);
    alert('Error al aprobar la transferencia');
  }
};

const storeManualPayment = async () => {
  if (!manualPaymentForm.value.amount || !manualPaymentForm.value.description) return;
  isStoringPayment.value = true;
  try {
    await $fetch(`${config.public.apiBase}/api/admin/events/${selectedEvent.value.id}/manual-payments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: manualPaymentForm.value
    });
    manualPaymentForm.value = { amount: '', description: '', type: 'event' };
    await loadManualPayments();
    await refreshEvents(); // Update the main table list
  } catch (err) {
    console.error(err);
    alert('Error al registrar el abono');
  } finally {
    isStoringPayment.value = false;
  }
};

const closeApprovalModal = () => {
  isApprovalModalOpen.value = false;
  selectedEvent.value = null;
  manualPayments.value = [];
};

const rejectEvent = async () => {
  if (!selectedEvent.value) return;
  
  const motive = prompt('Por favor, ingresa el motivo del rechazo (se mostrará al creador):', approvalForm.value.admin_notes);
  if (motive === null) return; // User cancelled
  
  isSubmitting.value = true;
  try {
    await $fetch(`${config.public.apiBase}/api/events/${selectedEvent.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { 
        status: 'rejected', 
        admin_notes: motive,
        total_price: selectedEvent.value.total_price || 0 // Keep current price
      }
    });
    closeApprovalModal();
    await refreshEvents();
  } catch (err) {
    console.error(err);
    alert('Error al rechazar el evento');
  } finally {
    isSubmitting.value = false;
  }
};

const approveEvent = async () => {
  if (!selectedEvent.value || approvalForm.value.total_price < 0) return;
  isSubmitting.value = true;
  try {
    await $fetch(`${config.public.apiBase}/api/events/${selectedEvent.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { 
        status: 'approved', 
        total_price: approvalForm.value.total_price,
        admin_notes: approvalForm.value.admin_notes,
        assigned_admin_id: approvalForm.value.assigned_admin_id,
        service_cost: approvalForm.value.service_cost,
        service_adds_to_total: approvalForm.value.service_adds_to_total
      }
    });
    closeApprovalModal();
    await refreshEvents();
  } catch (err) {
    console.error(err);
    alert('Error al actualizar el evento');
  } finally {
    isSubmitting.value = false;
  }
};

const formatNumber = (num: number) => {
  if (!num) return '0';
  return new Intl.NumberFormat('es-CL').format(num);
};
</script>
