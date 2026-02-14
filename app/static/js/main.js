let specialistsCache = [];

document.addEventListener('DOMContentLoaded', () => {
    setupHeroRdvButton();
    setupFadeInAnimation();
    setupStatsCounter();
    loadSpecialistes();
    setupConsultationForm();
});

function setupHeroRdvButton() {
    const btn = document.getElementById('heroRdvBtn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const section = document.getElementById('specialists');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

function setupFadeInAnimation() {
    const elements = document.querySelectorAll('.fade-in');
    const reveal = () => {
        elements.forEach((el) => {
            const top = el.getBoundingClientRect().top;
            if (top < window.innerHeight - 120) {
                el.classList.add('active');
            }
        });
    };
    reveal();
    window.addEventListener('scroll', reveal);
}

function setupStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach((el) => {
        const targetRaw = el.getAttribute('data-count') || '0';
        const target = Number(targetRaw);
        if (!Number.isFinite(target)) return;

        let current = 0;
        const steps = 60;
        const increment = target / steps;

        const tick = () => {
            current += increment;
            if (current < target) {
                el.textContent = Number.isInteger(target)
                    ? String(Math.floor(current))
                    : current.toFixed(1);
                requestAnimationFrame(tick);
            } else {
                el.textContent = targetRaw;
            }
        };

        tick();
    });
}

async function loadSpecialistes() {
    const grid = document.getElementById('specialistsGrid');
    if (!grid) return;

    try {
        const response = await fetch('/api/public/specialistes');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const specialistes = await response.json();
        specialistsCache = Array.isArray(specialistes) ? specialistes : [];

        if (!Array.isArray(specialistes) || specialistes.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-light">Aucun spécialiste disponible pour le moment.</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = specialistes.map((m) => {
            const fullName = `Dr. ${m.prenom} ${m.nom}`;
            const photo = m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0066cc&color=fff&size=320`;
            return `
                <div class="col-md-6 col-lg-4">
                    <div class="specialist-card text-center h-100 d-flex flex-column">
                        <div class="specialist-photo">
                            <img src="${photo}" alt="${fullName}">
                        </div>
                        <h5>${fullName}</h5>
                        <p class="mb-1"><strong>Spécialité:</strong> ${m.specialite}</p>
                        <p class="mb-1"><strong>Expérience:</strong> ${m.annees_experience} ans</p>
                        <p class="mb-1"><strong>Cabinet:</strong> ${m.adresse_cabinet}</p>
                        <p class="mb-1"><strong>Téléphone:</strong> ${m.telephone}</p>
                        <p class="mb-3"><strong>Consultation:</strong> ${m.prix_consultation} FCFA</p>
                        <button class="btn btn-primary mt-auto js-rdv-btn" data-medecin-id="${m.id}">Prendre un rendez-vous</button>
                    </div>
                </div>
            `;
        }).join('');

        bindSpecialistRdvButtons();
    } catch (error) {
        console.error('Erreur chargement spécialistes:', error);
        grid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">Impossible de charger les spécialistes.</div>
            </div>
        `;
    }
}

function openConsultationModalById(medecinId) {
    const medecin = specialistsCache.find((m) => Number(m.id) === Number(medecinId));
    if (!medecin) return;
    document.getElementById('consultMedecinId').value = medecin.id;
    document.getElementById('consultMedecinNom').value = `Dr. ${medecin.prenom} ${medecin.nom}`;

    showRdvModal();
}

function bindSpecialistRdvButtons() {
    const grid = document.getElementById('specialistsGrid');
    if (!grid) return;

    grid.querySelectorAll('.js-rdv-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const medecinId = Number(btn.getAttribute('data-medecin-id'));
            openConsultationModalById(medecinId);
        });
    });
}

function showRdvModal() {
    const modalElement = document.getElementById('rdvModal');
    if (!modalElement) return;

    if (window.bootstrap && bootstrap.Modal) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
        return;
    }

    // Fallback si bootstrap JS n'est pas disponible
    modalElement.classList.add('show');
    modalElement.style.display = 'block';
    modalElement.removeAttribute('aria-hidden');
    modalElement.setAttribute('aria-modal', 'true');
    document.body.classList.add('modal-open');
}

function hideRdvModal() {
    const modalElement = document.getElementById('rdvModal');
    if (!modalElement) return;

    if (window.bootstrap && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(modalElement).hide();
        return;
    }

    modalElement.classList.remove('show');
    modalElement.style.display = 'none';
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    document.body.classList.remove('modal-open');
}

function setupConsultationForm() {
    const form = document.getElementById('publicConsultationForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            medecin_id: Number(document.getElementById('consultMedecinId').value),
            visiteur_prenom: document.getElementById('consultPrenom').value.trim(),
            visiteur_nom: document.getElementById('consultNom').value.trim(),
            motif_consultation: document.getElementById('consultMotif').value.trim(),
            date_heure: document.getElementById('consultDateHeure').value,
            visiteur_email: document.getElementById('consultEmail').value.trim(),
            visiteur_telephone: document.getElementById('consultTelephone').value.trim()
        };

        try {
            const response = await fetch('/api/public/consultations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Erreur lors de la soumission');
            }

            alert('Votre demande a été envoyée avec succès. Un email récapitulatif vous a été transmis.');
            form.reset();
            hideRdvModal();
        } catch (error) {
            console.error('Erreur soumission consultation:', error);
            alert(error.message || 'Une erreur est survenue.');
        }
    });
}

