<template>
  <PanelDefault class="!border-none text-[var(--ui-text-main)]">
    <div class="flex flex-col gap-4 p-4">
      <UiTextH4 class="text-[var(--ui-text-main)]">
        {{ t("cabinet.referrals.terms.title") }}
      </UiTextH4>
      <UiTextSmall class="text-[var(--ui-text-secondary)]">
        {{ t("cabinet.referrals.terms.subtitle") }}
      </UiTextSmall>

      <section class="term-card">
        <UiTextH5 class="term-title">Геймификация IB</UiTextH5>
        <p class="term-text">
          Геймификация делает партнёрку игрой: уровни, XP, миссии, значки, рейтинги, сезонные события и 3-уровневая сеть дают реальные бонусы и пассивный доход.
        </p>
      </section>

      <section class="term-card">
        <div class="term-head">
          <div class="term-icon">🌟</div>
          <UiTextH5 class="term-title">Основные элементы</UiTextH5>
        </div>
        <div class="chip-row">
          <span v-for="item in coreElements" :key="item" class="pill tag">{{ item }}</span>
        </div>
      </section>

      <div class="grid gap-4">
        <section class="term-grid two-col">
          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">📈</div>
              <UiTextH5 class="term-title">Карьерная лестница</UiTextH5>
            </div>
            <div class="level-grid">
              <div v-for="step in levelProgression" :key="step.title" class="level-card">
                <div class="font-semibold">{{ step.title }}</div>
                <div class="pill-meta">XP: {{ step.xp }}</div>
                <div class="pill-meta">Комиссия: {{ step.commission }}</div>
                <div class="pill-meta">Бонус: {{ step.bonus }}</div>
                <div class="pill-meta">{{ step.perks }}</div>
              </div>
            </div>
          </div>

          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">💰</div>
              <UiTextH5 class="term-title">3-уровневая сеть</UiTextH5>
            </div>
            <p class="term-text">
              Ты зарабатываешь пассивно 10% с Level 2 и 5% с Level 3. Чем шире сеть — тем выше пассивный доход.
            </p>
            <div class="stat-grid">
              <div class="stat-row header">
                <span>Уровень</span><span>IB</span><span>%</span><span>Твой доход</span>
              </div>
              <div v-for="row in networkIncome" :key="row.level" class="stat-row">
                <span>{{ row.level }}</span>
                <span>{{ row.count }}</span>
                <span>{{ row.percent }}</span>
                <span>{{ row.income }}</span>
              </div>
            </div>
            <p class="term-text mt-2">Итого: $85 000+ в месяц, из них $35 000 — пассивный.</p>
          </div>
        </section>

        <section class="term-grid two-col">
          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">🎯</div>
              <UiTextH5 class="term-title">XP и действия</UiTextH5>
            </div>
            <div class="pill-list">
              <div v-for="xp in xpRules" :key="xp.title" class="pill flat">
                <span class="font-semibold">{{ xp.title }}</span>
                <span class="pill-meta">{{ xp.reward }}</span>
              </div>
            </div>
          </div>

          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">🛡</div>
              <UiTextH5 class="term-title">Миссии и челленджи</UiTextH5>
            </div>
            <div class="pill-list">
              <div v-for="mission in missions" :key="mission.title" class="pill flat">
                <span class="font-semibold">{{ mission.title }}</span>
                <span class="pill-meta">{{ mission.reward }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="term-grid two-col">
          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">🏅</div>
              <UiTextH5 class="term-title">Достижения и значки</UiTextH5>
            </div>
            <div class="pill-list">
              <div v-for="badge in badges" :key="badge.title" class="pill flat">
                <span class="font-semibold">{{ badge.title }}</span>
                <span class="pill-meta">{{ badge.bonus }}</span>
              </div>
            </div>
          </div>

          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">🎖</div>
              <UiTextH5 class="term-title">Рейтинги и соревнования</UiTextH5>
            </div>
            <div class="pill-list">
              <div v-for="rating in ratingPrizes" :key="rating.title" class="pill flat">
                <span class="font-semibold">{{ rating.title }}</span>
                <span class="pill-meta">{{ rating.prize }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="term-card">
          <div class="term-head">
            <div class="term-icon">🎁</div>
            <UiTextH5 class="term-title">Сезонные события</UiTextH5>
          </div>
          <div class="pill-list horizontal">
            <div v-for="event in seasonalEvents" :key="event" class="pill tag">
              {{ event }}
            </div>
          </div>
        </section>

        <section class="term-card">
          <UiTextH5 class="term-title">Итог</UiTextH5>
          <p class="term-text">
            Карьера и уровни мотивируют на долгосрочную работу, XP и миссии поощряют активность, значки дают статус, рейтинги — динамику,
            сезонные ивенты поддерживают интерес. Строй сеть и получай $100 000+ в месяц!
          </p>
        </section>
      </div>
    </div>
  </PanelDefault>
</template>

<script setup lang="ts">
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const coreElements = [
  "Карьерная лестница",
  "Очки XP",
  "Миссии и челленджи",
  "Достижения и значки",
  "Рейтинги и соревнования",
  "Сезонные события",
];

const levelProgression = [
  { title: "Новичок (Rookie)", xp: "0", commission: "30%", bonus: "-", perks: "Доступ в личный кабинет" },
  { title: "Продвинутый (Advanced)", xp: "5 000", commission: "35%", bonus: "$100", perks: "Брендированные материалы" },
  { title: "Эксперт (Expert)", xp: "20 000", commission: "40%", bonus: "$500", perks: "Персональный менеджер" },
  { title: "Мастер (Master)", xp: "50 000", commission: "50%", bonus: "$2 000", perks: "VIP-ивенты" },
  { title: "Легенда (Legendary)", xp: "150 000", commission: "60%", bonus: "$10 000", perks: "Индивидуальные условия" },
];

const xpRules = [
  { title: "Регистрация", reward: "100 XP" },
  { title: "Первый клиент", reward: "500 XP" },
  { title: "Каждые 10 лотов", reward: "100 XP" },
  { title: "Привлечение Sub-IB", reward: "1 000 XP" },
  { title: "5 активных клиентов в месяц", reward: "250 XP / 50 XP за каждые 5" },
];

const missions = [
  { title: "«Первый шаг» — 1 клиент", reward: "+500 XP, $50" },
  { title: "«Реферальный мастер» — 10 клиентов", reward: "+5 000 XP, $500" },
  { title: "«Строй сеть» — 3 Sub-IB", reward: "+7 500 XP, +10% к комиссионным" },
  { title: "«Трейдеры на миллион» — 1 000 лотов", reward: "+10 000 XP, $2 000" },
];

const badges = [
  { title: "🥉 Bronze Partner — 10 клиентов", bonus: "+5% к комиссиям" },
  { title: "🥈 Silver Partner — 50 клиентов", bonus: "+10% к комиссиям" },
  { title: "🥇 Gold Partner — 100 клиентов", bonus: "+15% к комиссиям" },
  { title: "💎 Diamond Partner — 500 клиентов", bonus: "VIP-обслуживание" },
  { title: "🔥 Top Recruiter — 50 Sub-IB", bonus: "+$5 000" },
];

const ratingPrizes = [
  { title: "Лучший IB месяца", prize: "🥇 $5 000 + VIP-статус" },
  { title: "Топ-рефовод", prize: "🥈 $3 000" },
  { title: "Оборот месяца", prize: "🥉 $2 000" },
  { title: "4 место", prize: "$1 000" },
  { title: "5 место", prize: "$500" },
];

const seasonalEvents = [
  "Весенний IB-баттл — кто привлечёт больше клиентов за март",
  "Зимний марафон — соревнование по объёму торгов за декабрь",
  "Сюрприз недели — случайные бонусы за активность",
  "Эксклюзивные призы: iPhone, MacBook, поездки в Дубай и Лондон",
];

const networkIncome = [
  { level: "Level 1 — ты", count: "1", percent: "-", income: "$50 000+" },
  { level: "Level 2 — Sub-IB", count: "10", percent: "10%", income: "$10 000" },
  { level: "Level 3 — сеть Sub-IB", count: "100", percent: "5%", income: "$25 000" },
];
</script>

<style scoped>
.term-block {
  background: transparent;
  border-radius: 12px;
  padding: 12px 2px;
  color: var(--ui-text-main);
}

.term-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.term-title {
  color: var(--ui-text-main);
}

.term-text {
  color: var(--ui-text-secondary);
  line-height: 1.5;
  margin-top: 6px;
}

.term-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-stroke-ui-dark);
  border: 1px solid var(--color-stroke-ui-light);
}

