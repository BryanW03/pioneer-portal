# 🏢 Pioneer Investment Funds — Portal Interno

Portal web corporativo con autenticación Microsoft, gestión de usuarios y formulario de Terceros.

---

## 📋 REQUISITOS PREVIOS

- Node.js 18 o superior
- npm 9+
- Cuenta de Microsoft 365 corporativa (`@pioneerfunds.do`)
- Acceso a **Azure Portal** (portal.azure.com)

---

## 🔧 PASO 1 — Registrar la app en Azure Active Directory

> Esto solo se hace una vez. Necesitas acceso de administrador al tenant de Microsoft.

1. Ve a **https://portal.azure.com**
2. Busca y abre **"Azure Active Directory"**
3. Ve a **"App registrations"** → **"New registration"**
4. Completa:
   - **Name:** `Pioneer Portal`
   - **Supported account types:** `Accounts in this organizational directory only (Single tenant)`
   - **Redirect URI:** Web → `http://localhost:3000/api/auth/callback/azure-ad`
5. Click **Register**

### Copiar credenciales:
- **Application (client) ID** → este es tu `AZURE_AD_CLIENT_ID`
- **Directory (tenant) ID** → este es tu `AZURE_AD_TENANT_ID`

### Crear Client Secret:
1. En tu app registrada → **"Certificates & secrets"**
2. **"New client secret"**
3. Descripción: `pioneer-portal-secret`, Expires: `24 months`
4. Copiar el **Value** → este es tu `AZURE_AD_CLIENT_SECRET`
   ⚠️ Solo se muestra una vez, guárdalo de inmediato.

### Permisos de API:
1. **"API permissions"** → **"Add a permission"** → **Microsoft Graph**
2. **Delegated permissions:** `openid`, `profile`, `email`, `User.Read`
3. Click **"Grant admin consent"**

---

## ⚙️ PASO 2 — Configurar variables de entorno

Abre el archivo `.env.local` y completa con tus datos:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=pioneer-portal-secret-key-2025-change-in-production

AZURE_AD_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_AD_CLIENT_SECRET=tu-secret-value-aqui
AZURE_AD_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

DATABASE_URL="file:./dev.db"
ADMIN_EMAIL=b.deleon@pioneerfunds.do
```

---

## 🚀 PASO 3 — Instalar y ejecutar

```bash
# 1. Instalar dependencias
npm install

# 2. Crear la base de datos
npx prisma db push

# 3. (Opcional) Crear admin inicial
npx prisma db seed

# 4. Iniciar en modo desarrollo
npm run dev
```

Abre **http://localhost:3000** en tu navegador.

---

## 🌐 PASO 4 — Deploy en Vercel (producción)

1. Sube el proyecto a GitHub
2. Ve a **https://vercel.com** → **New Project** → importa tu repositorio
3. En **Environment Variables**, agrega todas las de `.env.local`
4. Cambia `NEXTAUTH_URL` a tu URL de Vercel: `https://tu-proyecto.vercel.app`
5. En Azure, agrega la nueva Redirect URI:
   `https://tu-proyecto.vercel.app/api/auth/callback/azure-ad`
6. Deploy ✅

---

## 📁 ESTRUCTURA DEL PROYECTO

```
pioneer-portal/
├── prisma/
│   ├── schema.prisma       # Modelos de BD (User, Tercero, AuditLog)
│   └── seed.ts             # Crea el super admin inicial
├── src/
│   ├── app/
│   │   ├── login/          # Página de login con slideshow Pioneer
│   │   ├── dashboard/      # Panel principal
│   │   ├── terceros/
│   │   │   ├── nuevo/      # Formulario Crear Tercero
│   │   │   └── historial/  # Historial con buscador y paginación
│   │   ├── admin/
│   │   │   ├── page.tsx    # Panel admin + audit log
│   │   │   └── usuarios/   # Gestión de usuarios
│   │   └── api/
│   │       ├── auth/       # NextAuth (Microsoft OAuth)
│   │       ├── terceros/   # API REST Terceros
│   │       └── users/      # API REST Usuarios
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx       # Nav lateral colapsable
│   │   │   └── Providers.tsx     # SessionProvider
│   │   └── forms/
│   │       ├── TerceroForm.tsx   # Formulario Pioneer Terceros
│   │       └── UserManagement.tsx # CRUD de usuarios
│   ├── lib/
│   │   ├── auth.ts         # Configuración NextAuth
│   │   ├── prisma.ts       # Cliente Prisma
│   │   └── audit.ts        # Registro de actividad
│   └── middleware.ts       # Protección de rutas
├── .env.local              # Variables de entorno (NO subir a Git)
└── .env.example            # Plantilla de variables
```

---

## 👥 GESTIÓN DE USUARIOS

Solo **b.deleon@pioneerfunds.do** es el super administrador.

| Rol | Puede |
|-----|-------|
| **Super Admin** | Todo + no puede ser modificado |
| **Admin** | Crear usuarios, cambiar roles, ver audit log |
| **Usuario** | Crear/ver terceros, ver historial |

### Para crear un nuevo usuario:
1. Inicia sesión como admin
2. Ve a **Admin → Gestión de Usuarios**
3. Click **"Crear Usuario"**
4. Ingresa el correo `@pioneerfunds.do`, nombre, departamento y rol
5. El usuario podrá iniciar sesión con Microsoft la próxima vez

---

## 🖼️ AGREGAR IMÁGENES AL SLIDESHOW

Para usar imágenes reales de la empresa en el login:

1. Coloca tus fotos en `/public/images/`:
   - `slide1.jpg`, `slide2.jpg`, `slide3.jpg`, `slide4.jpg`

2. En `src/app/login/page.tsx`, modifica el array `slides`:
```ts
const slides = [
  {
    id: 0,
    image: '/images/slide1.jpg',   // ← agrega esta línea
    title: 'Gestión de Inversiones',
    subtitle: 'Soluciones financieras de alto desempeño',
  },
  // ...
]
```

3. En el componente de slide, cambia el div del fondo:
```tsx
// Reemplaza:
style={{ background: slides[currentSlide].gradient }}

// Con:
style={{ backgroundImage: `url(${slides[currentSlide].image})`,
         backgroundSize: 'cover', backgroundPosition: 'center' }}
```

---

## 🔒 SEGURIDAD

- Solo dominios `@pioneerfunds.do` pueden autenticarse
- Rutas `/admin/*` protegidas por rol en middleware
- Sesiones expiran a las 8 horas (jornada laboral)
- Todo cambio queda registrado en el Audit Log
- El super admin no puede ser modificado ni desactivado
- Base de datos SQLite local (sin exposición externa)

---

## 🛠️ COMANDOS ÚTILES

```bash
npm run dev          # Desarrollo en localhost:3000
npm run build        # Build de producción
npm run start        # Servidor de producción
npx prisma studio    # GUI visual de la base de datos
npx prisma db push   # Sincronizar schema con BD
npx prisma db seed   # Crear admin inicial
```

---

**Pioneer Investment Funds © 2025 — IT Department**
