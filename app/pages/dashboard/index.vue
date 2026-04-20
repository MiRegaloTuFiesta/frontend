<template>
  <div class="min-h-screen bg-stone-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-stone-200">
      <div v-if="route.query.verified === '1' || route.query['amp;verified'] === '1'" class="bg-primary-600 text-white text-center py-2 text-sm font-bold">
        ¡Tu cuenta ha sido verificada con éxito! Bienvenido a Mi Regalo, Tu Fiesta.
      </div>
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 class="text-xl font-bold text-primary-800">Panel de Creador</h1>
        <nav class="flex items-center gap-4">
          <UiButton v-if="user?.role === 'admin'" as="a" href="/admin" variant="secondary" size="sm" class="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none font-bold">Admin Panel</UiButton>
          <span class="text-sm font-medium text-stone-500">Bienvenido, {{ user?.name || 'Gestor' }}</span>
          <UiButton @click="logout" variant="outline" size="sm">Cerrar Sesión</UiButton>
        </nav>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 flex-1 grid md:grid-cols-12 gap-8">
      
      <!-- Sidebar / Config -->
      <div class="md:col-span-4 lg:col-span-3 space-y-6">
        <UiCard class="border-stone-200 shadow-sm">
          <UiCardHeader>
            <UiCardTitle>Nuevo Evento</UiCardTitle>
            <UiCardDescription>Crea un evento para comenzar a recibir fondos</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <form @submit.prevent="createEvent" class="space-y-4">
              <div class="space-y-2">
                <UiLabel for="name">Nombre de Evento</UiLabel>
                <UiInput id="name" v-model="newEvent.name" placeholder="Ej: Boda de Ana y Juan" />
              </div>
              <div class="space-y-2">
                <UiLabel for="date">Fecha</UiLabel>
                <UiInput id="date" type="date" v-model="newEvent.date" />
              </div>
              <div class="space-y-2">
                <UiLabel for="category">Categoría</UiLabel>
                <select id="category" v-model="newEvent.category_id" class="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option :value="null">Seleccionar categoría...</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div class="space-y-2">
                <UiLabel for="region">Región</UiLabel>
                <select id="region" v-model="selectedRegionId" @change="handleRegionChange" class="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option :value="null">Seleccionar región...</option>
                  <option v-for="reg in regions" :key="reg.id" :value="reg.id">{{ reg.name }}</option>
                </select>
              </div>

              <div class="space-y-2">
                <UiLabel for="city">Ciudad</UiLabel>
                <select id="city" v-model="newEvent.city_id" class="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none" :disabled="!selectedRegionId || isLoadingCities">
                  <option :value="null">{{ isLoadingCities ? 'Cargando...' : 'Seleccionar ciudad...' }}</option>
                  <option v-for="city in citiesList" :key="city.id" :value="city.id">{{ city.name }}</option>
                </select>
              </div>

              <div class="space-y-2">
                <UiLabel for="address">Dirección (Opcional)</UiLabel>
                <UiInput id="address" v-model="newEvent.address" placeholder="Ej: Av. Las Condes 123" />
              </div>

              <div class="flex items-center gap-2 py-1">
                <input type="checkbox" id="isPublic" v-model="newEvent.is_location_public" class="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary" />
                <UiLabel for="isPublic" class="text-xs font-semibold text-stone-700 cursor-pointer">¿Mostrar ubicación en página pública?</UiLabel>
              </div>

              <div class="pt-4 border-t border-stone-100 space-y-4">
                <div class="space-y-2">
                  <UiLabel for="budget">Meta de Recaudación (Opcional)</UiLabel>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                    <UiInput id="budget" type="number" v-model="newEvent.creator_budget" placeholder="Ej: 500000" class="pl-8" />
                  </div>
                </div>

                <div class="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 animate-in fade-in zoom-in duration-200">
                  <input type="checkbox" id="requestService" v-model="newEvent.requests_internal_service" class="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary" />
                  <UiLabel for="requestService" class="text-xs font-bold text-amber-800 cursor-pointer italic">Deseo contratar servicio interno</UiLabel>
                </div>
              </div>
              <UiButton type="submit" class="w-full bg-primary hover:bg-primary-700 text-white" :disabled="isCreatingEvent">
                {{ isCreatingEvent ? 'Guardando...' : 'Crear Evento' }}
              </UiButton>
            </form>
          </UiCardContent>
        </UiCard>
      </div>

      <!-- Main Content / Events List -->
      <div class="md:col-span-8 lg:col-span-9 space-y-8">
        <div v-if="pendingEvents" class="flex flex-col gap-4">
          <UiSkeleton class="h-32 w-full rounded-xl" v-for="i in 2" :key="i" />
        </div>
        
        <div v-else-if="events && events.length > 0" class="space-y-6">
          <h2 class="text-2xl font-bold text-stone-900">Tus Eventos</h2>
          
          <UiCard v-for="evt in events" :key="evt.id" class="border-stone-200 shadow-sm">
            <UiCardHeader>
              <div class="flex justify-between items-start">
                <div>
                  <UiCardTitle class="text-xl">{{ evt.name }}</UiCardTitle>
                  <UiCardDescription>Fecha: {{ new Date(evt.date + 'T12:00:00').toLocaleDateString('es-CL') }} • Estado: 

                    <span :class="{
                      'text-amber-600 font-semibold': evt.status === 'pending', 
                      'text-primary-600 font-semibold': evt.status === 'approved',
                      'text-rose-600 font-semibold': evt.status === 'rejected'
                    }">
                      {{ evt.status === 'pending' ? 'Pendiente de Aprobación' : (evt.status === 'approved' ? 'Aprobado' : 'Rechazado') }}
                    </span>
                    <span v-if="evt.city" class="block text-xs text-stone-400 mt-1">📍 {{ evt.city.name }}, {{ evt.city.region?.name }}</span>
                    <div v-if="evt.requests_internal_service" class="mt-2 text-[10px] inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold uppercase tracking-wider">
                      🔧 Servicio Solicitado{{ evt.service_cost > 0 ? ': $' + formatNumber(evt.service_cost) : '' }}
                    </div>
                    <div v-if="evt.status === 'rejected' && evt.admin_notes" class="mt-3 p-4 bg-rose-50 border border-rose-100 rounded-xl">
                      <p class="text-[10px] text-rose-400 font-bold uppercase mb-1">Motivo del Rechazo:</p>
                      <p class="text-sm text-rose-700 font-medium">{{ evt.admin_notes }}</p>
                    </div>
                  </UiCardDescription>
                </div>
                <!-- Only show the link if approved -->
                <UiButton v-if="evt.status === 'approved'" as="a" :href="'/evento/' + evt.uuid" variant="outline" target="_blank" size="sm" class="flex items-center gap-2">
                  Ver Público
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </UiButton>
                <div v-else class="flex items-center gap-2">
                  <span class="text-sm text-stone-400 bg-stone-100 px-3 py-1.5 rounded-md border border-stone-200">En revisión</span>
                  <UiButton @click="deleteEvent(evt)" variant="outline" size="sm" class="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700">
                    🗑️
                  </UiButton>
                </div>
              </div>
            </UiCardHeader>
            <UiCardContent>
              <div class="bg-zinc-50 p-4 rounded-lg flex flex-wrap gap-6 items-center border border-zinc-100 mb-6">
                <div>
                  <span class="text-xs text-zinc-500 uppercase font-semibold">Recaudado / Meta Efectiva</span>
                  <div class="text-2xl font-bold text-primary-700">
                    ${{ formatNumber(evt.collected_amount) }} 
                    <span class="text-base text-zinc-400 font-normal">/ ${{ formatNumber(evt.total_price - (evt.manual_payments_sum_amount || 0)) }}</span>
                  </div>
                  <p v-if="evt.manual_payments_sum_amount > 0" class="text-[10px] text-zinc-400 italic">
                    Meta original: ${{ formatNumber(evt.total_price) }} | Abonos: ${{ formatNumber(evt.manual_payments_sum_amount) }}
                  </p>
                </div>
                <div>
                  <span class="text-xs text-zinc-500 uppercase font-semibold">Excedente (Overflow)</span>
                  <div class="text-xl font-bold text-zinc-700">${{ formatNumber(evt.overflow_balance) }}</div>
                </div>
                <!-- Admin fields -->
                <div v-if="evt.assigned_admin" class="border-l border-zinc-200 pl-6 shrink-0">
                  <span class="text-xs text-zinc-500 uppercase font-semibold">Ejecutivo asignado</span>
                  <div class="text-sm font-bold text-zinc-900">{{ evt.assigned_admin.name }}</div>
                </div>
                <div v-if="evt.admin_notes" class="ml-auto">
                  <UiButton size="sm" variant="outline" class="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 font-bold" @click="openAdminNotes(evt)">
                    📋 Ver Detalles del Ejecutivo
                  </UiButton>
                </div>
              </div>

              <!-- Wishlist Section -->
              <div class="space-y-4">
                <div class="flex justify-between items-center bg-white">
                  <h3 class="font-bold text-stone-800">Lista de Deseos ({{ evt.wishes?.length || 0 }})</h3>
                  <UiButton size="sm" variant="secondary" @click="openWishModal(evt.id)">+ Agregar Deseo</UiButton>
                </div>

                <div v-if="evt.wishes && evt.wishes.length > 0" class="grid sm:grid-cols-2 gap-4">
                  <div 
                    v-for="wish in evt.wishes" 
                    :key="wish.id" 
                    class="p-4 border border-stone-200 rounded-xl relative group"
                    :class="wish.status !== 'completed' ? 'cursor-pointer hover:border-primary-300 hover:bg-stone-50 transition-all' : 'opacity-80'"
                    @click="wish.status !== 'completed' && openWishModal(evt.id, wish)"
                  >
                    <div v-if="wish.status === 'completed'" class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">Completo</div>
                    <h4 class="font-semibold text-stone-900">{{ wish.name }}</h4>
                    <p class="text-xs text-stone-500 mt-1 mb-3">{{ wish.description }}</p>
                    <div class="flex justify-between text-xs font-medium mb-1">
                      <span class="text-primary-600">Recaudado:</span>
                      <span class="text-stone-900 font-bold">${{ formatNumber(wish.current_amount) }}</span>
                    </div>
                    <div v-if="wish.status === 'completed' && wish.contributions && wish.contributions.length > 0" class="mt-2 text-[10px] bg-primary-50 p-2 rounded-lg border border-primary-100">
                      <span class="text-stone-400 font-bold uppercase">Comprado por:</span>
                      <p class="text-primary-800 font-bold truncate">{{ wish.contributions[0].donor_name }}</p>
                    </div>
                    <div v-if="wish.status !== 'completed'" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span class="text-[10px] bg-white border border-stone-200 px-2 py-0.5 rounded shadow-sm text-stone-400 font-bold uppercase">Click para editar</span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-stone-400 text-center py-6 border border-dashed border-stone-200 rounded-xl">
                  Aún no hay regalos en la lista. Agrega el primero para empezar a recibir.
                </div>
              </div>

            </UiCardContent>
          </UiCard>
        </div>

        <div v-else class="text-center py-20 bg-white rounded-xl border border-stone-200">
          <h3 class="text-xl font-bold text-stone-800 mb-2">Aún no tienes eventos</h3>
          <p class="text-stone-500 mb-6">Comienza creando tu primer evento en el panel lateral.</p>
        </div>
      </div>
    </main>

    <!-- Modal agregar deseo -->
    <div v-if="isWishModalOpen" class="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-stone-100 flex justify-between items-center">
          <h3 class="text-lg font-bold">{{ isEditingWish ? 'Editar Regalo' : 'Agregar nuevo Regalo' }}</h3>
          <button @click="closeWishModal" class="text-stone-400 hover:text-stone-600">&times;</button>
        </div>
        <form @submit.prevent="submitWish" class="p-6 space-y-4">
          <div class="space-y-2">
            <UiLabel for="wishName">Nombre del Regalo o Deseo</UiLabel>
            <UiInput id="wishName" v-model="newWish.name" placeholder="Ej: Pasajes a París" required />
          </div>
          <div class="space-y-2">
            <UiLabel for="wishDesc">Descripción o mensaje</UiLabel>
            <UiInput id="wishDesc" v-model="newWish.description" placeholder="Hazlo divertido para tus invitados" />
          </div>

          <div class="flex items-center gap-2 py-2">
            <input type="checkbox" id="isOpenAmount" v-model="newWish.is_open" class="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary" />
            <UiLabel for="isOpenAmount" class="text-sm font-semibold text-stone-700 cursor-pointer">¿Deseas que el monto sea abierto? (El invitado elige cuánto aportar)</UiLabel>
          </div>
          
          <div v-if="!newWish.is_open" class="space-y-2 p-4 bg-primary-50 rounded-xl border border-primary-100 animate-in fade-in zoom-in duration-200">
            <UiLabel for="liquidAmount" class="text-primary-900 font-bold">¿Cuánto quieres recibir líquido? (CLP)</UiLabel>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600 font-bold">$</span>
              <UiInput id="liquidAmount" type="number" v-model="newWish.liquid_amount" @input="updateCalculations" class="pl-8 border-primary-200 focus:ring-primary" placeholder="Ej: 10000" :required="!newWish.is_open" />
            </div>
            
            <div v-if="calculation" class="mt-3 space-y-1 text-xs">
              <div class="flex justify-between text-stone-600">
                <span>Comisión Plataforma ({{ calculation.platform_fee_percent || '5' }}%)</span>
                <span>${{ formatNumber(calculation.platform_fee) }}</span>
              </div>
              <div class="flex justify-between text-stone-600">
                <span>Costo Pasarela + IVA</span>
                <span>${{ formatNumber(calculation.gateway_fee) }}</span>
              </div>
              <div class="flex justify-between font-bold text-primary-700 pt-1 border-t border-primary-200">
                <span>Total que pagará el invitado:</span>
                <span>${{ formatNumber(calculation.gross) }}</span>
              </div>
              <p class="text-[10px] text-primary-500 italic mt-2">* Cálculo basado en Flow.cl como referencia.</p>
            </div>
          </div>
          
          <div class="pt-4 flex justify-end gap-3">
            <UiButton type="button" variant="outline" @click="closeWishModal">Cancelar</UiButton>
            <UiButton type="submit" class="bg-primary text-white" :disabled="isCreatingWish">
              {{ isCreatingWish ? 'Guardando...' : (isEditingWish ? 'Actualizar Regalo' : 'Agregar Regalo') }}
            </UiButton>
          </div>
        </form>
      </div>
    </div>
    <!-- Modal notas admin -->
    <div v-if="isNotesModalOpen && selectedEventNotes" class="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-zinc-100">
        <div class="p-8 border-b border-zinc-50 flex justify-between items-center">
          <div>
            <h3 class="text-xl font-bold text-zinc-900">Mensaje del Ejecutivo</h3>
            <p class="text-sm text-zinc-400">Notas de administración para tu evento</p>
          </div>
          <button @click="isNotesModalOpen = false" class="text-zinc-300 hover:text-zinc-900 text-2xl transition-colors">&times;</button>
        </div>
        <div class="p-8">
          <div class="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-zinc-700 whitespace-pre-wrap leading-relaxed shadow-inner">
            {{ selectedEventNotes.admin_notes }}
          </div>
          <div class="mt-8">
            <UiButton @click="isNotesModalOpen = false" class="w-full h-12 bg-zinc-900 text-white rounded-xl font-bold">Entendido</UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCookie, useRouter, useRoute, useHead, useFetch } from '#imports';

