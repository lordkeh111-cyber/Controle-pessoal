
import React, { useState, useMemo } from 'react';
import { ClipboardList, Plus, X, Trash2, Trophy, Medal, ShoppingBag, CheckCircle, Printer } from 'lucide-react';
import { Transaction } from '../types';

interface QuoteItem {
  id: string;
  name: string;
  price: number;
}

interface Supplier {
  id: string;
  name: string;
  items: QuoteItem[];
  paymentMode: 'CASH' | 'INSTALLMENTS' | 'MIXED';
  installments?: number;
  entryValue?: number;
  discount?: number;
}

interface SelectedItemConfig {
  supplier: string;
  price: number;
  paymentMode: 'CASH' | 'INSTALLMENTS' | 'MIXED';
  installments: number;
  entryValue: number;
}

interface BudgetProject {
  id: string;
  name: string;
  suppliers: Supplier[];
}

interface ProjectsPageProps {
  isDarkMode: boolean;
  onAddTransaction: (t: Transaction) => void;
  transactions: Transaction[];
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ isDarkMode, onAddTransaction, transactions }) => {
  const [projects, setProjects] = useState<BudgetProject[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cp_budgets') || '[]');
    } catch {
      return [];
    }
  });
  
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState<BudgetProject | null>(null);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [selectedItemsConfigs, setSelectedItemsConfigs] = useState<Record<string, SelectedItemConfig>>({});

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const saveProjects = (newProjs: BudgetProject[]) => {
    setProjects(newProjs);
    localStorage.setItem('cp_budgets', JSON.stringify(newProjs));
    if (selectedProject) {
      const updated = newProjs.find(p => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    }
  };

  const parseCurrency = (val: string): number => {
    if (!val) return 0;
    const normalized = val.toString().replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  const handleOpenProject = (project: BudgetProject) => {
    setSelectedProject(project);
    setActiveSupplierId(project.suppliers.length > 0 ? project.suppliers[0].id : 'ANALYSIS');
    setSelectedItemsConfigs({});
  };

  const handleAddProject = () => {
    if (!newProjectName) return;
    const project: BudgetProject = { id: generateId(), name: newProjectName, suppliers: [] };
    saveProjects([...projects, project]);
    setNewProjectName('');
    setShowAddProject(false);
    handleOpenProject(project);
  };

  const handleAddSupplier = () => {
    if (!newSupplierName || !selectedProject) return;
    const supplier: Supplier = { id: generateId(), name: newSupplierName, items: [], paymentMode: 'CASH' };
    const updatedProject = { ...selectedProject, suppliers: [...selectedProject.suppliers, supplier] };
    saveProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    setNewSupplierName('');
    setShowAddSupplier(false);
    setActiveSupplierId(supplier.id);
  };

  const handleAddItem = (suggestedName?: string) => {
    const nameToUse = suggestedName || newItemName;
    const priceToUse = parseCurrency(newItemPrice);
    if (!nameToUse || !selectedProject || !activeSupplierId) return;
    
    const item: QuoteItem = { id: generateId(), name: nameToUse.trim(), price: priceToUse };
    const updatedProject = {
      ...selectedProject,
      suppliers: selectedProject.suppliers.map(s => s.id === activeSupplierId ? { ...s, items: [...s.items, item] } : s)
    };
    saveProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    setNewItemName('');
    setNewItemPrice('');
    setShowAddItem(false);
  };

  const toggleSelectItem = (itemName: string, supplier: string, price: number) => {
    setSelectedItemsConfigs(prev => {
      const newItems = { ...prev };
      if (newItems[itemName]) {
        delete newItems[itemName];
      } else {
        newItems[itemName] = {
          supplier,
          price,
          paymentMode: 'CASH',
          installments: 1,
          entryValue: 0
        };
      }
      return newItems;
    });
  };

  const totals = useMemo(() => {
    const configs = Object.values(selectedItemsConfigs) as SelectedItemConfig[];
    const total = configs.reduce((acc, curr) => acc + curr.price, 0);
    return { total };
  }, [selectedItemsConfigs]);

  const ranking = useMemo(() => {
    if (!selectedProject || selectedProject.suppliers.length === 0) return [];
    return selectedProject.suppliers.map(supp => {
      const rawTotal = supp.items.reduce((s, i) => s + i.price, 0);
      return { id: supp.id, name: supp.name, total: rawTotal, itemsCount: supp.items.length };
    }).sort((a, b) => a.total - b.total);
  }, [selectedProject]);

  const analysisItems = useMemo(() => {
    if (!selectedProject) return [];
    const itemNames = new Set<string>();
    selectedProject.suppliers.forEach(s => s.items.forEach(i => itemNames.add(i.name)));
    
    const results: any[] = [];
    itemNames.forEach(name => {
      const offers = selectedProject.suppliers
        .map(s => ({ supplier: s.name, price: s.items.find(i => i.name === name)?.price || Infinity }))
        .filter(o => o.price !== Infinity)
        .sort((a, b) => a.price - b.price);

      if (offers.length >= 2) {
        results.push({ name, bestPrice: offers[0].price, bestSupplier: offers[0].supplier, delta: offers[1].price - offers[0].price });
      } else if (offers.length === 1) {
        results.push({ name, bestPrice: offers[0].price, bestSupplier: offers[0].supplier, delta: 0, single: true });
      }
    });
    return results;
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <div className={`px-10 py-10 space-y-8 pb-24 transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Cotações</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controle de Compras</p>
          </div>
          <button onClick={() => setShowAddProject(true)} className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-[#1DB954]' : 'bg-white shadow-soft border border-slate-100 text-[#1DB954]'}`}>
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-5">
          {projects.map(project => (
            <div key={project.id} onClick={() => handleOpenProject(project)} className={`p-8 rounded-[3.5rem] border shadow-soft space-y-6 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.5rem] bg-emerald-50 text-[#1DB954] flex items-center justify-center"><ClipboardList size={22} /></div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{project.name}</h4>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{project.suppliers.length} fornecedores</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); saveProjects(projects.filter(p => p.id !== project.id)); }} className="p-2 text-slate-200 hover:text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3.5rem] opacity-60">
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Nenhuma cotação ativa</p>
            </div>
          )}
        </div>

        {showAddProject && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowAddProject(false)}></div>
            <div className="w-full max-w-sm bg-white rounded-[3rem] p-8 relative z-10 animate-in zoom-in-95 duration-300 space-y-6 shadow-2xl">
              <input type="text" placeholder="Nome do Projeto" className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-100 text-xs font-bold uppercase" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} autoFocus />
              <button onClick={handleAddProject} className="w-full py-5 bg-[#1DB954] text-white rounded-[2.5rem] text-[10px] font-bold uppercase">Iniciar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const activeSupplier = selectedProject.suppliers.find(s => s.id === activeSupplierId);
  const allKnownItemNames = selectedProject.suppliers.flatMap(s => s.items.map(i => i.name)).filter((v, i, a) => a.indexOf(v) === i);
  const unquotedSuggestions = activeSupplier 
    ? allKnownItemNames.filter(name => !activeSupplier.items.some(it => it.name === name))
    : allKnownItemNames;

  return (
    <div className={`px-8 py-8 space-y-8 pb-24 transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      <div className="flex items-center gap-4">
        <button onClick={() => setSelectedProject(null)} className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}><X size={18} /></button>
        <h2 className="text-lg font-bold truncate">{selectedProject.name}</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        <button onClick={() => setActiveSupplierId('ANALYSIS')} className={`px-6 py-3 rounded-2xl text-[9px] font-bold uppercase whitespace-nowrap border ${activeSupplierId === 'ANALYSIS' ? 'bg-[#1DB954] text-white' : 'bg-white text-slate-400'}`}>📊 Análise</button>
        {selectedProject.suppliers.map(s => (
          <button key={s.id} onClick={() => setActiveSupplierId(s.id)} className={`px-6 py-3 rounded-2xl text-[9px] font-bold uppercase whitespace-nowrap border ${activeSupplierId === s.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}>{s.name}</button>
        ))}
        <button onClick={() => setShowAddSupplier(true)} className="px-4 py-3 bg-emerald-50 text-[#1DB954] rounded-2xl border border-emerald-100"><Plus size={16} /></button>
      </div>

      {activeSupplierId === 'ANALYSIS' ? (
        <div className="space-y-8 animate-in fade-in">
           {ranking.map((res, idx) => (
             <div key={res.id} className={`p-6 rounded-[2.5rem] border flex items-center justify-between ${idx === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-50 shadow-soft'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${idx === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>{idx === 0 ? <Trophy size={18} /> : <Medal size={18} />}</div>
                  <div>
                    <h4 className="text-sm font-bold">{res.name}</h4>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{idx + 1}º Melhor Preço</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-800">R$ {res.total.toLocaleString('pt-BR')}</p>
             </div>
           ))}

           <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase text-slate-400">Seleção de Itens</h3>
              {analysisItems.map((item, idx) => {
                const config = selectedItemsConfigs[item.name];
                const isSelected = !!config;
                return (
                  <div key={idx} className="space-y-3">
                    <div onClick={() => toggleSelectItem(item.name, item.bestSupplier, item.bestPrice)} className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer relative ${isSelected ? 'border-[#1DB954] bg-emerald-50/50' : 'bg-white border-slate-50 shadow-sm'}`}>
                      {isSelected && <div className="absolute top-4 right-4 text-[#1DB954]"><CheckCircle size={18} /></div>}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold">{item.name}</p>
                          <p className="text-[8px] text-[#1DB954] font-bold mt-1 uppercase">{item.bestSupplier}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">R$ {item.bestPrice.toLocaleString('pt-BR')}</p>
                          {item.delta > 0 && <p className="text-[8px] text-rose-600 font-bold mt-1">Economia: R$ {item.delta.toLocaleString('pt-BR')}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
           </div>

           {totals.total > 0 && (
             <div className="p-8 bg-slate-900 text-white rounded-[3.5rem] space-y-6 shadow-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase">Investimento Total</p>
                    <h4 className="text-2xl font-bold">R$ {totals.total.toLocaleString('pt-BR')}</h4>
                  </div>
                  <ShoppingBag size={24} className="text-[#1DB954]" />
                </div>
                <button onClick={() => window.print()} className="w-full py-4 bg-white/10 rounded-2xl text-[9px] font-bold uppercase flex items-center justify-center gap-2"><Printer size={14}/> Gerar Relatório PDF</button>
             </div>
           )}
        </div>
      ) : activeSupplier ? (
        <div className="space-y-8 animate-in fade-in">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-bold uppercase text-slate-400">Produtos: {activeSupplier.name}</h3>
              <button onClick={() => setShowAddItem(true)} className="flex items-center gap-2 text-[9px] font-bold text-[#1DB954] bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100"><Plus size={14}/> Add Item</button>
           </div>
           <div className="space-y-3">
             {activeSupplier.items.map(item => (
               <div key={item.id} className="p-5 bg-white border border-slate-50 rounded-[2rem] shadow-soft flex items-center justify-between">
                  <p className="text-xs font-bold">{item.name}</p>
                  <p className="text-xs font-bold text-slate-400">R$ {item.price.toLocaleString('pt-BR')}</p>
                  <button onClick={() => {
                    const updatedSuppliers = selectedProject.suppliers.map(s => s.id === activeSupplierId ? { ...s, items: s.items.filter(it => it.id !== item.id) } : s);
                    saveProjects(projects.map(p => p.id === selectedProject.id ? { ...p, suppliers: updatedSuppliers } : p));
                  }} className="text-rose-400 p-2"><Trash2 size={14}/></button>
               </div>
             ))}
           </div>
        </div>
      ) : null}

      {showAddItem && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowAddItem(false)}></div>
          <div className="w-full max-w-sm bg-white rounded-[3.5rem] p-8 relative z-10 animate-in zoom-in-95 duration-300 space-y-6 shadow-2xl">
            <input type="text" placeholder="O que deseja cotar?" className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-100 text-xs font-bold uppercase" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
            {unquotedSuggestions.length > 0 && !newItemName && (
              <div className="flex flex-wrap gap-2">
                {unquotedSuggestions.map(name => (
                  <button key={name} onClick={() => setNewItemName(name)} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[8px] font-bold text-slate-400 uppercase">{name}</button>
                ))}
              </div>
            )}
            <input type="text" inputMode="decimal" placeholder="R$ 0,00" className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-100 text-xs font-bold" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
            <button onClick={() => handleAddItem()} className="w-full py-5 bg-[#1DB954] text-white rounded-[2.5rem] text-[10px] font-bold uppercase">Confirmar</button>
          </div>
        </div>
      )}

      {showAddSupplier && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowAddSupplier(false)}></div>
          <div className="w-full max-w-sm bg-white rounded-[3.5rem] p-8 relative z-10 animate-in zoom-in-95 duration-300 space-y-6 shadow-2xl">
            <input type="text" placeholder="Nome do Fornecedor" className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-100 text-xs font-bold uppercase" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} autoFocus />
            <button onClick={handleAddSupplier} className="w-full py-5 bg-slate-900 text-white rounded-[2.5rem] text-[10px] font-bold uppercase">Cadastrar Fornecedor</button>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
          button, nav { display: none !important; }
        }
        .print-area { display: none; }
        @media print { .print-area { display: block; } }
      `}</style>
      
      <div className="print-area space-y-12">
        <h1 className="text-3xl font-black uppercase border-b-8 border-slate-900 pb-4">Relatório de Fechamento</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Controle Pessoal - Análise de Cotação</p>
        <div className="space-y-6">
          {(Object.entries(selectedItemsConfigs) as [string, SelectedItemConfig][]).map(([name, config]) => (
            <div key={name} className="flex justify-between border-b border-slate-100 py-4">
               <div>
                  <h4 className="text-sm font-bold uppercase">{name}</h4>
                  <p className="text-xs text-slate-500 uppercase">Fornecedor: {config.supplier}</p>
               </div>
               <p className="text-sm font-bold">R$ {config.price.toLocaleString('pt-BR')}</p>
            </div>
          ))}
        </div>
        <div className="pt-10 border-t-4 border-slate-900 flex justify-between">
           <p className="text-sm font-bold uppercase">Total do Projeto</p>
           <p className="text-2xl font-black">R$ {totals.total.toLocaleString('pt-BR')}</p>
        </div>
        <div className="mt-20 pt-12 border-t border-slate-100 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Gerado por Controle Pessoal</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
