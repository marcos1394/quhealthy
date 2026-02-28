import { useTranslations } from 'next-intl';
import { Target, Eye, Shield, Heart, Globe, Activity, Award, Zap, TrendingUp } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/FadeIn';

export default function AboutPage() {
    const t = useTranslations('Company.About');

    const values = [
        {
            id: "innovation",
            icon: <Target className="h-6 w-6 text-medical-500" />,
            title: t('values.innovation'),
            desc: t('values.innovation_desc')
        },
        {
            id: "empathy",
            icon: <Heart className="h-6 w-6 text-medical-500" />,
            title: t('values.empathy'),
            desc: t('values.empathy_desc')
        },
        {
            id: "security",
            icon: <Shield className="h-6 w-6 text-medical-500" />,
            title: t('values.security'),
            desc: t('values.security_desc')
        }
    ];

    const timeline = [
        { year: t('timeline.0.year'), title: t('timeline.0.title'), desc: t('timeline.0.desc') },
        { year: t('timeline.1.year'), title: t('timeline.1.title'), desc: t('timeline.1.desc') },
        { year: t('timeline.2.year'), title: t('timeline.2.title'), desc: t('timeline.2.desc') },
        { year: t('timeline.3.year'), title: t('timeline.3.title'), desc: t('timeline.3.desc') },
    ];

    const team = [
        { name: t('team.0.name'), role: t('team.0.role'), initials: "FG" },
        { name: t('team.1.name'), role: t('team.1.role'), initials: "SM" },
        { name: t('team.2.name'), role: t('team.2.role'), initials: "AC" },
        { name: t('team.3.name'), role: t('team.3.role'), initials: "LR" },
    ];

    const pressIcons = [<Globe key="g" />, <Activity key="a" />, <Award key="aw" />, <Zap key="z" />, <TrendingUp key="t" />];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-medical-500/10 to-teal-500/10 dark:from-medical-500/5 dark:to-teal-500/5" />
                </div>
                <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium">
                        {t('subtitle')}
                    </p>
                </FadeIn>
            </div>

            {/* Mission & Vision Section */}
            <div className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <StaggerItem className="bg-slate-50 dark:bg-slate-950 p-10 md:p-14 rounded-3xl border border-slate-200 dark:border-slate-800">
                            <div className="h-14 w-14 bg-medical-100 dark:bg-medical-900/30 rounded-2xl flex items-center justify-center mb-8">
                                <Target className="h-7 w-7 text-medical-600 dark:text-medical-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('mission_title')}</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t('mission_desc')}
                            </p>
                        </StaggerItem>
                        <StaggerItem className="bg-slate-50 dark:bg-slate-950 p-10 md:p-14 rounded-3xl border border-slate-200 dark:border-slate-800">
                            <div className="h-14 w-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-8">
                                <Eye className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('vision_title')}</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t('vision_desc')}
                            </p>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </div>

            {/* Values Section */}
            <div className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('values_title')}</h2>
                        <div className="h-1.5 w-24 bg-medical-500 rounded-full mx-auto"></div>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {values.map((val) => (
                            <StaggerItem key={val.id} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 bg-medical-50 dark:bg-medical-900/20 rounded-xl flex items-center justify-center mb-6">
                                    {val.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{val.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {val.desc}
                                </p>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('timeline_title')}</h2>
                        <div className="h-1.5 w-24 bg-medical-500 rounded-full mx-auto"></div>
                    </div>

                    <StaggerContainer className="space-y-12">
                        {timeline.map((item, index) => (
                            <StaggerItem key={index} className="relative flex flex-col md:flex-row items-start md:items-center">
                                <div className="hidden md:flex flex-shrink-0 w-32 justify-end pr-8">
                                    <span className="text-3xl font-extrabold text-medical-200 dark:text-medical-800/50">{item.year}</span>
                                </div>
                                <div className="absolute left-4 md:left-32 top-0 bottom-[-3rem] w-px bg-slate-200 dark:bg-slate-800 md:block hidden last:hidden" />
                                <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-medical-500 border-4 border-slate-50 dark:border-slate-900 z-10 hidden md:block" />

                                <div className="md:pl-8 pt-2 md:pt-0">
                                    <span className="text-xl md:hidden font-extrabold text-medical-500 mb-2 block">{item.year}</span>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

            {/* Team Grid */}
            <div className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('team_title')}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">{t('team_subtitle')}</p>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, idx) => (
                            <StaggerItem key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all">
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-medical-100 to-teal-100 dark:from-medical-900/40 dark:to-teal-900/40 text-medical-600 dark:text-medical-400 rounded-full flex items-center justify-center text-3xl font-bold mb-6">
                                    {member.initials}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{member.name}</h3>
                                <p className="text-medical-600 dark:text-medical-400 font-medium">{member.role}</p>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

            {/* Press Marquee */}
            <div className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-10">{t('press_title')}</p>
                    <FadeIn className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60">
                        {pressIcons.map((icon, i) => (
                            <div key={i} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer transform scale-150">
                                {icon}
                            </div>
                        ))}
                    </FadeIn>
                </div>
            </div>

        </div>
    );
}
