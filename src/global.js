import { splitReveal } from './utils/splitReveal.js'
import { MQ } from './utils/breakpoints.js'

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText, Draggable, InertiaPlugin)

let PARALLAX_MM // holds the matchMedia instance for this feature only

const initForm = () => {
  if (!document.querySelector('.form_input')) return

  document.querySelectorAll('.form_input').forEach((field) => {
    const label = field.closest('.form-field-group')?.querySelector('.form_label')
    const isTextarea = field.closest('.form-field-group')?.querySelector('.form_input.is-text-area')

    // On focus in
    field.addEventListener('focusin', () => {
      if (label) label.classList.remove('is-large')
      if (isTextarea) field.classList.add('is-active')
    })

    // On focus out
    field.addEventListener('focusout', () => {
      const isEmpty = field.value.trim().length === 0
      if (isEmpty && label) label.classList.add('is-large')
      if (isTextarea && isEmpty) field.classList.remove('is-active')
    })

    // On load
    if (field.value.trim().length > 0) {
      if (label) label.classList.remove('is-large')
      if (isTextarea) field.classList.add('is-active')
    }
  })
}

// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------

history.scrollRestoration = 'manual'

let lenis = null
let nextPage = document
let onceFunctionsInitialized = false

const hasLenis = typeof window.Lenis !== 'undefined'
const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined'

const rmMQ = window.matchMedia('(prefers-reduced-motion: reduce)')
let reducedMotion = rmMQ.matches
rmMQ.addEventListener?.('change', (e) => (reducedMotion = e.matches))
rmMQ.addListener?.((e) => (reducedMotion = e.matches))

const has = (s) => !!nextPage.querySelector(s)

let staggerDefault = 0.05
let durationDefault = 0.6
let easeDefault = 'boldhouse'

CustomEase.create('boldhouse', '.5,0,.05,1.01')
gsap.defaults({ ease: easeDefault, duration: durationDefault })

// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis()
  if (onceFunctionsInitialized) return
  onceFunctionsInitialized = true

  // Runs once on first load
  // if (has('[data-something]')) initSomething();
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document

  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();
}

function initAfterEnterFunctions(next) {
  nextPage = next || document

  // Runs after enter animation completes
  // if (has('[data-something]')) initSomething();

  if (has('[data-highlight-marker-reveal]')) {
    document.fonts.ready.then(() => {
      initHighlightMarkerTextReveal()
    })
  }

  if (has('[data-button-text]')) initButtonHover()
  //initMegaNavDirectionalHover()

  if (has('[data-logo-wall-cycle-init]')) initLogoWallCycle()
  if (has('[data-stacking-cards-init]')) initStackingStickyCardsBounce()
  initTypoScrollPreview()
  initParallax()
  initPerkTooltips()
  initOverlappingSlider()
  initFaq()

  if (has('.network_component')) initClubNetwork()
  if (has('.gallery_component')) initClubGallery()

  if (hasLenis) {
    lenis.resize()
  }

  document.fonts.ready.then(() => {
    initTextAnimations()
  })

  if (hasScrollTrigger) {
    ScrollTrigger.refresh()
  }
}

// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {
  const tl = gsap.timeline()

  tl.call(
    () => {
      resetPage(next)
    },
    null,
    0
  )

  return new Promise((resolve) => {
    tl.call(resolve)
  })
}

function runPageLeaveAnimation(current, next) {
  const transitionWrap = document.querySelector('[data-transition-wrap]')
  const transitionPanel = transitionWrap.querySelector('[data-transition-panel]')
  const transitionSvg = transitionWrap.querySelectorAll('.transition__svg path')

  const tl = gsap.timeline({
    defaults: { ease: 'cubic-bezier(.98,0,1,.88)' },
    onComplete: () => {
      current.remove()
    },
  })

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    return tl.set(current, { autoAlpha: 0 })
  }

  tl.set(transitionPanel, { autoAlpha: 1 }, 0)
  tl.set(next, { autoAlpha: 0 }, 0)

  tl.fromTo(transitionPanel, { yPercent: 0 }, { yPercent: -100, duration: 0.8 }, 0)

  tl.fromTo(
    transitionSvg,
    {
      scale: 0.7,
      yPercent: 160,
      rotateZ: 5,
    },
    {
      scale: 1,
      rotateZ: 0,
      yPercent: 0,
      stagger: {
        amount: 0.03,
        ease: 'power4.out',
      },
      duration: 1,
      delay: 0.3,
    },
    0
  )

  tl.fromTo(
    current,
    {
      y: '0vh',
    },
    {
      y: '-15vh',
      duration: 0.8,
    },
    0
  )
}

function runPageEnterAnimation(next) {
  const transitionWrap = document.querySelector('[data-transition-wrap]')
  const transitionPanel = transitionWrap.querySelector('[data-transition-panel]')

  const tl = gsap.timeline()

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 })
    tl.add('pageReady')
    tl.call(resetPage, [next], 'pageReady')
    return new Promise((resolve) => tl.call(resolve, null, 'pageReady'))
  }

  tl.add('startEnter', 1.25)
  tl.set(next, { autoAlpha: 1 }, 'startEnter')

  tl.fromTo(
    transitionPanel,
    {
      yPercent: -100,
    },
    {
      yPercent: -200,
      duration: 1,
      overwrite: 'auto',
      immediateRender: false,
    },
    'startEnter'
  )

  tl.set(transitionPanel, { autoAlpha: 0 }, '>')

  tl.from(next, { y: '15vh', duration: 1 }, 'startEnter')

  tl.add('pageReady')
  tl.call(resetPage, [next], 'pageReady')

  return new Promise((resolve) => {
    tl.call(resolve, null, 'pageReady')
  })
}

// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter((data) => {
  // Position new container on top
  gsap.set(data.next.container, {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
  })

  if (lenis && typeof lenis.stop === 'function') {
    lenis.stop()
  }

  initBeforeEnterFunctions(data.next.container)
  applyThemeFrom(data.next.container)
})

barba.hooks.afterLeave(() => {
  if (hasScrollTrigger) {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
  }
})

barba.hooks.enter((data) => {
  initBarbaNavUpdate(data)
})

barba.hooks.afterEnter((data) => {
  // Run page functions
  initAfterEnterFunctions(data.next.container)

  // Settle
  if (hasLenis) {
    lenis.resize()
    lenis.start()
  }

  if (hasScrollTrigger) {
    ScrollTrigger.refresh()
  }
})

barba.init({
  debug: true, // Set to 'false' in production
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: 'default',
      sync: true,

      // First load
      async once(data) {
        initOnceFunctions()

        return runPageOnceAnimation(data.next.container)
      },

      // Current page leaves
      async leave(data) {
        return runPageLeaveAnimation(data.current.container, data.next.container)
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimation(data.next.container)
      },
    },
  ],
})

// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
  light: {
    nav: 'dark',
    transition: 'light',
  },
  dark: {
    nav: 'light',
    transition: 'dark',
  },
}

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || 'light'
  const config = themeConfig[pageTheme] || themeConfig.light

  document.body.dataset.pageTheme = pageTheme
  const transitionEl = document.querySelector('[data-theme-transition]')
  if (transitionEl) {
    transitionEl.dataset.themeTransition = config.transition
  }

  const nav = document.querySelector('[data-theme-nav]')
  if (nav) {
    nav.dataset.themeNav = config.nav
  }
}

