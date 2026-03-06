'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useLang } from '@/components/lang-provider'
import { useSeason } from '@/components/season-provider'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import {
  Snowflake, Sun, Mountain, TreePine, Music2, Beer, Utensils,
  Bike, Waves, ArrowRight, MapPin, Clock, ChevronDown, ChevronUp,
  Cable, Footprints, Camera, Flame, Wind, Dumbbell, Heart,
  Thermometer, Zap, Trophy,
} from 'lucide-react'

const BanskoMap = dynamic(
  () => import('@/components/bansko-map').then(m => m.BanskoMap),
  { ssr: false, loading: () => <div className="w-full rounded-2xl bg-secondary animate-pulse" style={{ height: 420 }} /> }
)

// Reuse the exact same canvas hero background from home page
const HeroCanvas = dynamic(
  () => import('@/components/hero-canvas').then(m => m.HeroCanvas),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-transparent" /> }
)

type Tab = "winter" | "summer";

type SlopeLevel = "green" | "blue" | "red" | "black";

type Slope = {
  name: string;
  level: SlopeLevel;
  km: number;
  lift: string;
};

const SKI_RUNS: Slope[] = [
  { name: "Шилигарника", level: "blue", km: 3.2, lift: "Гондола" },
  { name: "Бъндеришка поляна", level: "red", km: 4.5, lift: "ЛС Бъндерица" },
  { name: "Платото", level: "red", km: 5.1, lift: "ЛС Платото" },
  { name: "Северен склон", level: "black", km: 2.8, lift: "ЛС Тодорка" },
  { name: "Тодорка", level: "black", km: 6.2, lift: "ЛС Тодорка" },
  { name: "Детска писта", level: "green", km: 0.8, lift: "Детски влек" },
];

const LIFTS = [
  { name: 'Гондола', type: 'Кабинкова', capacity: 2400, alt: '1100 → 1940 м' },
  { name: 'ЛС Бъндерица', type: 'Седалкова', capacity: 1800, alt: '1920 → 2480 м' },
  { name: 'ЛС Платото', type: 'Седалкова', capacity: 1800, alt: '2050 → 2560 м' },
  { name: 'ЛС Тодорка', type: 'Седалкова', capacity: 2000, alt: '2200 → 2600 м' },
  { name: 'ЛС Чалин Валог', type: 'Седалкова', capacity: 1600, alt: '1490 → 1910 м' },
]

const SUMMER_TRAILS = [
  { name: 'Банско → Вихрен', duration: '5–6 ч', distance: '14 км', difficulty: 'hard', elevation: '+1200 м',
    desc: { bg: 'Класическият маршрут — минава през Бъндерица и достига до най-високия връх в Пирин (2914 м).', en: 'The classic route — through Banderitsa to Vihren peak (2914 m), highest in Pirin.' } },
  { name: 'Бъндерица → Езерата', duration: '3–4 ч', distance: '9 км', difficulty: 'medium', elevation: '+600 м',
    desc: { bg: 'Семеен преход до ледниковите езера Тевно и Ябълчко. Кристална вода, диви цветя, планинска панорама.', en: 'Family hike to glacial lakes Tevno and Yabalkoto. Crystal water, wildflowers, mountain panorama.' } },
  { name: 'Демянишки водопад', duration: '2–3 ч', distance: '6 км', difficulty: 'easy', elevation: '+350 м',
    desc: { bg: 'Кратък горски преход до живописен 15-метров водопад. Идеален за семейства.', en: 'Short forest hike to a scenic 15m waterfall. Perfect for families.' } },
  { name: 'Тевно езеро', duration: '4–5 ч', distance: '11 км', difficulty: 'medium', elevation: '+900 м',
    desc: { bg: 'Едно от най-красивите ледникови езера в Пирин. Спиращ дъха изглед и кристалночиста вода.', en: 'One of the most beautiful glacial lakes in Pirin. Breathtaking views and crystal clear water.' } },
  { name: 'Полежански водопад', duration: '1–2 ч', distance: '4 км', difficulty: 'easy', elevation: '+200 м',
    desc: { bg: 'Лесна разходка по поречието на река Глазне. Отлично за сутрешни разходки.', en: 'Easy walk along the Glazne river. Great for morning walks.' } },
  { name: 'Вихрен → Кутело', duration: '6–7 ч', distance: '16 км', difficulty: 'hard', elevation: '+1400 м',
    desc: { bg: 'Планинско предизвикателство за опитни туристи — траверс на двата най-високи върха в Пирин.', en: 'Mountain challenge for experienced hikers — traverse of the two highest Pirin peaks.' } },
]

