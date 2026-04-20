<template>
  <div class="min-h-screen bg-stone-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-2xl font-bold text-primary-800 tracking-tight flex justify-center items-center gap-2">
          Mi Regalo, Tu Fiesta
        </NuxtLink>
        <p class="text-stone-500 mt-2">Verificación de cuenta requerida</p>
      </div>

      <UiCard class="border-stone-200 shadow-xl shadow-stone-200/50">
        <UiCardHeader>
          <UiCardTitle class="text-xl">Verifica tu Correo</UiCardTitle>
          <UiCardDescription>Debes verificar tu dirección de correo electrónico para usar todas las funciones de la plataforma.</UiCardDescription>
        </UiCardHeader>
        <UiCardContent class="space-y-6">
          <div v-if="verified" class="p-4 bg-green-50 text-green-700 rounded-lg text-sm flex items-start gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="font-bold">¡Tu correo ha sido verificado!</p>
              <p class="mt-1">Ya puedes acceder a todas las funciones de tu cuenta.</p>
            </div>
          </div>

          <div v-if="isVerifying" class="text-center py-6 space-y-4">
            <div class="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto animate-spin">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p class="text-stone-600 font-medium">Verificando tu cuenta...</p>
          </div>

          <div v-else-if="verifyError" class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {{ verifyError }}
          </div>

          <div v-else-if="!verified" class="text-center py-4 space-y-4">
            <div class="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-stone-600">
              Hemos enviado un enlace de verificación a tu correo. Por favor, revisa tu bandeja de entrada y haz clic en el botón para activar tu cuenta.
            </p>
          </div>

          <div v-if="resent" class="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm text-center">
            Se ha enviado un nuevo enlace de verificación a tu correo.
          </div>

          <UiButton v-if="verified" @click="goToDashboard" class="w-full bg-primary">
            Ir al Dashboard
          </UiButton>
          
          <div v-else class="space-y-3">
            <UiButton @click="resendEmail" class="w-full bg-primary hover:bg-primary-700 text-white" :disabled="isLoading">
              {{ isLoading ? 'Enviando...' : 'Reenviar Correo de Verificación' }}
            </UiButton>
            <UiButton @click="logout" variant="ghost" class="w-full text-stone-500">
              Cerrar Sesión
            </UiButton>
          </div>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter, useHead, useCookie } from '#imports';

useHead({ title: 'Verificar Correo - Mi Regalo, Tu Fiesta' });

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const token = useCookie('auth_token');

const isLoading = ref(false);
const resent = ref(false);
const verified = ref(false);
const isVerifying = ref(false);
const verifyError = ref('');

onMounted(async () => {
  // Case 1: Coming back from backend redirect with ?verified=1
  const isAlreadyVerified = route.query.verified === '1' || route.query['amp;verified'] === '1';
  if (isAlreadyVerified) {
    verified.value = true;
    return;
  }

  // Case 2: Coming from email link with ?verify_url=...
  const verifyUrl = (route.query.verify_url || route.query['amp;verify_url']) as string;
  if (verifyUrl) {
    isVerifying.value = true;
    try {
      // Navigate the browser to the backend signed URL — it will validate and redirect back
      window.location.href = verifyUrl;
    } catch (err) {
      verifyError.value = 'Error al verificar tu correo. El enlace puede haber expirado.';
      isVerifying.value = false;
    }
  }
});

const resendEmail = async () => {
  isLoading.value = true;
  resent.value = false;
  
  try {
    await $fetch(`${config.public.apiBase}/api/email/resend`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    resent.value = true;
  } catch (err: any) {
    console.error('Error resending verification:', err);
  } finally {
    isLoading.value = false;
  }
}

const logout = async () => {
  try {
    await $fetch(`${config.public.apiBase}/api/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    token.value = null;
    router.push('/login');
  }
}

const goToDashboard = () => {
  // Hard refresh to reload user state with verified status
  window.location.href = '/dashboard';
}
</script>
