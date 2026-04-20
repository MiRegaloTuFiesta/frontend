<template>
  <div class="min-h-screen bg-stone-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-2xl font-bold text-primary-800 tracking-tight flex justify-center items-center gap-2">
          Mi Regalo, Tu Fiesta
        </NuxtLink>
        <p class="text-stone-500 mt-2">Bienvenido de vuelta</p>
      </div>

      <UiCard class="border-stone-200 shadow-xl shadow-stone-200/50">
        <UiCardHeader>
          <UiCardTitle class="text-xl">Iniciar Sesión</UiCardTitle>
          <UiCardDescription>Ingresa tus credenciales para administrar tus eventos</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <form @submit.prevent="login" class="space-y-4">
            <div class="space-y-2">
              <UiLabel for="email">Correo Electrónico</UiLabel>
              <UiInput id="email" type="email" v-model="form.email" required placeholder="tu@correo.com" />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <UiLabel for="password">Contraseña</UiLabel>
                <NuxtLink to="/forgot-password" class="text-xs text-primary-600 hover:underline">¿Olvidaste tu contraseña?</NuxtLink>
              </div>
              <UiInput id="password" type="password" v-model="form.password" required placeholder="••••••••" />
            </div>
            
            <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {{ errorMessage }}
            </div>

            <UiButton type="submit" class="w-full bg-primary hover:bg-primary-700 text-white mt-6" :disabled="isLoading">
              {{ isLoading ? 'Ingresando...' : 'Iniciar Sesión' }}
            </UiButton>
          </form>
        </UiCardContent>
        <UiCardFooter class="justify-center border-t border-stone-100 pt-6">
          <p class="text-sm text-stone-600">
            ¿No tienes cuenta? 
            <NuxtLink to="/register" class="text-primary-600 font-semibold hover:underline">Regístrate</NuxtLink>
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
  email: '',
  password: ''
});

const isLoading = ref(false);
const errorMessage = ref('');

const config = useRuntimeConfig();

const login = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response: any = await $fetch(`${config.public.apiBase}/api/login`, {
      method: 'POST',
      body: form.value
    });
    
    if (response.token) {
      cookie.value = response.token;
      router.push('/dashboard');
    }
  } catch (err: any) {
    if (err.response?._data?.message) {
      errorMessage.value = err.response._data.message;
    } else {
      errorMessage.value = 'Credenciales inválidas.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>
