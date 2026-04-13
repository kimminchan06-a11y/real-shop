import type { IconKey } from "@/lib/storefront-data";

export type PaymentMethod = "card" | "usdt";
export type ProductCategory =
  | "smartphone"
  | "tablet"
  | "laptop"
  | "audio"
  | "accessory"
  | "wearable";
export type InventoryStatus = "in-stock" | "limited" | "preorder";
export type CryptoNetwork = "TRC20" | "ERC20";

export type CatalogProduct = {
  id: string;
  slug: string;
  category: ProductCategory;
  name: string;
  description: string;
  icon: IconKey;
  pricing: {
    currentKrw: number;
    oldKrw: number;
  };
  inventory: {
    status: InventoryStatus;
    quantity: number | null;
    label: string;
  };
  payments: {
    methods: PaymentMethod[];
    networks: CryptoNetwork[];
  };
  storefront: {
    featured?: {
      rank: number;
      badge: string;
      gradientClassName: string;
    };
    deal?: {
      rank: number;
      iconClassName: string;
      isExtra?: boolean;
    };
  };
};

export type FeaturedCatalogProduct = CatalogProduct & {
  storefront: CatalogProduct["storefront"] & {
    featured: NonNullable<CatalogProduct["storefront"]["featured"]>;
  };
};

export type DealCatalogProduct = CatalogProduct & {
  storefront: CatalogProduct["storefront"] & {
    deal: NonNullable<CatalogProduct["storefront"]["deal"]>;
  };
};

export type StorefrontCatalog = {
  featuredProducts: FeaturedCatalogProduct[];
  dealProducts: DealCatalogProduct[];
};

