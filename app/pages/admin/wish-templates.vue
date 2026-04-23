<template>
  <div class="space-y-6 animate-in slide-in-from-right duration-500">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
      <div>
        <h3 class="text-xl font-bold text-zinc-900">Plantillas de Deseos</h3>
        <p class="text-sm text-zinc-500">Gestiona las opciones predefinidas para los creadores</p>
      </div>
      <UiButton @click="openTemplateModal()" class="bg-zinc-900 text-white shadow-lg shadow-zinc-900/10">Nueva Plantilla</UiButton>
    </div>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
      <div class="relative flex-1 w-full">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">🔍</span>
        <UiInput v-model="searchQuery" placeholder="Buscar por nombre o descripción..." class="pl-10 h-11" />
      </div>
      <div class="w-full md:w-64">
        <select v-model="filterCategory" class="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <div v-if="pending" class="text-zinc-400 animate-spin text-xl">🔄</div>
    </div>
    
    <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-zinc-50 border-b border-zinc-100">
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Plantilla</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Categorías</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tpl in templates" :key="tpl.id" class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
            <td class="p-6">
              <p class="font-bold text-zinc-900">{{ tpl.name }}</p>
              <p class="text-xs text-zinc-500 line-clamp-1 max-w-md mt-0.5">{{ tpl.description }}</p>
            </td>
            <td class="p-6">
              <div class="flex flex-wrap gap-1.5">
                <span v-for="cat in tpl.categories" :key="cat.id" class="px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-100 text-[10px] font-extrabold uppercase">
                  {{ cat.name }}
                </span>
                <span v-if="!tpl.categories?.length" class="text-zinc-400 text-[10px] uppercase font-bold italic">Sin categoría</span>
              </div>
            </td>
            <td class="p-6 text-right space-x-2">
              <UiButton @click="openTemplateModal(tpl)" variant="ghost" size="sm" class="text-zinc-400 hover:text-zinc-900">Editar</UiButton>
              <UiButton @click="deleteTemplate(tpl.id)" variant="ghost" size="sm" class="text-rose-400 hover:text-rose-600">Eliminar</UiButton>
            </td>
          </tr>
          <tr v-if="templates?.length === 0 && !pending">
            <td colspan="3" class="p-12 text-center text-zinc-400 italic">No se encontraron plantillas.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Plantilla -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[60] bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-zinc-100 animate-in fade-in zoom-in duration-300">
        <div class="p-8 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 class="text-xl font-bold text-zinc-900">{{ editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla' }}</h3>
            <p class="text-sm text-zinc-400">Define el contenido predeterminado</p>
          </div>
          <button @click="isModalOpen = false" class="text-zinc-300 hover:text-zinc-900 text-2xl transition-colors">&times;</button>
        </div>
        <form @submit.prevent="saveTemplate" class="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div class="space-y-3">
            <UiLabel for="tplName" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Nombre del Deseo</UiLabel>
            <UiInput id="tplName" v-model="form.name" class="h-12 text-lg font-bold" placeholder="Ej: Viaje a la playa" required />
          </div>

          <div class="space-y-3">
            <UiLabel for="tplDesc" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Descripción predeterminada</UiLabel>
            <textarea id="tplDesc" v-model="form.description" rows="4" class="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Escribe el mensaje que verá el invitado..."></textarea>
          </div>

          <div class="space-y-3">
            <UiLabel class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Asignar a Categorías</UiLabel>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <div v-for="cat in categories" :key="cat.id" class="flex items-center gap-2 group cursor-pointer" @click="toggleCategory(cat.id)">
                <div class="w-5 h-5 rounded border border-zinc-300 flex items-center justify-center transition-all" :class="form.category_ids.includes(cat.id) ? 'bg-primary border-primary' : 'bg-white group-hover:border-primary'">
                  <span v-if="form.category_ids.includes(cat.id)" class="text-white text-xs">✓</span>
                </div>
                <span class="text-xs font-semibold text-zinc-600 group-hover:text-zinc-900">{{ cat.name }}</span>
              </div>
            </div>
          </div>
          
          <div class="pt-4 flex flex-col sm:flex-row gap-3">
            <UiButton type="submit" class="flex-1 h-12 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-bold transition-all shadow-lg shadow-zinc-900/10" :disabled="isSaving">
              {{ isSaving ? 'Guardando...' : (editingTemplate ? 'Actualizar Plantilla' : 'Crear Plantilla') }}
            </UiButton>
            <UiButton type="button" variant="ghost" @click="isModalOpen = false" class="h-12 text-zinc-400 hover:text-zinc-600">Cancelar</UiButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCookie, useRuntimeConfig, useFetch } from '#imports';
import { refDebounced } from '@vueuse/core';

definePageMeta({ layout: 'admin' });

const token = useCookie('auth_token');
const config = useRuntimeConfig();

const searchQuery = ref('');
const debouncedSearch = refDebounced(searchQuery, 400);
const filterCategory = ref('');

// Data Fetching
const { data: categories } = await useFetch<any>(`${config.public.apiBase}/api/categories`);

const { data: templates, refresh: refreshTemplates, pending } = await useFetch<any>(`${config.public.apiBase}/api/admin/wish-templates`, {
  headers: { Authorization: `Bearer ${token.value}` },
  query: { 
    search: debouncedSearch,
    category_id: filterCategory
  },
  watch: [debouncedSearch, filterCategory]
});

// Modal Logic
const isModalOpen = ref(false);
const isSaving = ref(false);
const editingTemplate = ref<any>(null);
const form = ref({
  name: '',
  description: '',
  category_ids: [] as number[]
});

const openTemplateModal = (tpl: any = null) => {
  editingTemplate.value = tpl;
  if (tpl) {
    form.value = {
      name: tpl.name,
      description: tpl.description || '',
      category_ids: tpl.categories?.map((c: any) => c.id) || []
    };
  } else {
    form.value = {
      name: '',
      description: '',
      category_ids: []
    };
  }
  isModalOpen.value = true;
};

const toggleCategory = (id: number) => {
  const index = form.value.category_ids.indexOf(id);
  if (index === -1) form.value.category_ids.push(id);
  else form.value.category_ids.splice(index, 1);
};

const saveTemplate = async () => {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    const url = editingTemplate.value 
      ? `${config.public.apiBase}/api/admin/wish-templates/${editingTemplate.value.id}`
      : `${config.public.apiBase}/api/admin/wish-templates`;
    
    await $fetch(url, {
      method: editingTemplate.value ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: form.value
    });
    
    isModalOpen.value = false;
    await refreshTemplates();
  } catch (err) {
    console.error(err);
    alert('Error al guardar plantilla');
  } finally {
    isSaving.value = false;
  }
};

const deleteTemplate = async (id: number) => {
  if (!confirm('¿Seguro que deseas eliminar esta plantilla?')) return;
  try {
    await $fetch(`${config.public.apiBase}/api/admin/wish-templates/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    await refreshTemplates();
  } catch (err) {
    console.error(err);
    alert('Error al eliminar plantilla');
  }
};
</script>
