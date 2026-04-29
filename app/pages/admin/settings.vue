<template>
  <div class="animate-in slide-in-from-right duration-500 max-w-2xl">
    <div class="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
      <h3 class="text-xl font-bold text-zinc-900 mb-6">Parámetros de Comisiones y Pagos</h3>
      
      <form @submit.prevent="saveSettings" class="space-y-8">
        
        <!-- Habilitadores de Pago (Top) -->
        <div class="space-y-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
          <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-200 pb-2 mb-4">Medios de Pago Disponibles</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" v-model="settingsForm.enable_flow" true-value="1" false-value="0" class="w-5 h-5 rounded border-zinc-300 text-primary-600 focus:ring-primary-500" />
              <div class="flex flex-col">
                <span class="text-sm font-bold text-zinc-700 group-hover:text-primary-600 transition-colors">Flow.cl</span>
                <span class="text-[10px] text-zinc-400">Tarjetas / Webpay</span>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" v-model="settingsForm.enable_mp" true-value="1" false-value="0" class="w-5 h-5 rounded border-zinc-300 text-primary-600 focus:ring-primary-500" />
              <div class="flex flex-col">
                <span class="text-sm font-bold text-zinc-700 group-hover:text-primary-600 transition-colors">Mercado Pago</span>
                <span class="text-[10px] text-zinc-400">Checkout Pro</span>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" v-model="settingsForm.enable_transfer" true-value="1" false-value="0" class="w-5 h-5 rounded border-zinc-300 text-amber-600 focus:ring-amber-500" />
              <div class="flex flex-col">
                <span class="text-sm font-bold text-zinc-700 group-hover:text-amber-600 transition-colors">Transferencia</span>
                <span class="text-[10px] text-zinc-400">Manual / Directo</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Configuracion Base -->
        <div class="space-y-4">
          <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">Configuración General de Costos</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <UiLabel>Comisión Plataforma (%)</UiLabel>
              <UiInput type="number" step="0.1" v-model="settingsForm.platform_fee_percent" />
            </div>
            <div class="space-y-2">
              <UiLabel>Impuesto IVA (%)</UiLabel>
              <UiInput type="number" step="1" v-model="settingsForm.iva_percent" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <UiLabel>Monto Mínimo de Aporte (CLP)</UiLabel>
              <UiInput type="number" v-model="settingsForm.min_contribution_amount" />
            </div>
            <div class="space-y-2">
              <UiLabel>Días para el pago (Depósitos)</UiLabel>
              <UiInput type="number" v-model="settingsForm.payout_days" placeholder="Ej: 3" />
            </div>
          </div>
        </div>

        <!-- Seccion Flow -->
        <div v-if="settingsForm.enable_flow === '1'" class="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">Configuración: Flow.cl</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <UiLabel>Comisión Variable (%)</UiLabel>
              <UiInput type="number" step="0.01" v-model="settingsForm.flow_fee_percent" />
            </div>
            <div class="space-y-2">
              <UiLabel>Cargo Fijo (CLP)</UiLabel>
              <UiInput type="number" v-model="settingsForm.flow_fee_fixed" />
            </div>
          </div>
        </div>

        <!-- Seccion MP -->
        <div v-if="settingsForm.enable_mp === '1'" class="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">Configuración: Mercado Pago</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <UiLabel>Comisión Variable (%)</UiLabel>
              <UiInput type="number" step="0.01" v-model="settingsForm.mp_fee_percent" />
            </div>
            <div class="space-y-2">
              <UiLabel>Cargo Fijo (CLP)</UiLabel>
              <UiInput type="number" v-model="settingsForm.mp_fee_fixed" />
            </div>
          </div>
        </div>

        <!-- Seccion Transferencia -->
        <div v-if="settingsForm.enable_transfer === '1'" class="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">Configuración: Transferencia Bancaria</h4>
          <div class="space-y-2">
            <UiLabel>Datos para Depósito / Transferencia</UiLabel>
            <textarea 
              v-model="settingsForm.transfer_bank_details" 
              placeholder="Banco, Tipo Cuenta, Número, RUT, Email de contacto..."
              class="w-full h-32 p-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            ></textarea>
            <p class="text-[10px] text-zinc-400 italic">Esta información se mostrará al aportante al seleccionar este medio.</p>
          </div>
        </div>

        <div class="pt-6 border-t border-zinc-100 flex justify-between items-center">
           <p v-if="settingsMessage" class="text-sm font-bold text-emerald-600">{{ settingsMessage }}</p>
           <div v-else></div>
           <UiButton type="submit" class="bg-zinc-900 text-white" :disabled="isSavingSettings">
             {{ isSavingSettings ? 'Guardando...' : 'Guardar Configuraciones' }}
           </UiButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCookie, useRuntimeConfig, useFetch } from '#imports';

definePageMeta({ layout: 'admin' });

const token = useCookie('auth_token');
const config = useRuntimeConfig();

const { data: settingsData } = await useFetch<any>(`${config.public.apiBase}/api/admin/settings`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const isSavingSettings = ref(false);
const settingsMessage = ref('');
const settingsForm = ref({
  platform_fee_percent: '0',
  iva_percent: '0',
  min_contribution_amount: '1000',
  flow_fee_percent: '0',
  flow_fee_fixed: '0',
  mp_fee_percent: '0',
  mp_fee_fixed: '0',
  enable_flow: '1',
  enable_mp: '1',
  enable_transfer: '0',
  transfer_bank_details: '',
  payout_days: '3'
});

watch(settingsData, (val) => {
  if (val) {
    settingsForm.value = { ...val };
  }
}, { immediate: true });

const saveSettings = async () => {
  isSavingSettings.value = true;
  settingsMessage.value = '';
  try {
    await $fetch(`${config.public.apiBase}/api/admin/settings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: settingsForm.value
    });
    settingsMessage.value = 'Configuraciones guardadas!';
    setTimeout(() => { settingsMessage.value = ''; }, 3000);
  } catch (err) {
    console.error(err);
    alert('Error al guardar configuraciones');
  } finally {
    isSavingSettings.value = false;
  }
};
</script>
