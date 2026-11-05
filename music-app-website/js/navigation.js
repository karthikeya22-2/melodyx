// Melodyx Navigation & Responsive Menu Controller

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        drawer.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>`;
      } else {
        drawer.classList.add('open');
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.innerHTML = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>`;
      }
    });

    // Close drawer when clicking any link
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>`;
      });
    });
  }

  // Active navigation link highlighting based on current pathname
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});

