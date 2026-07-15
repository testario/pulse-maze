<script setup lang="ts">
import { computed, ref } from 'vue'

import BrowserSupportDialog from './BrowserSupportDialog.vue'
import CookieConsentDialog from './CookieConsentDialog.vue'
import FinalPulseGraphic from './landing/FinalPulseGraphic.vue'
import MazeHeroGraphic from './landing/MazeHeroGraphic.vue'
import ProductPreview from './landing/ProductPreview.vue'
import { useLanguagePreferences } from '../composables/useLanguagePreferences'

const translations = {
  en: {
    heroEyebrow: 'PULSE MAZE',
    languageLabel: 'Language',
    heroTitle: 'Test your heart rate monitor in a game.',
    heroDescription: 'Pulse Maze is a browser game that lets you control a maze using your heartbeat. Connect any Bluetooth heart rate monitor and start playing instantly.',
    tryGame: 'Try Pulse Maze',
    heroNote: 'No installation • Web Bluetooth • Free',
    howEyebrow: 'HOW IT WORKS',
    howTitle: 'A heart rate monitor becomes the controller.',
    steps: [
      'Connect your Bluetooth heart rate monitor.',
      'Calibrate your resting heart rate.',
      'Navigate the maze by raising and lowering your pulse.',
    ],
    previewConnected: 'CONNECTED',
    compatibilityEyebrow: 'COMPATIBILITY',
    compatibilityTitle: 'Works with standard Bluetooth heart rate monitors',
    devices: [
      'Magene H303',
      'Polar H10',
      'Polar H9',
      'Wahoo Tickr',
      'Garmin HRM',
      'Any BLE Heart Rate Service device',
    ],
    compatibilityDescription: 'Pulse Maze uses the standard Bluetooth Heart Rate Service supported by most modern chest straps.',
    connectDevice: 'Connect your device',
    requirementsTitle: 'REQUIREMENTS',
    requirements: [
      'Chromium-based browser (Chrome, Edge, Brave, Opera)',
      'Bluetooth 4.0+',
      'Standard BLE Heart Rate Monitor',
    ],
    browserSupportLabel: 'Browser support',
    browserSupportTitle: 'Browser support',
    browserSupportDescription: 'Pulse Maze uses Web Bluetooth to connect a heart rate monitor.',
    browserSupportTitleSupported: 'Use a Chromium-based browser',
    browserSupportBrowsers: 'Chrome, Edge, Brave and Opera support the required connection technology.',
    browserSupportNote: 'For reliable operation, use the latest desktop browser version and allow Bluetooth access when asked.',
    close: 'Close',
    finalEyebrow: 'PLAY IN THE BROWSER',
    finalTitle: 'Ready to control a game with your heartbeat?',
    finalDescription: 'No downloads. No account. Just connect your heart rate monitor and play.',
    playNow: 'Play Now',
    finalNote: 'Works directly in Chrome using Web Bluetooth.',
    cookieTitle: 'We use cookies',
    cookieDescription: 'We save only your language choice in a cookie to keep it after the next visit.',
    acceptCookies: 'Accept cookies',
    declineCookies: 'Decline',
  },
  ru: {
    heroEyebrow: 'PULSE MAZE',
    languageLabel: 'Язык',
    heroTitle: 'Проверьте пульсометр в игре.',
    heroDescription: 'Pulse Maze — браузерная игра, в которой вы управляете лабиринтом с помощью сердцебиения. Подключите любой Bluetooth-пульсометр и начинайте играть.',
    tryGame: 'Попробовать Pulse Maze',
    heroNote: 'Без установки • Web Bluetooth • Бесплатно',
    howEyebrow: 'КАК ЭТО РАБОТАЕТ',
    howTitle: 'Пульсометр становится контроллером.',
    steps: [
      'Подключите Bluetooth-пульсометр.',
      'Откалибруйте пульс в спокойном состоянии.',
      'Проходите лабиринт, повышая и понижая пульс.',
    ],
    previewConnected: 'ПОДКЛЮЧЕНО',
    compatibilityEyebrow: 'СОВМЕСТИМОСТЬ',
    compatibilityTitle: 'Работает со стандартными Bluetooth-пульсометрами',
    devices: [
      'Magene H303',
      'Polar H10',
      'Polar H9',
      'Wahoo Tickr',
      'Garmin HRM',
      'Любое устройство с BLE Heart Rate Service',
    ],
    compatibilityDescription: 'Pulse Maze использует стандартный сервис Bluetooth Heart Rate Service, который поддерживают современные нагрудные пульсометры и некоторые модели смарт-часов.',
    connectDevice: 'Подключить устройство',
    requirementsTitle: 'ТРЕБОВАНИЯ',
    requirements: [
      'Браузер на Chromium (Chrome, Edge, Brave, Opera)',
      'Bluetooth 4.0+',
      'Стандартный BLE-пульсометр',
    ],
    browserSupportLabel: 'Поддержка браузеров',
    browserSupportTitle: 'Поддержка браузеров',
    browserSupportDescription: 'Для подключения пульсометра Pulse Maze использует Web Bluetooth.',
    browserSupportTitleSupported: 'Используйте браузер на Chromium',
    browserSupportBrowsers: 'Нужную технологию подключения поддерживают Chrome, Edge, Brave и Opera.',
    browserSupportNote: 'Для стабильной работы используйте актуальную версию браузера для компьютера и разрешите доступ к Bluetooth, когда появится запрос.',
    close: 'Закрыть',
    finalEyebrow: 'ИГРАЙТЕ В БРАУЗЕРЕ',
    finalTitle: 'Готовы управлять игрой через сердцебиение?',
    finalDescription: 'Без загрузок. Без аккаунта. Подключите пульсометр и играйте.',
    playNow: 'Играть',
    finalNote: 'Работает прямо в Chrome через Web Bluetooth.',
    cookieTitle: 'Мы используем cookie',
    cookieDescription: 'Мы сохраняем только выбранный язык в cookie, чтобы он остался при следующем посещении.',
    acceptCookies: 'Принять cookie',
    declineCookies: 'Отклонить',
  },
}

