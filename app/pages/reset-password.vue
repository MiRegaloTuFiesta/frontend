<template>
  <div class="min-h-screen bg-stone-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-2xl font-bold text-primary-800 tracking-tight flex justify-center items-center gap-2">
          Mi Regalo, Tu Fiesta
        </NuxtLink>
        <p class="text-stone-500 mt-2">Crea tu nueva contraseña</p>
      </div>

      <UiCard class="border-stone-200 shadow-xl shadow-stone-200/50">
        <UiCardHeader v-if="!isSuccess">
          <UiCardTitle class="text-xl">Restablecer Contraseña</UiCardTitle>
          <UiCardDescription>Ingresa tu nueva contraseña para acceder a tu cuenta</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <!-- Success State -->
          <div v-if="isSuccess" class="text-center py-6 space-y-4">
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-stone-900">¡Contraseña Cambiada!</h3>
            <p class="text-stone-600 text-sm">Tu contraseña ha sido actualizada con éxito. Serás redirigido al inicio de sesión en unos segundos.</p>
            <UiButton class="w-full mt-6 bg-primary" as="a" href="/login">Ir a Iniciar Sesión</UiButton>
          </div>

          <!-- Form State -->
          <form v-else @submit.prevent="submit" class="space-y-4">
            <div class="space-y-2">
              <UiLabel for="password">Nueva Contraseña</UiLabel>
              <UiInput id="password" type="password" v-model="form.password" required minlength="8" placeholder="••••••••" />
            </div>
            <div class="space-y-2">
              <UiLabel for="password_confirmation">Confirmar Contraseña</UiLabel>
              <UiInput id="password_confirmation" type="password" v-model="form.password_confirmation" required minlength="8" placeholder="••••••••" />
            </div>
            
            <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {{ errorMessage }}
            </div>

            <UiButton type="submit" class="w-full bg-primary hover:bg-primary-700 text-white mt-6" :disabled="isLoading">
              {{ isLoading ? 'Cambiando...' : 'Cambiar Contraseña' }}
            </UiButton>
          </form>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter, useHead } from '#imports';

useHead({ title: 'Restablecer Contraseña - Mi Regalo, Tu Fiesta' });

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

const form = ref({
  token: '',
  email: '',
  password: '',
  password_confirmation: ''
});

const isLoading = ref(false);
const isSuccess = ref(false);
const errorMessage = ref('');

onMounted(() => {
  // Handle normal query params and escaped ones from logs (&amp;)
  const queryToken = (route.query.token || route.query['amp;token']) as string;
  const queryEmail = (route.query.email || route.query['amp;email']) as string;

  form.value.token = queryToken || '';
  form.value.email = queryEmail || '';

  if (!form.value.token || !form.value.email) {
    errorMessage.value = 'El enlace de recuperación parece ser inválido. Por favor, solicita uno nuevo o asegúrate de copiar el link completo del log.';
  }
});

const submit = async () => {
  if (form.value.password !== form.value.password_confirmation) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    await $fetch(`${config.public.apiBase}/api/reset-password`, {
      method: 'POST',
      body: form.value
    });
    
    isSuccess.value = true;
    setTimeout(() => {
      router.push('/login');
    }, 4000);
  } catch (err: any) {
    if (err.response?._data?.message) {
      errorMessage.value = err.response._data.message;
    } else {
      errorMessage.value = 'Ocurrió un error al cambiar la contraseña. Intenta más tarde.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>
