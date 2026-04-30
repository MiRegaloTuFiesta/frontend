<template>
  <div class="min-h-screen bg-stone-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-2xl font-bold text-primary-800 tracking-tight flex justify-center items-center gap-2">
          <IconsLogoIcon alt="Mi Regalo Tu Fiesta" class="h-auto w-50 text-primary-800" />
        </NuxtLink>
      </div>

      <UiCard class="border-stone-200 shadow-xl shadow-stone-200/50">
        <UiCardHeader v-if="!isSubmitted">
          <UiCardTitle class="text-xl">Olvidé mi Contraseña</UiCardTitle>
          <UiCardDescription>Ingresa tu correo y te enviaremos un enlace de recuperación</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div v-if="isSubmitted" class="text-center py-6 space-y-4">
            <div class="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-stone-900">¡Correo enviado!</h3>
            <p class="text-stone-600 text-sm">Si el correo <strong>{{ email }}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos.</p>
            <UiButton variant="outline" class="w-full mt-6" as="a" href="/login">Volver al Inicio</UiButton>
          </div>

          <form v-else @submit.prevent="submit" class="space-y-4">
            <div class="space-y-2">
              <UiLabel for="email">Correo Electrónico</UiLabel>
              <UiInput id="email" type="email" v-model="email" required placeholder="tu@correo.com" />
            </div>
            
            <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {{ errorMessage }}
            </div>

            <UiButton type="submit" class="w-full bg-primary hover:bg-primary-700 text-white mt-6" :disabled="isLoading">
              {{ isLoading ? 'Enviando...' : 'Enviar Enlace' }}
            </UiButton>
          </form>
        </UiCardContent>
        <UiCardFooter v-if="!isSubmitted" class="justify-center border-t border-stone-100 pt-6">
          <p class="text-sm text-stone-600">
            ¿Recordaste tu contraseña? 
            <NuxtLink to="/login" class="text-primary-600 font-semibold hover:underline">Inicia Sesión</NuxtLink>
          </p>
        </UiCardFooter>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHead } from '#imports';

useHead({ title: 'Recuperar Contraseña - Mi Regalo, Tu Fiesta' });

const email = ref('');
const isLoading = ref(false);
const isSubmitted = ref(false);
const errorMessage = ref('');

const config = useRuntimeConfig();

const submit = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    await $fetch(`${config.public.apiBase}/api/forgot-password`, {
      method: 'POST',
      body: { email: email.value }
    });
    isSubmitted.value = true;
  } catch (err: any) {
    if (err.response?._data?.message) {
      errorMessage.value = err.response._data.message;
    } else {
      errorMessage.value = 'Ocurrió un error. Intenta más tarde.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>
