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
                    <div class="cursor-pointer group/user" @click="showingUserModal = p">
                      <p class="font-black text-zinc-900 leading-none group-hover/user:text-primary-600 transition-colors">{{ p.user_name }}</p>
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
                        <div class="flex flex-col">
                          <span class="text-xs font-bold text-zinc-700">{{ p.bank_details.bank_name }}</span>
                          <span class="text-[9px] font-black text-primary-600 uppercase leading-none">{{ p.bank_details.account_type || 'N/A' }}</span>
                        </div>
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
                <td class="p-6 text-xs font-bold text-zinc-600 cursor-pointer hover:text-zinc-900" @click="showingUserModal = h">{{ h.user_name }}</td>
                <td class="p-6">
                    <p class="text-[10px] font-bold text-zinc-400 leading-tight uppercase">{{ h.bank_details?.bank_name }}</p>
                    <p class="text-[9px] font-black text-zinc-500 uppercase leading-none mb-1">{{ h.bank_details?.account_type || 'N/A' }}</p>
                    <p class="text-xs font-black text-primary-600">{{ h.bank_details?.account_number }}</p>
                </td>
                <td class="p-6 text-right">
                  <p class="text-md font-black text-emerald-700">{{ formatCurrency(h.total_deposited) }}</p>
                </td>
                <td class="p-6 text-right space-x-2">
                    <button v-if="h.payout_proof_url" @click="viewProof(h.payout_proof_url)" class="p-2 text-primary-600 hover:text-primary-800 transition-colors" title="Ver Comprobante">
                        🖼️
                    </button>
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
        <div class="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
            <div class="p-6 border-b border-zinc-50 bg-zinc-50/50 flex items-center justify-between">
                <div>
                    <h3 class="font-black text-zinc-900 uppercase tracking-widest text-xs">Desglose de Depósito</h3>
                    <p class="text-xs text-zinc-500 font-bold mt-1">{{ showingDetails.user_name }} • {{ activeTab === 'history' ? showingDetails.deposited_at : 'Pendiente' }}</p>
                </div>
                <button @click="closeDetails" class="text-zinc-400 hover:text-zinc-900 text-2xl">✕</button>
            </div>
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
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

                <!-- Proof Management Section (history only) -->
                <div v-if="activeTab === 'history'" class="border-t border-zinc-100 pt-6">
                    <p class="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">Comprobante de Transferencia</p>

                    <!-- Has proof -->
                    <div v-if="showingDetails.payout_proof_url && !editProofPreview" class="flex items-center gap-4">
                        <a :href="showingDetails.payout_proof_url" target="_blank" class="block flex-shrink-0">
                            <img :src="showingDetails.payout_proof_url" class="w-24 h-20 object-cover rounded-xl border border-zinc-200 shadow-sm hover:opacity-80 transition-opacity" />
                        </a>
                        <div class="flex flex-col gap-2">
                            <a :href="showingDetails.payout_proof_url" target="_blank" class="text-xs font-bold text-primary-600 hover:underline">🔗 Ver comprobante completo</a>
                            <label class="text-xs font-bold text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors">
                                <input type="file" @change="onEditProofChange" accept="image/*" class="hidden" />
                                ✏️ Cambiar comprobante
                            </label>
                            <button @click="deleteProof" :disabled="isUpdatingProof" class="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors text-left">
                                {{ isUpdatingProof ? 'Eliminando...' : '🗑️ Eliminar comprobante' }}
                            </button>
                        </div>
                    </div>

                    <!-- Editing: new file selected -->
                    <div v-else-if="editProofPreview" class="space-y-3">
                        <div class="relative rounded-2xl overflow-hidden h-40 border-2 border-primary-300">
                            <img :src="editProofPreview" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex gap-3">
                            <UiButton @click="saveProof" :disabled="isUpdatingProof" class="flex-1 h-10 bg-zinc-900 text-white font-black text-xs rounded-xl">
                                {{ isUpdatingProof ? 'Guardando...' : '✔ Guardar Comprobante' }}
                            </UiButton>
                            <UiButton @click="editProofFile = null; editProofPreview = null" variant="ghost" class="h-10 text-xs text-zinc-400">
                                Cancelar
                            </UiButton>
                        </div>
                    </div>

                    <!-- No proof -->
                    <div v-else class="relative group h-28 w-full border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-colors overflow-hidden">
                        <input type="file" @change="onEditProofChange" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <span class="text-2xl mb-1">📸</span>
                        <span class="text-[10px] font-bold text-zinc-500 uppercase">Adjuntar Comprobante</span>
                    </div>
                </div>
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
                    <div class="text-right">
                      <p class="font-bold text-zinc-800 leading-none">{{ selectedPayout.bank_details.bank_name }}</p>
                      <p class="text-[9px] font-black text-primary-600 uppercase mt-0.5">{{ selectedPayout.bank_details.account_type || 'N/A' }}</p>
                    </div>
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

            <!-- Upload Proof Area -->
            <div class="space-y-3">
                <label class="text-[10px] font-black uppercase text-zinc-400 tracking-widest block text-center">Adjuntar Comprobante (Opcional)</label>
                <div class="relative group h-32 w-full border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-colors overflow-hidden">
                    <input type="file" @change="onProofChange" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <template v-if="!proofPreview">
                        <span class="text-2xl mb-1">📸</span>
                        <span class="text-[10px] font-bold text-zinc-500 uppercase">Subir Imagen</span>
                    </template>
                    <template v-else>
                        <img :src="proofPreview" class="w-full h-full object-cover" />
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="text-white text-[10px] font-black uppercase tracking-widest">Cambiar</span>
                        </div>
                    </template>
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

    <!-- User Details Modal -->
    <div v-if="showingUserModal" class="fixed inset-0 z-[80] bg-zinc-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-zinc-100 animate-in zoom-in duration-300">
            <div class="p-10 text-center relative">
                <button @click="showingUserModal = null" class="absolute top-6 right-6 text-zinc-300 hover:text-zinc-900 transition-colors">✕</button>
                
                <div class="w-24 h-24 rounded-full bg-zinc-50 border-4 border-white shadow-xl mx-auto flex items-center justify-center text-4xl mb-6">👤</div>
                
                <h3 class="text-2xl font-black text-zinc-900 leading-tight">{{ showingUserModal.user_name }}</h3>
                <p class="text-zinc-400 font-bold text-sm tracking-wide">{{ showingUserModal.user_email }}</p>
                
                <div class="mt-8 grid grid-cols-1 gap-4 text-left">
                    <div class="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <span class="text-[10px] font-black uppercase text-zinc-400 block mb-1">Teléfono</span>
                        <p class="text-sm font-bold text-zinc-800">{{ showingUserModal.user_phone || 'No registrado' }}</p>
                    </div>

                    <div v-if="showingUserModal.bank_details" class="p-6 bg-primary-900 text-white rounded-3xl shadow-xl shadow-primary-900/20 space-y-4">
                        <span class="text-[10px] font-black uppercase text-primary-300 block">Datos de Transferencia</span>
                        
                        <div class="flex justify-between border-b border-white/10 pb-3">
                            <span class="text-primary-400 text-xs font-bold">Banco</span>
                            <span class="font-black text-sm">{{ showingUserModal.bank_details.bank_name }}</span>
                        </div>

                        <div class="flex justify-between border-b border-white/10 pb-3">
                            <span class="text-primary-400 text-xs font-bold">Tipo</span>
                            <span class="font-black text-sm">{{ showingUserModal.bank_details.account_type }}</span>
                        </div>

                        <div class="flex justify-between border-b border-white/10 pb-3">
                            <span class="text-primary-400 text-xs font-bold">Número</span>
                            <span class="font-black text-sm tracking-widest">{{ showingUserModal.bank_details.account_number }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-primary-400 text-xs font-bold">RUT</span>
                            <span class="font-black text-sm">{{ showingUserModal.bank_details.bank_rut }}</span>
                        </div>
                    </div>
                    <div v-else class="p-6 bg-amber-50 text-amber-700 rounded-3xl border border-amber-100 text-center">
                        <p class="text-sm font-bold">El usuario no ha registrado datos bancarios todavía.</p>
                    </div>
                </div>

                <UiButton @click="showingUserModal = null" class="mt-8 w-full h-12 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800">Cerrar</UiButton>
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
const showingUserModal = ref<any>(null);
const isConfirming = ref(false);

const payoutProofFile = ref<File | null>(null);
const proofPreview = ref<string | null>(null);

const onProofChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
        payoutProofFile.value = file;
        proofPreview.value = URL.createObjectURL(file);
    }
};

