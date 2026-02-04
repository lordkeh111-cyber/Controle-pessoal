
import { Category } from './types';

export const normalizeString = (str: string) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Added BANKS constant as it was missing and causing a compilation error in Connections.tsx
export const BANKS = [
  { id: 'nubank', name: 'Nubank', logo: '💜', status: 'CONNECTED', lastUpdate: 'há 2 horas' },
  { id: 'inter', name: 'Inter', logo: '🧡', status: 'SYNCING', lastUpdate: 'há 5 min' },
  { id: 'itau', name: 'Itaú', logo: '🟦', status: 'CONNECTED', lastUpdate: 'há 1 dia' },
];

export const CATEGORIES: Record<string, Category> = {
  // ENTRADAS
  salario: { id: 'salario', name: 'Salário', icon: '💼', color: '#10b981', type: 'INCOME' },
  hora_extra: { id: 'hora_extra', name: 'Hora extra', icon: '⏱️', color: '#10b981', type: 'INCOME' },
  comissao: { id: 'comissao', name: 'Comissão', icon: '📊', color: '#10b981', type: 'INCOME' },
  bonus: { id: 'bonus', name: 'Bônus / PLR', icon: '🎯', color: '#10b981', type: 'INCOME' },
  va_vr: { id: 'va_vr', name: 'Vale-alimentação / refeição', icon: '🍽️', color: '#10b981', type: 'INCOME' },
  vt_dinheiro: { id: 'vt_dinheiro', name: 'Vale-transporte', icon: '🚌', color: '#10b981', type: 'INCOME' },
  freelance: { id: 'freelance', name: 'Freelance', icon: '🧑‍💻', color: '#10b981', type: 'INCOME' },
  servicos_extras: { id: 'servicos_extras', name: 'Serviços extras', icon: '🔧', color: '#10b981', type: 'INCOME' },
  vendas: { id: 'vendas', name: 'Vendas', icon: '🛒', color: '#10b981', type: 'INCOME' },
  apps_renda: { id: 'apps_renda', name: 'Apps (Uber/iFood)', icon: '🚗', color: '#10b981', type: 'INCOME' },
  aluguel_recebido: { id: 'aluguel_recebido', name: 'Aluguel recebido', icon: '🏠', color: '#10b981', type: 'INCOME' },
  juros_recebidos: { id: 'juros_recebidos', name: 'Juros', icon: '📈', color: '#10b981', type: 'INCOME' },
  dividendos: { id: 'dividendos', name: 'Dividendos', icon: '💸', color: '#10b981', type: 'INCOME' },
  cashback: { id: 'cashback', name: 'Cashback', icon: '🔄', color: '#10b981', type: 'INCOME' },
  reembolsos: { id: 'reembolsos', name: 'Reembolsos', icon: '♻️', color: '#10b981', type: 'INCOME' },
  restituicao: { id: 'restituicao', name: 'Restituição imposto', icon: '🧾', color: '#10b981', type: 'INCOME' },
  ajuda_familiar: { id: 'ajuda_familiar', name: 'Ajuda familiar', icon: '🤝', color: '#10b981', type: 'INCOME' },
  apostas_ganhos: { id: 'apostas_ganhos', name: 'Apostas', icon: '🎲', color: '#10b981', type: 'INCOME' },
  premios: { id: 'premios', name: 'Prêmios', icon: '🏆', color: '#10b981', type: 'INCOME' },
  outras_entradas: { id: 'outras_entradas', name: 'Outras entradas', icon: '➕', color: '#10b981', type: 'INCOME' },

  // SAÍDAS
  aluguel: { id: 'aluguel', name: 'Aluguel', icon: '🏠', color: '#ef4444', type: 'EXPENSE' },
  financiamento: { id: 'financiamento', name: 'Financiamento', icon: '🏦', color: '#ef4444', type: 'EXPENSE' },
  condominio: { id: 'condominio', name: 'Condomínio', icon: '🏢', color: '#ef4444', type: 'EXPENSE' },
  iptu: { id: 'iptu', name: 'IPTU', icon: '🏛️', color: '#ef4444', type: 'EXPENSE' },
  agua: { id: 'agua', name: 'Água', icon: '🚿', color: '#ef4444', type: 'EXPENSE' },
  luz: { id: 'luz', name: 'Luz', icon: '💡', color: '#ef4444', type: 'EXPENSE' },
  gas: { id: 'gas', name: 'Gás', icon: '🔥', color: '#ef4444', type: 'EXPENSE' },
  internet: { id: 'internet', name: 'Internet', icon: '🌐', color: '#ef4444', type: 'EXPENSE' },
  telefone: { id: 'telefone', name: 'Telefone', icon: '📞', color: '#ef4444', type: 'EXPENSE' },
  mercado: { id: 'mercado', name: 'Mercado', icon: '🛒', color: '#ef4444', type: 'EXPENSE' },
  ifood: { id: 'ifood', name: 'iFood', icon: '🍔', color: '#ef4444', type: 'EXPENSE' },
  shopee: { id: 'shopee', name: 'Shopee', icon: '🛍️', color: '#ef4444', type: 'EXPENSE' },
  mercado_livre: { id: 'mercado_livre', name: 'Mercado Livre', icon: '📦', color: '#ef4444', type: 'EXPENSE' },
  transporte: { id: 'transporte', name: 'Transporte', icon: '🚌', color: '#ef4444', type: 'EXPENSE' },
  combustivel: { id: 'combustivel', name: 'Combustível', icon: '⛽', color: '#ef4444', type: 'EXPENSE' },
  estacionamento: { id: 'estacionamento', name: 'Estacionamento', icon: '🅿️', color: '#ef4444', type: 'EXPENSE' },
  manutencao_veiculo: { id: 'manutencao_veiculo', name: 'Manutenção', icon: '🔧', color: '#ef4444', type: 'EXPENSE' },
  seguro_veiculo: { id: 'seguro_veiculo', name: 'Seguro veículo', icon: '🚘', color: '#ef4444', type: 'EXPENSE' },
  plano_saude: { id: 'plano_saude', name: 'Plano saúde', icon: '🏥', color: '#ef4444', type: 'EXPENSE' },
  farmacia: { id: 'farmacia', name: 'Farmácia', icon: '💊', color: '#ef4444', type: 'EXPENSE' },
  academia: { id: 'academia', name: 'Academia', icon: '🏋️', color: '#ef4444', type: 'EXPENSE' },
  lazer: { id: 'lazer', name: 'Lazer', icon: '🎉', color: '#ef4444', type: 'EXPENSE' },
  assinaturas: { id: 'assinaturas', name: 'Assinaturas', icon: '📺', color: '#ef4444', type: 'EXPENSE' },
  educacao: { id: 'educacao', name: 'Educação', icon: '🎓', color: '#ef4444', type: 'EXPENSE' },
  compras_pessoais: { id: 'compras_pessoais', name: 'Compras', icon: '🛍️', color: '#ef4444', type: 'EXPENSE' },
  vestuario: { id: 'vestuario', name: 'Vestuário', icon: '👕', color: '#ef4444', type: 'EXPENSE' },
  cartao_credito: { id: 'cartao_credito', name: 'Cartão crédito', icon: '💳', color: '#ef4444', type: 'EXPENSE' },
  parcelamentos: { id: 'parcelamentos', name: 'Parcelamentos', icon: '🧩', color: '#ef4444', type: 'EXPENSE' },
  apostas_perdas: { id: 'apostas_perdas', name: 'Apostas', icon: '🎰', color: '#ef4444', type: 'EXPENSE' },
  impostos: { id: 'impostos', name: 'Impostos', icon: '🧾', color: '#ef4444', type: 'EXPENSE' },
  presentes: { id: 'presentes', name: 'Presentes', icon: '🎁', color: '#ef4444', type: 'EXPENSE' },
  doacoes: { id: 'doacoes', name: 'Doações', icon: '🤲', color: '#ef4444', type: 'EXPENSE' },
  reserva: { id: 'reserva', name: 'Reserva', icon: '🛡️', color: '#ef4444', type: 'EXPENSE' },
  investimentos: { id: 'investimentos', name: 'Investimentos', icon: '📊', color: '#ef4444', type: 'EXPENSE' },
  outras_despesas: { id: 'outras_despesas', name: 'Outras despesas', icon: '➖', color: '#ef4444', type: 'EXPENSE' },
};
