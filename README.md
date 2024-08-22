# Programación Backend

Este es un proyecto para la "Entrega Final" en el curso de Programación Backend.

## Iniciar en "Modo Development"

1. **Configurar Variables de Entorno:**
   - Crear un archivo `.env` basado en el archivo `.env.sample` y completar las variables de entorno necesarias (detalladas más abajo).

2. **Iniciar el Servidor:**
   - Ejecutar el siguiente comando:
     ```bash
     npm run dev
     ```

## Iniciar en "Modo Production"

1. **Configurar Variables de Entorno:**
   - Configurar las variables de entorno en la plataforma de despliegue (como Railway) basadas en las variables detalladas en `.env.sample`.

2. **Iniciar el Servidor:**
   - Ejecutar el siguiente comando:
     ```bash
     npm start
     ```

## Iniciar el "Testing"

1. **Levantar el servidor en modo dev.**
2. **Ejecutar los tests:**
   - En otra terminal, ejecutar:
     ```bash
     npm test
     ```

## Probar el Logueo

- Para realizar la prueba del sistema de logs, acceder a la siguiente ruta en tu navegador:
    ```bash
    localhost:8080/api/loggerTest
    ```

## Acceder a la Documentación con SWAGGER

1. **Levantar el servidor en modo dev.**
2. **Acceder a la Documentación:**
   - En el navegador, ingresar en el siguiente link:
     ```bash
     localhost:8080/api-docs/
     ```

## Variables de Entorno

A continuación se describen las variables de entorno que deben configurarse en el archivo .env:

* PORT: Puerto en el que se ejecutará la aplicación. (Ejemplo: 3001)
* MONGO_URL: URL de conexión a la base de datos MongoDB.
* DB_NAME: Nombre de la base de datos.
* SECRET: Clave secreta para la autenticación.
* CLIENT_ID_GITHUB: ID del cliente de GitHub para la autenticación OAuth.
* CLIENT_SECRET_GITHUB: Secreto del cliente de GitHub para la autenticación OAuth.
* CALLBACK_URL_GITHUB: URL de callback para la autenticación con GitHub.
* SERVICE_NODEMAILER: Servicio de email para Nodemailer.
* PORT_NODEMAILER: Puerto del servicio de email.
* USER_NODEMAILER: Usuario del servicio de email.
* PASS_NODEMAILER: Contraseña del servicio de email.
* FROM_NODEMAILER: Dirección de email de origen para los correos enviados.
* EMAIL_ADMIN: Email del administrador del sistema.
* PASSWORD_ADMIN: Contraseña del administrador del sistema.
* HOST_URL: URL base donde se está ejecutando la aplicación. Por ejemplo, `http://localhost:8080` para entornos locales.

<br>
<br>


© 2024, Mauricio Picca - Proyecto desarrollado como parte del curso de Programación Backend.    
