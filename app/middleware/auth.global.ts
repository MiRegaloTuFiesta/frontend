import { defineNuxtRouteMiddleware, useCookie, navigateTo } from '#imports';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const token = useCookie('auth_token');
  const publicPages = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
  const authRequired = !publicPages.includes(to.path);

  // 1. If not logged in and page requires auth -> redirect to login
  if (authRequired && !token.value) {
    return navigateTo('/login');
  }

  // 2. Verification check logic
  // We only check verification for protected areas (Dashboard/Admin)
  if (authRequired && token.value) {
    const config = useRuntimeConfig();
    try {
      // Fetch user data to check verification status
      const user: any = await $fetch(`${config.public.apiBase}/api/user`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      });

      // If user is not verified and not already on the verify-email page
      if (user && !user.email_verified_at && to.path !== '/verify-email') {
        return navigateTo('/verify-email');
      }
    } catch (err) {
      // Token might be invalid/expired
      token.value = null;
      return navigateTo('/login');
    }
  }
});