function initLenis() {
  if (lenis) return // already created
  if (!hasLenis) return

  lenis = new Lenis({
    // lerp: 0.165,
    wheelMultiplier: 0.5,
  })

  if (hasScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update)
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)
}

function resetPage(container) {
  window.scrollTo(0, 0)
  gsap.set(container, { clearProps: 'position,top,left,right' })

  if (hasLenis) {
    lenis.resize()
    lenis.start()
  }
}

function debounceOnWidthChange(fn, ms) {
  let last = innerWidth,
    timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (innerWidth !== last) {
        last = innerWidth
        fn.apply(this, args)
      }
    }, ms)
  }
}

function initBarbaNavUpdate(data) {
  var tpl = document.createElement('template')
  tpl.innerHTML = data.next.html.trim()
  var nextNodes = tpl.content.querySelectorAll('[data-barba-update]')
  var currentNodes = document.querySelectorAll('nav [data-barba-update]')

  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index]
    if (!next) return

    // Aria-current sync
    var newStatus = next.getAttribute('aria-current')
    if (newStatus !== null) {
      curr.setAttribute('aria-current', newStatus)
    } else {
      curr.removeAttribute('aria-current')
    }

    // Class list sync
    var newClassList = next.getAttribute('class') || ''
    curr.setAttribute('class', newClassList)
  })
}

// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

function initHighlightMarkerTextReveal() {
  const defaults = {
    direction: 'right',
    theme: 'accent',
    scrollStart: 'top 90%',
    staggerStart: 'start',
    stagger: 100,
    barDuration: 0.6,
    barEase: 'power3.inOut',
    heroDelay: 3,
  }

  const colorMap = {
    accent: '#9CFFAC',
    white: '#FFFFFF',
  }

  const directionMap = {
    right: { prop: 'scaleX', origin: 'right center' },
    left: { prop: 'scaleX', origin: 'left center' },
    up: { prop: 'scaleY', origin: 'center top' },
    down: { prop: 'scaleY', origin: 'center bottom' },
  }

  function resolveColor(value) {
    if (colorMap[value]) return colorMap[value]
    if (value.startsWith('--')) {
      return getComputedStyle(document.body).getPropertyValue(value).trim() || value
    }
    return value
  }

  function createBar(color, origin) {
    const bar = document.createElement('div')
    bar.className = 'highlight-marker-bar'
    Object.assign(bar.style, {
      backgroundColor: color,
      transformOrigin: origin,
    })
    return bar
  }

  function cleanupElement(el) {
    if (!el._highlightMarkerReveal) return
    el._highlightMarkerReveal.timeline?.kill()
    el._highlightMarkerReveal.scrollTrigger?.kill()
    el._highlightMarkerReveal.split?.revert()
    el.querySelectorAll('.highlight-marker-bar').forEach((bar) => bar.remove())
    delete el._highlightMarkerReveal
  }

  let reduceMotion = false

  gsap.matchMedia().add({ reduce: '(prefers-reduced-motion: reduce)' }, (context) => {
    reduceMotion = context.conditions.reduce
  })

  // Reduced motion: no animation at all
  if (reduceMotion) {
    document.querySelectorAll('[data-highlight-marker-reveal]').forEach((el) => {
      gsap.set(el, { autoAlpha: 1 })
    })
    return
  }

  // Cleanup previous instances
  document.querySelectorAll('[data-highlight-marker-reveal]').forEach(cleanupElement)

  const elements = document.querySelectorAll('[data-highlight-marker-reveal]')
  if (!elements.length) return

  elements.forEach((el) => {
    const direction = el.getAttribute('data-marker-direction') || defaults.direction
    const theme = el.getAttribute('data-marker-theme') || defaults.theme
    const scrollStart = el.getAttribute('data-marker-scroll-start') || defaults.scrollStart
    const staggerStart = el.getAttribute('data-marker-stagger-start') || defaults.staggerStart
    const staggerOffset =
      (parseFloat(el.getAttribute('data-marker-stagger')) || defaults.stagger) / 1000

    const color = resolveColor(theme)
    const dirConfig = directionMap[direction] || directionMap.right
    const isHero = !!el.closest('[data-hero]')
    const heroDelay = parseFloat(el.getAttribute('data-marker-delay')) || defaults.heroDelay

    el._highlightMarkerReveal = {}

    const split = SplitText.create(el, {
      type: 'lines',
      linesClass: 'highlight-marker-line',
      autoSplit: true,
      onSplit(self) {
        const instance = el._highlightMarkerReveal

        // Teardown previous build
        instance.timeline?.kill()
        instance.scrollTrigger?.kill()
        el.querySelectorAll('.highlight-marker-bar').forEach((bar) => bar.remove())

        // Build bars and timeline
        const lines = self.lines
        const tl = gsap.timeline({ paused: true })

        lines.forEach((line, i) => {
          gsap.set(line, { position: 'relative', overflow: 'hidden' })

          const bar = createBar(color, dirConfig.origin)
          line.appendChild(bar)

          const staggerIndex = staggerStart === 'end' ? lines.length - 1 - i : i

          tl.to(
            bar,
            {
              [dirConfig.prop]: 0,
              duration: defaults.barDuration,
              ease: defaults.barEase,
            },
            staggerIndex * staggerOffset
          )
        })

        // Reveal parent — bars are covering the text
        gsap.set(el, { autoAlpha: 1 })

        if (isHero) {
          // Hero: play after delay, no ScrollTrigger
          gsap.delayedCall(heroDelay, () => tl.play())
        } else {
          // ScrollTrigger
          const st = ScrollTrigger.create({
            trigger: el,
            start: scrollStart,
            once: true,
            onEnter: () => tl.play(),
          })
          instance.scrollTrigger = st
        }

        instance.timeline = tl
      },
    })

    el._highlightMarkerReveal.split = split
  })
}

function initButtonHover() {
  const offsetIncrement = 0.01 // Transition offset increment in seconds
  const buttons = document.querySelectorAll('[data-button-text]')

  buttons.forEach((button) => {
    const text = button.textContent // Get the button's text content
    button.innerHTML = '' // Clear the original content
    ;[...text].forEach((char, index) => {
      const span = document.createElement('span')
      span.textContent = char
      span.style.transitionDelay = `${index * offsetIncrement}s`

      // Handle spaces explicitly
      if (char === ' ') {
        span.style.whiteSpace = 'pre' // Preserve space width
      }

      button.appendChild(span)
    })
  })
}

