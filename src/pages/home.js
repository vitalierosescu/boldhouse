import { MQ } from '../utils/breakpoints.js'
import { splitReveal } from '../utils/splitReveal.js'

gsap.registerPlugin(InertiaPlugin)

CustomEase.create('drift', 'M0,0 C0.65,0 0,1.04 1,1')

const initHeroParallax = () => {
  const hero = document.querySelector('[data-hero-target]')
  const heroImg = document.querySelector('[data-hero-img]')
  if (!hero) return
  const mm = gsap.matchMedia()
  mm.add(MQ.tabletUp, () => {
    const animateHero = () => {
      const tl = gsap.timeline({
        defaults: {
          ease: 'none',
        },
        scrollTrigger: {
          trigger: '[data-hero-trigger]',
          start: 'clamp(top 100%)',
          end: 'top top',
          scrub: true,
        },
      })

      tl.to(
        heroImg,
        {
          y: '10vh',
          filter: 'brightness(30%)',
          ease: 'none',
        },
        0
      )

      gsap.set(heroImg, { filter: 'brightness(100%)' })
    }

    animateHero()
  })
  // Remove animations on tablet and down
  mm.add(MQ.tabletDown, () => {
    gsap.set(heroImg, { clearProps: 'all' })
    ScrollTrigger.refresh()
  })
}

// function initHero() {
//   let logoPaths = document.querySelectorAll('.h-hero_logo path')
//   const heroHeading = document.querySelector('[data-hero-heading]')

//   gsap.set('.h-hero_bg-fade', { opacity: 1 })
//   gsap.set('.rotating-image-trail', { pointerEvents: 'none' })

//   const tl = gsap.timeline({
//     defaults: {
//       ease: 'cubic-bezier(.5,0,.05,1.01)',
//       // ease: 'cubic-bezier(.5,0,.05,1.01)',
//     },
//   })

//   tl.fromTo(
//     '.h-hero_bg',
//     { clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)' },
//     { clipPath: 'polygon(42% 38%, 58% 38%, 58% 62%, 42% 62%)', duration: 0.6, ease: 'power3.out' }
//   )
//     .to('.h-hero_bg', {
//       clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
//       duration: 1,
//       ease: 'expo.inOut',
//     })
//     .fromTo('.h-hero_img', { scale: 1 }, { scale: 1.2, duration: 2.5, ease: 'expo.inOut' }, '<')

//   tl.fromTo(
//     '.h-hero_mask',
//     { yPercent: -100 },
//     {
//       yPercent: 0,
//       duration: 1.4,
//       onComplete: () => {
//         gsap.set('.rotating-image-trail', { pointerEvents: 'auto' })
//       },
//     },
//     '-=2'
//   )

//   gsap.set('.mega-nav', { yPercent: -100 })

//   tl.fromTo(
//     logoPaths,
//     {
//       scale: 0.7,
//       yPercent: 160,
//       rotateZ: 5,
//     },
//     {
//       scale: 1,
//       rotateZ: 0,
//       yPercent: 0,
//       stagger: {
//         amount: 0.1,
//         ease: 'power4.out',
//       },
//       duration: 1.4,
//     },
//     '-=1.6'
//   )

//   tl.to('.mega-nav', { yPercent: 0, duration: 1.5 }, '<')
//   tl.fromTo(
//     '.section_h-hero .button',
//     { clipPath: 'inset(100% 0% 0% 0%)' },
//     { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 },
//     '-=.6'
//   )

//   if (heroHeading) {
//     splitReveal(heroHeading, {
//       delay: 2,
//       duration: 1.2,
//       stagger: 0.12,
//       ease: 'power4.out',
//     })
//   }
// }

