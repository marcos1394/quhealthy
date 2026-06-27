import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

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

// Fetch the post from our Java Analytics Service
async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org').replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/api/intelligence/blog/posts/${slug}`, {
      next: { revalidate: 3600 } // ISR: Cache for 1 hour
    });
    if (!res.ok) {
      console.warn(`Blog fetch failed with status: ${res.status} for URL: ${baseUrl}/api/intelligence/blog/posts/${slug}`);
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
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPost(slug);
  
  if (!post) {
    return { title: 'Post Not Found - QuHealthy' };
  }

  const url = `https://www.quhealthy.org/${locale}/blog/${post.slug}`;

  return {
    title: `${post.title} | QuHealthy Editorial`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords?.join(', '),
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: url,
      siteName: 'QuHealthy',
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.createdAt,
      authors: ['QuHealthy AI Editorial'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: [post.imageUrl],
    },
    alternates: {
      canonical: url,
    }
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug, locale } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const publishDate = new Date(post.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Reading time estimation
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Generate JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    image: [post.imageUrl],
    datePublished: post.createdAt,
    dateModified: post.createdAt,
    author: [{
        '@type': 'Organization',
        name: 'QuHealthy AI Editorial',
        url: 'https://www.quhealthy.org'
    }],
    publisher: {
        '@type': 'Organization',
        name: 'QuHealthy',
        logo: {
            '@type': 'ImageObject',
            url: 'https://www.quhealthy.org/logo.png'
        }
    },
    description: post.metaDescription
  };

  const backText = locale === 'en' ? 'Back to Editorial' : 'Volver al Editorial';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      
      <main className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-24 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
        <article className="container mx-auto px-6 md:px-12 max-w-4xl">
          
          {/* Back button (Arquitectónico) */}
          <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-6">
            <Link 
              href={`/${locale}/blog`} 
              className="group inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
              {backText}
            </Link>
          </div>

          {/* Header */}
          <header className="mb-16">
            <div className="flex flex-wrap items-center gap-4 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-2" strokeWidth={2} />
                <time dateTime={post.createdAt}>{publishDate}</time>
              </div>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-2" strokeWidth={2} />
                <span>{readingTime} min</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-black dark:text-white leading-[1.1] mb-8 tracking-tight">
              {post.title}
            </h1>

            {/* Tags (Estilo Bloque Sólido) */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-12">
                {post.keywords.map((kw, i) => (
                  <span 
                    key={i} 
                    className="border border-black dark:border-white text-black dark:text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Featured Image (Corte vivo, sin redondeos, full width) */}
            <div className="w-full aspect-[21/9] md:aspect-[16/9] bg-gray-100 dark:bg-gray-900 relative">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
                loading="eager" // Eager loading for LCP optimization on Hero image
              />
            </div>
          </header>

          {/* Content (Rendered Markdown via Custom Tailwind Typography) */}
          <div className="prose prose-lg md:prose-xl prose-gray dark:prose-invert max-w-none 
                          prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-black dark:prose-headings:text-white 
                          prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:font-light prose-p:leading-relaxed 
                          prose-a:text-black dark:prose-a:text-white prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-black/20 hover:prose-a:border-black dark:prose-a:border-white/30 dark:hover:prose-a:border-white transition-all
                          prose-strong:text-black dark:prose-strong:text-white prose-strong:font-medium
                          prose-blockquote:border-l-2 prose-blockquote:border-black dark:prose-blockquote:border-white prose-blockquote:text-gray-500 prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-2xl prose-blockquote:leading-snug
                          prose-img:rounded-none prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-800
                          prose-ul:text-gray-600 dark:prose-ul:text-gray-300 prose-ul:font-light prose-li:marker:text-black dark:prose-li:marker:text-white">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Footer del Post (Author Bio Minimalista) */}
          <footer className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                QuHealthy Editorial
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-light text-sm max-w-md leading-relaxed">
                Nuestra IA analiza miles de artículos médicos y datos clínicos para traerte contenido preciso, verificado y fácil de digerir sobre salud y tecnología.
              </p>
            </div>
          </footer>

        </article>
      </main>
    </>
  );
}