function initMegaNavDirectionalHover() {
  const DUR = {
    bgMorph: 0.4,
    contentIn: 0.3,
    contentOut: 0.2,
    stagger: 0.25,
    backdropIn: 0.3,
    backdropOut: 0.2,
    openScale: 0.35,
    closeScale: 0.25,
  }

  const HOVER_ENTER = 120
  const HOVER_LEAVE = 150

  // DOM references
  const menuWrap = document.querySelector('[data-menu-wrap]')
  const navList = document.querySelector('[data-nav-list]')
  const dropWrapper = document.querySelector('[data-dropdown-wrapper]')
  const dropContainer = document.querySelector('[data-dropdown-container]')
  const dropBg = document.querySelector('[data-dropdown-bg]')
  const backdrop = document.querySelector('[data-menu-backdrop]')
  const toggles = [...document.querySelectorAll('[data-dropdown-toggle]')]
  const panels = [...document.querySelectorAll('[data-nav-content]')]
  const burger = document.querySelector('[data-burger-toggle]')
  const backBtn = document.querySelector('[data-mobile-back]')
  const logo = document.querySelector('[data-menu-logo]')
  const [lineTop, lineMid, lineBot] = ['top', 'mid', 'bot'].map((id) =>
    document.querySelector(`[data-burger-line='${id}']`)
  )

  // State
  const state = {
    isOpen: false,
    activePanel: null,
    activePanelIndex: -1,
    isMobile: window.innerWidth <= 991,
    mobileMenuOpen: false,
    mobilePanelActive: null,
    hoverTimer: null,
    leaveTimer: null,
    tl: null,
    mobileTl: null,
    mobilePanelTl: null,
  }

  // Helpers
  const getPanel = (name) => document.querySelector(`[data-nav-content="${name}"]`)
  const getToggle = (name) => document.querySelector(`[data-dropdown-toggle="${name}"]`)
  const getFade = (el) => el.querySelectorAll('[data-menu-fade]')
  const getNavItems = () => navList.querySelectorAll('[data-nav-list-item]')
  const getIndex = (name) => toggles.indexOf(getToggle(name))
  const stagger = (n) => (n <= 1 ? 0 : { amount: DUR.stagger })

  function clearTimers() {
    clearTimeout(state.hoverTimer)
    clearTimeout(state.leaveTimer)
    state.hoverTimer = state.leaveTimer = null
  }

  function killTl(key) {
    if (state[key]) {
      state[key].kill()
      state[key] = null
    }
  }

  function killDropdown() {
    killTl('tl')
    gsap.killTweensOf(dropContainer)
    gsap.killTweensOf(backdrop)
    panels.forEach((p) => {
      gsap.killTweensOf(p)
      gsap.killTweensOf(getFade(p))
    })
  }

  function killMobile() {
    killTl('mobileTl')
    gsap.killTweensOf([navList, lineTop, lineMid, lineBot])
  }

  function killMobilePanel() {
    killTl('mobilePanelTl')
    gsap.killTweensOf(getNavItems())
    gsap.killTweensOf([backBtn, logo])
    panels.forEach((p) => {
      gsap.killTweensOf(p)
      gsap.killTweensOf(getFade(p))
    })
  }

  function resetToggles() {
    toggles.forEach((t) => t.setAttribute('aria-expanded', 'false'))
  }

  function resetDesktop() {
    panels.forEach((p) => {
      gsap.set(p, { visibility: 'hidden', opacity: 0, pointerEvents: 'none', xPercent: 0 })
      gsap.set(getFade(p), { autoAlpha: 0, x: 0, y: 0 })
    })
    gsap.set(dropContainer, { height: 0 })
    gsap.set(backdrop, { autoAlpha: 0 })
    menuWrap.setAttribute('data-menu-open', 'false')
    resetToggles()
  }

  function setupMobile() {
    panels.forEach((p) => {
      gsap.set(p, { autoAlpha: 0, xPercent: 0, visibility: 'visible', pointerEvents: 'none' })
      gsap.set(getFade(p), { xPercent: 20, autoAlpha: 0 })
    })
    gsap.set(getNavItems(), { xPercent: 0, y: 0, autoAlpha: 1 })
    gsap.set(navList, { autoAlpha: 0, x: 0 })
    gsap.set(backBtn, { autoAlpha: 0 })
    gsap.set(logo, { autoAlpha: 1 })
    gsap.set(dropContainer, { clearProps: 'height' })
    gsap.set(backdrop, { autoAlpha: 0 })
  }

  function measurePanel(name) {
    const el = getPanel(name)
    if (!el) return 0
    const s = el.style
    const prev = [s.visibility, s.opacity, s.pointerEvents]
    Object.assign(s, { visibility: 'visible', opacity: '0', pointerEvents: 'none' })
    const h = el.getBoundingClientRect().height
    ;[s.visibility, s.opacity, s.pointerEvents] = prev
    return h
  }

  // DESKTOP — open dropdown (first open)
  function openDropdown(panelName) {
    if (state.isOpen && state.activePanel === panelName) return
    if (state.isOpen) return switchPanel(state.activePanel, panelName)

    const height = measurePanel(panelName)
    if (!height) return

    killDropdown()
    resetDesktop()

    const el = getPanel(panelName)
    const fade = getFade(el)
    const toggle = getToggle(panelName)

    state.isOpen = true
    state.activePanel = panelName
    state.activePanelIndex = getIndex(panelName)
    menuWrap.setAttribute('data-menu-open', 'true')
    if (toggle) toggle.setAttribute('aria-expanded', 'true')

    gsap.set(dropContainer, { height: 0 })

    const tl = gsap.timeline()
    state.tl = tl
    tl.to(backdrop, { autoAlpha: 1, duration: DUR.backdropIn, ease: 'power2.out' }, 0)
    tl.to(dropContainer, { height, duration: DUR.openScale, ease: 'power3.out' }, 0)
    tl.set(el, { visibility: 'visible', opacity: 1, pointerEvents: 'auto' }, 0.05)
    if (fade.length) {
      tl.fromTo(
        fade,
        { autoAlpha: 0, y: 8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: DUR.contentIn,
          stagger: stagger(fade.length),
          ease: 'power3.out',
        },
        0.1
      )
    }
  }

  // DESKTOP — close dropdown
  function closeDropdown() {
    if (!state.isOpen) return
    const el = getPanel(state.activePanel)
    const fade = el ? getFade(el) : []

    killDropdown()

    const tl = gsap.timeline({
      onComplete() {
        state.isOpen = false
        state.activePanel = null
        state.activePanelIndex = -1
        state.tl = null
        resetDesktop()
      },
    })
    state.tl = tl
    if (fade.length)
      tl.to(fade, { autoAlpha: 0, y: -4, duration: DUR.contentOut * 0.7, ease: 'power2.in' }, 0)
    tl.to(dropContainer, { height: 0, duration: DUR.closeScale, ease: 'power2.in' }, 0.05)
    tl.to(backdrop, { autoAlpha: 0, duration: DUR.backdropOut, ease: 'power2.out' }, 0)
    if (el) tl.set(el, { visibility: 'hidden', opacity: 0, pointerEvents: 'none' })
  }

  // DESKTOP — switch panel (directional)
  function switchPanel(fromName, toName) {
    const dir = getIndex(toName) > getIndex(fromName) ? 1 : -1
    const fromEl = getPanel(fromName),
      toEl = getPanel(toName)
    if (!fromEl || !toEl) return

    const fromFade = getFade(fromEl),
      toFade = getFade(toEl)
    const toHeight = measurePanel(toName)
    if (!toHeight) return

    killDropdown()

    // Reset all panels, then restore fromEl as visible
    panels.forEach((p) => {
      gsap.set(p, { visibility: 'hidden', opacity: 0, pointerEvents: 'none', xPercent: 0 })
      gsap.set(getFade(p), { autoAlpha: 0, x: 0, y: 0 })
    })
    gsap.set(fromEl, { visibility: 'visible', opacity: 1, pointerEvents: 'auto', x: 0 })
    if (fromFade.length) gsap.set(fromFade, { autoAlpha: 1, x: 0, y: 0 })
    gsap.set(backdrop, { autoAlpha: 1 })

    const toToggle = getToggle(toName)
    state.activePanel = toName
    state.activePanelIndex = getIndex(toName)
    resetToggles()
    if (toToggle) toToggle.setAttribute('aria-expanded', 'true')

    const xOut = dir * -30,
      xIn = dir * 30
    const tl = gsap.timeline()
    state.tl = tl

    if (fromFade.length)
      tl.to(fromFade, { autoAlpha: 0, x: xOut, duration: DUR.contentOut, ease: 'power2.in' }, 0)
    tl.set(
      fromEl,
      { visibility: 'hidden', opacity: 0, pointerEvents: 'none', xPercent: 0 },
      DUR.contentOut
    )
    if (fromFade.length) tl.set(fromFade, { x: 0 }, DUR.contentOut)
    tl.to(dropContainer, { height: toHeight, duration: DUR.bgMorph, ease: 'power3.out' }, 0.05)
    tl.set(
      toEl,
      { visibility: 'visible', opacity: 1, pointerEvents: 'auto', xPercent: 0 },
      DUR.contentOut * 0.5
    )
    if (toFade.length) {
      tl.fromTo(
        toFade,
        { autoAlpha: 0, x: xIn },
        {
          autoAlpha: 1,
          x: 0,
          duration: DUR.contentIn,
          stagger: stagger(toFade.length),
          ease: 'power3.out',
        },
        DUR.contentOut * 0.6
      )
    }
  }

  // DESKTOP — hover intent
  function handleToggleEnter(e) {
    if (state.isMobile) return
    const name = e.currentTarget.getAttribute('data-dropdown-toggle')
    if (!name) return
    clearTimeout(state.leaveTimer)
    state.leaveTimer = null
    clearTimeout(state.hoverTimer)
    state.hoverTimer = setTimeout(() => openDropdown(name), state.isOpen ? 0 : HOVER_ENTER)
  }

  function handleToggleLeave() {
    if (state.isMobile) return
    clearTimeout(state.hoverTimer)
    state.hoverTimer = null
    state.leaveTimer = setTimeout(closeDropdown, HOVER_LEAVE)
  }

  function handleWrapperEnter() {
    if (state.isMobile) return
    clearTimeout(state.leaveTimer)
    state.leaveTimer = null
  }

  function handleWrapperLeave() {
    if (state.isMobile) return
    state.leaveTimer = setTimeout(closeDropdown, HOVER_LEAVE)
  }

  // DESKTOP — close behaviors
  function handleEscape(e) {
    if (e.key !== 'Escape') return
    if (state.isMobile) {
      state.mobilePanelActive ? closeMobilePanel() : state.mobileMenuOpen && closeMobileMenu()
      return
    }
    if (state.isOpen) {
      const t = getToggle(state.activePanel)
      closeDropdown()
      if (t) t.focus()
    }
  }

  function handleDocClick(e) {
    if (state.isMobile || !state.isOpen) return
    if (!e.target.closest('[data-menu-wrap]')) closeDropdown()
  }

  // DESKTOP — keyboard navigation
  function focusFirstLink(panelName) {
    setTimeout(() => {
      const el = getPanel(panelName)
      if (!el) return
      const link = el.querySelector('a')
      if (!link) return
      gsap.set(link, { visibility: 'visible' })
      link.focus()
    }, 80)
  }

  function handleKeydownOnToggle(e) {
    if (state.isMobile) return
    const name = e.currentTarget.getAttribute('data-dropdown-toggle')

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (state.isOpen && state.activePanel === name) closeDropdown()
      else {
        openDropdown(name)
        focusFirstLink(name)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!state.isOpen || state.activePanel !== name) openDropdown(name)
      focusFirstLink(name)
    }
    if (e.key === 'Tab' && !e.shiftKey && state.isOpen && state.activePanel === name) {
      e.preventDefault()
      const link = getPanel(name)?.querySelector('a')
      if (link) link.focus()
    }
  }

  function handleKeydownInPanel(e) {
    if (state.isMobile || !state.isOpen) return
    const el = getPanel(state.activePanel)
    if (!el) return

    const links = [...el.querySelectorAll('a')]
    const idx = links.indexOf(document.activeElement)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      links[(idx + 1) % links.length].focus()
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (idx <= 0) {
        const t = getToggle(state.activePanel)
        if (t) t.focus()
      } else links[idx - 1].focus()
    }
    if (e.key === 'Tab' && !e.shiftKey && idx === links.length - 1) {
      e.preventDefault()
      const curIdx = toggles.indexOf(getToggle(state.activePanel))
      const next = curIdx < toggles.length - 1 ? toggles[curIdx + 1] : null
      closeDropdown()
      if (next) next.focus()
    }
    if (e.key === 'Tab' && e.shiftKey && idx === 0) {
      e.preventDefault()
      const t = getToggle(state.activePanel)
      if (t) t.focus()
    }
  }

  // MOBILE — burger animation
  function animateBurger(toX) {
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
    if (toX) {
      tl.to(lineTop, { y: '0.3125em', duration: 0.15 }, 0)
      tl.to(lineBot, { y: '-0.3125em', duration: 0.15 }, 0)
      tl.to(lineMid, { autoAlpha: 0, duration: 0.1 }, 0.1)
      tl.to(lineTop, { rotation: 45, duration: 0.2 }, 0.15)
      tl.to(lineBot, { rotation: -45, duration: 0.2 }, 0.15)
    } else {
      tl.to(lineTop, { rotation: 0, duration: 0.2 }, 0)
      tl.to(lineBot, { rotation: 0, duration: 0.2 }, 0)
      tl.to(lineTop, { y: 0, duration: 0.15 }, 0.15)
      tl.to(lineBot, { y: 0, duration: 0.15 }, 0.15)
      tl.to(lineMid, { autoAlpha: 1, duration: 0.1 }, 0.15)
    }
    return tl
  }

  // MOBILE — open/close menu
  function openMobileMenu() {
    killMobile()
    state.mobileMenuOpen = true
    menuWrap.setAttribute('data-menu-open', 'true')
    burger.setAttribute('aria-expanded', 'true')
    document.body.style.overflow = 'hidden'

    const items = getNavItems()
    const tl = gsap.timeline()
    state.mobileTl = tl
    tl.add(animateBurger(true), 0)
    tl.to(navList, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 0)
    if (items.length) {
      tl.fromTo(
        items,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power3.out' },
        0.15
      )
    }
  }

  function closeMobileMenu() {
    const hadPanel = state.mobilePanelActive
    const panelEl = hadPanel ? getPanel(hadPanel) : null

    killMobile()
    killMobilePanel()

    menuWrap.setAttribute('data-menu-open', 'false')
    state.mobileMenuOpen = false
    state.mobilePanelActive = null
    burger.setAttribute('aria-expanded', 'false')

    const tl = gsap.timeline({
      onComplete() {
        document.body.style.overflow = ''
        state.mobileTl = null
        setupMobile()
      },
    })
    state.mobileTl = tl

    tl.add(animateBurger(false), 0)

    // If a panel was open, fade it out with the close — no snap reset
    if (hadPanel && panelEl) {
      tl.to(panelEl, { autoAlpha: 0, duration: 0.3, ease: 'power2.inOut' }, 0.05)
      tl.to(backBtn, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0.05)
    }

    // Fade out the nav list container
    tl.to(navList, { autoAlpha: 0, duration: 0.3, ease: 'power2.inOut' }, 0.05)
  }

  // MOBILE — slide-over panels
  function openMobilePanel(panelName) {
    const el = getPanel(panelName)
    if (!el) return
    killMobilePanel()
    state.mobilePanelActive = panelName

    const navItems = getNavItems()
    const panelFade = getFade(el)

    const tl = gsap.timeline()
    state.mobilePanelTl = tl

    // Fade out each nav item to the left
    if (navItems.length) {
      tl.to(
        navItems,
        {
          xPercent: -10,
          autoAlpha: 0,
          duration: 0.35,
          stagger: 0.03,
          ease: 'power2.in',
        },
        0
      )
    }

    // Logo → back button swap
    tl.to(logo, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
    tl.to(backBtn, { autoAlpha: 1, duration: 0.25, ease: 'power2.inOut' }, 0.15)

    // Show panel container, then fade in its items from the right
    tl.set(el, { autoAlpha: 1, xPercent: 0, pointerEvents: 'auto' }, 0.2)
    if (panelFade.length) {
      tl.fromTo(
        panelFade,
        { xPercent: 8, autoAlpha: 0 },
        {
          xPercent: 0,
          autoAlpha: 1,
          duration: 0.3,
          stagger: stagger(panelFade.length),
          ease: 'power3.out',
        },
        0.25
      )
    }
  }

  function closeMobilePanel() {
    if (!state.mobilePanelActive) return
    const el = getPanel(state.mobilePanelActive)
    if (!el) return
    killMobilePanel()

    const navItems = getNavItems()
    const panelFade = getFade(el)

    const tl = gsap.timeline({
      onComplete() {
        state.mobilePanelActive = null
        state.mobilePanelTl = null
      },
    })
    state.mobilePanelTl = tl

    // Fade out panel items to the right
    if (panelFade.length) {
      tl.to(
        el,
        {
          xPercent: 20,
          autoAlpha: 0,
          duration: 0.3,
          stagger: 0.02,
          ease: 'power2.in',
        },
        0
      )
    }

    // Hide panel
    tl.set(el, { autoAlpha: 0, pointerEvents: 'none' }, 0.25)

    // Back → logo swap
    tl.to(backBtn, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
    tl.to(logo, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 0.15)

    // Fade nav items back in from center
    if (navItems.length) {
      tl.fromTo(
        navItems,
        { xPercent: -20, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.35, stagger: 0.03, ease: 'power3.out' },
        0.25
      )
    }
  }

  function handleToggleClick(e) {
    if (!state.isMobile || !state.mobileMenuOpen) return
    const name = e.currentTarget.getAttribute('data-dropdown-toggle')
    if (name) {
      e.preventDefault()
      openMobilePanel(name)
    }
  }

  // RESIZE
  let resizeTimer = null
  let lastWidth = window.innerWidth
  function handleResize() {
    const w = window.innerWidth
    if (w === lastWidth) return
    lastWidth = w
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      const was = state.isMobile
      state.isMobile = window.innerWidth <= 991

      if (was && !state.isMobile) {
        killMobile()
        killMobilePanel()
        gsap.set(navList, { clearProps: 'all' })
        gsap.set(getNavItems(), { clearProps: 'all' })
        gsap.set(backBtn, { autoAlpha: 0 })
        gsap.set(logo, { clearProps: 'all' })
        gsap.set([lineTop, lineMid, lineBot], { rotation: 0, y: 0, autoAlpha: 1 })
        burger.setAttribute('aria-expanded', 'false')
        state.mobileMenuOpen = false
        state.mobilePanelActive = null
        document.body.style.overflow = ''
        resetDesktop()
      }
      if (!was && state.isMobile) {
        killDropdown()
        state.isOpen = false
        state.activePanel = null
        state.activePanelIndex = -1
        clearTimers()
        menuWrap.setAttribute('data-menu-open', 'false')
        resetToggles()
        setupMobile()
      }
    }, 150)
  }

  // EVENT BINDING
  toggles.forEach((btn) => {
    btn.addEventListener('mouseenter', handleToggleEnter)
    btn.addEventListener('mouseleave', handleToggleLeave)
    btn.addEventListener('keydown', handleKeydownOnToggle)
    btn.addEventListener('click', handleToggleClick)
  })
  dropWrapper.addEventListener('mouseenter', handleWrapperEnter)
  dropWrapper.addEventListener('mouseleave', handleWrapperLeave)
  panels.forEach((p) => p.addEventListener('keydown', handleKeydownInPanel))
  backdrop.addEventListener('click', closeDropdown)
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('click', handleDocClick)
  burger.addEventListener('click', () =>
    state.mobileMenuOpen ? closeMobileMenu() : openMobileMenu()
  )
  backBtn.addEventListener('click', closeMobilePanel)
  window.addEventListener('resize', handleResize)

  // INIT
  state.isMobile ? setupMobile() : resetDesktop()
}

