document.addEventListener("DOMContentLoaded", () => {
    
    /* ------ VERDACHTENGRID ------ */
    function buildVerdachtenGrid() {
        // Selecteer ALLE containers (niet alleen de eerste)
        const activePage = document.querySelector('.page.active');
        if (!activePage) return;

        const container = activePage.querySelector(".verdachten-grid-container");
        if (!container) return;
    
        container.innerHTML = `
                <div class="verdachte" data-id="boomverzorger">
                    <img src="../icons/De_boomverzorger.png" alt="Verdachte">
                    <p><br>De boomverzorger</p>
                </div>
                <div class="verdachte" data-id="vogeldief">
                    <img src="../icons/De_vogeldief.png" alt="Verdachte">
                    <p><br>De vogeldief</p>
                </div>
                <div class="verdachte" data-id="vogelspotter">
                    <img src="../icons/De_vogelspotter.png" alt="Verdachte">
                    <p><br>De vogelspotter</p>
                </div>
                <div class="verdachte" data-id="dakloze">
                    <img src="../icons/De_dakloze.png" alt="Verdachte">
                    <p><br>De dakloze</p>
                </div>
                <div class="verdachte" data-id="vogelverzorger">
                    <img src="../icons/De_vogelverzorger.png" alt="Verdachte">
                    <p><br>De vogelverzorger van de volière</p>
                </div>
                <div class="verdachte" data-id="eigenaar">
                    <img src="../icons/De_eigenaar.png" alt="Verdachte">
                    <p><br>De eigenaar<br>van de muziektent</p>
                </div>
                <div class="verdachte" data-id="portier">
                    <img src="../icons/De_portier.png" alt="Verdachte">
                    <p><br>De portier<br>van de concertzaal</p>
                </div>
                <div class="verdachte" data-id="schoonmaker">
                    <img src="../icons/De_schoonmaker.png" alt="Verdachte">
                    <p><br>De schoonmaker<br>van het zwanenbassin</p>
                </div>
        `;
    
        // Voeg click handlers toe (alleen als ze nog niet bestaan)
        container.querySelectorAll(".verdachte").forEach(el => {
            if (!el.hasClickHandler) { 
                el.addEventListener('click', () => {
                    el.classList.toggle('afgestreept');
                    const id = el.dataset.id;
                    if (el.classList.contains('afgestreept')) {
                        localStorage.setItem('verdachte-' + id, 'afgestreept');
                    } else {
                        localStorage.removeItem('verdachte-' + id);
                    }
                    if (typeof updateButtonState === 'function') {
                        setTimeout(updateButtonState, 10);
                    }
                });
                el.hasClickHandler = true;
            }
        });
    }

    // Herstel de state
    function restoreVerdachtenState() {
        // Herstel state voor ALLE verdachten in de DOM
        document.querySelectorAll(".verdachte").forEach(el => {
            const id = el.dataset.id;
            el.classList.toggle('afgestreept', localStorage.getItem('verdachte-' + id) === 'afgestreept');
        });
    }

    // Initialiseer
    buildVerdachtenGrid();
    restoreVerdachtenState();

    // Luister naar navigatie
    document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-page]');
        if (!button) return;
        setTimeout(() => {
            buildVerdachtenGrid();
            restoreVerdachtenState();
        }, 50);
    });
    
    /* ---------- ONTKNOPING MOORDMYSTERIE ---------- */    
    const finalAnswerInput = document.getElementById("finalAnswerInput");
    const finalButton = document.getElementById("finalButton");
    
    if (finalAnswerInput && finalButton) {
        const correctWeapon = finalAnswerInput.dataset.answer
            .toLowerCase()
            .split(",")
            .map(a => a.trim());
        const correctSuspectId = "eigenaar";
        /* Check welke verdachten nog groen zijn */
        function getRemainingSuspects() {
            const activePage = document.querySelector('.page.active');
            let verdachten = [];
            if (activePage) {
                verdachten = Array.from(activePage.querySelectorAll(".verdachte"));
            }
            if (verdachten.length === 0) {
                verdachten = Array.from(document.querySelectorAll(".verdachte"));
            }
            return verdachten.filter(v => !v.classList.contains("afgestreept"));
        }
        /* Controleer of het wapen correct is */
        function weaponIsCorrect() {
            const user = finalAnswerInput.value.trim().toLowerCase();
            if (!user) return false;
            return correctWeapon.some(correct => levenshtein(user, correct) <= 1);
        }
        /* Controleer of de juiste verdachte groen is */
        function suspectIsCorrect() {
            const remaining = getRemainingSuspects();
            return remaining.length === 1 && remaining[0].dataset.id === correctSuspectId;
        }
        /* Update de finale knop status */
        function updateButtonState() {
            const hasInput = finalAnswerInput.value.trim().length > 0;
            const oneSuspectLeft = getRemainingSuspects().length === 1;
            finalButton.disabled = !(hasInput && oneSuspectLeft);
        }
        /* Voeg click handlers toe aan bestaande verdachten (voor de eerste pagina) */
        document.querySelectorAll(".verdachte").forEach(el => {
            if (!el.hasClickHandler) {
                el.addEventListener("click", () => {
                    setTimeout(updateButtonState, 10);
                });
                el.hasClickHandler = true;
            }
        });
        /* Listeners om knopstatus te updaten */
        finalAnswerInput.addEventListener("input", updateButtonState);
        /* Klik op finale knop → juiste ontknopingspagina */
        finalButton.addEventListener("click", () => {
            const weaponCorrect = weaponIsCorrect();
            const suspectCorrect = suspectIsCorrect();
            let targetPage = "";
            if (weaponCorrect && suspectCorrect) {
                targetPage = "102";
            } else if (weaponCorrect && !suspectCorrect) {
                targetPage = "103";
            } else if (!weaponCorrect && suspectCorrect) {
                targetPage = "101";
            } else {
                targetPage = "100";
            }
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            localStorage.setItem("timerEnd", Date.now());
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(`page-${targetPage}`)?.classList.add('active');
        });
        updateButtonState(); /* Direct check bij laden van pagina */
    }
    const closeGameButton = document.getElementById("closeGameButton");
    if (closeGameButton) {
        closeGameButton.addEventListener("click", (e) => {
            e.preventDefault();
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            localStorage.clear();
            const timerEl = document.getElementById("timer");
            if (timerEl) {
                timerEl.textContent = "0:00:00";
            }
            window.location.href = closeGameButton.href;
        });
    }
});
