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

    <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden overflow-x-auto">
      <table class="w-full text-left min-w-[800px]">
        <thead>
          <tr class="bg-zinc-50 border-b border-zinc-100">
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Avatar</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Nombre</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Email</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Rol</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Fecha Registro</th>
            <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usersList" :key="u.id" class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
            <td class="p-6">
              <div class="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center">
                <img v-if="u.profile_photo_url" :src="u.profile_photo_url" class="w-full h-full object-cover" />
                <span v-else class="text-xl">👤</span>
              </div>
            </td>
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
      <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[95vh]">
        <div class="p-8 border-b border-zinc-50 flex justify-between items-center">
          <div>
            <h3 class="text-xl font-bold text-zinc-900">Editar Usuario</h3>
            <p class="text-sm text-zinc-400">Actualiza permisos y datos</p>
          </div>
          <button @click="isUserModalOpen = false" class="text-zinc-300 hover:text-zinc-900 text-2xl transition-colors">&times;</button>
        </div>
        <form @submit.prevent="saveUser" class="p-8 space-y-6 overflow-y-auto flex-1">
          <div class="flex items-center gap-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div class="relative group">
              <div class="w-20 h-20 rounded-full bg-white border-2 border-zinc-200 overflow-hidden flex items-center justify-center relative">
                <img v-if="photoPreview" :src="photoPreview" class="w-full h-full object-cover" />
                <span v-else class="text-2xl">👤</span>
                <label class="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[9px] font-bold uppercase text-center p-2">
                  Cambiar
                  <input type="file" class="hidden" accept="image/*" @change="onFileChange" />
                </label>
              </div>
            </div>
            <div class="flex-1 space-y-3">
              <div class="flex items-center space-x-2">
                <input type="checkbox" id="is_public" v-vee-model="userForm.is_profile_photo_public" v-model="userForm.is_profile_photo_public" class="w-4 h-4 text-zinc-900 rounded border-zinc-300 focus:ring-zinc-900" />
                <UiLabel for="is_public" class="text-xs font-bold cursor-pointer">Foto pública en eventos</UiLabel>
              </div>
              <p class="text-[9px] text-zinc-400 leading-tight">Si se activa, el usuario mostrará su foto en la lista de deseos de sus eventos.</p>
            </div>
          </div>

          <div class="space-y-3">
            <UiLabel for="userName" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Nombre Completo</UiLabel>
            <UiInput id="userName" v-model="userForm.name" class="h-12" required />
          </div>

          <div class="space-y-3">
            <UiLabel for="userEmail" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Email</UiLabel>
            <UiInput id="userEmail" type="email" v-model="userForm.email" class="h-12" required />
          </div>

          <div class="space-y-3">
            <UiLabel for="userPhone" class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Teléfono de Contacto</UiLabel>
            <UiInput id="userPhone" type="tel" v-model="userForm.phone" placeholder="+56 9 1234 5678" class="h-12" />
          </div>

          <div v-if="editingUser" class="space-y-1 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            <span class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest block">Fecha de Registro</span>
            <p class="text-sm font-medium text-zinc-900">{{ new Date(editingUser.created_at).toLocaleString() }}</p>
          </div>

          <div v-if="editingUser" class="space-y-1 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            <span class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest block mb-2">Datos Bancarios</span>
            <div v-if="editingUser.bank || editingUser.bank_id" class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-zinc-400 text-[10px] uppercase font-bold block">Banco</span>
                <p class="font-medium text-zinc-900">{{ editingUser.bank?.name || editingUser.bank_id || 'N/A' }}</p>
              </div>
              <div>
                <span class="text-zinc-400 text-[10px] uppercase font-bold block">Tipo de Cuenta</span>
                <p class="font-medium text-zinc-900">{{ editingUser.account_type?.name || editingUser.account_type_id || 'N/A' }}</p>
              </div>
              <div>
                <span class="text-zinc-400 text-[10px] uppercase font-bold block">N° de Cuenta</span>
                <p class="font-medium text-zinc-900">{{ editingUser.account_number || 'N/A' }}</p>
              </div>
              <div>
                <span class="text-zinc-400 text-[10px] uppercase font-bold block">RUT Bancario</span>
                <p class="font-medium text-zinc-900">{{ editingUser.bank_rut || 'N/A' }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-zinc-400 italic">El usuario aún no registra datos bancarios.</p>
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
const userForm = ref({ name: '', email: '', phone: '', role: 'creator', is_profile_photo_public: false });
const profilePhotoFile = ref<File | null>(null);
const photoPreview = ref<string | null>(null);

const onFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
        profilePhotoFile.value = file;
        photoPreview.value = URL.createObjectURL(file);
    }
};

const openUserModal = (u: any) => {
  editingUser.value = u;
  userForm.value = { 
    name: u.name, 
    email: u.email, 
    phone: u.phone || '', 
    role: u.role,
    is_profile_photo_public: u.is_profile_photo_public || false
  };
  photoPreview.value = u.profile_photo_url || null;
  profilePhotoFile.value = null;
  isUserModalOpen.value = true;
};

const saveUser = async () => {
  if (!editingUser.value) return;
  try {
    const formData = new FormData();
    Object.entries(userForm.value).forEach(([key, value]) => {
        if (value !== null) {
            if (typeof value === 'boolean') {
                formData.append(key, value ? '1' : '0');
            } else {
                formData.append(key, value as string);
            }
        }
    });

    if (profilePhotoFile.value) {
        formData.append('profile_photo', profilePhotoFile.value);
    }

    // Laravel trick for PUT with files
    formData.append('_method', 'PUT');

    await $fetch(`${config.public.apiBase}/api/admin/users/${editingUser.value.id}`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token.value}`,
        'Accept': 'application/json'
      },
      body: formData
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