.term-list,
.pill-grid {
  display: grid;
  gap: 4px;
  margin-top: 8px;
}

.pill {
  padding: 4px 0;
  display: grid;
  gap: 2px;
}

.pill.flat {
  padding: 6px 0;
}

.term-grid {
  display: grid;
  gap: 12px;
}

.term-grid.two-col {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 900px) {
  .term-grid.two-col {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.term-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.04));
  border-radius: 12px;
  padding: 12px 14px;
}

.pill-list {
  display: grid;
  gap: 6px;
  margin-top: 8px;
}

.pill-list.horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill.tag {
  border-radius: 12px;
  padding: 6px 10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05));
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.pill-meta {
  font-size: 12px;
  color: var(--ui-text-secondary);
}

.stat-grid {
  margin-top: 8px;
  display: grid;
  gap: 6px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  font-size: 13px;
  color: var(--ui-text-main);
}

.stat-row.header {
  color: var(--ui-text-secondary);
  font-weight: 600;
  border-bottom: 1px solid var(--color-stroke-ui-light);
  padding-bottom: 4px;
}

.level-grid {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.level-card {
  background: var(--color-stroke-ui-dark);
  border-radius: 10px;
  padding: 8px 10px;
  display: grid;
  gap: 2px;
  color: var(--ui-text-main);
}

.bulletless {
  list-style: none;
  padding-left: 0;
  gap: 10px;
}
</style>
