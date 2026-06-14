
  function isMobilePerformanceMode() {
    return window.matchMedia("(max-width: 767px)").matches;
  }



  // Force browser to always start at top
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  window.scrollTo(0, 0);

  // Lock immediately before Lenis starts
  window.isLoaderLocked = true;
  document.documentElement.classList.add("is-loader-locked");

  function preventLoaderScroll(event) {
    if (!window.isLoaderLocked) return;
    event.preventDefault();
  }

  function preventLoaderKeys(event) {
    if (!window.isLoaderLocked) return;

    const blockedKeys = [
      " ",
      "ArrowUp",
      "ArrowDown",
      "PageUp",
      "PageDown",
      "Home",
      "End"
    ];

    if (blockedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  window.addEventListener("wheel", preventLoaderScroll, {
    passive: false,
    capture: true
  });

  window.addEventListener("touchmove", preventLoaderScroll, {
    passive: false,
    capture: true
  });

  window.addEventListener("keydown", preventLoaderKeys, {
    passive: false,
    capture: true
  });

  window.addEventListener("beforeunload", () => {
    window.scrollTo(0, 0);
  });

  window.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false
    });

    window.lenis = lenis;

    // Keep Lenis stopped while loader is active
    lenis.stop();

    lenis.scrollTo(0, {
      immediate: true,
      force: true
    });

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    }

    window.lockLoaderScroll = function () {
      window.isLoaderLocked = true;
      document.documentElement.classList.add("is-loader-locked");

      window.scrollTo(0, 0);

      if (window.lenis) {
        window.lenis.stop();

        window.lenis.scrollTo(0, {
          immediate: true,
          force: true
        });
      }
    };

    window.unlockLoaderScroll = function () {
      window.isLoaderLocked = false;
      document.documentElement.classList.remove("is-loader-locked");

      if (window.lenis) {
        window.lenis.scrollTo(0, {
          immediate: true,
          force: true
        });

        window.lenis.start();
      }

      window.scrollTo(0, 0);

      if (window.ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("load", () => {
      window.scrollTo(0, 0);

      if (window.ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    });
  });
 
 
gsap.registerPlugin(ScrollTrigger, SplitText);

let revealResizeTimer;
let revealSplits = [];
let revealAnimations = [];
let revealInitialized = false;

function initRevealOnScroll() {
  cleanupRevealOnScroll();

  const wordElements = document.querySelectorAll('[data-text-reveal="words"]');
  const lineElements = document.querySelectorAll('[data-text-reveal="lines"]');
  const revealElements = document.querySelectorAll('[data-element-reveal]');

  wordElements.forEach((textEl) => {
    const alreadyRevealed = textEl.dataset.revealDone === "true";

    const split = new SplitText(textEl, {
      type: "words",
      mask: "words"
    });

    revealSplits.push(split);

    if (alreadyRevealed) {
      gsap.set(split.words, {
        yPercent: 0
      });
      return;
    }

    gsap.set(split.words, {
      yPercent: 110
    });

    const tween = gsap.to(split.words, {
      yPercent: 0,
      stagger: 0.075,
      ease: "expo.out",
      duration: 1,
      scrollTrigger: {
        trigger: textEl,
        start: "top 85%",
        once: true,
        onEnter: () => {
          textEl.dataset.revealDone = "true";
        }
      }
    });

    revealAnimations.push(tween);
  });

  lineElements.forEach((textEl) => {
    const alreadyRevealed = textEl.dataset.revealDone === "true";

    const split = new SplitText(textEl, {
      type: "lines",
      mask: "lines"
    });

    revealSplits.push(split);

    if (alreadyRevealed) {
      gsap.set(split.lines, {
        yPercent: 0
      });
      return;
    }

    gsap.set(split.lines, {
      yPercent: 110
    });

    const tween = gsap.to(split.lines, {
      yPercent: 0,
      stagger: 0.08,
      ease: "expo.out",
      duration: 1,
      scrollTrigger: {
        trigger: textEl,
        start: "top 85%",
        once: true,
        onEnter: () => {
          textEl.dataset.revealDone = "true";
        }
      }
    });

    revealAnimations.push(tween);
  });

  revealElements.forEach((el) => {
    const alreadyRevealed = el.dataset.revealDone === "true";

    if (alreadyRevealed) {
      gsap.set(el, {
        y: 0,
        opacity: 1
      });
      return;
    }

    const tween = gsap.from(el, {
      y: 40,
      opacity: 0,
      ease: "expo.out",
      duration: 1,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          el.dataset.revealDone = "true";
        }
      }
    });

    revealAnimations.push(tween);
  });

  revealInitialized = true;

  ScrollTrigger.refresh();
}

function cleanupRevealOnScroll() {
  revealAnimations.forEach((tween) => {
    if (tween.scrollTrigger) {
      tween.scrollTrigger.kill();
    }

    tween.kill();
  });

  revealAnimations = [];

  revealSplits.forEach((split) => {
    if (split && split.revert) {
      split.revert();
    }
  });

  revealSplits = [];
}

function refreshRevealOnResize() {
  if (!revealInitialized) return;

  clearTimeout(revealResizeTimer);

  revealResizeTimer = setTimeout(() => {
    initRevealOnScroll();
  }, 250);
}

document.addEventListener("DOMContentLoaded", () => {
  document.fonts.ready.then(() => {
    initRevealOnScroll();
  });
});

window.addEventListener("resize", refreshRevealOnResize);
 

 
  function initDrawPathCursorEffect() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Config
    const trailDuration = 450;
    const trailColor = '#7e938a';

    const strokeMinWidth = 1.5;
    const strokeMaxWidth = 6;
    const strokeSmoothing = 0.1;

    const velocitySlow = 0.08;
    const velocityFast = 2.8;

    const glowBlur = 10;
    const glowIntensity = 0.25;

    const canvas = document.querySelector('[data-cursor-canvas]');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let points = [];
    let hasMouse = false;
    let mouseX = 0;
    let mouseY = 0;
    let runningWidth = strokeMinWidth;

    function hexToRgb(hex) {
      const m = hex.replace('#', '').match(/.{2}/g);
      return m.map(c => parseInt(c, 16));
    }

    const color = hexToRgb(trailColor);

    function resize() {
      const dpr = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
      hasMouse = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    gsap.ticker.add(() => {
      if (!hasMouse) return;

      const x = mouseX;
      const y = mouseY;

      if (points.length > 0) {
        const last = points[points.length - 1];
        const dx = x - last.x;
        const dy = y - last.y;

        if (dx * dx + dy * dy < 0.1) return;
      }

      points.push({
        x,
        y,
        time: performance.now()
      });
    });

    function clamp(v, lo, hi) {
      return v < lo ? lo : v > hi ? hi : v;
    }

    function remap(v, inMin, inMax, outMin, outMax) {
      const t = clamp((v - inMin) / (inMax - inMin), 0, 1);
      return outMin + t * (outMax - outMin);
    }

    function render() {
      const now = performance.now();

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      points = points.filter(p => now - p.time < trailDuration);

      if (points.length >= 3) {
        drawTrail(now);
      }

      requestAnimationFrame(render);
    }

    function drawTrail(now) {
      const [r, g, b] = color;

      ctx.lineCap = 'butt';
      ctx.lineJoin = 'round';
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${glowIntensity})`;
      ctx.shadowBlur = glowBlur;

      for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];

        const mx1 = (prev.x + curr.x) * 0.5;
        const my1 = (prev.y + curr.y) * 0.5;
        const mx2 = (curr.x + next.x) * 0.5;
        const my2 = (curr.y + next.y) * 0.5;

        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const dt = curr.time - prev.time || 1;
        const velocity = Math.sqrt(dx * dx + dy * dy) / dt;

        const targetWidth = remap(
          velocity,
          velocitySlow,
          velocityFast,
          strokeMaxWidth,
          strokeMinWidth
        );

        runningWidth += (targetWidth - runningWidth) * strokeSmoothing;

        const age = now - curr.time;
        const life = 1 - age / trailDuration;
        const alpha = life * life;

        if (alpha <= 0.005) continue;

        ctx.beginPath();
        ctx.moveTo(mx1, my1);
        ctx.quadraticCurveTo(curr.x, curr.y, mx2, my2);
        ctx.lineWidth = runningWidth;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.stroke();
      }

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(render);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDrawPathCursorEffect();
  });
 

 
  gsap.registerPlugin(SplitText);

  function lockPageScroll() {
    if (window.lockLoaderScroll) {
      window.lockLoaderScroll();
    }
  }

  function unlockPageScroll() {
    if (window.unlockLoaderScroll) {
      window.unlockLoaderScroll();
    }
  }

  function initCrispLoadingAnimation() {
    const container = document.querySelector(".crisp-header");
    if (!container) return;

    lockPageScroll();
    window.scrollTo(0, 0);

    const revealImages = container.querySelectorAll(".crisp-loader__group > *");
    const isScaleUp = container.querySelectorAll(".crisp-loader__media");
    const isScaleDown = container.querySelectorAll(".crisp-loader__media .is--scale-down");
    const isRadius = container.querySelectorAll(".crisp-loader__media.is--scaling.is--radius");
    const sliderNav = container.querySelectorAll(".crisp-header__slider-nav > *");
    const overlays = container.querySelectorAll(".crisp-header__slider-slide .overlay");

    gsap.set(overlays, {
      opacity: 0
    });

    const tl = gsap.timeline({
      defaults: {
        ease: "expo.inOut"
      },
      onStart: () => {
        container.classList.remove("is--hidden");
      }
    });

    if (revealImages.length) {
      tl.fromTo(
        revealImages,
        {
          xPercent: 500
        },
        {
          xPercent: -500,
          duration: 2.5,
          stagger: 0.05
        }
      );
    }

    if (isScaleDown.length) {
      tl.to(
        isScaleDown,
        {
          scale: 0.5,
          duration: 2,
          stagger: {
            each: 0.05,
            from: "edges",
            ease: "none"
          },
          onComplete: () => {
            isRadius.forEach((el) => el.classList.remove("is--radius"));
          }
        },
        "-=0.1"
      );
    }

    if (isScaleUp.length) {
      tl.fromTo(
        isScaleUp,
        {
          width: "10em",
          height: "10em"
        },
        {
          width: "100vw",
          height: "100dvh",
          duration: 2
        },
        "< 0.5"
      );
    }

    if (sliderNav.length) {
      tl.from(
        sliderNav,
        {
          yPercent: 150,
          stagger: 0.05,
          ease: "expo.out",
          duration: 1
        },
        "-=0.9"
      );
    }

    if (overlays.length) {
      tl.to(
        overlays,
        {
          opacity: 1,
          duration: 1,
          ease: "power1.out"
        },
        "< 0.3"
      );
    }

    tl.call(
      function () {
        container.classList.remove("is--loading");
        unlockPageScroll();
        window.scrollTo(0, 0);
        initCrispHeaderReveal();
      },
      null,
      ">"
    );
  }

  function initCrispHeaderReveal() {
    const container = document.querySelector(".crisp-header");
    if (!container) return;

    const heading = container.querySelectorAll(".crisp-header__h1");

    const smallElements = container.querySelectorAll(
      ".crisp-header__top, .crisp-header__p"
    );

    const revealElements = container.querySelectorAll("[data-header-reveal]");

    let split = null;

    if (heading.length) {
      split = new SplitText(heading, {
        type: "words",
        mask: "words"
      });

      gsap.set(split.words, {
        yPercent: 110
      });
    }

    if (smallElements.length) {
      gsap.set(smallElements, {
        opacity: 0
      });
    }

    if (revealElements.length) {
      gsap.set(revealElements, {
        y: 32,
        opacity: 0
      });
    }

    const tl = gsap.timeline();

    if (split && split.words.length) {
      tl.to(split.words, {
        yPercent: 0,
        stagger: 0.075,
        ease: "expo.out",
        duration: 1
      });
    }

    if (smallElements.length) {
      tl.to(
        smallElements,
        {
          opacity: 1,
          ease: "power1.out",
          duration: 0.4
        },
        split ? "< 0.15" : 0
      );
    }

    if (revealElements.length) {
      tl.to(
        revealElements,
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          ease: "expo.out",
          duration: 0.8
        },
        "< 0.1"
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.fonts.ready.then(() => {
      initCrispLoadingAnimation();
    });
  });
 

 
  gsap.registerPlugin(ScrollTrigger);

  function initProgressNavigation() {
    let navProgress = document.querySelector("[data-progress-nav-list]");
    if (!navProgress) return;

    let indicator = navProgress.querySelector(".progress-nav__indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "progress-nav__indicator";
      navProgress.appendChild(indicator);
    }

    function updateIndicator(activeLink) {
      if (!activeLink) return;

      let parentWidth = navProgress.offsetWidth;
      let parentHeight = navProgress.offsetHeight;

      let parentRect = navProgress.getBoundingClientRect();
      let linkRect = activeLink.getBoundingClientRect();

      let leftPercent = ((linkRect.left - parentRect.left) / parentWidth) * 100;
      let topPercent = ((linkRect.top - parentRect.top) / parentHeight) * 100;
      let widthPercent = (activeLink.offsetWidth / parentWidth) * 100;
      let heightPercent = (activeLink.offsetHeight / parentHeight) * 100;

      indicator.style.left = leftPercent + "%";
      indicator.style.top = topPercent + "%";
      indicator.style.width = widthPercent + "%";
      indicator.style.height = heightPercent + "%";
    }

    let progressAnchors = gsap.utils.toArray("[data-progress-nav-anchor]");

    progressAnchors.forEach(progressAnchor => {
      let anchorID = progressAnchor.getAttribute("id");

      ScrollTrigger.create({
        trigger: progressAnchor,
        start: "0% 50%",
        end: "100% 50%",
        onEnter: () => activateLink(anchorID),
        onEnterBack: () => activateLink(anchorID)
      });
    });

    function activateLink(anchorID) {
      let activeLink = navProgress.querySelector('[data-progress-nav-target="#' + anchorID + '"]');
      if (!activeLink) return;

      let siblings = navProgress.querySelectorAll("[data-progress-nav-target]");
      siblings.forEach(sib => sib.classList.remove("is--active"));

      activeLink.classList.add("is--active");
      updateIndicator(activeLink);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initProgressNavigation();
  });
 

 
  function initModalBasic() {
    const modalGroup = document.querySelector('[data-modal-group-status]');
    const modals = document.querySelectorAll('[data-modal-name]');
    const modalTargets = document.querySelectorAll('[data-modal-target]');
    const closeDuration = 350; // Must match your CSS close animation duration

    if (!modalGroup) return;

    function playModalVideo(modal) {
      const iframe = modal.querySelector("[data-modal-video]");
      if (!iframe) return;

      const originalSrc =
        iframe.getAttribute("data-src") ||
        iframe.getAttribute("src");

      if (!originalSrc) return;

      iframe.setAttribute("data-src", originalSrc);

      const separator = originalSrc.includes("?") ? "&" : "?";

      iframe.setAttribute(
        "src",
        originalSrc + separator + "autoplay=1&mute=0&enablejsapi=1"
      );
    }

    function stopModalVideos() {
      document.querySelectorAll("[data-modal-video]").forEach((iframe) => {
        const originalSrc = iframe.getAttribute("data-src");

        if (originalSrc) {
          iframe.setAttribute("src", originalSrc);
        }
      });
    }

    // Open modal
    modalTargets.forEach((modalTarget) => {
      modalTarget.addEventListener("click", function (event) {
        event.preventDefault();

        const modalTargetName = this.getAttribute("data-modal-target");
        const activeTarget = document.querySelector(
          `[data-modal-target="${modalTargetName}"]`
        );
        const activeModal = document.querySelector(
          `[data-modal-name="${modalTargetName}"]`
        );

        if (!activeModal) return;

        // Stop any video that might already be playing
        stopModalVideos();

        // Reset all targets and modals
        modalTargets.forEach((target) => {
          target.setAttribute("data-modal-status", "not-active");
        });

        modals.forEach((modal) => {
          modal.setAttribute("data-modal-status", "not-active");
        });

        // Activate clicked target and matching modal
        if (activeTarget) {
          activeTarget.setAttribute("data-modal-status", "active");
        }

        activeModal.setAttribute("data-modal-status", "active");

        // Set group to active
        modalGroup.setAttribute("data-modal-group-status", "active");

        // Autoplay video modal
        if (modalTargetName === "video") {
          playModalVideo(activeModal);
        }
      });
    });

    // Close modal buttons / overlay
    document.querySelectorAll("[data-modal-close]").forEach((closeBtn) => {
      closeBtn.addEventListener("click", function (event) {
        event.preventDefault();
        closeAllModals();
      });
    });

    // Close modal on Escape key
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeAllModals();
      }
    });

    // Close all modals with closing animation
    function closeAllModals() {
      const isOpen =
        modalGroup.getAttribute("data-modal-group-status") === "active";

      if (!isOpen) return;

      // Start closing animation
      modalGroup.setAttribute("data-modal-group-status", "closing");

      // After animation finishes, fully hide/reset
      setTimeout(() => {
        modalTargets.forEach((target) => {
          target.setAttribute("data-modal-status", "not-active");
        });

        modals.forEach((modal) => {
          modal.setAttribute("data-modal-status", "not-active");
        });

        stopModalVideos();

        modalGroup.setAttribute("data-modal-group-status", "not-active");
      }, closeDuration);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initModalBasic();
  });
 

 
  gsap.registerPlugin(ScrollTrigger, SplitText);

  function initStickyTitleScroll() {
    const wraps = document.querySelectorAll('[data-sticky-title="wrap"]');
    if (!wraps.length) return;

    const isMobile = isMobilePerformanceMode();

    wraps.forEach((wrap) => {
      const headings = Array.from(
        wrap.querySelectorAll('[data-sticky-title="heading"]')
      );

      const imageSettings = [
        {
          selector: ".sticky-img._1",
          startY: 110,
          endY: -360
        },
        {
          selector: ".sticky-img._2",
          startY: 140,
          endY: -460
        },
        {
          selector: ".sticky-img._3",
          startY: 95,
          endY: -340
        }
      ];

      /**
       * MOBILE VERSION
       * Light reveal, no scrub.
       */
      if (isMobile) {
        imageSettings.forEach((item) => {
          const img = wrap.querySelector(item.selector);
          if (!img) return;

          gsap.set(img, {
            y: 40,
            autoAlpha: 0,
            willChange: "transform, opacity"
          });

          gsap.to(img, {
            y: 0,
            autoAlpha: 1,
            ease: "expo.out",
            duration: 0.9,
            scrollTrigger: {
              trigger: img,
              start: "top 90%",
              once: true
            }
          });
        });

        headings.forEach((heading) => {
          heading.setAttribute("aria-label", heading.textContent);

          const split = new SplitText(heading, {
            type: "words",
            mask: "words"
          });

          gsap.set(heading, {
            visibility: "visible"
          });

          gsap.set(split.words, {
            yPercent: 110
          });

          gsap.to(split.words, {
            yPercent: 0,
            stagger: 0.06,
            ease: "expo.out",
            duration: 0.9,
            scrollTrigger: {
              trigger: heading,
              start: "top 88%",
              once: true
            }
          });
        });

        return;
      }

      /**
       * DESKTOP VERSION
       * Original scrub/parallax behavior.
       */
      imageSettings.forEach((item) => {
        const img = wrap.querySelector(item.selector);
        if (!img) return;

        gsap.set(img, {
          yPercent: item.startY,
          autoAlpha: 0,
          willChange: "transform, opacity"
        });

        const imgTl = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        imgTl
          .to(
            img,
            {
              yPercent: item.endY,
              ease: "none",
              duration: 1
            },
            0
          )
          .to(
            img,
            {
              autoAlpha: 1,
              ease: "none",
              duration: 0.15
            },
            0.05
          );
      });

      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top 40%",
          end: "bottom bottom",
          scrub: true
        }
      });

      const revealDuration = 0.7;
      const fadeOutDuration = 0.7;
      const overlapOffset = 0.15;

      headings.forEach((heading, index) => {
        heading.setAttribute("aria-label", heading.textContent);

        const split = new SplitText(heading, {
          type: "words,chars"
        });

        split.words.forEach((word) => {
          word.setAttribute("aria-hidden", "true");
        });

        gsap.set(heading, {
          visibility: "visible"
        });

        const headingTl = gsap.timeline();

        headingTl.from(split.chars, {
          autoAlpha: 0,
          stagger: {
            amount: revealDuration,
            from: "start"
          },
          duration: revealDuration
        });

        if (index < headings.length - 1) {
          headingTl.to(split.chars, {
            autoAlpha: 0,
            stagger: {
              amount: fadeOutDuration,
              from: "end"
            },
            duration: fadeOutDuration
          });
        }

        if (index === 0) {
          masterTl.add(headingTl);
        } else {
          masterTl.add(headingTl, `-=${overlapOffset}`);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initStickyTitleScroll();
  });
 


 
  gsap.registerPlugin(ScrollTrigger, Flip);

  function initBackgroundZoom() {
    const containers = document.querySelectorAll("[data-bg-zoom-init]");
    if (!containers.length) return;

    const isMobile = isMobilePerformanceMode();

    /**
     * MOBILE VERSION
     * No Flip, no scrub.
     */
    if (isMobile) {
      containers.forEach((container) => {
        const contentEl = container.querySelector("[data-bg-zoom-content]");
        const imgEl = container.querySelector("[data-bg-zoom-img]");
        const darkEl = container.querySelector("[data-bg-zoom-dark]");
        const textEls = container.querySelectorAll(".background-zoom__h");

        if (contentEl) {
          gsap.set(contentEl, {
            autoAlpha: 0,
            y: 40,
            scale: 0.98,
            willChange: "transform, opacity"
          });

          gsap.to(contentEl, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            ease: "expo.out",
            duration: 1,
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              once: true
            }
          });
        }

        if (imgEl) {
          gsap.set(imgEl, {
            scale: 1.08
          });

          gsap.to(imgEl, {
            scale: 1,
            ease: "expo.out",
            duration: 1.2,
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              once: true
            }
          });
        }

        if (darkEl) {
          gsap.set(darkEl, {
            opacity: 0.35
          });
        }

        textEls.forEach((textEl) => {
          gsap.set(textEl, {
            autoAlpha: 0,
            y: 24
          });

          gsap.to(textEl, {
            autoAlpha: 1,
            y: 0,
            ease: "expo.out",
            duration: 0.8,
            scrollTrigger: {
              trigger: textEl,
              start: "top 88%",
              once: true
            }
          });
        });
      });

      return;
    }

    /**
     * DESKTOP VERSION
     * Original Flip/scrub behavior.
     */
    let masterTimeline;

    const getScrollRange = ({ trigger, start, endTrigger, end }) => {
      const st = ScrollTrigger.create({
        trigger,
        start,
        endTrigger,
        end
      });

      const range = Math.max(1, st.end - st.start);
      st.kill();

      return range;
    };

    const bgZoomTimeline = () => {
      if (masterTimeline) masterTimeline.kill();

      masterTimeline = gsap.timeline({
        defaults: {
          ease: "none"
        },
        scrollTrigger: {
          trigger:
            containers[0].querySelector("[data-bg-zoom-start]") ||
            containers[0],
          start: "clamp(top bottom)",
          endTrigger: containers[containers.length - 1],
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true
        }
      });

      containers.forEach((container) => {
        const startEl = container.querySelector("[data-bg-zoom-start]");
        const endEl = container.querySelector("[data-bg-zoom-end]");
        const contentEl = container.querySelector("[data-bg-zoom-content]");
        const darkEl = container.querySelector("[data-bg-zoom-dark]");
        const imgEl = container.querySelector("[data-bg-zoom-img]");
        const textEls = container.querySelectorAll(".background-zoom__h");

        if (!startEl || !endEl || !contentEl) return;

        textEls.forEach((textEl) => {
          gsap.set(textEl, {
            autoAlpha: 0,
            willChange: "opacity"
          });

          gsap.to(textEl, {
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: {
              trigger: textEl,
              start: "top bottom",
              end: "center center",
              scrub: true
            }
          });
        });

        const startRadius = getComputedStyle(startEl).borderRadius;
        const endRadius = getComputedStyle(endEl).borderRadius;
        const hasRadius = startRadius !== "0px" || endRadius !== "0px";

        contentEl.style.overflow = hasRadius ? "hidden" : "";

        if (hasRadius) {
          gsap.set(contentEl, {
            borderRadius: startRadius
          });
        }

        Flip.fit(contentEl, startEl, {
          scale: false
        });

        const zoomScrollRange = getScrollRange({
          trigger: startEl,
          start: "clamp(top bottom)",
          endTrigger: endEl,
          end: "center center"
        });

        const afterScrollRange = getScrollRange({
          trigger: endEl,
          start: "center center",
          endTrigger: container,
          end: "bottom top"
        });

        masterTimeline.add(
          Flip.fit(contentEl, endEl, {
            duration: zoomScrollRange,
            ease: "none",
            scale: false
          })
        );

        if (hasRadius) {
          masterTimeline.to(
            contentEl,
            {
              borderRadius: endRadius,
              duration: zoomScrollRange
            },
            "<"
          );
        }

        masterTimeline.to(contentEl, {
          y: `+=${afterScrollRange}`,
          duration: afterScrollRange
        });

        if (darkEl) {
          gsap.set(darkEl, {
            opacity: 0
          });

          masterTimeline.to(
            darkEl,
            {
              opacity: 0.75,
              duration: afterScrollRange * 0.25
            },
            "<"
          );
        }

        if (imgEl) {
          gsap.set(imgEl, {
            scale: 1,
            transformOrigin: "50% 50%"
          });

          masterTimeline.to(
            imgEl,
            {
              scale: 1.25,
              yPercent: -10,
              duration: afterScrollRange
            },
            "<"
          );
        }
      });

      ScrollTrigger.refresh();
    };

    bgZoomTimeline();

    let resizeTimer;

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(bgZoomTimeline, 100);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initBackgroundZoom();
  });
 


 
  // set variables
  let items = $(".marquee_item");
  let textItem = $(".marquee_text-item");
  let wrap = $(".marquee_wrap");
  let totalItems = items.length / 2 + 1;
  let duration = totalItems * 3.2;

  // add custom cursor tooltip
  if (!$(".marquee_cursor-tooltip").length) {
    $("body").append(`
      <div class="marquee_cursor-tooltip" aria-hidden="true">
        <span class="marquee_pause-icon"></span>
        <span>Paused</span>
      </div>
    `);
  }

  let cursorTooltip = $(".marquee_cursor-tooltip");

  // place tooltip in the center of the marquee list before first hover
  function setCursorToMarqueeCenter() {
    let firstList = wrap.first().find(".marquee_list").first();

    if (!firstList.length) return;

    let rect = firstList[0].getBoundingClientRect();

    gsap.set(cursorTooltip, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
  }

  setCursorToMarqueeCenter();

  $(window).on("resize scroll", function () {
    if (!cursorTooltip.hasClass("is-visible")) {
      setCursorToMarqueeCenter();
    }
  });

  // switch which item is active
  function makeItemActive(myIndex) {
    items.removeClass("active");

    $(".marquee_list").each(function () {
      $(this).find(".marquee_item").eq(myIndex).addClass("active");
    });

    textItem.removeClass("active");
    textItem.eq(myIndex).addClass("active");
  }

  makeItemActive(3);

  // check if item is in center of wrapper
  function checkPosition() {
    let wrapCenter = wrap.offset().top + wrap.height() / 2;

    items.each(function () {
      let itemHeight = $(this).height() / 2;
      let offsetTop = $(this).offset().top + itemHeight;

      if (offsetTop < wrapCenter + itemHeight / 2 && offsetTop > wrapCenter) {
        let myIndex = $(this).index();
        makeItemActive(myIndex);
      }
    });
  }

  // create vertical loop
  let marquee = gsap.timeline({ repeat: -1 }).fromTo(
    ".marquee_track",
    { yPercent: 0 },
    {
      yPercent: -50,
      duration: duration,
      ease: "none",
      onUpdate: () => {
        checkPosition();
      }
    }
  );

  // move custom cursor
  function moveCursor(e) {
    gsap.to(cursorTooltip, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.12,
      ease: "power2.out",
      overwrite: true
    });
  }

  // pause loop on hover and replace cursor with tooltip
  wrap.on("mouseenter", function (e) {
    marquee.pause();

    // set immediately to mouse position so it does not animate from top
    gsap.set(cursorTooltip, {
      x: e.clientX,
      y: e.clientY
    });

    cursorTooltip.addClass("is-visible");
  });

  wrap.on("mousemove", function (e) {
    moveCursor(e);
  });

  wrap.on("mouseleave", function () {
    marquee.resume();
    cursorTooltip.removeClass("is-visible");

    // reset resting position back to center of marquee
    setCursorToMarqueeCenter();
  });
 

 
  gsap.registerPlugin(ScrollTrigger);

  function initStackingCardsParallax() {
    const cards = document.querySelectorAll("[data-stacking-cards-item]");
    if (cards.length < 2) return;

    const isMobile = isMobilePerformanceMode();

    /**
     * MOBILE VERSION
     * Simple reveal only.
     */
    if (isMobile) {
      cards.forEach((card) => {
        const img = card.querySelector("[data-stacking-cards-img]");

        gsap.set(card, {
          y: 40,
          autoAlpha: 0,
          willChange: "transform, opacity"
        });

        if (img) {
          gsap.set(img, {
            scale: 1.04
          });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true
          }
        });

        tl.to(card, {
          y: 0,
          autoAlpha: 1,
          ease: "expo.out",
          duration: 0.8
        });

        if (img) {
          tl.to(
            img,
            {
              scale: 1,
              ease: "expo.out",
              duration: 1
            },
            "<"
          );
        }
      });

      return;
    }

    /**
     * DESKTOP VERSION
     * Original scrub parallax behavior.
     */
    cards.forEach((card, i) => {
      if (i === 0) return;

      const previousCard = cards[i - 1];
      if (!previousCard) return;

      const previousCardImage = previousCard.querySelector(
        "[data-stacking-cards-img]"
      );

      let tl = gsap.timeline({
        defaults: {
          ease: "none",
          duration: 1
        },
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true
        }
      });

      tl.fromTo(previousCard, { yPercent: 0 }, { yPercent: 50 });

      if (previousCardImage) {
        tl.fromTo(
          previousCardImage,
          {
            rotate: 0,
            yPercent: 0
          },
          {
            rotate: -5,
            yPercent: -25
          },
          "<"
        );
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initStackingCardsParallax();
  });
 

 
  function initOverlappingSlider() {
    const inits = document.querySelectorAll("[data-overlap-slider-init]");
    if (!inits.length) return;

    const isMobile = isMobilePerformanceMode();

    inits.forEach((init) => {
      if (isMobile) {
        setupMobileOverlappingSlider(init);
      } else {
        setupDesktopOverlappingSlider(init);
      }
    });

    /**
     * MOBILE VERSION
     * No Draggable, no inertia, no touchAction:none.
     */
    function setupMobileOverlappingSlider(init) {
      const sliderId = init.getAttribute("id");

      const wrap = init.querySelector("[data-overlap-slider-collection]");
      const slider = init.querySelector("[data-overlap-slider-list]");
      const slides = Array.from(
        init.querySelectorAll("[data-overlap-slider-item]")
      );

      let prevBtn = null;
      let nextBtn = null;

      if (sliderId) {
        prevBtn = document.querySelector(
          `[data-overlap-slider-prev][data-overlap-slider-target="${sliderId}"]`
        );

        nextBtn = document.querySelector(
          `[data-overlap-slider-next][data-overlap-slider-target="${sliderId}"]`
        );
      }

      if (!prevBtn) prevBtn = init.querySelector("[data-overlap-slider-prev]");
      if (!nextBtn) nextBtn = init.querySelector("[data-overlap-slider-next]");

      if (!wrap || !slider || !slides.length) return;

      wrap.style.touchAction = "pan-y";
      wrap.style.userSelect = "";

      gsap.set(slider, {
        clearProps: "x"
      });

      gsap.set(slides, {
        clearProps: "x,scale,rotation,opacity,transformOrigin"
      });

      let currentIndex = 0;

      function updateButtons() {
        if (prevBtn) {
          prevBtn.disabled = currentIndex <= 0;
          prevBtn.setAttribute(
            "aria-disabled",
            currentIndex <= 0 ? "true" : "false"
          );
        }

        if (nextBtn) {
          nextBtn.disabled = currentIndex >= slides.length - 1;
          nextBtn.setAttribute(
            "aria-disabled",
            currentIndex >= slides.length - 1 ? "true" : "false"
          );
        }

        wrap.setAttribute(
          "aria-label",
          `Slide ${currentIndex + 1} of ${slides.length}`
        );
      }

      function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, slides.length - 1));

        const target = slides[currentIndex];
        if (!target) return;

        target.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest"
        });

        updateButtons();
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          goToSlide(currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          goToSlide(currentIndex + 1);
        });
      }

      wrap.setAttribute("role", "region");
      wrap.setAttribute("aria-roledescription", "carousel");

      gsap.from(slides, {
        y: 32,
        autoAlpha: 0,
        stagger: 0.08,
        ease: "expo.out",
        duration: 0.8,
        scrollTrigger: {
          trigger: init,
          start: "top 88%",
          once: true
        }
      });

      updateButtons();
    }

    /**
     * DESKTOP VERSION
     * Original Draggable/inertia behavior.
     */
    function setupDesktopOverlappingSlider(init) {
      const minScale = +(init.getAttribute("data-scale") ?? 0.45);
      const maxRotation = +(init.getAttribute("data-rotate") ?? -8);
      const minOpacity = +(init.getAttribute("data-opacity") ?? 0.55);
      const inertia = true;

      const sliderId = init.getAttribute("id");

      const wrap = init.querySelector("[data-overlap-slider-collection]");
      const slider = init.querySelector("[data-overlap-slider-list]");
      const slides = Array.from(
        init.querySelectorAll("[data-overlap-slider-item]")
      );

      let prevBtn = null;
      let nextBtn = null;

      if (sliderId) {
        prevBtn = document.querySelector(
          `[data-overlap-slider-prev][data-overlap-slider-target="${sliderId}"]`
        );

        nextBtn = document.querySelector(
          `[data-overlap-slider-next][data-overlap-slider-target="${sliderId}"]`
        );
      }

      if (!prevBtn) prevBtn = init.querySelector("[data-overlap-slider-prev]");
      if (!nextBtn) nextBtn = init.querySelector("[data-overlap-slider-next]");

      if (!wrap || !slider || !slides.length) {
        console.warn(
          "OverlappingSlider: missing required structure. Check Osmo Vault documentation please."
        );
        return;
      }

      wrap.style.touchAction = "none";
      wrap.style.userSelect = "none";

      let spacing = 0;
      let slideW = 0;
      let maxDrag = 0;
      let dragX = 0;
      let draggable;
      let active = false;
      let currentIndex = 0;

      function clamp(value) {
        if (maxDrag <= 0) return 0;
        return Math.min(Math.max(value, 0), maxDrag);
      }

      function updateButtons() {
        if (prevBtn) {
          prevBtn.disabled = currentIndex <= 0;
          prevBtn.setAttribute(
            "aria-disabled",
            currentIndex <= 0 ? "true" : "false"
          );
        }

        if (nextBtn) {
          nextBtn.disabled = currentIndex >= slides.length - 1;
          nextBtn.setAttribute(
            "aria-disabled",
            currentIndex >= slides.length - 1 ? "true" : "false"
          );
        }
      }

      function updateCurrentIndex() {
        currentIndex = spacing > 0 ? Math.round(dragX / spacing) : 0;
        currentIndex = Math.max(0, Math.min(currentIndex, slides.length - 1));

        updateButtons();
        wrap.setAttribute(
          "aria-label",
          `Slide ${currentIndex + 1} of ${slides.length}`
        );
      }

      function update() {
        gsap.set(slider, {
          x: -dragX
        });

        slides.forEach((slide, i) => {
          const threshold = i * spacing;
          const local = Math.max(0, dragX - threshold);
          const t = spacing > 0 ? Math.min(local / spacing, 1) : 0;

          gsap.set(slide, {
            x: local,
            scale: 1 - (1 - minScale) * t,
            rotation: maxRotation * t,
            opacity: 1 - (1 - minOpacity) * t,
            transformOrigin: "75% center"
          });
        });

        updateCurrentIndex();
      }

      function goToSlide(idx) {
        idx = Math.max(0, Math.min(idx, slides.length - 1));
        currentIndex = idx;

        const targetX = idx * spacing;

        gsap.to(
          {
            value: dragX
          },
          {
            value: targetX,
            duration: 0.35,
            ease: "power4.out",
            onUpdate: function () {
              dragX = clamp(this.targets()[0].value);
              gsap.set(slider, {
                x: -dragX
              });
              update();
            },
            onComplete: function () {
              dragX = clamp(targetX);
              update();
            }
          }
        );
      }

      function recalc() {
        if (!slides.length) return;

        const style = getComputedStyle(slides[0]);
        const gapRight = parseFloat(style.marginRight) || 0;

        slideW = slides[0].offsetWidth;
        spacing = slideW + gapRight;
        maxDrag = spacing * (slides.length - 1);

        dragX = clamp(dragX);
        update();

        if (draggable) {
          draggable.applyBounds({
            minX: -maxDrag,
            maxX: 0
          });
        }
      }

      draggable = Draggable.create(slider, {
        type: "x",
        bounds: {
          minX: -maxDrag,
          maxX: 0
        },
        inertia,
        maxDuration: 1,
        snap: (raw) => {
          const d = clamp(-raw);
          const idx = spacing > 0 ? Math.round(d / spacing) : 0;
          return -idx * spacing;
        },

        onDrag() {
          dragX = clamp(-this.x);
          update();
        },

        onThrowUpdate() {
          dragX = clamp(-this.x);
          update();
        },

        onThrowComplete() {
          updateCurrentIndex();
        },

        onDragEnd() {
          updateCurrentIndex();
        }
      })[0];

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          goToSlide(currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          goToSlide(currentIndex + 1);
        });
      }

      const ro = new ResizeObserver(() => {
        recalc();
      });

      ro.observe(init);

      const io = new IntersectionObserver(
        (entries) => {
          active = entries[0].isIntersecting;
        },
        {
          threshold: 0.25
        }
      );

      io.observe(init);

      wrap.setAttribute("role", "region");
      wrap.setAttribute("aria-roledescription", "carousel");
      wrap.setAttribute("aria-label", `Slide 1 of ${slides.length}`);

      function onKey(e) {
        if (!active) return;

        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goToSlide(currentIndex - 1);
        }

        if (e.key === "ArrowRight") {
          e.preventDefault();
          goToSlide(currentIndex + 1);
        }
      }

      window.addEventListener("keydown", onKey);

      recalc();
      updateButtons();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initOverlappingSlider();
  });
 

 
document.addEventListener("DOMContentLoaded", function () {
  const faqCards = document.querySelectorAll(".faq_card_wrap");

  faqCards.forEach((card) => {
    const checkbox = card.querySelector(".faq_card_checkbox");

    if (!checkbox) return;

    function updateCardState() {
      if (checkbox.checked) {
        card.classList.add("is-open");
      } else {
        card.classList.remove("is-open");
      }
    }

    checkbox.addEventListener("change", updateCardState);

    updateCardState();
  });
});
 

 
(() => {
  const SELECTOR = '[data-count="True"]';
  const DEFAULT_DURATION = 2000;
  const DEFAULT_DECIMALS = 0;
  const OBSERVER_THRESHOLD = 0.25;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const activeAnimations = new Set();

  let rafId = null;
  let observer = null;

  const isWebflowEditLike = () => {
    const html = document.documentElement;

    if (html.classList.contains("wf-design-mode") || html.classList.contains("w-editor")) {
      return true;
    }

    if (
      window.Webflow &&
      typeof window.Webflow.env === "function" &&
      (window.Webflow.env("editor") || window.Webflow.env("design"))
    ) {
      return true;
    }

    return false;
  };

  const parseNumber = (str) => {
    const clean = String(str).replace(/[^\d.,-]/g, "");
    return parseFloat(clean.replace(/,/g, "")) || 0;
  };

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const formatNumber = (value, decimals, useCommas) => {
    let text = value.toFixed(decimals);

    if (useCommas) {
      const parts = text.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      text = parts.join(".");
    }

    return text;
  };

  const extractParts = (rawText) => {
    const firstDigit = rawText.match(/\d/);
    const lastDigit = rawText.match(/\d(?!.*\d)/);

    const prefix = firstDigit ? rawText.slice(0, firstDigit.index) : "";
    const suffix = lastDigit ? rawText.slice(lastDigit.index + 1) : "";
    const useCommas = rawText.includes(",");

    return { prefix, suffix, useCommas };
  };

  const getTextTarget = (el) => {
    const child = el.querySelector("[data-count-text]");
    return child || el;
  };

  const tick = (now) => {
    activeAnimations.forEach((anim) => {
      const elapsed = now - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1);
      const eased = easeOutCubic(progress);
      const currentValue = anim.startValue + (anim.endValue - anim.startValue) * eased;

      anim.target.textContent =
        anim.prefix +
        formatNumber(currentValue, anim.decimals, anim.useCommas) +
        anim.suffix;

      if (progress >= 1) {
        anim.target.textContent = anim.finalText;
        activeAnimations.delete(anim);
      }
    });

    if (activeAnimations.size > 0) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  };

  const startLoop = () => {
    if (!rafId) rafId = requestAnimationFrame(tick);
  };

  const prepareAnimation = (el) => {
    if (el.dataset.countStarted === "true") return null;
    el.dataset.countStarted = "true";

    const target = getTextTarget(el);
    const rawText = (el.getAttribute("data-target") || target.textContent || "").trim();

    const duration = parseInt(el.getAttribute("data-duration"), 10);
    const decimals = parseInt(el.getAttribute("data-decimals"), 10);

    const safeDuration = Number.isFinite(duration) ? duration : DEFAULT_DURATION;
    const safeDecimals = Number.isFinite(decimals) ? decimals : DEFAULT_DECIMALS;

    const endValue = parseNumber(rawText);
    const { prefix, suffix, useCommas } = extractParts(rawText);

    return {
      target,
      startValue: 0,
      endValue,
      duration: Math.max(0, safeDuration),
      decimals: Math.max(0, safeDecimals),
      prefix,
      suffix,
      useCommas,
      finalText: rawText,
      startTime: performance.now()
    };
  };

  const startAnimation = (el) => {
    const anim = prepareAnimation(el);
    if (!anim) return;

    if (prefersReducedMotion || anim.duration === 0) {
      anim.target.textContent = anim.finalText;
      return;
    }

    anim.target.textContent =
      anim.prefix + formatNumber(0, anim.decimals, anim.useCommas) + anim.suffix;

    activeAnimations.add(anim);
    startLoop();
  };

  const initObserver = () => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        startAnimation(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: OBSERVER_THRESHOLD });
  };

  const initCounters = () => {
    if (isWebflowEditLike()) return;

    const elements = document.querySelectorAll(SELECTOR);
    if (!elements.length) return;

    if (!observer) initObserver();

    elements.forEach((el) => {
      if (el.dataset.countObserved === "true") return;
      el.dataset.countObserved = "true";
      observer.observe(el);
    });
  };

  const init = () => {
    initCounters();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
 

 
  gsap.registerPlugin(DrawSVGPlugin);

function initDrawRandomUnderline() {

  const svgVariants = [
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 20.9999C26.7762 16.2245 49.5532 11.5572 71.7979 14.6666C84.9553 16.5057 97.0392 21.8432 109.987 24.3888C116.413 25.6523 123.012 25.5143 129.042 22.6388C135.981 19.3303 142.586 15.1422 150.092 13.3333C156.799 11.7168 161.702 14.6225 167.887 16.8333C181.562 21.7212 194.975 22.6234 209.252 21.3888C224.678 20.0548 239.912 17.991 255.42 18.3055C272.027 18.6422 288.409 18.867 305 17.9999" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 24.2592C26.233 20.2879 47.7083 16.9968 69.135 13.8421C98.0469 9.5853 128.407 4.02322 158.059 5.14674C172.583 5.69708 187.686 8.66104 201.598 11.9696C207.232 13.3093 215.437 14.9471 220.137 18.3619C224.401 21.4596 220.737 25.6575 217.184 27.6168C208.309 32.5097 197.199 34.281 186.698 34.8486C183.159 35.0399 147.197 36.2657 155.105 26.5837C158.11 22.9053 162.993 20.6229 167.764 18.7924C178.386 14.7164 190.115 12.1115 201.624 10.3984C218.367 7.90626 235.528 7.06127 252.521 7.49276C258.455 7.64343 264.389 7.92791 270.295 8.41825C280.321 9.25056 296 10.8932 305 13.0242" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`,
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 29.5014C9.61174 24.4515 12.9521 17.9873 20.9532 17.5292C23.7742 17.3676 27.0987 17.7897 29.6575 19.0014C33.2644 20.7093 35.6481 24.0004 39.4178 25.5014C48.3911 29.0744 55.7503 25.7731 63.3048 21.0292C67.9902 18.0869 73.7668 16.1366 79.3721 17.8903C85.1682 19.7036 88.2173 26.2464 94.4121 27.2514C102.584 28.5771 107.023 25.5064 113.276 20.6125C119.927 15.4067 128.83 12.3333 137.249 15.0014C141.418 16.3225 143.116 18.7528 146.581 21.0014C149.621 22.9736 152.78 23.6197 156.284 24.2514C165.142 25.8479 172.315 17.5185 179.144 13.5014C184.459 10.3746 191.785 8.74853 195.868 14.5292C199.252 19.3205 205.597 22.9057 211.621 22.5014C215.553 22.2374 220.183 17.8356 222.979 15.5569C225.4 13.5845 227.457 11.1105 230.742 10.5292C232.718 10.1794 234.784 12.9691 236.164 14.0014C238.543 15.7801 240.717 18.4775 243.356 19.8903C249.488 23.1729 255.706 21.2551 261.079 18.0014C266.571 14.6754 270.439 11.5202 277.146 13.6125C280.725 14.7289 283.221 17.209 286.393 19.0014C292.321 22.3517 298.255 22.5014 305 22.5014" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`,
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.0039 32.6826C32.2307 32.8412 47.4552 32.8277 62.676 32.8118C67.3044 32.807 96.546 33.0555 104.728 32.0775C113.615 31.0152 104.516 28.3028 102.022 27.2826C89.9573 22.3465 77.3751 19.0254 65.0451 15.0552C57.8987 12.7542 37.2813 8.49399 44.2314 6.10216C50.9667 3.78422 64.2873 5.81914 70.4249 5.96641C105.866 6.81677 141.306 7.58809 176.75 8.59886C217.874 9.77162 258.906 11.0553 300 14.4892" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`,
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.99805 20.9998C65.6267 17.4649 126.268 13.845 187.208 12.8887C226.483 12.2723 265.751 13.2796 304.998 13.9998" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 29.8857C52.3147 26.9322 99.4329 21.6611 146.503 17.1765C151.753 16.6763 157.115 15.9505 162.415 15.6551C163.28 15.6069 165.074 15.4123 164.383 16.4275C161.704 20.3627 157.134 23.7551 153.95 27.4983C153.209 28.3702 148.194 33.4751 150.669 34.6605C153.638 36.0819 163.621 32.6063 165.039 32.2029C178.55 28.3608 191.49 23.5968 204.869 19.5404C231.903 11.3436 259.347 5.83254 288.793 5.12258C294.094 4.99476 299.722 4.82265 305 5.45025" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`
  ];

  // Add attributes to <svg> elements
  function decorateSVG(svgEl) {
    svgEl.setAttribute('preserveAspectRatio', 'none');
    svgEl.querySelectorAll('path').forEach(path => {
      path.setAttribute('stroke', 'currentColor');
    });
  }

  let nextIndex = null;

  document.querySelectorAll('[data-draw-line]').forEach(container => {
    const box = container.querySelector('[data-draw-line-box]');
    if (!box) return;

    let enterTween = null;
    let leaveTween = null;

    container.addEventListener('mouseenter', () => {
      // Don't restart if still playing
      if (enterTween && enterTween.isActive()) return;
      if (leaveTween && leaveTween.isActive()) leaveTween.kill();

      // Random Start
      if (nextIndex === null) {
        nextIndex = Math.floor(Math.random() * svgVariants.length);
      }

      // Animate Draw
      box.innerHTML = svgVariants[nextIndex];
      const svg = box.querySelector('svg');
      if (svg) {
        decorateSVG(svg);
        const path = svg.querySelector('path');
        if (path) {
          gsap.set(path, { drawSVG: '0%' });
          enterTween = gsap.to(path, {
            duration: 0.5,
            drawSVG: '100%',
            ease: 'power2.inOut',
            onComplete: () => { enterTween = null; }
          });
        }
      }

      // Advance for next hover across all items
      nextIndex = (nextIndex + 1) % svgVariants.length;
    });

    container.addEventListener('mouseleave', () => {
      const path = box.querySelector('path');
      if (!path) return;

      const playOut = () => {
        // Don't restart if still drawing out
        if (leaveTween && leaveTween.isActive()) return;
        leaveTween = gsap.to(path, {
          duration: 0.5,
          drawSVG: '100% 100%',
          ease: 'power2.inOut',
          onComplete: () => {
            leaveTween = null;
            box.innerHTML = ''; // remove SVG when done
          }
        });
      };

      if (enterTween && enterTween.isActive()) {
        // Wait until draw-in finishes
        enterTween.eventCallback('onComplete', playOut);
      } else {
        playOut();
      }
    });
  });
}

// Initialize Draw Random Underline
document.addEventListener('DOMContentLoaded', function() {
  initDrawRandomUnderline();
});
 
