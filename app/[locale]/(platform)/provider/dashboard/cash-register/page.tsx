"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Play, Ban, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw, CheckCircle2, History, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cashRegisterService } from '@/services/cash-register.service';
import { CashRegister, CashRegisterReportDto, DenominationMap } from '@/types/cash-register';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { toast } from 'react-toastify';
import { CloseRegisterModal } from '@/components/cash-register/CloseRegisterModal';
import { ManualExpenseModal } from '@/components/cash-register/ManualExpenseModal';
import { paymentService } from '@/services/payment.service';
import { cn } from '@/lib/utils';

export default function CashRegisterPage() {
 const t = useTranslations('CashRegister');
 const [{ register, report, isLoading, activeTab, history, isHistoryLoading, initialBalance, isOpening, showBreakdown, breakdown, isCloseModalOpen, isExpenseModalOpen }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_REGISTER': return { ...state, register: typeof action.payload === 'function' ? action.payload(state.register) : action.payload };
 case 'SET_REPORT': return { ...state, report: typeof action.payload === 'function' ? action.payload(state.report) : action.payload };
 case 'SET_ISLOADING': return { ...state, isLoading: typeof action.payload === 'function' ? action.payload(state.isLoading) : action.payload };
 case 'SET_ACTIVETAB': return { ...state, activeTab: typeof action.payload === 'function' ? action.payload(state.activeTab) : action.payload };
 case 'SET_HISTORY': return { ...state, history: typeof action.payload === 'function' ? action.payload(state.history) : action.payload };
 case 'SET_ISHISTORYLOADING': return { ...state, isHistoryLoading: typeof action.payload === 'function' ? action.payload(state.isHistoryLoading) : action.payload };
 case 'SET_INITIALBALANCE': return { ...state, initialBalance: typeof action.payload === 'function' ? action.payload(state.initialBalance) : action.payload };
 case 'SET_ISOPENING': return { ...state, isOpening: typeof action.payload === 'function' ? action.payload(state.isOpening) : action.payload };
 case 'SET_SHOWBREAKDOWN': return { ...state, showBreakdown: typeof action.payload === 'function' ? action.payload(state.showBreakdown) : action.payload };
 case 'SET_BREAKDOWN': return { ...state, breakdown: typeof action.payload === 'function' ? action.payload(state.breakdown) : action.payload };
 case 'SET_ISCLOSEMODALOPEN': return { ...state, isCloseModalOpen: typeof action.payload === 'function' ? action.payload(state.isCloseModalOpen) : action.payload };
 case 'SET_ISEXPENSEMODALOPEN': return { ...state, isExpenseModalOpen: typeof action.payload === 'function' ? action.payload(state.isExpenseModalOpen) : action.payload };
 default: return state;
 }
 },
 {
 register: null, report: null, isLoading: true, activeTab: 'current', history: [], isHistoryLoading: false, initialBalance: '', isOpening: false, showBreakdown: false, breakdown: {
 '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0,
 '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0
 }, isCloseModalOpen: false, isExpenseModalOpen: false
 }
 );

 const setRegister = (val: any) => dispatch({ type: 'SET_REGISTER', payload: val });
 const setReport = (val: any) => dispatch({ type: 'SET_REPORT', payload: val });
 const setIsLoading = (val: any) => dispatch({ type: 'SET_ISLOADING', payload: val });
 const setActiveTab = (val: any) => dispatch({ type: 'SET_ACTIVETAB', payload: val });
 const setHistory = (val: any) => dispatch({ type: 'SET_HISTORY', payload: val });
 const setIsHistoryLoading = (val: any) => dispatch({ type: 'SET_ISHISTORYLOADING', payload: val });
 const setInitialBalance = (val: any) => dispatch({ type: 'SET_INITIALBALANCE', payload: val });
 const setIsOpening = (val: any) => dispatch({ type: 'SET_ISOPENING', payload: val });
 const setShowBreakdown = (val: any) => dispatch({ type: 'SET_SHOWBREAKDOWN', payload: val });
 const setBreakdown = (val: any) => dispatch({ type: 'SET_BREAKDOWN', payload: val });
 const setIsCloseModalOpen = (val: any) => dispatch({ type: 'SET_ISCLOSEMODALOPEN', payload: val });
 const setIsExpenseModalOpen = (val: any) => dispatch({ type: 'SET_ISEXPENSEMODALOPEN', payload: val });


 const updateBreakdown = (denom: string, count: number) => {
 const newBreakdown = { ...breakdown, [denom]: count };
 setBreakdown(newBreakdown);
 const total = Object.entries(newBreakdown).reduce((acc, [d, c]: [string, any]) => acc + (parseFloat(d) * c), 0);
 setInitialBalance(total > 0 ? total.toString() : '');
 };

 const fetchHistory = async () => {
 try {
 setIsHistoryLoading(true);
 const res = await paymentService.getCashRegisterHistory(0, 50);
 if (res && res.content) {
 setHistory(res.content);
 }
 } catch (error) {
 console.error(error);
 } finally {
 setIsHistoryLoading(false);
 }
 };

 const fetchCurrentRegister = async () => {
 try {
 setIsLoading(true);
 const current = await cashRegisterService.getCurrentRegister();
 setRegister(current);

 if (current) {
 const reportData = await cashRegisterService.getRegisterReport(current.id);
 setReport(reportData);
 } else {
 setReport(null);
 }
 } catch (error) {
 console.error(error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchCurrentRegister();
 fetchHistory();
 }, []);

 const handleOpenRegister = async () => {
 const parsedBalance = parseFloat(initialBalance || '0');
 if (parsedBalance < 0) {
 toast.error('El balance inicial no puede ser negativo.');
 return;
 }
 const hasBreakdownValues = showBreakdown && Object.values(breakdown).some((v: any) => v > 0);
 const cleanDenoms: DenominationMap | undefined = hasBreakdownValues 
 ? Object.fromEntries(Object.entries(breakdown).filter(([, v]: [string, any]) => v > 0)) as any
 : undefined;
 try {
 setIsOpening(true);
 await cashRegisterService.openRegister({
 locationId: null,
 initialBalance: parsedBalance,
 initialDenominations: cleanDenoms,
 });
 toast.success('Caja abierta correctamente.');
 fetchCurrentRegister();
 } catch (error: any) {
 console.error(error);
 toast.error(error.response?.data?.message || 'Fallo al abrir caja.');
 } finally {
 setIsOpening(false);
 }
 };

 if (isLoading) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505]">
 <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
 <p className="text-sm font-semibold text-gray-500 mt-6 animate-pulse">
 Consultando estado contable...
 </p>
 </div>
 );
 }

 // --- VISTA 1: CAJA CERRADA ---
 if (!register) {
 return (
 <div className="max-w-4xl mx-auto space-y-8 bg-gray-50/50 dark:bg-[#050505] min-h-screen pt-8 px-6 md:px-10">
 <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden">
 
 <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 flex items-start gap-5 bg-white dark:bg-[#0a0a0a]">
 <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0">
 <Calculator className="w-6 h-6 text-gray-500" strokeWidth={2} />
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
 Estado Operativo: Inactivo
 </p>
 <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
 Caja Cerrada
 </h2>
 <p className="text-xs font-medium text-gray-500 mt-3 max-w-lg leading-relaxed">
 Es necesario abrir caja para habilitar la recepción de fondos. Indique el fondo de cambio inicial.
 </p>
 </div>
 </div>

 <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505]">
 <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <label className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
 <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600">1</span>
 Balance Inicial en Caja *
 </label>
 <div className="relative mt-2">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
 <input 
 type="number"
 min="0"
 step="0.01"
 value={initialBalance}
 onChange={(e) => {
 setInitialBalance(e.target.value);
 if (showBreakdown) {
 setBreakdown({
 '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0,
 '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0
 });
 }
 }}
 className="w-full h-14 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xl font-semibold focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
 placeholder="0.00"
 />
 </div>
 </div>

 <div className="bg-white dark:bg-[#0a0a0a]">
 <button 
 type="button" 
 onClick={() => setShowBreakdown(!showBreakdown)}
 className="w-full flex items-center justify-between p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group"
 >
 <span className="text-sm font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-200">
 <Calculator className="w-4 h-4 text-emerald-600" strokeWidth={2} />
 {showBreakdown ? 'Ocultar Matriz de Desglose' : 'Habilitar Matriz de Desglose (Opcional)'}
 </span>
 </button>

 <AnimatePresence>
 {showBreakdown && (
 <motion.div 
 initial={{ opacity: 0, height: 0 }} 
 animate={{ opacity: 1, height: 'auto' }} 
 exit={{ opacity: 0, height: 0 }}
 className="border-b border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50/50 dark:bg-[#050505]"
 >
 <div className="p-4 border-b border-gray-100 dark:border-gray-800">
 <p className="text-xs font-semibold text-gray-500 text-center">
 Cantidad física de billetes y monedas
 </p>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-l border-gray-100 dark:border-gray-800">
 {['1000', '500', '200', '100', '50', '20', '10', '5', '2', '1', '0.5'].map(denom => (
 <div key={denom} className="border-r border-b border-gray-100 dark:border-gray-800 p-4 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
 <span className="text-sm font-bold text-gray-900 dark:text-white mb-3">
 ${denom}
 </span>
 <input 
 type="number" 
 min="0"
 value={breakdown[denom] || ''} 
 onChange={(e) => updateBreakdown(denom, parseInt(e.target.value) || 0)}
 className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white text-xs font-semibold text-center focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
 placeholder="0"
 />
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 
 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
 <Button 
 onClick={handleOpenRegister} 
 disabled={isOpening || !initialBalance}
 className="w-full h-14 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 border-0 text-sm font-bold transition-colors flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
 >
 {isOpening ? <QhSpinner size="sm" className="text-current" /> : <Play className="w-4 h-4" strokeWidth={2} />}
 {isOpening ? 'Procesando apertura...' : 'Inicializar Caja'}
 </Button>
 </div>
 </div>
 </div>
 </div>
 );
 }

 // --- VISTA 2: CAJA ABIERTA (DASHBOARD) ---
 return (
 <div className="max-w-7xl mx-auto space-y-8 bg-gray-50/50 dark:bg-[#050505] min-h-screen pt-8 px-6 md:px-10 pb-16 transition-colors">
 
 {/* TABS HEADER */}
 <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
 <button
 onClick={() => setActiveTab('current')}
 className={cn(
 "px-6 h-12 flex items-center justify-center rounded-xl transition-colors text-sm font-bold",
 activeTab === 'current'
 ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 border border-gray-200 dark:border-gray-800 shadow-sm"
 : "bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#111]"
 )}
 >
 <Calculator className="w-4 h-4 mr-2" strokeWidth={2} /> Caja Activa
 </button>
 <button
 onClick={() => setActiveTab('history')}
 className={cn(
 "px-6 h-12 flex items-center justify-center rounded-xl transition-colors text-sm font-bold",
 activeTab === 'history'
 ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 border border-gray-200 dark:border-gray-800 shadow-sm"
 : "bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#111]"
 )}
 >
 <History className="w-4 h-4 mr-2" strokeWidth={2} /> Historial
 </button>
 </div>

 {activeTab === 'current' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 
 {/* Header Info */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white dark:bg-[#0a0a0a] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
 <Calculator className="w-6 h-6" strokeWidth={2} />
 </div>
 <div>
 <div className="flex items-center gap-3 mb-1">
 <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
 Turno Actual
 </h1>
 <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-800">
 <span className="w-2 h-2 rounded-full bg-emerald-500" /> Abierta
 </span>
 </div>
 <p className="text-xs font-semibold text-gray-500 mt-2">
 Apertura: {new Date(register.openedAt).toLocaleString()}
 </p>
 </div>
 </div>
 
 <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
 <button onClick={() => setIsExpenseModalOpen(true)} className="flex-1 sm:flex-none h-12 px-6 flex items-center justify-center gap-2 rounded-xl bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors text-sm font-bold border border-gray-200 dark:border-gray-700 shadow-sm">
 <ArrowUpRight className="w-4 h-4" strokeWidth={2} /> Salida Efectivo
 </button>
 <button onClick={fetchCurrentRegister} className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm">
 <RefreshCcw className="w-4 h-4" strokeWidth={2} />
 </button>
 <button onClick={() => setIsCloseModalOpen(true)} className="flex-1 sm:flex-none h-12 px-6 flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors text-sm font-bold border border-red-100 dark:border-red-900/30 shadow-sm">
 <Ban className="w-4 h-4" strokeWidth={2} /> Cerrar Caja
 </button>
 </div>
 </div>

 {/* Stats: Soft Health Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between min-h-[140px] shadow-sm">
 <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#111] flex items-center justify-center mb-4">
 <Calculator className="w-5 h-5 text-gray-500" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">Balance Inicial</p>
 <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">${register.initialBalance.toFixed(2)}</p>
 </div>
 </div>
 <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between min-h-[140px] shadow-sm">
 <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
 <ArrowDownRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">Ingresos del Día</p>
 <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">
 +${report?.transactions.filter((t: any) => t.transactionType === 'INCOME').reduce((acc: number, t: any) => acc + t.amount, 0).toFixed(2) || '0.00'}
 </p>
 </div>
 </div>
 <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between min-h-[140px] shadow-sm">
 <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
 <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">Egresos del Día</p>
 <p className="text-2xl font-bold text-red-600 dark:text-red-400 leading-none">
 -${report?.transactions.filter((t: any) => t.transactionType === 'EXPENSE').reduce((acc: number, t: any) => acc + t.amount, 0).toFixed(2) || '0.00'}
 </p>
 </div>
 </div>
 <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-6 rounded-2xl flex flex-col justify-between min-h-[140px] relative overflow-hidden shadow-sm">
 <div className="absolute -top-4 -right-4 p-4 opacity-20">
 <Banknote className="w-24 h-24 text-white" />
 </div>
 <div className="relative z-10 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
 <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2} />
 </div>
 <div className="relative z-10">
 <p className="text-xs font-semibold text-emerald-100 mb-1">Balance Esperado</p>
 <p className="text-2xl font-bold text-white leading-none">
 ${register.expectedClosingBalance?.toFixed(2) || register.initialBalance.toFixed(2)}
 </p>
 </div>
 </div>
 </div>

 {/* Transactions List */}
 <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
 <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none">Libro Mayor</h3>
 </div>
 
 {report?.transactions && report.transactions.length > 0 ? (
 <div className="divide-y divide-gray-100 dark:divide-gray-800">
 {report.transactions.map((tx: any) => (
 <div key={tx.id} className="p-6 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-start sm:items-center gap-4">
 <div className={cn(
 "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors",
 tx.transactionType === 'INCOME' 
 ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400" 
 : "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800 text-red-600 dark:text-red-400"
 )}>
 {tx.transactionType === 'INCOME' ? <ArrowDownRight className="w-5 h-5" strokeWidth={2} /> : <ArrowUpRight className="w-5 h-5" strokeWidth={2} />}
 </div>
 <div>
 <p className="text-sm font-bold text-gray-900 dark:text-white">{tx.description}</p>
 <div className="flex items-center gap-3 mt-1.5">
 <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-[#111] px-2 py-0.5 rounded-md">
 {tx.referenceType}
 </span>
 <span className="text-xs font-semibold text-gray-400">
 {new Date(tx.createdAt).toLocaleTimeString()} hrs
 </span>
 </div>
 </div>
 </div>
 <div className="sm:text-right ml-16 sm:ml-0">
 <p className={cn(
 "text-lg font-bold leading-none",
 tx.transactionType === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
 )}>
 {tx.transactionType === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
 </p>
 </div>
 </div>
 {/* Desglose de denominaciones */}
 {tx.denominations && Object.keys(tx.denominations).length > 0 && (
 <div className="mt-4 ml-16 flex flex-wrap gap-2">
 {Object.entries(tx.denominations)
 .filter(([, count]: [string, any]) => count > 0)
 .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
 .map(([denom, count]) => (
 <span 
 key={denom}
 className={cn(
 "text-xs font-bold px-2 py-1 rounded-md border",
 tx.transactionType === 'INCOME' 
 ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/30' 
 : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/30'
 )}
 >
 {String(count)} × ${denom}
 </span>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>
 ) : (
 <div className="p-16 flex flex-col items-center justify-center text-center">
 <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-[#111] flex items-center justify-center mb-6">
 <Banknote className="w-6 h-6 text-gray-400" strokeWidth={2} />
 </div>
 <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">Cero Movimientos</h4>
 <p className="text-sm font-medium text-gray-500">Los ingresos y egresos en efectivo se registrarán aquí.</p>
 </div>
 )}
 </div>
 </motion.div>
 )}

 {/* --- PESTAÑA DE HISTORIAL --- */}
 {activeTab === 'history' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
 <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
 <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
 <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none">Registros Anteriores</h3>
 <button onClick={fetchHistory} className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold flex items-center gap-2 shadow-sm">
 <RefreshCcw className="w-3.5 h-3.5" strokeWidth={2} /> Actualizar
 </button>
 </div>
 
 {isHistoryLoading ? (
 <div className="p-16 flex flex-col items-center justify-center text-center">
 <QhSpinner className="mb-4 text-emerald-600 dark:text-emerald-400" />
 <p className="text-xs font-semibold text-gray-500 animate-pulse">Consultando historial...</p>
 </div>
 ) : history.length > 0 ? (
 <div className="overflow-x-auto custom-scrollbar">
 <table className="w-full text-left min-w-[800px]">
 <thead className="bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-500 border-b border-gray-100 dark:border-gray-800">
 <tr>
 <th className="px-6 py-4 whitespace-nowrap">Estado</th>
 <th className="px-6 py-4 whitespace-nowrap">Apertura</th>
 <th className="px-6 py-4 whitespace-nowrap">Cierre</th>
 <th className="px-6 py-4 whitespace-nowrap">Balance Inicial</th>
 <th className="px-6 py-4 whitespace-nowrap">Balance Final</th>
 <th className="px-6 py-4 whitespace-nowrap text-right">Descuadre</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#0a0a0a]">
 {history.map((h: any) => (
 <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
 <td className="px-6 py-4">
 {h.status === 'OPEN' ? (
 <span className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 w-fit">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Abierta
 </span>
 ) : (
 <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 w-fit">
 <span className="w-1.5 h-1.5 rounded-full bg-gray-500" /> Cerrada
 </span>
 )}
 </td>
 <td className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
 {new Date(h.openedAt).toLocaleString()}
 </td>
 <td className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
 {h.closedAt ? new Date(h.closedAt).toLocaleString() : <span className="text-gray-400">—</span>}
 </td>
 <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
 ${h.initialBalance.toFixed(2)}
 </td>
 <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
 ${(h.actualClosingBalance || 0).toFixed(2)}
 </td>
 <td className="px-6 py-4 text-right">
 {h.balanceDifference !== undefined && h.balanceDifference !== null ? (
 <span className={cn(
 "text-sm font-bold",
 h.balanceDifference > 0 ? "text-emerald-600 dark:text-emerald-400" : h.balanceDifference < 0 ? "text-red-600 dark:text-red-400" : "text-gray-500"
 )}>
 {h.balanceDifference > 0 ? '+' : ''}${h.balanceDifference.toFixed(2)}
 </span>
 ) : <span className="text-gray-400">—</span>}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <div className="p-16 flex flex-col items-center justify-center text-center">
 <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-[#111] flex items-center justify-center mb-6">
 <AlertCircle className="w-6 h-6 text-gray-400" strokeWidth={2} />
 </div>
 <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">Registro Vacío</h4>
 <p className="text-sm font-medium text-gray-500">El sistema aún no cuenta con historial de cajas cerradas.</p>
 </div>
 )}
 </div>
 </motion.div>
 )}

 <CloseRegisterModal 
 isOpen={isCloseModalOpen}
 onClose={() => setIsCloseModalOpen(false)}
 registerId={register.id}
 expectedBalance={register.expectedClosingBalance || register.initialBalance}
 onSuccess={() => {
 fetchCurrentRegister();
 fetchHistory();
 }}
 />
 
 <ManualExpenseModal
 isOpen={isExpenseModalOpen}
 onClose={() => setIsExpenseModalOpen(false)}
 onSuccess={() => {
 setIsExpenseModalOpen(false);
 fetchCurrentRegister();
 }}
 currentDenominations={register.currentDenominations || register.initialDenominations}
 maxExpectedBalance={register.expectedClosingBalance || register.initialBalance}
 />
 </div>
 );
}