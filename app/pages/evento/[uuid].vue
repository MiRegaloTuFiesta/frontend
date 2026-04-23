<template>
  <div class="min-h-screen bg-stone-50 pb-20">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary/10 mb-8">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="text-xl font-bold text-primary-800 tracking-tight flex items-center gap-2">
          Mi Regalo, Tu Fiesta
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 max-w-4xl cursor-default">
      <!-- Loading State -->
      <div v-if="pending" class="space-y-8">
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center">
          <UiSkeleton class="h-10 w-3/4 mb-4 rounded-lg" />
          <UiSkeleton class="h-6 w-1/2 mb-8 rounded-lg" />
          <UiSkeleton class="h-4 w-full rounded-full" />
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <UiCard v-for="i in 4" :key="i" class="border-stone-100 shadow-sm">
            <UiCardHeader>
              <UiSkeleton class="h-6 w-1/2 mb-2" />
              <UiSkeleton class="h-4 w-3/4" />
            </UiCardHeader>
            <UiCardContent>
              <UiSkeleton class="h-10 w-full mt-4 rounded-lg" />
            </UiCardContent>
          </UiCard>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 text-red-800 p-8 rounded-2xl text-center shadow-sm">
        <h2 class="text-2xl font-bold mb-2">Evento no encontrado</h2>
        <p>El enlace podría ser inválido o el evento ya no está disponible.</p>
      </div>

      <!-- Page Content -->
      <div v-else-if="event" class="fade-in space-y-8">
        
        <!-- Vista superior del Evento -->
        <div class="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 text-center relative overflow-hidden">
          <div class="absolute top-0 right-0 -z-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
          
          <span class="inline-block px-4 py-1.5 bg-primary-100 text-primary-800 font-medium rounded-full text-sm mb-6 uppercase tracking-wider relative z-10">
            Nuestra Lista de Deseos
          </span>
          <h1 class="text-4xl md:text-5xl font-extrabold text-stone-900 mb-4 tracking-tight relative z-10">
            {{ event.name }}
          </h1>
          <p class="text-stone-500 font-medium text-lg relative z-10">
            {{ new Date(event.date + 'T12:00:00').toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
          <p v-if="event.is_location_public && event.city" class="text-primary-600 font-bold mt-2 relative z-10 flex items-center justify-center gap-1">
            <span>📍</span>
            {{ event.city.name }}{{ event.address ? ', ' + event.address : '' }}
          </p>
          
          <div class="mt-10 p-6 bg-stone-50 rounded-2xl border border-stone-100 max-w-xl mx-auto relative z-10">
            <div class="flex justify-between items-end mb-3">
              <div>
                <span class="text-sm font-medium text-stone-500 uppercase tracking-wider">Recaudado</span>
                <p class="text-3xl font-bold text-primary-700 mt-1">${{ formatNumber(totalCurrentAmount) }}</p>
              </div>
              <div v-if="event.total_price > 0" class="text-right">
                <span class="text-sm font-medium text-stone-500 uppercase tracking-wider">Meta</span>
                <p class="text-xl font-bold text-stone-400 mt-1">${{ formatNumber(event.total_price) }}</p>
              </div>
            </div>
            <!-- Interactive Progress Bar -->
            <UiProgress v-if="event.total_price > 0" :model-value="globalProgress" class="h-3 bg-stone-200" />
            <p v-if="event.total_price > 0" class="text-right text-xs font-semibold text-primary-600 mt-2">{{ globalProgress.toFixed(0) }}% Financiado</p>
          </div>
        </div>

        <!-- Section Deseos -->
        <div>
          <h2 class="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            Regalos y Experiencias
          </h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UiCard v-for="wish in event.wishes" :key="wish.id" class="border-stone-100 shadow-md hover:shadow-lg transition-all group overflow-hidden relative">
              
              <!-- Check completed -->
              <div v-if="wish.status === 'completed'" class="absolute right-[-30px] top-[20px] bg-primary-500 text-white text-xs font-bold py-1 w-[120px] text-center rotate-45 z-10 shadow-sm">
                COMPRADO
              </div>
              
              <UiCardHeader>
                <UiCardTitle class="text-lg font-bold text-stone-900 line-clamp-1">{{ wish.name }}</UiCardTitle>
                <UiCardDescription class="text-sm text-stone-500 line-clamp-2 min-h-[40px]">{{ wish.description }}</UiCardDescription>
              </UiCardHeader>
              
              <UiCardContent>
                <div class="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-100 group-hover:border-primary-200 transition-colors">
                  <div class="flex justify-between text-sm mb-2 font-medium">
                    <span class="text-primary-700">Aportes hasta ahora:</span>
                    <span class="text-stone-900 font-bold">${{ formatNumber(wish.current_amount) }}</span>
                  </div>
                  <div v-if="wish.status === 'completed' && wish.contributions && wish.contributions.length > 0" class="mt-2 pt-2 border-t border-stone-200">
                    <p class="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Regalado por:</p>
                    <p class="text-xs font-semibold text-primary-800">{{ wish.contributions[0].donor_name }}</p>
                  </div>
                </div>
                
                <!-- Only show checkout button if not completed and event is approved -->
                <div class="mt-6">
                  <UiButton 
                    v-if="wish.status !== 'completed' && event.status === 'approved'"
                    @click="openCheckoutModal(wish)" 
                    class="w-full bg-stone-900 hover:bg-primary-600 text-white transition-colors"
                  >
                    Aportar a este regalo
                  </UiButton>
                  <UiButton v-else-if="wish.status === 'completed'" variant="outline" class="w-full opacity-50 cursor-not-allowed" disabled>
                    Regalo Completado
                  </UiButton>
                </div>
              </UiCardContent>
            </UiCard>
          </div>
        </div>

      </div>

      <!-- Footer: Report Event -->
      <div class="text-center pt-4 pb-2">
        <button @click="isReportModalOpen = true" class="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2 transition-colors">⚐ Reportar este evento</button>
      </div>
    </div>

    <!-- Modal Checkout -->
    <div v-if="isCheckoutModalOpen && selectedWish" class="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl relative my-auto">
        <div class="p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-20">
          <div>
            <span class="text-xs text-stone-500 uppercase tracking-wider font-semibold">Aportar a:</span>
            <h3 class="text-lg font-bold leading-tight">{{ selectedWish.name }}</h3>
          </div>
          <button @click="closeCheckoutModal" class="text-stone-400 hover:text-stone-600 p-2">&times;</button>
        </div>
        
        <form @submit.prevent="submitCheckout" class="p-6 space-y-5">
          <div class="space-y-2">
            <UiLabel for="amount">{{ selectedWish?.liquid_amount > 0 ? 'Valor del regalo (CLP)' : 'Monto que quieres regalar (CLP)' }}</UiLabel>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">$</span>
              <UiInput 
                id="amount" 
                type="number" 
                v-model="checkoutForm.amount" 
                @input="handleAmountChange"
                class="pl-8 text-lg font-bold" 
                :class="{'bg-stone-50': selectedWish?.liquid_amount > 0}"
                placeholder="Ej: 10000" 
                required 
                :disabled="selectedWish?.liquid_amount > 0"
              />
            </div>
            <p v-if="selectedWish?.liquid_amount > 0" class="text-[10px] text-primary-600 font-medium italic">
              * Este regalo tiene un valor fijo definido por los anfitriones.
            </p>
            <p v-else-if="checkoutCalculation?.min_contribution_amount" class="text-[10px] text-stone-500 font-medium">
              * El monto mínimo para aportar es de ${{ formatNumber(checkoutCalculation.min_contribution_amount) }}.
            </p>
          </div>

          <!-- Price Breakdown explanation for the guest -->
          <div v-if="checkoutCalculation" class="p-5 bg-stone-50 rounded-2xl border border-stone-100 space-y-3 animate-in fade-in duration-300">
            <div class="flex justify-between text-xs text-stone-500">
              <span>Monto base del regalo:</span>
              <span class="font-bold">${{ formatNumber(Number(checkoutCalculation.liquid || 0)) }}</span>
            </div>
            <div v-if="checkoutCalculation.platform_fee > 0" class="flex justify-between text-xs text-stone-500">
              <span>Comisión de servicio:</span>
              <span class="font-bold">${{ formatNumber(checkoutCalculation.platform_fee) }}</span>
            </div>
            <div v-if="checkoutCalculation.gateway_fee > 0" class="flex justify-between text-xs text-stone-500">
              <span>Recargo pasarela {{ checkoutForm.gateway === 'mercadopago' ? 'MP' : 'Flow' }}:</span>
              <span class="font-bold">${{ formatNumber(checkoutCalculation.gateway_fee) }}</span>
            </div>
            
            <div class="flex justify-between text-sm pt-3 border-t border-stone-200">
              <span class="font-bold text-stone-700">Total Final a Pagar:</span>
              <span class="font-black text-primary-700 text-lg">${{ formatNumber(checkoutCalculation.gross) }}</span>
            </div>
            <p class="text-[9px] text-stone-400 leading-tight italic mt-2">
              Los cargos adicionales nos permiten asegurar que los anfitriones reciban el monto íntegro de su regalo.
            </p>
          </div>

          <!-- Bank details if transfer selected -->
          <div v-if="checkoutForm.gateway === 'transfer' && publicSettings?.transfer_bank_details" class="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
             <h4 class="text-xs font-bold text-amber-800 uppercase tracking-widest">Datos para Transferencia</h4>
             <p class="text-xs font-semibold text-amber-700 whitespace-pre-wrap">{{ publicSettings.transfer_bank_details }}</p>
             <div class="mt-2 text-[10px] text-amber-600 leading-tight border-t border-amber-200 pt-2 italic">
               * Por favor incluye en el comentario: <br/>
               <span class="font-bold underline text-amber-800">{{ selectedWish.name }} + {{ event.name }} + {{ checkoutForm.donorName || 'Tu Nombre' }}</span>
             </div>
          </div>
          
          <div class="space-y-2">
            <UiLabel for="donorName">Cariñosamente, de parte de:</UiLabel>
            <UiInput id="donorName" v-model="checkoutForm.donorName" placeholder="Tu nombre, familia o grupo" required />
          </div>

          <div class="space-y-2">
            <UiLabel for="rut">RUT (necesario para el comprobante)</UiLabel>
            <UiInput id="rut" v-model="checkoutForm.rut" @blur="formatRutInput" placeholder="12.345.678-9" required />
          </div>
          
          <div class="space-y-2">
            <UiLabel for="email">Correo electrónico (donde recibirás el comprobante)</UiLabel>
            <UiInput id="email" type="email" v-model="checkoutForm.email" placeholder="tu@correo.com" required />
          </div>

          <div class="space-y-3 pt-2">
            <UiLabel>Medio de pago</UiLabel>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label v-if="publicSettings?.enable_flow === '1'" class="border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors" :class="checkoutForm.gateway === 'flow' ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20' : 'border-stone-200 hover:bg-stone-50'">
                <input type="radio" v-model="checkoutForm.gateway" value="flow" @change="handleGatewayChange" class="sr-only" />
                <span class="font-bold text-sm text-stone-700">Flow.cl</span>
              </label>
              <label v-if="publicSettings?.enable_mp === '1'" class="border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors" :class="checkoutForm.gateway === 'mercadopago' ? 'border-[#009EE3] bg-[#009EE3]/10 ring-2 ring-[#009EE3]/20' : 'border-stone-200 hover:bg-stone-50'">
                <input type="radio" v-model="checkoutForm.gateway" value="mercadopago" @change="handleGatewayChange" class="sr-only" />
                <span class="font-bold text-sm text-[#009EE3]">Mercado Pago</span>
              </label>
              <label v-if="publicSettings?.enable_transfer === '1'" class="border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors col-span-full" :class="checkoutForm.gateway === 'transfer' ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20' : 'border-stone-200 hover:bg-stone-50'">
                <input type="radio" v-model="checkoutForm.gateway" value="transfer" @change="handleGatewayChange" class="sr-only" />
                <span class="font-bold text-sm text-amber-700 uppercase tracking-tighter">Transferencia Bancaria</span>
              </label>
            </div>
          </div>

          <div v-if="checkoutError" class="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium">
            {{ checkoutError }}
          </div>

          <div class="pt-6 border-t border-stone-100">
            <UiButton 
              type="submit" 
              class="w-full h-14 text-lg bg-stone-900 hover:bg-primary-600 text-white disabled:opacity-50 disabled:bg-stone-300 disabled:cursor-not-allowed" 
              :disabled="isProcessingCheckout || !checkoutForm.gateway"
            >
              <template v-if="!checkoutForm.gateway">Seleccione medio de pago</template>
              <template v-else-if="isProcessingCheckout">Procesando...</template>
              <template v-else-if="checkoutForm.gateway === 'transfer'">Ya realicé la transferencia</template>
              <template v-else>Ir a Pagar</template>
            </UiButton>
            <p v-if="!checkoutForm.gateway && !pending" class="text-center text-[10px] text-rose-500 font-bold mt-2 uppercase tracking-tight">
              ⚠️ No hay medios de pago disponibles por el momento
            </p>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Éxito -->
    <div v-if="isSuccessModalOpen" class="fixed inset-0 z-[60] bg-primary-900/60 backdrop-blur-md flex justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl my-auto p-8 text-center relative animate-bounce-in">
        <div class="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-stone-900 mb-2">¡Muchas Gracias!</h3>
        <p class="text-stone-600 mb-6">Tu aporte de <span class="font-bold text-primary-700">${{ formatNumber(confirmedAmount) }}</span> ha sido recibido con éxito. Los novios/anfitriones han sido notificados.</p>
        <UiButton @click="isSuccessModalOpen = false" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-6 text-lg rounded-2xl">
          Volver a la lista
        </UiButton>
      </div>
    </div>

    <!-- Modal Reportar Evento -->
    <div v-if="isReportModalOpen" class="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-base font-bold text-stone-900">⚐ Reportar Evento</h3>
          <button @click="closeReportModal" class="text-stone-400 hover:text-stone-600 text-xl">&times;</button>
        </div>
        <div v-if="reportSuccess" class="text-center py-6">
          <p class="text-4xl mb-3">✅</p>
          <p class="font-bold text-stone-800">Reporte enviado</p>
          <p class="text-sm text-stone-500 mt-1">Gracias por tu reporte. Nuestro equipo lo revisará pronto.</p>
          <UiButton @click="closeReportModal" class="mt-4 bg-stone-900 text-white w-full">Cerrar</UiButton>
        </div>
        <form v-else @submit.prevent="submitReport" class="space-y-4">
          <div class="space-y-2">
            <UiLabel for="reportEmail">Tu correo electrónico</UiLabel>
            <UiInput id="reportEmail" type="email" v-model="reportForm.email" placeholder="tu@correo.com" required />
          </div>
          <div class="space-y-2">
            <UiLabel for="reportReason">Motivo del reporte</UiLabel>
            <textarea id="reportReason" v-model="reportForm.reason" rows="3" required placeholder="Describe el motivo..." class="w-full px-3 py-2 rounded-md border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"></textarea>
          </div>
          <p v-if="reportError" class="text-xs text-red-600 font-medium">{{ reportError }}</p>
          <div class="flex gap-3 pt-2">
            <UiButton type="button" variant="outline" @click="closeReportModal" class="flex-1">Cancelar</UiButton>
            <UiButton type="submit" class="flex-1 bg-stone-900 text-white" :disabled="isSubmittingReport">
              {{ isSubmittingReport ? 'Enviando...' : 'Enviar Reporte' }}
            </UiButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useHead } from '#imports';

import { formatRut, validateRut } from '~/utils/rut';

const route = useRoute();
const uuid = route.params.uuid as string;
const config = useRuntimeConfig();

// SSR Data fetching with useFetch against Laravel API
const { data: event, pending, error, refresh } = await useFetch<any>(`${config.public.apiBase}/api/events/${uuid}`);

// Public settings for gateways
const { data: publicSettings } = await useFetch<any>(`${config.public.apiBase}/api/settings/public`);

// Dynamic SEO tags using UseHead
if (event.value) {
  useHead({
    title: `Lista de Regalos: ${event.value.name} - Mi Regalo, Tu Fiesta`,
    meta: [
      { name: 'description', content: `Ayúdanos a financiar nuestra lista de regalos para ${event.value.name}.` }
    ]
  });
}

// Derived computed properties for the total UI
const totalCurrentAmount = computed(() => {
  if (!event.value?.wishes) return 0;
  return event.value.wishes.reduce((acc: number, w: any) => acc + w.current_amount, 0);
});

const globalProgress = computed(() => {
  const effectiveMeta = (event.value?.total_price || 0);
  if (effectiveMeta <= 0) return 0;
  const p = (totalCurrentAmount.value / effectiveMeta) * 100;
  return p > 100 ? 100 : p;
});

// Utility
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-CL').format(num);
}

