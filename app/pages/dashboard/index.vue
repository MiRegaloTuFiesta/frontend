<template>
  <div class="min-h-screen bg-stone-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-stone-200">
      <div v-if="route.query.verified === '1' || route.query['amp;verified'] === '1'" class="bg-primary-600 text-white text-center py-2 text-sm font-bold">
        ¡Tu cuenta ha sido verificada con éxito! Bienvenido a Mi Regalo, Tu Fiesta.
      </div>
      <div class="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <h1 class="text-xl font-bold text-primary-800 shrink-0">Panel de Creador</h1>
        
        <!-- Mobile Create Event Button -->
        <UiButton @click="showCreateEventModal = true" size="sm" class="md:hidden bg-primary text-white font-black text-[10px] uppercase tracking-widest px-4 h-10 shadow-lg shadow-primary-200">
            + Crear Evento
        </UiButton>
        <nav class="flex items-center gap-2 sm:gap-4">
          <UiButton v-if="user?.role === 'admin'" as="a" href="/admin" variant="secondary" size="sm" class="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none font-bold hidden sm:flex">Admin Panel</UiButton>
          <NuxtLink to="/dashboard/profile" class="text-sm font-bold text-stone-700 hover:text-primary transition-colors hidden sm:flex items-center gap-1.5 group">
            <span class="text-stone-400 group-hover:text-primary transition-colors">👤</span>
            {{ user?.name || 'Mi Cuenta' }}
          </NuxtLink>
          <div class="w-px h-6 bg-stone-200 hidden sm:block mx-1"></div>
          <UiButton v-if="user" @click="logout" variant="ghost" size="sm" class="text-stone-400 hidden sm:flex">Cerrar Sesión</UiButton>
          
          <UiButton @click="showMobileMenu = true" variant="outline" size="sm" class="md:hidden border-stone-200 text-stone-600 font-bold gap-2">
            <span>☰</span>
            <span class="text-[10px] uppercase tracking-wider">Menú</span>
          </UiButton>
        </nav>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 flex-1 grid md:grid-cols-12 gap-8">
      
      <!-- Sidebar / Config (Desktop only) -->
      <div class="hidden md:block md:col-span-4 lg:col-span-3 space-y-6">
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
                <div class="flex-1">
                  <UiCardTitle class="text-xl">{{ evt.name }}</UiCardTitle>
                  <UiCardDescription>
                    Fecha: {{ new Date(evt.date + 'T12:00:00').toLocaleDateString('es-CL') }}
                    <span v-if="evt.city" class="block text-xs text-stone-400 mt-1">📍 {{ evt.city.name }}, {{ evt.city.region?.name }}</span>
                    <div v-if="evt.requests_internal_service" class="mt-2 text-[10px] inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold uppercase tracking-wider">
                      🔧 Servicio Solicitado{{ evt.service_cost > 0 ? ': $' + formatNumber(evt.service_cost) : '' }}
                    </div>
                  </UiCardDescription>
                </div>
                <div class="flex items-center gap-2 shrink-0 ml-4">
                  <UiButton @click="openEditModal(evt)" variant="outline" size="sm" class="text-stone-600">
                    ✏️ Editar
                  </UiButton>
                  <div class="relative align-middle items-center flex">
                    <UiButton @click="toggleShareMenu(evt.id)" variant="outline" size="sm" class="flex items-center gap-2">
                      Ver Público
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </UiButton>
                    <div v-if="activeShareMenu === evt.id" class="absolute right-0 top-full mt-2 p-3 bg-white border border-stone-200 shadow-xl rounded-xl z-50 w-72 origin-top-right">
                      <p class="text-xs font-semibold text-stone-500 mb-2 uppercase">Comparte tu evento</p>
                      <div class="flex items-center gap-2 mb-2">
                        <input type="text" readonly :value="getPublicUrl(evt.uuid)" class="flex-1 bg-stone-50 border border-stone-200 text-xs rounded p-2 text-stone-600 focus:outline-none" />
                        <UiButton @click="copyToClipboard(getPublicUrl(evt.uuid))" variant="default" size="sm" class="px-3 shrink-0 bg-primary-600 hover:bg-primary-700 text-white border-0">
                          Copiar
                        </UiButton>
                      </div>
                      <UiButton as="a" :href="'/evento/' + evt.uuid" target="_blank" variant="outline" size="sm" class="w-full text-stone-600 flex justify-center">
                        Abrir página del evento
                      </UiButton>
                    </div>
                  </div>
                  <UiButton @click="deleteEvent(evt)" variant="outline" size="sm" class="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700">
                    🗑️
                  </UiButton>
                </div>
              </div>
            </UiCardHeader>
            <UiCardContent>
              <div class="bg-zinc-50 p-4 rounded-lg flex flex-wrap gap-6 items-center border border-zinc-100 mb-6">
                <div>
                  <span class="text-xs text-zinc-500 uppercase font-semibold">Recaudado / Meta</span>
                  <div class="text-2xl font-bold text-primary-700">
                    ${{ formatNumber(evt.collected_amount) }} 
                    <span class="text-base text-zinc-400 font-normal">/ ${{ formatNumber(evt.total_price) }}</span>
                  </div>
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
                <div v-if="evt.admin_notes && evt.status === 'approved'" class="ml-auto">
                  <UiButton size="sm" variant="outline" class="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 font-bold" @click="openAdminNotes(evt)">
                    📋 Ver Detalles del Ejecutivo
                  </UiButton>
                </div>
              </div>

              <!-- Servicio tracking (informativo, separado de la recaudación) -->
              <div v-if="evt.requests_internal_service && evt.service_cost > 0" class="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p class="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-3">📋 Estado de Contratación de Servicios — Pagos del Organizador</p>
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div class="bg-white rounded-lg p-3 border border-amber-100">
                    <p class="text-[10px] text-amber-600 uppercase font-bold">Costo Servicio</p>
                    <p class="text-lg font-extrabold text-amber-800">${{ formatNumber(evt.service_cost) }}</p>
                  </div>
                  <div class="bg-white rounded-lg p-3 border border-amber-100">
                    <p class="text-[10px] text-amber-600 uppercase font-bold">Abonado</p>
                    <p class="text-lg font-extrabold text-emerald-700">${{ formatNumber(evt.service_payments_sum_amount || 0) }}</p>
                  </div>
                  <div class="bg-white rounded-lg p-3 border border-amber-100">
                    <p class="text-[10px] text-amber-600 uppercase font-bold">Pendiente</p>
                    <p class="text-lg font-extrabold text-rose-700">${{ formatNumber(Math.max(0, evt.service_cost - (evt.service_payments_sum_amount || 0))) }}</p>
                  </div>
                </div>
              </div>

              <!-- Wishlist Section -->
              <div class="space-y-4">
                <div class="flex justify-between items-center bg-white">
                  <h3 class="font-bold text-stone-800">Lista de Deseos ({{ evt.wishes?.length || 0 }})</h3>
                  <div class="flex items-center gap-2">
                    <UiButton size="sm" variant="outline" @click="openTemplateSelectionModal(evt.id)" class="text-[10px] font-bold border-stone-200">📋 Usar Plantilla</UiButton>
                    <UiButton size="sm" variant="secondary" @click="openWishModal(evt.id)">+ Agregar Deseo</UiButton>
                  </div>
                </div>

                <div v-if="evt.wishes && evt.wishes.length > 0" class="grid sm:grid-cols-2 gap-4">
                  <div 
                    v-for="wish in evt.wishes" 
                    :key="wish.id" 
                    class="p-4 border border-stone-200 rounded-xl relative group"
                    :class="wish.status !== 'completed' ? 'cursor-pointer hover:border-primary-300 hover:bg-stone-50 transition-all' : 'cursor-pointer opacity-90 hover:border-primary-400 hover:shadow-md transition-all'"
                    @click="wish.status !== 'completed' ? openWishModal(evt.id, wish) : openWishContributionsModal(wish)"
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
                    <div v-else class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span class="text-[10px] bg-white border border-primary-200 px-2 py-0.5 rounded shadow-sm text-primary-600 font-bold uppercase">Ver detalles</span>
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

    <!-- Modal Selector de Plantillas -->
    <div v-if="isTemplateSelectionModalOpen" class="fixed inset-0 z-[60] bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div class="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div>
            <h3 class="text-xl font-bold text-stone-900">Usar una Plantilla</h3>
            <p class="text-sm text-stone-500">Selecciona un regalo predefinido para tu lista</p>
          </div>
          <button @click="isTemplateSelectionModalOpen = false" class="text-stone-400 hover:text-stone-900 text-2xl">&times;</button>
        </div>

        <div class="p-4 border-b border-stone-100 bg-white flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
            <UiInput v-model="templateSearch" placeholder="Buscar regalo..." class="pl-9 h-10 text-sm" />
          </div>
          <select v-model="templateCategory" class="h-10 px-3 rounded-lg border border-stone-200 bg-stone-50 text-sm outline-none focus:ring-2 focus:ring-primary-500 min-w-[150px]">
            <option value="">Todas las categorías</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div class="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          <div v-if="loadingTemplates" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin text-3xl mb-4">🔄</div>
            <p class="text-stone-400 font-medium text-sm">Cargando plantillas...</p>
          </div>
          <div v-else-if="publicTemplates?.length > 0" class="grid sm:grid-cols-2 gap-4">
            <div 
              v-for="tpl in publicTemplates" 
              :key="tpl.id" 
              @click="selectTemplate(tpl)"
              class="p-4 bg-white border border-stone-200 rounded-2xl hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full shadow-sm"
            >
              <h4 class="font-bold text-stone-900 group-hover:text-primary-600 transition-colors leading-tight">{{ tpl.name }}</h4>
              <p class="text-[11px] text-stone-500 mt-1 line-clamp-3 leading-relaxed flex-1">{{ tpl.description }}</p>
              <div class="flex flex-wrap gap-1 mt-4">
                <span v-for="cat in tpl.categories" :key="cat.id" class="text-[9px] font-black uppercase px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded border border-stone-200">
                  {{ cat.name }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <p class="text-stone-400 italic text-sm">No se encontraron plantillas que coincidan.</p>
          </div>
        </div>
        
        <div class="p-4 border-t border-stone-100 bg-white flex justify-end">
          <UiButton @click="isTemplateSelectionModalOpen = false" variant="ghost" class="text-stone-400 text-sm">Cerrar</UiButton>
        </div>
      </div>
    </div>

    <!-- Modal agregar/editar deseo -->
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
          
          <div v-if="!newWish.is_open" class="space-y-3 p-4 bg-primary-50 rounded-xl border border-primary-100 animate-in fade-in zoom-in duration-200">
            <UiLabel for="liquidAmount" class="text-primary-900 font-bold">¿Cuánto quieres recibir líquido? (CLP)</UiLabel>
            
            <!-- Quick-select buttons -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="val in [5000, 10000, 15000, 20000, 25000]"
                :key="val"
                type="button"
                @click="selectQuickAmount(val)"
                class="px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
                :class="Number(newWish.liquid_amount) === val 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'bg-white text-stone-600 border-stone-200 hover:border-primary hover:text-primary'"
              >
                ${{ formatNumber(val) }}
              </button>
            </div>

            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600 font-bold">$</span>
              <UiInput id="liquidAmount" type="number" v-model="newWish.liquid_amount" @input="updateCalculations" class="pl-8 border-primary-200 focus:ring-primary" placeholder="O ingresa un valor personalizado" :required="!newWish.is_open" />
            </div>

            <!-- Min amount error -->
            <p v-if="wishAmountError" class="text-xs text-red-600 font-semibold">{{ wishAmountError }}</p>
            
            <div v-if="calculation" class="mt-3 space-y-1 text-xs">
              <div class="flex justify-between text-stone-600">
                <span>Comisión Plataforma</span>
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

    <!-- Modal Detalles de Compra (Completed Wish) -->
    <div v-if="isContributionsModalOpen && selectedWishContributions" class="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div>
            <h3 class="text-lg font-bold text-stone-900">Detalles de Aportes</h3>
            <p class="text-xs text-stone-500 font-medium">{{ selectedWishContributions.name }}</p>
          </div>
          <button @click="closeContributionsModal" class="text-stone-400 hover:text-stone-600 text-2xl transition-colors">&times;</button>
        </div>
        <div class="p-6 max-h-[60vh] overflow-y-auto bg-stone-100/50">
          <div v-if="selectedWishContributions.contributions?.length > 0" class="space-y-4">
            <div v-for="contrib in selectedWishContributions.contributions" :key="contrib.id" class="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <p class="text-sm font-bold text-stone-900">{{ contrib.donor_name }}</p>
                <p class="text-xs text-stone-500">{{ contrib.email || 'Sin correo asociado' }}</p>
              </div>
              <div class="bg-primary-50 px-4 py-2 rounded-lg border border-primary-100 self-start sm:self-auto">
                <p class="text-xs text-primary-600 font-bold uppercase mb-0.5">Monto Aportado</p>
                <p class="text-lg font-black text-primary-800 leading-none">${{ formatNumber(contrib.amount) }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-stone-400">
            <p>No se encontraron detalles de aportes registrados para este regalo.</p>
          </div>
        </div>
        <div class="p-4 border-t border-stone-100 bg-white flex justify-end">
          <UiButton @click="closeContributionsModal" class="bg-stone-900 text-white hover:bg-stone-800">Cerrar Detalles</UiButton>
        </div>
      </div>
    </div>

    <!-- Modal Editar Evento -->
    <div v-if="isEditEventModalOpen && editingEvent" class="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        <div class="p-6 border-b border-stone-100 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-bold">Editar Evento</h3>
            <p class="text-xs text-stone-400">{{ editingEvent.name }}</p>
          </div>
          <button @click="closeEditModal" class="text-stone-400 hover:text-stone-600 text-2xl">&times;</button>
        </div>
        <form @submit.prevent="saveEditedEvent" class="p-6 space-y-4">
          <div class="space-y-2">
            <UiLabel>Nombre del Evento</UiLabel>
            <UiInput v-model="editEventForm.name" placeholder="Ej: Boda de Ana y Juan" required />
          </div>
          <div class="space-y-2">
            <UiLabel>Fecha</UiLabel>
            <UiInput type="date" v-model="editEventForm.date" required />
          </div>
          <div class="space-y-2">
            <UiLabel>Categoría</UiLabel>
            <select v-model="editEventForm.category_id" class="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none">
              <option :value="null">Sin categoría</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <UiLabel>Región</UiLabel>
            <select v-model="editRegionId" @change="handleEditRegionChange" class="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none">
              <option :value="null">Seleccionar región...</option>
              <option v-for="reg in regions" :key="reg.id" :value="reg.id">{{ reg.name }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <UiLabel>Ciudad</UiLabel>
            <select v-model="editEventForm.city_id" class="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none" :disabled="!editRegionId || isLoadingEditCities">
              <option :value="null">{{ isLoadingEditCities ? 'Cargando...' : 'Seleccionar ciudad...' }}</option>
              <option v-for="city in editCitiesList" :key="city.id" :value="city.id">{{ city.name }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <UiLabel>Dirección (Opcional)</UiLabel>
            <UiInput v-model="editEventForm.address" placeholder="Ej: Av. Las Condes 123" />
          </div>
          <div class="flex items-center gap-2 py-1">
            <input type="checkbox" id="editIsPublic" v-model="editEventForm.is_location_public" class="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary" />
            <UiLabel for="editIsPublic" class="text-xs font-semibold text-stone-700 cursor-pointer">¿Mostrar ubicación en página pública?</UiLabel>
          </div>
          <div class="space-y-2 pt-2 border-t border-stone-100">
            <UiLabel>Meta de Recaudación (CLP)</UiLabel>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
              <UiInput type="number" v-model="editEventForm.creator_budget" placeholder="Ej: 500000" class="pl-8" />
            </div>
          </div>
          <div class="pt-4 flex justify-end gap-3">
            <UiButton type="button" variant="outline" @click="closeEditModal">Cancelar</UiButton>
            <UiButton type="submit" class="bg-primary text-white" :disabled="isSavingEvent">
              {{ isSavingEvent ? 'Guardando...' : 'Guardar Cambios' }}
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

    <!-- Mobile Menu Modal -->
    <div v-if="showMobileMenu" class="fixed inset-0 z-[100] bg-zinc-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div @click.self="showMobileMenu = false" class="absolute inset-0"></div>
      <div class="bg-white w-full sm:max-w-xs rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl relative animate-in slide-in-from-bottom duration-300 overflow-hidden">
        <div class="p-6 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
            <h3 class="font-black text-stone-800 uppercase tracking-widest text-xs">Menú Principal</h3>
            <button @click="showMobileMenu = false" class="text-stone-400 hover:text-stone-900">✕</button>
        </div>
        <div class="p-4 space-y-2">
            <NuxtLink to="/dashboard/profile" class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-sm font-black border border-transparent hover:bg-stone-50 text-stone-700">
              <span class="text-xl">👤</span>
              Mi Perfil
            </NuxtLink>
            <a v-if="user?.role === 'admin'" href="/admin" class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-sm font-black border border-transparent hover:bg-amber-50 text-amber-700">
              <span class="text-xl">🛡️</span>
              Admin Panel
            </a>
            <hr class="border-stone-100 my-2" />
            <button @click="logout" class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-stone-400 font-bold text-sm text-left hover:bg-rose-50 hover:text-rose-600 transition-colors">
              <span class="text-xl">🚪</span>
              Cerrar Sesión
            </button>
        </div>
      </div>
    </div>

    <!-- Create Event Modal (Mobile only) -->
    <div v-if="showCreateEventModal" class="fixed inset-0 z-[60] bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div class="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div>
            <h3 class="text-xl font-bold text-stone-900">Nuevo Evento</h3>
            <p class="text-sm text-stone-500">Completa los datos para tu celebración</p>
          </div>
          <button @click="showCreateEventModal = false" class="text-stone-400 hover:text-stone-900 text-2xl">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
            <form @submit.prevent="createEventWithClose" class="space-y-4">
                <div class="space-y-2">
                  <UiLabel for="m-name">Nombre de Evento</UiLabel>
                  <UiInput id="m-name" v-model="newEvent.name" placeholder="Ej: Boda de Ana y Juan" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <UiLabel for="m-date">Fecha</UiLabel>
                      <UiInput id="m-date" type="date" v-model="newEvent.date" />
                    </div>
                    <div class="space-y-2">
                        <UiLabel for="m-category">Categoría</UiLabel>
                        <select id="m-category" v-model="newEvent.category_id" class="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none">
                          <option :value="null">Seleccionar...</option>
                          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <UiLabel for="m-region">Región</UiLabel>
                      <select id="m-region" v-model="selectedRegionId" @change="handleRegionChange" class="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none">
                        <option :value="null">Seleccionar...</option>
                        <option v-for="reg in regions" :key="reg.id" :value="reg.id">{{ reg.name }}</option>
                      </select>
                    </div>
                    <div class="space-y-2">
                      <UiLabel for="m-city">Ciudad</UiLabel>
                      <select id="m-city" v-model="newEvent.city_id" class="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none" :disabled="!selectedRegionId || isLoadingCities">
                        <option :value="null">{{ isLoadingCities ? '...' : 'Seleccionar...' }}</option>
                        <option v-for="city in citiesList" :key="city.id" :value="city.id">{{ city.name }}</option>
                      </select>
                    </div>
                </div>

                <div class="space-y-2">
                  <UiLabel for="m-address">Dirección (Opcional)</UiLabel>
                  <UiInput id="m-address" v-model="newEvent.address" placeholder="Ej: Av. Las Condes 123" />
                </div>

                <div class="flex items-center gap-2 py-1">
                  <input type="checkbox" id="m-isPublic" v-model="newEvent.is_location_public" class="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary" />
                  <UiLabel for="m-isPublic" class="text-xs font-semibold text-stone-700 cursor-pointer">Mostrar ubicación pública</UiLabel>
                </div>

                <div class="pt-4 border-t border-stone-100 space-y-4">
                  <div class="space-y-2">
                    <UiLabel for="m-budget">Meta de Recaudación (Opcional)</UiLabel>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                      <UiInput id="m-budget" type="number" v-model="newEvent.creator_budget" placeholder="Ej: 500000" class="pl-8" />
                    </div>
                  </div>

                  <div class="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 italic">
                    <input type="checkbox" id="m-requestService" v-model="newEvent.requests_internal_service" class="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary" />
                    <UiLabel for="m-requestService" class="text-[10px] font-bold text-amber-800 cursor-pointer">Deseo contratar servicio interno</UiLabel>
                  </div>
                </div>
                
                <div class="pt-2">
                    <UiButton type="submit" class="w-full bg-primary hover:bg-primary-700 text-white font-bold h-12" :disabled="isCreatingEvent">
                      {{ isCreatingEvent ? 'Guardando...' : 'Crear Evento' }}
                    </UiButton>
                </div>
            </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCookie, useRouter, useRoute, useHead, useFetch } from '#imports';
import { refDebounced } from '@vueuse/core';

useHead({ title: 'Dashboard - Mi Regalo, Tu Fiesta' });

const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();
const token = useCookie('auth_token');

const showMobileMenu = ref(false);
const showCreateEventModal = ref(false);

const createEventWithClose = async () => {
    await createEvent();
    if (!isCreatingEvent.value) {
        showCreateEventModal.value = false;
    }
};

if (!token.value) {
  router.push('/login');
}

const { data: events, pending: pendingEvents, refresh } = await useFetch<any>(`${config.public.apiBase}/api/events`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const { data: user } = await useFetch<any>(`${config.public.apiBase}/api/user`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const { data: categories } = await useFetch<any>(`${config.public.apiBase}/api/categories`);
const { data: regions } = await useFetch<any>(`${config.public.apiBase}/api/regions`);

// ─── Geography (CREATE EVENT) ────────────────────────────────────────────────
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
  } catch (e) { console.error(e); } finally { isLoadingCities.value = false; }
};

// ─── CREATE EVENT ─────────────────────────────────────────────────────────────
const newEvent = ref({ name: '', date: '', category_id: null, city_id: null as number | null, address: '', is_location_public: true, creator_budget: '', requests_internal_service: false });
const isCreatingEvent = ref(false);

// ─── SHARE MENU ───────────────────────────────────────────────────────────────
const activeShareMenu = ref<number | null>(null);

const toggleShareMenu = (eventId: number) => {
  if (activeShareMenu.value === eventId) {
    activeShareMenu.value = null;
  } else {
    activeShareMenu.value = eventId;
  }
};

const getPublicUrl = (uuid: string) => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/evento/${uuid}`;
  }
  return `/evento/${uuid}`;
};

const copyToClipboard = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    alert('URL copiada al portapapeles');
    activeShareMenu.value = null;
  } catch (err) {
    console.error('Error al copiar', err);
  }
};

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
  } finally { isCreatingEvent.value = false; }
};

// ─── EDIT EVENT ───────────────────────────────────────────────────────────────
const isEditEventModalOpen = ref(false);
const editingEvent = ref<any>(null);
const isSavingEvent = ref(false);
const editRegionId = ref<number | null>(null);
const editCitiesList = ref<any[]>([]);
const isLoadingEditCities = ref(false);
const editEventForm = ref({ name: '', date: '', category_id: null as number | null, city_id: null as number | null, address: '', is_location_public: true, creator_budget: '' });

const openEditModal = async (evt: any) => {
  editingEvent.value = evt;
  editEventForm.value = {
    name: evt.name,
    date: evt.date,
    category_id: evt.category_id,
    city_id: evt.city_id,
    address: evt.address || '',
    is_location_public: evt.is_location_public,
    creator_budget: evt.creator_budget || ''
  };
  // Pre-load region from city
  editRegionId.value = evt.city?.region_id ?? null;
  if (editRegionId.value) {
    isLoadingEditCities.value = true;
    try {
      const res: any = await $fetch(`${config.public.apiBase}/api/cities?region_id=${editRegionId.value}`);
      editCitiesList.value = res;
    } catch (e) { console.error(e); } finally { isLoadingEditCities.value = false; }
  }
  isEditEventModalOpen.value = true;
};

const handleEditRegionChange = async () => {
  editEventForm.value.city_id = null;
  editCitiesList.value = [];
  if (!editRegionId.value) return;
  isLoadingEditCities.value = true;
  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/cities?region_id=${editRegionId.value}`);
    editCitiesList.value = res;
  } catch (e) { console.error(e); } finally { isLoadingEditCities.value = false; }
};

