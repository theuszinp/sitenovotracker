document.addEventListener('DOMContentLoaded', () => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => motionPreference.matches ? 'auto' : 'smooth';
  const getScrollOffset = () => {
    const nav = document.querySelector('header');
    if (!nav) return 96;
    return Math.ceil(nav.getBoundingClientRect().bottom + 16);
  };
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.rel = 'noopener noreferrer';
  });

  // =============================================
  // AVISO DA CORRETORA DE SEGUROS
  // =============================================
  const insuranceNotice = document.getElementById('insuranceNotice');
  const insuranceNoticeClose = document.getElementById('insuranceNoticeClose');
  let noticeWasClosed = false;
  try { noticeWasClosed = sessionStorage.getItem('insuranceNoticeClosed') === 'true'; } catch (_) {}

  if (insuranceNotice && !noticeWasClosed) {
    // Evita interromper a primeira leitura ou o preenchimento da cotação.
    window.setTimeout(() => {
      if (!window.matchMedia('(max-width: 768px)').matches &&
          !document.activeElement?.closest('form')) insuranceNotice.classList.add('show');
    }, 15000);
  }

  insuranceNoticeClose?.addEventListener('click', () => {
    insuranceNotice?.classList.remove('show');
    try { sessionStorage.setItem('insuranceNoticeClosed', 'true'); } catch (_) {}
  });

  // =============================================
  // CARROSSEL PRINCIPAL
  // =============================================
  const heroCarousel = document.querySelector('.hero-carousel');
  const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
  const carouselDots = Array.from(document.querySelectorAll('.carousel-dot'));
  const previousSlide = document.querySelector('.carousel-control.prev');
  const nextSlide = document.querySelector('.carousel-control.next');
  let currentSlide = 0;
  let carouselTimer;
  let touchStartX = 0;
  const pauseButton = document.querySelector('.carousel-pause');
  let carouselPaused = motionPreference.matches;

  const showSlide = (index) => {
    if (!heroSlides.length) return;
    currentSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === currentSlide);
      slide.setAttribute('aria-hidden', String(slideIndex !== currentSlide));
    });
    carouselDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentSlide;
      dot.classList.toggle('active', isActive);
      dot.removeAttribute('aria-selected');
      dot.setAttribute('aria-pressed', String(isActive));
    });
  };

  const startCarousel = () => {
    window.clearInterval(carouselTimer);
    if (carouselPaused || motionPreference.matches || document.hidden ||
        heroCarousel?.matches(':hover') || heroCarousel?.contains(document.activeElement) || heroSlides.length < 2) return;
    carouselTimer = window.setInterval(() => showSlide(currentSlide + 1), 6500);
  };
  const updatePauseButton = () => {
    if (!pauseButton) return;
    const paused = carouselPaused || motionPreference.matches;
    pauseButton.textContent = paused ? 'Retomar' : 'Pausar';
    pauseButton.setAttribute('aria-label', paused ? 'Retomar apresentação' : 'Pausar apresentação');
    pauseButton.hidden = motionPreference.matches;
  };
  pauseButton?.addEventListener('click', () => {
    carouselPaused = !carouselPaused;
    updatePauseButton();
    startCarousel();
  });
  motionPreference.addEventListener('change', () => {
    carouselPaused = motionPreference.matches;
    updatePauseButton();
    startCarousel();
  });
  document.addEventListener('visibilitychange', startCarousel);
  showSlide(0);
  updatePauseButton();

  previousSlide?.addEventListener('click', () => { showSlide(currentSlide - 1); startCarousel(); });
  nextSlide?.addEventListener('click', () => { showSlide(currentSlide + 1); startCarousel(); });
  carouselDots.forEach((dot, index) => dot.addEventListener('click', () => { showSlide(index); startCarousel(); }));
  heroCarousel?.addEventListener('mouseenter', () => window.clearInterval(carouselTimer));
  heroCarousel?.addEventListener('mouseleave', startCarousel);
  heroCarousel?.addEventListener('focusin', () => window.clearInterval(carouselTimer));
  heroCarousel?.addEventListener('focusout', () => setTimeout(startCarousel, 0));
  heroCarousel?.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
    window.clearInterval(carouselTimer);
  }, { passive: true });
  heroCarousel?.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) showSlide(currentSlide + (distance < 0 ? 1 : -1));
    startCarousel();
  }, { passive: true });
  startCarousel();

  // =============================================
  // MENU MOBILE
  // =============================================
  const mobileMenuBtn = document.getElementById('mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  const navLinksItems = document.querySelectorAll('.nav-links a');
  const sectionNavLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const setActiveNavLink = (targetId) => {
    sectionNavLinks.forEach((link) => {
      const active = link.getAttribute('href') === targetId;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
 
  if (mobileMenuBtn && navLinks) {
    const setMenuOpen = (open) => {
      navLinks.classList.toggle('active', open);
      mobileMenuBtn.setAttribute('aria-expanded', String(open));
      mobileMenuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) icon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    };
    mobileMenuBtn.addEventListener('click', () => {
      const open = !navLinks.classList.contains('active');
      setMenuOpen(open);
    });
 
    navLinksItems.forEach((item) => {
      item.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
          setMenuOpen(false);
        }
      });
    });
 
    // Fecha menu ao clicar fora
    document.addEventListener('click', (e) => {
      if (
        navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !mobileMenuBtn.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('active')) {
        setMenuOpen(false);
        mobileMenuBtn.focus();
      }
    });
    document.addEventListener('focusin', (event) => {
      if (!navLinks.contains(event.target) && !mobileMenuBtn.contains(event.target)) setMenuOpen(false);
    });
    window.matchMedia('(max-width: 768px)').addEventListener('change', () => setMenuOpen(false));
  }
 
  // =============================================
  // HEADER SHADOW + BACK TO TOP
  // =============================================
  const header = document.querySelector('header');
  const backToTop = document.getElementById('backToTop');
 
  const onScrollUI = () => {
    const y = window.scrollY || 0;
    if (header) {
      header.classList.toggle('scrolled', y > 24);
    }
    if (backToTop) {
      backToTop.style.display = y > 600 ? 'flex' : 'none';
    }
  };
 
  window.addEventListener('scroll', onScrollUI, { passive: true });
  onScrollUI();
 
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
    });
  }
 
  // =============================================
  // REVEAL ON SCROLL (IntersectionObserver)
  // =============================================
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    revealEls.forEach((el) => el.classList.add('reveal-pending'));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('show');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.10 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('show'));
  }

  // =============================================
  // NAV ACTIVE STATE
  // =============================================
  const sections = Array.from(sectionNavLinks)
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sectionNavLinks.length) {
    const initialTarget = window.location.hash && document.getElementById(window.location.hash.slice(1))
      ? window.location.hash
      : sectionNavLinks[0].getAttribute('href');
    setActiveNavLink(initialTarget);
  }

  if (sections.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveNavLink(`#${visibleEntry.target.id}`);
        }
      },
      {
        rootMargin: '-28% 0px -55% 0px',
        threshold: [0.2, 0.35, 0.55],
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  } else if (sectionNavLinks.length) {
    setActiveNavLink(sectionNavLinks[0].getAttribute('href'));
  }
 
  // =============================================
  // FAQ ACCORDION
  // =============================================
  const faqItems = document.querySelectorAll('.faq-item');
  const setFaqOpen = (item, open) => {
    item.classList.toggle('open', open);
    item.querySelector('.faq-q')?.setAttribute('aria-expanded', String(open));
    const answer = item.querySelector('.faq-a');
    if (answer) answer.hidden = !open;
  };
  faqItems.forEach((item, index) => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;
    btn.id = `faq-question-${index}`;
    answer.id = `faq-answer-${index}`;
    btn.setAttribute('aria-controls', answer.id);
    answer.setAttribute('aria-labelledby', btn.id);
    answer.setAttribute('role', 'region');
    setFaqOpen(item, item.classList.contains('open'));
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach((x) => setFaqOpen(x, false));
      if (!isOpen) setFaqOpen(item, true);
    });
  });
 
  // =============================================
  // PLANOS → FORMULÁRIO
  // =============================================
  const planSelect = document.getElementById('plano');
  const pickPlanButtons = document.querySelectorAll('.pick-plan');
 
  const scrollToQuote = () => {
    const quote = document.getElementById('cotacao');
    if (quote) {
      const offset = getScrollOffset();
      const top = quote.getBoundingClientRect().top + window.scrollY - offset;
      document.getElementById('nome')?.focus({ preventScroll: true });
      window.scrollTo({ top, behavior: scrollBehavior() });
    }
  };
 
  pickPlanButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan') || '';
      if (planSelect && plan) planSelect.value = plan;
      scrollToQuote();
    });
  });
 
  // =============================================
  // MÁSCARA TELEFONE (BR)
  // =============================================
  const telefoneInput = document.getElementById('telefone');
 
  const maskPhoneBR = (value) => {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      const p1 = digits.slice(0, 2);
      const p2 = digits.slice(2, 6);
      const p3 = digits.slice(6, 10);
      if (!p2) return p1 ? `(${p1}` : '';
      if (!p3) return `(${p1}) ${p2}`;
      return `(${p1}) ${p2}-${p3}`;
    } else {
      const p1 = digits.slice(0, 2);
      const p2 = digits.slice(2, 7);
      const p3 = digits.slice(7, 11);
      if (!p2) return p1 ? `(${p1}` : '';
      if (!p3) return `(${p1}) ${p2}`;
      return `(${p1}) ${p2}-${p3}`;
    }
  };
 
  if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
      const digitsBeforeCaret = e.target.value.slice(0, e.target.selectionStart).replace(/\D/g, '').length;
      e.target.value = maskPhoneBR(e.target.value);
      let position = 0;
      let count = 0;
      while (position < e.target.value.length && count < digitsBeforeCaret) {
        if (/\d/.test(e.target.value[position])) count++;
        position++;
      }
      try { e.target.setSelectionRange(position, position); } catch (_) {}
    });
  }
 
  // =============================================
  // VALIDAÇÃO + FORMULÁRIO WHATSAPP
  // =============================================
  const form = document.getElementById('whatsappForm');
 
  const showError = (fieldId, errorId, msg) => {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (field) { field.classList.add('error'); field.setAttribute('aria-invalid', 'true'); }
    if (errorEl) errorEl.textContent = msg;
  };
 
  const clearError = (fieldId, errorId) => {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (field) { field.classList.remove('error'); field.removeAttribute('aria-invalid'); }
    if (errorEl) errorEl.textContent = '';
  };
 
  // Limpa erros no blur
  ['nome', 'telefone', 'veiculo'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute('aria-describedby', `erro-${id}`);
      el.addEventListener('input', () => clearError(id, `erro-${id}`));
      el.addEventListener('change', () => clearError(id, `erro-${id}`));
    }
  });
 
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
 
      const nome = document.getElementById('nome')?.value?.trim() || '';
      const telefone = document.getElementById('telefone')?.value?.trim() || '';
      const veiculo = document.getElementById('veiculo')?.value || '';
      const plano = document.getElementById('plano')?.value || '';
 
      let hasError = false;
 
      // Validação nome
      if (nome.length < 3) {
        showError('nome', 'erro-nome', 'Por favor, informe seu nome completo.');
        hasError = true;
      } else {
        clearError('nome', 'erro-nome');
      }
 
      // Validação telefone (mínimo 14 chars com máscara = 10 dígitos)
      const digits = telefone.replace(/\D/g, '');
      if (!/^[1-9]{2}\d{8,9}$/.test(digits) || /^(\d)\1+$/.test(digits)) {
        showError('telefone', 'erro-telefone', 'Informe um WhatsApp válido com DDD.');
        hasError = true;
      } else {
        clearError('telefone', 'erro-telefone');
      }
 
      // Validação veículo
      if (!veiculo) {
        showError('veiculo', 'erro-veiculo', 'Selecione o tipo de veículo.');
        hasError = true;
      } else {
        clearError('veiculo', 'erro-veiculo');
      }
 
      if (hasError) {
        // Scrolla até o primeiro erro
        const firstError = form.querySelector('.error');
        if (firstError) {
          const top = firstError.getBoundingClientRect().top + window.scrollY - getScrollOffset();
          firstError.focus({ preventScroll: true });
          window.scrollTo({ top, behavior: scrollBehavior() });
        }
        return;
      }
 
      // Monta mensagem
      const numeroDestino = '5571984553633';
      const linhas = [];
      linhas.push(`Olá! Me chamo *${nome}*.`);
      linhas.push(`Gostaria de uma cotação para: *${veiculo}*.`);
      linhas.push(plano
        ? `Plano de interesse: *${plano}*.`
        : `Plano: *Quero recomendação*.`
      );
      linhas.push(`Meu contato/WhatsApp: ${telefone}`);
 
      const mensagem = linhas.join('\n');
      const url = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensagem)}`;
 
      // Feedback visual no botão
      const submitBtn = document.getElementById('submitBtn');
      const submitText = document.getElementById('submitText');
      const submitIcon = document.getElementById('submitIcon');
 
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitText) submitText.textContent = 'Abrindo WhatsApp...';
        if (submitIcon) {
          submitIcon.classList.remove('fa-whatsapp');
          submitIcon.classList.add('fa-spinner', 'fa-spin');
        }
      }
 
      const status = document.getElementById('formStatus');
      if (status) {
        status.textContent = 'Finalize enviando a mensagem no WhatsApp. Se a nova aba não abrir, ';
        const fallback = document.createElement('a');
        fallback.href = url;
        fallback.textContent = 'continue por este link.';
        status.append(fallback);
      }
      window.open(url, '_blank', 'noopener,noreferrer');
 
      // Restaura botão após 3s
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitText) submitText.textContent = 'Continuar no WhatsApp';
          if (submitIcon) {
            submitIcon.classList.remove('fa-spinner', 'fa-spin');
            submitIcon.classList.add('fa-whatsapp');
          }
        }
      }, 3000);
    });
  }
 
  // =============================================
  // SMOOTH SCROLL para links âncora
  // =============================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.getElementById(targetId.slice(1));
      if (target) {
        e.preventDefault();
        setActiveNavLink(targetId);
        const offset = getScrollOffset();
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        window.scrollTo({ top, behavior: scrollBehavior() });
      }
    });
  });
 
});