// Checkout logic
// ─── REPORT EVENT ─────────────────────────────────────────────────────────────
const isReportModalOpen = ref(false);
const reportSuccess = ref(false);
const isSubmittingReport = ref(false);
const reportError = ref('');
const reportForm = ref({ email: '', reason: '' });

const closeReportModal = () => {
  isReportModalOpen.value = false;
  reportSuccess.value = false;
  reportError.value = '';
  reportForm.value = { email: '', reason: '' };
};

const submitReport = async () => {
  reportError.value = '';
  isSubmittingReport.value = true;
  try {
    await $fetch(`${config.public.apiBase}/api/events/${event.value?.uuid}/report`, {
      method: 'POST',
      body: { reporter_email: reportForm.value.email, reason: reportForm.value.reason }
    });
    reportSuccess.value = true;
  } catch (e: any) {
    reportError.value = e.response?._data?.message || 'Error al enviar el reporte. Intenta nuevamente.';
  } finally {
    isSubmittingReport.value = false;
  }
};

const isCheckoutModalOpen = ref(false);
const selectedWish = ref<any>(null);
const isProcessingCheckout = ref(false);
const checkoutError = ref('');

const checkoutForm = ref({
  amount: '',
  donorName: '',
  rut: '',
  email: '',
  gateway: 'flow'
});

