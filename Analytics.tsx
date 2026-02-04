
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, YAxis } from 'recharts';
import { CATEGORIES } from '../constants';
import { Transaction, User } from '../types';
import { TrendingUp, TrendingDown, ChevronRight, List, X, Target, Pencil } from 'lucide-react';

const AnalyticsPage: React.FC<{ transactions: Transaction[]; isDarkMode: boolean; user: User; onUpdateUser: (u: User) => void; showBalance: boolean }> = ({ transactions, isDarkMode, user, onUpdateUser, showBalance }) => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [chartDetailMonth, setChartDetailMonth] = useState<number | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(user.monthlyGoal?.toString() || '3000');

  const expandedData = useMemo(() => {
    const list: Transaction[] = [];
    transactions.forEach(t => {
      if (t.paymentMethod === 'CREDIT' && t.installmentsCount && t.installmentsCount > 1) {
        const perMonth = t.amount / t.installmentsCount;
        const txDate = new Date(t.timestamp);
        for (let i = 0; i < t.installmentsCount; i++) {
          const instDate = new Date(txDate.getFullYear(), txDate.getMonth() + i, 1);
          list.push({ ...t, id: `${t.id}-${i}`, amount: perMonth, timestamp: instDate.getTime(), date: instDate.toISOString().split('T')[0] });
        }
      } else {
        list.push(t);
      }
    });
    return list;
  }, [transactions]);

  const monthStats = useMemo(() => {
    const monthTxs = expandedData.filter(t => {
      const d = new Date(t.timestamp);
      return d.getFullYear().toString() === selectedYear && d.getMonth() === selectedMonth;
    });

    const income = monthTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.type !== 'INCOME').reduce((s, t) => s + t.amount, 0);
    
    // Comparativo mês anterior
    const prevMonthDate = new Date(parseInt(selectedYear), selectedMonth - 1, 1);
    const prevMonthTxs = expandedData.filter(t => {
      const d = new Date(t.timestamp);
      return d.getFullYear() === prevMonthDate.getFullYear() && d.getMonth() === prevMonthDate.getMonth();
    });
    const prevIncome = prevMonthTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevMonthTxs.filter(t => t.type !== 'INCOME').reduce((s, t) => s + t.amount, 0);

    const calcDiff = (curr: number, prev: number) => prev === 0 ? 0 : ((curr - prev) / prev) * 100;

    const catMap: Record<string, number> = {};
    monthTxs.filter(t => t.type !== 'INCOME').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const categoryData = Object.entries(catMap).map(([id, val]) => ({
      name: CATEGORIES[id]?.name || 'Outros',
      value: val,
      color: CATEGORIES[id]?.color || '#cbd5e1'
    })).sort((a,b) => b.value - a.value);

    return { 
      income, 
      expense, 
      prevIncome, 
      prevExpense, 
      diffIncome: calcDiff(income, prevIncome), 
      diffExpense: calcDiff(expense, prevExpense), 
      categoryData,
      balance: income - expense
    };
  }, [expandedData, selectedYear, selectedMonth]);

  const barData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const txs = expandedData.filter(t => {
        const d = new Date(t.timestamp);
        return d.getFullYear().toString() === selectedYear && d.getMonth() === i;
      });
      return {
        name: ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][i],
        monthIndex: i,
        Entrada: txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
        Saída: txs.filter(t => t.type !== 'INCOME').reduce((s, t) => s + t.amount, 0)
      };
    });
  }, [expandedData, selectedYear]);

  const detailInfo = useMemo(() => {
    if (chartDetailMonth === null) return null;
    return barData[chartDetailMonth];
  }, [chartDetailMonth, barData]);

  const goalProgress = Math.min(100, (monthStats.expense / (user.monthlyGoal || 3000)) * 100);

  const handleUpdateGoal = () => {
    onUpdateUser({ ...user, monthlyGoal: parseFloat(tempGoal) });
    setIsEditingGoal(false);
  };

  return (
    <div className="px-8 space-y-12 animate-fade font-light pb-24">
      <div className="flex items-center justify-between">
         <h2 className="text-xl tracking-tighter text-slate-800 font-light">Análises</h2>
         <div className="flex gap-2">
           <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="p-3 bg-white shadow-slim rounded-2xl text-[9px] font-black uppercase tracking-widest outline-none border border-white">
             {['2026', '2027', '2028', '2029', '2030'].map(y => <option key={y} value={y}>{y}</option>)}
           </select>
           <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="p-3 bg-white shadow-slim rounded-2xl text-[9px] font-black uppercase tracking-widest outline-none border border-white">
             {['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'].map((m, i) => <option key={i} value={i}>{m}</option>)}
           </select>
         </div>
      </div>

      {/* META MENSAL */}
      <div className="p-8 bg-white shadow-premium rounded-[3rem] border border-white space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Target size={18} />
               </div>
               <div>
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    Meta de Gastos
                    <button onClick={() => setIsEditingGoal(true)} className="text-slate-400 hover:text-slate-900 transition-all">
                      <Pencil size={10} />
                    </button>
                  </h4>
                  {isEditingGoal ? (
                    <div className="flex items-center gap-2 mt-1 animate-fade">
                      <input 
                        type="number" 
                        value={tempGoal} 
                        onChange={e => setTempGoal(e.target.value)}
                        className="w-24 p-2 text-sm font-bold border border-slate-200 outline-none bg-white rounded-xl text-slate-800 shadow-inner"
                        autoFocus
                      />
                      <button onClick={handleUpdateGoal} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">OK</button>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-800">R$ {user.monthlyGoal?.toLocaleString('pt-BR') || '3.000'}</p>
                  )}
               </div>
            </div>
            <div className="text-right">
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Utilizado</span>
               <p className="text-xs font-bold text-slate-800">{goalProgress.toFixed(0)}%</p>
            </div>
         </div>
         <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${goalProgress > 90 ? 'bg-rose-500' : 'bg-slate-900'}`} 
              style={{ width: `${goalProgress}%` }}
            ></div>
         </div>
         <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest text-center">Baseado em saídas confirmadas para este mês</p>
      </div>

      {/* RESUMO ESTILO DASHBOARD */}
      <div className="flex flex-col items-center space-y-8">
         <div className="flex gap-16">
            <div className="flex flex-col items-center">
               <div className="flex items-center gap-1 text-emerald-500 mb-1.5 opacity-80">
                 <TrendingUp size={9} strokeWidth={4} />
                 <span className="text-[7px] uppercase tracking-[0.2em] font-black">Entrada</span>
               </div>
               <span className="text-xs text-slate-700 font-medium">{showBalance ? `R$ ${monthStats.income.toLocaleString('pt-BR')}` : '•••'}</span>
               <span className={`text-[7px] font-black mt-1 ${monthStats.diffIncome >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                  {monthStats.diffIncome >= 0 ? '↑' : '↓'} {Math.abs(monthStats.diffIncome).toFixed(1)}%
               </span>
            </div>
            <div className="flex flex-col items-center">
               <div className="flex items-center gap-1 text-rose-600 mb-1.5 opacity-80">
                 <TrendingDown size={9} strokeWidth={4} />
                 <span className="text-[7px] uppercase tracking-[0.2em] font-black">Saída</span>
               </div>
               <span className="text-xs text-slate-700 font-medium">{showBalance ? `R$ ${monthStats.expense.toLocaleString('pt-BR')}` : '•••'}</span>
               <span className={`text-[7px] font-black mt-1 ${monthStats.diffExpense <= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                  {monthStats.diffExpense >= 0 ? '↑' : '↓'} {Math.abs(monthStats.diffExpense).toFixed(1)}%
               </span>
            </div>
         </div>
      </div>

      <div className="space-y-12">
        {/* BAR CHART - CORES E ALINHAMENTO CORRIGIDOS */}
        <div className="p-10 bg-white shadow-premium rounded-[3.5rem] border border-white">
           <h3 className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] mb-12">Evolução do Fluxo</h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                   data={barData} 
                   barCategoryGap="25%" 
                   barGap={4}
                   onClick={(data) => data && data.activeTooltipIndex !== undefined && setChartDetailMonth(data.activeTooltipIndex)}
                 >
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 8, fill: '#cbd5e1', fontWeight: 900}} 
                      padding={{ left: 10, right: 10 }}
                    />
                    <Tooltip cursor={{fill: '#f8fafc', radius: 10}} content={() => null} />
                    <Bar 
                      dataKey="Entrada" 
                      fill="#10b981" 
                      radius={[4,4,0,0]} 
                      barSize={8} 
                      opacity={0.8} 
                    />
                    <Bar 
                      dataKey="Saída" 
                      fill="#ef4444" 
                      radius={[4,4,0,0]} 
                      barSize={8} 
                      opacity={0.8} 
                    />
                 </BarChart>
              </ResponsiveContainer>
           </div>
           
           {detailInfo && (
              <div className="mt-8 p-6 bg-slate-50 rounded-3xl animate-fade">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{detailInfo.name}</span>
                    <button onClick={() => setChartDetailMonth(null)} className="text-slate-300"><X size={14}/></button>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Ganhos</span>
                       <p className="text-sm font-bold text-emerald-600">R$ {detailInfo.Entrada.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="space-y-1 text-right">
                       <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Gastos</span>
                       <p className="text-sm font-bold text-rose-500">R$ {detailInfo.Saída.toLocaleString('pt-BR')}</p>
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* CATEGORY DONUT */}
        <div className="p-10 bg-white shadow-premium rounded-[3.5rem] flex flex-col items-center border border-white">
           <h3 className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] mb-10">Custos por Categoria</h3>
           <div className="w-60 h-60 relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={monthStats.categoryData} cx="50%" cy="50%" innerRadius={75} outerRadius={100} paddingAngle={6} dataKey="value" stroke="none">
                       {monthStats.categoryData.map((e,i) => <Cell key={i} fill={e.color} opacity={0.8} />)}
                    </Pie>
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="w-full mt-10 space-y-4">
              {monthStats.categoryData.slice(0, 5).map((c, i) => (
                <div key={i} className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: c.color, opacity: 0.6}}></div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">{c.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">R$ {c.value.toLocaleString('pt-BR')}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