function initLogoWallCycle() {
  const loopDelay = 1.5 // Loop Duration
  const duration = 0.9 // Animation Duration

  document.querySelectorAll('[data-logo-wall-cycle-init]').forEach((root) => {
    const list = root.querySelector('[data-logo-wall-list]')
    const items = Array.from(list.querySelectorAll('[data-logo-wall-item]'))

    const shuffleFront = root.getAttribute('data-logo-wall-shuffle') !== 'false'
    const originalTargets = items
      .map((item) => item.querySelector('[data-logo-wall-target]'))
      .filter(Boolean)

    let visibleItems = []
    let visibleCount = 0
    let pool = []
    let pattern = []
    let patternIndex = 0
    let tl

    function isVisible(el) {
      return window.getComputedStyle(el).display !== 'none'
    }

    function shuffleArray(arr) {
      const a = arr.slice()
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    function setup() {
      if (tl) {
        tl.kill()
      }
      visibleItems = items.filter(isVisible)
      visibleCount = visibleItems.length

      pattern = shuffleArray(Array.from({ length: visibleCount }, (_, i) => i))
      patternIndex = 0

      // remove all injected targets
      items.forEach((item) => {
        item.querySelectorAll('[data-logo-wall-target]').forEach((old) => old.remove())
      })

      pool = originalTargets.map((n) => n.cloneNode(true))

      let front, rest
      if (shuffleFront) {
        const shuffledAll = shuffleArray(pool)
        front = shuffledAll.slice(0, visibleCount)
        rest = shuffleArray(shuffledAll.slice(visibleCount))
      } else {
        front = pool.slice(0, visibleCount)
        rest = shuffleArray(pool.slice(visibleCount))
      }
      pool = front.concat(rest)

      for (let i = 0; i < visibleCount; i++) {
        const parent =
          visibleItems[i].querySelector('[data-logo-wall-target-parent]') || visibleItems[i]
        parent.appendChild(pool.shift())
      }

      tl = gsap.timeline({ repeat: -1, repeatDelay: loopDelay })
      tl.call(swapNext)
      tl.play()
    }

    function swapNext() {
      const nowCount = items.filter(isVisible).length
      if (nowCount !== visibleCount) {
        setup()
        return
      }
      if (!pool.length) return

      const idx = pattern[patternIndex % visibleCount]
      patternIndex++

      const container = visibleItems[idx]
      const parent =
        container.querySelector('[data-logo-wall-target-parent]') ||
        container.querySelector('*:has(> [data-logo-wall-target])') ||
        container
      const existing = parent.querySelectorAll('[data-logo-wall-target]')
      if (existing.length > 1) return

      const current = parent.querySelector('[data-logo-wall-target]')
      const incoming = pool.shift()

      gsap.set(incoming, { yPercent: 50, autoAlpha: 0 })
      parent.appendChild(incoming)

      if (current) {
        gsap.to(current, {
          yPercent: -50,
          autoAlpha: 0,
          duration,
          ease: 'expo.inOut',
          onComplete: () => {
            current.remove()
            pool.push(current)
          },
        })
      }

      gsap.to(incoming, {
        yPercent: 0,
        autoAlpha: 1,
        duration,
        delay: 0.1,
        ease: 'expo.inOut',
      })
    }

    setup()

    ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => tl.play(),
      onLeave: () => tl.pause(),
      onEnterBack: () => tl.play(),
      onLeaveBack: () => tl.pause(),
    })

    document.addEventListener('visibilitychange', () => (document.hidden ? tl.pause() : tl.play()))
  })
}

