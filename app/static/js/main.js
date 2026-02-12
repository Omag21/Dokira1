
// Animation au défilement 
document.addEventListener('DOMContentLoaded', function(){
    const observer = document.querySelectorAll('.fade-in');
    const fadeInObserver = function(){
        observer.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            if(elementTop < window.innerHeight - elementVisible){
                element.classList.add('active');
            }   
        });
    };
    // Vérifier l'animation au chargement de la page
    fadeInObserver();
    // Vérifier l'animation au défilement
    window.addEventListener('scroll', fadeInObserver);

    // Animation des compteurs
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(number => {
        const updateCount = () => {
            const target = +number.getAttribute('data-count');
            const count = +number.innerText;
            const increment = target / 200;
            
            if(count < target){
                number.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 10);
            } else {
                number.innerText = target;
            } 
        };
        updateCount();
    });
});

// ----------- MODAL RENDEZ-VOUS -----------
function ouvrirRdvModal(medecinId, nomComplet, specialite, adresseCabinet) {
    // Remplir les champs du modal
    document.getElementById('medecin_id').value = medecinId;
    document.getElementById('medecin_nom').value = nomComplet;
    document.getElementById('specialite').value = specialite;
    document.getElementById('adresse_cabinet').value = adresseCabinet;
    // Réinitialiser les autres champs
    document.getElementById('nom_patient').value = '';
    document.getElementById('prenom_patient').value = '';
    document.getElementById('contact_patient').value = '';
    document.getElementById('maladie').value = '';
    document.getElementById('type_consultation').value = '';
    // Ouvrir le modal avec Bootstrap 5
    const modal = new bootstrap.Modal(document.getElementById('rdvModal'));
    modal.show();
}

// Gestion de la soumission du formulaire
document.addEventListener('DOMContentLoaded', function() {
    const rdvForm = document.getElementById('rdvForm');
    
    if(rdvForm) {
        rdvForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Récupérer les données du formulaire
            const formData = new FormData(rdvForm);
            const data = Object.fromEntries(formData);
            
            try {
                // Envoyer la demande au backend
                const response = await fetch('/api/rendez-vous', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('✅ Votre demande de rendez-vous a été envoyée avec succès !');
                    // Fermer le modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('rdvModal'));
                    modal.hide();
                    // Réinitialiser le formulaire
                    rdvForm.reset();
                } else {
                    alert('❌ Erreur : ' + (result.error || 'Impossible d\'envoyer la demande'));
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('❌ Erreur de connexion au serveur');
            }
        });
    }
});