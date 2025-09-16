// types/marketplace.ts



export interface Tag {
  name: string;
}

export interface Marketplace {
  storeName: string;
  storeSlug: string;
  storeBanner: string | null;
  storeLogo: string | null;
  customDescription: string | null;
  // Añade aquí cualquier otro campo del marketplace que necesites en el futuro

}

export interface ProviderData {
  id: number;
  name: string;
  marketplace: Marketplace;
  tags: Tag[];
}