function initStackingStickyCardsBounce() {
  const cardsSections = document.querySelectorAll('[data-stacking-cards-init]')

  const currentTier = getCurrentViewportTier()
  window.viewportTier = currentTier

  ScrollTrigger.getAll().forEach((trigger) => {
    cardsSections.forEach((section) => {
      if (section.contains(trigger.trigger)) trigger.kill()
    })
  })

  cardsSections.forEach((section) => {
    section.querySelectorAll('[data-stacking-card-target]').forEach((el) => {
      gsap.killTweensOf(el)
      gsap.set(el, { clearProps: 'all' })
    })
  })

  cardsSections.forEach((section) => {
    const tier = currentTier

    const isEnabled =
      (tier === 'desktop' && section.dataset.stackingCardsDesktop === 'true') ||
      (tier === 'tablet' && section.dataset.stackingCardsTablet === 'true') ||
      ((tier === 'mobile-portrait' || tier === 'mobile-landscape') &&
        section.dataset.stackingCardsMobile === 'true')

    if (!isEnabled) return

    const cards = Array.from(section.querySelectorAll('[data-stacking-card]'))
    if (!cards.length) return

    const stickyTop = parseFloat(getComputedStyle(cards[0]).top) || 0

    const rotateValues = (() => {
      if (tier === 'desktop')
        return parseRotateValues(section, 'data-stacking-cards-desktop-rotate')
      if (tier === 'tablet') return parseRotateValues(section, 'data-stacking-cards-tablet-rotate')
      return parseRotateValues(section, 'data-stacking-cards-mobile-rotate')
    })()

    const xValues = (() => {
      if (tier === 'desktop') return parseAxisValues(section, 'data-stacking-cards-desktop-x')
      if (tier === 'tablet') return parseAxisValues(section, 'data-stacking-cards-tablet-x')
      return parseAxisValues(section, 'data-stacking-cards-mobile-x')
    })()

    const yValues = (() => {
      if (tier === 'desktop') return parseAxisValues(section, 'data-stacking-cards-desktop-y')
      if (tier === 'tablet') return parseAxisValues(section, 'data-stacking-cards-tablet-y')
      return parseAxisValues(section, 'data-stacking-cards-mobile-y')
    })()

    cards.forEach((card, index) => {
      const targetEl = card.querySelector('[data-stacking-card-target]')
      if (!targetEl) return

      const rotate = rotateValues[index % rotateValues.length]
      const x = xValues[index % xValues.length]
      const y = yValues[index % yValues.length]

      gsap.set(targetEl, {
        rotate: 0,
        x: 0,
        y: 0,
        scale: 1,
        zIndex: cards.length - index,
      })

      gsap.to(targetEl, {
        rotate,
        x,
        y,
        ease: 'power1.in',
        overwrite: 'auto',
        scrollTrigger: {
          id: `stacking-rotate-${index}`,
          trigger: card,
          start: 'top 75%',
          end: `top-=${stickyTop} top`,
          scrub: true,
        },
      })

      ScrollTrigger.create({
        id: `stacking-bounce-${index}`,
        trigger: card,
        start: `top-=${stickyTop} top`,
        onEnter: () => pulseElement(targetEl),
      })
    })
  })

  ScrollTrigger.refresh()

  function parseRotateValues(section, attr) {
    const fallback = [0, 4, -4]
    const values = (section.getAttribute(attr) || '')
      .split(',')
      .map((val) => parseFloat(val.trim()))
    return values.length >= 1 && values.every((v) => !isNaN(v)) ? values : fallback
  }

  function parseAxisValues(section, attr) {
    const raw = section.getAttribute(attr)
    if (!raw) return ['0em', '0em', '0em']
    const values = raw
      .split(',')
      .map((val) => val.trim())
      .filter((val) => val !== '')
    return values.length ? values : ['0em', '0em', '0em']
  }

  if (!window._hasStackingResizeListener) {
    let last = getCurrentViewportTier()

    window.addEventListener(
      'resize',
      debounceOnWidthChange(() => {
        const next = getCurrentViewportTier()

        if (last !== next) {
          ScrollTrigger.getAll().forEach((t) => {
            if (t.vars?.id?.startsWith('stacking')) t.kill()
          })

          cardsSections.forEach((section) => {
            section.querySelectorAll('[data-stacking-card-target]').forEach((el) => {
              gsap.killTweensOf(el)
              gsap.set(el, { clearProps: 'all' })
            })
          })

          initStackingStickyCardsBounce()
        }

        last = next
        window.viewportTier = next
      }, 250)
    )

    window._hasStackingResizeListener = true
  }

  // Helper: Get Current Viewport Tier
  function getCurrentViewportTier() {
    const width = window.innerWidth

    if (width <= 479) return 'mobile-portrait'
    if (width <= 767) return 'mobile-landscape'
    if (width <= 991) return 'tablet'
    return 'desktop'
  }

  // Helper: Pulse pulse (Bounce Animation)
  function pulseElement(targetEl) {
    const width = targetEl.offsetWidth
    const height = targetEl.offsetHeight
    const fontSize = parseFloat(getComputedStyle(targetEl).fontSize)
    const stretchPx = 1.5 * fontSize
    const targetScaleX = (width + stretchPx) / width
    const targetScaleY = (height - stretchPx * 0.33) / height

    const tl = gsap.timeline()
    tl.to(targetEl, {
      scaleX: targetScaleX,
      scaleY: targetScaleY,
      duration: 0.1,
      ease: 'power1.out',
    }).to(targetEl, {
      scaleX: 1,
      scaleY: 1,
      duration: 1,
      //ease: 'elastic.out(1, 0.3)',
    })
  }
}

