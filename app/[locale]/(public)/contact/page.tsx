"use client";

import { useTranslations } from 'next-intl';
import { Mail, MapPin, Phone, Loader2 } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/FadeIn';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';

const contactSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    email: z.string().email({ message: "Por favor ingresa un correo electrónico válido." }),
    subject: z.string().min(5, { message: "El asunto debe tener al menos 5 caracteres." }),
    message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." })
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
    const t = useTranslations('Company.Contact');

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: ""
        }
    });

    const onSubmit = async (data: ContactFormValues) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Form data:", data);
        toast.success("¡Mensaje enviado con éxito! Nos pondremos en contacto contigo a la brevedad.");
        reset();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Header */}
            <div className="py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-balance">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </FadeIn>
            </div>

            <div className="py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                        {/* Contact Form */}
                        <StaggerItem className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-12">
                            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('form.name')}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        disabled={isSubmitting}
                                        {...register("name")}
                                        className={`w-full rounded-xl border ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-medical-500 focus:border-medical-500'} bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white transition-colors disabled:opacity-50`}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500 font-medium">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('form.email')}
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        disabled={isSubmitting}
                                        {...register("email")}
                                        className={`w-full rounded-xl border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-medical-500 focus:border-medical-500'} bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white transition-colors disabled:opacity-50`}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500 font-medium">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('form.subject')}
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        disabled={isSubmitting}
                                        {...register("subject")}
                                        className={`w-full rounded-xl border ${errors.subject ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-medical-500 focus:border-medical-500'} bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white transition-colors disabled:opacity-50`}
                                    />
                                    {errors.subject && <p className="mt-1 text-sm text-red-500 font-medium">{errors.subject.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('form.message')}
                                    </label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        disabled={isSubmitting}
                                        {...register("message")}
                                        className={`w-full rounded-xl border ${errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-medical-500 focus:border-medical-500'} bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white transition-colors disabled:opacity-50`}
                                    ></textarea>
                                    {errors.message && <p className="mt-1 text-sm text-red-500 font-medium">{errors.message.message}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 px-8 bg-medical-600 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-medical-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5" />
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <span>{t('form.submit')}</span>
                                    )}
                                </button>
                            </form>
                        </StaggerItem>

                        {/* Support Info */}
                        <StaggerItem className="flex flex-col space-y-12">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-medical-100 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400">
                                        <MapPin className="h-7 w-7" />
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('info.headquarters')}</h3>
                                    <p className="text-lg text-slate-600 dark:text-slate-400">{t('info.address')}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                                        <Mail className="h-7 w-7" />
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('info.support')}</h3>
                                    <p className="text-lg text-teal-600 dark:text-teal-400 font-medium">{t('info.email')}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                        <Phone className="h-7 w-7" />
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('info.phone_title')}</h3>
                                    <p className="text-lg text-slate-600 dark:text-slate-400">{t('info.phone')}</p>
                                </div>
                            </div>

                            {/* Legal Info */}
                            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Información Legal</h4>
                                <p>Entidad Legal: Marcos Sandoval Ruiz</p>
                                <p>Nombre Comercial: QuHealthy</p>
                                <p>País: México</p>
                            </div>
                        </StaggerItem>

                    </StaggerContainer>
                </div>
            </div>

        </div>
    );
}
