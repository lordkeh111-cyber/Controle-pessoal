
import React from 'react';
import { RefreshCw, ShieldCheck, Plus, ExternalLink, ChevronRight, Settings } from 'lucide-react';
import { BANKS } from '../constants';

const ConnectionsPage: React.FC = () => {
  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Conexões</h2>
        <button className="p-2 rounded-full bg-white border border-slate-100 text-slate-500 shadow-sm">
          <Settings size={20} />
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[1.5rem] flex gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-900">Open Finance Ativo</h4>
          <p className="text-[11px] text-emerald-700/80 leading-relaxed mt-1">
            Seus dados são sincronizados automaticamente a cada 6 horas com criptografia de ponta a ponta.
          </p>
        </div>
      </div>

      {/* Connections List */}
      <div className="space-y-4">
        {BANKS.map((bank) => (
          <div key={bank.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl border border-slate-100">
                  {bank.logo}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{bank.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${bank.status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-orange-400 animate-pulse'}`}></div>
                    <span className="text-[10px] font-bold text-slate-400">{bank.status === 'CONNECTED' ? 'Conectado' : 'Sincronizando...'}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 rounded-xl hover:bg-slate-50 text-slate-300">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400">
                <RefreshCw size={12} className={bank.status === 'SYNCING' ? 'animate-spin text-orange-400' : ''} />
                <span className="text-[10px] font-medium">Atualizado {bank.lastUpdate}</span>
              </div>
              <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600">
                12 novos lançamentos
              </div>
            </div>
          </div>
        ))}

        {/* Add Connection */}
        <button className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-all hover:bg-emerald-50/50 group">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <Plus size={24} />
          </div>
          <span className="text-xs font-bold">Conectar Novo Banco</span>
        </button>
      </div>

      {/* Security Footer */}
      <div className="py-8 text-center space-y-3">
        <p className="text-[10px] text-slate-400 font-medium">Parceiro tecnológico autorizado pelo Banco Central</p>
        <div className="flex justify-center gap-6 opacity-30 grayscale">
           <div className="w-12 h-6 bg-slate-400 rounded"></div>
           <div className="w-12 h-6 bg-slate-400 rounded"></div>
           <div className="w-12 h-6 bg-slate-400 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;