const {
  acceptCookies,
  consent,
  declineCookies,
  initializePreferences,
  language,
  setLanguage,
} = useLanguagePreferences()
const content = computed(() => translations[language.value])
const isBrowserSupportDialogOpen = ref(false)

initializePreferences()
</script>

<template>
  <main class="landing">
    <section class="hero landing-section">
      <div class="hero__background">
        <MazeHeroGraphic />
      </div>

      <div class="language-tabs" :aria-label="content.languageLabel" role="group">
        <button
          :class="['language-tab', { 'language-tab--active': language === 'en' }]"
          type="button"
          :aria-pressed="language === 'en'"
          @click="setLanguage('en')"
        >
          EN
        </button>
        <span aria-hidden="true">|</span>
        <button
          :class="['language-tab', { 'language-tab--active': language === 'ru' }]"
          type="button"
          :aria-pressed="language === 'ru'"
          @click="setLanguage('ru')"
        >
          RU
        </button>
      </div>

      <div class="hero__content content-container">
        <p class="eyebrow">{{ content.heroEyebrow }}</p>
        <h1>{{ content.heroTitle }}</h1>
        <p class="hero__description">{{ content.heroDescription }}</p>
        <div class="hero__actions">
          <RouterLink class="button button--dark" to="/game">{{ content.tryGame }}</RouterLink>
          <p class="technical-note">{{ content.heroNote }}</p>
        </div>
      </div>
    </section>

    <section class="how-it-works landing-section">
      <div class="how-it-works__content content-container">
        <div class="product-preview-wrap">
          <ProductPreview :connection-label="content.previewConnected" />
        </div>

        <div class="how-it-works__copy">
          <p class="eyebrow">{{ content.howEyebrow }}</p>
          <h2>{{ content.howTitle }}</h2>
          <ol class="steps">
            <li v-for="(step, index) in content.steps" :key="step">
              <span class="steps__number">{{ String(index + 1).padStart(2, '0') }}</span>
              <p>{{ step }}</p>
            </li>
          </ol>
          <RouterLink class="button button--dark" to="/game">{{ content.tryGame }}</RouterLink>
        </div>
      </div>
    </section>

    <section class="compatibility landing-section">
      <div class="compatibility__content content-container">
        <div class="compatibility__intro">
          <p class="eyebrow">{{ content.compatibilityEyebrow }}</p>
          <h2>{{ content.compatibilityTitle }}</h2>
        </div>

        <div class="compatibility-card">
          <ul class="device-list">
            <li v-for="device in content.devices" :key="device">
              <span class="check-mark" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <path d="m3.25 8.5 3.1 3.1 6.4-7.1" />
                </svg>
              </span>
              {{ device }}
            </li>
          </ul>

          <div class="compatibility-card__copy">
            <p>{{ content.compatibilityDescription }}</p>
            <RouterLink class="button button--dark" to="/game">{{ content.connectDevice }}</RouterLink>
            <span class="technical-note">BLE HEART RATE SERVICE / 0x180D</span>
          </div>
        </div>

        <aside class="requirements" :aria-label="content.requirementsTitle">
          <div class="requirements__header">
            <p class="technical-note">{{ content.requirementsTitle }}</p>
            <button
              class="requirements__support-button"
              type="button"
              @click="isBrowserSupportDialogOpen = true"
            >
              {{ content.browserSupportLabel }}
            </button>
          </div>
          <ul class="requirements__list">
            <li v-for="requirement in content.requirements" :key="requirement">
              {{ requirement }}
            </li>
          </ul>
        </aside>
      </div>
    </section>

    <BrowserSupportDialog
      v-if="isBrowserSupportDialogOpen"
      :browser-list="content.browserSupportBrowsers"
      :close-label="content.close"
      :description="content.browserSupportDescription"
      :note="content.browserSupportNote"
      :supported-title="content.browserSupportTitleSupported"
      :title="content.browserSupportTitle"
      @close="isBrowserSupportDialogOpen = false"
    />

    <section class="final-cta">
      <div class="final-cta__graphic">
        <FinalPulseGraphic />
      </div>
      <div class="final-cta__content">
        <p class="eyebrow">{{ content.finalEyebrow }}</p>
        <h2>{{ content.finalTitle }}</h2>
        <p class="final-cta__description">{{ content.finalDescription }}</p>
        <div class="final-cta__actions">
          <RouterLink class="button button--light" to="/game">{{ content.playNow }}</RouterLink>
          <p class="technical-note">{{ content.finalNote }}</p>
        </div>
      </div>
    </section>

    <CookieConsentDialog
      v-if="consent === 'unknown'"
      :accept-label="content.acceptCookies"
      :decline-label="content.declineCookies"
      :description="content.cookieDescription"
      :title="content.cookieTitle"
      @accept="acceptCookies"
      @decline="declineCookies"
    />
  </main>