const closeEditModal = () => {
  isEditEventModalOpen.value = false;
  editingEvent.value = null;
};

const saveEditedEvent = async () => {
  if (!editingEvent.value) return;
  isSavingEvent.value = true;
  try {
    await $fetch(`${config.public.apiBase}/api/events/${editingEvent.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: editEventForm.value
    });
    closeEditModal();
    await refresh();
  } catch (err: any) {
    console.error(err);
    alert(err.response?._data?.message || 'Error al guardar el evento');
  } finally { isSavingEvent.value = false; }
};

// ─── WISH MODAL ───────────────────────────────────────────────────────────────
const isWishModalOpen = ref(false);
const isEditingWish = ref(false);
const editingWishId = ref<number | null>(null);
const selectedEventId = ref<number | null>(null);
const isCreatingWish = ref(false);
const wishAmountError = ref('');
const newWish = ref({ name: '', description: '', liquid_amount: '', target_amount: 0, is_open: false });

const isContributionsModalOpen = ref(false);
const selectedWishContributions = ref<any>(null);

const isTemplateSelectionModalOpen = ref(false);
const templateSearch = ref('');
const templateCategory = ref('');
const debouncedTemplateSearch = refDebounced(templateSearch, 300);

const { data: publicTemplates, pending: loadingTemplates } = await useFetch<any>(`${config.public.apiBase}/api/wish-templates`, {
  headers: { Authorization: `Bearer ${token.value}` },
  query: { 
    search: debouncedTemplateSearch, 
    category_id: templateCategory 
  },
  watch: [debouncedTemplateSearch, templateCategory]
});

const openTemplateSelectionModal = (eventId: number) => {
  selectedEventId.value = eventId;
  isTemplateSelectionModalOpen.value = true;
};

const selectTemplate = (tpl: any) => {
  openWishModal(selectedEventId.value!); // Reset form and open modal
  newWish.value.name = tpl.name;
  newWish.value.description = tpl.description || '';
  isTemplateSelectionModalOpen.value = false;
};

const openWishContributionsModal = (wish: any) => {
  selectedWishContributions.value = wish;
  isContributionsModalOpen.value = true;
};

const closeContributionsModal = () => {
  isContributionsModalOpen.value = false;
  selectedWishContributions.value = null;
};

const isNotesModalOpen = ref(false);
const selectedEventNotes = ref<any>(null);

const openAdminNotes = (evt: any) => { selectedEventNotes.value = evt; isNotesModalOpen.value = true; };

const calculation = ref<any>(null);

const selectQuickAmount = (val: number) => {
  newWish.value.liquid_amount = String(val);
  wishAmountError.value = '';
  updateCalculations();
};

const updateCalculations = async () => {
  const amount = parseInt(newWish.value.liquid_amount);
  if (!newWish.value.liquid_amount || amount <= 0) {
    calculation.value = null;
    newWish.value.target_amount = 0;
    wishAmountError.value = '';
    return;
  }
  if (amount < 5000) {
    wishAmountError.value = 'El valor mínimo por regalo debe ser de $5.000';
    calculation.value = null;
    return;
  }
  wishAmountError.value = '';
  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/checkout/calculate?amount=${amount}&gateway=flow&type=liquid`);
    calculation.value = res;
    newWish.value.target_amount = res.gross;
  } catch (e) { console.error(e); }
};

