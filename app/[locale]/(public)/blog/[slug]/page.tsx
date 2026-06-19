import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
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
  author?: string; // Podría venir en el futuro, por ahora por defecto
}

// Fetch the post from our Java Analytics Service
async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/intelligence/blog/posts/${slug}`, {
      next: { revalidate: 3600 } // ISR: Cache for 1 hour
    });
    if (!res.ok) return null;
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
    title: `${post.title} | QuHealthy Blog`,
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
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute average

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

  return (
    <>
      {/* Inject JSON-LD into the head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-24 font-sans">
        <article className="container mx-auto px-6 md:px-12 max-w-4xl">
          
          {/* Back button */}
          <div className="mb-8">
            <Link href={`/${locale}/blog`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-medical-600 dark:hover:text-medical-400 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al blog
            </Link>
          </div>

          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={post.createdAt}>{publishDate}</time>
              </div>
              <span>•</span>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{readingTime} min de lectura</span>
              </div>
              <span>•</span>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>QuHealthy Editorial</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-8">
              {post.title}
            </h1>

            {/* Tags */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.keywords.map((kw, i) => (
                  <span key={i} className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Featured Image */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-lg relative">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </header>

          {/* Content (Rendered Markdown via tailwind typography) */}
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-medical-600 dark:prose-a:text-medical-400 hover:prose-a:text-medical-700 prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

        </article>
      </main>
    </>
  );
}
