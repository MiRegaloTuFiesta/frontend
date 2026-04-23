<template>
  <div class="min-h-screen bg-stone-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-stone-200">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/dashboard" class="text-primary-800 font-bold hover:text-primary-600 transition-colors flex items-center gap-2">
            <span class="text-lg">←</span>
            <span>Volver al Panel</span>
          </NuxtLink>
        </div>
        <h1 class="text-lg font-bold text-stone-800 absolute left-1/2 -translate-x-1/2 hidden md:block">Mi Perfil</h1>
        <nav class="flex items-center gap-2 sm:gap-4">
          <span class="text-sm font-medium text-stone-500 hidden sm:block">{{ user?.name }}</span>
          <UiButton @click="logout" variant="ghost" size="sm" class="text-stone-400 hidden sm:flex">Cerrar Sesión</UiButton>
          <UiButton @click="showMobileMenu = true" variant="outline" size="sm" class="md:hidden border-stone-200 text-stone-600 font-bold gap-2">
            <span>☰</span>
            <span class="text-[10px] uppercase tracking-wider">Menú</span>
          </UiButton>
        </nav>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 flex-1 max-w-4xl">
      <!-- Mobile Current Section Indicator -->
      <div class="md:hidden mb-6 flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div class="flex items-center gap-3">
            <span class="text-xl">{{ tabIcons[activeTab] }}</span>
            <div>
                <p class="text-[10px] font-black uppercase text-stone-400 tracking-widest leading-none">Sección Actual</p>
                <p class="text-sm font-black text-stone-800 mt-1">{{ tabNames[activeTab] }}</p>
            </div>
        </div>
        <UiButton @click="showMobileMenu = true" variant="ghost" class="text-primary font-black text-xs uppercase tracking-tight">Cambiar</UiButton>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Sidebar Navigation (Desktop only) -->
        <div class="hidden md:block md:col-span-1 space-y-2">
          <button v-for="(name, id) in tabNames" :key="id" @click="activeTab = id" :class="activeTab === id ? 'bg-primary text-white shadow-md' : 'bg-white text-stone-600 hover:bg-stone-100'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold border border-transparent">
            <span>{{ tabIcons[id] }}</span> {{ name }}
          </button>
        </div>

        <!-- Content -->
        <div class="md:col-span-2">
          <!-- General Info Tab -->
          <UiCard v-if="activeTab === 'general'" class="border-stone-200 shadow-sm animate-in fade-in duration-300">
            <UiCardHeader>
              <UiCardTitle>Datos de la Cuenta</UiCardTitle>
              <UiCardDescription>Actualiza tu información personal</UiCardDescription>
            </UiCardHeader>
            <UiCardContent class="space-y-6">
              <div class="space-y-2">
                <UiLabel for="name">Nombre Completo</UiLabel>
                <UiInput id="name" v-model="profileForm.name" />
              </div>
              <div class="space-y-2">
                <UiLabel for="email">Email</UiLabel>
                <UiInput id="email" v-model="profileForm.email" type="email" />
                <p class="text-[10px] text-amber-600 font-bold">⚠️ Si cambias tu correo, deberás verificarlo nuevamente para operar.</p>
              </div>
              <div class="space-y-2">
                <UiLabel for="phone">Teléfono de contacto</UiLabel>
                <UiInput id="phone" v-model="profileForm.phone" placeholder="+56 9 ..." />
              </div>
              <div class="pt-4">
                <UiButton @click="updateProfile" class="w-full bg-primary text-white" :disabled="isSaving">
                  {{ isSaving ? 'Guardando...' : 'Guardar Datos Generales' }}
                </UiButton>
              </div>
            </UiCardContent>
          </UiCard>

          <!-- Bank Details Tab -->
          <UiCard v-if="activeTab === 'bank'" class="border-stone-200 shadow-sm animate-in fade-in duration-300">
            <UiCardHeader>
              <UiCardTitle>Datos para Transferencias</UiCardTitle>
              <UiCardDescription>¿A dónde quieres recibir tus regalos recaudados?</UiCardDescription>
            </UiCardHeader>
            <UiCardContent class="space-y-6">
              <div class="space-y-2">
                <UiLabel>Seleccionar Banco</UiLabel>
                <select v-model="profileForm.bank_id" @change="profileForm.account_type_id = null" class="w-full h-11 px-3 rounded-lg border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option :value="null">Seleccionar Banco...</option>
                  <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
              </div>
              
              <div class="space-y-2">
                <UiLabel>Tipo de Cuenta</UiLabel>
                <select v-model="profileForm.account_type_id" class="w-full h-11 px-3 rounded-lg border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none" :disabled="!selectedBank">
                  <option :value="null">{{ !selectedBank ? 'Primero selecciona un banco' : 'Seleccionar tipo...' }}</option>
                  <option v-for="t in selectedBank?.account_types" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>

              <div class="space-y-2">
                <UiLabel>RUT del Titular</UiLabel>
                <UiInput v-model="profileForm.bank_rut" placeholder="12.345.678-9" :disabled="!profileForm.account_type_id" />
              </div>

              <div class="space-y-2">
                <UiLabel>Número de Cuenta</UiLabel>
                <UiInput v-model="profileForm.account_number" placeholder="Ej: 12345678" :disabled="!profileForm.account_type_id" />
                <p v-if="profileForm.bank_id && (!profileForm.account_number || !profileForm.bank_rut)" class="text-[10px] text-amber-600 font-bold">⚠️ Si ingresas datos bancarios, el RUT y número de cuenta son obligatorios.</p>
              </div>

              <div class="pt-4">
                <UiButton @click="updateProfile" class="w-full bg-primary text-white" :disabled="isSaving || (profileForm.bank_id && !profileForm.account_number)">
                  {{ isSaving ? 'Guardando...' : 'Actualizar Datos Bancarios' }}
                </UiButton>
              </div>
            </UiCardContent>
          </UiCard>

          <!-- Password Tab -->
          <UiCard v-if="activeTab === 'password'" class="border-stone-200 shadow-sm animate-in fade-in duration-300">
            <UiCardHeader>
              <UiCardTitle>Cambiar Contraseña</UiCardTitle>
              <UiCardDescription>Recomendamos usar una contraseña segura y única</UiCardDescription>
            </UiCardHeader>
            <UiCardContent class="space-y-6">
              <div class="space-y-2">
                <UiLabel for="currentPassword">Contraseña Actual</UiLabel>
                <UiInput id="currentPassword" type="password" v-model="passwordForm.current_password" />
              </div>
              <hr class="border-stone-100" />
              <div class="space-y-2">
                <UiLabel for="newPassword">Nueva Contraseña</UiLabel>
                <UiInput id="newPassword" type="password" v-model="passwordForm.password" />
              </div>
              <div class="space-y-2">
                <UiLabel for="confirmPassword">Confirmar Nueva Contraseña</UiLabel>
                <UiInput id="confirmPassword" type="password" v-model="passwordForm.password_confirmation" />
              </div>
              <div class="pt-4">
                <UiButton @click="changePassword" class="w-full bg-zinc-900 text-white" :disabled="isSaving">
                  {{ isSaving ? 'Cambiando...' : 'Actualizar Contraseña' }}
                </UiButton>
              </div>
            </UiCardContent>
          </UiCard>

          <!-- Payouts Tab -->
          <div v-if="activeTab === 'payouts'" class="space-y-6 animate-in fade-in duration-300">
            <UiCard class="border-stone-200 shadow-sm overflow-hidden">
                <div class="bg-primary-600 p-8 text-white">
                    <h3 class="text-lg font-bold">Estado de Cobros</h3>
                    <p class="text-primary-100 text-xs">Resumen de tus recaudaciones y depósitos recibidos</p>
                </div>
                <UiCardContent class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                        <p class="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Pagos Pendientes</p>
                        <p class="text-2xl font-black text-stone-900">{{ formatCurrency(payoutData?.pending_balance || 0) }}</p>
                        <p class="text-[10px] text-stone-500 mt-2 leading-tight">Monto recaudado de tus invitados que aún no ha sido transferido a tu cuenta bancaria.</p>
                    </div>
                    <div 
                        @click="openHistoryModal"
                        class="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-all group relative overflow-hidden"
                    >
                        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="text-emerald-400">🔍</span>
                        </div>
                        <p class="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Transferencias Completadas</p>
                        <p class="text-2xl font-black text-emerald-700">{{ formatCurrency(payoutData?.completed_balance || 0) }}</p>
                        <p class="text-[10px] text-emerald-600 mt-2 leading-tight">Monto total depositado. Haz clic para ver el historial detallado.</p>
                    </div>
                </UiCardContent>
            </UiCard>

            <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <span class="text-xl">ℹ️</span>
                <div class="text-xs text-amber-800 space-y-1">
                    <p class="font-bold">Política de Depósitos</p>
                    <p>Los depósitos se realizan en un plazo máximo de de <strong>{{ payoutDays }} días hábiles</strong> tras recibirse el aporte del invitado.</p>
                    <p>Asegúrate de tener tus <button @click="activeTab = 'bank'" class="underline font-bold">datos bancarios</button> actualizados para evitar retrasos.</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Mobile Menu Modal -->
    <div v-if="showMobileMenu" class="fixed inset-0 z-[100] bg-zinc-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div @click.self="showMobileMenu = false" class="absolute inset-0"></div>
      <div class="bg-white w-full sm:max-w-xs rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl relative animate-in slide-in-from-bottom duration-300 overflow-hidden">
        <div class="p-6 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
            <h3 class="font-black text-stone-800 uppercase tracking-widest text-xs">Gestión de Perfil</h3>
            <button @click="showMobileMenu = false" class="text-stone-400 hover:text-stone-900">✕</button>
        </div>
        <div class="p-4 space-y-2">
            <button v-for="(name, id) in tabNames" :key="id" @click="activeTab = id; showMobileMenu = false" :class="activeTab === id ? 'bg-primary/10 text-primary border-primary scale-[1.02]' : 'text-stone-600 border-transparent hover:bg-stone-50'" class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-sm font-black border text-left">
              <span class="text-xl">{{ tabIcons[id] }}</span>
              {{ name }}
            </button>
            <hr class="border-stone-100 my-2" />
            <button @click="logout" class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-stone-400 font-bold text-sm text-left hover:bg-rose-50 hover:text-rose-600 transition-colors">
              <span class="text-xl">🚪</span>
              Cerrar Sesión
            </button>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistoryModal" class="fixed inset-0 z-[110] bg-zinc-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[85vh] animate-in zoom-in duration-300">
            <div class="p-8 border-b border-stone-50 bg-stone-50/50 flex items-center justify-between">
                <div>
                    <h3 class="font-black text-stone-900 uppercase tracking-widest text-xs">Historial de Depósitos</h3>
                    <p class="text-xs text-stone-500 font-bold mt-1">Registros de transferencias realizadas</p>
                </div>
                <button @click="showHistoryModal = false" class="text-stone-400 hover:text-stone-900 text-2xl">✕</button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
                <div v-if="payoutData && payoutData.history && payoutData.history.length > 0" class="space-y-4">
                    <div v-for="h in payoutData.history" :key="h.date" class="bg-stone-50 border border-stone-100 rounded-2xl overflow-hidden">
                        <div class="p-4 bg-white border-b border-stone-100 flex justify-between items-center">
                            <div>
                                <p class="text-[10px] font-black uppercase text-stone-400">Fecha de Depósito</p>
                                <p class="text-sm font-black text-stone-800">{{ h.date }}</p>
                            </div>
                            <p class="text-lg font-black text-emerald-600">{{ formatCurrency(h.amount) }}</p>
                        </div>
                        <div class="p-4 space-y-3">
                            <div v-for="d in h.details" :key="d.id" class="flex justify-between items-center text-xs">
                                <div class="space-y-0.5">
                                    <p class="font-black text-stone-800">{{ d.wish_name }}</p>
                                    <p class="text-[10px] text-stone-400 uppercase font-bold">{{ d.event_name }} • {{ d.donor_name }}</p>
                                </div>
                                <p class="font-bold text-emerald-700">{{ formatCurrency(d.amount) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center py-12">
                    <p class="text-stone-400 font-bold italic">Aún no registras depósitos completados.</p>
                </div>
            </div>

            <div class="p-6 bg-zinc-900 text-white flex justify-between items-center">
                <span class="text-[10px] font-bold uppercase text-stone-400">Total Histórico:</span>
                <span class="text-xl font-black">{{ formatCurrency(payoutData?.completed_balance || 0) }}</span>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCookie, useRouter, useFetch, useRuntimeConfig } from '#imports';

const router = useRouter();
const config = useRuntimeConfig();
const token = useCookie('auth_token');

if (!token.value) {
    router.push('/login');
}

const activeTab = ref('general');
const isSaving = ref(false);
const showMobileMenu = ref(false);
const showHistoryModal = ref(false);

const openHistoryModal = () => {
    showHistoryModal.value = true;
};

const tabNames: Record<string, string> = {
    general: 'Datos Generales',
    bank: 'Datos Bancarios',
    password: 'Seguridad',
    payouts: 'Cobros y Depósitos'
};

const tabIcons: Record<string, string> = {
    general: '👤',
    bank: '🏦',
    password: '🔒',
    payouts: '💸'
};

const { data: user, refresh: refreshUser } = await useFetch<any>(`${config.public.apiBase}/api/user`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const { data: banks } = await useFetch<any>(`${config.public.apiBase}/api/banks`);

const { data: payoutData } = await useFetch<any>(`${config.public.apiBase}/api/user/payouts`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const { data: publicSettings } = await useFetch<any>(`${config.public.apiBase}/api/settings/public`);
const payoutDays = computed(() => publicSettings.value?.payout_days || '3');

const profileForm = ref({
    name: user.value?.name || '',
    email: user.value?.email || '',
    phone: user.value?.phone || '',
    bank_id: user.value?.bank_id || null,
    account_type_id: user.value?.account_type_id || null,
    account_number: user.value?.account_number || '',
    bank_rut: user.value?.bank_rut || '',
});

const passwordForm = ref({
    current_password: '',
    password: '',
    password_confirmation: ''
});

const selectedBank = computed(() => {
    if (!banks.value || !profileForm.value.bank_id) return null;
    return banks.value.find((b: any) => b.id === profileForm.value.bank_id);
});

const updateProfile = async () => {
    isSaving.value = true;
    try {
        await $fetch(`${config.public.apiBase}/api/user/profile`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token.value}` },
            body: profileForm.value
        });
        alert('¡Perfil actualizado con éxito!');
        await refreshUser();
    } catch (err: any) {
        console.error(err);
        alert(err.response?._data?.message || 'Error al actualizar perfil');
    } finally {
        isSaving.value = false;
    }
};

const changePassword = async () => {
    if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
        alert('Las contraseñas no coinciden');
        return;
    }
    isSaving.value = true;
    try {
        await $fetch(`${config.public.apiBase}/api/user/password`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token.value}` },
            body: passwordForm.value
        });
        alert('Contraseña actualizada correctamente');
        passwordForm.value = { current_password: '', password: '', password_confirmation: '' };
    } catch (err: any) {
        console.error(err);
        alert(err.response?._data?.message || 'Error al cambiar contraseña');
    } finally {
        isSaving.value = false;
    }
};

const logout = () => {
    token.value = null;
    router.push('/login');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};
</script>