const openWishModal = (eventId: number, wish: any = null) => {
  selectedEventId.value = eventId;
  if (wish) {
    isEditingWish.value = true;
    editingWishId.value = wish.id;
    newWish.value = { name: wish.name, description: wish.description, liquid_amount: wish.liquid_amount.toString(), target_amount: wish.target_amount, is_open: wish.liquid_amount === 0 };
    if (wish.liquid_amount > 0) updateCalculations();
  } else {
    isEditingWish.value = false;
    editingWishId.value = null;
    newWish.value = { name: '', description: '', liquid_amount: '', target_amount: 0, is_open: false };
  }
  isWishModalOpen.value = true;
};

const closeWishModal = () => {
  isWishModalOpen.value = false;
  selectedEventId.value = null;
  isEditingWish.value = false;
  editingWishId.value = null;
  newWish.value = { name: '', description: '', liquid_amount: '', target_amount: 0, is_open: false };
  calculation.value = null;
  wishAmountError.value = '';
};

const submitWish = async () => {
  if (!selectedEventId.value || !newWish.value.name) return;
  
  const amount = parseInt(newWish.value.liquid_amount);
  if (!newWish.value.is_open && amount < 5000) {
    wishAmountError.value = 'El valor mínimo por regalo debe ser de $5.000';
    return;
  }

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
  } catch (e: any) {
    console.error(e);
    const msg = e.response?._data?.message || 'Error al guardar el deseo';
    alert(msg);
  } finally { isCreatingWish.value = false; }
};

const deleteEvent = async (evt: any) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar el evento "${evt.name}"? Esta acción no se puede deshacer.`)) return;
  try {
    await $fetch(`${config.public.apiBase}/api/events/${evt.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token.value}` } });
    await refresh();
  } catch (err: any) {
    console.error(err);
    alert(err.response?._data?.message || 'Error al eliminar el evento');
  }
};

const formatNumber = (num: number) => new Intl.NumberFormat('es-CL').format(num);
const logout = () => { token.value = null; router.push('/login'); };
</script>
