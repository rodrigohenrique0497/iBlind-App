
import React from 'react';
import { 
  Smartphone, 
  Search, 
  Zap, 
  CheckCircle,
  CreditCard,
  PenTool
} from 'lucide-react';

export const STEPS = [
  { id: 'DEVICE', label: 'Qual aparelho?', icon: <Smartphone size={20} /> },
  { id: 'STATE', label: 'Como ele chegou?', icon: <Search size={20} /> },
  { id: 'SERVICE', label: 'O que foi feito?', icon: <Zap size={20} /> },
  { id: 'PAYMENT', label: 'Pagamento', icon: <CreditCard size={20} /> },
  { id: 'FINISH', label: 'Finalizar', icon: <PenTool size={20} /> },
];

export const PAYMENT_METHODS = [
  { value: 'PIX', label: 'Pix' },
  { value: 'CREDITO', label: 'Cartão de Crédito' },
  { value: 'DEBITO', label: 'Cartão de Débito' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
];