// SEO head for dashboard
useHead({ title: 'Dashboard - Mi Regalo, Tu Fiesta' });

const router = useRouter();
const route = useRoute();
const token = useCookie('auth_token');

if (!token.value) {
  router.push('/login');
}

const config = useRuntimeConfig();

const { data: events, pending: pendingEvents, refresh } = await useFetch<any>(`${config.public.apiBase}/api/events`, {
  headers: {
    Authorization: `Bearer ${token.value}`
  }
});

const { data: user } = await useFetch<any>(`${config.public.apiBase}/api/user`, {
  headers: {
    Authorization: `Bearer ${token.value}`
  }
});

const { data: categories } = await useFetch<any>(`${config.public.apiBase}/api/categories`);

const { data: regions } = await useFetch<any>(`${config.public.apiBase}/api/regions`);
const citiesList = ref<any[]>([]);
const selectedRegionId = ref<number | null>(null);
const isLoadingCities = ref(false);

const handleRegionChange = async () => {
  newEvent.value.city_id = null;
  citiesList.value = [];
  if (!selectedRegionId.value) return;

  isLoadingCities.value = true;
  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/cities?region_id=${selectedRegionId.value}`);
    citiesList.value = res;
  } catch (e) {
    console.error('Error cargando ciudades', e);
  } finally {
    isLoadingCities.value = false;
  }
}

const newEvent = ref({
  name: '',
  date: '',
  category_id: null,
  city_id: null as number | null,
  address: '',
  is_location_public: true,
  creator_budget: '',
  requests_internal_service: false
});
const isCreatingEvent = ref(false);

const isWishModalOpen = ref(false);
const isEditingWish = ref(false);
const editingWishId = ref<number | null>(null);
const selectedEventId = ref<number | null>(null);
const isCreatingWish = ref(false);
const newWish = ref({
  name: '',
  description: '',
  liquid_amount: '',
  target_amount: 0,
  is_open: false
});

const isNotesModalOpen = ref(false);
const selectedEventNotes = ref<any>(null);

const openAdminNotes = (evt: any) => {
  selectedEventNotes.value = evt;
  isNotesModalOpen.value = true;
};

const calculation = ref<any>(null);

const updateCalculations = async () => {
  if (!newWish.value.liquid_amount || parseInt(newWish.value.liquid_amount) <= 0) {
    calculation.value = null;
    newWish.value.target_amount = 0;
    return;
  }

  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/checkout/calculate?amount=${newWish.value.liquid_amount}&gateway=flow&type=liquid`);
    calculation.value = res;
    newWish.value.target_amount = res.gross;
  } catch (e) {
    console.error('Error calculando comisiones', e);
  }
}

