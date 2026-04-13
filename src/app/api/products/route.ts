import { getStorefrontCatalog } from "@/lib/product-catalog";

export const dynamic = "force-static";

export async function GET() {
  const storefrontCatalog = await getStorefrontCatalog();

  return Response.json(storefrontCatalog);
}
