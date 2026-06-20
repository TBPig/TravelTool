/*!
* Adapted from Start Bootstrap Agency v7.0.12
* Modified for Travel Route Assistant
*/

window.addEventListener('DOMContentLoaded', () => {

    // Navbar shrink on scroll
    const navbarShrink = function () {
        const navbar = document.body.querySelector('#mainNav');
        if (!navbar) return;
        if (window.scrollY === 0) {
            navbar.classList.remove('navbar-shrink');
        } else {
            navbar.classList.add('navbar-shrink');
        }
    };

    navbarShrink();
    document.addEventListener('scroll', navbarShrink);

    // Mobile navbar toggler (vanilla JS - no Bootstrap dependency)
    const toggler = document.body.querySelector('.navbar-toggler');
    const collapse = document.body.querySelector('#navbarResponsive');
    if (toggler && collapse) {
        toggler.addEventListener('click', () => {
            collapse.classList.toggle('show');
            toggler.setAttribute('aria-expanded', collapse.classList.contains('show'));
        });

        // Close mobile menu when clicking a link
        const navLinks = collapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                collapse.classList.remove('show');
                toggler.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Set active nav link based on current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('#navbarResponsive .nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.replace('./', ''))) {
            link.classList.add('active');
        }
    });

});
