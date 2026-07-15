import { ref } from 'vue'

export type Language = 'en' | 'ru'
export type CookieConsent = 'accepted' | 'declined' | 'unknown'

const COOKIE_CONSENT_NAME = 'pulse-maze-cookie-consent'
const LANGUAGE_COOKIE_NAME = 'pulse-maze-language'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
const APP_COOKIE_NAMES = [COOKIE_CONSENT_NAME, LANGUAGE_COOKIE_NAME]

const consent = ref<CookieConsent>('unknown')
const language = ref<Language>('ru')

let isInitialized = false

/** Управляет согласием на cookie и сохранением языка лендинга. */
export function useLanguagePreferences() {
  return {
    acceptCookies,
    consent,
    declineCookies,
    initializePreferences,
    language,
    setLanguage,
  }
}

function initializePreferences() {
  if (isInitialized || typeof document === 'undefined') {
    return
  }

  isInitialized = true

  if (getCookie(COOKIE_CONSENT_NAME) !== 'accepted') {
    removeAppCookies()
    return
  }

  consent.value = 'accepted'
  language.value = getLanguageFromCookie() ?? 'ru'
}

function acceptCookies() {
  consent.value = 'accepted'
  setCookie(COOKIE_CONSENT_NAME, 'accepted')
  setCookie(LANGUAGE_COOKIE_NAME, language.value)
}

function declineCookies() {
  consent.value = 'declined'
  removeAppCookies()
}

function setLanguage(nextLanguage: Language) {
  language.value = nextLanguage

  if (consent.value === 'accepted') {
    setCookie(LANGUAGE_COOKIE_NAME, nextLanguage)
  }
}

function getLanguageFromCookie(): Language | null {
  const savedLanguage = getCookie(LANGUAGE_COOKIE_NAME)

  if (savedLanguage === 'en' || savedLanguage === 'ru') {
    return savedLanguage
  }

  return null
}

function getCookie(name: string): string | null {
  const prefix = `${name}=`
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(prefix))

  if (!cookie) {
    return null
  }

  return decodeURIComponent(cookie.slice(prefix.length))
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`
}

function removeAppCookies() {
  APP_COOKIE_NAMES.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
  })
}
