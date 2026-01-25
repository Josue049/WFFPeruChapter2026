(function ($) {
  "use strict";

  /* =========================
     NAVBAR DROPDOWNS
  ========================= */

  function handleNavbarDropdowns() {
    const isDesktop = window.matchMedia('(hover: hover)').matches;

    $('.navbar .dropdown').off('mouseenter mouseleave');

    if (isDesktop) {
      $('.navbar .dropdown')
        .on('mouseenter', function () {
          $(this).addClass('show');
          $(this).find('.dropdown-menu').addClass('show');
        })
        .on('mouseleave', function () {
          $(this).removeClass('show');
          $(this).find('.dropdown-menu').removeClass('show');
        });
    }
    // En móvil/tablet Bootstrap maneja el click
  }

  /* =========================
     PERFIL – TOUCH FRIENDLY
  ========================= */

  function handlePerfilTouch() {
    const isTouch = window.matchMedia('(hover: none)').matches;

    if (isTouch) {
      $('.perfil').on('click', function (e) {
        e.stopPropagation();

        const $this = $(this);

        // Cierra los demás
        $('.perfil').not($this).removeClass('active');

        // Abre / cierra el actual
        $this.toggleClass('active');
      });

      // Tap fuera cierra todo
      $(document).on('click', function () {
        $('.perfil').removeClass('active');
      });
    }
  }

  /* =========================
     INIT
  ========================= */

  $(document).ready(function () {
    handleNavbarDropdowns();
    handlePerfilTouch();
    $(window).on('resize', handleNavbarDropdowns);
  });

  /* =========================
     BOTÓN VOLVER ARRIBA
  ========================= */

  const $backToTop = $('.bloque-subir');

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 100) {
      $backToTop.fadeIn('slow');
    } else {
      $backToTop.fadeOut('slow');
    }
  });

  $backToTop.on('click', function (e) {
    e.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, 1200);
  });

  const imagenes = document.querySelectorAll('.clickable-img');

imagenes.forEach(img => {
  let timer;
  
  img.addEventListener('touchstart', e => {
    timer = setTimeout(() => {
      window.open(img.src, '_blank');
    }, 500); // 500 ms de presión larga
  });

  img.addEventListener('touchend', e => {
    clearTimeout(timer);
  });
});


})(jQuery);
