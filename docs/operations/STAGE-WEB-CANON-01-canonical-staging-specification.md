# Especificación de Despliegue: Staging Canónico en Vercel

**HU:** `STAGE-WEB-CANON-01`  
**Épica:** `EP-TECH-01` / Plataforma y Publicación Web  
**Destino Vercel:** `marcos1394s-projects/quhealthy` (Canónico)  
**ID de Proyecto:** `prj_dU8FbWeveGi7asDz3nVfAdo1Fvim`  
**ID de Organización:** `team_0fjIM33S2y2oUJ45uUwLNdTM`  
**Estado:** Saneado y en preparación para despliegue Preview  

---

## 1. Justificación y Alcance

El pipeline anterior de publicación falló debido a que los secretos de GitHub Actions apuntaban a una cuenta/equipo de Vercel suspendida por facturación (`quhealthy`). La junta corporativa designó a **`marcos1394s-projects/quhealthy`** como el destino canónico que no presenta adeudos ni problemas de facturación.

### Principios de Aislamiento:
1. **No tocar Producción:** No modificar `quhealthy.org` ni alterar el workflow de producción con `--prod`.
2. **No mover Dominios Prematuramente:** El dominio `staging.quhealthy.org` se encuentra asociado históricamente al proyecto `v0-quhealthy`. No debe forzarse la reasignación en DNS ni en Vercel hasta validar que el despliegue Preview en el proyecto canónico compile y funcione al 100%.
3. **Cero Secretos en Repositorio:** El fallback hardcodeado del token de bypass en `playwright.config.ts` ha sido removido; el archivo ahora falla cerrado si no se suministra la variable de entorno.

---

## 2. Acciones Ejecutadas

### A. Saneamiento de Código
* **Archivo:** `playwright.config.ts`
* **Cambio:** Se eliminó la cadena plana `'GdAd9XOosfsGpaRVF9TKNn6B05Nx14Cf'`. La cabecera `x-vercel-protection-bypass` ahora sólo se inyecta dinámicamente si `process.env.VERCEL_PROTECTION_BYPASS` está configurado en el entorno de ejecución.
* **Seguridad:** Pendiente la rotación/revocación formal de dicho token en el panel de Vercel.

### B. Vinculación Canónica Local
El repositorio local ya cuenta con la vinculación en `.vercel/project.json`:
```json
{
  "projectId": "prj_dU8FbWeveGi7asDz3nVfAdo1Fvim",
  "orgId": "team_0fjIM33S2y2oUJ45uUwLNdTM",
  "projectName": "quhealthy"
}
```

---

## 3. Procedimiento para Despliegue de Preview en Vercel Canónico

### Paso 1: Verificación de Estado en Vercel (Inspección no destructiva)
El administrador puede validar el proyecto y el dominio ejecutando:
```bash
npx vercel@latest project inspect quhealthy --scope marcos1394s-projects
npx vercel@latest domains inspect staging.quhealthy.org --scope marcos1394s-projects
```

### Paso 2: Configuración de Variables de Entorno en el Scope Canónico
En la configuración del proyecto `quhealthy` en Vercel (para el entorno `Preview`):
* `NEXT_PUBLIC_API_URL`: `https://api-staging.quhealthy.org`
* `NEXT_PUBLIC_ENVIRONMENT`: `staging`
* Asegurar que no se inyecten credenciales ni endpoints de base de datos o APIs de producción.

### Paso 3: Generación de Despliegue Preview
Ejecutar un build y deploy de Preview:
```bash
vercel pull --yes --environment=preview --scope marcos1394s-projects
vercel build
vercel deploy --prebuilt --scope marcos1394s-projects
```
Esto genera una URL única de Preview (ejemplo: `quhealthy-git-staging-marcos1394s-projects.vercel.app`).

### Paso 4: Pruebas de Certificación en la URL Preview
1. Carga de la aplicación web en navegador.
2. Verificación de consumo contra `https://api-staging.quhealthy.org`.
3. Comprobación de que no se producen errores de CORS.

### Paso 5: Reasignación Segura del Dominio `staging.quhealthy.org` (Compuerta Posterior)
Únicamente tras aprobar el Preview:
1. En el panel de Vercel de `v0-quhealthy`, remover `staging.quhealthy.org`.
2. En el panel de Vercel de `marcos1394s-projects/quhealthy`, agregar `staging.quhealthy.org` asignado a la rama de staging.
3. Verificar la emisión del certificado SSL/TLS de Vercel sin interrupción de `quhealthy.org`.
