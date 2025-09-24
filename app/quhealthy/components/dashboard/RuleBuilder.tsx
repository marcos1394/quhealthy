/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// --- INICIO DE LA CORRECCIÓN DE TIPOS ---
// Tipos más estrictos y claros
interface RuleComponent {
  id: number;
  name: string;
  label: string;
  dataType?: 'number' | 'boolean' | 'string';
  appliesTo?: string[];
}
interface RuleCondition {
  fact: string;
  operator: string;
  value: any;
}
interface RuleAction {
  type: string;
  value: any;
}
interface Rule {
  condition: RuleCondition;
  action: RuleAction;
}
interface RuleBuilderProps {
  initialRules: Rule[];
  onChange: (rules: Rule[]) => void;
}
// --- FIN DE LA CORRECCIÓN DE TIPOS ---


export const RuleBuilder: React.FC<RuleBuilderProps> = ({ initialRules, onChange }) => {
  const [rules, setRules] = useState<Rule[]>(initialRules || []);
  const [components, setComponents] = useState<{ facts: RuleComponent[], operators: RuleComponent[], actions: RuleComponent[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/rules/components', { withCredentials: true })
      .then(res => setComponents(res.data))
      .catch(err => console.error("Error fetching rule components", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleRuleChange = (index: number, part: 'condition' | 'action', field: keyof RuleCondition | keyof RuleAction, value: any) => {
      const newRules = [...rules];
    (newRules[index][part] as any)[field] = value;

    // Lógica para auto-ajustar el operador y el valor si cambia el "hecho"
    if (part === 'condition' && field === 'fact') {
      const selectedFact = components?.facts.find(f => f.name === value);
      if (selectedFact?.dataType === 'boolean') {
        newRules[index].condition.operator = 'isTrue';
        newRules[index].condition.value = true;
      }
    }
    setRules(newRules);
    onChange(newRules);
  };

 const addRule = () => {
    // --- INICIO DE LA CORRECCIÓN DE VALIDACIÓN ---
    // Solo añadimos una regla si tenemos los componentes cargados
    if (!components || components.facts.length === 0 || components.operators.length === 0 || components.actions.length === 0) {
      return;
    }
    // --- FIN DE LA CORRECCIÓN DE VALIDACIÓN ---
    
    const newRule: Rule = { // Aseguramos que la nueva regla cumple con el tipo
      condition: { fact: components.facts[0].name, operator: components.operators[0].name, value: 24 },
      action: { type: components.actions[0].name, value: 100 }
    };
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    onChange(updatedRules);
  };


  const removeRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    onChange(updatedRules);
  };
  
  if (isLoading) return <div className="p-4 text-center"><Loader2 className="animate-spin inline-block" /></div>;
  if (!components) return <div className="p-4 text-center text-red-400">No se pudieron cargar los componentes de reglas.</div>;

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {rules.map((rule, index) => {
          const selectedFact = components.facts.find(f => f.name === rule.condition.fact);
          const availableOperators = components.operators.filter(op => op.appliesTo?.includes(selectedFact?.dataType || 'number'));
          
          return (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 space-y-3"
            >
              {/* --- Sección de Condición (IF) --- */}
              <div className="grid grid-cols-[auto,1fr,1fr,1fr] items-center gap-2">
                <span className="font-bold text-purple-300">SI</span>
                <Select onValueChange={(v) => handleRuleChange(index, 'condition', 'fact', v)} value={rule.condition.fact}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{components.facts.map(f => <SelectItem key={f.id} value={f.name}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
                <Select onValueChange={(v) => handleRuleChange(index, 'condition', 'operator', v)} value={rule.condition.operator}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>{availableOperators.map(op => <SelectItem key={op.id} value={op.name}>{op.label}</SelectItem>)}</SelectContent>
                </Select>
                {/* Renderizado Condicional del Valor */}
                {selectedFact?.dataType === 'number' && <Input type="number" value={rule.condition.value} onChange={(e) => handleRuleChange(index, 'condition', 'value', parseInt(e.target.value))}/>}
                {selectedFact?.dataType === 'boolean' && 
                  <Select onValueChange={(v) => handleRuleChange(index, 'condition', 'value', v === 'true')} value={String(rule.condition.value)}>
                     <SelectTrigger><SelectValue /></SelectTrigger>
                     <SelectContent>
                        <SelectItem value="true">Verdadero</SelectItem>
                        <SelectItem value="false">Falso</SelectItem>
                     </SelectContent>
                  </Select>
                }
              </div>
              {/* --- Sección de Acción (THEN) --- */}
              <div className="grid grid-cols-[auto,1fr,1fr,auto,auto] items-center gap-2">
                <span className="font-bold text-green-300">ENTONCES</span>
                <Select onValueChange={(v) => handleRuleChange(index, 'action', 'type', v)} value={rule.action.type}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{components.actions.map(a => <SelectItem key={a.id} value={a.name}>{a.label}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" value={rule.action.value} onChange={(e) => handleRuleChange(index, 'action', 'value', parseInt(e.target.value))} />
                <span className="text-gray-400">%</span>
                <Button variant="ghost" size="default" onClick={() => removeRule(index)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <Button variant="outline" onClick={addRule} className="border-gray-600">
        <Plus className="w-4 h-4 mr-2" /> Añadir Regla
      </Button>
    </div>
  );
};