const productCatalog: CatalogProduct[] = [
  {
    id: "iphone-15-pro",
    slug: "iphone-15-pro",
    category: "smartphone",
    name: "iPhone 15 Pro",
    description: "프리미엄 스마트폰을 카드 또는 USDT로 빠르게 주문하세요.",
    icon: "smartphone",
    pricing: {
      currentKrw: 1_349_000,
      oldKrw: 1_499_000,
    },
    inventory: {
      status: "in-stock",
      quantity: 7,
      label: "즉시 출고",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      featured: {
        rank: 1,
        badge: "즉시 견적 가능",
        gradientClassName: "from-slate-950 via-slate-800 to-emerald-700",
      },
    },
  },
  {
    id: "ipad-air",
    slug: "ipad-air",
    category: "tablet",
    name: "iPad Air",
    description: "가벼운 작업과 엔터테인먼트를 위한 인기 태블릿.",
    icon: "tablet",
    pricing: {
      currentKrw: 809_000,
      oldKrw: 899_000,
    },
    inventory: {
      status: "limited",
      quantity: 4,
      label: "재고 4대",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      featured: {
        rank: 2,
        badge: "재고 문의 가능",
        gradientClassName: "from-cyan-700 via-sky-600 to-slate-900",
      },
    },
  },
  {
    id: "macbook-air",
    slug: "macbook-air",
    category: "laptop",
    name: "MacBook Air",
    description: "실시간 시세 기준으로 카드와 USDT 금액을 함께 비교할 수 있습니다.",
    icon: "laptop",
    pricing: {
      currentKrw: 1_529_000,
      oldKrw: 1_699_000,
    },
    inventory: {
      status: "in-stock",
      quantity: 6,
      label: "재고 6대",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      featured: {
        rank: 3,
        badge: "실시간 금액 반영",
        gradientClassName: "from-amber-500 via-orange-500 to-slate-900",
      },
    },
  },
  {
    id: "galaxy-s24-ultra",
    slug: "galaxy-s24-ultra",
    category: "smartphone",
    name: "Galaxy S24 Ultra",
    description: "강력한 성능과 선명한 디스플레이를 담은 플래그십 모델.",
    icon: "smartphone",
    pricing: {
      currentKrw: 1_439_000,
      oldKrw: 1_599_000,
    },
    inventory: {
      status: "limited",
      quantity: 3,
      label: "재고 3대",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      featured: {
        rank: 4,
        badge: "빠른 주문 가능",
        gradientClassName: "from-violet-700 via-indigo-700 to-slate-900",
      },
    },
  },
  {
    id: "galaxy-tab-s9",
    slug: "galaxy-tab-s9",
    category: "tablet",
    name: "Galaxy Tab S9",
    description: "합리적인 가격으로 즐기는 프리미엄 태블릿 경험.",
    icon: "monitor",
    pricing: {
      currentKrw: 989_000,
      oldKrw: 1_099_000,
    },
    inventory: {
      status: "preorder",
      quantity: null,
      label: "예약 주문",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      featured: {
        rank: 5,
        badge: "합리적 USDT 견적",
        gradientClassName: "from-emerald-700 via-teal-700 to-slate-900",
      },
    },
  },
  {
    id: "airpods",
    slug: "airpods",
    category: "audio",
    name: "AirPods",
    description: "매일 사용하는 인기 무선 이어폰.",
    icon: "headphones",
    pricing: {
      currentKrw: 299_000,
      oldKrw: 359_000,
    },
    inventory: {
      status: "in-stock",
      quantity: 14,
      label: "재고 14개",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      deal: {
        rank: 1,
        iconClassName: "bg-rose-50 text-rose-700",
      },
    },
  },
  {
    id: "buds-2",
    slug: "buds-2",
    category: "audio",
    name: "Buds 2",
    description: "가볍고 편안한 데일리 무선 이어버드.",
    icon: "headphones",
    pricing: {
      currentKrw: 169_000,
      oldKrw: 199_000,
    },
    inventory: {
      status: "in-stock",
      quantity: 11,
      label: "재고 11개",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      deal: {
        rank: 2,
        iconClassName: "bg-sky-50 text-sky-700",
      },
    },
  },
  {
    id: "keyboard",
    slug: "keyboard",
    category: "accessory",
    name: "Keyboard",
    description: "심플한 작업 환경을 위한 베스트셀러 키보드.",
    icon: "keyboard",
    pricing: {
      currentKrw: 129_000,
      oldKrw: 149_000,
    },
    inventory: {
      status: "limited",
      quantity: 5,
      label: "재고 5개",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      deal: {
        rank: 3,
        iconClassName: "bg-amber-50 text-amber-700",
      },
    },
  },
  {
    id: "mouse",
    slug: "mouse",
    category: "accessory",
    name: "Mouse",
    description: "기본기 탄탄한 무선 마우스 특가.",
    icon: "mouse",
    pricing: {
      currentKrw: 119_000,
      oldKrw: 139_000,
    },
    inventory: {
      status: "in-stock",
      quantity: 9,
      label: "재고 9개",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      deal: {
        rank: 4,
        iconClassName: "bg-emerald-50 text-emerald-700",
      },
    },
  },
  {
    id: "beats-speaker",
    slug: "beats-speaker",
    category: "audio",
    name: "Beats Speaker",
    description: "풍부한 사운드를 담은 포터블 스피커.",
    icon: "speaker",
    pricing: {
      currentKrw: 349_000,
      oldKrw: 399_000,
    },
    inventory: {
      status: "limited",
      quantity: 4,
      label: "재고 4개",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      deal: {
        rank: 5,
        iconClassName: "bg-violet-50 text-violet-700",
      },
    },
  },
  {
    id: "smart-watch",
    slug: "smart-watch",
    category: "wearable",
    name: "Smart Watch",
    description: "운동과 일상을 함께 챙기는 스마트 워치.",
    icon: "watch",
    pricing: {
      currentKrw: 389_000,
      oldKrw: 429_000,
    },
    inventory: {
      status: "preorder",
      quantity: null,
      label: "예약 주문",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      deal: {
        rank: 6,
        iconClassName: "bg-slate-100 text-slate-700",
      },
    },
  },
  {
    id: "portable-speaker",
    slug: "portable-speaker",
    category: "audio",
    name: "Portable Speaker",
    description: "어디서든 즐기는 콤팩트 오디오.",
    icon: "speaker",
    pricing: {
      currentKrw: 169_000,
      oldKrw: 199_000,
    },
    inventory: {
      status: "in-stock",
      quantity: 18,
      label: "재고 18개",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      deal: {
        rank: 7,
        iconClassName: "bg-indigo-50 text-indigo-700",
        isExtra: true,
      },
    },
  },
  {
    id: "fast-charger",
    slug: "fast-charger",
    category: "accessory",
    name: "Fast Charger",
    description: "일상에서 바로 쓰기 좋은 필수 충전 액세서리.",
    icon: "battery-charging",
    pricing: {
      currentKrw: 49_000,
      oldKrw: 59_000,
    },
    inventory: {
      status: "in-stock",
      quantity: 22,
      label: "재고 22개",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      deal: {
        rank: 8,
        iconClassName: "bg-lime-50 text-lime-700",
        isExtra: true,
      },
    },
  },
  {
    id: "premium-cable-kit",
    slug: "premium-cable-kit",
    category: "accessory",
    name: "Premium Cable Kit",
    description: "다양한 기기에 맞춰 쓰는 프리미엄 케이블 세트.",
    icon: "cable",
    pricing: {
      currentKrw: 89_000,
      oldKrw: 109_000,
    },
    inventory: {
      status: "limited",
      quantity: 6,
      label: "재고 6개",
    },
    payments: {
      methods: ["card", "usdt"],
      networks: ["TRC20", "ERC20"],
    },
    storefront: {
      deal: {
        rank: 9,
        iconClassName: "bg-fuchsia-50 text-fuchsia-700",
        isExtra: true,
      },
    },
  },
];

function isFeaturedProduct(
  product: CatalogProduct,
): product is FeaturedCatalogProduct {
  return product.storefront.featured !== undefined;
}

function isDealProduct(product: CatalogProduct): product is DealCatalogProduct {
  return product.storefront.deal !== undefined;
}

export async function getStorefrontCatalog(): Promise<StorefrontCatalog> {
  const featuredProducts = productCatalog
    .filter(isFeaturedProduct)
    .sort((left, right) => left.storefront.featured.rank - right.storefront.featured.rank);

  const dealProducts = productCatalog
    .filter(isDealProduct)
    .sort((left, right) => left.storefront.deal.rank - right.storefront.deal.rank);

  return {
    featuredProducts,
    dealProducts,
  };
}
