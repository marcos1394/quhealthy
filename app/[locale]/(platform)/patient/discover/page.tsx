import { redirect } from "@/i18n/routing";

/**
 * Redirect: La experiencia de Discover ahora vive en la ruta pública /discover
 * tanto para usuarios autenticados como para visitantes anónimos.
 * Mantenemos esta ruta como redirect para no romper navegación existente.
 */
export default async function PatientDiscoverRedirect({
 params,
}: {
 params: Promise<{ locale: string }>;
}) {
 const { locale } = await params;
 redirect({ href: "/discover", locale });
}