function initTypoScrollPreview() {
  var containers = document.querySelectorAll('[data-typo-scroll-init]')
  if (!containers.length) return

  var hasInfinite = false

  containers.forEach(function (container) {
    var isInfinite = container.getAttribute('data-typo-scroll-infinite') === 'true'

    if (isInfinite) {
      hasInfinite = true

      var list = container.querySelector('[data-typo-scroll-list]')
      if (list) {
        var clone = list.cloneNode(true)
        clone.style.overflow = 'hidden'
        clone.style.height = '100dvh'
        container.appendChild(clone)
      }
    }
  })

  lenis = new Lenis({
    autoRaf: true,
    infinite: hasInfinite,
    syncTouch: hasInfinite,
  })

  if ('fonts' in document && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (lenis) {
        lenis.resize()
      }
    })
  }

  var isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0

  if (isTouchDevice) {
    function updateActiveItems() {
      var viewportCenterY = window.innerHeight / 2

      containers.forEach(function (container) {
        var items = container.querySelectorAll('[data-typo-scroll-item]')
        if (!items.length) return

        var containerRect = container.getBoundingClientRect()

        if (viewportCenterY < containerRect.top || viewportCenterY > containerRect.bottom) {
          items.forEach(function (item) {
            item.setAttribute('data-typo-scroll-item', '')
          })
          return
        }

        var closestItem = null
        var closestDistance = Infinity

        items.forEach(function (item) {
          var rect = item.getBoundingClientRect()
          if (rect.bottom < 0 || rect.top > window.innerHeight) return

          var itemCenterY = rect.top + rect.height / 2
          var distance = Math.abs(viewportCenterY - itemCenterY)

          if (distance < closestDistance) {
            closestDistance = distance
            closestItem = item
          }
        })

        if (!closestItem) {
          items.forEach(function (item) {
            item.setAttribute('data-typo-scroll-item', '')
          })
          return
        }

        items.forEach(function (item) {
          item.setAttribute('data-typo-scroll-item', item === closestItem ? 'active' : '')
        })
      })

      requestAnimationFrame(updateActiveItems)
    }

    requestAnimationFrame(updateActiveItems)
  } else {
    containers.forEach(function (container) {
      var items = container.querySelectorAll('[data-typo-scroll-item]')
      if (!items.length) return

      function setActive(target) {
        items.forEach(function (item) {
          item.setAttribute('data-typo-scroll-item', item === target ? 'active' : '')
        })
      }

      function clearActive() {
        items.forEach(function (item) {
          item.setAttribute('data-typo-scroll-item', '')
        })
      }

      items.forEach(function (item) {
        item.addEventListener('mouseenter', function () {
          setActive(item)
        })
      })

      container.addEventListener('mouseleave', function () {
        clearActive()
      })
    })
  }
}