const openConfirmModal = (p: any) => { 
    selectedPayout.value = p; 
    payoutProofFile.value = null;
    proofPreview.value = null;
};

const editProofFile = ref<File | null>(null);
const editProofPreview = ref<string | null>(null);
const isUpdatingProof = ref(false);

const closeDetails = () => {
    showingDetails.value = null;
    editProofFile.value = null;
    editProofPreview.value = null;
};

const openDetails = (p: any) => { 
    showingDetails.value = p;
    editProofFile.value = null;
    editProofPreview.value = null;
};

const onEditProofChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
        editProofFile.value = file;
        editProofPreview.value = URL.createObjectURL(file);
    }
};

const saveProof = async () => {
    if (!showingDetails.value || !editProofFile.value) return;
    isUpdatingProof.value = true;
    try {
        const formData = new FormData();
        formData.append('contribution_ids', JSON.stringify(showingDetails.value.contribution_ids ?? []));
        formData.append('manual_payment_ids', JSON.stringify(showingDetails.value.manual_payment_ids ?? []));
        formData.append('payout_proof', editProofFile.value);
        const res: any = await $fetch(`${config.public.apiBase}/api/admin/payouts/update-proof`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/json' },
            body: formData
        });
        showingDetails.value.payout_proof_url = res.payout_proof_url;
        editProofFile.value = null;
        editProofPreview.value = null;
        await refreshHistory();
    } catch (err) {
        console.error(err);
        alert('Error al guardar el comprobante');
    } finally {
        isUpdatingProof.value = false;
    }
};

