// Animation au défilement 
document.addEventListener('DOMContentLoaded', function(){
    const observer = new document.querySelectorAll('.fade-in');
    const fadeInObserver = function(){
        observer.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            if(elementTop < window.innerHeight - elementVisible){
                element.classList.add('active');
            }   
        });
    };
    //Vérifier l'animation au chargemetn de la page
    fadeInObserver();
    //Vérifier l'animation au défilement
    window.addEventListener('scroll', fadeInObserver);

   // Animation des compteurs
   const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(number => {
        const updateCount = () => {
            const target = +number.getAttribute('data-target');
            const count = +number.innerText;
            const increment = target / 200; // Vitesse de l'animation
        };
            if(count < target){
                number.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 10);
            } else {
                number.innerText = target;
            } 
                   
     });

        updateCount();

     
});
// Fin de l'animation au défilement
// Menu mobile
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
menuToggle.addEventListener('click', function(){
    navLinks.classList.toggle('active');
});
// Fin du menu mobile
// Smooth scroll pour les liens de navigation
const navItems = document.querySelectorAll('#nav-links a');
navItems.forEach(item => {
    item.addEventListener('click', function(e){
        e.preventDefault();     
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        window.scrollTo({
            top: targetSection.offsetTop - 60, // Ajuster en fonction de la hauteur du header
            behavior: 'smooth'
        });
        // Fermer le menu mobile après le clic
        navLinks.classList.remove('active');
    });
});