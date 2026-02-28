import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function SitemapPage() {
    const t = useTranslations('Legal.Sitemap');
    const footerT = useTranslations('Footer.columns');

    const links = [
        {
            title: t('categories.platform'),
            items: [
                { name: footerT('platform.links.discover'), href: "/discover" },
                { name: footerT('platform.links.market'), href: "/market" },
                { name: footerT('platform.links.academy'), href: "/academy" },
                { name: footerT('platform.links.doctors'), href: "/business" }
            ]
        },
        {
            title: t('categories.company'),
            items: [
                { name: footerT('company.links.about'), href: "/about" },
                { name: footerT('company.links.blog'), href: "/blog" },
                { name: footerT('company.links.careers'), href: "/careers" },
                { name: footerT('company.links.contact'), href: "/contact" }
            ]
        },
        {
            title: t('categories.legal'),
            items: [
                { name: footerT('legal.links.terms'), href: "/terms" },
                { name: footerT('legal.links.privacy'), href: "/privacy" },
                { name: footerT('legal.links.cookies'), href: "/cookies" },
                { name: "Sitemap", href: "/sitemap" }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        {t('description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {links.map((category, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                                <div className="h-6 w-10 bg-medical-500/10 dark:bg-medical-400/10 rounded mr-3"></div>
                                {category.title}
                            </h2>
                            <ul className="space-y-4">
                                {category.items.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-slate-600 dark:text-slate-400 hover:text-medical-600 dark:hover:text-medical-400 font-medium transition-colors flex items-center group"
                                        >
                                            <span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden bg-medical-500 h-[2px] mr-0 group-hover:mr-2"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
