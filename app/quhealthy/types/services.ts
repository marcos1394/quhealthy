export interface Service {
    id: string;
    name: string;
    location: string;
    price: number;
    priceRange: string;
    rating: number;
    reviewCount: number;
    imageUrl: string | null;
    isFavorite: boolean;
    description?: string;
    categories?: string[];
  }
  
  export interface Filters {
    category: string;
    priceRange: string;
    rating: string;
    sortBy: string;
  }