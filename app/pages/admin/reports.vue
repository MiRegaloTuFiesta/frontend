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
              <p class="font-bold text-zinc-900">{{ report.event?.name }}</p>
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
          <div class="mt-3 flex gap-3">
            <a :href="`/evento/${report.event?.uuid}`" target="_blank" class="text-xs font-semibold text-primary-600 hover:underline">Ver evento →</a>
            <button
              v-if="report.status === 'pending'"
              @click="markReviewed(report)"
              :disabled="reviewing === report.id"
              class="text-xs font-semibold text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-3 py-1 rounded-full hover:bg-zinc-50 disabled:opacity-50"
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
