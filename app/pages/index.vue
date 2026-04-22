<template>
  <div class="min-h-screen bg-zinc-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary/10">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="text-xl font-bold text-primary-800 tracking-tight flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>
          Mi Regalo, Tu Fiesta
        </div>
        <nav class="hidden md:flex gap-6">
          <a href="#historia" class="text-sm font-medium text-zinc-600 hover:text-primary transition-colors">Nuestra Historia</a>
          <a href="#beneficios" class="text-sm font-medium text-zinc-600 hover:text-primary transition-colors">¿Por qué nosotros?</a>
          <a href="#como-funciona" class="text-sm font-medium text-zinc-600 hover:text-primary transition-colors">Cómo funciona</a>
        </nav>
        <div class="flex gap-4">
          <UiButton as="a" href="/login" variant="outline" class="border-primary/20 text-primary-700 hover:bg-primary-50">Ingresar</UiButton>
          <UiButton as="a" href="/register" class="bg-primary hover:bg-primary-700 text-white shadow-lg shadow-primary/20 transition-all">Crear Evento</UiButton>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative px-4 py-20 md:py-32 overflow-hidden">
      <!-- Decoraciones de fondo -->
      <div class="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary-100/50 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3"></div>
      <div class="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-zinc-200/50 rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/3"></div>

      <div class="container mx-auto text-center max-w-4xl pt-10">
        <span class="px-4 py-1.5 rounded-full bg-primary-100 text-primary-800 text-sm font-semibold tracking-wide mb-6 inline-block">
          El alma de la celebración
        </span>
        <h1 class="text-4xl md:text-6xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-8">
          Un regalo con sentido es aquel que se <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">vive, comparte y recuerda</span>
        </h1>
        <p class="text-lg md:text-xl text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Transformamos el acto de regalar en un esfuerzo colectivo. No es solo "pedir dinero"; es compartir el sueño de una noche especial.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <UiButton size="lg" class="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary-700 text-white shadow-xl shadow-primary/20 transition-all hover:scale-105" as="a" href="/register">
            Comenzar mi evento gratis
          </UiButton>
          <UiButton size="lg" variant="outline" class="w-full sm:w-auto text-lg h-14 px-8 border-zinc-300 hover:bg-zinc-100 text-zinc-700" as="a" href="#historia">
            Nuestra historia
          </UiButton>
        </div>
        <p class="mt-6 text-sm text-zinc-500">Sin compromisos vacíos • Cambiamos lo material por lo emocional</p>
      </div>
    </section>

    <!-- Storytelling Section -->
    <section id="historia" class="py-24 bg-white border-y border-zinc-100 overflow-hidden">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
          <div class="w-full md:w-1/2 relative">
            <div class="aspect-square bg-zinc-100 rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <!-- Usaremos un gradiente artístico que evoca una fiesta/DJ ya que mantenemos el estilo actual -->
              <div class="absolute inset-0 overflow-hidden">
                <img src="/images/dj-rossbel-fundador.webp" alt="DJ Rossbel - Fundador de Mi Regalo, Tu Fiesta" class="w-full h-full object-cover" />
              </div>
            </div>
            <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-100 rounded-2xl -z-0 rotate-12"></div>
            <div class="absolute -top-6 -left-6 w-24 h-24 bg-zinc-200 rounded-full -z-0"></div>
          </div>
          <div class="w-full md:w-1/2 space-y-6">
            <h2 class="text-3xl font-bold text-zinc-900 leading-tight">El momento que lo cambió todo</h2>
            <div class="space-y-4 text-lg text-zinc-600 leading-relaxed italic">
              <p>"Como DJ e invitado, he sido testigo de una escena que se repite: la incertidumbre de no saber qué regalar. Esa duda de último minuto suele terminar en un 'compromiso' más que en un acierto: objetos sin historia que terminan olvidados."</p>
              <p>"Todo cambió el día que tres amigos decidieron unirse para algo distinto. En lugar de tres objetos individuales, me llamaron para regalar, entre todos, mi servicio de DJ al festejado."</p>
              <p class="not-italic font-semibold text-primary-700">No fue un regalo convencional: fue el ritmo de la noche, fueron las risas y la alegría compartida.</p>
            </div>
            <div class="pt-4">
              <p class="text-zinc-700 font-medium italic">— DJ Rossbel, Fundador de Mi Regalo, Tu Fiesta</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why us / Benefits -->
    <section id="beneficios" class="py-24 bg-zinc-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-zinc-900 mb-4">Porque los mejores momentos no se poseen, se celebran</h2>
          <p class="text-zinc-600 max-w-xl mx-auto">Cambiamos la forma de dar para crear recuerdos imborrables.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <UiCard class="border-none shadow-sm bg-white hover:shadow-md transition-shadow p-6">
            <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 class="text-xl font-bold text-zinc-900">Sin compromisos vacíos</h3>
            <p class="text-zinc-600 mt-2">Cambiamos lo material por lo emocional. Evita regalos que terminan en el fondo de un cajón.</p>
          </UiCard>

          <UiCard class="border-none shadow-sm bg-white hover:shadow-md transition-shadow p-6">
            <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 class="text-xl font-bold text-zinc-900">Valor real</h3>
            <p class="text-zinc-600 mt-2">La verdadera alegría viene de saber que quienes te rodean se unieron para celebrarte con algo significativo.</p>
          </UiCard>

          <UiCard class="border-none shadow-sm bg-white hover:shadow-md transition-shadow p-6">
            <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 class="text-xl font-bold text-zinc-900">Un recuerdo eterno</h3>
            <p class="text-zinc-600 mt-2">Un regalo que no se guarda en una caja, sino en la memoria de todos los que participaron.</p>
          </UiCard>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="como-funciona" class="py-24 bg-white border-y border-zinc-100">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-zinc-900 mb-4">Cómo sumamos esfuerzos</h2>
          <p class="text-zinc-600 max-w-xl mx-auto">Nuestra plataforma transforma el acto de regalar en un esfuerzo colectivo.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div class="text-center group">
            <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-6 text-2xl font-extrabold group-hover:scale-110 transition-transform">1</div>
            <h3 class="text-xl font-bold text-zinc-900 mb-3">Define el sueño</h3>
            <p class="text-zinc-600">Crea tu evento y añade esas experiencias que harán tu noche inolvidable: el DJ, la decoración, el viaje...</p>
          </div>

          <div class="text-center group">
            <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-6 text-2xl font-extrabold group-hover:scale-110 transition-transform">2</div>
            <h3 class="text-xl font-bold text-zinc-900 mb-3">Une a tus invitados</h3>
            <p class="text-zinc-600">Envía tu link. Tus invitados eligen en qué colaborar, eliminando la incertidumbre del regalo perfecto.</p>
          </div>

          <div class="text-center group">
            <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-6 text-2xl font-extrabold group-hover:scale-110 transition-transform">3</div>
            <h3 class="text-xl font-bold text-zinc-900 mb-3">Celebra con sentido</h3>
            <p class="text-zinc-600">Recibe las contribuciones y haz realidad una experiencia que todos disfrutaron y recordarán siempre.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="py-24 bg-primary-900 text-white relative overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute top-0 right-0 -z-0 w-64 h-64 bg-primary-800 rounded-full blur-2xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 left-0 -z-0 w-80 h-80 bg-primary-800 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3"></div>

      <div class="container mx-auto px-4 relative z-10 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-6">Crea algo mucho más grande que un objeto</h2>
        <p class="text-primary-100 mb-10 max-w-xl mx-auto text-lg italic">
          "Porque los mejores momentos de la vida no se poseen, se celebran."
        </p>
        <UiButton size="lg" class="bg-white text-primary-900 hover:bg-zinc-100 text-lg h-14 px-8 shadow-2xl transition-transform hover:scale-105" as="a" href="/register">
          Comenzar "Mi Regalo, Tu Fiesta"
        </UiButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// SEO Meta configuration
useHead({
  title: 'Mi Regalo, Tu Fiesta - El alma de la celebración',
  meta: [
    { name: 'description', content: 'Transforma el acto de regalar en un esfuerzo colectivo. Un regalo con sentido es aquel que se vive, se comparte y se recuerda para siempre.' },
    { property: 'og:title', content: 'Mi Regalo, Tu Fiesta - El alma de la celebración' },
    { property: 'og:description', content: 'Cambiamos lo material por lo emocional. Haz realidad experiencias inolvidables junto a tus invitados.' },
    { property: 'og:image', content: '/og-image.jpg' }, // Update with real image path if available
  ],
})
</script>