const createEvent = async () => {
  if (!newEvent.value.name || !newEvent.value.date) return;
  
  isCreatingEvent.value = true;
  try {
    await $fetch(`${config.public.apiBase}/api/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: newEvent.value
    });
    newEvent.value = { name: '', date: '', category_id: null, city_id: null, address: '', is_location_public: true, creator_budget: '', requests_internal_service: false };
    selectedRegionId.value = null;
    citiesList.value = [];
    await refresh();
  } catch (err) {
    console.error(err);
    alert('Error al crear el evento');
  } finally {
    isCreatingEvent.value = false;
  }
}

const openWishModal = (eventId: number, wish: any = null) => {
  selectedEventId.value = eventId;
  if (wish) {
    isEditingWish.value = true;
    editingWishId.value = wish.id;
    newWish.value = {
      name: wish.name,
      description: wish.description,
      liquid_amount: wish.liquid_amount.toString(),
      target_amount: wish.target_amount,
      is_open: wish.liquid_amount === 0
    };
    if (wish.liquid_amount > 0) {
      updateCalculations();
    }
  } else {
    isEditingWish.value = false;
    editingWishId.value = null;
    newWish.value = { name: '', description: '', liquid_amount: '', target_amount: 0, is_open: false };
  }
  isWishModalOpen.value = true;
}

const closeWishModal = () => {
  isWishModalOpen.value = false;
  selectedEventId.value = null;
  isEditingWish.value = false;
  editingWishId.value = null;
  newWish.value = { name: '', description: '', liquid_amount: '', target_amount: 0, is_open: false };
  calculation.value = null;
}

const submitWish = async () => {
  if (!selectedEventId.value || !newWish.value.name) return;
  isCreatingWish.value = true;

  try {
    const url = isEditingWish.value 
      ? `${config.public.apiBase}/api/wishes/${editingWishId.value}`
      : `${config.public.apiBase}/api/wishes`;
    
    await $fetch(url, {
      method: isEditingWish.value ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        event_id: selectedEventId.value,
        name: newWish.value.name,
        description: newWish.value.description,
        liquid_amount: newWish.value.is_open ? 0 : parseInt(newWish.value.liquid_amount),
        target_amount: newWish.value.is_open ? 0 : newWish.value.target_amount
      }
    });
    closeWishModal();
    await refresh();
  } catch (e) {
    console.error(e);
    alert('Error al guardar el deseo');
  } finally {
    isCreatingWish.value = false;
  }
}

const deleteEvent = async (evt: any) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar el evento "${evt.name}"? Esta acción no se puede deshacer.`)) return;
  
  try {
    await $fetch(`${config.public.apiBase}/api/events/${evt.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    await refresh();
  } catch (err: any) {
    console.error(err);
    alert(err.response?._data?.message || 'Error al eliminar el evento');
  }
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-CL').format(num);
}

const logout = () => {
  token.value = null; // Remove cookie
  router.push('/login');
}
</script>