const checkoutCalculation = ref<any>(null);

const handleAmountChange = async () => {
  if (checkoutForm.value.amount) {
    try {
      const res: any = await $fetch(`${config.public.apiBase}/api/checkout/calculate`, {
        query: {
          amount: checkoutForm.value.amount,
          gateway: checkoutForm.value.gateway,
          type: 'liquid'
        }
      });
      checkoutCalculation.value = res;
    } catch (e) {
      console.error('Error calculando cargos', e);
    }
  } else {
    checkoutCalculation.value = null;
  }
};

const handleGatewayChange = async () => {
  await handleAmountChange();
};

const openCheckoutModal = async (wish: any) => {
  selectedWish.value = wish;
  
  // Choose default gateway based on what's enabled
  let defaultGateway = '';
  if (publicSettings.value?.enable_flow === '1') defaultGateway = 'flow';
  else if (publicSettings.value?.enable_mp === '1') defaultGateway = 'mercadopago';
  else if (publicSettings.value?.enable_transfer === '1') defaultGateway = 'transfer';

  checkoutForm.value = { 
    amount: wish.liquid_amount > 0 ? String(wish.liquid_amount) : '', 
    donorName: '', 
    rut: '', 
    email: '', 
    gateway: defaultGateway 
  };
  checkoutError.value = '';
  checkoutCalculation.value = null;
  
  if (checkoutForm.value.amount || defaultGateway) {
    await handleAmountChange();
  }
  
  isCheckoutModalOpen.value = true;
};

