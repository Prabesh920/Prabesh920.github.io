// literature.js

// Initialize AOS animations
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true,
});

// Optional: Smooth scroll for navigation links
const navLinks = document.querySelectorAll('nav a[href^="#"]');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Optional: Highlight active section in nav (only for single-page use)
// If you're using multiple HTML files, skip this section

// const sections = document.querySelectorAll('section');
// window.addEventListener('scroll', () => {
//   let current = '';
//   sections.forEach(section => {
//     const sectionTop = section.offsetTop - 100;
//     if (scrollY >= sectionTop) {
//       current = section.getAttribute('id');
//     }
//   });
//   navLinks.forEach(link => {
//     link.classList.remove('active');
//     if (link.getAttribute('href').includes(current)) {
//       link.classList.add('active');
//     }
//   });
// });
