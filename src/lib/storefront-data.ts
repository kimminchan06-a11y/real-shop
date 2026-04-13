export type IconKey =
  | "badge-check"
  | "battery-charging"
  | "cable"
  | "clock-3"
  | "coins"
  | "headphones"
  | "keyboard"
  | "laptop"
  | "message-square"
  | "monitor"
  | "mouse"
  | "network"
  | "receipt"
  | "shield-check"
  | "smartphone"
  | "speaker"
  | "tablet"
  | "triangle-alert"
  | "wallet"
  | "watch";

export type HeroChip = {
  icon: IconKey;
  label: string;
  isDynamic?: boolean;
};

export type FeatureCard = {
  icon: IconKey;
  iconClassName: string;
  title: string;
  description: string;
};

export type ProductCard = {
  name: string;
  description: string;
  badge: string;
  icon: IconKey;
  currentKrw: number;
  oldKrw: number;
  gradientClassName: string;
};

export type DealCard = {
  name: string;
  description: string;
  icon: IconKey;
  iconClassName: string;
  currentKrw: number;
  oldKrw: number;
  isExtra?: boolean;
};

export type CheckoutStep = {
  step: number;
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const heroChips: HeroChip[] = [
  { icon: "badge-check", label: "견적 고정 10분", isDynamic: true },
  { icon: "wallet", label: "지원 네트워크: TRC20 / ERC20" },
  { icon: "message-square", label: "입금 확인 후 주문 확정" },
];

export const featureCards: FeatureCard[] = [
  {
    icon: "clock-3",
    iconClassName: "bg-emerald-50 text-emerald-700",
    title: "견적 고정 시간",
    description:
      "실시간 시세를 반영한 결제 금액을 일정 시간 동안 고정해 안내합니다.",
  },
  {
    icon: "network",
    iconClassName: "bg-amber-50 text-amber-700",
    title: "지원 네트워크 구분",
    description:
      "TRC20과 ERC20 지원 여부를 명확하게 표시해 결제를 더 안전하게 돕습니다.",
  },
  {
    icon: "shield-check",
    iconClassName: "bg-sky-50 text-sky-700",
    title: "안심 결제 안내",
    description:
      "결제 전 확인해야 할 핵심 정보를 정리해 처음 방문한 고객도 쉽게 이해할 수 있습니다.",
  },
  {
    icon: "receipt",
    iconClassName: "bg-rose-50 text-rose-700",
    title: "주문 상태 확인",
    description:
      "입금 확인부터 주문 확정까지 진행 상황을 한눈에 확인할 수 있습니다.",
  },
];

export const featuredProducts: ProductCard[] = [
  {
    name: "iPhone 15 Pro",
    description: "프리미엄 스마트폰을 USDT로 빠르게 결제하세요.",
    badge: "즉시 견적 가능",
    icon: "smartphone",
    currentKrw: 1_349_000,
    oldKrw: 1_499_000,
    gradientClassName: "from-slate-950 via-slate-800 to-emerald-700",
  },
  {
    name: "iPad Air",
    description: "가벼운 작업과 엔터테인먼트를 위한 인기 태블릿.",
    badge: "재고 문의 가능",
    icon: "tablet",
    currentKrw: 809_000,
    oldKrw: 899_000,
    gradientClassName: "from-cyan-700 via-sky-600 to-slate-900",
  },
  {
    name: "MacBook Air",
    description: "실시간 시세 기준으로 예상 결제 금액을 확인할 수 있습니다.",
    badge: "실시간 금액 반영",
    icon: "laptop",
    currentKrw: 1_529_000,
    oldKrw: 1_699_000,
    gradientClassName: "from-amber-500 via-orange-500 to-slate-900",
  },
  {
    name: "Galaxy S24 Ultra",
    description: "강력한 성능과 선명한 디스플레이를 담은 플래그십 모델.",
    badge: "빠른 주문 가능",
    icon: "smartphone",
    currentKrw: 1_439_000,
    oldKrw: 1_599_000,
    gradientClassName: "from-violet-700 via-indigo-700 to-slate-900",
  },
  {
    name: "Galaxy Tab S9",
    description: "합리적인 가격으로 즐기는 프리미엄 태블릿 경험.",
    badge: "합리적 USDT 견적",
    icon: "monitor",
    currentKrw: 989_000,
    oldKrw: 1_099_000,
    gradientClassName: "from-emerald-700 via-teal-700 to-slate-900",
  },
];

export const dealCards: DealCard[] = [
  {
    name: "AirPods",
    description: "매일 사용하는 인기 무선 이어폰.",
    icon: "headphones",
    iconClassName: "bg-rose-50 text-rose-700",
    currentKrw: 299_000,
    oldKrw: 359_000,
  },
  {
    name: "Buds 2",
    description: "가볍고 편안한 데일리 무선 이어버드.",
    icon: "headphones",
    iconClassName: "bg-sky-50 text-sky-700",
    currentKrw: 169_000,
    oldKrw: 199_000,
  },
  {
    name: "Keyboard",
    description: "심플한 작업 환경을 위한 베스트셀러 키보드.",
    icon: "keyboard",
    iconClassName: "bg-amber-50 text-amber-700",
    currentKrw: 129_000,
    oldKrw: 149_000,
  },
  {
    name: "Mouse",
    description: "기본기 탄탄한 무선 마우스 특가.",
    icon: "mouse",
    iconClassName: "bg-emerald-50 text-emerald-700",
    currentKrw: 119_000,
    oldKrw: 139_000,
  },
  {
    name: "Beats Speaker",
    description: "풍부한 사운드를 담은 포터블 스피커.",
    icon: "speaker",
    iconClassName: "bg-violet-50 text-violet-700",
    currentKrw: 349_000,
    oldKrw: 399_000,
  },
  {
    name: "Smart Watch",
    description: "운동과 일상을 함께 챙기는 스마트 워치.",
    icon: "watch",
    iconClassName: "bg-slate-100 text-slate-700",
    currentKrw: 389_000,
    oldKrw: 429_000,
  },
  {
    name: "Portable Speaker",
    description: "어디서든 즐기는 콤팩트 오디오.",
    icon: "speaker",
    iconClassName: "bg-indigo-50 text-indigo-700",
    currentKrw: 169_000,
    oldKrw: 199_000,
    isExtra: true,
  },
  {
    name: "Fast Charger",
    description: "일상에서 바로 쓰기 좋은 필수 충전 액세서리.",
    icon: "battery-charging",
    iconClassName: "bg-lime-50 text-lime-700",
    currentKrw: 49_000,
    oldKrw: 59_000,
    isExtra: true,
  },
  {
    name: "Premium Cable Kit",
    description: "다양한 기기에 맞춰 쓰는 프리미엄 케이블 세트.",
    icon: "cable",
    iconClassName: "bg-fuchsia-50 text-fuchsia-700",
    currentKrw: 89_000,
    oldKrw: 109_000,
    isExtra: true,
  },
];

export const trustPolicyItems = [
  "실시간 참고 환율을 바탕으로 예상 결제 금액을 확인할 수 있습니다.",
  "최종 결제 금액과 전송 주소는 체크아웃 단계에서 다시 안내됩니다.",
  "지원 네트워크를 분명하게 표시해 안전한 결제를 도와드립니다.",
  "입금 후 주문 상태를 확인하고 필요한 경우 고객지원으로 문의할 수 있습니다.",
];

export const trustNoticeItems = [
  "실시간 참고 환율과 예상 결제 금액을 확인해 주세요.",
  "지원 네트워크와 전송 주소는 체크아웃에서 다시 확인해 주세요.",
  "입금 후 주문 상태는 순서대로 업데이트됩니다.",
  "결제 중 문제가 생기면 고객지원을 통해 빠르게 확인할 수 있습니다.",
];

export const checkoutSteps: CheckoutStep[] = [
  {
    step: 1,
    title: "상품 선택",
    description: "상품과 수량을 고른 뒤 체크아웃으로 이동합니다.",
  },
  {
    step: 2,
    title: "네트워크 확인",
    description: "TRC20, ERC20 중 지원되는 체인과 주소를 명확히 확인합니다.",
  },
  {
    step: 3,
    title: "견적 고정",
    description: "기준 환율과 수수료를 반영한 최종 금액이 일정 시간 동안 유지됩니다.",
  },
  {
    step: 4,
    title: "USDT 전송",
    description: "주소와 금액을 정확히 복사해서 전송하고 TXID를 저장합니다.",
  },
  {
    step: 5,
    title: "주문 확정",
    description: "입금 확인 후 주문 상태가 순서대로 업데이트됩니다.",
  },
];

export const checkoutNoticeItems = [
  "결제 전 체크아웃 화면에서 최종 금액과 전송 주소를 다시 확인해 주세요.",
  "지원되지 않는 네트워크로 전송할 경우 주문 확인이 지연될 수 있습니다.",
  "입금 후 주문 상태가 바로 갱신되지 않으면 고객지원으로 문의해 주세요.",
];

export const faqItems: FaqItem[] = [
  {
    question: "결제 금액은 언제 확정되나요?",
    answer:
      "메인 페이지에서는 실시간 참고 환율 기준 예상 금액을 안내하며, 최종 결제 금액은 체크아웃 단계에서 확정됩니다.",
  },
  {
    question: "어떤 네트워크로 결제할 수 있나요?",
    answer:
      "현재 지원 네트워크는 TRC20과 ERC20이며, 상품별 결제 단계에서 전송 주소와 함께 다시 확인할 수 있습니다.",
  },
  {
    question: "입금 후 주문은 어떻게 확인하나요?",
    answer:
      "입금이 확인되면 주문 상태가 순서대로 업데이트되며, 진행이 지연될 경우 고객지원으로 바로 문의할 수 있습니다.",
  },
];
