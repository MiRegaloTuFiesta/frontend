<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900">⚐ Reportes de Eventos</h2>
        <p class="text-sm text-zinc-500 mt-1">Gestiona los reportes enviados por visitantes</p>
      </div>
      <span v-if="pendingCount > 0" class="px-3 py-1 bg-rose-100 text-rose-700 text-sm font-bold rounded-full">
        {{ pendingCount }} pendiente{{ pendingCount > 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Filters -->
    <div class="flex gap-3">
      <button
        v-for="f in ['all', 'pending', 'reviewed']"
        :key="f"
        @click="filter = f"
        class="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
        :class="filter === f ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'"
      >
        {{ f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : 'Revisados' }}
      </button>
    </div>

    <div v-if="pending" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 bg-zinc-100 rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="filteredReports.length > 0" class="space-y-4">
      <div
        v-for="report in filteredReports"
        :key="report.id"
        class="bg-white rounded-2xl border shadow-sm p-5 flex gap-4 items-start"
        :class="report.status === 'pending' ? 'border-rose-200' : 'border-zinc-100'"
      >
        <div class="p-3 rounded-xl shrink-0" :class="report.status === 'pending' ? 'bg-rose-50 text-rose-600' : 'bg-zinc-50 text-zinc-400'">
          ⚐
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-bold text-zinc-900">{{ report.event?.name }}</p>
                <span v-if="report.event?.is_blocked" class="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black rounded uppercase">Evento Bloqueado</span>
                <span v-if="report.event?.user?.is_currently_blocked" class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase">Creador Bloqueado</span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">
                Reportado por <span class="font-semibold">{{ report.reporter_email }}</span> · {{ new Date(report.created_at).toLocaleDateString('es-CL') }}
              </p>
            </div>
            <span
              class="shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
              :class="report.status === 'pending' ? 'bg-rose-100 text-rose-600' : 'bg-zinc-100 text-zinc-500'"
            >
              {{ report.status === 'pending' ? 'Pendiente' : 'Revisado' }}
            </span>
          </div>
          <p class="mt-3 text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100 leading-relaxed">{{ report.reason }}</p>
          <div class="mt-3 flex gap-4 items-center">
            <a :href="`/evento/${report.event?.uuid}`" target="_blank" class="text-xs font-semibold text-primary-600 hover:underline">Ver evento →</a>
            <button
              v-if="report.event?.user"
              @click="openCreatorModal(report.event)"
              class="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
            >
              👤 Ver creador
            </button>
            
            <button
              v-if="report.status === 'pending'"
              @click="markReviewed(report)"
              :disabled="reviewing === report.id"
              class="text-xs font-semibold text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-3 py-1 rounded-full hover:bg-zinc-50 disabled:opacity-50 ml-auto"
            >
              {{ reviewing === report.id ? 'Marcando...' : '✓ Marcar como revisado' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 bg-white rounded-2xl border border-zinc-100">
      <p class="text-4xl mb-3">✅</p>
      <p class="text-zinc-500 font-medium">No hay reportes {{ filter === 'pending' ? 'pendientes' : '' }} en este momento.</p>
    </div>

    <!-- Creator Details & Blocking Modal -->
    <div v-if="showingCreatorModal && selectedUser" class="fixed inset-0 z-[60] bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        <div class="p-6 border-b border-zinc-50 bg-zinc-50/50 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-zinc-900">Perfil del Creador</h3>
            <p class="text-xs text-zinc-400 mt-0.5">Gestión de bloqueo y seguridad</p>
          </div>
          <button @click="closeCreatorModal" class="text-zinc-400 hover:text-zinc-900 text-2xl transition-colors">&times;</button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- User Info -->
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-2xl">👤</div>
              <div>
                <h4 class="font-bold text-zinc-900">{{ selectedUser.name }}</h4>
                <p class="text-xs text-zinc-500">{{ selectedUser.email }}</p>
                <p class="text-xs text-zinc-400 mt-0.5" v-if="selectedUser.phone">📞 {{ selectedUser.phone }}</p>
              </div>
            </div>
          </div>

          <!-- Event Block Section -->
          <div class="border-t border-zinc-100 pt-6 space-y-3">
            <h4 class="font-bold text-sm text-zinc-800">Acceso al Evento</h4>
            <div class="p-4 rounded-2xl flex items-center justify-between border" :class="showingCreatorModal.is_blocked ? 'bg-rose-50 border-rose-100' : 'bg-zinc-50 border-zinc-100'">
              <div class="min-w-0 flex-1 mr-3">
                <p class="text-xs font-bold truncate" :class="showingCreatorModal.is_blocked ? 'text-rose-700' : 'text-zinc-700'">
                  {{ showingCreatorModal.name }}
                </p>
                <p class="text-[10px] text-zinc-400 mt-0.5">
                  Estado actual: <span class="font-bold">{{ showingCreatorModal.is_blocked ? 'BLOQUEADO' : 'ACTIVO' }}</span>
                </p>
              </div>
              <UiButton
                @click="toggleEventBlock"
                :disabled="isUpdatingBlock"
                size="sm"
                :class="showingCreatorModal.is_blocked ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'"
                class="font-black text-[10px] uppercase h-8 px-3 rounded-lg shrink-0"
              >
                {{ showingCreatorModal.is_blocked ? 'Desbloquear' : 'Bloquear Evento' }}
              </UiButton>
            </div>
          </div>

          <!-- User Profile Block Section -->
          <div class="border-t border-zinc-100 pt-6 space-y-4">
            <h4 class="font-bold text-sm text-zinc-800">Bloqueo de Perfil</h4>
            
            <!-- If currently blocked -->
            <div v-if="selectedUser.is_currently_blocked" class="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-3">
              <div class="text-xs text-rose-700 font-bold flex items-center gap-1.5">
                <span>🚫</span>
                <span>Perfil actualmente BLOQUEADO</span>
              </div>
              <p class="text-[10px] text-rose-600" v-if="selectedUser.is_blocked">
                El bloqueo es permanente (para siempre).
              </p>
              <p class="text-[10px] text-rose-600" v-else-if="selectedUser.blocked_until">
                Bloqueado hasta: {{ new Date(selectedUser.blocked_until).toLocaleDateString('es-CL') }}
              </p>
              <UiButton
                @click="unblockProfile"
                :disabled="isUpdatingBlock"
                class="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase h-9 rounded-xl"
              >
                {{ isUpdatingBlock ? 'Procesando...' : 'Desbloquear Perfil' }}
              </UiButton>
            </div>

            <!-- If currently active -->
            <div v-else class="space-y-4 bg-zinc-50 border border-zinc-100 p-4 rounded-2xl">
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Tipo de Bloqueo</label>
                <div class="flex flex-col gap-2">
                  <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700">
                    <input type="radio" value="temporary" v-model="blockForm.type" class="w-4 h-4 text-primary-600" />
                    <span>Temporal (Hasta fecha)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700">
                    <input type="radio" value="forever" v-model="blockForm.type" class="w-4 h-4 text-primary-600" />
                    <span>Permanente (Para siempre)</span>
                  </label>
                </div>
              </div>

              <!-- Date Picker for temporary block -->
              <div v-if="blockForm.type === 'temporary'" class="space-y-2">
                <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Bloquear Hasta</label>
                <UiInput type="date" v-model="blockForm.blocked_until" class="h-10 bg-white" :min="todayDate" required />
              </div>

              <UiButton
                @click="blockProfile"
                :disabled="isUpdatingBlock || (blockForm.type === 'temporary' && !blockForm.blocked_until)"
                class="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black text-[10px] uppercase h-10 rounded-xl"
              >
                {{ isUpdatingBlock ? 'Procesando...' : 'Aplicar Bloqueo de Perfil' }}
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCookie, useHead, useFetch } from '#imports';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Reportes de Eventos - Admin' });

const token = useCookie('auth_token');
const config = useRuntimeConfig();
const filter = ref('all');
const reviewing = ref<number | null>(null);

// Modal and blocking states
const showingCreatorModal = ref<any>(null);
const selectedUser = ref<any>(null);
const isUpdatingBlock = ref(false);

const blockForm = ref({
  type: 'temporary',
  blocked_until: ''
});

const todayDate = computed(() => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
});

const openCreatorModal = (event: any) => {
  showingCreatorModal.value = event;
  selectedUser.value = event.user;
  blockForm.value = {
    type: 'temporary',
    blocked_until: ''
  };
};

const closeCreatorModal = () => {
  showingCreatorModal.value = null;
  selectedUser.value = null;
};

const toggleEventBlock = async () => {
  if (!showingCreatorModal.value) return;
  
  const isBlocked = showingCreatorModal.value.is_blocked;
  const action = isBlocked ? 'unblock' : 'block';
  const confirmMsg = isBlocked 
    ? '¿Estás seguro de que deseas desbloquear el acceso a este evento?'
    : '¿Estás seguro de que deseas bloquear el acceso a este evento de forma pública?';
    
  if (!confirm(confirmMsg)) return;
  
  isUpdatingBlock.value = true;
  try {
    await $fetch(`${config.public.apiBase}/api/admin/events/${showingCreatorModal.value.id}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    showingCreatorModal.value.is_blocked = !isBlocked;
    await refresh();
  } catch (err) {
    console.error(err);
    alert('Error al actualizar el estado de bloqueo del evento');
  } finally {
    isUpdatingBlock.value = false;
  }
};

const blockProfile = async () => {
  if (!selectedUser.value) return;
  
  const confirmMsg = blockForm.value.type === 'forever'
    ? '¿Estás seguro de bloquear permanentemente este perfil? Se cerrarán todas sus sesiones.'
    : `¿Estás seguro de bloquear temporalmente este perfil hasta el ${blockForm.value.blocked_until}?`;
    
  if (!confirm(confirmMsg)) return;
  
  isUpdatingBlock.value = true;
  try {
    const body = {
      type: blockForm.value.type,
      blocked_until: blockForm.value.type === 'temporary' ? blockForm.value.blocked_until : null
    };
    
    const res: any = await $fetch(`${config.public.apiBase}/api/admin/users/${selectedUser.value.id}/block`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body
    });
    
    selectedUser.value.is_blocked = res.user.is_blocked;
    selectedUser.value.blocked_until = res.user.blocked_until;
    selectedUser.value.is_currently_blocked = true;
    await refresh();
  } catch (err) {
    console.error(err);
    alert('Error al bloquear el perfil');
  } finally {
    isUpdatingBlock.value = false;
  }
};

const unblockProfile = async () => {
  if (!selectedUser.value) return;
  
  if (!confirm('¿Estás seguro de desbloquear este perfil?')) return;
  
  isUpdatingBlock.value = true;
  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/admin/users/${selectedUser.value.id}/unblock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    selectedUser.value.is_blocked = false;
    selectedUser.value.blocked_until = null;
    selectedUser.value.is_currently_blocked = false;
    await refresh();
  } catch (err) {
    console.error(err);
    alert('Error al desbloquear el perfil');
  } finally {
    isUpdatingBlock.value = false;
  }
};

const { data: reports, pending, refresh } = await useFetch<any>(`${config.public.apiBase}/api/admin/reports`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const pendingCount = computed(() => reports.value?.filter((r: any) => r.status === 'pending').length ?? 0);

const filteredReports = computed(() => {
  if (!reports.value) return [];
  if (filter.value === 'all') return reports.value;
  return reports.value.filter((r: any) => r.status === filter.value);
});

const markReviewed = async (report: any) => {
  reviewing.value = report.id;
  try {
    await $fetch(`${config.public.apiBase}/api/admin/reports/${report.id}/review`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    await refresh();
  } catch (e) {
    console.error(e);
  } finally {
    reviewing.value = null;
  }
};
</script>
