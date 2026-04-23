<template>
  <div class="space-y-6 animate-in slide-in-from-right duration-500 pb-20">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900">Gestionar Depósitos</h2>
        <p class="text-sm text-zinc-500">Administración financiera y transferencias a creadores</p>
      </div>
      <div class="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
        <span class="text-amber-600 font-bold text-xs uppercase">Días para pago:</span>
        <span class="text-amber-700 font-black">{{ payoutDays || '?' }}</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit ml-2">
      <button 
        @click="activeTab = 'pending'" 
        :class="activeTab === 'pending' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'"
        class="px-6 py-2 rounded-lg text-xs font-black uppercase transition-all"
      >
        Pendientes
      </button>
      <button 
        @click="activeTab = 'history'" 
        :class="activeTab === 'history' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'"
        class="px-6 py-2 rounded-lg text-xs font-black uppercase transition-all"
      >
        Historial
      </button>
    </div>

    <div v-if="pendingPayouts || pendingHistory" class="flex flex-col gap-4">
      <UiSkeleton class="h-24 w-full rounded-2xl" v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="activeTab === 'pending'">
        <div v-if="payouts && payouts.length > 0" class="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-100">
                <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Usuario</th>
                <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-center">Estado / Días</th>
                <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Datos Bancarios</th>
                <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Monto a Depositar</th>
                <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in payouts" :key="p.user_id" class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                <td class="p-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-lg shadow-inner">👤</div>
                    <div>
                      <p class="font-black text-zinc-900 leading-none">{{ p.user_name }}</p>
                      <p class="text-[11px] text-zinc-400 mt-1">{{ p.user_email }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-6 text-center">
                  <div v-if="p.is_delayed" class="inline-flex flex-col items-center">
                    <span class="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-black uppercase border border-rose-200 shadow-sm animate-pulse">Atrasado</span>
                    <span class="text-xs font-bold text-rose-700 mt-1">{{ Math.abs(p.days_remaining) }} días de retraso</span>
                  </div>
                  <div v-else class="inline-flex flex-col items-center">
                    <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase border border-emerald-200">A tiempo</span>
                    <span class="text-xs font-bold text-emerald-700 mt-1">Faltan {{ p.days_remaining }} días</span>
                  </div>
                </td>
                <td class="p-6">
                  <div v-if="p.bank_details" class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-black uppercase text-zinc-400 font-black">Banco:</span>
                        <span class="text-xs font-bold text-zinc-700">{{ p.bank_details.bank_name }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-black uppercase text-zinc-400">RUT:</span>
                        <span class="text-xs font-bold text-zinc-700">{{ p.bank_details.bank_rut || 'N/A' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-black uppercase text-zinc-400">Nro:</span>
                        <span class="text-xs font-black text-primary-600 tracking-wider">{{ p.bank_details.account_number }}</span>
                    </div>
                  </div>
                </td>
                <td class="p-6 text-right">
                  <p class="text-lg font-black text-zinc-900 leading-tight">{{ formatCurrency(p.total_pending) }}</p>
                  <p class="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Ya depositado: {{ formatCurrency(p.total_deposited) }}</p>
                </td>
                <td class="p-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="openDetails(p)" class="p-2 text-zinc-400 hover:text-zinc-900 transition-colors" title="Ver detalle de aportes">
                        📄
                    </button>
                    <UiButton @click="openConfirmModal(p)" class="bg-zinc-900 text-white font-black text-[10px] h-9 px-4 rounded-xl hover:bg-zinc-800 shadow-lg shadow-zinc-200/50 uppercase">Pagar</UiButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-zinc-100 border-dashed">
          <div class="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-3xl mb-4">✨</div>
          <p class="text-zinc-500 font-bold">No hay depósitos pendientes</p>
        </div>
    </div>

    <div v-else-if="activeTab === 'history'">
        <div v-if="history && history.length > 0" class="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-100">
                <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Fecha Depósito</th>
                <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Usuario</th>
                <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Cuenta</th>
                <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Monto Total</th>
                <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in history" :key="h.user_id + h.deposited_at" class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                <td class="p-6">
                    <p class="text-sm font-bold text-zinc-900">{{ h.deposited_at }}</p>
                </td>
                <td class="p-6 text-xs font-bold text-zinc-600">{{ h.user_name }}</td>
                <td class="p-6">
                    <p class="text-[10px] font-bold text-zinc-400 leading-tight uppercase">{{ h.bank_details?.bank_name }}</p>
                    <p class="text-xs font-black text-primary-600">{{ h.bank_details?.account_number }}</p>
                </td>
                <td class="p-6 text-right">
                  <p class="text-md font-black text-emerald-700">{{ formatCurrency(h.total_deposited) }}</p>
                </td>
                <td class="p-6 text-right">
                    <button @click="openDetails(h)" class="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                        🔍 Ver Aportes
                    </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-20 bg-white rounded-3xl border border-zinc-100 border-dashed">
            <p class="text-zinc-400 font-bold text-sm">Aún no se han registrado depósitos históricos</p>
        </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showingDetails" class="fixed inset-0 z-[70] bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[80vh] animate-in zoom-in duration-300">
            <div class="p-6 border-b border-zinc-50 bg-zinc-50/50 flex items-center justify-between">
                <div>
                    <h3 class="font-black text-zinc-900 uppercase tracking-widest text-xs">Desglose de Depósito</h3>
                    <p class="text-xs text-zinc-500 font-bold mt-1">{{ showingDetails.user_name }} • {{ activeTab === 'history' ? showingDetails.deposited_at : 'Pendiente' }}</p>
                </div>
                <button @click="showingDetails = null" class="text-zinc-400 hover:text-zinc-900 text-2xl">✕</button>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-50">
                            <th class="pb-2">Evento</th>
                            <th class="pb-2">Regalo / Deseo</th>
                            <th class="pb-2">Invitado</th>
                            <th class="pb-2 text-right">Monto Neto</th>
                        </tr>
                    </thead>
                    <tbody class="text-xs font-bold">
                        <tr v-for="d in showingDetails.details" :key="d.id" class="border-b border-zinc-50/50">
                            <td class="py-3 text-zinc-400 uppercase text-[9px]">{{ d.event_name }}</td>
                            <td class="py-3 text-zinc-800">{{ d.wish_name }}</td>
                            <td class="py-3 text-zinc-500">{{ d.donor_name }}</td>
                            <td class="py-3 text-right text-emerald-700">{{ formatCurrency(d.amount) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="p-6 bg-zinc-900 text-white flex justify-between items-center">
                <span class="text-[10px] font-bold uppercase text-zinc-400">Total Desglosado:</span>
                <span class="text-xl font-black">{{ formatCurrency(activeTab === 'history' ? showingDetails.total_deposited : showingDetails.total_pending) }}</span>
            </div>
        </div>
    </div>

    <!-- Confirm Payout Modal -->
    <div v-if="selectedPayout" class="fixed inset-0 z-[60] bg-zinc-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-zinc-100 animate-in zoom-in duration-300">
        <div class="p-8 border-b border-zinc-50 bg-zinc-50/50 text-center">
            <div class="w-16 h-16 bg-white rounded-2xl shadow-sm text-3xl flex items-center justify-center mx-auto mb-4 border border-zinc-100">💸</div>
            <h3 class="text-xl font-black text-zinc-900">Confirmar Depósito</h3>
            <p class="text-sm text-zinc-500">¿Ya realizaste la transferencia bancaria?</p>
        </div>
        <div class="p-8 space-y-6">
            <div class="bg-zinc-900 text-white p-6 rounded-2xl flex items-center justify-between shadow-xl shadow-zinc-900/20">
                <div>
                    <p class="text-[10px] font-bold uppercase text-zinc-400">Total a transferir</p>
                    <p class="text-2xl font-black">{{ formatCurrency(selectedPayout.total_pending) }}</p>
                </div>
                <div class="text-right">
                    <p class="text-[10px] font-bold uppercase text-zinc-400">Usuario</p>
                    <p class="text-xs font-black truncate max-w-[120px]">{{ selectedPayout.user_name }}</p>
                </div>
            </div>

            <div v-if="selectedPayout.bank_details" class="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2">
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center mb-1">Destino</p>
                <div class="flex justify-between text-xs">
                    <span class="text-zinc-400">Banco:</span>
                    <span class="font-bold text-zinc-800">{{ selectedPayout.bank_details.bank_name }}</span>
                </div>
                <div class="flex justify-between text-xs">
                    <span class="text-zinc-400">RUT:</span>
                    <span class="font-bold text-zinc-800">{{ selectedPayout.bank_details.bank_rut }}</span>
                </div>
                <div class="flex justify-between text-xs">
                    <span class="text-zinc-400">Número:</span>
                    <span class="font-black text-primary-600">{{ selectedPayout.bank_details.account_number }}</span>
                </div>
            </div>

            <div class="flex flex-col gap-3 pt-4">
                <UiButton @click="confirmPayout" class="w-full h-12 bg-zinc-900 text-white font-black rounded-xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200" :disabled="isConfirming">
                    {{ isConfirming ? 'Procesando...' : 'Sí, Transferencia Realizada' }}
                </UiButton>
                <UiButton @click="selectedPayout = null" variant="ghost" class="w-full h-10 text-zinc-400 font-bold hover:text-zinc-900">Cancelar</UiButton>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useCookie, useRuntimeConfig, useFetch } from '#imports';

definePageMeta({ layout: 'admin' });

const token = useCookie('auth_token');
const config = useRuntimeConfig();
const activeTab = ref('pending');

// Data Fetching
const { data: payouts, refresh, pending: pendingPayouts } = await useFetch<any>(`${config.public.apiBase}/api/admin/payouts`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const { data: history, refresh: refreshHistory, pending: pendingHistory } = await useFetch<any>(`${config.public.apiBase}/api/admin/payouts/history`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const { data: settings } = await useFetch<any>(`${config.public.apiBase}/api/settings/public`);
const payoutDays = computed(() => settings.value?.payout_days || '3');

// UI State
const selectedPayout = ref<any>(null);
const showingDetails = ref<any>(null);
const isConfirming = ref(false);

const openConfirmModal = (p: any) => { selectedPayout.value = p; };
const openDetails = (p: any) => { showingDetails.value = p; };

const confirmPayout = async () => {
    if (!selectedPayout.value) return;
    isConfirming.value = true;
    try {
        await $fetch(`${config.public.apiBase}/api/admin/payouts/${selectedPayout.value.user_id}/complete`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token.value}` },
            body: { 
                contribution_ids: selectedPayout.value.contribution_ids,
                manual_payment_ids: selectedPayout.value.manual_payment_ids 
            }
        });
        selectedPayout.value = null;
        await refresh();
        await refreshHistory();
    } catch (err) {
        console.error(err);
        alert('Error al confirmar depósito');
    } finally {
        isConfirming.value = false;
    }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};
</script>
