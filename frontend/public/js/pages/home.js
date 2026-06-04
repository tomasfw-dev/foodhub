/**
 * Landing home — navbar, scroll suave y animaciones.
 */
(function ($) {
  'use strict';

  var $navbar = $('#navbar');
  var $toggle = $('.navbar__toggle');
  var $menu = $('#navbar-menu');
  var $body = $('body');
  var scrollOffset = 80;

  function setNavbarState() {
    if ($(window).scrollTop() > 40) {
      $navbar.addClass('navbar--scrolled');
    } else {
      $navbar.removeClass('navbar--scrolled');
    }
  }

  function closeMobileMenu() {
    $toggle.removeClass('is-active').attr('aria-expanded', 'false').attr('aria-label', 'Abrir menú');
    $menu.removeClass('is-open');
    $navbar.removeClass('navbar--menu-open');
    $body.removeClass('menu-open');
  }

  function openMobileMenu() {
    $toggle.addClass('is-active').attr('aria-expanded', 'true').attr('aria-label', 'Cerrar menú');
    $menu.addClass('is-open');
    $navbar.addClass('navbar--menu-open');
    $body.addClass('menu-open');
  }

  function smoothScrollTo(target) {
    var $target = $(target);
    if (!$target.length) return;

    $('html, body').animate(
      {
        scrollTop: $target.offset().top - scrollOffset,
      },
      600,
      'swing'
    );
  }

  function updateActiveNavLink() {
    var scrollPos = $(window).scrollTop() + scrollOffset + 20;

    $('.navbar__link[data-scroll]').each(function () {
      var $link = $(this);
      var href = $link.attr('href');
      if (!href || href.charAt(0) !== '#') return;

      var $section = $(href);
      if (
        $section.length &&
        $section.offset().top <= scrollPos &&
        $section.offset().top + $section.outerHeight() > scrollPos
      ) {
        $('.navbar__link').removeClass('is-active');
        $link.addClass('is-active');
      }
    });
  }

  function initReveal() {
    var $reveals = $('.reveal');

    if (!('IntersectionObserver' in window)) {
      $reveals.addClass('is-visible');
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            $(entry.target).addClass('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    $reveals.each(function () {
      observer.observe(this);
    });
  }

  $(function () {
    setNavbarState();
    initReveal();

    $(window).on('scroll', function () {
      setNavbarState();
      updateActiveNavLink();
    });

    $toggle.on('click', function () {
      if ($menu.hasClass('is-open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    $(document).on('click', '[data-scroll]', function (e) {
      var href = $(this).attr('href');
      if (!href || href.charAt(0) !== '#') return;

      e.preventDefault();
      smoothScrollTo(href);
      closeMobileMenu();
    });

    $('.navbar__link[data-scroll]').on('click', function () {
      closeMobileMenu();
    });

    $(document).on('keydown', function (e) {
      if (e.key === 'Escape') closeMobileMenu();
    });
  });
})(jQuery);
