"use client";

import {
  BadgeCheck,
  BatteryCharging,
  Cable,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coins,
  Headphones,
  Keyboard,
  Laptop,
  MessageSquare,
  Monitor,
  Mouse,
  Network,
  Plus,
  Receipt,
  ShieldCheck,
  Smartphone,
  Speaker,
  Tablet,
  TriangleAlert,
  Wallet,
  Watch,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import {
  type DealCatalogProduct,
  type FeaturedCatalogProduct,
  type PaymentMethod,
  type StorefrontCatalog,
} from "@/lib/product-catalog";
import {
  checkoutNoticeItems,
  checkoutSteps,
  faqItems,
  featureCards,
  heroChips,
  trustNoticeItems,
  trustPolicyItems,
  type IconKey,
} from "@/lib/storefront-data";

const FALLBACK_RATE = 1502;
const RATE_REFRESH_INTERVAL_MS = 30_000;
const CAROUSEL_AUTOPLAY_INTERVAL_MS = 4_500;
const QUOTE_WINDOW_MINUTES = 10;

const krwFormatter = new Intl.NumberFormat("ko-KR");
const rateFormatter = new Intl.NumberFormat("ko-KR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const usdtFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const iconMap: Record<IconKey, LucideIcon> = {
  "badge-check": BadgeCheck,
  "battery-charging": BatteryCharging,
  cable: Cable,
  "clock-3": Clock3,
  coins: Coins,
  headphones: Headphones,
  keyboard: Keyboard,
  laptop: Laptop,
  "message-square": MessageSquare,
  monitor: Monitor,
  mouse: Mouse,
  network: Network,
  receipt: Receipt,
  "shield-check": ShieldCheck,
  smartphone: Smartphone,
  speaker: Speaker,
  tablet: Tablet,
  "triangle-alert": TriangleAlert,
  wallet: Wallet,
  watch: Watch,
};

type LiveRatePayload = {
  rate: number;
  source: string;
  updatedAt: number;
};

type UpbitTicker = {
  trade_price?: number;
  trade_timestamp?: number;
};

type CoinGeckoPayload = {
  tether?: {
    krw?: number;
    last_updated_at?: number;
  };
};

function formatKrw(value: number) {
  return `₩${krwFormatter.format(value)}`;
}

function formatUsdt(value: number) {
  return `≈ ${usdtFormatter.format(value)} USDT`;
}

function getSavingsPercent(currentKrw: number, oldKrw: number) {
  return Math.round((1 - currentKrw / oldKrw) * 100);
}

function formatPaymentMethods(methods: PaymentMethod[]) {
  return methods
    .map((method) => (method === "card" ? "카드" : "USDT"))
    .join(" · ");
}

function getInventoryBadgeClass(
  status: FeaturedCatalogProduct["inventory"]["status"],
) {
  switch (status) {
    case "in-stock":
      return "bg-emerald-50 text-emerald-700";
    case "limited":
      return "bg-amber-50 text-amber-700";
    case "preorder":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function scrollProductRail(rail: HTMLDivElement | null, direction: number) {
  if (!rail) {
    return;
  }

  const firstCard = rail.querySelector<HTMLElement>(".product-card");
  const amount = firstCard
    ? firstCard.getBoundingClientRect().width + 16
    : rail.clientWidth * 0.8;
  const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
  const isAtStart = rail.scrollLeft <= 8;
  const isAtEnd = rail.scrollLeft >= maxScrollLeft - 8;

  if (direction > 0 && isAtEnd) {
    rail.scrollTo({
      left: 0,
      behavior: "smooth",
    });
    return;
  }

  if (direction < 0 && isAtStart) {
    rail.scrollTo({
      left: maxScrollLeft,
      behavior: "smooth",
    });
    return;
  }

  rail.scrollTo({
    left: Math.min(maxScrollLeft, Math.max(0, rail.scrollLeft + direction * amount)),
    behavior: "smooth",
  });
}

async function fetchJsonWithTimeout<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(url, {
      ...options,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchUpbitRate(): Promise<LiveRatePayload> {
  const payload = await fetchJsonWithTimeout<UpbitTicker[]>(
    "https://api.upbit.com/v1/ticker?markets=KRW-USDT",
  );
  const ticker = Array.isArray(payload) ? payload[0] : undefined;
  const rate = Number(ticker?.trade_price);
  const updatedAt = Number(ticker?.trade_timestamp) || Date.now();

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Invalid Upbit rate");
  }

  return {
    rate,
    source: "Upbit KRW-USDT",
    updatedAt,
  };
}

async function fetchCoinGeckoRate(): Promise<LiveRatePayload> {
  const payload = await fetchJsonWithTimeout<CoinGeckoPayload>(
    "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=krw&include_last_updated_at=true",
  );
  const rate = Number(payload?.tether?.krw);
  const updatedAt = Number(payload?.tether?.last_updated_at)
    ? Number(payload.tether?.last_updated_at) * 1000
    : Date.now();

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Invalid CoinGecko rate");
  }

  return {
    rate,
    source: "CoinGecko USDT/KRW",
    updatedAt,
  };
}

function IconRenderer({
  icon,
  className,
}: {
  icon: IconKey;
  className?: string;
}) {
  const Icon = iconMap[icon];
  return <Icon className={className ?? "h-5 w-5"} strokeWidth={2.1} />;
}

function PriceSummary({
  currentKrw,
  oldKrw,
  rate,
  compact = false,
}: {
  currentKrw: number;
  oldKrw: number;
  rate: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mt-4" : "mt-4 rounded-3xl bg-slate-50 px-4 py-3"}>
      <p className="text-xs text-slate-400 line-through">{formatKrw(oldKrw)}</p>
      <p
        className={
          compact
            ? "mt-1 font-semibold text-slate-900"
            : "mt-1 text-xl font-semibold text-slate-950"
        }
      >
        {formatKrw(currentKrw)}
      </p>
      <p className="mt-1 text-sm font-medium text-emerald-700">
        {formatUsdt(currentKrw / rate)}
      </p>
    </div>
  );
}

function FeaturedProductCard({
  product,
  rate,
}: {
  product: FeaturedCatalogProduct;
  rate: number;
}) {
  const featuredDisplay = product.storefront.featured;

  return (
    <article className="product-card glass section-card p-4 md:p-5">
      <div
        className={`thumb flex items-end justify-between rounded-[26px] bg-gradient-to-br p-6 text-white ${featuredDisplay.gradientClassName}`}
      >
        <div className="space-y-2">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white/85">
            {featuredDisplay.badge}
          </span>
          <p className="text-sm text-white/70">
            {formatPaymentMethods(product.payments.methods)} 결제
          </p>
        </div>
        <div className="thumb-icon text-slate-950">
          <IconRenderer icon={product.icon} className="h-[38px] w-[38px]" />
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{product.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{product.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getInventoryBadgeClass(product.inventory.status)}`}
            >
              {product.inventory.label}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {product.payments.networks.join(" / ")}
            </span>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {getSavingsPercent(product.pricing.currentKrw, product.pricing.oldKrw)}%{" "}
          절약
        </span>
      </div>

      <PriceSummary
        currentKrw={product.pricing.currentKrw}
        oldKrw={product.pricing.oldKrw}
        rate={rate}
      />

      <a
        href="#checkout"
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        결제 단계 확인
      </a>
    </article>
  );
}

function DealProductCard({
  deal,
  rate,
  isHidden,
}: {
  deal: DealCatalogProduct;
  rate: number;
  isHidden: boolean;
}) {
  const dealDisplay = deal.storefront.deal;

  return (
    <article
      className={`glass rounded-[24px] p-4 ${isHidden ? "hidden" : ""}`}
      aria-hidden={isHidden}
    >
      <div
        className={`mb-4 inline-flex rounded-2xl p-3 ${dealDisplay.iconClassName}`}
      >
        <IconRenderer icon={deal.icon} />
      </div>
      <h3 className="text-base font-semibold text-slate-950">{deal.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{deal.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${getInventoryBadgeClass(deal.inventory.status)}`}
        >
          {deal.inventory.label}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {formatPaymentMethods(deal.payments.methods)}
        </span>
      </div>
      <PriceSummary
        compact
        currentKrw={deal.pricing.currentKrw}
        oldKrw={deal.pricing.oldKrw}
        rate={rate}
      />
    </article>
  );
}

export function StorefrontPage({
  storefrontCatalog,
}: {
  storefrontCatalog: StorefrontCatalog;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const rateRequestInFlightRef = useRef(false);
  const { featuredProducts, dealProducts } = storefrontCatalog;

  const [currentRate, setCurrentRate] = useState(FALLBACK_RATE);
  const [rateMeta, setRateMeta] = useState("실시간 환율을 불러오는 중...");
  const [dealsExpanded, setDealsExpanded] = useState(false);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const hasCarouselControls = featuredProducts.length > 1;

  const scrollCarousel = (direction: number) => {
    if (!hasCarouselControls) {
      return;
    }

    scrollProductRail(railRef.current, direction);
  };

  const applyLiveRate = useEffectEvent((payload: LiveRatePayload) => {
    setCurrentRate(payload.rate);
    setRateMeta(
      `${payload.source} 기준 · ${timeFormatter.format(new Date(payload.updatedAt))} 업데이트`,
    );
  });

  const applyFallbackRate = useEffectEvent(() => {
    setRateMeta("실시간 조회 실패 · 마지막 기준값 표시");
  });

  const refreshLiveRate = useEffectEvent(async () => {
    if (rateRequestInFlightRef.current) {
      return;
    }

    rateRequestInFlightRef.current = true;
    setRateMeta("실시간 환율을 확인하는 중...");

    try {
      const payload = await fetchUpbitRate().catch(() => fetchCoinGeckoRate());
      applyLiveRate(payload);
    } catch (error) {
      console.error("Failed to refresh live rate", error);
      applyFallbackRate();
    } finally {
      rateRequestInFlightRef.current = false;
    }
  });

  useEffect(() => {
    void refreshLiveRate();

    const intervalId = window.setInterval(() => {
      void refreshLiveRate();
    }, RATE_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!hasCarouselControls) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (!isCarouselPaused) {
        scrollProductRail(railRef.current, 1);
      }
    }, CAROUSEL_AUTOPLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasCarouselControls, isCarouselPaused]);

  const handleCarouselBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsCarouselPaused(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[rgba(250,248,243,0.86)] backdrop-blur-xl">
        <div className="shell flex items-center justify-between gap-4 py-4">
          <a
            href="#top"
            className="flex items-center gap-3 text-sm font-semibold text-slate-900"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
              <IconRenderer icon="coins" />
            </span>
            <span>
              Crypto Commerce
              <span className="block text-xs font-medium text-slate-500">
                Card + Crypto Pay
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#featured" className="transition hover:text-slate-950">
              인기 상품
            </a>
            <a href="#checkout" className="transition hover:text-slate-950">
              결제 안내
            </a>
            <a href="#trust" className="transition hover:text-slate-950">
              운영 정책
            </a>
            <a href="#faq" className="transition hover:text-slate-950">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#faq"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              자주 묻는 질문
            </a>
            <a
              href="#trust"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              고객지원 / 정책
            </a>
          </div>
        </div>
      </header>

      <main id="top" className="pb-16 pt-8 md:pb-24 md:pt-10">
        <section className="shell hero-grid">
          <div className="glass section-card hero-panel p-7 md:p-10">
            <div className="mb-5 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Card + Crypto Checkout
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
              환전 없이 빠르고 안전하게{" "}
              <span className="text-emerald-700">결제하세요</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              원하는 상품을 선택하고 카드 또는 USDT로 간편하게 결제하세요.
              실시간 환율, 지원 네트워크, 주문 진행 상태를 한 화면에서 확인할 수
              있어 처음 이용하는 고객도 빠르고 편하게 결제를 진행할 수
              있습니다.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#featured"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800 hover:!text-white"
              >
                상품 보기
              </a>
              <a
                href="#checkout"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
              >
                결제 흐름 보기
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {heroChips.map((chip) => (
                <div key={chip.label} className="chip">
                  <IconRenderer icon={chip.icon} className="h-[18px] w-[18px]" />
                  <span>
                    {chip.isDynamic
                      ? `견적 고정 ${QUOTE_WINDOW_MINUTES}분`
                      : chip.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="glass section-card p-6 md:p-7">
            <div className="rounded-[24px] bg-slate-950 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-emerald-300">
                    Live Rate
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    결제 전에 꼭 확인하세요
                  </h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                  Live
                </span>
              </div>

              <div className="mt-6 rounded-3xl bg-white/6 p-5">
                <p className="text-sm text-white/70">실시간 참고 환율</p>
                <p className="mt-2 text-3xl font-semibold">
                  1 USDT = ₩{rateFormatter.format(currentRate)}
                </p>
                <p className="mt-2 text-xs text-white/50">{rateMeta}</p>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  실제 결제 금액은 체크아웃 단계에서 최종 확정됩니다. 결제 전
                  실시간 참고 환율과 견적 고정 시간을 함께 확인해 주세요.
                </p>
              </div>

              <ul className="feature-list mt-6 space-y-4 text-sm leading-6 text-white/80">
                <li>
                  체크아웃에서 상품별 최종 결제 금액과 전송 주소를 다시 확인할
                  수 있습니다.
                </li>
                <li>
                  지원 네트워크를 명확하게 안내해 오송금 위험을 줄였습니다.
                </li>
                <li>
                  입금 후 주문 상태를 순서대로 확인할 수 있어 진행 상황이
                  명확합니다.
                </li>
              </ul>
            </div>
          </aside>
        </section>

        <section className="shell mt-8 grid gap-4 md:grid-cols-4">
          {featureCards.map((feature) => (
            <article key={feature.title} className="glass section-card p-5">
              <div
                className={`mb-3 inline-flex rounded-2xl p-3 ${feature.iconClassName}`}
              >
                <IconRenderer icon={feature.icon} />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {feature.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </section>

        <section id="featured" className="shell mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Featured
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-semibold text-slate-950">
                  인기 상품
                </h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  자동 순환
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                카드 결제와 실시간 예상 USDT 금액을 함께 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            onFocusCapture={() => setIsCarouselPaused(true)}
            onBlurCapture={handleCarouselBlur}
          >
            {hasCarouselControls ? (
              <>
                <button
                  type="button"
                  aria-label="이전 상품 보기"
                  onClick={() => scrollCarousel(-1)}
                  className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-300 bg-white/95 p-3 text-slate-900 shadow-lg shadow-slate-900/10 transition hover:border-slate-400 hover:bg-white md:inline-flex"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="다음 상품 보기"
                  onClick={() => scrollCarousel(1)}
                  className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-300 bg-white/95 p-3 text-slate-900 shadow-lg shadow-slate-900/10 transition hover:border-slate-400 hover:bg-white md:inline-flex"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}

            <div ref={railRef} className="product-rail">
              {featuredProducts.map((product) => (
                <FeaturedProductCard
                  key={product.id}
                  product={product}
                  rate={currentRate}
                />
              ))}
            </div>

            {hasCarouselControls ? (
              <div className="mt-4 flex justify-center gap-3 md:hidden">
                <button
                  type="button"
                  aria-label="이전 상품 보기"
                  onClick={() => scrollCarousel(-1)}
                  className="rounded-full border border-slate-300 bg-white p-3 text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="다음 상품 보기"
                  onClick={() => scrollCarousel(1)}
                  className="rounded-full border border-slate-300 bg-white p-3 text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="shell mt-16">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass section-card p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-600">
                    Hot deals
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                    오늘의 특가
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    실시간 참고 환율을 기준으로 오늘 주목할 만한 혜택을 한곳에
                    모았습니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDealsExpanded((current) => !current)}
                  className="shrink-0 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {dealsExpanded ? "특가 접기" : "특가 더 보기"}
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {dealProducts.map((deal) => (
                  <DealProductCard
                    key={deal.id}
                    deal={deal}
                    rate={currentRate}
                    isHidden={Boolean(deal.storefront.deal.isExtra && !dealsExpanded)}
                  />
                ))}
              </div>
            </div>

            <aside id="trust" className="glass section-card p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Trust &amp; Policy
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                안심 결제를 위한 안내
              </h2>

              <ul className="policy-list mt-6 space-y-4 text-sm leading-7 text-slate-600">
                {trustPolicyItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="mt-7 rounded-[26px] bg-slate-950 p-5 text-white">
                <p className="text-sm font-semibold text-emerald-300">
                  주문 전 확인 사항
                </p>
                <div className="mt-4 space-y-3 text-sm text-white/75">
                  {trustNoticeItems.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="checkout" className="shell mt-16">
          <div className="glass section-card p-6 md:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Checkout guide
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                USDT 결제는 이렇게 진행됩니다
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                주문부터 결제 완료까지 단계를 명확하게 안내해 처음 이용하는
                고객도 흐름을 쉽게 이해할 수 있도록 구성했습니다.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-5">
              {checkoutSteps.map((step) => (
                <article
                  key={step.step}
                  className="rounded-[24px] border border-slate-200 bg-white p-5"
                >
                  <p className="text-sm font-semibold text-emerald-700">
                    Step {step.step}
                  </p>
                  <h3 className="mt-2 font-semibold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <IconRenderer icon="triangle-alert" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    결제 전 확인해 주세요
                  </h3>
                  <ul className="policy-list mt-4 space-y-3 text-sm leading-7 text-slate-700">
                    {checkoutNoticeItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="shell mt-16">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass section-card p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                FAQ
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                자주 묻는 질문
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                결제 전에 가장 자주 확인하는 내용을 미리 정리했습니다. 필요한
                정보를 빠르게 확인하고 편하게 주문을 진행해 보세요.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((faq) => (
                <details key={faq.question} className="faq-card glass section-card p-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-4">
                    <span className="font-semibold text-slate-950">
                      {faq.question}
                    </span>
                    <Plus className="h-5 w-5 text-slate-500" />
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="shell pb-12 pt-8 text-sm text-slate-500">
        <div className="glass section-card flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-900">Crypto Commerce</p>
            <p className="mt-1">
              카드 결제와 실시간 USDT 안내를 함께 제공하는 결제 중심 스토어
              메인 페이지입니다.
            </p>
          </div>
          <p>© {new Date().getFullYear()} Crypto Commerce</p>
        </div>
      </footer>
    </>
  );
}
