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

            <!-- Datos Bancarios Opcionales -->
            <div class="pt-4 border-t border-stone-100 space-y-4">
              <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Datos Bancarios (Opcional)</p>
              
              <div class="space-y-2">
                <UiLabel>Banco</UiLabel>
                <select v-model="form.bank_id" @change="form.account_type_id = null; form.account_number = ''" class="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none transition-all">
                  <option :value="null">Seleccionar banco (Opcional)...</option>
                  <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
              </div>

              <div v-if="form.bank_id" class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div class="space-y-2">
                  <UiLabel>Tipo de Cuenta</UiLabel>
                  <select v-model="form.account_type_id" class="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none" required>
                    <option :value="null">Seleccionar tipo...</option>
                    <option v-for="t in selectedBank?.account_types" :key="t.id" :value="t.id">{{ t.name }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <UiLabel>RUT del Titular</UiLabel>
                  <UiInput v-model="form.bank_rut" placeholder="12.345.678-9" required />
                </div>

                <div class="space-y-2">
                  <UiLabel>Número de Cuenta</UiLabel>
                  <UiInput v-model="form.account_number" placeholder="Ej: 12345678" required />
                </div>
              </div>
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
import { ref, computed } from 'vue';
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
  phone: '',
  bank_id: null as number | null,
  account_type_id: null as number | null,
  account_number: '',
  bank_rut: ''
});

const isLoading = ref(false);
const errorMessage = ref('');

const config = useRuntimeConfig();

// Fetch banks for select
const { data: banks } = await useFetch<any>(`${config.public.apiBase}/api/banks`);

const selectedBank = computed(() => {
  if (!banks.value || !form.value.bank_id) return null;
  return banks.value.find((b: any) => b.id === form.value.bank_id);
});

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
