import gsap from 'gsap'
import { BREAKPOINTS } from './utils/breakpoints.js'
import { initHome } from './pages/home.js'
import { initGlobal } from './global.js'
;(() => {
  // =============================================
  // GSAP SETUP
  // =============================================
  // Dev fallback: use npm gsap if CDN isn't present (Webflow preview always provides CDN)
  if (!window.gsap) window.gsap = gsap

  // =============================================
  // CONFIG
  // =============================================
  const CONFIG = {
    breakpoints: BREAKPOINTS,
    selectors: {
      pageWrapper: '.page-wrap',
    },
  }

  // =============================================
  // HELPERS
  // =============================================
  function debounce(fn, delay = 200) {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), delay)
    }
  }

  // =============================================
  // INIT
  // =============================================
  function init() {
    const page = document.querySelector(CONFIG.selectors.pageWrapper)
    if (!page) return

    if (page.classList.contains('is-home')) initHome()

    initGlobal()
  }

  // =============================================
  // START
  // =============================================
  try {
    init()
  } catch (error) {
    console.error('[Main] Failed to initialize:', error)
  }
})()