const closeCheckoutModal = () => {
  isCheckoutModalOpen.value = false;
  selectedWish.value = null;
};

const formatRutInput = () => {
  checkoutForm.value.rut = formatRut(checkoutForm.value.rut);
};

const submitCheckout = async () => {
  checkoutError.value = '';
  if (!validateRut(checkoutForm.value.rut)) {
    checkoutError.value = 'El RUT ingresado no es válido.';
    return;
  }
  
  const finalAmount = checkoutCalculation.value?.gross || parseInt(checkoutForm.value.amount, 10);
    
  if (!finalAmount || finalAmount < (checkoutCalculation.value?.min_contribution_amount || 1000)) {
    checkoutError.value = `El monto mínimo es $${formatNumber(checkoutCalculation.value?.min_contribution_amount || 1000)}.`;
    return;
  }

  isProcessingCheckout.value = true;
  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/checkout`, {
      method: 'POST',
      body: {
        wish_id: selectedWish.value.id,
        donor_name: checkoutForm.value.donorName,
        rut: checkoutForm.value.rut,
        email: checkoutForm.value.email,
        amount: finalAmount,
        gateway: checkoutForm.value.gateway
      }
    });
    
    // Redirect or show success
    if (res.url) {
      window.location.href = res.url;
    } else if (res.method === 'transfer') {
      closeCheckoutModal();
      confirmedAmount.value = finalAmount;
      isSuccessModalOpen.value = true;
      // Note: for transfers, we show the same success modal but the wish won't update until admin approves
    }
  } catch (err: any) {
    console.error(err);
    checkoutError.value = err.response?._data?.message || 'Error al iniciar el pago.';
  } finally {
    isProcessingCheckout.value = false;
  }
};

// Payment Confirmation logic (Token from Flow)
const isSuccessModalOpen = ref(false);
const confirmedAmount = ref(0);

onMounted(async () => {
  // Detect token from URL query
  const token = (route.query.token as string) || new URLSearchParams(window.location.search).get('token');
  console.log('[DEBUG] Flow Token detectado:', token);
  
  if (token) {
    try {
      console.log('[DEBUG] Consultando estado del pago en backend...');
      // Check status with backend
      const res: any = await $fetch(`${config.public.apiBase}/api/checkout/status?token=${token}`);
      console.log('[DEBUG] Respuesta del backend:', res);
      
      if (res && res.status == 2) {
        console.log('[DEBUG] Pago COMPLETADO. Mostrando éxito y refrescando.');
        confirmedAmount.value = res.amount;
        isSuccessModalOpen.value = true;
        // Refresh event data to show blocked wish
        await refresh();
      } else {
        console.log('[DEBUG] El pago no está en estado "Pagada" (2). Estado actual:', res.status);
      }
    } catch (e) {
      console.error('[DEBUG] Error al verificar pago:', e);
    }
  }
});

</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