const deleteProof = async () => {
    if (!showingDetails.value) return;
    if (!confirm('¿Eliminar el comprobante? Esta acción no se puede deshacer.')) return;
    isUpdatingProof.value = true;
    try {
        const formData = new FormData();
        formData.append('contribution_ids', JSON.stringify(showingDetails.value.contribution_ids ?? []));
        formData.append('manual_payment_ids', JSON.stringify(showingDetails.value.manual_payment_ids ?? []));
        formData.append('delete_proof', '1');
        await $fetch(`${config.public.apiBase}/api/admin/payouts/update-proof`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/json' },
            body: formData
        });
        showingDetails.value.payout_proof_url = null;
        await refreshHistory();
    } catch (err) {
        console.error(err);
        alert('Error al eliminar el comprobante');
    } finally {
        isUpdatingProof.value = false;
    }
};

const confirmPayout = async () => {
    if (!selectedPayout.value) return;
    isConfirming.value = true;
    try {
        const formData = new FormData();
        formData.append('contribution_ids', JSON.stringify(selectedPayout.value.contribution_ids));
        formData.append('manual_payment_ids', JSON.stringify(selectedPayout.value.manual_payment_ids));
        
        if (payoutProofFile.value) {
            formData.append('payout_proof', payoutProofFile.value);
        }

        await $fetch(`${config.public.apiBase}/api/admin/payouts/${selectedPayout.value.user_id}/complete`, {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${token.value}`,
                'Accept': 'application/json'
            },
            body: formData
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

const viewProof = (url: string) => {
    window.open(url, '_blank');
};
</script>
