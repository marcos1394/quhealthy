import { redirect } from 'next/navigation';

export default function MarketRedirectPage() {
  redirect('/discover?type=PRODUCT');
}