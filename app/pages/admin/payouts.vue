<template>
  <div class="space-y-6 animate-in slide-in-from-right duration-500 pb-20">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900">Gestionar Depósitos</h2>
        <p class="text-sm text-zinc-500">Usuarios con saldo pendiente por transferir a sus cuentas bancarias</p>
      </div>
      <div class="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
        <span class="text-amber-600 font-bold">Días para pago:</span>
        <span class="text-amber-700 font-black">{{ payoutDays || '?' }}</span>
      </div>
    </div>

    <div v-if="pendingPayouts" class="flex flex-col gap-4">
      <UiSkeleton class="h-24 w-full rounded-2xl" v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="payouts.length > 0" class="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
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
                    <span class="text-[10px] font-black uppercase text-zinc-400">Banco:</span>
                    <span class="text-xs font-bold text-zinc-700">{{ p.bank_details.bank_name }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-black uppercase text-zinc-400">Tipo:</span>
                    <span class="text-xs font-bold text-zinc-700">{{ p.bank_details.account_type }}</span>
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
              <div v-else class="py-2 px-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2">
                <span class="text-lg">⚠️</span>
                <span class="text-[10px] font-bold text-amber-700 leading-tight uppercase">Sin datos registrados</span>
              </div>
            </td>
            <td class="p-6 text-right">
              <p class="text-lg font-black text-zinc-900">{{ formatCurrency(p.total_pending) }}</p>
              <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Neto acumulado</p>
            </td>
            <td class="p-6 text-right">
              <UiButton @click="openConfirmModal(p)" class="bg-zinc-900 text-white font-black text-xs h-10 px-6 rounded-xl hover:bg-zinc-800 shadow-lg shadow-zinc-200/50">Marcar Pago</UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-zinc-100 border-dashed">
      <div class="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-3xl mb-4">✨</div>
      <p class="text-zinc-500 font-bold">No hay depósitos pendientes por realizar</p>
      <p class="text-zinc-400 text-xs mt-1">¡Buen trabajo! Estás al día con tus creadores.</p>
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
                <div class="text-center">
                    <p class="text-[10px] font-bold uppercase text-zinc-400">Usuario</p>
                    <p class="text-xs font-bold">{{ selectedPayout.user_name }}</p>
                </div>
            </div>

            <div v-if="selectedPayout.bank_details" class="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2">
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center mb-1">Destino</p>
                <div class="flex justify-between text-xs">
                    <span class="text-zinc-400">Banco:</span>
                    <span class="font-bold text-zinc-800">{{ selectedPayout.bank_details.bank_name }}</span>
                </div>
                <div class="flex justify-between text-xs">
                    <span class="text-zinc-400">Cuenta:</span>
                    <span class="font-bold text-zinc-800">{{ selectedPayout.bank_details.account_type }}</span>
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

            <p class="text-[10px] text-zinc-400 text-center italic px-4 leading-relaxed">
                Al confirmar, el usuario verá que este saldo ha sido depositado y se registrará la fecha de hoy como fecha de transferencia.
            </p>

            <div class="flex flex-col gap-3 pt-4">
                <UiButton @click="confirmPayout" class="w-full h-12 bg-zinc-900 text-white font-black rounded-xl hover:bg-zinc-800 transition-all" :disabled="isConfirming">
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
import { ref } from 'vue';
import { useCookie, useRuntimeConfig, useFetch } from '#imports';

definePageMeta({ layout: 'admin' });

const token = useCookie('auth_token');
const config = useRuntimeConfig();

const { data: payouts, refresh, pending: pendingPayouts } = await useFetch<any>(`${config.public.apiBase}/api/admin/payouts`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const { data: settings } = await useFetch<any>(`${config.public.apiBase}/api/settings/public`);
const payoutDays = settings.value?.payout_days || '3';

const selectedPayout = ref<any>(null);
const isConfirming = ref(false);

const openConfirmModal = (p: any) => {
    selectedPayout.value = p;
};

const confirmPayout = async () => {
    if (!selectedPayout.value) return;
    isConfirming.value = true;
    try {
        await $fetch(`${config.public.apiBase}/api/admin/payouts/${selectedPayout.value.user_id}/complete`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token.value}` },
            body: { contribution_ids: selectedPayout.value.contribution_ids }
        });
        selectedPayout.value = null;
        await refresh();
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
