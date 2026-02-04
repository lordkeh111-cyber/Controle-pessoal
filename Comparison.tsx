
import React, { useMemo, useState } from 'react';
import { ArrowUpDown, ChevronDown, TrendingUp, TrendingDown, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction } from '../types';

interface ComparisonPageProps {
  transactions?: Transaction[];
  showBalance?: boolean;
  isDarkMode?: boolean;
}

const ComparisonPage: React.FC<ComparisonPageProps> = ({ transactions = [], showBalance = true, isDarkMode = false }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [rangeEnd, setRangeEnd] = useState<Date | null>(new Date());
  const [viewDate, setViewDate] = useState(new Date());

  const stats = useMemo(() => {
    if (!rangeStart || !rangeEnd) return null;

    const start = new Date(rangeStart).setHours(0, 0, 0, 0);
    const end = new Date(rangeEnd).setHours(23, 59, 59, 999);
    const duration = end - start;

    // Período Atual
    const currentTrans = transactions.filter(t => t.timestamp >= start && t.timestamp <= end);
    const cIncome = currentTrans.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const cExpense = currentTrans.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

    // Período Anterior (mesma duração)
    const prevStart = start - duration;
    const prevEnd = start - 1;
    const prevTrans = transactions.filter(t => t.timestamp >= prevStart && t.timestamp <= prevEnd);
    const pIncome = prevTrans.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const pExpense = prevTrans.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

    const calcDiff = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100;

    return {
      current: { income: cIncome, expense: cExpense, balance: cIncome - cExpense },
      prev: { income: pIncome, expense: pExpense, balance: pIncome - pExpense },
      diffs: {
        income: calcDiff(cIncome, pIncome),
        expense: calcDiff(cExpense, pExpense),
        balance: calcDiff(cIncome - cExpense, pIncome - pExpense)
      }
    };
  }, [transactions, rangeStart, rangeEnd]);

  // Lógica do Calendário
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(clickedDate);
      setRangeEnd(null);
    } else if (clickedDate < rangeStart) {
      setRangeStart(clickedDate);
      setRangeEnd(null);
    } else {
      setRangeEnd(clickedDate);
    }
  };

  const isInRange = (day: number) => {
    if (!rangeStart || !rangeEnd) return false;
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return d >= rangeStart && d <= rangeEnd;
  };

  const isSelected = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return (rangeStart?.getTime() === d.getTime()) || (rangeEnd?.getTime() === d.getTime());
  };

  return (
    <div className={`px-10 py-10 space-y-8 pb-24 transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Comparativo</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Análise por Período</p>
        </div>
        <button onClick={() => setShowCalendar(true)} className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-soft border border-slate-100 text-[#1DB954]'}`}>
          <CalendarIcon size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Seletor de Datas Slim */}
      <div onClick={() => setShowCalendar(true)} className={`p-6 rounded-[2.5rem] border shadow-soft flex items-center justify-between cursor-pointer transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}>
        <div className="space-y-1">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Intervalo Selecionado</p>
          <p className="text-xs font-bold text-slate-800">
            {rangeStart ? rangeStart.toLocaleDateString('pt-BR') : 'Início'} — {rangeEnd ? rangeEnd.toLocaleDateString('pt-BR') : 'Fim'}
          </p>
        </div>
        <ArrowUpDown size={14} className="text-[#1DB954]" />
      </div>

      {stats && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {[
            { label: 'Entradas', val: stats.current.income, diff: stats.diffs.income, type: 'INCOME' },
            { label: 'Saídas', val: stats.current.expense, diff: stats.diffs.expense, type: 'EXPENSE' },
            { label: 'Resíduo', val: stats.current.balance, diff: stats.diffs.balance, type: 'BALANCE' }
          ].map((item, i) => {
            const isBetter = item.type === 'EXPENSE' ? item.diff <= 0 : item.diff >= 0;
            return (
              <div key={i} className={`p-7 rounded-[2.8rem] border shadow-soft space-y-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                  <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[9px] font-bold ${isBetter ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {item.diff >= 0 ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
                    {Math.abs(item.diff).toFixed(1)}%
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                   <h4 className="text-xl font-bold text-slate-800">
                     {showBalance ? `${item.val.toLocaleString('pt-BR')}` : '••••'}
                   </h4>
                   <p className="text-[8px] font-bold text-slate-300 uppercase italic">vs período anterior</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Calendário Booking Style */}
      {showCalendar && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowCalendar(false)}></div>
          <div className={`w-full max-w-sm rounded-[3rem] relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <CalendarIcon size={16} className="text-[#1DB954]" />
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selecionar Intervalo</h4>
              </div>
              <button onClick={() => setShowCalendar(false)} className="p-2 bg-slate-50 rounded-2xl"><X size={16} className="text-slate-400" /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className="p-2 rounded-xl bg-slate-50"><ChevronLeft size={16} /></button>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                  {viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="p-2 rounded-xl bg-slate-50"><ChevronRight size={16} /></button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {['D','S','T','Q','Q','S','S'].map(d => <span key={d} className="text-[8px] font-bold text-slate-300 pb-2">{d}</span>)}
                {Array.from({ length: startDayOfMonth(viewDate) }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth(viewDate) }).map((_, i) => {
                  const day = i + 1;
                  const selected = isSelected(day);
                  const inRange = isInRange(day);
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`h-10 w-full text-[10px] font-bold rounded-xl transition-all flex items-center justify-center
                        ${selected ? 'bg-[#1DB954] text-white' : inRange ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50 text-slate-600'}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setShowCalendar(false)} 
                disabled={!rangeStart || !rangeEnd}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-[10px] font-bold uppercase tracking-widest shadow-xl disabled:opacity-20 active:scale-95 transition-all"
              >
                Aplicar Intervalo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonPage;
