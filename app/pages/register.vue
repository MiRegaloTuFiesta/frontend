<template>
  <div class="min-h-screen bg-stone-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-2xl font-bold text-primary-800 tracking-tight flex justify-center items-center gap-2">
          Mi Regalo, Tu Fiesta
        </NuxtLink>
        <p class="text-stone-500 mt-2">Crea tu cuenta gratuita y recibe regalos</p>
      </div>

      <UiCard class="border-stone-200 shadow-xl shadow-stone-200/50">
        <UiCardHeader>
          <UiCardTitle class="text-xl">Registro</UiCardTitle>
          <UiCardDescription>Ingresa tus datos para comenzar</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <form @submit.prevent="register" class="space-y-4">
            <div class="space-y-2">
              <UiLabel for="name">Nombre Completo</UiLabel>
              <UiInput id="name" v-model="form.name" required placeholder="Ej: Juan Pérez" />
            </div>
            <div class="space-y-2">
              <UiLabel for="email">Correo Electrónico</UiLabel>
              <UiInput id="email" type="email" v-model="form.email" required placeholder="tu@correo.com" />
            </div>
            <div class="space-y-2">
              <UiLabel for="password">Contraseña</UiLabel>
              <UiInput id="password" type="password" v-model="form.password" required minlength="8" placeholder="••••••••" />
            </div>
            <div class="space-y-2">
              <UiLabel for="phone">Teléfono Celular (Opcional)</UiLabel>
              <UiInput id="phone" type="tel" v-model="form.phone" placeholder="+56 9 1234 5678" />
            </div>
            
            <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {{ errorMessage }}
            </div>

            <UiButton type="submit" class="w-full bg-primary hover:bg-primary-700 text-white mt-6" :disabled="isLoading">
              {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
            </UiButton>
          </form>
        </UiCardContent>
        <UiCardFooter class="justify-center border-t border-stone-100 pt-6">
          <p class="text-sm text-stone-600">
            ¿Ya tienes cuenta? 
            <NuxtLink to="/login" class="text-primary-600 font-semibold hover:underline">Inicia Sesión</NuxtLink>
          </p>
        </UiCardFooter>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from '#imports';

const router = useRouter();
const cookie = useCookie('auth_token');

// Redirect if already authenticated
if (cookie.value) {
  navigateTo('/dashboard');
}

const form = ref({
  name: '',
  email: '',
  password: '',
  phone: ''
});

const isLoading = ref(false);
const errorMessage = ref('');

const config = useRuntimeConfig();

const register = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response: any = await $fetch(`${config.public.apiBase}/api/register`, {
      method: 'POST',
      body: form.value
    });
    
    // Set cookie
    if (response.token) {
      cookie.value = response.token;
      router.push('/verify-email');
    }
  } catch (err: any) {
    if (err.response?._data?.message) {
      errorMessage.value = err.response._data.message;
    } else {
      errorMessage.value = 'Ocurrió un error al registrarse. Intenta más tarde.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>
