
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  Home, ArrowLeftRight, Plus, BarChart3, Settings, 
  Bell, Eye, EyeOff, X, Search, Sparkles, ShoppingCart, CreditCard as CardIcon, Wallet,
  Calendar, User as UserIcon, AlertCircle, CheckCircle2, Lock, Mail
} from 'lucide-react';
import { CATEGORIES, normalizeString } from './constants';
import { Transaction, CreditCard, User, PaymentMethod, TransactionType, Notification } from './types';

import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';

// --- HELPER PARA INPUT MONETÁRIO ---
const formatCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const numberValue = parseInt(digits || '0') / 100;
  return numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseCurrencyToNumber = (formattedValue: string) => {
  return parseFloat(formattedValue.replace(/\./g, '').replace(',', '.'));
};

// --- NOTIFICATIONS PANEL ---
const NotificationsPanel: React.FC<{ transactions: Transaction[]; onClose: () => void }> = ({ transactions, onClose }) => {
  const notifications: Notification[] = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const notes: Notification[] = [];

    transactions.forEach(t => {
      if (t.paymentDate) {
        const isToday = t.paymentDate === today;
        const isPast = t.paymentDate < today;
        
        if (isToday || isPast) {
          notes.push({
            id: t.id,
            title: t.type === 'BOCA_PURCHASE' ? 'Pagamento Pendente' : 'Lembrete de Empréstimo',
            message: `${t.title}: R$ ${t.amount.toLocaleString('pt-BR')}. Vencimento: ${t.paymentDate}`,
            date: t.paymentDate,
            isRead: false,
            type: isPast ? 'ALERT' : 'REMINDER'
          });
        }
      }
    });

    return notes.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions]);

  return (
    <div className="fixed inset-0 z-[5000] flex items-start justify-center p-6 pt-24 animate-fade">
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-md" onClick={onClose}></div>
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-premium p-8 relative z-10 border border-slate-50 max-h-[70vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-bold tracking-tighter text-slate-800">Notificações</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={16}/></button>
        </div>
        
        <div className="space-y-4">
          {notifications.length > 0 ? notifications.map(n => (
            <div key={n.id} className="p-5 bg-slate-50 rounded-3xl flex gap-4 items-start">
              <div className={`mt-1 ${n.type === 'ALERT' ? 'text-rose-500' : 'text-amber-500'}`}>
                <AlertCircle size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{n.title}</p>
                <p className="text-[11px] font-medium text-slate-700 leading-relaxed">{n.message}</p>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center text-slate-300">
               <CheckCircle2 size={32} className="mx-auto mb-4 opacity-20" />
               <p className="text-[9px] font-black uppercase tracking-widest">Tudo em dia!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- TRANSACTION DETAILS MODAL ---
export const TransactionDetailModal: React.FC<{ tx: Transaction; onClose: () => void }> = ({ tx, onClose }) => {
  const cat = CATEGORIES[tx.category] || { icon: '❓', name: 'Desconhecido' };
  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-8">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-fade" onClick={onClose}></div>
      <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 relative z-10 animate-fade shadow-premium text-center border border-slate-50">
         <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-xl mb-4">{cat.icon}</div>
         <div className="mb-6">
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{tx.title}</h3>
           <p className={`text-2xl font-light tracking-tighter ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-600'}`}>
             R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </p>
         </div>
         <div className="grid grid-cols-2 gap-y-4 text-left pt-4 border-t border-slate-50">
           <div className="space-y-0.5">
             <span className="text-[7px] text-slate-500 uppercase font-black">Data/Hora</span>
             <p className="text-[9px] text-slate-700 font-medium">{tx.date} • {tx.time}</p>
           </div>
           <div className="space-y-0.5">
             <span className="text-[7px] text-slate-500 uppercase font-black">Método</span>
             <p className="text-[9px] text-slate-700 font-medium">{tx.paymentMethod}</p>
           </div>
         </div>
         <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[9px] uppercase font-bold tracking-widest mt-8 active:scale-95 transition-all">Fechar</button>
      </div>
    </div>
  );
};

// --- ADD TRANSACTION MODAL ---
const AddTransactionScreen: React.FC<{ onAdd: (t: Transaction) => void; cards: CreditCard[]; onClose: () => void }> = ({ onAdd, cards, onClose }) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [displayAmount, setDisplayAmount] = useState('0,00');
  const [title, setTitle] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  
  const filteredCards = useMemo(() => {
    if (method === 'DEBIT') return cards.filter(c => c.type === 'DEBIT');
    if (method === 'CREDIT') return cards.filter(c => c.type === 'CREDIT');
    return [];
  }, [cards, method]);

  const [cardId, setCardId] = useState('');
  const [category, setCategory] = useState('outras_despesas');
  const [search, setSearch] = useState('');
  const [installments, setInstallments] = useState('1');

  useEffect(() => {
    if (filteredCards.length > 0) setCardId(filteredCards[0].id);
    else setCardId('');
  }, [filteredCards]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = normalizeString(search);
    return Object.values(CATEGORIES).filter(c => {
      const matchSearch = normalizeString(c.name).includes(normalizedSearch);
      const matchType = type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE';
      return matchSearch && matchType;
    });
  }, [search, type]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayAmount(formatCurrencyInput(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseCurrencyToNumber(displayAmount);
    if (amountNum <= 0 || !title) return;
    
    if ((method === 'DEBIT' || method === 'CREDIT') && !cardId) {
      alert("Por favor, selecione um cartão.");
      return;
    }

    const now = new Date();
    onAdd({
      id: crypto.randomUUID(), title, amount: amountNum, type, category,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(), 
      paymentMethod: method,
      cardId: (method === 'DEBIT' || method === 'CREDIT') ? cardId : undefined,
      installmentsCount: method === 'CREDIT' ? parseInt(installments) : 1,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-fade">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-xl" onClick={onClose}></div>
      <div className="w-full max-w-lg bg-white rounded-[3.5rem] shadow-premium p-10 relative z-10 border-none max-h-[92vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm tracking-tighter text-slate-800 font-light">Novo Lançamento</h2>
          <button onClick={onClose} className="p-1.5 bg-slate-50 rounded-full text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2">
            <button type="button" onClick={() => { setType('INCOME'); setMethod('PIX'); }} className={`px-5 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border ${type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-transparent text-slate-300 border-transparent'}`}>ENTRADA</button>
            <button type="button" onClick={() => setType('EXPENSE')} className={`px-5 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border ${type === 'EXPENSE' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-transparent text-slate-300 border-transparent'}`}>SAÍDA</button>
          </div>
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-1">
               <span className="text-xl tracking-tighter text-slate-200 font-light">R$</span>
               <input type="text" inputMode="numeric" value={displayAmount} onChange={handleAmountChange} className={`bg-transparent text-4xl text-center focus:outline-none w-48 font-light tracking-tighter ${type === 'INCOME' ? 'text-emerald-500' : 'text-rose-600'}`} autoFocus />
            </div>
            <input type="text" placeholder="Descrição" value={title} onChange={e => setTitle(e.target.value)} className="w-full py-2 bg-transparent text-sm text-center outline-none border-b border-slate-50 placeholder:text-slate-200 focus:border-slate-100 transition-all font-medium" />
          </div>
          <div className="space-y-8">
            <div className="space-y-3 text-center">
              <span className="text-[7px] font-black uppercase text-slate-400 tracking-[0.4em]">Meio de Pagamento</span>
              <div className="flex flex-wrap justify-center gap-2">
                {['PIX', 'CASH', 'DEBIT', 'CREDIT'].filter(m => type === 'EXPENSE' || ['PIX', 'CASH'].includes(m)).map(m => (
                  <button key={m} type="button" onClick={() => setMethod(m as any)} className={`px-4 py-2 rounded-xl text-[7px] font-black uppercase transition-all ${method === m ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {m === 'CASH' ? 'DINHEIRO' : m === 'DEBIT' ? 'DÉBITO' : m === 'CREDIT' ? 'CRÉDITO' : m}
                  </button>
                ))}
              </div>
            </div>
            {(method === 'DEBIT' || method === 'CREDIT') && (
              <div className="space-y-4 animate-fade">
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1">
                  {filteredCards.map(card => (
                    <button key={card.id} type="button" onClick={() => setCardId(card.id)} className={`flex flex-col items-start justify-between min-w-[130px] p-4 rounded-2xl transition-all border ${cardId === card.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-base">{card.type === 'CREDIT' ? '💳' : '🏦'}</span>
                        <span className="text-[6px] font-black uppercase tracking-widest opacity-60">{card.bank}</span>
                      </div>
                      <div className="mt-4 flex flex-col items-start text-left">
                        <span className="text-[6px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5">{card.type === 'CREDIT' ? 'Lim' : 'Sal'}</span>
                        <span className="text-[8px] font-bold">R$ {card.limit.toLocaleString('pt-BR')}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {method === 'CREDIT' && (
                  <div className="pt-2 flex flex-col items-center">
                    <span className="text-[7px] font-black uppercase text-slate-400 mb-2 tracking-widest">Parcelas</span>
                    <select value={installments} onChange={e => setInstallments(e.target.value)} className="w-24 p-2 bg-slate-50 rounded-xl text-[9px] font-bold outline-none text-center">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map(n => <option key={n} value={n}>{n}x</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-4 pt-2">
              <div className="relative max-w-xs mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                <input type="text" placeholder="BUSCAR CATEGORIA..." value={search} onChange={e => setSearch(e.target.value)} className="w-full p-3 pl-10 bg-slate-50 rounded-full text-[7px] font-black tracking-[0.2em] text-slate-600 outline-none uppercase" />
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                {filteredCategories.map(c => (
                  <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={`flex flex-col items-center justify-center min-w-[65px] h-[65px] rounded-[1.5rem] transition-all shrink-0 border ${category === c.id ? 'bg-white border-slate-200 shadow-sm scale-105' : 'bg-slate-50/20 border-transparent text-slate-200 opacity-60'}`}>
                    <span className="text-xl mb-1">{c.icon}</span>
                    <span className="text-[6px] font-black uppercase tracking-widest truncate w-12 text-center text-slate-600">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <button type="submit" className="px-10 py-3.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- AUTH SCREEN (LOGIN / SIGNUP) ---
const AuthScreen: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        alert("Preencha email e senha.");
        return;
    }

    if (isRegistering) {
        if (!name) { alert("Preencha seu nome."); return; }
        if (password !== confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }
    }

    // No contexto atual, simulamos o login/cadastro salvando e enviando o user
    const user: User = { 
        id: crypto.randomUUID(), 
        name: isRegistering ? name : (email.split('@')[0]), 
        email, 
        password,
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`, 
        monthlyGoal: 3000 
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-light transition-all">
      <div className="w-full max-w-sm space-y-12 animate-fade">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-white shadow-premium"><Sparkles size={40} /></div>
          <h1 className="text-3xl tracking-tighter font-light">{isRegistering ? 'Criar Conta' : 'Acesse seu Painel'}</h1>
        </div>
        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            {isRegistering && (
                <div className="relative">
                    <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" placeholder="NOME COMPLETO" className="w-full p-6 pl-14 bg-slate-50 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest outline-none border border-transparent focus:border-slate-100" value={name} onChange={e => setName(e.target.value)} />
                </div>
            )}
            <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="email" placeholder="EMAIL" className="w-full p-6 pl-14 bg-slate-50 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest outline-none border border-transparent focus:border-slate-100" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="password" placeholder="SENHA" className="w-full p-6 pl-14 bg-slate-50 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest outline-none border border-transparent focus:border-slate-100" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {isRegistering && (
                <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="password" placeholder="REPETIR SENHA" className="w-full p-6 pl-14 bg-slate-50 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest outline-none border border-transparent focus:border-slate-100" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
            )}
          </div>
          <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-premium active:scale-95 transition-all">
            {isRegistering ? 'Cadastrar' : 'Acessar'}
          </button>
          
          <div className="text-center pt-4">
             <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-900 transition-colors">
               {isRegistering ? 'Já tenho uma conta. Entrar' : 'Não tem conta? Criar novo usuário'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- SPECIAL OPERATIONS (FUNCIONALIDADE OBRIGATÓRIA) ---
const SpecialOperationsScreen: React.FC<{ onAdd: (t: Transaction) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
  const [opType, setOpType] = useState<'BOCA' | 'LOAN'>('BOCA');
  const [loanSubtype, setLoanSubtype] = useState<'GIVEN' | 'TAKEN'>('GIVEN');
  const [amount, setAmount] = useState('0,00');
  const [who, setWho] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseCurrencyToNumber(amount);
    if (amountNum <= 0 || !who || !paymentDate) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const now = new Date();
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      title: opType === 'BOCA' ? `Boca: ${who}` : (loanSubtype === 'GIVEN' ? `Empréstimo p/ ${who}` : `Dívida c/ ${who}`),
      amount: amountNum,
      type: opType === 'BOCA' ? 'BOCA_PURCHASE' : (loanSubtype === 'GIVEN' ? 'LOAN_GIVEN' : 'LOAN_TAKEN'),
      category: 'outras_despesas',
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      paymentMethod: 'PIX',
      isSpecialOperation: true,
      personName: who,
      paymentDate: paymentDate
    };

    onAdd(transaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-fade">
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-xl" onClick={onClose}></div>
      <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 relative z-10 shadow-premium border border-slate-50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm tracking-tighter font-light">Operações Especiais</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-500"><X size={18} /></button>
        </div>

        <div className="flex gap-2 mb-8">
           <button onClick={() => setOpType('BOCA')} className={`flex-1 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${opType === 'BOCA' ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400'}`}>
              <ShoppingCart size={16}/>
              <span className="text-[7px] font-black uppercase tracking-widest">Boca</span>
           </button>
           <button onClick={() => setOpType('LOAN')} className={`flex-1 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${opType === 'LOAN' ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400'}`}>
              <Wallet size={16}/>
              <span className="text-[7px] font-black uppercase tracking-widest">Empréstimo</span>
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {opType === 'LOAN' && (
            <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl">
               <button type="button" onClick={() => setLoanSubtype('GIVEN')} className={`flex-1 py-2.5 rounded-xl text-[7px] font-black uppercase tracking-widest transition-all ${loanSubtype === 'GIVEN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Eu emprestei</button>
               <button type="button" onClick={() => setLoanSubtype('TAKEN')} className={`flex-1 py-2.5 rounded-xl text-[7px] font-black uppercase tracking-widest transition-all ${loanSubtype === 'TAKEN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Estou devendo</button>
            </div>
          )}

          <div className="text-center space-y-6">
             <div className="flex items-center justify-center gap-1">
               <span className="text-2xl tracking-tighter text-slate-200 font-light">R$</span>
               <input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(formatCurrencyInput(e.target.value))} className="bg-transparent text-4xl text-center focus:outline-none w-48 font-light tracking-tighter text-slate-800" autoFocus />
             </div>
             
             <div className="space-y-4">
                <div className="relative group">
                   <UserIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                   <input type="text" placeholder="Nome da pessoa / Estabelecimento" value={who} onChange={e => setWho(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-2xl text-[11px] font-bold outline-none placeholder:text-slate-300 focus:bg-white border border-transparent focus:border-slate-100" />
                </div>
                <div className="relative group">
                   <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                   <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-2xl text-[11px] font-bold outline-none text-slate-800 focus:bg-white border border-transparent focus:border-slate-100" />
                </div>
                <p className="text-[7px] text-slate-400 uppercase font-bold tracking-widest text-center">Será gerado um lembrete automático nesta data</p>
             </div>
          </div>

          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] shadow-lg active:scale-95 transition-all">Registrar Especial</button>
        </form>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => JSON.parse(localStorage.getItem('cp_user') || 'null'));
  const [transactions, setTransactions] = useState<Transaction[]>(() => JSON.parse(localStorage.getItem('cp_transactions') || '[]'));
  const [cards, setCards] = useState<CreditCard[]>(() => JSON.parse(localStorage.getItem('cp_cards') || '[]'));
  
  const [showAdd, setShowAdd] = useState(false);
  const [showSpecial, setShowSpecial] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    localStorage.setItem('cp_transactions', JSON.stringify(transactions));
    localStorage.setItem('cp_cards', JSON.stringify(cards));
    if (user) localStorage.setItem('cp_user', JSON.stringify(user));
  }, [transactions, cards, user]);

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
    if (t.cardId) {
      setCards(prev => prev.map(c => {
        if (c.id === t.cardId) return { ...c, limit: Math.max(0, c.limit - t.amount) };
        return c;
      }));
    }
  };

  if (!user) return <AuthScreen onLogin={setUser} />;

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-light bg-[#FDFDFD] text-slate-900 transition-all">
        <div className="fixed top-0 left-0 right-0 z-[100] bg-emerald-50/85 backdrop-blur-md border-b border-emerald-100/30">
          <header className="px-8 pt-12 pb-4 flex items-center justify-between max-w-lg mx-auto w-full">
            <div className="flex items-center gap-3">
               <Link to="/settings" className="w-10 h-10 bg-white shadow-slim rounded-[1.2rem] overflow-hidden active:scale-95 transition-all border border-white">
                 <img src={user.photo} className="w-full h-full object-cover" alt="Perfil" />
               </Link>
               <div className="flex flex-col">
                 <span className="text-[7px] text-emerald-700 uppercase tracking-[0.2em] font-black leading-none mb-1">Status</span>
                 <h2 className="text-[12px] tracking-tighter text-slate-700 font-medium">{user.name}</h2>
               </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setShowBalance(!showBalance)} className="w-9 h-9 bg-white shadow-slim rounded-xl flex items-center justify-center text-slate-500">{showBalance ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
              <button onClick={() => setShowSpecial(true)} className="w-9 h-9 bg-white shadow-slim rounded-xl flex items-center justify-center text-slate-500"><Sparkles size={16}/></button>
              <button onClick={() => setShowNotifications(true)} className="w-9 h-9 bg-white shadow-slim rounded-xl flex items-center justify-center text-slate-500 relative">
                <Bell size={16}/>
                {transactions.some(t => t.paymentDate === new Date().toISOString().split('T')[0]) && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
                )}
              </button>
            </div>
          </header>
        </div>
        <div className="h-32"></div>
        <main className="flex-1 overflow-y-auto no-scrollbar pb-36">
          <div className="max-w-md mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard transactions={transactions} showBalance={showBalance} isDarkMode={false} />} />
              <Route path="/transactions" element={<TransactionsPage transactions={transactions} showBalance={showBalance} isDarkMode={false} onDelete={id => setTransactions(prev => prev.filter(tx => tx.id !== id))} />} />
              <Route path="/analytics" element={<AnalyticsPage transactions={transactions} isDarkMode={false} user={user} onUpdateUser={setUser} showBalance={showBalance} />} />
              <Route path="/settings" element={<SettingsPage user={user} onUpdateUser={setUser} cards={cards} onAddCard={c => setCards([...cards, c])} onDeleteCard={id => setCards(prev => prev.filter(c => c.id !== id))} isDarkMode={false} onToggleTheme={() => {}} />} />
            </Routes>
          </div>
        </main>
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] z-50">
           <div className="bg-white/80 backdrop-blur-2xl shadow-premium rounded-[2.5rem] p-2.5 flex items-center justify-between border border-white/50">
              <Link to="/" className="p-4 rounded-2xl text-slate-400 hover:text-slate-800 transition-all"><Home size={20}/></Link>
              <Link to="/transactions" className="p-4 rounded-2xl text-slate-400 hover:text-slate-800 transition-all"><ArrowLeftRight size={20}/></Link>
              <button onClick={() => setShowAdd(true)} className="w-14 h-14 bg-slate-900 text-white rounded-[1.4rem] flex items-center justify-center shadow-2xl active:scale-90 transition-all"><Plus size={26} /></button>
              <Link to="/analytics" className="p-4 rounded-2xl text-slate-400 hover:text-slate-800 transition-all"><BarChart3 size={20}/></Link>
              <Link to="/settings" className="p-4 rounded-2xl text-slate-400 hover:text-slate-800 transition-all"><Settings size={20}/></Link>
           </div>
        </nav>
        {showAdd && <AddTransactionScreen onAdd={addTransaction} cards={cards} onClose={() => setShowAdd(false)} />}
        {showSpecial && <SpecialOperationsScreen onAdd={addTransaction} onClose={() => setShowSpecial(false)} />}
        {showNotifications && <NotificationsPanel transactions={transactions} onClose={() => setShowNotifications(false)} />}
      </div>
    </Router>
  );
};
export default App;