</template>

<style lang="scss" scoped>
.landing {
  --pm-bg: #ffffff;
  --pm-ink: #0a0a0a;
  --pm-muted: #666666;
  --pm-soft: #f8f8f8;
  --pm-line: #dcdcdc;
  --pm-font-heading: Geist, Inter, ui-sans-serif, system-ui, sans-serif;
  --pm-font-body: Inter, ui-sans-serif, system-ui, sans-serif;
  --pm-font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  min-width: 320px;
  overflow: hidden;
  background: var(--pm-bg);
  color: var(--pm-ink);
  font-family: var(--pm-font-body);
}

.landing-section {
  border-bottom: 1px solid var(--pm-line);
}

.content-container {
  width: min(1200px, calc(100% - 4rem));
  margin: 0 auto;
}

.eyebrow,
.technical-note {
  margin: 0;
  color: var(--pm-muted);
  font-family: var(--pm-font-mono);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

h1,
h2,
p {
  margin-top: 0;
}

h1,
h2 {
  margin-bottom: 0;
  font-family: var(--pm-font-heading);
  font-weight: 620;
  letter-spacing: -0.055em;
}

.button {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 0.95rem 1.7rem;
  color: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  transition: background-color 160ms ease, color 160ms ease;
}

.button:focus-visible {
  outline: 2px solid var(--pm-ink);
  outline-offset: 3px;
}

.button--dark {
  border-color: var(--pm-ink);
  background: var(--pm-ink);
  color: var(--pm-bg);
}

.button--dark:hover {
  background: transparent;
  color: var(--pm-ink);
}

.button--light {
  padding: 1.1rem 2.1rem;
  border-color: var(--pm-bg);
  background: var(--pm-bg);
  color: var(--pm-ink);
  font-size: 1rem;
}

.button--light:hover {
  background: transparent;
  color: var(--pm-bg);
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  height: 100dvh;
  align-items: start;
  isolation: isolate;
}

.hero__background {
  position: absolute;
  z-index: -1;
  inset: 0;
  color: var(--pm-ink);
  opacity: 0.2;
}

.hero__content {
  z-index: 1;
  grid-column: 1;
  grid-row: 1;
  display: grid;
  align-self: center;
  max-width: 820px;
  justify-items: center;
  text-align: center;
}

.language-tabs {
  z-index: 2;
  grid-column: 1;
  grid-row: 1;
  display: flex;
  align-self: start;
  align-items: center;
  justify-self: center;
  gap: 0.45rem;
  margin-top: 2rem;
  color: var(--pm-muted);
  font-family: var(--pm-font-mono);
  font-size: 0.75rem;
  font-weight: 500;
}

.language-tab {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-family: var(--pm-font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  padding: 0.25rem 0;
}

.language-tab--active {
  color: var(--pm-ink);
  text-decoration: underline;
  text-underline-offset: 0.3rem;
}

.language-tab:focus-visible {
  outline: 2px solid var(--pm-ink);
  outline-offset: 4px;
}

.hero h1 {
  max-width: 820px;
  margin-top: 1.15rem;
  font-size: clamp(3.5rem, 5vw, 4.5rem);
  line-height: 0.98;
}

.hero__description {
  max-width: 720px;
  margin: 1.5rem 0 0;
  color: var(--pm-muted);
  font-size: 1.25rem;
  line-height: 1.45;
}

.hero__actions,
.final-cta__actions {
  display: grid;
  justify-items: center;
  gap: 1rem;
  margin-top: 2.2rem;
}

.how-it-works {
  display: grid;
  min-height: 760px;
  align-items: center;
}

.how-it-works__content {
  display: grid;
  grid-template-columns: 500px minmax(0, 1fr);
  align-items: center;
  gap: 96px;
}

.product-preview-wrap {
  width: 500px;
  height: 500px;
}

.how-it-works__copy {
  display: grid;
  max-width: 604px;
  gap: 2.1rem;
}

.how-it-works h2 {
  font-size: clamp(2.5rem, 3.35vw, 3rem);
  line-height: 1.05;
}

.steps {
  display: grid;
  gap: 1.1rem;
  margin: 0;
  padding: 0.5rem 0 0.25rem;
  list-style: none;
}

.steps li {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 1.25rem;
}

.steps span {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid var(--pm-ink);
  border-radius: 50%;
  font-family: var(--pm-font-mono);
  font-size: 0.75rem;
}

.steps p {
  margin-bottom: 0;
  font-size: 1.25rem;
  line-height: 1.35;
}

.compatibility {
  min-height: 820px;
  padding: 6.5rem 0;
  background: var(--pm-soft);
}

.compatibility__content {
  display: grid;
  gap: 2.625rem;
}

.compatibility__intro {
  display: grid;
  max-width: 820px;
  gap: 1.125rem;
}

.compatibility h2 {
  font-size: clamp(2.75rem, 3.75vw, 3.375rem);
  line-height: 1.05;
}

.compatibility-card {
  display: grid;
  grid-template-columns: minmax(0, 520px) minmax(0, 472px);
  align-items: center;
  gap: 4rem;
  min-height: 358px;
  padding: 2.75rem 3rem;
  border: 1px solid var(--pm-line);
  border-radius: 20px;
  background: var(--pm-bg);
}

.device-list {
  display: grid;
  gap: 1.125rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 1.125rem;
}

.device-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.check-mark {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--pm-ink);
  border-radius: 50%;
}

.check-mark svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.compatibility-card__copy {
  display: grid;
  gap: 1.625rem;
}

.compatibility-card__copy > p {
  margin-bottom: 0;
  color: var(--pm-muted);
  font-size: 1.25rem;
  line-height: 1.45;
}

.compatibility-card__copy .technical-note {
  font-size: 0.75rem;
}

.requirements {
  display: grid;
  grid-template-columns: minmax(150px, 0.42fr) 1fr;
  align-items: start;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--pm-line);
}

