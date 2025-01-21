"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, Package, TrendingUp, AlertTriangle, ShoppingCart, ArrowUpRight, Filter } from "lucide-react";

interface ProductData {
  product: string;
  sales: number;
  stock: number;
  revenue: number;
  target: number;
  growth: number;
  category: string;
}

const ProductPerformance: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("sales");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockData: ProductData[] = [
        { 
          product: "Crema Hidratante", 
          sales: 120, 
          stock: 50,
          revenue: 3600,
          target: 100,
          growth: 15,
          category: "Facial"
        },
        { 
          product: "Mascarilla de Arcilla", 
          sales: 80, 
          stock: 20,
          revenue: 1200,
          target: 90,
          growth: -5,
          category: "Facial"
        },
        { 
          product: "Exfoliante Corporal", 
          sales: 100, 
          stock: 15,
          revenue: 2500,
          target: 85,
          growth: 8,
          category: "Corporal"
        },
        { 
          product: "Shampoo Fortificante", 
          sales: 150, 
          stock: 30,
          revenue: 2250,
          target: 120,
          growth: 25,
          category: "Capilar"
        },
        { 
          product: "Acondicionador Nutritivo", 
          sales: 130, 
          stock: 25,
          revenue: 1950,
          target: 110,
          growth: 12,
          category: "Capilar"
        },
      ];
      setProductData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = ["all", ...new Set(productData.map(item => item.category))];

  const filteredData = productData
    .filter(item => selectedCategory === "all" ? true : item.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "sales": return b.sales - a.sales;
        case "revenue": return b.revenue - a.revenue;
        case "stock": return a.stock - b.stock;
        default: return 0;
      }
    });

  const getTotalSales = () => filteredData.reduce((acc, curr) => acc + curr.sales, 0);
  const getTotalRevenue = () => filteredData.reduce((acc, curr) => acc + curr.revenue, 0);
  const getLowStockProducts = () => filteredData.filter(item => item.stock < 20).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          <span className="text-lg">Cargando datos de productos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Rendimiento de Productos</h1>
          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "Todas las categorías" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="sales">Ventas</SelectItem>
                <SelectItem value="revenue">Ingresos</SelectItem>
                <SelectItem value="stock">Stock Bajo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalSales()} unidades</div>
              <p className="text-xs text-gray-400 mt-2">
                Ingresos: €{getTotalRevenue().toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mejor Producto</CardTitle>
              <TrendingUp className="h-4 w-4 text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {filteredData[0]?.product}
              </div>
              <div className="flex items-center mt-2">
                <Badge className="bg-green-500/20 text-green-500">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {filteredData[0]?.sales} ventas
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getLowStockProducts()} productos</div>
              <p className="text-xs text-gray-400 mt-2">
                Necesitan reposición
              </p>
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
                    <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="product" 
                        stroke="#9CA3AF"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        yAxisId="left"
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        yAxisId="right"
                        orientation="right"
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
                      <Legend />
                      <Bar 
                        dataKey="sales" 
                        name="Ventas"
                        fill="#10B981"
                        yAxisId="left"
                      />
                      <Bar 
                        dataKey="stock" 
                        name="Stock"
                        fill="#6B7280"
                        yAxisId="right"
                      />
                    </BarChart>
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
                      <TableHead className="text-gray-300">Producto</TableHead>
                      <TableHead className="text-gray-300">Categoría</TableHead>
                      <TableHead className="text-gray-300">Ventas</TableHead>
                      <TableHead className="text-gray-300">Ingresos</TableHead>
                      <TableHead className="text-gray-300">Stock</TableHead>
                      <TableHead className="text-gray-300">Rendimiento</TableHead>
                      <TableHead className="text-gray-300">Crecimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((data, index) => (
                      <TableRow key={index} className="hover:bg-gray-700/50">
                        <TableCell className="font-medium">{data.product}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{data.category}</Badge>
                        </TableCell>
                        <TableCell>{data.sales} unidades</TableCell>
                        <TableCell>€{data.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={data.stock < 20 ? "text-red-400" : "text-gray-300"}>
                              {data.stock}
                            </span>
                            {data.stock < 20 && (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Progress
                            value={(data.sales / data.target) * 100}
                            className="w-full"
                          />
                        </TableCell>
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

export default ProductPerformance;