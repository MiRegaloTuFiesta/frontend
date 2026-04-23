<template>
  <div class="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
    <!-- Bancos Section -->
    <div class="space-y-6">
      <div class="flex justify-between items-center px-2">
        <div>
          <h3 class="text-xl font-bold text-zinc-900">Entidades Bancarias</h3>
          <p class="text-sm text-zinc-500">Gestión de bancos habilitados para transferencias</p>
        </div>
        <UiButton @click="openBankModal()" class="bg-zinc-900 text-white">Nuevo Banco</UiButton>
      </div>

      <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-zinc-50 border-b border-zinc-100">
              <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Banco</th>
              <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-center">Estado</th>
              <th class="p-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bank in banks" :key="bank.id" class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
              <td class="p-6">
                <p class="font-bold text-zinc-900">{{ bank.name }}</p>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span v-for="type in bank.account_types" :key="type.id" class="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-bold uppercase">
                    {{ type.name }}
                  </span>
                </div>
              </td>
              <td class="p-6 text-center">
                <span :class="bank.is_active ? 'text-emerald-600 bg-emerald-50' : 'text-zinc-400 bg-zinc-50'" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter shadow-sm border border-current/10">
                  {{ bank.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="p-6 text-right space-x-2">
                <UiButton @click="openBankModal(bank)" variant="ghost" size="sm" class="text-zinc-400 hover:text-zinc-900">Editar</UiButton>
                <UiButton @click="deleteBank(bank.id)" variant="ghost" size="sm" class="text-rose-400 hover:text-rose-600">Eliminar</UiButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tipos de Cuenta Section (Global) -->
    <div class="space-y-6 pt-10 border-t border-zinc-100">
      <div class="flex justify-between items-center px-2">
        <div>
          <h3 class="text-xl font-bold text-zinc-900">Tipos de Cuenta</h3>
          <p class="text-sm text-zinc-500">Definiciones globales (Ej: Cuenta Corriente, Cuenta RUT)</p>
        </div>
        <UiButton @click="isTypeModalOpen = true" variant="outline" class="border-zinc-300 text-zinc-700">Crear Tipo de Cuenta</UiButton>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="type in accountTypes" :key="type.id" class="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex items-center justify-between">
          <span class="font-bold text-zinc-800">{{ type.name }}</span>
          <span :class="type.is_active ? 'text-emerald-500' : 'text-zinc-300'">●</span>
        </div>
      </div>
    </div>

    <!-- Modal Banco -->
    <div v-if="isBankModalOpen" class="fixed inset-0 z-[60] bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-zinc-100 animate-in zoom-in duration-300">
        <div class="p-8 border-b border-zinc-50 flex justify-between items-center">
          <div>
            <h3 class="text-xl font-bold text-zinc-900">{{ editingBank ? 'Editar Banco' : 'Nuevo Banco' }}</h3>
            <p class="text-sm text-zinc-400">Entidad bancaria del sistema</p>
          </div>
          <button @click="isBankModalOpen = false" class="text-zinc-300 hover:text-zinc-900 text-2xl">&times;</button>
        </div>
        <form @submit.prevent="saveBank" class="p-8 space-y-6">
          <div class="space-y-3">
            <UiLabel for="bankName">Nombre del Banco</UiLabel>
            <UiInput id="bankName" v-model="bankForm.name" class="h-12 text-lg font-bold" placeholder="Ej: Banco Estado" required />
          </div>

          <div class="space-y-3">
            <UiLabel>Tipos de Cuenta Habilitados</UiLabel>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="type in accountTypes" :key="type.id" class="flex items-center gap-2 p-3 rounded-xl border border-zinc-100 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-all" @click="toggleType(type.id)">
                <input type="checkbox" :checked="bankForm.account_type_ids.includes(type.id)" class="w-4 h-4 rounded border-zinc-300" @click.stop="toggleType(type.id)" />
                <span class="text-xs font-bold text-zinc-700">{{ type.name }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <input type="checkbox" id="bankActive" v-model="bankForm.is_active" class="w-5 h-5 rounded border-zinc-300 text-primary-600" />
            <UiLabel for="bankActive" class="text-sm font-semibold text-zinc-700">Banco Activo</UiLabel>
          </div>
          
          <div class="pt-4 flex flex-col gap-3">
            <UiButton type="submit" class="w-full h-12 bg-zinc-900 text-white font-bold rounded-xl" :disabled="isSavingBank">
              {{ isSavingBank ? 'Guardando...' : (editingBank ? 'Actualizar' : 'Crear') }}
            </UiButton>
            <UiButton type="button" variant="ghost" @click="isBankModalOpen = false" class="w-full text-zinc-400">Cancelar</UiButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Tipo de Cuenta -->
    <div v-if="isTypeModalOpen" class="fixed inset-0 z-[60] bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-zinc-100 animate-in zoom-in duration-300">
        <div class="p-6 border-b border-zinc-50 flex justify-between items-center">
            <h3 class="text-lg font-bold text-zinc-900">Nuevo Tipo de Cuenta</h3>
            <button @click="isTypeModalOpen = false" class="text-zinc-300 hover:text-zinc-900 text-xl">&times;</button>
        </div>
        <form @submit.prevent="saveType" class="p-6 space-y-6">
          <div class="space-y-3">
            <UiLabel for="typeName">Nombre (Ej: Cuenta Corriente)</UiLabel>
            <UiInput id="typeName" v-model="typeForm.name" class="h-12" required />
          </div>
          <div class="pt-4 space-y-3">
            <UiButton type="submit" class="w-full h-11 bg-zinc-900 text-white font-bold rounded-xl" :disabled="isSavingType">
                {{ isSavingType ? 'Guardando...' : 'Crear Tipo' }}
            </UiButton>
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

// Fetch Data
const { data: banks, refresh: refreshBanks } = await useFetch<any>(`${config.public.apiBase}/api/admin/banks`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const { data: accountTypes, refresh: refreshTypes } = await useFetch<any>(`${config.public.apiBase}/api/admin/account-types`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

// Bank Modal Logic
const isBankModalOpen = ref(false);
const editingBank = ref<any>(null);
const isSavingBank = ref(false);
const bankForm = ref({ name: '', is_active: true, account_type_ids: [] as number[] });

const openBankModal = (bank: any = null) => {
  editingBank.value = bank;
  if (bank) {
    bankForm.value = { 
        name: bank.name, 
        is_active: !!bank.is_active,
        account_type_ids: bank.account_types?.map((t: any) => t.id) || []
    };
  } else {
    bankForm.value = { name: '', is_active: true, account_type_ids: [] };
  }
  isBankModalOpen.value = true;
};

const toggleType = (id: number) => {
  const index = bankForm.value.account_type_ids.indexOf(id);
  if (index === -1) bankForm.value.account_type_ids.push(id);
  else bankForm.value.account_type_ids.splice(index, 1);
};

const saveBank = async () => {
    isSavingBank.value = true;
    try {
        const url = editingBank.value 
            ? `${config.public.apiBase}/api/admin/banks/${editingBank.value.id}`
            : `${config.public.apiBase}/api/admin/banks`;
        
        await $fetch(url, {
            method: editingBank.value ? 'PUT' : 'POST',
            headers: { Authorization: `Bearer ${token.value}` },
            body: bankForm.value
        });
        isBankModalOpen.value = false;
        await refreshBanks();
    } catch (err) {
        console.error(err);
        alert('Error al guardar banco');
    } finally {
        isSavingBank.value = false;
    }
};

const deleteBank = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este banco?')) return;
    try {
        await $fetch(`${config.public.apiBase}/api/admin/banks/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token.value}` }
        });
        await refreshBanks();
    } catch (err) {
        console.error(err);
        alert('Error al eliminar');
    }
};

// Type Modal Logic
const isTypeModalOpen = ref(false);
const isSavingType = ref(false);
const typeForm = ref({ name: '', is_active: true });

const saveType = async () => {
    isSavingType.value = true;
    try {
        await $fetch(`${config.public.apiBase}/api/admin/account-types`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token.value}` },
            body: typeForm.value
        });
        isTypeModalOpen.value = false;
        typeForm.value.name = '';
        await refreshTypes();
    } catch (err) {
        console.error(err);
        alert('Error al crear tipo de cuenta');
    } finally {
        isSavingType.value = false;
    }
};
</script>
