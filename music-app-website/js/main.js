// Melodyx Main Site Controller

document.addEventListener('DOMContentLoaded', () => {
  // Update all current year instances in footer
  document.querySelectorAll('.current-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Dynamic config binding
  const config = window.APP_CONFIG || {};
  document.querySelectorAll('[data-config]').forEach(el => {
    const prop = el.getAttribute('data-config');
    if (config[prop]) {
      el.textContent = config[prop];
    }
  });

  // FAQ Accordion toggles if present
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });

  // Navbar shadow on scroll
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.style.boxShadow = '0 4px 20px -2px rgba(0, 0, 0, 0.06)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    });
  }
});

