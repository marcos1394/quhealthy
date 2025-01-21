"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, Package, List, AlertCircle, ShoppingCart, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCategories([
        {
          id: "1",
          name: "Cuidado Facial",
          description: "Productos diseñados para el cuidado y rejuvenecimiento del rostro.",
          products: [
            { 
              id: "1", 
              name: "Crema Hidratante", 
              price: 25.99, 
              stock: 50,
              description: "Crema facial hidratante con ingredientes naturales para todo tipo de piel."
            },
            { 
              id: "2", 
              name: "Mascarilla de Arcilla", 
              price: 15.5, 
              stock: 30,
              description: "Mascarilla purificante que elimina impurezas y exceso de grasa."
            },
          ],
        },
        {
          id: "2",
          name: "Cuidado Corporal",
          description: "Productos para exfoliar, hidratar y cuidar la piel del cuerpo.",
          products: [
            { 
              id: "3", 
              name: "Exfoliante Corporal", 
              price: 35.0, 
              stock: 20,
              description: "Exfoliante natural que renueva y suaviza la piel."
            },
            { 
              id: "4", 
              name: "Aceite Relajante", 
              price: 18.5, 
              stock: 15,
              description: "Aceite corporal con propiedades relajantes y aromáticas."
            },
          ],
        },
        {
          id: "3",
          name: "Belleza Capilar",
          description: "Cuida y embellece tu cabello con productos especializados.",
          products: [
            { 
              id: "5", 
              name: "Shampoo Fortificante", 
              price: 12.99, 
              stock: 40,
              description: "Shampoo que fortalece y nutre el cabello desde la raíz."
            },
            { 
              id: "6", 
              name: "Acondicionador Nutritivo", 
              price: 14.99, 
              stock: 35,
              description: "Acondicionador que restaura y protege el cabello dañado."
            },
          ],
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.products.some(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStockStatus = (stock: number) => {
    if (stock <= 10) return { color: "text-red-500", text: "Bajo" };
    if (stock <= 30) return { color: "text-yellow-500", text: "Medio" };
    return { color: "text-green-500", text: "Alto" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          <span className="text-lg">Cargando categorías...</span>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-xl text-gray-400">No hay categorías disponibles.</p>
        <Button className="mt-4" variant="outline">
          Actualizar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Categorías de Productos</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-400">
                  <Package className="w-5 h-5" />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400">{category.description}</p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="bg-gray-700">
                    {category.products.length} productos
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory(category)}
                    className="hover:bg-teal-500 hover:text-white transition-colors"
                  >
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de categoría */}
        <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-teal-400 flex items-center gap-2">
                <Package className="w-6 h-6" />
                {selectedCategory?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-gray-400 text-lg">{selectedCategory?.description}</p>
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-xl font-medium text-white mb-4">Productos</h4>
                {selectedCategory && selectedCategory.products.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-gray-700">
                      <TableRow>
                        <TableHead className="text-gray-300">Nombre</TableHead>
                        <TableHead className="text-gray-300">Precio</TableHead>
                        <TableHead className="text-gray-300">Stock</TableHead>
                        <TableHead className="text-gray-300">Estado</TableHead>
                        <TableHead className="text-gray-300 text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCategory.products.map((product) => (
                        <TableRow key={product.id} className="hover:bg-gray-700/50">
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-700">
                              ${product.price.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.stock} unidades</TableCell>
                          <TableCell>
                            <span className={getStockStatus(product.stock).color}>
                              {getStockStatus(product.stock).text}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-gray-700"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Detalles
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-teal-500 hover:text-white"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Agregar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No hay productos en esta categoría.</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de producto */}
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl text-teal-400">
                {selectedProduct?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-400">{selectedProduct?.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Precio</p>
                  <p className="text-xl font-bold">${selectedProduct?.price.toFixed(2)}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Stock Disponible</p>
                  <p className="text-xl font-bold">{selectedProduct?.stock} unidades</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                onClick={() => setSelectedProduct(null)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Agregar al Carrito
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Categories;