.requirements__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.requirements__support-button {
  border: 0;
  border-bottom: 1px solid currentColor;
  background: transparent;
  color: var(--pm-ink);
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  line-height: 1.3;
  padding: 0 0 0.15rem;
  text-align: left;
}

.requirements__support-button:focus-visible {
  outline: 2px solid var(--pm-ink);
  outline-offset: 3px;
}

.requirements__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 0;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--pm-muted);
  font-size: 0.9375rem;
  line-height: 1.4;
}

.requirements__list li {
  padding: 0 1rem;
  border-left: 1px solid var(--pm-line);
}

.requirements__list li:first-child {
  padding-left: 0;
  border-left: 0;
}

.final-cta {
  --final-bg: #0a0a0a;
  --final-fg: #ffffff;
  position: relative;
  display: grid;
  min-height: 620px;
  place-items: start center;
  overflow: hidden;
  background: var(--final-bg);
  color: var(--final-fg);
}

.final-cta__graphic {
  position: absolute;
  top: 28px;
  width: 600px;
  height: 560px;
  color: var(--final-fg);
  opacity: 0.18;
}

.final-cta__content {
  position: relative;
  display: grid;
  width: min(840px, calc(100% - 3rem));
  justify-items: center;
  padding-top: 8.125rem;
  text-align: center;
}

