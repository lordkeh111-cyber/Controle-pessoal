
import React, { useState, useMemo } from 'react';
import { Search, Trash2, ListFilter, TrendingUp, TrendingDown, Clock, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Transaction } from '../types';
import { TransactionDetailModal } from '../App';

interface TransactionsPageProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  showBalance: boolean;
  isDarkMode: boolean;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ transactions, onDelete, showBalance, isDarkMode }) => {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const YEARS = ['2026', '2027', '2028', '2029', '2030'];
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const filteredData = useMemo(() => {
    const expanded: Transaction[] = [];
    transactions.forEach(t => {
      if (t.paymentMethod === 'CREDIT' && t.installmentsCount && t.installmentsCount > 1) {
        const valPerInst = t.amount / t.installmentsCount;
        const txDate = new Date(t.timestamp);
        for (let i = 0; i < t.installmentsCount; i++) {
          const instDate = new Date(txDate.getFullYear(), txDate.getMonth() + i, 1);
          expanded.push({
            ...t,
            id: `${t.id}-inst-${i}`,
            title: `${t.title} (${i + 1}/${t.installmentsCount})`,
            amount: valPerInst,
            timestamp: instDate.getTime(),
            date: instDate.toISOString().split('T')[0],
            currentInstallment: i + 1
          });
        }
      } else {
        expanded.push(t);
      }
    });

    return expanded
      .filter(t => {
        const d = new Date(t.timestamp);
        const matchDate = d.getFullYear().toString() === selectedYear && d.getMonth().toString() === selectedMonth;
        const matchType = filter === 'ALL' ? true : (filter === 'INCOME' ? t.type === 'INCOME' : (t.type === 'EXPENSE' || t.type === 'BOCA_PURCHASE' || t.type === 'LOAN_TAKEN'));
        return matchDate && matchType;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, selectedYear, selectedMonth, filter]);

  const monthSummary = useMemo(() => {
    const income = filteredData.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expense = filteredData.filter(t => t.type !== 'INCOME').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [filteredData]);

  return (
    <div className="px-8 space-y-10 animate-fade font-light">
      
      {/* FILTROS */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h2 className="text-lg tracking-tighter text-slate-800 font-medium">Histórico</h2>
            <div className="flex gap-1.5">
               {['ALL', 'INCOME', 'EXPENSE'].map(f => (
                 <button key={f} onClick={() => setFilter(f as any)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-white shadow-slim text-slate-400'}`}>
                    {f === 'ALL' ? <ListFilter size={13}/> : f === 'INCOME' ? <TrendingUp size={13}/> : <TrendingDown size={13}/>}
                 </button>
               ))}
            </div>
         </div>

         <div className="flex gap-2">
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="flex-1 p-3.5 bg-white shadow-slim rounded-2xl text-[9px] font-black uppercase tracking-widest text-center outline-none border border-slate-50 text-slate-600">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="flex-1 p-3.5 bg-white shadow-slim rounded-2xl text-[9px] font-black uppercase tracking-widest text-center outline-none border border-slate-50 text-slate-600">
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
         </div>
      </div>

      {/* RESUMO ESTILO DASHBOARD */}
      <div className="flex justify-center gap-16 py-6 border-b border-slate-50">
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-1 text-emerald-500 mb-1.5 opacity-80">
               <TrendingUp size={9} strokeWidth={4} />
               <span className="text-[7px] uppercase tracking-[0.2em] font-black">Entrada</span>
             </div>
             <span className="text-xs text-slate-700 font-medium">{showBalance ? `R$ ${monthSummary.income.toLocaleString('pt-BR')}` : '•••'}</span>
          </div>
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-1 text-rose-600 mb-1.5 opacity-80">
               <TrendingDown size={9} strokeWidth={4} />
               <span className="text-[7px] uppercase tracking-[0.2em] font-black">Saída</span>
             </div>
             <span className="text-xs text-slate-700 font-medium">{showBalance ? `R$ ${monthSummary.expense.toLocaleString('pt-BR')}` : '•••'}</span>
          </div>
      </div>

      {/* LISTA */}
      <div className="space-y-3 pb-24">
         {filteredData.length > 0 ? filteredData.map(tx => {
           const cat = CATEGORIES[tx.category] || { icon: '❓' };
           const isIncome = tx.type === 'INCOME';
           return (
             <button key={tx.id} onClick={() => setSelectedTx(tx)} className="w-full p-4 bg-white shadow-slim rounded-[1.8rem] flex items-center justify-between transition-all active:scale-[0.98] border border-slate-50">
                <div className="flex items-center gap-4">
                   <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-base shrink-0">{cat.icon}</div>
                   <div className="text-left">
                      <h5 className="text-[11px] text-slate-700 font-medium tracking-tight truncate max-w-[120px] leading-tight">
                        {tx.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest">
                          {new Date(tx.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                        {tx.isSpecialOperation && <Sparkles size={9} className="text-amber-400" />}
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold tracking-tighter ${isIncome ? 'text-emerald-500' : 'text-rose-600'}`}>
                    {showBalance ? `${isIncome ? '+' : '-'} R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••'}
                  </span>
                  <div onClick={(e) => { e.stopPropagation(); onDelete(tx.id.split('-inst-')[0]); }} className="text-slate-200 hover:text-rose-400 p-1"><Trash2 size={13}/></div>
                </div>
             </button>
           );
         }) : (
           <div className="py-24 text-center text-slate-400 text-[9px] uppercase tracking-[0.4em] font-black opacity-40">Vazio</div>
         )}
      </div>

      {selectedTx && <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
};

export default TransactionsPage;