const BARS = [
  { name: 'Happy End Bar', type: 'apreski', desc: { bg: 'Най-популярният апре-ски бар — точно до пистата, жива музика всяка вечер.', en: 'Most popular apres-ski bar — right at the slope, live music nightly.' }, hours: '14:00–03:00' },
  { name: 'Amigos Bar', type: 'apreski', desc: { bg: 'Класически апре-ски с наргиле, коктейли и невероятна атмосфера на тераса.', en: 'Classic apres-ski with hookah, cocktails and great terrace vibes.' }, hours: '12:00–02:00' },
  { name: "Niko's Bar & Grill", type: 'bar', desc: { bg: 'Уютен бар-ресторант в стария град с традиционна кухня и планинска атмосфера.', en: 'Cosy bar-restaurant in the old town with traditional cuisine and mountain atmosphere.' }, hours: '11:00–00:00' },
  { name: 'Underground Club', type: 'club', desc: { bg: 'Подземен клуб с DJ, забавления до зори — тарантинен център за нощния живот в Банско.', en: 'Underground club with DJs and entertainment until dawn — the nightlife hub of Bansko.' }, hours: '22:00–06:00' },
  { name: 'Kasapinova Kashta', type: 'mehana', desc: { bg: 'Автентична механа в 200-годишна сграда. Живата музика, скара и домашна ракия са задължителни.', en: 'Authentic mehana in a 200-year old building. Live folk music, grill and homemade rakia.' }, hours: '18:00–01:00' },
  { name: 'Obshtata Kushta', type: 'mehana', desc: { bg: 'Традиционна крехка кухня, огромна печена скара и уникална пещерна атмосфера.', en: 'Traditional slow-cooked cuisine, huge open grill and unique cave-like atmosphere.' }, hours: '12:00–23:00' },
]

const SUMMER_ACTIVITIES = [
  { icon: Bike, name: { bg: 'МТБ & Колоездене', en: 'MTB & Cycling' }, desc: { bg: 'Специализирани трасета за планинско колоездене в Пирин. Под наем от центъра на Банско.', en: 'Dedicated MTB trails in Pirin. Rental available from Bansko centre.' } },
  { icon: Camera, name: { bg: 'Фотография & Природа', en: 'Photography & Nature' }, desc: { bg: 'Уникална флора и фауна — орли, дивокози, ендемични растения. Свещена гора Баюви дупки.', en: 'Unique flora and fauna — eagles, chamois, endemic plants. Bayuvi Dupki sacred forest.' } },
  { icon: Waves, name: { bg: 'Риболов', en: 'Fishing' }, desc: { bg: 'Планинските реки и язовирите около Банско са пълни с пъстърва. Организирани риболовни дни.', en: 'Mountain rivers and reservoirs around Bansko are rich in trout. Organised fishing days.' } },
  { icon: Wind, name: { bg: 'Параглайдинг', en: 'Paragliding' }, desc: { bg: 'Полети над Пирин от летателна площадка над Банско. Тандемни полети с инструктор.', en: 'Flights over Pirin from launch site above Bansko. Tandem flights with instructor.' } },
  { icon: Flame, name: { bg: 'Банско Джаз Фест', en: 'Bansko Jazz Fest' }, desc: { bg: 'Международен джаз фестивал всяко лято (август) — концерти на открито в стария град.', en: 'International jazz festival every summer (August) — open-air concerts in the old town.' } },
  { icon: Footprints, name: { bg: 'Стар Банско (пешеходно)', en: 'Old Bansko (Walking)' }, desc: { bg: 'Историческите паметници — Свети Троица, родна къща на Паисий Хилендарски, музей Неофит Рилски.', en: 'Historical landmarks — St. Trinity church, birthplace of Paisiy Hilendarski, Neophyte Rilski museum.' } },
]

