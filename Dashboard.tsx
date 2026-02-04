
import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Transaction } from '../types';
import { TransactionDetailModal } from '../App';

const Dashboard: React.FC<{ transactions: Transaction[]; showBalance: boolean; isDarkMode: boolean }> = ({ transactions, showBalance, isDarkMode }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const stats = useMemo(() => {
    const totalBalance = transactions.reduce((s, t) => t.type === 'INCOME' ? s + t.amount : s - t.amount, 0);
    const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE' || t.type === 'BOCA_PURCHASE' || t.type === 'LOAN_TAKEN').reduce((s, t) => s + t.amount, 0);
    return { totalBalance, income, expense };
  }, [transactions]);

  const recentTxs = useMemo(() => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return transactions
      .filter(t => t.timestamp > oneDayAgo)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  const insight = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    if (expenses.length < 3) return { title: "DICA", text: "Registros diários ajudam no controle real.", color: "text-slate-500" };
    
    const foodTotal = expenses.filter(e => e.category === 'ifood' || e.category === 'mercado').reduce((s, t) => s + t.amount, 0);
    if (foodTotal > 500) return { title: "ALERTA", text: "Seus gastos com alimentação subiram.", color: "text-orange-600" };
    
    return { title: "META", text: "Suas economias cresceram 8% este mês.", color: "text-emerald-600" };
  }, [transactions]);

  return (
    <div className="px-8 space-y-12 animate-fade font-light">
      
      {/* BALANÇO LIMPO */}
      <div className="flex flex-col items-center py-6 space-y-4">
         <span className="text-[8px] text-slate-500 uppercase tracking-[0.4em] font-black">Saldo disponível</span>
         <h1 className="text-4xl tracking-tighter text-slate-800 font-light">
           {showBalance ? `R$ ${stats.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••••'}
         </h1>
         <div className="flex gap-16 mt-6">
            <div className="flex flex-col items-center">
               <div className="flex items-center gap-1 text-emerald-500 mb-1.5 opacity-80">
                 <TrendingUp size={9} strokeWidth={4} />
                 <span className="text-[7px] uppercase tracking-[0.2em] font-black">Entrada</span>
               </div>
               <span className="text-xs text-slate-700 font-medium">{showBalance ? `R$ ${stats.income.toLocaleString('pt-BR')}` : '•••'}</span>
            </div>
            <div className="flex flex-col items-center">
               <div className="flex items-center gap-1 text-rose-600 mb-1.5 opacity-80">
                 <TrendingDown size={9} strokeWidth={4} />
                 <span className="text-[7px] uppercase tracking-[0.2em] font-black">Saída</span>
               </div>
               <span className="text-xs text-slate-700 font-medium">{showBalance ? `R$ ${stats.expense.toLocaleString('pt-BR')}` : '•••'}</span>
            </div>
         </div>
      </div>

      {/* INSIGHT DISCRETO */}
      <div className="p-6 bg-white shadow-slim rounded-[2rem] border border-slate-50 relative overflow-hidden active:scale-[0.99] transition-all">
         <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
               <Sparkles size={14} />
            </div>
            <div className="space-y-0.5">
               <h4 className={`text-[8px] font-black uppercase tracking-[0.3em] ${insight.color}`}>{insight.title}</h4>
               <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{insight.text}</p>
            </div>
         </div>
      </div>

      {/* RECENTES */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] uppercase tracking-[0.3em] text-slate-600 font-black">Histórico</h3>
            <div className="flex items-center gap-1 text-[7px] text-slate-500 font-black uppercase tracking-widest">
               <Clock size={10} />
               <span>Hoje</span>
            </div>
         </div>
         
         <div className="space-y-2.5 pb-4">
            {recentTxs.length > 0 ? recentTxs.map(tx => {
              const cat = CATEGORIES[tx.category] || { icon: '❓' };
              const isIncome = tx.type === 'INCOME';
              // Mostramos o valor TOTAL no dashboard e o número de parcelas
              const isInstallment = tx.paymentMethod === 'CREDIT' && tx.installmentsCount && tx.installmentsCount > 1;
              return (
                <button key={tx.id} onClick={() => setSelectedTx(tx)} className="w-full p-4 bg-white shadow-slim rounded-[1.8rem] flex items-center justify-between active:scale-[0.98] transition-all border border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-base grayscale-0 shrink-0">{cat.icon}</div>
                    <div className="text-left">
                      <h5 className="text-[11px] text-slate-800 tracking-tight font-medium truncate max-w-[140px] leading-tight">{tx.title}</h5>
                      <p className="text-[7px] text-slate-400 uppercase tracking-widest font-black mt-1">
                        {tx.time} • {tx.paymentMethod} {isInstallment ? `(${tx.installmentsCount}x)` : ''}
                      </p>
                    </div>
                  </div>
                  <div className={`text-[11px] font-bold tracking-tighter ${isIncome ? 'text-emerald-500' : 'text-rose-600'}`}>
                    {showBalance ? `${isIncome ? '+' : '-'} R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••'}
                  </div>
                </button>
              );
            }) : (
              <div className="py-16 text-center text-slate-400 text-[9px] uppercase tracking-[0.5em] font-black opacity-40">Vazio</div>
            )}
         </div>
      </div>

      {selectedTx && <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
};

export default Dashboard;
