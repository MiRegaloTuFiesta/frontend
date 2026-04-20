<template>
  <div class="space-y-6 animate-in slide-in-from-right duration-500">
    <div class="flex justify-between items-center px-2">
      <h3 class="text-lg font-bold text-zinc-900">Mantenedor de Categorías</h3>
      <UiButton @click="openCategoryModal()" class="bg-zinc-900 text-white">Nueva Categoría</UiButton>
    </div>
    
    <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-zinc-50 border-b border-zinc-100">
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">ID</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Nombre</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Estado</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id" class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
            <td class="p-6 text-sm font-mono text-zinc-400">#{{ cat.id }}</td>
            <td class="p-6 font-bold text-zinc-900">{{ cat.name }}</td>
            <td class="p-6">
              <span :class="cat.is_active ? 'text-emerald-600 bg-emerald-50' : 'text-zinc-400 bg-zinc-50'" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">
                {{ cat.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="p-6 text-right space-x-2">
              <UiButton @click="openCategoryModal(cat)" variant="ghost" size="sm" class="text-zinc-400 hover:text-zinc-900">Editar</UiButton>
              <UiButton @click="deleteCategory(cat.id)" variant="ghost" size="sm" class="text-rose-400 hover:text-rose-600">Eliminar</UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Categoría -->
    <div v-if="isCategoryModalOpen" class="fixed inset-0 z-[60] bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-zinc-100">
        <div class="p-8 border-b border-zinc-50 flex justify-between items-center">
          <div>
            <h3 class="text-xl font-bold text-zinc-900">{{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
            <p class="text-sm text-zinc-400">Gestión de tipos de eventos</p>
          </div>
          <button @click="isCategoryModalOpen = false" class="text-zinc-300 hover:text-zinc-900 text-2xl transition-colors">&times;</button>
        </div>
        <form @submit.prevent="saveCategory" class="p-8 space-y-6">
          <div class="space-y-3">
            <UiLabel for="catName" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Nombre de la Categoría</UiLabel>
            <UiInput id="catName" v-model="categoryForm.name" class="h-12 text-lg font-bold" placeholder="Ej: Matrimonio, Cumpleaños" required />
          </div>

          <div class="flex items-center gap-3">
            <input type="checkbox" id="catActive" v-model="categoryForm.is_active" class="w-5 h-5 rounded border-zinc-300 text-primary-600 focus:ring-primary-500" />
            <UiLabel for="catActive" class="text-sm font-semibold text-zinc-700">Categoría Activa</UiLabel>
          </div>
          
          <div class="pt-4 flex flex-col gap-3">
            <UiButton type="submit" class="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-bold transition-all">
              {{ editingCategory ? 'Actualizar Categoría' : 'Crear Categoría' }}
            </UiButton>
            <UiButton type="button" variant="ghost" @click="isCategoryModalOpen = false" class="w-full text-zinc-400 hover:text-zinc-600">Cancelar</UiButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCookie, useRuntimeConfig, useFetch } from '#imports';

definePageMeta({ layout: 'admin' });

const token = useCookie('auth_token');
const config = useRuntimeConfig();

const { data: categories, refresh: refreshCategories } = await useFetch<any>(`${config.public.apiBase}/api/admin/categories`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const isCategoryModalOpen = ref(false);
const editingCategory = ref<any>(null);
const categoryForm = ref({ name: '', is_active: true });

const openCategoryModal = (cat: any = null) => {
  editingCategory.value = cat;
  if (cat) {
    categoryForm.value = { name: cat.name, is_active: !!cat.is_active };
  } else {
    categoryForm.value = { name: '', is_active: true };
  }
  isCategoryModalOpen.value = true;
};

const saveCategory = async () => {
  try {
    const url = editingCategory.value 
      ? `${config.public.apiBase}/api/admin/categories/${editingCategory.value.id}`
      : `${config.public.apiBase}/api/admin/categories`;
    
    await $fetch(url, {
      method: editingCategory.value ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: categoryForm.value
    });
    
    isCategoryModalOpen.value = false;
    await refreshCategories();
  } catch (err) {
    console.error(err);
    alert('Error al guardar categoría');
  }
};

const deleteCategory = async (id: number) => {
  if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
  try {
    await $fetch(`${config.public.apiBase}/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    await refreshCategories();
  } catch (err) {
    console.error(err);
    alert('Error al eliminar categoría');
  }
};
</script>