function initHeroNew() {
  const logoPaths = document.querySelectorAll('[data-hero-svg] path')

  const heroHeadings = document.querySelectorAll('[data-hero-heading]')
  const linkList = document.querySelector('.h-hero-2_link-list')

  CustomEase.create('nav', '.5,0,.05,1.01')

  // CustomEase.create('bounce', '.34,-0.34,.08,.99')
  const tl = gsap.timeline({
    defaults: {
      // ease: 'cubic-bezier(.5,0,.05,1.01)',
      ease: 'nav',
    },
  })

  gsap.set('.mega-nav', { yPercent: -100 })

  tl.fromTo(
    '.h-hero_bg',
    { clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)' },
    { clipPath: 'polygon(42% 38%, 58% 38%, 58% 62%, 42% 62%)', duration: 0.6, ease: 'power3.out' }
  )
    .to('.h-hero_bg', {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 1,
      ease: 'expo.inOut',
      // ease: 'bounce',
    })
    .fromTo('.h-hero_img', { scale: 1 }, { scale: 1.2, duration: 1.5, ease: 'expo.inOut' }, '<')

  /* Logo */
  tl.fromTo(
    logoPaths,
    {
      yPercent: 160,
    },
    {
      yPercent: 0,
      stagger: {
        amount: 0.2,
        ease: 'power4.inOut',
        from: 'center',
      },
      duration: 2,
      onComplete: () => {
        // initMomentumBasedHover()
        gsap.set('[data-hero-svg]', { overflow: 'visible' })
      },
    },
    '-=2'
  )

  tl.to('.mega-nav', { yPercent: 0, duration: 1.5 }, '<+=.5')

  if (linkList) {
    const links = Array.from(linkList.querySelectorAll('.h-hero-2_link'))
    const listRect = linkList.getBoundingClientRect()
    const linkRects = links.map((el) => el.getBoundingClientRect())
    const gap = 32
    const totalCompressedWidth =
      linkRects.reduce((sum, r) => sum + r.width, 0) + gap * (links.length - 1)
    let cursor = listRect.left + (listRect.width - totalCompressedWidth) / 2
    const fromX = linkRects.map((r) => {
      const offset = cursor - r.left
      cursor += r.width + gap
      return offset
    })
    tl.fromTo(links, { x: (i) => fromX[i] }, { x: 0, duration: 2.5, ease: 'expo.inOut' }, '<')
  }

  /* Button */
  tl.fromTo(
    '.section_h-hero-2 .button',
    { clipPath: 'inset(100% 0% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 },
    '-=.6'
  )

  heroHeadings.forEach((heading) => {
    splitReveal(heading, {
      delay: 1.4,
      duration: 1.2,
      stagger: 0.12,
      // ease: 'power4.out',
    })
  })
}

// function initMomentumBasedHover() {
//   // If this device can’t hover with a fine pointer, stop here
//   if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
//     return
//   }

//   // Configuration (tweak these for feel)
//   const xyMultiplier = 15 // multiplies pointer velocity for x/y movement
//   const rotationMultiplier = 20 // multiplies normalized torque for rotation speed
//   const inertiaResistance = 500 // higher = stops sooner

//   // Pre-build clamp functions for performance
//   const clampXY = gsap.utils.clamp(-1080, 1080)
//   const clampRot = gsap.utils.clamp(-60, 60)

//   // Initialize each root container
//   document.querySelectorAll('[data-momentum-hover-init]').forEach((root) => {
//     let prevX = 0,
//       prevY = 0
//     let velX = 0,
//       velY = 0
//     let rafId = null

//     // Track pointer velocity (throttled to RAF)
//     root.addEventListener('mousemove', (e) => {
//       if (rafId) return
//       rafId = requestAnimationFrame(() => {
//         velX = e.clientX - prevX
//         velY = e.clientY - prevY
//         prevX = e.clientX
//         prevY = e.clientY
//         rafId = null
//       })
//     })

//     // Attach hover inertia to each child element
//     root.querySelectorAll('[data-momentum-hover-element]').forEach((el) => {
//       el.addEventListener('mouseenter', (e) => {
//         const target = el.querySelector('[data-momentum-hover-target]') || el.querySelector('path')
//         if (!target) return

//         // Compute offset from center to pointer
//         const { left, top, width, height } = target.getBoundingClientRect()
//         const centerX = left + width / 2
//         const centerY = top + height / 2
//         const offsetX = e.clientX - centerX
//         const offsetY = e.clientY - centerY

//         // Compute raw torque (px²/frame)
//         const rawTorque = offsetX * velY - offsetY * velX

//         // Normalize torque so rotation ∝ pointer speed (deg/sec)
//         const leverDist = Math.hypot(offsetX, offsetY) || 1
//         const angularForce = rawTorque / leverDist

//         // Calculate and clamp velocities
//         const velocityX = clampXY(velX * xyMultiplier)
//         const velocityY = clampXY(velY * xyMultiplier)
//         const rotationVelocity = clampRot(angularForce * rotationMultiplier)

//         // Apply GSAP inertia tween
//         gsap.to(target, {
//           inertia: {
//             x: { velocity: velocityX, end: 0 },
//             y: { velocity: velocityY, end: 0 },
//             rotation: { velocity: rotationVelocity, end: 0 },
//             resistance: inertiaResistance,
//           },
//         })
//       })
//     })
//   })
// }

function initAcceleratingGlobe() {
  document.querySelectorAll('[data-accelerating-globe]').forEach(function (globe) {
    const circles = globe.querySelectorAll('[data-accelerating-globe-circle]')
    if (circles.length < 8) return // Min 8

    const tl = gsap.timeline({
      repeat: -1,
      defaults: { duration: 1, ease: 'none' },
    })

    const widths = [
      ['50%', '37.5%'],
      ['37.5%', '25%'],
      ['25%', '12.5%'],
      ['calc(12.5% + 1px)', 'calc(0% + 1px)'],
      ['calc(0% + 1px)', 'calc(12.5% + 1px)'],
      ['12.5%', '25%'],
      ['25%', '37.5%'],
      ['37.5%', '50%'],
    ]

    circles.forEach((el, i) => {
      const [fromW, toW] = widths[i]
      tl.fromTo(el, { width: fromW }, { width: toW }, i === 0 ? 0 : '<')
    })

    let lastY = window.scrollY
    let lastT = performance.now()
    let stopTimeout

    function onScroll() {
      const now = performance.now()
      const dy = window.scrollY - lastY
      const dt = now - lastT
      lastY = window.scrollY
      lastT = now

      const velocity = dt > 0 ? (dy / dt) * 1000 : 0 // px/s
      const boost = Math.abs(velocity * 0.005)
      const targetScale = boost + 1

      tl.timeScale(targetScale)

      clearTimeout(stopTimeout)
      stopTimeout = setTimeout(() => {
        gsap.to(tl, {
          timeScale: 1,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: true,
        })
      }, 100)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
  })
}

function initClippingImageTrail() {
  var area = document.querySelector('[data-trail-area]')
  if (!area) return

  var collection = area.querySelector('[data-trail-collection]')
  if (!collection) return

  var items = collection.querySelectorAll('[data-trail-item]')
  if (!items.length) return

  // Distance logic
  var index = 0
  var lastCloneX = null
  var lastCloneY = null

  var cardWidth = items[0].getBoundingClientRect().width
  var stepDistance = cardWidth * 0.6

  function spawnTrailItem(x, y) {
    var original = items[index]
    var clone = original.cloneNode(true)

    clone.style.left = x + 'px'
    clone.style.top = y + 'px'
    clone.setAttribute('data-trail-item', 'visible')

    area.appendChild(clone)

    gsap.fromTo(
      clone,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4, ease: 'power2.out' }
    )

    gsap.to(clone, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.4,
      ease: 'power2.in',
      delay: 0.6,
      onComplete: function () {
        clone.remove()
      },
    })

    index = (index + 1) % items.length
    lastCloneX = x
    lastCloneY = y
  }

  // Mouse movement logic
  area.addEventListener('mousemove', function (event) {
    var rect = area.getBoundingClientRect()
    var x = event.clientX - rect.left
    var y = event.clientY - rect.top

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      lastCloneX = null
      lastCloneY = null
      return
    }

    if (lastCloneX === null || lastCloneY === null) {
      spawnTrailItem(x, y)
      return
    }

    var dx = x - lastCloneX
    var dy = y - lastCloneY
    var distance = Math.sqrt(dx * dx + dy * dy)

    if (distance >= stepDistance) {
      spawnTrailItem(x, y)
    }
  })
}