const FITNESS_FACILITIES = [
  { icon: Dumbbell, name: { bg: 'Фитнес зала', en: 'Fitness Centre' }, desc: { bg: 'Модерно оборудвана фитнес зала с кардио и тежести — включена в ризорта. Идеална за поддържане на форма дори по ваканция.', en: 'Modern gym with cardio and weights — included in the resort. Perfect for staying in shape even on holiday.' } },
  { icon: Waves, name: { bg: 'Вътрешен басейн 36°C', en: 'Indoor Pool 36°C' }, desc: { bg: 'Отопляем вътрешен басейн с минерална вода — отворен целогодишно. Идеален за отпускане след ски или планински преход.', en: 'Heated indoor mineral water pool — open year-round. Ideal for unwinding after skiing or hiking.' } },
  { icon: Thermometer, name: { bg: 'Финландска сауна', en: 'Finnish Sauna' }, desc: { bg: 'Автентична финландска сауна с гледка към планината. Ароматерапия, парни сесии и пълно детоксикиране.', en: 'Authentic Finnish sauna with mountain view. Aromatherapy, steam sessions and full detox.' } },
  { icon: Heart, name: { bg: 'Хамам & Парна баня', en: 'Hammam & Steam Room' }, desc: { bg: 'Традиционен турски хамам с мраморни плочи. Парна баня с евкалипт за пълно отпускане.', en: 'Traditional Turkish hammam with marble slabs. Eucalyptus steam room for full relaxation.' } },
  { icon: Zap, name: { bg: 'Джакузи & Хидромасаж', en: 'Jacuzzi & Hydromassage' }, desc: { bg: 'Вихрова вана с хидромасажни струи — перфектна за мускулно възстановяване след активен ден.', en: 'Whirlpool with hydromassage jets — perfect for muscle recovery after an active day.' } },
  { icon: Trophy, name: { bg: 'СПА процедури', en: 'SPA Treatments' }, desc: { bg: 'Масажи, козметика, ароматерапия — пълно меню от СПА процедури с резервация. Специални оферти за гостите на апартамента.', en: 'Massages, beauty treatments, aromatherapy — full SPA menu by appointment. Special offers for apartment guests.' } },
]


function DifficultyBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-sky-100 text-sky-700 border-sky-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    black: 'bg-neutral-900 text-white border-neutral-700',
    easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    hard: 'bg-red-100 text-red-700 border-red-200',
  }
  const label: Record<string, string> = {
    green: 'Зелена', blue: 'Синя', red: 'Червена', black: 'Черна',
    easy: 'Лесен', medium: 'Среден', hard: 'Труден',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[level] || ''}`}>
      {label[level] || level}
    </span>
  )
}

export default function BanskoPage() {
  const { t, lang } = useLang()
  const { season } = useSeason()
  const revealRef = useScrollReveal()
  const [tab, setTab] = useState<Tab>(season === 'winter' ? 'winter' : 'summer')
  const [expandedTrail, setExpandedTrail] = useState<number | null>(null)

  // Sync tab with global season toggle
  useEffect(() => {
    setTab(season === 'winter' ? 'winter' : 'summer')
  }, [season])

  const isWinter = tab === 'winter'

  return (
    <div className="min-h-screen text-foreground page-enter" style={{ background: 'transparent' }}>
      {/* Shared background — same as home page hero */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
  <HeroCanvas />
</div>

      <Navbar />

      {/* ─── Hero Banner ──────────────────────── */}
<section className="relative pt-40 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={14} className="text-primary" />
            <span className="text-xs tracking-widest uppercase text-foreground/60 font-medium">
              {t('Банско, Бълга��ия • Пирин', 'Bansko, Bulgaria • Pirin')}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-4 text-balance leading-tight">
            {t('Банско —', 'Bansko —')}
            <br />
            <span className="text-primary italic">
              {isWinter ? t('Зимен рай.', 'Winter Paradise.') : t('Планинско лято.', 'Mountain Summer.')}
            </span>
          </h1>

          <p className="text-base md:text-xl text-foreground/70 max-w-2xl leading-relaxed mb-10">
            {isWinter
              ? t('Банско е световен ски курорт — 75 км писти, 14 лифта, международна атмосфера и едни от най-хубавите механи на Балканите.',
                  'Bansko is a world-class ski resort — 75 km of pistes, 14 lifts, international atmosphere and some of the best traditional restaurants in the Balkans.')
              : t('Лятото превръща Банско в портал към Пирин — ЮНЕСКО резерват с ледникови езера, диви цветя, еко пътеки и вечерен Джаз фестивал.',
                  'Summer turns Bansko into a gateway to Pirin — a UNESCO reserve with glacial lakes, wildflowers, eco trails and an evening Jazz Festival.')}
          </p>

          {/* Season tabs + CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setTab('winter')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border-2 transition-all duration-300 ${
                isWinter ? 'btn-gradient border-transparent shadow-lg' : 'glass text-foreground/70 hover:text-foreground border-border/50 hover:border-primary/30'
              }`}
            >
              <Snowflake size={14} />
              {t('Зима', 'Winter')}
            </button>
            <button
              onClick={() => setTab('summer')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border-2 transition-all duration-300 ${
                !isWinter ? 'btn-gradient border-transparent shadow-lg' : 'glass text-foreground/70 hover:text-foreground border-border/50 hover:border-primary/30'
              }`}
            >
              <Sun size={14} />
              {t('Лято', 'Summer')}
            </button>
            <Link
              href="/availability"
              className="ml-auto flex items-center gap-2 btn-gradient text-sm font-semibold px-7 py-3 rounded-full cta-glow"
            >
              {t('Провери свободни дати', 'Check Availability')}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Interactive Map ──────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 py-16" style={{ zIndex: 1 }}>
        <div className="section-line mb-4" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">{t('Карта на Банско', 'Map of Bansko')}</h2>
            <p className="text-muted-foreground mt-1 max-w-lg leading-relaxed">
              {t('Апартаментът, гондолата, барове, механи, еко пътеки — всичко наоко.', 'The apartment, gondola, bars, mehanas, eco trails — everything nearby.')}
            </p>
          </div>
          <Link href="/reserve" className="shrink-0 inline-flex items-center gap-2 btn-gradient text-sm font-semibold px-6 py-3 rounded-full cta-glow">
            {t('Резервирай сега', 'Reserve Now')} <ArrowRight size={14} />
          </Link>
        </div>
        <BanskoMap tab={tab} lang={lang} />
      </section>

      {/* ─── Content ──────────────────────────── */}
      <div ref={revealRef} className="relative max-w-7xl mx-auto px-6 py-8 space-y-24 pb-24" style={{ zIndex: 1 }}>

        {/* ════ WINTER ════════════════════════════ */}
        {isWinter && (
          <>
            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { val: '75', unit: ' км', label: t('Ски писти', 'Ski Runs') },
                { val: '14', unit: '', label: t('Лифта и влека', 'Lifts & Tows') },
                { val: '1100', unit: '→2600м', label: t('Денивелация', 'Elevation') },
                { val: '~130', unit: ' дни', label: t('Ски сезон', 'Ski Season') },
              ].map((s, i) => (
                <div key={i} className="reveal glass rounded-2xl p-6 text-center activity-card" style={{ transitionDelay: `${i * 60}ms` }}>
                  <div className="text-3xl md:text-4xl font-bold text-primary tabular-nums">
                    {s.val}<span className="text-base text-muted-foreground font-normal">{s.unit}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 tracking-wide">{s.label}</div>
                </div>
              ))}
            </section>

            {/* Gondola */}
            <section className="reveal glass rounded-3xl overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="section-line mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('Гондолата', 'The Gondola')}</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                  {t('Гондолата на Банско свързва центъра (1100 м) с ски зоната Бъндерица (1940 м) за около 20 минути. От нашия апартамент — около 10 минути пеша.',
                     "The Bansko gondola connects the town centre (1,100 m) with the Banderitsa ski area (1,940 m) in 20 minutes. From our apartment — approx. 10 minutes on foot.")}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: Clock, title: t('Работно време', 'Operating Hours'), lines: ['08:30 – 16:30', t('Декември – Март/Април', 'December – March/April')] },
                    { icon: MapPin, title: t('Местоположение', 'Location'), lines: [t('Ул. „Пирин" 68, Банско', 'Ul. "Pirin" 68, Bansko'), `~${t('10 мин. от апартамента', '10 min from apartment')}`] },
                  ].map(({ icon: Icon, title, lines }, i) => (
                    <div key={i} className="glass rounded-2xl p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0"><Icon size={18} className="text-primary" /></div>
                      <div>
                        <h3 className="font-semibold mb-1">{title}</h3>
                        {lines.map((l, j) => <p key={j} className="text-sm text-muted-foreground">{l}</p>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Ski runs */}
            <section>
              <div className="section-line mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-2 reveal">{t('Ски писти', 'Ski Runs')}</h2>
              <p className="text-muted-foreground mb-8 reveal" style={{ transitionDelay: '60ms' }}>{t('Банско предлага 75 км трасета за всички нива.', 'Bansko offers 75 km of pistes for all levels.')}</p>
              <div className="space-y-3">
                {SKI_RUNS.map((run, i) => (
                  <div key={i} className="reveal flex items-center justify-between glass rounded-xl px-5 py-4 activity-card" style={{ transitionDelay: `${i * 40}ms` }}>
                    <div className="flex items-center gap-3">
                      <Mountain size={16} className="text-primary shrink-0" />
                      <span className="font-medium text-sm">{run.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="hidden sm:block">{run.lift}</span>
                      <span className="tabular-nums font-medium">{run.km} km</span>
                      <DifficultyBadge level={run.level} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Lifts */}
            <section>
              <div className="section-line mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-8 reveal">{t('Лифтове', 'Lifts')}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LIFTS.map((lift, i) => (
                  <div key={i} className="reveal glass rounded-2xl p-5 activity-card" style={{ transitionDelay: `${i * 60}ms` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Cable size={16} className="text-primary" />
                      <h3 className="font-semibold text-sm">{lift.name}</h3>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>{lift.type} • {lift.capacity} ос/ч</p>
                      <p className="font-medium text-foreground">{lift.alt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Apres-ski */}
            <section>
              <div className="section-line mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-2 reveal">{t('Апре-ски & Механи', 'Apres-ski & Mehanas')}</h2>
              <p className="text-muted-foreground mb-8 reveal">{t('Нощният живот в Банско е легенда.', 'The nightlife in Bansko is legendary.')}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BARS.map((bar, i) => (
                  <div key={i} className="reveal glass rounded-2xl p-5 activity-card" style={{ transitionDelay: `${i * 50}ms` }}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{bar.name}</h3>
                      <span className="text-primary">
                        {bar.type === 'club' ? <Music2 size={14} /> : bar.type === 'mehana' ? <Utensils size={14} /> : <Beer size={14} />}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{bar.desc[lang as 'bg' | 'en'] ?? bar.desc.bg}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
                      <Clock size={11} /> {bar.hours}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ════ SUMMER ════════════════════════════ */}
        {!isWinter && (
          <>
            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { val: '2914', unit: ' м', label: t('Вихрен (Пирин)', 'Vihren (Pirin)') },
                { val: '118', unit: '', label: t('Ледникови езера', 'Glacial Lakes') },
                { val: 'ЮНЕСКО', unit: '', label: t('Природно наследство', 'World Heritage') },
                { val: 'Август', unit: '', label: t('Джаз Фестивал', 'Jazz Festival') },
              ].map((s, i) => (
                <div key={i} className="reveal glass rounded-2xl p-6 text-center activity-card" style={{ transitionDelay: `${i * 60}ms` }}>
                  <div className="text-2xl md:text-3xl font-bold text-primary">{s.val}<span className="text-base text-muted-foreground font-normal">{s.unit}</span></div>
                  <div className="text-xs text-muted-foreground mt-2 tracking-wide">{s.label}</div>
                </div>
              ))}
            </section>

            {/* Trails */}
            <section>
              <div className="section-line mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-2 reveal">{t('Еко пътеки — Пирин ЮНЕСКО', 'Eco Trails — Pirin UNESCO')}</h2>
              <p className="text-muted-foreground mb-8 reveal">{t('Пирин е резерват на ЮНЕСКО от 1983 г. с над 100 ледникови езера и уникална биоразнообразие.', 'Pirin has been a UNESCO reserve since 1983, with over 100 glacial lakes and unique biodiversity.')}</p>
              <div className="space-y-3">
                {SUMMER_TRAILS.map((trail, i) => (
                  <div key={i} className="reveal glass rounded-2xl overflow-hidden activity-card" style={{ transitionDelay: `${i * 40}ms` }}>
                    <button
                      onClick={() => setExpandedTrail(expandedTrail === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-primary/4 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <TreePine size={16} className="text-primary shrink-0" />
                        <span className="font-medium text-sm text-left">{trail.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="hidden sm:flex items-center gap-1"><Clock size={11} /> {trail.duration}</span>
                        <span className="tabular-nums">{trail.distance}</span>
                        <span className="font-medium text-primary">{trail.elevation}</span>
                        <DifficultyBadge level={trail.difficulty} />
                        {expandedTrail === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </button>
                    {expandedTrail === i && (
                      <div className="px-5 pb-4 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border/30">
                        {trail.desc[lang as 'bg' | 'en'] ?? trail.desc.bg}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Activities grid */}
            <section>
              <div className="section-line mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-8 reveal">{t('Летни активности', 'Summer Activities')}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {SUMMER_ACTIVITIES.map(({ icon: Icon, name, desc }, i) => (
                  <div key={i} className="reveal glass rounded-2xl p-6 activity-card" style={{ transitionDelay: `${i * 50}ms` }}>
                    <div className="w-11 h-11 rounded-xl bg-primary/12 flex items-center justify-center mb-4">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{name[lang as 'bg' | 'en'] ?? name.bg}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc[lang as 'bg' | 'en'] ?? desc.bg}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Jazz Festival highlight */}
            <section className="reveal">
              <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 glass border border-primary/20">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="tag-pill mb-4">{t('Август всяка година', 'Every August')}</div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('Банско Джаз Фестивал', 'Bansko Jazz Festival')}</h2>
                    <p className="text-foreground/75 leading-relaxed max-w-xl">
                      {t('Международен джаз фестивал с артисти от цял свят — концерти на открито на централния площад на Банско всяка вечер в продължение на 1 седмица.',
                         'International jazz festival with artists from around the world — open-air concerts on Bansko\'s main square every evening for one week.')}
                    </p>
                  </div>
                  <Link href="/availability" className="shrink-0 btn-gradient text-sm font-semibold px-7 py-3.5 rounded-full cta-glow flex items-center gap-2">
                    {t('Резервирай за август', 'Book for August')} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ════ FITNESS & SPA (always visible) ═══ */}
        <section>
          <div className="gradient-divider mb-16" />
          <div className="section-line mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-2 reveal">{t('Фитнес & СПА в ризорта', 'Fitness & SPA in the Resort')}</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl leading-relaxed reveal">
            {t('Св. Иван Рилски СПА Ризорт разполага с над 1000 кв.м. уелнес зона — включена в пакета с апартамента.',
               'St. Ivan Rilski SPA Resort has over 1,000 m² of wellness facilities — included with the apartment package.')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FITNESS_FACILITIES.map(({ icon: Icon, name, desc }, i) => (
              <div key={i} className="reveal glass rounded-2xl p-6 activity-card" style={{ transitionDelay: `${i * 50}ms` }}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, var(--primary) 0%, oklch(from var(--primary) calc(l + 0.1) calc(c - 0.03) h) 100%)', opacity: 0.9 }}
                >
                  <Icon size={22} className="text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">{name[lang as 'bg' | 'en'] ?? name.bg}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc[lang as 'bg' | 'en'] ?? desc.bg}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════ BOTTOM CTA ═══════════════════════ */}
        <section className="reveal text-center py-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('Готов за Банско?', 'Ready for Bansko?')}</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            {t('Избери своите дати и резервирай апартамента директно.', 'Choose your dates and book the apartment directly.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reserve" className="inline-flex items-center justify-center gap-2 btn-gradient font-semibold px-10 py-4 rounded-full cta-glow text-base">
              {t('Резервирай сега', 'Reserve Now')} <ArrowRight size={16} />
            </Link>
            <Link href="/availability" className="inline-flex items-center justify-center gap-2 glass text-foreground/70 hover:text-foreground font-medium px-10 py-4 rounded-full transition-all text-base">
              {t('Провери дати', 'Check Dates')}
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  )
}