.final-cta .eyebrow,
.final-cta .technical-note {
  color: color-mix(in srgb, var(--final-fg) 60%, transparent);
}

.final-cta h2 {
  margin-top: 1.15rem;
  font-size: clamp(3rem, 4vw, 3.625rem);
  line-height: 1.05;
}

.final-cta__description {
  max-width: 660px;
  margin: 1.5rem 0 0;
  color: color-mix(in srgb, var(--final-fg) 72%, transparent);
  font-size: 1.25rem;
  line-height: 1.45;
}

.final-cta__actions {
  margin-top: 2rem;
}

.final-cta .button--light {
  border-color: var(--final-fg);
  background: var(--final-fg);
  color: var(--final-bg);
}

.final-cta .button--light:hover {
  background: transparent;
  color: var(--final-fg);
}

@media (prefers-color-scheme: dark) {
  .landing {
    --pm-bg: #151515;
    --pm-ink: #f4f4f4;
    --pm-muted: #a3a3a3;
    --pm-soft: #202020;
    --pm-line: #3a3a3a;
  }
}

@media (max-width: 1080px) {
  .how-it-works__content {
    grid-template-columns: minmax(360px, 0.9fr) minmax(0, 1fr);
    gap: 4rem;
  }

  .product-preview-wrap {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }

  .compatibility-card {
    gap: 2.5rem;
  }
}

@media (max-width: 760px) {
  .content-container {
    width: min(100% - 2rem, 34rem);
  }

  .hero h1 {
    margin-top: 1rem;
    font-size: clamp(3rem, 11vw, 4rem);
  }

  .hero__description,
  .compatibility-card__copy > p,
  .final-cta__description {
    font-size: 1.0625rem;
  }

  .how-it-works {
    padding: 5rem 0;
  }

  .how-it-works__content,
  .compatibility-card {
    grid-template-columns: 1fr;
  }

  .how-it-works__content {
    gap: 3.5rem;
  }

  .product-preview-wrap {
    width: min(100%, 500px);
    justify-self: center;
  }

  .how-it-works__copy {
    gap: 1.75rem;
  }

  .steps p {
    font-size: 1.0625rem;
  }

  .compatibility {
    min-height: auto;
    padding: 5rem 0;
  }

  .compatibility-card {
    gap: 2.5rem;
    padding: 2rem;
  }

  .requirements {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .final-cta {
    min-height: 580px;
  }

  .final-cta__content {
    padding-top: 6.5rem;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 2.875rem;
  }

  .hero__actions {
    margin-top: 1.75rem;
  }

  .compatibility-card {
    padding: 1.5rem;
  }

  .device-list {
    font-size: 1rem;
  }

  .requirements__list {
    display: grid;
    gap: 0.5rem;
  }

  .requirements__list li,
  .requirements__list li:first-child {
    padding: 0;
    border-left: 0;
  }

  .final-cta h2 {
    font-size: 2.75rem;
  }
}
</style>
