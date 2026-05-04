import { defineEventHandler, getCookie, createError, sendRedirect } from 'h3';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const token = getCookie(event, 'auth_token');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No autenticado',
    });
  }

  // 1. Verificar el usuario con el backend Laravel
  let user: any;
  try {
    user = await $fetch(`${config.public.apiBase}/api/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sesión inválida',
    });
  }

  // 2. Verificar si es admin
  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado. Se requieren permisos de administrador.',
    });
  }

  // 3. Generar el token de SSO
  const { wpApiUrl, wpSsoSecret } = config;

  if (!wpApiUrl || !wpSsoSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuración de SSO incompleta en el servidor.',
    });
  }

  const payload = {
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60, // Válido por 60 segundos de gracia
    jti: crypto.randomUUID() // Previene Replay Attacks
  };

  // Convertir a Base64URL seguro
  const payloadStr = JSON.stringify(payload);
  const payloadBase64Url = Buffer.from(payloadStr)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Generar firma sobre el payload en Base64URL
  const signature = crypto
    .createHmac('sha256', wpSsoSecret)
    .update(payloadBase64Url)
    .digest('hex');

  const ssoToken = `${payloadBase64Url}.${signature}`;

  // 4. Redirigir a WordPress
  // El snippet en WordPress interceptará este parámetro
  return sendRedirect(event, `${wpApiUrl}/?sso_token=${ssoToken}`);
});
