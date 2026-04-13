"use client";

import {
  BadgeCheck,
  BatteryCharging,
  Cable,
  Clock3,
  Coins,
  Headphones,
  Keyboard,
  Laptop,
  MessageSquare,
  Monitor,
  Mouse,
  Network,
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
import { useEffect, useState } from "react";
import {
  checkoutNoticeItems,
  checkoutSteps,
  dealCards,
  faqItems,
  featureCards,
  featuredProducts,
  heroChips,
  trustNoticeItems,
  trustPolicyItems,
  type DealCard,
  type IconKey,
  type ProductCard,
} from "@/lib/storefront-data";

const FALLBACK_RATE = 1502;
const RATE_REFRESH_INTERVAL_MS = 30_000;
const QUOTE_WINDOW_MINUTES = 10;

const krwFormatter = new Intl.NumberFormat("ko-KR");
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

function formatUsdt(value: number, rate: number) {
  return `≈ ${usdtFormatter.format(value / rate)} USDT`;
}

function discountPercent(currentKrw: number, oldKrw: number) {
  return Math.round((1 - currentKrw / oldKrw) * 100);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchLiveRate(): Promise<LiveRatePayload> {
  try {
    const upbit = await fetchJson<UpbitTicker[]>(
      "https://api.upbit.com/v1/ticker?markets=KRW-USDT",
    );
    const ticker = Array.isArray(upbit) ? upbit[0] : undefined;
    const rate = Number(ticker?.trade_price);

    if (Number.isFinite(rate) && rate > 0) {
      return {
        rate,
        source: "Upbit KRW-USDT",
        updatedAt: Number(ticker?.trade_timestamp) || Date.now(),
      };
    }
  } catch {
    // Fall through to CoinGecko.
  }

  const coinGecko = await fetchJson<CoinGeckoPayload>(
    "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=krw&include_last_updated_at=true",
  );
  const rate = Number(coinGecko?.tether?.krw);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Failed to load live rate");
  }

  return {
    rate,
    source: "CoinGecko USDT/KRW",
    updatedAt: Number(coinGecko?.tether?.last_updated_at)
      ? Number(coinGecko.tether?.last_updated_at) * 1000
      : Date.now(),
  };
}

function IconRenderer({
  icon,
  className = "h-5 w-5",
}: {
  icon: IconKey;
  className?: string;
}) {
  const Icon = iconMap[icon];
  return <Icon className={className} strokeWidth={2.1} />;
}

function PriceSummary({
  currentKrw,
  oldKrw,
  rate,
}: {
  currentKrw: number;
  oldKrw: number;
  rate: number;
}) {
  return (
    <div className="mt-4 rounded-3xl bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-400 line-through">{formatKrw(oldKrw)}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">
        {formatKrw(currentKrw)}
      </p>
      <p className="mt-1 text-sm font-medium text-emerald-700">
        {formatUsdt(currentKrw, rate)}
      </p>
    </div>
  );
}

function FeaturedCard({
  product,
  rate,
}: {
  product: ProductCard;
  rate: number;
}) {
  return (
    <article className="product-card glass section-card p-4 md:p-5">
      <div
        className={`thumb flex items-end justify-between rounded-[26px] bg-gradient-to-br p-6 text-white ${product.gradientClassName}`}
      >
        <div className="space-y-2">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white/85">
            {product.badge}
          </span>
          <p className="text-sm text-white/70">USDT 결제</p>
        </div>
        <div className="thumb-icon text-slate-950">
          <IconRenderer icon={product.icon} className="h-[38px] w-[38px]" />
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{product.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{product.description}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {discountPercent(product.currentKrw, product.oldKrw)}% OFF
        </span>
      </div>

      <PriceSummary
        currentKrw={product.currentKrw}
        oldKrw={product.oldKrw}
        rate={rate}
      />
    </article>
  );
}

function DealCardView({ deal, rate }: { deal: DealCard; rate: number }) {
  return (
    <article className="glass rounded-[24px] p-4">
      <div className={`mb-4 inline-flex rounded-2xl p-3 ${deal.iconClassName}`}>
        <IconRenderer icon={deal.icon} />
      </div>
      <h3 className="text-base font-semibold text-slate-950">{deal.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{deal.description}</p>
      <PriceSummary currentKrw={deal.currentKrw} oldKrw={deal.oldKrw} rate={rate} />
    </article>
  );
}

export function StorefrontPage() {
  const [currentRate, setCurrentRate] = useState(FALLBACK_RATE);
  const [rateMeta, setRateMeta] = useState("실시간 환율을 불러오는 중...");
  const [dealsExpanded, setDealsExpanded] = useState(false);

  useEffect(() => {
    let disposed = false;

    const refreshRate = async () => {
      setRateMeta("실시간 환율을 확인하는 중...");

      try {
        const payload = await fetchLiveRate();
        if (disposed) {
          return;
        }

        setCurrentRate(payload.rate);
        setRateMeta(
          `${payload.source} 기준 · ${timeFormatter.format(new Date(payload.updatedAt))} 업데이트`,
        );
      } catch {
        if (disposed) {
          return;
        }

        setRateMeta("실시간 연결이 불안정해 기본 환율로 표시 중");
      }
    };

    void refreshRate();
    const intervalId = window.setInterval(() => {
      void refreshRate();
    }, RATE_REFRESH_INTERVAL_MS);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const visibleDeals = dealsExpanded
    ? dealCards
    : dealCards.filter((deal) => !deal.isExtra);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[rgba(250,248,243,0.86)] backdrop-blur-xl">
        <div className="shell flex items-center justify-between gap-4 py-4">
          <a href="#top" className="flex items-center gap-3 text-sm font-semibold text-slate-900">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
              <IconRenderer icon="coins" />
            </span>
            <span>
              Crypto Commerce
              <span className="block text-xs font-medium text-slate-500">USDT Direct Pay</span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#featured">인기 상품</a>
            <a href="#checkout">결제 안내</a>
            <a href="#trust">운영 정책</a>
            <a href="#faq">FAQ</a>
          </nav>
        </div>
      </header>

      <main id="top" className="pb-16 pt-8 md:pb-24 md:pt-10">
        <section className="shell hero-grid">
          <div className="glass section-card hero-panel p-7 md:p-10">
            <div className="mb-5 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              USDT Direct Checkout
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
              환전 없이 바로 결제하는
              <span className="text-emerald-700"> 디지털 쇼핑몰</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              웹 쇼핑몰에서 실시간 환율을 확인하고, USDT 기준 예상 결제 금액을 빠르게 비교해볼 수 있는
              테스트용 스토어프론트입니다. 지금은 UI 검증이 목적이기 때문에 결제 모듈 없이 화면 흐름과
              콘텐츠 설계에 집중했습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#featured"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                상품 보기
              </a>
              <a
                href="#checkout"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
              >
                결제 안내 보기
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {heroChips.map((chip) => (
                <div key={chip.label} className="chip">
                  <IconRenderer icon={chip.icon} className="h-[18px] w-[18px]" />
                  <span>{chip.isDynamic ? `견적 고정 ${QUOTE_WINDOW_MINUTES}분` : chip.label}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="glass section-card p-6 md:p-7">
            <div className="rounded-[24px] bg-slate-950 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-emerald-300">Live Rate</p>
                  <h2 className="mt-2 text-2xl font-semibold">실시간 참고 환율</h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                  Live
                </span>
              </div>
              <div className="mt-6 rounded-3xl bg-white/6 p-5">
                <p className="text-sm text-white/70">실시간 참고 환율</p>
                <p className="mt-2 text-3xl font-semibold">1 USDT = ₩{krwFormatter.format(currentRate)}</p>
                <p className="mt-2 text-xs text-white/50">{rateMeta}</p>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  실제 결제 금액은 체크아웃 단계에서 다시 안내되며, 네트워크와 주소 확인 후 주문이 확정됩니다.
                </p>
              </div>
              <ul className="feature-list mt-6 space-y-4 text-sm leading-6 text-white/80">
                {trustNoticeItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        <section className="shell mt-8 grid gap-4 md:grid-cols-4">
          {featureCards.map((feature) => (
            <article key={feature.title} className="glass section-card p-5">
              <div className={`mb-3 inline-flex rounded-2xl p-3 ${feature.iconClassName}`}>
                <IconRenderer icon={feature.icon} />
              </div>
              <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </section>

        <section id="featured" className="shell mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Featured</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">인기 상품</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                실시간 환율을 기준으로 예상 결제 금액을 확인할 수 있는 대표 상품입니다.
              </p>
            </div>
          </div>
          <div className="product-rail">
            {featuredProducts.map((product) => (
              <FeaturedCard key={product.name} product={product} rate={currentRate} />
            ))}
          </div>
        </section>

        <section className="shell mt-16">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass section-card p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-600">Hot deals</p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">오늘의 특가</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    자주 함께 보는 액세서리와 주변기기를 묶어서 확인할 수 있습니다.
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
                {visibleDeals.map((deal) => (
                  <DealCardView key={deal.name} deal={deal} rate={currentRate} />
                ))}
              </div>
            </div>

            <aside id="trust" className="glass section-card p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Trust &amp; Policy</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">안심 결제를 위한 안내</h2>
              <ul className="policy-list mt-6 space-y-4 text-sm leading-7 text-slate-600">
                {trustPolicyItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-7 rounded-[26px] bg-slate-950 p-5 text-white">
                <p className="text-sm font-semibold text-emerald-300">주문 전 확인 사항</p>
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Checkout guide</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">USDT 결제는 이렇게 진행됩니다</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                실제 운영 전 테스트 단계에서도 결제 흐름과 확인 포인트를 미리 점검할 수 있도록 구성했습니다.
              </p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-5">
              {checkoutSteps.map((step) => (
                <article
                  key={step.step}
                  className="rounded-[24px] border border-slate-200 bg-white p-5"
                >
                  <p className="text-sm font-semibold text-emerald-700">Step {step.step}</p>
                  <h3 className="mt-2 font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <IconRenderer icon="triangle-alert" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">결제 전에 꼭 확인해 주세요</h3>
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">FAQ</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">자주 묻는 질문</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                결제 금액 산정, 네트워크 확인, 주문 상태 같은 핵심 질문을 테스트 단계에서도 바로 검토할 수 있게 정리했습니다.
              </p>
            </div>
            <div className="space-y-4">
              {faqItems.map((faq) => (
                <details key={faq.question} className="faq-card glass section-card p-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-4">
                    <span className="font-semibold text-slate-950">{faq.question}</span>
                    <span className="text-sm text-slate-400">열기</span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{faq.answer}</p>
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
            <p className="mt-1">실시간 참고 환율을 바탕으로 UI와 구매 흐름을 테스트하는 Next.js 쇼핑몰 샘플입니다.</p>
          </div>
          <p>© {new Date().getFullYear()} Crypto Commerce</p>
        </div>
      </footer>
    </>
  );
}
