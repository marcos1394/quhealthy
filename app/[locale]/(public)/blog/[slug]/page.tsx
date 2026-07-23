import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Sparkles, 
  Tag, 
  BookOpen, 
  ShieldCheck,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Interfaz que coincide con el DTO del backend
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  keywords: string[];
  imageUrl: string;
  createdAt: string;
  author?: string;
}

// Fetch the post from Java Analytics Service
async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = (
      process.env.NEXT_PUBLIC_API_URL || "https://api.quhealthy.org"
    ).replace(/\/$/, "");
    const res = await fetch(`${baseUrl}/api/intelligence/blog/posts/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(
        `Blog fetch failed with status: ${res.status} for URL: ${baseUrl}/api/intelligence/blog/posts/${slug}`
      );
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

type Params = Promise<{ slug: string; locale: string }>;

// Generate SEO Metadata dynamically
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Artículo No Encontrado - QuHealthy" };
  }

  const url = `https://www.quhealthy.org/${locale}/blog/${post.slug}`;

  return {
    title: `${post.title} | QuHealthy Editorial`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords?.join(", "),
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: url,
      siteName: "QuHealthy",
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.createdAt,
      authors: ["QuHealthy AI Editorial"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: [post.imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug, locale } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const publishDate = new Date(post.createdAt).toLocaleDateString(
    locale === "en" ? "en-US" : "es-MX",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Estimación de tiempo de lectura
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Datos estructurados JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    image: [post.imageUrl],
    datePublished: post.createdAt,
    dateModified: post.createdAt,
    author: [
      {
        "@type": "Organization",
        name: "QuHealthy AI Editorial",
        url: "https://www.quhealthy.org",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "QuHealthy",
      logo: {
        "@type": "ImageObject",
        url: "https://www.quhealthy.org/logo.png",
      },
    },
    description: post.metaDescription,
  };

  const backText =
    locale === "en" ? "Volver al Editorial" : "Volver al Editorial";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-28 pb-20 md:pt-36 md:pb-24 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
        <article className="container mx-auto px-6 md:px-12 max-w-4xl">
          
          {/* Botón de Regreso Estilizado */}
          <div className="mb-8">
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all shadow-sm group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2} />
              <span>{backText}</span>
            </Link>
          </div>

          {/* HEADER DEL ARTÍCULO */}
          <header className="space-y-6 mb-12">
            
            {/* Metadatos (Fecha, Tiempo, Categoría) */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 font-bold shadow-sm">
                <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Editorial Médico</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <time dateTime={post.createdAt}>{publishDate}</time>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{readingTime} min de lectura</span>
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.15] tracking-tight">
              {post.title}
            </h1>

            {/* Extracto Corto */}
            {post.excerpt && (
              <p className="text-base md:text-lg font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
            )}

            {/* Tags / Keywords estilo Pill */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {post.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200/60 dark:border-gray-700/60 shadow-sm"
                  >
                    <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{kw}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Imagen Destacada con Bordes Suaves */}
            <div className="w-full aspect-[21/10] md:aspect-[16/9] bg-gray-100 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden relative shadow-sm mt-8">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </header>

          {/* CONTENIDO DEL ARTÍCULO (Markdown con Tailwind Typography Homologado) */}
          <div
            className="prose prose-base md:prose-lg prose-gray dark:prose-invert max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white 
              prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:font-normal prose-p:leading-relaxed 
              prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
              prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50/40 dark:prose-blockquote:bg-emerald-950/20 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-blockquote:not-italic prose-blockquote:font-medium
              prose-img:rounded-3xl prose-img:border prose-img:border-gray-100 dark:prose-img:border-gray-800 prose-img:shadow-sm
              prose-ul:text-gray-600 dark:prose-ul:text-gray-300 prose-li:marker:text-emerald-600 dark:prose-li:marker:text-emerald-400"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* TARJETA DE AUTOR & CREDIBILIDAD EDITORIAL */}
          <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <Sparkles className="w-6 h-6" strokeWidth={2} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      QuHealthy Intelligence & Editorial
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                      <ShieldCheck className="w-3 h-3" />
                      Contenido Verificado
                    </span>
                  </div>

                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                    Nuestra inteligencia editorial sintética y equipo médico analizan publicaciones clínicas y normativas para brindarte información sintética, precisa y aplicable a la salud digital.
                  </p>
                </div>
              </div>

              <Link
                href={`/${locale}/blog`}
                className="w-full md:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 shrink-0"
              >
                <span>Explorar más artículos</span>
              </Link>
            </div>
          </footer>

        </article>
      </main>
    </>
  );
}