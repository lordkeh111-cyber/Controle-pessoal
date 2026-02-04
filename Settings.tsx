
import React, { useState } from 'react';
import { Camera, Plus, Trash2, Moon, Sun, Lock, CreditCard, Wallet, ChevronRight, X, User as UserIcon } from 'lucide-react';
import { User, CreditCard as CardType } from '../types';

interface SettingsProps {
  user: User;
  onUpdateUser: (u: User) => void;
  cards: CardType[];
  onAddCard: (c: CardType) => void;
  onDeleteCard: (id: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const SettingsPage: React.FC<SettingsProps> = ({ user, onUpdateUser, cards, onAddCard, onDeleteCard, isDarkMode, onToggleTheme }) => {
  const [showCardModal, setShowCardModal] = useState(false);
  const [bank, setBank] = useState('');
  const [limit, setLimit] = useState('');
  const [type, setType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [dueDay, setDueDay] = useState('10');
  const [color, setColor] = useState('#10b981');

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  const handleAddCard = () => {
    if (!bank || !limit) return;
    onAddCard({
      id: crypto.randomUUID(),
      bank,
      limit: parseFloat(limit),
      availableCredit: parseFloat(limit),
      dueDay: parseInt(dueDay),
      closingDay: 1,
      color,
      isActive: true,
      type
    });
    setShowCardModal(false);
  };

  const handleUpdateName = () => {
    onUpdateUser({ ...user, name: tempName });
    setIsEditingName(false);
  };

  return (
    <div className="px-8 space-y-12 pb-24 animate-fade">
      
      {/* PROFILE HEADER */}
      <div className="flex flex-col items-center space-y-6 pt-4">
         <div className="relative group">
            <div className="w-32 h-32 rounded-5xl bg-white shadow-premium flex items-center justify-center p-1 border border-slate-50">
               <img src={user.photo} className="w-full h-full rounded-5xl object-cover" alt="Perfil" />
            </div>
            <button className="absolute -bottom-2 -right-2 w-11 h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-slate-50 active:scale-90 transition-all">
               <Camera size={18} />
            </button>
         </div>
         <div className="text-center space-y-2 w-full max-w-xs">
            {isEditingName ? (
              <div className="flex flex-col gap-2 items-center">
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={e => setTempName(e.target.value)} 
                  className="w-full text-center text-xl font-light bg-slate-50 rounded-2xl p-2 outline-none focus:bg-white border border-transparent focus:border-slate-200 transition-all"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateName} className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Salvar</button>
                  <button onClick={() => { setIsEditingName(false); setTempName(user.name); }} className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[8px] font-black uppercase tracking-widest">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                <h2 className="text-xl font-light tracking-tighter">{user.name}</h2>
                <UserIcon size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
              </div>
            )}
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">{user.email}</p>
         </div>
      </div>

      {/* CARDS SECTION */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Meus Cartões</h3>
            <button onClick={() => setShowCardModal(true)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 transition-colors">
               <Plus size={16} />
            </button>
         </div>
         
         <div className="space-y-4">
            {cards.map(card => (
              <div key={card.id} className={`p-6 rounded-4xl flex items-center justify-between transition-all ${isDarkMode ? 'bg-slate-900' : 'bg-white shadow-slim border border-slate-50'}`}>
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: card.color }}>
                       {card.type === 'CREDIT' ? <CreditCard size={20}/> : <Wallet size={20}/>}
                    </div>
                    <div>
                       <h5 className="text-[13px] font-medium tracking-tight">{card.bank}</h5>
                       <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-1">
                         {card.type === 'CREDIT' ? `Crédito • dia ${card.dueDay}` : 'Débito Automático'}
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold tracking-tight">R$ {card.limit.toLocaleString('pt-BR')}</span>
                    <button onClick={() => onDeleteCard(card.id)} className="text-slate-200 hover:text-rose-500 transition-all"><Trash2 size={16}/></button>
                 </div>
              </div>
            ))}
            {cards.length === 0 && (
              <button onClick={() => setShowCardModal(true)} className="w-full py-12 border-2 border-dashed border-slate-100 rounded-4xl flex flex-col items-center justify-center gap-2 text-slate-300 group hover:border-slate-300 transition-all">
                <Plus size={24} className="group-hover:scale-110 transition-transform"/>
                <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Cartão</span>
              </button>
            )}
         </div>
      </div>

      {/* SYSTEM SETTINGS */}
      <div className="space-y-6">
         <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 px-1">Preferências</h3>
         <div className={`rounded-4xl overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900' : 'bg-white shadow-slim border border-slate-50'}`}>
            <button onClick={onToggleTheme} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-50 text-amber-500'}`}>
                    {isDarkMode ? <Moon size={18}/> : <Sun size={18}/>}
                  </div>
                  <span className="text-sm font-medium">Modo Visual</span>
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{isDarkMode ? 'Escuro' : 'Claro'}</span>
            </button>
            <div className="h-[1px] bg-slate-50 dark:bg-slate-800 mx-6"></div>
            <button className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                    <Lock size={18}/>
                  </div>
                  <span className="text-sm font-medium">Alterar Senha</span>
               </div>
               <ChevronRight className="text-slate-100" size={16} />
            </button>
         </div>
      </div>

      {/* CARD MODAL */}
      {showCardModal && (
        <div className="fixed inset-0 z-[3000] bg-white/90 backdrop-blur-xl animate-fade flex items-center justify-center p-8">
           <div className="w-full max-w-sm space-y-10">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-light tracking-tighter">Novo Cartão</h2>
                 <button onClick={() => setShowCardModal(false)}><X className="text-slate-300" size={24}/></button>
              </div>
              <div className="space-y-6">
                 <div className="flex gap-2">
                    {['CREDIT', 'DEBIT'].map(t => (
                      <button key={t} onClick={() => setType(t as any)} className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${type === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {t === 'CREDIT' ? 'Crédito' : 'Débito'}
                      </button>
                    ))}
                 </div>
                 <input type="text" placeholder="Nome do Banco" value={bank} onChange={e => setBank(e.target.value)} className="w-full p-5 bg-white shadow-slim rounded-3xl text-sm font-light border border-slate-50 outline-none focus:border-slate-200 transition-all" />
                 <input type="number" placeholder={type === 'CREDIT' ? "Limite Total" : "Saldo em Conta"} value={limit} onChange={e => setLimit(e.target.value)} className="w-full p-5 bg-white shadow-slim rounded-3xl text-sm font-light border border-slate-50 outline-none focus:border-slate-200 transition-all" />
                 {type === 'CREDIT' && (
                    <input type="number" placeholder="Dia do Vencimento" value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full p-5 bg-white shadow-slim rounded-3xl text-sm font-light border border-slate-50 outline-none focus:border-slate-200 transition-all" />
                 )}
                 <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Cor do Cartão</span>
                    <div className="flex gap-2">
                       {['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#000000'].map(c => (
                         <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-4 ${color === c ? 'border-slate-200' : 'border-transparent'}`} style={{ backgroundColor: c }}></button>
                       ))}
                    </div>
                 </div>
                 <button onClick={handleAddCard} className="w-full py-5 bg-slate-900 text-white rounded-3xl text-[10px] font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all">Cadastrar Cartão</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
