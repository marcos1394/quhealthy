/* eslint-disable react-doctor/no-react19-deprecated-apis */
import { cva } from "class-variance-authority"

export const buttonVariants = cva(
 "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
 {
 variants: {
 variant: {
 default:
 "bg-medical-600 hover:bg-medical-700 text-white shadow-sm shadow-medical-500/20 hover:shadow-md hover:shadow-medical-500/25 active:bg-medical-800 dark:bg-medical-600 dark:hover:bg-medical-500 dark:shadow-medical-500/10",
 destructive:
 "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20 active:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500",
 outline:
 "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 shadow-sm",
 secondary:
 "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm",
 ghost:
 "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
 success:
 "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 active:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500",
 link: "underline-offset-4 hover:underline text-medical-600 dark:text-medical-400 hover:text-medical-700 dark:hover:text-medical-300",
 },
 size: {
 default: "h-10 py-2 px-4",
 sm: "h-9 px-3 text-xs",
 lg: "h-12 px-8 text-base",
 icon: "h-10 w-10",
 },
 },
 defaultVariants: {
 variant: "default",
 size: "default",
 },
 }
)
