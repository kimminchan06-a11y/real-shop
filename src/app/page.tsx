import { StorefrontPage } from "@/components/storefront-page";
import { getStorefrontCatalog } from "@/lib/product-catalog";

export default async function Home() {
  const storefrontCatalog = await getStorefrontCatalog();

  return <StorefrontPage storefrontCatalog={storefrontCatalog} />;
}