function initRoomsBackground() {
  const container = document.querySelector('.h-rooms_list')
  if (!container) return

  const triggers = container.querySelectorAll('.h-rooms_item')
  if (!triggers.length) return

  const defaultImage = document.querySelector('.h-rooms_img.is--default')
  const fadeEls = document.querySelectorAll('.h-rooms_fade')
  const images = Array.from(document.querySelectorAll('.h-rooms_img')).filter(
    (img) => !img.classList.contains('is--default')
  )

  const DURATION = 0.6
  const EASE = 'drift'
  const hasDefault = !!defaultImage
  let isHovering = false

  gsap.set(images, { autoAlpha: 0 })
  if (defaultImage) gsap.set(defaultImage, { autoAlpha: 1 })

  triggers.forEach((trigger, index) => {
    const image = images[index]

    trigger.addEventListener('mouseenter', () => {
      isHovering = true
      if (!hasDefault) container.setAttribute('data-rooms-hover', 'active')

      if (image) gsap.to(image, { autoAlpha: 1, duration: DURATION, ease: EASE, overwrite: true })
      if (defaultImage)
        gsap.to(defaultImage, { autoAlpha: 0, duration: DURATION, ease: EASE, overwrite: true })

      triggers.forEach((t, i) => {
        if (t !== trigger) {
          const otherImage = images[i]
          if (otherImage)
            gsap.to(otherImage, { autoAlpha: 0, duration: DURATION, ease: EASE, overwrite: true })
        }
      })

      gsap.to(fadeEls, { opacity: 0.2, duration: DURATION, ease: EASE, overwrite: true })

      triggers.forEach((t) => {
        gsap.to(t, {
          opacity: t === trigger ? 1 : 0.2,
          duration: DURATION,
          ease: EASE,
          overwrite: true,
        })
      })
    })

    trigger.addEventListener('mouseleave', () => {
      isHovering = false
      gsap.delayedCall(0.05, () => {
        if (isHovering) return
        if (!hasDefault) container.setAttribute('data-rooms-hover', '')
        if (image) gsap.to(image, { autoAlpha: 0, duration: DURATION, ease: EASE, overwrite: true })
        if (defaultImage)
          gsap.to(defaultImage, { autoAlpha: 1, duration: DURATION, ease: EASE, overwrite: true })
        gsap.to(fadeEls, { opacity: 1, duration: DURATION, ease: EASE, overwrite: true })
        gsap.to(triggers, { opacity: 1, duration: DURATION, ease: EASE, overwrite: true })
      })
    })
  })
}

function initHeroClipHover() {
  const links = document.querySelectorAll('.h-hero-2_link')
  const clipImages = document.querySelectorAll('.h-hero_clip-img')
  const defaultImage = document.querySelector('.h-hero_img.is--default')
  const bgImages = Array.from(document.querySelectorAll('.h-hero_img')).filter(
    (img) => !img.classList.contains('is--default')
  )
  if (!links.length) return

  const fadeEls = document.querySelectorAll('.mega-nav, .h-hero-2_svg-wrap, .h-hero-2_bottom')
  const DURATION = 0.6
  const EASE = 'drift'
  let isHovering = false
  let enterCall = null
  let leaveCall = null

  gsap.set(clipImages, { clipPath: 'inset(100% 0% 0% 0%)' })
  gsap.set(bgImages, { autoAlpha: 0 })
  if (defaultImage) gsap.set(defaultImage, { autoAlpha: 1 })

  links.forEach((link, index) => {
    const clipImg = clipImages[index]
    const bgImg = bgImages[index]

    link.addEventListener('mouseenter', () => {
      isHovering = true
      if (leaveCall) leaveCall.kill()
      if (enterCall) enterCall.kill()

      enterCall = gsap.delayedCall(0.15, () => {
        // Clip image reveal bottom to top
        gsap.set(clipImages, { zIndex: 0 })
        if (clipImg) {
          gsap.set(clipImg, { zIndex: 1 })
          gsap.to(clipImg, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: DURATION,
            ease: EASE,
            overwrite: true,
          })
        }

        clipImages.forEach((img, i) => {
          if (i !== index) {
            gsap.to(img, {
              clipPath: 'inset(0% 0% 100% 0%)',
              duration: DURATION,
              ease: EASE,
              overwrite: true,
            })
          }
        })

        // Background image swap
        if (bgImg) gsap.to(bgImg, { autoAlpha: 1, duration: DURATION, ease: EASE, overwrite: true })
        if (defaultImage)
          gsap.to(defaultImage, { autoAlpha: 0, duration: DURATION, ease: EASE, overwrite: true })

        bgImages.forEach((img, i) => {
          if (i !== index) {
            gsap.to(img, { autoAlpha: 0, duration: DURATION, ease: EASE, overwrite: true })
          }
        })

        // Fade surrounding elements
        gsap.to(fadeEls, { opacity: 0.1, duration: DURATION, ease: EASE, overwrite: true })

        links.forEach((l) => {
          gsap.to(l, {
            opacity: l === link ? 1 : 0.1,
            duration: DURATION,
            ease: EASE,
            overwrite: true,
          })
        })
      })
    })

    link.addEventListener('mouseleave', () => {
      isHovering = false
      if (enterCall) enterCall.kill()

      leaveCall = gsap.delayedCall(0.15, () => {
        if (isHovering) return
        if (clipImg)
          gsap.to(clipImg, {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: DURATION,
            ease: EASE,
            overwrite: true,
          })
        if (bgImg) gsap.to(bgImg, { autoAlpha: 0, duration: DURATION, ease: EASE, overwrite: true })
        if (defaultImage)
          gsap.to(defaultImage, { autoAlpha: 1, duration: DURATION, ease: EASE, overwrite: true })
        gsap.to(fadeEls, { opacity: 1, duration: DURATION, ease: EASE, overwrite: true })
        gsap.to(links, { opacity: 1, duration: DURATION, ease: EASE, overwrite: true })
      })
    })
  })
}

export function initHome() {
  initHeroParallax()
  // initHero()
  initHeroNew()
  initClippingImageTrail()
  // initMomentumBasedHover()
  // initPerks()
  initAcceleratingGlobe()
  initRoomsBackground()
  initHeroClipHover()
}
