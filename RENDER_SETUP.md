# 🚀 CONFIGURACIÓN EN RENDER — Paso a Paso

## ❌ El problema "Not Found"

Ocurre porque Render necesita:
1. El **Build Command** y **Start Command** correctos
2. Un **Disco persistente** para SQLite
3. Las **variables de entorno** correctamente configuradas

---

## ✅ PASOS PARA CONFIGURAR RENDER

### 1️⃣ Sube el código a GitHub primero

```bash
git init
git add .
git commit -m "Pioneer Portal inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/pioneer-portal.git
git push -u origin main
```

---

### 2️⃣ Crear el Web Service en Render

1. Ve a **https://render.com** → Dashboard → **New** → **Web Service**
2. Conecta tu repositorio de GitHub
3. Configura así:

| Campo | Valor |
|-------|-------|
| **Name** | `pioneer-portal` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate && npx prisma db push && npm run build` |
| **Start Command** | `npm run start` |
| **Plan** | Free (o Starter) |

---

### 3️⃣ Agregar Disco Persistente (CRÍTICO para SQLite)

> Sin esto, la base de datos se borra en cada deploy.

1. En tu Web Service → **Disks** → **Add Disk**
2. Configura:
   - **Name:** `pioneer-db`
   - **Mount Path:** `/var/data`
   - **Size:** 1 GB

---

### 4️⃣ Variables de Entorno en Render

Ve a **Environment** y agrega estas variables:

```
NODE_ENV                = production
NEXTAUTH_URL            = https://pioneer-portal.onrender.com
NEXTAUTH_SECRET         = [genera una clave larga aleatoria]
AZURE_AD_CLIENT_ID      = [tu Client ID de Azure]
AZURE_AD_CLIENT_SECRET  = [tu Client Secret de Azure]
AZURE_AD_TENANT_ID      = [tu Tenant ID de Azure]
DATABASE_URL            = file:/var/data/pioneer.db
ADMIN_EMAIL             = b.deleon@pioneerfunds.do
```

> 💡 Para generar NEXTAUTH_SECRET: abre una terminal y ejecuta:
> ```bash
> openssl rand -base64 32
> ```

---

### 5️⃣ Actualizar Azure AD con la URL de Render

1. Ve a **portal.azure.com** → Azure Active Directory → App Registrations → Tu app
2. Ve a **Authentication** → **Add a platform** → **Web**
3. Agrega la Redirect URI:
   ```
   https://pioneer-portal.onrender.com/api/auth/callback/azure-ad
   ```
4. Guarda los cambios

---

### 6️⃣ Hacer el deploy

1. En Render → click **Manual Deploy** → **Deploy latest commit**
2. Espera 3-5 minutos mientras hace el build
3. Verifica en los logs que aparezca:
   ```
   ✓ Ready on http://0.0.0.0:PORT
   ```

---

## 🔍 Cómo ver los logs en Render

1. Ve a tu Web Service en Render
2. Click en **Logs** (tab superior)
3. Busca errores en rojo

### Errores comunes y soluciones:

| Error | Solución |
|-------|----------|
| `Cannot find module '@prisma/client'` | Asegúrate que el Build Command incluye `npx prisma generate` |
| `ENOENT: no such file or directory` | Falta el disco persistente en `/var/data` |
| `NEXTAUTH_URL` mismatch | Actualiza `NEXTAUTH_URL` con tu URL exacta de Render |
| `OAuthCallback error` | Verifica la Redirect URI en Azure AD |
| `Not Found` en todas las rutas | Falta `output: 'standalone'` en next.config.js ✅ Ya está incluido |

---

## 🌐 URL final

Una vez deployado, tu portal estará en:
```
https://pioneer-portal.onrender.com
```

---

## ⚠️ IMPORTANTE: Plan gratuito de Render

El plan gratuito de Render **duerme** después de 15 minutos sin actividad. El primer acceso puede tardar 30-60 segundos en despertar. Para evitar esto, usa el plan **Starter ($7/mes)**.

---

**Pioneer Investment Funds © 2025 — IT Department**
