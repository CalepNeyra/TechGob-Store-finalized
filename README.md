# 🛒 TechStore - Sistema de Gestión de Inventario Comercial & Autenticación Segura

Bienvenido al sistema centralizado de gestión de inventarios y control de accesos para **TechStore**. Este proyecto implementa estándares avanzados de seguridad en la nube, autenticación multifactor (MFA), delegación de identidad federada (OAuth 2.0 con Google y GitHub) y control de acceso basado en roles (RBAC) segmentado por tiendas.

---

## 📌 Características Principales

* **Autenticación Fuerte:**
  * Registro e inicio de sesión local con hash de contraseñas mediante `bcrypt` y firma de tokens de sesión `JWT`.
  * Regla estricta de complejidad para contraseñas (mínimo 8 caracteres, mayúscula, número y carácter especial).
* **Autenticación Multi-Factor (MFA):**
  * Verificación en dos pasos mediante un código numérico temporal de 6 dígitos generado tras validar las credenciales básicas.
* **Mecanismos de Mitigación de Ataques:**
  * **Bloqueo de Cuenta por Fuerza Bruta:** Suspensión temporal de la cuenta por 15 minutos tras registrar **5 intentos fallidos** de contraseña.
  * **Límite de Intentos MFA:** Invalidación del código MFA al superar los **3 intentos incorrectos**.
* **Identidad Federada (OAuth 2.0):**
  * Inicio de sesión rápido y seguro con cuentas corporativas o personales de **Google** y **GitHub**.
* **Control de Acceso Basado en Roles (RBAC) y Tiendas:**
  * Segmentación de usuarios por roles (*Administrador del Sistema*, *Gerente de Tienda*, *Empleado de Ventas*, *Auditor*) y asignación a sucursales locales.
* **Panel de Control (Dashboard):**
  * Interfaz de usuario interactiva construida con Tailwind CSS y Lucide Icons para la visualización del perfil activo, rol y privilegios.

---

## 👥 Matriz de Perfiles y Roles

| Rol | Tienda Asignada | Privilegios y Responsabilidades |
| :--- | :--- | :--- |
| **Administrador del Sistema** | Tienda Central | Gestión global de usuarios, asignación de roles y configuración de todo el sistema. |
| **Gerente de Tienda** | Tienda Norte / Sur | Administración del catálogo de productos de su ubicación geográfica y generación de reportes locales. |
| **Empleado de Ventas** | Tienda Asignada | Consulta de productos y actualización del stock en tiempo real. |
| **Auditor** | Tienda Central | Lectura de datos generales e historial de auditoría sin permisos de edición. |

---

## 🛠️ Tecnologías Utilizadas

* **Backend:** Node.js, Express.js (ES Modules).
* **Base de Datos:** MongoDB Atlas mediante ODM Mongoose.
* **Seguridad & Autenticación:** JWT (JSON Web Tokens), Passport.js (Google & GitHub Strategies), bcryptjs.
* **Frontend:** HTML5, CSS3 (Tailwind CSS via CDN), Vanilla JavaScript.

---

## 🚀 Guía de Instalación y Ejecución Local

Sigue estos pasos para desplegar y probar la aplicación en tu entorno local:

### 1. Requisitos Previos
* Tener instalado **Node.js** (versión 18 o superior).
* Tener instalado **Git**.
* Una cuenta de **MongoDB Atlas** o un servidor local de MongoDB.

---

### 2. Clonar el Repositorio

```bash
git clone [https://github.com/CalepNeyra/TechGob-Store-finalized.git](https://github.com/CalepNeyra/TechGob-Store-finalized.git)
cd TechGob-Store-finalized

```

---

### 3. Instalar Dependencias del Backend

Navega a la carpeta del backend e instala las dependencias necesarias:

```bash
cd TechStore-backend
npm install

```

---

### 4. Configurar Variables de Entorno (`.env`)

Crea un archivo llamado `.env` dentro de la carpeta `TechStore-backend/` basándote en la siguiente plantilla:

```env
PORT=3000
MONGO_URI=tu_cadena_de_conexion_mongodb_atlas
JWT_SECRET=clave_secreta_para_firmar_tokens_jwt

# Credenciales de Google OAuth 2.0
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Credenciales de GitHub OAuth 2.0
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

```

---

### 5. Iniciar la Aplicación

Ejecuta el servidor de desarrollo utilizando `nodemon` o `node`:

```bash
npm run dev

```

El servidor iniciará en: **`http://localhost:3000`**

---

## 🧪 Pasos para Probar el Sistema

1. **Registro de Usuario (`http://localhost:3000/register.html`):**
* Completa tus datos, selecciona una **Tienda** y asigna un **Rol**.
* Ingresa una contraseña segura (Ejemplo: `TechStore2026!`).


2. **Inicio de Sesión (`http://localhost:3000/`):**
* Ingresa tu correo y contraseña registrados.
* Abre la consola de la terminal donde se ejecuta Node.js para copiar el **código MFA de 6 dígitos** generado.
* Ingresa el código en el modal interactivo de la página.


3. **Acceso al Dashboard (`http://localhost:3000/dashboard.html`):**
* Tras validar el código MFA, el sistema almacenará tu token JWT en `localStorage` y te redirigirá automáticamente al Dashboard mostrando tu información y rol.
