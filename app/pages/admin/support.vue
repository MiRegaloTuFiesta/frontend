<template>
  <div class="h-[calc(100vh-8.5rem)] flex border border-zinc-200/80 bg-white rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-right duration-500">
    <!-- Panel Izquierdo: Lista de Chats -->
    <div class="w-80 md:w-96 border-r border-zinc-150 flex flex-col bg-zinc-50/50 shrink-0">
      <!-- Search and Header -->
      <div class="p-4 border-b border-zinc-200/60 bg-white shrink-0">
        <h3 class="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-3 px-1">Mensajes de Soporte</h3>
        <div class="relative">
          <span class="absolute inset-y-0 left-3 flex items-center text-zinc-400 pointer-events-none">🔍</span>
          <UiInput 
            v-model="searchTerm" 
            placeholder="Buscar por organizador o email..." 
            class="pl-9 h-10 border-zinc-200 bg-zinc-50/30 focus:bg-white text-xs"
          />
        </div>
      </div>

      <!-- Thread list -->
      <div class="flex-grow overflow-y-auto divide-y divide-zinc-100 p-2 space-y-1">
        <div v-if="loadingThreads" class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin text-xl text-zinc-400">🔄</div>
          <p class="text-xs text-zinc-400 mt-2">Cargando conversaciones...</p>
        </div>
        <div v-else-if="filteredThreads.length === 0" class="text-center py-12 text-zinc-400 italic text-xs px-4">
          No se encontraron conversaciones de soporte.
        </div>
        <button 
          v-else
          v-for="thread in filteredThreads" 
          :key="thread.id"
          @click="selectThread(thread)"
          class="w-full text-left p-4 rounded-xl transition-all flex items-start gap-3 relative group"
          :class="selectedCreator?.id === thread.id 
            ? 'bg-zinc-900 text-white shadow-md' 
            : 'hover:bg-zinc-100/80 text-zinc-700 bg-white border border-zinc-100/50'"
        >
          <!-- Avatar Icon -->
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold shadow-sm"
            :class="selectedCreator?.id === thread.id ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-700'"
          >
            {{ thread.name.substring(0, 2).toUpperCase() }}
          </div>

          <!-- Thread Details -->
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline mb-1">
              <h4 
                class="text-xs font-black truncate"
                :class="selectedCreator?.id === thread.id ? 'text-white' : 'text-zinc-900'"
              >
                {{ thread.name }}
              </h4>
              <span 
                v-if="thread.last_message_at" 
                class="text-[9px] font-medium shrink-0 ml-1.5"
                :class="selectedCreator?.id === thread.id ? 'text-zinc-400' : 'text-zinc-400'"
              >
                {{ formatTime(thread.last_message_at) }}
              </span>
            </div>
            
            <p 
              class="text-[11px] truncate leading-normal"
              :class="[
                selectedCreator?.id === thread.id ? 'text-zinc-300' : 'text-zinc-500',
                thread.unread_count > 0 ? 'font-bold' : 'font-normal'
              ]"
            >
              {{ thread.last_message || 'Inició un chat de soporte' }}
            </p>
          </div>

          <!-- Unread Badge -->
          <span 
            v-if="thread.unread_count > 0 && selectedCreator?.id !== thread.id" 
            class="absolute right-4 bottom-4 bg-emerald-500 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center"
          >
            {{ thread.unread_count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Panel Derecho: Conversación Activa -->
    <div class="flex-grow flex flex-col h-full bg-zinc-50/20 relative">
      <div v-if="selectedCreator" class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-4 border-b border-zinc-200/80 bg-white flex justify-between items-center shrink-0 shadow-sm z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-zinc-900 text-zinc-100 flex items-center justify-center font-black shadow-sm text-sm">
              {{ selectedCreator.name.substring(0, 2).toUpperCase() }}
            </div>
            <div>
              <h4 class="text-xs font-black text-zinc-950 flex items-center gap-1.5">
                <span>{{ selectedCreator.name }}</span>
                <span class="text-[9px] uppercase bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-black">Creador</span>
              </h4>
              <p class="text-[10px] text-zinc-400 font-medium">{{ selectedCreator.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UiButton 
              as="a" 
              :href="`/admin/users?search=${encodeURIComponent(selectedCreator.email)}`" 
              variant="outline" 
              size="sm" 
              class="text-xs h-9 font-bold flex items-center gap-1 border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50"
            >
              👤 Ver Perfil
            </UiButton>
          </div>
        </div>

        <!-- Chat messages container -->
        <div ref="chatScrollContainer" class="flex-grow overflow-y-auto p-6 bg-zinc-50/30 space-y-4">
          <div v-if="loadingMessages && messages.length === 0" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin text-xl text-zinc-400">🔄</div>
            <p class="text-xs text-zinc-400 mt-2">Cargando conversación...</p>
          </div>
          <div v-else-if="messages.length === 0" class="text-center py-12 text-zinc-400 italic text-xs">
            No hay mensajes en este chat de soporte.
          </div>
          <div v-else class="space-y-4 flex flex-col">
            <div 
              v-for="msg in messages" 
              :key="msg.id" 
              class="flex flex-col max-w-[80%]" 
              :class="msg.sender_id === currentUser?.id ? 'self-end items-end' : 'self-start items-start'"
            >
              <!-- Sender details -->
              <span class="text-[9px] font-black text-zinc-400 uppercase mb-1 px-1">
                {{ msg.sender_id === currentUser?.id ? 'Tú (Soporte)' : `${msg.sender?.name || selectedCreator.name} (Creador)` }}
              </span>
              
              <!-- Message Bubble -->
              <div 
                class="rounded-2xl px-4 py-2.5 text-xs shadow-sm flex flex-col gap-1"
                :class="msg.sender_id === currentUser?.id 
                  ? 'bg-zinc-900 text-white rounded-tr-none' 
                  : 'bg-white border border-zinc-200/80 text-zinc-800 rounded-tl-none'"
              >
                <!-- Reference Badge -->
                <div v-if="msg.event" class="text-[9px] font-black opacity-85 pb-1 border-b border-current/20 flex items-center gap-1 mb-0.5">
                  <span>📌</span>
                  <span>Ref: {{ msg.event.name }}</span>
                </div>
                <p class="whitespace-pre-wrap leading-relaxed">{{ msg.message }}</p>
              </div>

              <!-- Timestamp -->
              <span class="text-[9px] text-zinc-400 mt-1 px-1 flex items-center gap-1">
                <span>{{ new Date(msg.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) }}</span>
                <span v-if="msg.sender_id === currentUser?.id" class="text-[9px] font-bold text-emerald-600">
                  {{ msg.is_read ? '✓✓ Leído' : '✓ Enviado' }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-zinc-200/80 bg-white shrink-0 shadow-inner">
          <form @submit.prevent="sendMessage" class="flex gap-2 items-center">
            <UiInput 
              v-model="newMessage" 
              placeholder="Escribe un respuesta de soporte..." 
              class="flex-grow h-12 border-zinc-200 focus:ring-zinc-900 focus:border-zinc-900 text-xs rounded-xl"
              :disabled="sending"
              required
              autocomplete="off"
            />
            <UiButton 
              type="submit" 
              class="bg-zinc-900 text-white hover:bg-zinc-800 h-12 px-6 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 text-xs"
              :disabled="sending || !newMessage.trim()"
            >
              <span>{{ sending ? '...' : 'Responder' }}</span>
            </UiButton>
          </form>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex-grow flex flex-col items-center justify-center p-8 text-center bg-zinc-50/10">
        <div class="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-3xl mb-4 border border-zinc-200/50 animate-bounce">
          💬
        </div>
        <h4 class="text-sm font-bold text-zinc-800">Centro de Mensajería y Soporte</h4>
        <p class="text-xs text-zinc-400 max-w-sm mt-1 leading-normal">
          Selecciona una conversación del listado lateral para comenzar a chatear con los organizadores y resolver sus consultas.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useCookie, useRuntimeConfig, useFetch } from '#imports';

definePageMeta({ layout: 'admin' });

const token = useCookie('auth_token');
const config = useRuntimeConfig();

// Current active admin user
const { data: currentUser } = await useFetch<any>(`${config.public.apiBase}/api/user`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const threads = ref<any[]>([]);
const filteredThreads = computed(() => {
  if (!searchTerm.value.trim()) return threads.value;
  const s = searchTerm.value.toLowerCase();
  return threads.value.filter(t => 
    t.name.toLowerCase().includes(s) || 
    t.email.toLowerCase().includes(s) || 
    (t.last_message && t.last_message.toLowerCase().includes(s))
  );
});

const searchTerm = ref('');
const loadingThreads = ref(false);
const selectedCreator = ref<any>(null);
const messages = ref<any[]>([]);
const loadingMessages = ref(false);
const newMessage = ref('');
const sending = ref(false);
const chatScrollContainer = ref<HTMLElement | null>(null);
let pollingInterval: any = null;

// Load support threads list
const loadThreads = async (silent = false) => {
  if (!silent) loadingThreads.value = true;
  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/support-chat`, {
      headers: { Authorization: `Bearer ${token.value}` },
      query: { threads: 'true' }
    });
    threads.value = res;
  } catch (err) {
    console.error('Error loading chat threads', err);
  } finally {
    if (!silent) loadingThreads.value = false;
  }
};

// Select a thread and open chat
const selectThread = async (creator: any) => {
  selectedCreator.value = creator;
  messages.value = [];
  loadingMessages.value = true;
  await fetchMessages();
  await markAsRead();
  await loadThreads(true); // reload threads silently to update unread badge count
};

// Fetch chat history for selected creator
const fetchMessages = async (silent = false) => {
  if (!selectedCreator.value) return;
  if (!silent) loadingMessages.value = true;
  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/support-chat/${selectedCreator.value.id}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    messages.value = res;
    scrollToBottom();
  } catch (err) {
    console.error('Error loading chat messages', err);
  } finally {
    if (!silent) loadingMessages.value = false;
  }
};

// Send support chat response message
const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value || !selectedCreator.value) return;
  sending.value = true;
  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/support-chat/${selectedCreator.value.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { message: newMessage.value }
    });
    messages.value.push(res);
    newMessage.value = '';
    scrollToBottom();
    await loadThreads(true); // Update threads list silently for last message preview
  } catch (err) {
    console.error('Error sending message', err);
    alert('Error al enviar el mensaje');
  } finally {
    sending.value = false;
  }
};

// Mark conversation messages as read
const markAsRead = async () => {
  if (!selectedCreator.value) return;
  try {
    await $fetch(`${config.public.apiBase}/api/support-chat/${selectedCreator.value.id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` }
    });
  } catch (err) {
    console.error('Error marking as read', err);
  }
};

// Formatting helpers
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatScrollContainer.value) {
      chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight;
    }
  });
};

// Lifecycle hooks for Polling
onMounted(async () => {
  await loadThreads();
  
  // Real-time double-pane live pooling interval (every 8 seconds)
  pollingInterval = setInterval(async () => {
    await loadThreads(true);
    if (selectedCreator.value) {
      await fetchMessages(true);
    }
  }, 8000);
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});
</script>

<style scoped>
</style>
