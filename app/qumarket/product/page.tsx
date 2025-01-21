"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, Trash2, Edit, Search, Filter, 
  ArrowUpDown, Package, TagIcon, AlertCircle,
  Grid, List, Download, Upload, Eye
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  imageUrl: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
  createdAt: string;
  sku: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showProductDetails, setShowProductDetails] = useState(false);

  const [form, setForm] = useState<Omit<Product, "id" | "status" | "createdAt">>({
    name: "",
    price: 0,
    stock: 0,
    category: "",
    description: "",
    imageUrl: "",
    sku: "",
  });

  // Simula carga inicial de productos
  useEffect(() => {
    const dummyProducts: Product[] = [
      {
        id: "1",
        name: "Crema hidratante facial",
        price: 25.99,
        stock: 50,
        category: "Cuidado Facial",
        description: "Crema hidratante diaria para todo tipo de piel.",
        imageUrl: "/api/placeholder/200/200",
        status: "in_stock",
        createdAt: new Date().toISOString(),
        sku: "CF001",
      },
      {
        id: "2",
        name: "Cepillo de limpieza facial",
        price: 18.5,
        stock: 5,
        category: "Cuidado Facial",
        description: "Cepillo para exfoliación suave y limpieza profunda.",
        imageUrl: "@/public/cepillo_limpieza_facial.jpg",
        status: "low_stock",
        createdAt: new Date().toISOString(),
        sku: "CF002",
      },
      {
        id: "3",
        name: "Sérum Vitamina C",
        price: 45.99,
        stock: 0,
        category: "Tratamientos",
        description: "Sérum concentrado con vitamina C para luminosidad.",
        imageUrl: "/api/placeholder/200/200",
        status: "out_of_stock",
        createdAt: new Date().toISOString(),
        sku: "TR001",
      },
    ];
    setProducts(dummyProducts);
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const getStatusBadgeColor = (status: Product["status"]) => {
    switch (status) {
      case "in_stock":
        return "bg-emerald-500/20 text-emerald-400";
      case "low_stock":
        return "bg-yellow-500/20 text-yellow-400";
      case "out_of_stock":
        return "bg-red-500/20 text-red-400";
    }
  };

  const getStatusText = (status: Product["status"]) => {
    switch (status) {
      case "in_stock":
        return "En Stock";
      case "low_stock":
        return "Stock Bajo";
      case "out_of_stock":
        return "Sin Stock";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => 
      selectedCategory === "all" ? true : product.category === selectedCategory
    )
    .sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      switch (sortBy) {
        case "name":
          return multiplier * a.name.localeCompare(b.name);
        case "price":
          return multiplier * (a.price - b.price);
        case "stock":
          return multiplier * (a.stock - b.stock);
        default:
          return 0;
      }
    });

  const handleAddProduct = () => {
    if (!form.name || !form.price || !form.category) {
      return;
    }

    const newProduct: Product = {
      id: (products.length + 1).toString(),
      ...form,
      status: form.stock > 10 ? "in_stock" : form.stock > 0 ? "low_stock" : "out_of_stock",
      createdAt: new Date().toISOString(),
    };
    setProducts([...products, newProduct]);
    setForm({
      name: "",
      price: 0,
      stock: 0,
      category: "",
      description: "",
      imageUrl: "",
      sku: "",
    });
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredProducts.map((product) => (
        <Card key={product.id} className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="aspect-square relative mb-4 bg-gray-700 rounded-lg overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-cover w-full h-full"
              />
              <Badge className={`absolute top-2 right-2 ${getStatusBadgeColor(product.status)}`}>
                {getStatusText(product.status)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                </div>
                <p className="text-lg font-bold text-teal-400">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  {product.category}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowProductDetails(true);
                    }}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setForm(product);
                      setIsEditing(true);
                    }}
                    className="text-blue-400 hover:bg-blue-400/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedProducts = products.filter(p => p.id !== product.id);
                      setProducts(updatedProducts);
                    }}
                    className="text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <Table>
      <TableHeader className="bg-gray-700">
        <TableRow>
          <TableHead className="text-gray-300">Producto</TableHead>
          <TableHead className="text-gray-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSortBy("price");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
              className="text-gray-300 hover:text-white"
            >
              Precio
              <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
          </TableHead>
          <TableHead className="text-gray-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSortBy("stock");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
              className="text-gray-300 hover:text-white"
            >
              Stock
              <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
          </TableHead>
          <TableHead className="text-gray-300">Categoría</TableHead>
          <TableHead className="text-gray-300">Estado</TableHead>
          <TableHead className="text-gray-300 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredProducts.map((product) => (
          <TableRow key={product.id} className="hover:bg-gray-800/50">
            <TableCell>
              <div className="flex items-center space-x-3">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-white">{product.name}</p>
                  <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="font-medium">
              ${product.price.toFixed(2)}
            </TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>
              <Badge variant="outline" className="text-gray-400 border-gray-600">
                {product.category}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getStatusBadgeColor(product.status)}>
                {getStatusText(product.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowProductDetails(true);
                  }}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedProduct(product);
                    setForm(product);
                    setIsEditing(true);
                  }}
                  className="text-blue-400 hover:bg-blue-400/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const updatedProducts = products.filter(p => p.id !== product.id);
                    setProducts(updatedProducts);
                  }}
                  className="text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Gestión de Productos</h1>
            <p className="text-gray-400">
              {filteredProducts.length} productos en total
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-gray-800 border-gray-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-teal-500 hover:bg-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-white">
                <DialogHeader>
                  <DialogTitle className="text-teal-400">
                    {isEditing ? "Editar Producto" : "Nuevo Producto"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input
                      name="name" value={form.name}
                      onChange={handleInputChange}
                      placeholder="Nombre del producto"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleInputChange}
                      placeholder="Precio"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      name="stock"
                      type="number"
                      value={form.stock}
                      onChange={handleInputChange}
                      placeholder="Stock"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      name="sku"
                      value={form.sku}
                      onChange={handleInputChange}
                      placeholder="SKU"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <Select
                      onValueChange={(value) => handleSelectChange("category", value)}
                      defaultValue={form.category}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      placeholder="Descripción"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">
                        Arrastra una imagen o haz clic para seleccionar
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          // Aquí iría la lógica de carga de imágenes
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={isEditing ? handleAddProduct : handleAddProduct}
                    className="bg-teal-500 hover:bg-teal-600 col-span-2"
                  >
                    {isEditing ? "Guardar Cambios" : "Agregar Producto"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="price">Precio</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-teal-500" : "bg-gray-800 border-gray-700"}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-teal-500" : "bg-gray-800 border-gray-700"}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Alertas */}
        {filteredProducts.some(p => p.stock === 0) && (
          <Alert className="mb-6 bg-red-500/20 border-red-500/50">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <AlertDescription className="text-red-400">
              Hay productos sin stock. Considera realizar un pedido pronto.
            </AlertDescription>
          </Alert>
        )}

        {/* Vista de Productos */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-400">
                Intenta ajustar los filtros o añade nuevos productos.
              </p>
            </div>
          ) : (
            viewMode === "grid" ? renderGridView() : renderListView()
          )}
        </div>

        {/* Detalles del Producto */}
        <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
          <DialogContent className="bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-teal-400">
                Detalles del Producto
              </DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Nombre</p>
                    <p className="text-white">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">SKU</p>
                    <p className="text-white">{selectedProduct.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Precio</p>
                    <p className="text-white">${selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Stock</p>
                    <p className="text-white">{selectedProduct.stock}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">Descripción</p>
                    <p className="text-white">{selectedProduct.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Categoría</p>
                    <Badge variant="outline" className="text-gray-400 border-gray-600">
                      {selectedProduct.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Estado</p>
                    <Badge className={getStatusBadgeColor(selectedProduct.status)}>
                      {getStatusText(selectedProduct.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProductManagement;