// Initial load of RTL state from localStorage to prevent layout flashing
if (localStorage.getItem('rtl') === 'true') {
    document.documentElement.setAttribute('dir', 'rtl');
} else {
    document.documentElement.removeAttribute('dir');
}

document.addEventListener('DOMContentLoaded', () => {

    // ── Scroll Progress Bar ──────────────────────────────
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = Math.min(scrolled, 100) + '%';
    }, { passive: true });

    // ── Navbar scroll shrink ─────────────────────────────
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar && navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // ── Theme Toggle ─────────────────────────────────────
    const themeToggleBtn = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '&#9728;';
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            document.body.setAttribute('data-theme', isDark ? '' : 'dark');
            if (isDark) document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
            themeToggleBtn.innerHTML = isDark ? '&#9789;' : '&#9728;';
        });
    }

    // ── Mobile Menu ───────────────────────────────────────
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        // Dark backdrop (covers the ~60px left gap — clicking it closes the drawer)
        const backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        backdrop.style.cssText = 'position:fixed;inset:0;z-index:999;display:none;background:rgba(0,0,0,0.35);';
        document.body.appendChild(backdrop);

        const openMenu = () => {
            navLinks.classList.add('active');
            backdrop.style.display = 'block';
            document.body.style.overflow = 'hidden';
            mobileMenuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        };
        const closeMenu = () => {
            navLinks.classList.remove('active');
            backdrop.style.display = 'none';
            document.body.style.overflow = '';
            mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        };

        // Single hamburger button toggles open/close
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.contains('active') ? closeMenu() : openMenu();
        });

        // Clicking the backdrop (left gap) also closes
        backdrop.addEventListener('click', closeMenu);

        // Clicking a non-dropdown link closes the drawer
        navLinks.querySelectorAll('a:not(.dropdown > a)').forEach(a => {
            a.addEventListener('click', closeMenu);
        });
    }

    // ── Active Navbar Link ───────────────────────────────
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
            // If it's inside a dropdown, highlight the parent too
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                const parentLink = parentDropdown.querySelector('a');
                if (parentLink) parentLink.classList.add('active');
            }
        }
    });

    // ── Mobile Dropdown ───────────────────────────────────
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('click', e => {
            if (window.innerWidth <= 1022) {
                const link = e.target.closest('a');
                if (link && link.nextElementSibling) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            }
        });
    });

    // ── Skeleton Loader Removal ───────────────────────────
    document.querySelectorAll('.skeleton').forEach(skeleton => {
        const img = skeleton.querySelector('img');
        if (img) {
            const remove = () => skeleton.classList.remove('skeleton');
            img.complete ? remove() : img.addEventListener('load', remove);
        } else {
            setTimeout(() => skeleton.classList.remove('skeleton'), 800);
        }
    });

    // ── Reveal on Scroll (IntersectionObserver) ───────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ── Animated Counters ─────────────────────────────────
    const animateCounter = (el) => {
        const target = +el.getAttribute('data-target');
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        const tick = () => {
            current += increment;
            if (current < target) {
                el.textContent = Math.ceil(current).toLocaleString();
                requestAnimationFrame(tick);
            } else {
                el.textContent = target.toLocaleString();
            }
        };
        tick();
    };

    // Counter on the homepage trust bar (starts immediately)
    const inlineCounter = document.querySelector('.live-counter');
    if (inlineCounter) animateCounter(inlineCounter);

    // Counters on the About page stats bar (start when visible)
    const statCounters = document.querySelectorAll('.about-stat-number');
    if (statCounters.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statCounters.forEach(el => counterObserver.observe(el));
    }

    // ── Smooth Scroll for anchor links ───────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

});

// --- RTL / LTR Toggle (Navbar icon button) ---
  const rtlBtn = document.getElementById('rtl-toggle');
  if (rtlBtn) {
    const html = document.documentElement;
    // Set initial button text based on current dir attribute
    if (html.getAttribute('dir') === 'rtl') {
      rtlBtn.title = 'Switch to LTR';
      rtlBtn.textContent = 'LTR';
    } else {
      rtlBtn.title = 'Toggle RTL / LTR';
      rtlBtn.textContent = 'RTL';
    }

    rtlBtn.onclick = () => {
      if (html.getAttribute('dir') === 'rtl') {
        html.removeAttribute('dir');
        localStorage.setItem('rtl', 'false');
        rtlBtn.title = 'Toggle RTL / LTR';
        rtlBtn.textContent = 'RTL';
      } else {
        html.setAttribute('dir', 'rtl');
        localStorage.setItem('rtl', 'true');
        rtlBtn.title = 'Switch to LTR';
        rtlBtn.textContent = 'LTR';
      }
    };
  }



  // Footer Subscribe Form
  const footerForm = document.getElementById('footer-nl-form');
  if (footerForm) {
    footerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('footer-nl-email');
      const success = document.getElementById('footer-nl-success');
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
      if (!isValid) { email.style.borderColor = '#e05555'; return; }
      email.style.borderColor = '';
      footerForm.style.display = 'none';
      if (success) success.classList.add('show');
    });
  }