const buildParallax = () => {
  if (!document.querySelector('[data-parallax]')) return

  PARALLAX_MM.add('(min-width: 992px)', () => {
    document.querySelectorAll('[data-parallax]').forEach((parallaxParent) => {
      const parallaxImg = parallaxParent.querySelector('.parallax')
      if (!parallaxImg) return

      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: parallaxParent,
            start: 'clamp(top bottom)',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(parallaxImg, { yPercent: 18 })
    })
  })

  PARALLAX_MM.add('(max-width: 991px)', () => {
    document.querySelectorAll('[data-parallax]').forEach((parallaxParent) => {
      const parallaxImg = parallaxParent.querySelector('.parallax')
      if (parallaxImg) gsap.set(parallaxImg, { clearProps: 'all' })
    })
  })
}

const initParallax = () => {
  if (PARALLAX_MM) PARALLAX_MM.revert() // clean up ONLY previous parallax setup
  PARALLAX_MM = gsap.matchMedia()
  buildParallax()
  // defer to next frame so layout/inputs settle first
  requestAnimationFrame(() => ScrollTrigger.refresh())
}

function initTextAnimations() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (el.closest('[data-hero]')) {
      splitReveal(el, {
        delay: 0,
        duration: 1.2,
        stagger: 0.12,
        // ease: 'power4.out',
      })
    } else {
      splitReveal(el, {
        scrollTrigger: {
          trigger: el,
          start: 'clamp(top 90%)',
          once: true,
        },
      })
    }
  })
}

function initPerkTooltips() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  const items = document.querySelectorAll('.typo-scroll__item')
  if (!items.length) return

  const OFFSET_X = 16
  const OFFSET_Y = 16

  items.forEach((item) => {
    const tooltip = item.querySelector('.perk_tooltip')
    const tooltipBg = item.querySelector('.perk_tooltip_bg')
    const tooltipText = item.querySelector('.perk_tooltip_p')
    if (!tooltip || !tooltipBg || !tooltipText) return

    gsap.set(tooltip, {
      position: 'fixed',
      top: 0,
      left: 0,
      pointerEvents: 'none',
      autoAlpha: 0,
      x: -9999,
      y: -9999,
    })
    gsap.set(tooltipBg, { clipPath: 'inset(0 100% 0 0)' })

    let chars = []
    SplitText.create(tooltipText, {
      type: 'lines, words, chars',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit(self) {
        chars = self.chars
        gsap.set(chars, { yPercent: 110 })
      },
    })

    const xTo = gsap.quickTo(tooltip, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(tooltip, 'y', { duration: 0.4, ease: 'power3.out' })

    let active = false

    item.addEventListener('mouseenter', () => {
      active = true
      gsap.killTweensOf([tooltip, tooltipBg, chars])
      gsap.to(tooltip, { autoAlpha: 1, duration: 0.15, overwrite: 'auto' })
      gsap.to(tooltipBg, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.6,
        ease: 'expo.out',
        overwrite: 'auto',
      })
      gsap.fromTo(
        chars,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.5,
          stagger: 0.012,
          ease: 'expo.out',
          delay: 0.1,
          overwrite: 'auto',
        }
      )
    })

    item.addEventListener('mouseleave', () => {
      active = false
      gsap.killTweensOf([tooltip, tooltipBg, chars])
      gsap.to(tooltipBg, {
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.4,
        ease: 'expo.in',
        overwrite: 'auto',
      })
      gsap.to(chars, {
        yPercent: 110,
        duration: 0.3,
        stagger: 0.005,
        ease: 'expo.in',
        overwrite: 'auto',
      })
      gsap.to(tooltip, { autoAlpha: 0, duration: 0.2, delay: 0.25, overwrite: 'auto' })
    })

    item.addEventListener('mousemove', (e) => {
      if (!active) return
      xTo(e.clientX + OFFSET_X)
      yTo(e.clientY + OFFSET_Y)
    })
  })
}

