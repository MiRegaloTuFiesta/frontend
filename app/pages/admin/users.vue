<template>
  <div class="animate-in slide-in-from-right duration-500 space-y-6">
    <!-- Buscador -->
    <div class="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">🔍</span>
        <UiInput v-model="searchQuery" placeholder="Buscar por nombre o email..." class="pl-10 h-11" />
      </div>
      <div v-if="pending" class="text-zinc-400 animate-spin text-xl">🔄</div>
    </div>

    <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-zinc-50 border-b border-zinc-100">
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Nombre</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Email</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Rol</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Fecha Registro</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usersList" :key="u.id" class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
            <td class="p-6 font-bold text-zinc-900">{{ u.name }}</td>
            <td class="p-6 text-zinc-600">{{ u.email }}</td>
            <td class="p-6">
               <span :class="u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'" class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border">
                 {{ u.role }}
               </span>
            </td>
            <td class="p-6 text-zinc-500 text-sm">{{ new Date(u.created_at).toLocaleDateString() }}</td>
            <td class="p-6 text-right space-x-2">
              <UiButton @click="openUserModal(u)" variant="ghost" size="sm" class="text-zinc-400 hover:text-zinc-900 border border-transparent hover:border-zinc-200">Editar</UiButton>
              <UiButton @click="deleteUser(u.id)" variant="ghost" size="sm" class="text-rose-400 hover:text-rose-600 border border-transparent hover:border-rose-100">Eliminar</UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Editar Usuario -->
    <div v-if="isUserModalOpen" class="fixed inset-0 z-[60] bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-md shadow-2xl overflow-hidden border border-zinc-100">
        <div class="p-8 border-b border-zinc-50 flex justify-between items-center">
          <div>
            <h3 class="text-xl font-bold text-zinc-900">Editar Usuario</h3>
            <p class="text-sm text-zinc-400">Actualiza permisos y datos</p>
          </div>
          <button @click="isUserModalOpen = false" class="text-zinc-300 hover:text-zinc-900 text-2xl transition-colors">&times;</button>
        </div>
        <form @submit.prevent="saveUser" class="p-8 space-y-6">
          <div class="space-y-3">
            <UiLabel for="userName" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Nombre Completo</UiLabel>
            <UiInput id="userName" v-model="userForm.name" class="h-12" required />
          </div>

          <div class="space-y-3">
            <UiLabel for="userEmail" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Email</UiLabel>
            <UiInput id="userEmail" type="email" v-model="userForm.email" class="h-12" required />
          </div>

          <div class="space-y-3">
            <UiLabel for="userRole" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Rol del Sistema</UiLabel>
            <select id="userRole" v-model="userForm.role" class="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="creator">Creador (Estandar)</option>
              <option value="admin">Administrador (Acceso Total)</option>
            </select>
          </div>
          
          <div class="pt-4 flex flex-col gap-3">
            <UiButton type="submit" class="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-bold transition-all">
              Guardar Cambios
            </UiButton>
            <UiButton type="button" variant="ghost" @click="isUserModalOpen = false" class="w-full text-zinc-400 hover:text-zinc-600">Cancelar</UiButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCookie, useRouter, useRuntimeConfig, useFetch } from '#imports';
import { refDebounced } from '@vueuse/core';

definePageMeta({ layout: 'admin' });

const router = useRouter();
const token = useCookie('auth_token');
const config = useRuntimeConfig();

const searchQuery = ref('');
const debouncedSearch = refDebounced(searchQuery, 400);

// Global Auth Check for current user
const { data: currentUser } = await useFetch<any>(`${config.public.apiBase}/api/user`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const { data: usersList, refresh: refreshUsers, pending } = await useFetch<any>(`${config.public.apiBase}/api/admin/users`, {
  headers: { Authorization: `Bearer ${token.value}` },
  query: { search: debouncedSearch },
  watch: [debouncedSearch]
});

const isUserModalOpen = ref(false);
const editingUser = ref<any>(null);
const userForm = ref({ name: '', email: '', role: 'creator' });

const openUserModal = (u: any) => {
  editingUser.value = u;
  userForm.value = { name: u.name, email: u.email, role: u.role };
  isUserModalOpen.value = true;
};

const saveUser = async () => {
  if (!editingUser.value) return;
  try {
    await $fetch(`${config.public.apiBase}/api/admin/users/${editingUser.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: userForm.value
    });
    isUserModalOpen.value = false;
    await refreshUsers();
  } catch (err) {
    console.error(err);
    alert('Error al actualizar usuario');
  }
};

const deleteUser = async (id: number) => {
  if (id === currentUser.value?.id) {
    alert('No puedes eliminarte a ti mismo');
    return;
  }
  if (!confirm('¿Seguro que deseas eliminar este usuario? Esta acción es irreversible.')) return;
  try {
    await $fetch(`${config.public.apiBase}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    await refreshUsers();
  } catch (err) {
    console.error(err);
    alert('Error al eliminar usuario');
  }
};
</script>
