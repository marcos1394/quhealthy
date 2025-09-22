/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2 } from 'lucide-react';

// Tipos para los componentes de reglas que vienen de la API
interface RuleComponent { id: number; name: string; label: string; }
interface Rule { condition: any; action: any; }

interface RuleBuilderProps {
  initialRules: Rule[];
  onChange: (rules: Rule[]) => void;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({ initialRules, onChange }) => {
  const [rules, setRules] = useState<Rule[]>(initialRules || []);
  const [components, setComponents] = useState<{ facts: RuleComponent[], operators: RuleComponent[], actions: RuleComponent[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtenemos los "bloques" (hechos, operadores, acciones) desde nuestro backend
    const fetchComponents = async () => {
      try {
        const { data } = await axios.get('/api/rules/components', { withCredentials: true });
        setComponents(data);
      } catch (error) {
        console.error("Error fetching rule components", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComponents();
  }, []);

  const handleRuleChange = (index: number, part: 'condition' | 'action', field: string, value: any) => {
    const newRules = [...rules];
    newRules[index][part][field] = value;
    setRules(newRules);
    onChange(newRules);
  };

  const addRule = () => {
    const newRule = {
      condition: { fact: components?.facts[0]?.name, operator: components?.operators[0]?.name, value: 24 },
      action: { type: components?.actions[0]?.name, value: 100 }
    };
    setRules([...rules, newRule]);
    onChange([...rules, newRule]);
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
    onChange(newRules);
  };

  if (isLoading) {
    return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin w-4 h-4" /> Cargando constructor de reglas...</div>;
  }

  return (
    <div className="space-y-4">
      {rules.map((rule, index) => (
        <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-purple-300">SI</span>
            {/* Selector de Hecho (Fact) */}
            <Select onValueChange={(value) => handleRuleChange(index, 'condition', 'fact', value)} defaultValue={rule.condition.fact}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {components?.facts.map(fact => <SelectItem key={fact.id} value={fact.name}>{fact.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {/* Selector de Operador */}
            <Select onValueChange={(value) => handleRuleChange(index, 'condition', 'operator', value)} defaultValue={rule.condition.operator}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {components?.operators.map(op => <SelectItem key={op.id} value={op.name}>{op.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" value={rule.condition.value} onChange={(e) => handleRuleChange(index, 'condition', 'value', parseInt(e.target.value))} />
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-green-300">ENTONCES</span>
            {/* Selector de Acción */}
            <Select onValueChange={(value) => handleRuleChange(index, 'action', 'type', value)} defaultValue={rule.action.type}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {components?.actions.map(act => <SelectItem key={act.id} value={act.name}>{act.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" value={rule.action.value} onChange={(e) => handleRuleChange(index, 'action', 'value', parseInt(e.target.value))} />
            <span className="text-gray-400">%</span>
            <Button variant="ghost" size="default" onClick={() => removeRule(index)}>
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addRule} className="border-gray-600">
        <Plus className="w-4 h-4 mr-2" /> Añadir Regla
      </Button>
    </div>
  );
};