function initOverlappingSlider() {
  const inits = document.querySelectorAll('[data-overlap-slider-init]')
  if (!inits.length) return

  inits.forEach(setupOverlappingSlider)

  function setupOverlappingSlider(init) {
    // --- attributes with defaults
    const minScale = +(init.getAttribute('data-scale') ?? 0.45)
    const maxRotation = +(init.getAttribute('data-rotate') ?? -8)
    const inertia = true

    const wrap = init.querySelector('[data-overlap-slider-collection]')
    const slider = init.querySelector('[data-overlap-slider-list]')
    const slides = Array.from(init.querySelectorAll('[data-overlap-slider-item]'))

    if (!wrap || !slider || !slides.length) {
      console.warn(
        'OverlappingSlider: missing required structure. Check Osmo Vault documentation please.'
      )
      return
    }

    wrap.style.touchAction = 'none'
    wrap.style.userSelect = 'none'

    let spacing = 0
    let slideW = 0
    let maxDrag = 0
    let dragX = 0
    let draggable

    // simple clamp that always uses latest maxDrag
    function clamp(value) {
      if (maxDrag <= 0) return 0
      return Math.min(Math.max(value, 0), maxDrag)
    }

    function update() {
      // move the whole list
      gsap.set(slider, { x: -dragX })

      // update each slide's overlap transform
      slides.forEach((slide, i) => {
        const threshold = i * spacing
        const local = Math.max(0, dragX - threshold)
        const t = spacing > 0 ? Math.min(local / spacing, 1) : 0

        gsap.set(slide, {
          x: local,
          scale: 1 - (1 - minScale) * t,
          rotation: maxRotation * t,
          transformOrigin: '75% center',
        })
      })
    }

    function recalc() {
      if (!slides.length) return

      // measure one slide to get width + margin-right as "gap"
      const style = getComputedStyle(slides[0])
      const gapRight = parseFloat(style.marginRight) || 0

      slideW = slides[0].offsetWidth
      spacing = slideW + gapRight
      maxDrag = spacing * (slides.length - 1)

      // keep dragX within new bounds
      dragX = clamp(dragX)
      update()

      if (draggable) {
        draggable.applyBounds({ minX: -maxDrag, maxX: 0 })
      }
    }

    // create draggable
    draggable = Draggable.create(slider, {
      type: 'x',
      bounds: { minX: -maxDrag, maxX: 0 }, // will be updated after recalc
      inertia,
      maxDuration: 1,
      snap: true
        ? (raw) => {
            // raw is the x value
            const d = clamp(-raw)
            const idx = spacing > 0 ? Math.round(d / spacing) : 0
            return -idx * spacing
          }
        : false,
      onDrag() {
        dragX = clamp(-this.x)
        update()
      },
      onThrowUpdate() {
        dragX = clamp(-this.x)
        update()
      },
    })[0]

    // recalc on resize
    const ro = new ResizeObserver(() => {
      recalc()
    })
    ro.observe(init)

    // keyboard navigation (arrow left/right)
    let active = false
    let currentIndex = 0

    // helper function to switch slides
    function goToSlide(idx) {
      idx = Math.max(0, Math.min(idx, slides.length - 1))
      currentIndex = idx

      const targetX = idx * spacing

      gsap.to(
        { value: dragX },
        {
          value: targetX,
          duration: 0.35,
          ease: 'power4.out',
          onUpdate: function () {
            dragX = this.targets()[0].value
            gsap.set(slider, { x: -dragX })
            update() // animate overlap transforms properly
          },
        }
      )

      wrap.setAttribute('aria-label', `Slide ${idx + 1} of ${slides.length}`)
    }

    // Observe visibility
    const io = new IntersectionObserver(
      (entries) => {
        active = entries[0].isIntersecting
      },
      {
        threshold: 0.25, // slider must be at least 25% visible
      }
    )

    io.observe(init)

    // Aria labels for accessibility
    wrap.setAttribute('role', 'region')
    wrap.setAttribute('aria-roledescription', 'carousel')
    wrap.setAttribute('aria-label', 'Testimonial slider')

    // key listener
    function onKey(e) {
      if (!active) return // only respond when slider in view

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToSlide(currentIndex - 1)
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToSlide(currentIndex + 1)
      }
    }
    window.addEventListener('keydown', onKey)

    // initial layout
    recalc()
  }
}

const initFaq = () => {
  document.querySelectorAll('.accordion_wrap').forEach((component, listIndex) => {
    if (component.dataset.scriptInitialized) return
    component.dataset.scriptInitialized = 'true'

    const closePrevious = component.getAttribute('data-close-previous') !== 'false'
    const closeOnSecondClick = component.getAttribute('data-close-on-second-click') !== 'false'
    const openOnHover = component.getAttribute('data-open-on-hover') === 'true'
    const openByDefault =
      component.getAttribute('data-open-by-default') !== null &&
      !isNaN(+component.getAttribute('data-open-by-default'))
        ? +component.getAttribute('data-open-by-default')
        : false
    const list = component.querySelector('.accordion_list')
    let previousIndex = null,
      closeFunctions = []

    function removeCMSList(slot) {
      const dynList = Array.from(slot.children).find((child) =>
        child.classList.contains('w-dyn-list')
      )
      if (!dynList) return
      const nestedItems = dynList?.firstElementChild?.children
      if (!nestedItems) return
      const staticWrapper = [...slot.children]
      ;[...nestedItems].forEach(
        (el) => el.firstElementChild && slot.appendChild(el.firstElementChild)
      )
      staticWrapper.forEach((el) => el.remove())
    }
    removeCMSList(list)

    component.querySelectorAll('.accordion_component').forEach((card, cardIndex) => {
      const button = card.querySelector('.accordion_toggle_button')
      const content = card.querySelector('.accordion_content_wrap')
      const icon = card.querySelector('.accordion_toggle_icon')
      const iconSvg = card.querySelector('.accordion_toggle_svg')

      if (!button || !content || !icon) return console.warn('Missing elements:', card)

      button.setAttribute('aria-expanded', 'false')
      button.setAttribute('id', 'accordion_button_' + listIndex + '_' + cardIndex)
      content.setAttribute('id', 'accordion_content_' + listIndex + '_' + cardIndex)
      button.setAttribute('aria-controls', content.id)
      content.setAttribute('aria-labelledby', button.id)
      content.style.display = 'none'

      const refresh = () => {
        tl.invalidate()
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh()
        lenis?.resize()
      }
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 0.6, ease: easeDefault },
        onComplete: refresh,
        onReverseComplete: refresh,
      })
      tl.set(content, { display: 'block' })
      tl.fromTo(content, { height: 0 }, { height: 'auto' })
      tl.fromTo(iconSvg, { rotate: 0 }, { rotate: -225 }, '<')

      const closeAccordion = () =>
        card.classList.contains('is-opened') &&
        (card.classList.remove('is-opened'),
        tl.reverse(),
        button.setAttribute('aria-expanded', 'false'))
      closeFunctions[cardIndex] = closeAccordion

      const openAccordion = (instant = false) => {
        if (closePrevious && previousIndex !== null && previousIndex !== cardIndex)
          closeFunctions[previousIndex]?.()
        previousIndex = cardIndex
        button.setAttribute('aria-expanded', 'true')
        card.classList.add('is-opened')
        instant ? tl.progress(1) : tl.play()
      }
      if (openByDefault === cardIndex + 1) openAccordion(true)

      button.addEventListener('click', () =>
        card.classList.contains('is-opened') && closeOnSecondClick
          ? (closeAccordion(), (previousIndex = null))
          : openAccordion()
      )
      if (openOnHover) button.addEventListener('mouseenter', () => openAccordion())
    })
  })
}

/**
 *
 *
 * CLUB
 *
 *
 **/

const initClubNetwork = () => {
  const trigger = document.querySelector('.section_network')
  if (!trigger) return
  const mm = gsap.matchMedia()
  mm.add(MQ.tabletUp, () => {
    const animateHero = () => {
      const tl = gsap.timeline({
        defaults: {
          // ease: easeDefault,
          ease: 'power4.out',
          duration: 1.6,
        },
        scrollTrigger: {
          trigger: trigger,
          start: 'clamp(top 100%)',
          end: 'top top',
          scrub: false,
        },
      })

      gsap.set('.network_card_item', {
        transformOrigin: (i) => (i === 0 ? 'bottom right' : 'bottom left'),
      })

      tl.from('.network_card_item', {
        y: '10vh',
        scale: 0.85,
        rotate: (i) => (i === 0 ? -15 : 15),
        duration: 1.2,
        stagger: 0.1,
      })
    }

    animateHero()
  })

  // // Remove animations on tablet and down
  // mm.add(MQ.tabletDown, () => {
  //   gsap.set(heroImg, { clearProps: 'all' })
  //   ScrollTrigger.refresh()
  // })
}

const initClubGallery = () => {
  const trigger = document.querySelector('.section_gallery')
  if (!trigger) return
  const mm = gsap.matchMedia()
  mm.add(MQ.tabletUp, () => {
    const animateHero = () => {
      const tl = gsap.timeline({
        defaults: {
          ease: 'none',
        },
        scrollTrigger: {
          trigger: trigger,
          start: 'clamp(top 100%)',
          end: 'bottom top',
          scrub: true,
        },
      })

      tl.to('.gallery_component', {
        x: '-20vw',
      })
    }

    animateHero()
  })
}

export function initGlobal() {
  initForm()
}
