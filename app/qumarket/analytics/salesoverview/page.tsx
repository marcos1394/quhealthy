"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Target, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface SalesData {
  month: string;
  sales: number;
  target: number;
  transactions: number;
  avgTicket: number;
  growth: number;
}

const SalesOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [timeframe, setTimeframe] = useState("6m");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Datos simulados mejorados
      const mockData: SalesData[] = [
        { month: "Enero", sales: 1200, target: 1500, transactions: 120, avgTicket: 10, growth: -5 },
        { month: "Febrero", sales: 1800, target: 1600, transactions: 150, avgTicket: 12, growth: 50 },
        { month: "Marzo", sales: 1500, target: 1700, transactions: 140, avgTicket: 10.7, growth: -16.7 },
        { month: "Abril", sales: 2200, target: 1800, transactions: 180, avgTicket: 12.2, growth: 46.7 },
        { month: "Mayo", sales: 2000, target: 1900, transactions: 160, avgTicket: 12.5, growth: -9.1 },
      ];
      setSalesData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeframe]);

  const getTotalSales = () => salesData.reduce((acc, curr) => acc + curr.sales, 0);
  const getAverageTicket = () => salesData.reduce((acc, curr) => acc + curr.avgTicket, 0) / salesData.length;
  const getTotalTransactions = () => salesData.reduce((acc, curr) => acc + curr.transactions, 0);
  const getAverageGrowth = () => {
    const growths = salesData.map(d => d.growth);
    return growths.reduce((acc, curr) => acc + curr, 0) / growths.length;
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          <span className="text-lg">Cargando datos de ventas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Resumen de Ventas</h1>
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="1m">Último mes</SelectItem>
                <SelectItem value="3m">3 meses</SelectItem>
                <SelectItem value="6m">6 meses</SelectItem>
                <SelectItem value="1y">1 año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalSales())}</div>
              <div className="flex items-center mt-2">
                {getAverageGrowth() > 0 ? (
                  <Badge className="bg-green-500/20 text-green-500">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +{getAverageGrowth().toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-500">
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                    {getAverageGrowth().toFixed(1)}%
                  </Badge>
                )}
                <span className="text-gray-400 text-sm ml-2">vs. período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
              <Activity className="h-4 w-4 text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalTransactions()}</div>
              <p className="text-xs text-gray-400 mt-2">
                Ticket promedio: {formatCurrency(getAverageTicket())}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Objetivo Mensual</CardTitle>
              <Target className="h-4 w-4 text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(salesData[salesData.length - 1]?.target || 0)}</div>
              <Progress 
                value={(salesData[salesData.length - 1]?.sales / (salesData[salesData.length - 1]?.target || 1)) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
              {getAverageGrowth() > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAverageGrowth() > 0 ? '+' : ''}{getAverageGrowth().toFixed(1)}%</div>
              <p className="text-xs text-gray-400 mt-2">Crecimiento promedio</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="chart">Gráfico</TabsTrigger>
            <TabsTrigger value="table">Tabla</TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#9CA3AF"
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => `€${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '0.375rem',
                        }}
                        labelStyle={{ color: '#D1D5DB' }}
                        itemStyle={{ color: '#D1D5DB' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        name="Ventas"
                        stroke="#2DD4BF"
                        strokeWidth={2}
                        dot={{ fill: '#2DD4BF' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        name="Objetivo"
                        stroke="#6B7280"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Mes</TableHead>
                      <TableHead className="text-gray-300">Ventas</TableHead>
                      <TableHead className="text-gray-300">Objetivo</TableHead>
                      <TableHead className="text-gray-300">Transacciones</TableHead>
                      <TableHead className="text-gray-300">Ticket Promedio</TableHead>
                      <TableHead className="text-gray-300">Crecimiento</TableHead>
                      <TableHead className="text-gray-300">Progreso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.map((data, index) => (
                      <TableRow key={index} className="hover:bg-gray-700/50">
                        <TableCell className="font-medium">{data.month}</TableCell>
                        <TableCell>{formatCurrency(data.sales)}</TableCell>
                        <TableCell>{formatCurrency(data.target)}</TableCell>
                        <TableCell>{data.transactions}</TableCell>
                        <TableCell>{formatCurrency(data.avgTicket)}</TableCell>
                        <TableCell>
                          <Badge 
                            className={data.growth > 0 ? 
                              "bg-green-500/20 text-green-500" : 
                              "bg-red-500/20 text-red-500"
                            }
                          >
                            {data.growth > 0 ? '+' : ''}{data.growth}%
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[200px]">
                          <Progress
                            value={(data.sales / data.target) * 100}
                            className="w-full"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalesOverview;