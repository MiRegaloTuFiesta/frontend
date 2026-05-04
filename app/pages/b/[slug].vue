<template>
  <div class="min-h-screen bg-stone-50 pb-20">
    <!-- Header simple -->
    <header class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <IconsLogoHorizontalIcon alt="Mi Regalo Tu Fiesta" class="h-12 w-auto text-primary-800" />
        </NuxtLink>
        <UiButton as="a" href="/" variant="ghost" size="sm">Volver al inicio</UiButton>
      </div>
    </header>

    <main class="container mx-auto px-4 max-w-4xl pt-10">
      <!-- Loading State -->
      <div v-if="pending" class="space-y-6">
        <UiSkeleton class="h-12 w-3/4 rounded-xl" />
        <div class="flex gap-2">
          <UiSkeleton class="h-6 w-20 rounded-full" />
          <UiSkeleton class="h-6 w-20 rounded-full" />
        </div>
        <UiSkeleton class="h-96 w-full rounded-3xl" />
        <div class="space-y-4">
          <UiSkeleton class="h-4 w-full" />
          <UiSkeleton class="h-4 w-full" />
          <UiSkeleton class="h-4 w-2/3" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-200 px-6">
        <div class="text-stone-300 text-6xl mb-4">📄</div>
        <h1 class="text-2xl font-bold text-stone-900 mb-2">Contenido no encontrado</h1>
        <p class="text-stone-500 mb-8">Lo sentimos, no pudimos encontrar lo que buscabas o hubo un error de conexión.</p>
        <UiButton as="a" href="/" class="bg-primary text-white">Ir al inicio</UiButton>
      </div>

      <!-- Post Content -->
      <article v-else-if="post" class="fade-in">
        <!-- Metadata superior -->
        <header class="mb-10 space-y-4">
          <div v-if="post.categories.length > 0" class="flex flex-wrap gap-2">
            <span 
              v-for="cat in post.categories" :key="cat.id"
              class="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider"
            >
              {{ cat.name }}
            </span>
          </div>

          <h1 class="text-4xl md:text-5xl font-black text-stone-900 leading-tight tracking-tight">
            {{ post.title }}
          </h1>

          <div class="flex items-center gap-4 text-stone-400 text-sm font-medium">
            <time :datetime="post.date">
              {{ new Date(post.date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) }}
            </time>
            <span class="w-1 h-1 bg-stone-300 rounded-full"></span>
            <span>Por {{ post.author }}</span>
          </div>
        </header>

        <!-- Featured Image -->
        <div v-if="post.featuredImage" class="mb-12 rounded-3xl overflow-hidden shadow-2xl shadow-stone-200/50 aspect-video">
          <img 
            :src="post.featuredImage.url" 
            :alt="post.featuredImage.alt"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Main Body -->
        <div class="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-stone-200/30 border border-stone-100">
          <div 
            class="prose prose-stone prose-lg max-w-none 
                   prose-headings:text-stone-900 prose-headings:font-bold 
                   prose-p:text-stone-600 prose-p:leading-relaxed
                   prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                   prose-img:rounded-2xl prose-img:shadow-lg
                   prose-strong:text-stone-900" 
            v-html="post.content"
          ></div>
          
          <!-- Tags footer -->
          <div v-if="post.tags.length > 0" class="mt-12 pt-8 border-t border-stone-100 flex flex-wrap gap-2">
            <span class="text-xs font-bold text-stone-400 uppercase mr-2 flex items-center">Etiquetas:</span>
            <span 
              v-for="tag in post.tags" :key="tag.id"
              class="px-2 py-1 bg-stone-50 text-stone-500 text-[10px] font-bold rounded border border-stone-200 uppercase tracking-tighter"
            >
              #{{ tag.name }}
            </span>
          </div>
        </div>

        <!-- Footer Call to Action -->
        <footer class="mt-16 text-center bg-primary-900 rounded-3xl p-10 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 -z-0 w-32 h-32 bg-primary-800 rounded-full blur-2xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
          <div class="relative z-10 space-y-4">
            <h3 class="text-xl font-bold">¿Quieres crear tu propia lista de deseos?</h3>
            <p class="text-primary-100 text-sm">Organiza tus regalos de forma inteligente y haz realidad tus sueños.</p>
            <UiButton as="a" href="/register" class="bg-white text-primary-900 hover:bg-stone-100 px-8 py-6 rounded-2xl font-bold shadow-lg transition-transform hover:scale-105 border-0">
              Comenzar Ahora
            </UiButton>
          </div>
        </footer>
      </article>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;
const config = useRuntimeConfig();

const { data: post, pending, error } = await useFetch<any>('/api/wp/content', {
  query: { slug }
});

// Technical SEO Configuration
useHead(() => {
  if (!post.value) return {};
  
  return {
    title: `${post.value.seo.title} - Mi Regalo, Tu Fiesta`,
    meta: [
      { name: 'description', content: post.value.seo.description },
      // Open Graph
      { property: 'og:title', content: post.value.seo.title },
      { property: 'og:description', content: post.value.seo.description },
      { property: 'og:type', content: post.value.type === 'post' ? 'article' : 'website' },
      { property: 'og:image', content: post.value.seo.ogImage },
      { property: 'og:url', content: `https://miregalotufiesta.cl/b/${post.value.slug}` },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: post.value.seo.title },
      { name: 'twitter:description', content: post.value.seo.description },
      { name: 'twitter:image', content: post.value.seo.ogImage },
    ],
    link: [
      { rel: 'canonical', href: `https://miregalotufiesta.cl/b/${post.value.slug}` }
    ]
  };
});
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Fix images width in v-html content */
:deep(.prose img) {
  max-width: 100%;
  height: auto;
  margin-left: auto;
  margin-right: auto;
}

:deep(.prose figure) {
  margin-left: 0;
  margin-right: 0;
}
</style>
