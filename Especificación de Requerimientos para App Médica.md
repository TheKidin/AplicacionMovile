# ---

**Documento de Especificación de Requerimientos (SRS) \- Proyecto "CLINOVA"**

## **1\. Introducción**

El presente documento define las especificaciones y requerimientos funcionales y no funcionales para el desarrollo de una aplicación móvil integral orientada a la gestión de citas médicas, almacenamiento de historiales clínicos modulares y administración de múltiples clínicas.

### **1.1. Alcance del Proyecto**

* **Módulo de Pacientes (App Móvil):** Autenticación segura, agendamiento de citas, exploración de instituciones médicas, y llenado gamificado del historial clínico.  
* **Módulo de Médicos (Fase Posterior):** Acceso a agendas, visualización de expedientes de pacientes asignados, y gestión de consultas.  
* **Arquitectura Multi-Clínica:** Capacidad de integrar y segmentar los datos de diferentes instituciones de salud que operan bajo la misma plataforma.

## ---

**2\. Arquitectura y Stack Tecnológico Recomendado**

Dada la necesidad de manejar datos médicos sensibles y operar con múltiples instituciones, la infraestructura de datos es el pilar del proyecto.

**Recomendación de Base de Datos y Backend: Supabase (PostgreSQL)**

Se recomienda ampliamente **Supabase** como sistema de base de datos y autenticación por encima de alternativas no relacionales, por las siguientes razones:

1. **Modelo Relacional Sólido:** Un ecosistema médico tiene relaciones estrictas (un paciente tiene muchas citas, una clínica tiene muchos médicos, un médico atiende en varias clínicas). PostgreSQL maneja esto con perfecta integridad.  
2. **Seguridad a Nivel de Fila (Row Level Security \- RLS):** Es vital para aplicaciones médicas. Permite crear reglas directamente en la base de datos para que un paciente *solo* pueda descargar o leer su propio historial, mitigando riesgos de fugas de datos.  
3. **Multi-tenant Nativo:** Al ser relacional, puedes crear una estructura donde la información de cada "Clínica" o "Institución" esté lógicamente separada mediante un identificador (tenant\_id).  
4. **Autenticación Integrada:** Facilita el inicio de sesión, recuperación de contraseñas y enlaces mágicos (Magic Links).

**Frontend Móvil:** Se recomienda **Flutter** o **React Native** para poder compilar la aplicación para iOS y Android desde un mismo código fuente, soportando interfaces modernas, animaciones fluidas y acceso a biometría nativa.

## ---

**3\. Requerimientos Funcionales**

### **3.1. Autenticación y Seguridad**

| ID | Requerimiento | Descripción |
| :---- | :---- | :---- |
| **RF-AUTH-01** | Registro y Login | Acceso seguro mediante correo/usuario y contraseña. Opciones para recuperar contraseña y "Mantener sesión iniciada". |
| **RF-AUTH-02** | Acceso Biométrico | Integración con FaceID / TouchID / Huella dactilar para inicios de sesión subsecuentes. |
| **RF-AUTH-03** | Enrutamiento por Rol | El sistema debe identificar si el usuario es Paciente o Médico para redirigirlo a su vista correspondiente tras hacer login. |

### **3.2. Módulo del Paciente (App Principal)**

| ID | Requerimiento | Descripción |
| :---- | :---- | :---- |
| **RF-PAC-01** | Dashboard (Home) | Pantalla de bienvenida con widget de "Próxima Cita" (mostrando fecha, hora, doctor, estado "Confirmada" y botón de Pre-Checkin). Banners promocionales de telemedicina y accesos rápidos. |
| **RF-PAC-02** | Explorador de Clínicas | Directorio de instituciones médicas conectadas a la plataforma, permitiendo búsqueda por ubicación o especialidad. |
| **RF-PAC-03** | Agendamiento de Citas | Flujo guiado para que el paciente seleccione Institución \-\> Especialidad \-\> Médico \-\> Horario. Debe soportar formato de telemedicina o presencial. |
| **RF-PAC-04** | Historial Clínico Gamificado | Sistema de recolección de datos por módulos con barras de progreso (ej. "85% Completo"). |
| **RF-PAC-05** | Secciones del Historial | El historial debe desglosarse en: Datos Generales, Antecedentes, Medicación, Alergias, Estilo de Vida y Vacunación. |
| **RF-PAC-06** | Recomendaciones Proactivas | Tarjetas (Cards) que sugieran al paciente completar un módulo específico de su historial en base a su próxima cita programada. |

### **3.3. Módulo del Médico (Preparación para Fase 2\)**

Aunque la vista del médico se desarrollará después, la base de datos debe contemplar estas funciones:

* **Gestión de Múltiples Agendas:** Si el médico trabaja en dos instituciones distintas dadas de alta en la app, debe poder ver sus citas separadas por clínica.  
* **Visualización de Expedientes:** Acceso de lectura al historial clínico llenado por el paciente, disponible antes y durante la consulta.  
* **Control de Estados:** Capacidad de marcar una cita como "Completada", "Cancelada" o "No asiste".

## ---

**4\. Requerimientos No Funcionales**

* **RNF-01 Seguridad y Privacidad:** Todos los datos médicos deben estar encriptados. Las contraseñas no deben guardarse en texto plano. Se debe cumplir con principios de confidencialidad médica.  
* **RNF-02 Interfaz de Usuario (UI):** Diseño minimalista, uso de espacios en blanco, tipografías legibles y tonos fríos/calmos (azules y blancos) que inspiren confianza, respetando la línea gráfica de "CLINOVA".  
* **RNF-03 Escalabilidad Multi-Clínica:** La arquitectura debe permitir dar de alta una nueva "Institución" desde un panel de administrador general, sin necesidad de modificar el código de la aplicación.  
* **RNF-04 Offline / Caché:** La aplicación debería guardar en caché (memoria local) los datos del historial médico del paciente para que pueda visualizarlos rápidamente incluso si hay mala conexión a internet temporalmente.

## ---

**5\. Diseño Sugerido de Base de Datos (Estructura Multi-tenant)**

Para que Supabase soporte las múltiples instituciones y la modularidad del historial, se recomienda esta estructura a alto nivel:

1. **users**: Administrada por Supabase (ID, email, rol).  
2. **clinics**: Instituciones dadas de alta (ID, nombre, dirección, logo).  
3. **doctors**: Perfiles médicos (ID, user\_id, especialidad).  
4. **clinic\_doctors**: Tabla intermedia (clinic\_id, doctor\_id). Un doctor puede estar en varias clínicas.  
5. **patients**: Perfiles de pacientes (ID, user\_id, nombre, fecha\_nacimiento).  
6. **appointments**: Citas agendadas (ID, patient\_id, doctor\_id, clinic\_id, fecha, hora, estado).  
7. **medical\_records**: Historial clínico. Se recomienda usar un campo tipo **JSONB** (muy eficiente en PostgreSQL) para guardar los formularios de *Antecedentes, Alergias y Estilo de Vida*, permitiendo flexibilidad si las preguntas del cuestionario cambian en el futuro.