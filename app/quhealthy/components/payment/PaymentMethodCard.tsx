"use client";
import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { PaymentMethod } from '@/app/quhealthy/types/payment';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ method, isSelected, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
  >
    <Card
      className={`h-full bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-xl cursor-pointer
        transition-all duration-200 relative overflow-hidden group shadow-md
        ${isSelected ? "ring-2 ring-purple-500 shadow-purple-500/20" : "hover:border-gray-600 hover:shadow-lg"}`
      }
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 bg-purple-500/20 text-purple-300 p-1.5 rounded-full">
          <CheckCircle className="w-5 h-5" />
        </div>
      )}
      <CardHeader className="p-6 flex flex-row justify-between items-center">
        {method.logo}
        {method.badge && (
          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300 text-xs">
            {method.badge}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <h3 className="text-lg font-semibold text-white mb-1">{method.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{method.description}</p>
        <div className="space-y-2 border-t border-gray-700 pt-4">
          {method.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle className="text-purple-400 w-4 h-4 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);