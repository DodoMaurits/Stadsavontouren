let timerInterval;
let startTime;
let finalTime = null;

/* ---------- SPELLINGSAFWIJKINGEN (LEVENSHTEIN) ---------- */
function levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            matrix[i][j] = b[i - 1] === a[j - 1]
                ? matrix[i - 1][j - 1]
                : Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
        }
    }
    return matrix[b.length][a.length];
}

document.addEventListener('DOMContentLoaded', function() {

    /* ----- INDEX ----- */
    const errorMessage = document.getElementById("errorMessage");
    const boatBtn = document.getElementById("boatBtn");
    const walkBtn = document.getElementById("walkBtn");
    const places = [
        { name: "Leiden", boat: "leiden-vaarroutes.html", walk: "leiden-wandelroutes.html" }
    ];
    const cityButtons = document.querySelectorAll(".city-button:not(.disabled)");
    if (cityButtons.length > 0) {
        cityButtons.forEach(button => {
            button.addEventListener("click", () => {
                const isAlreadyActive = button.classList.contains("active");
                cityButtons.forEach(btn => btn.classList.remove("active"));
                if (isAlreadyActive) {
                    window.selectedPlace = null;
                    disableButtons();
                    return;
                }
                button.classList.add("active");
                const cityName = button.getAttribute("data-city");
                const selectedPlace = places.find(place => place.name === cityName);
                if (selectedPlace) {
                    window.selectedPlace = selectedPlace;
                    enableButtons();
                    errorMessage.textContent = "";
                }
            });
        });
    }
    function disableButtons() {
        if (boatBtn) boatBtn.disabled = true;
        if (walkBtn) walkBtn.disabled = true;
    }
    function enableButtons() {
        if (boatBtn) boatBtn.disabled = false;
        if (walkBtn) walkBtn.disabled = false;
    }
    function showError() {
        errorMessage.textContent = "Kies een stad";
    }
    if (boatBtn) {
        boatBtn.addEventListener("click", () => {
            if (!window.selectedPlace) return showError();
            window.location.href = window.selectedPlace.boat;
        });
    }
    if (walkBtn) {
        walkBtn.addEventListener("click", () => {
            if (!window.selectedPlace) return showError();
            window.location.href = window.selectedPlace.walk;
        });
    }
    disableButtons();

    /* ----- OVERLAYFUNCTIE ----- */
    const overlayHTML = 
    `<div id="overlay" class="overlay" aria-hidden="true">
        <div class="modal">
            <button id="overlayClose" class="overlay-close">✕</button>
            <div id="overlayContent"></div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML("beforeend", overlayHTML);
    const overlay = document.getElementById("overlay");
    const overlayContent = document.getElementById("overlayContent");
    const overlayClose = document.getElementById("overlayClose");
    function openOverlay(html) {
        overlayContent.innerHTML = html;
        overlay.classList.add('visible');
        overlay.setAttribute('aria-hidden', 'false');
    }
    function closeOverlay() {
        overlay.classList.remove('visible');
        overlay.setAttribute('aria-hidden', 'true');
        overlayContent.innerHTML = "";
    }
    window.openOverlay = openOverlay;
    window.closeOverlay = closeOverlay;
    if (overlay && overlayClose) {
        overlayClose.addEventListener('click', closeOverlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeOverlay();
        });
    }
    
    /* ----- GRID ITEMS ----- */
    if (document.querySelector('.grid-item[data-url]')) {
        initRoutesPage(); }
    if (document.querySelector('.grid-item[data-opt]')) {
        initScenarioPage(); }

    /* ----- GRID ROUTES ----- */
    function initRoutesPage() {
        const items = document.querySelectorAll('.grid-item[data-url]');
        items.forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = item.dataset.url;
            });
        });
    }
    
    /* ----- GRID SCENARIO & STARTOVERLAY ----- */
    const START_TEXT = "Start avontuur";
    function initScenarioPage() {
        const items = document.querySelectorAll('.grid-item[data-opt]');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const template = document.getElementById(item.dataset.template);
                const targetPage = item.dataset.opt;
                openOverlay(`
                    ${template.innerHTML}
                    <p>
                        Nadat je op start drukt krijg je eerst een introductie.
                        Daarna start je zelf de tijd.
                    </p>
                    <a href="${targetPage}" class="start-button">
                        ${START_TEXT}
                    </a>
                `);
            });
        });
    }
    
    /* ----- INFOOVERLAY ----- */
    const infoBtn = document.getElementById('infoBtn');
    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            openOverlay(`
                <h2>Uitleg scenario</h2>
                <p>
                Elk scenario komt langs dezelfde plekken, maar vertelt een ander verhaal.
                Kies dus welk scenario het beste bij jouw smaak of de situatie past.
                <br><br>
                Ben je een fan van detectives en 'whodunit'? Kies dan het moordmysterie.
                Spreekt het leren over de geschiedenis van de stad je aan? Kies dan voor de tijdreiziger.
                Houd je van rekenen en puzzelen? Dan is de puzzeltocht iets voor jou.
                Ben je in een gezelschap met kleinere kinderen? Kies dan voor de schattenjacht.
                </p>
            `);
        });
    }

    /* ------------ NAVIGATIEKNOPPEN ------------- */
    const pages = document.querySelectorAll('.page');
    let currentPageId = "0";
    // Navigeer naar een pagina
    function navigateTo(pageId) {
        const targetPage = document.getElementById(`page-${pageId}`);
        if (!targetPage) return;
        pages.forEach(page => page.classList.remove('active'));
        targetPage.classList.add('active');
        currentPageId = pageId;
        window.location.hash = pageId;
        window.scrollTo(0, 0);
        setTimeout(() => {
            if (typeof updateButtonState === 'function') {
                updateButtonState(); // Update de knopstatus
            }
        }, 50);
    }
    // Klik op navigatieknooppen
    document.addEventListener('click', (e) => {
    const button = e.target.closest('[data-page]');
    if (!button) return;
    e.preventDefault();
    navigateTo(button.getAttribute('data-page'));
    });
    // Start op de eerste pagina
    const initialPage = window.location.hash.substring(1) || "0";
    navigateTo(initialPage);
    
    /* ---------- ANTWOORD CONTROLE ---------- */
    const answerInputs = document.querySelectorAll('.answer-input');
    answerInputs.forEach(answerInput => {
        const answerError = answerInput.nextElementSibling;
        if (!answerInput || !answerError) return;
        const correctAnswers = answerInput.dataset.answer
            .toLowerCase()
            .split(',')
            .map(a => a.trim());
        answerInput.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            const userAnswer = answerInput.value.trim().toLowerCase();
            let isCorrect = correctAnswers.some(correct => levenshtein(userAnswer, correct) <= 1);
            if (isCorrect) {
                answerError.style.display = "none";
                const clue = document.getElementById("antwoordClue");
                if (clue) {
                    openOverlay(clue.innerHTML);
                }
            } else {
                answerError.style.display = "block";
                answerInput.classList.add('input-error');
                setTimeout(() => {
                    answerInput.classList.remove('input-error');
                }, 400);
            }
        });
    })

    /* ---------- TOP-ROW ---------- */
    if (document.body.classList.contains("spelpagina")) {
        const container = document.querySelector(".container");
        container.insertAdjacentHTML("afterbegin", `
            <div class="top-row">
                <button id="notesButton" class="notes-button">✏️</button>
                <div id="timer" class="timer">0:00:00</div>
                <button id="homeButton" class="home-button">x</button>
            </div>
        `);
    }
    
    /*----- NOTE KNOP -----*/
    const notesButton = document.getElementById("notesButton");
    if (notesButton) {
        notesButton.addEventListener("click", () => {
            openOverlay(`
                <div class="notes-modal">
                    <h2>Notitieboekje</h2>
                    <textarea id="notesArea" placeholder="Schrijf hier je notities..."></textarea>
                    <button id="notesSave">Opslaan</button>
                </div>
            `);
            setTimeout(() => {
                const notesArea = document.getElementById("notesArea");
                const notesSave = document.getElementById("notesSave");
                notesArea.value = localStorage.getItem("detectiveNotes") || "";
                notesArea.addEventListener("input", () => {
                    localStorage.setItem("detectiveNotes", notesArea.value);
                });
                notesSave.addEventListener("click", closeOverlay);
            }, 0);
        });
    }

    /* ----- TIMER ----- */
    const timerEl = document.getElementById("timer");
    const startTimerButton = document.getElementById("startTimerButton");

    function startTimer() {
        if (!timerEl) return;
        if (timerInterval) clearInterval(timerInterval);
        startTime = Number(localStorage.getItem("timerStart"));
        const endTime = Number(localStorage.getItem("timerEnd"));
        function showTime(diff) {
            const hours = Math.floor(diff / 3600);
            const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
            const seconds = String(diff % 60).padStart(2, "0");
            timerEl.textContent = `${hours}:${minutes}:${seconds}`;
        }
        if (endTime) {
            const diff = Math.floor((endTime - startTime) / 1000);
            showTime(diff);
        } else if (startTime) {
            function updateTimer() {
                const diff = Math.floor((Date.now() - startTime) / 1000);
                showTime(diff);
            }
            updateTimer();
            timerInterval = setInterval(updateTimer, 1000);
        } else {
            timerEl.textContent = "0:00:00";
        }
    }
    if (startTimerButton) {
        startTimerButton.addEventListener("click", () => {
            localStorage.removeItem("timerEnd");
            localStorage.setItem("timerStart", Date.now());
            startTimer();
        });
    }
    if (timerEl) {
        startTimer();
    }
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-page]')) {
            setTimeout(startTimer, 50);
        }
    });

    /*----- HOMEKNOP SPEL SLUITEN-----*/
    const homeButton = document.getElementById("homeButton");
    if (homeButton) {
        homeButton.addEventListener("click", () => {
            openOverlay(`
                <h2>Weet je het zeker?</h2>
                <p>Je verlaat het spel en je notities worden gewist.</p>
                <div class="modal-buttons" style="display:flex; gap:10px; justify-content:center; margin-top:20px;">
                    <a href="../Leiden-L1-singel.html" id="YesExit" class="back-button">Ja</a>
                    <button id="cancelExit" class="back-button">Nee</button>
                </div>
            `);
            ;
                setTimeout(() => {
                    const YesExitButton = document.getElementById("YesExit");
                    const cancelExitButton = document.getElementById("cancelExit");
                if (YesExitButton) {
                    YesExitButton.addEventListener("click", (e) => {
                        e.preventDefault();
                        if (timerInterval) clearInterval(timerInterval);
                        timerInterval = null;
                        localStorage.clear();
                        window.location.href = "../Leiden-L1-singel.html";
                    });
                }
                if (cancelExitButton) {
                    cancelExitButton.addEventListener("click", () => {
                        closeOverlay();
                    });
                }
            }, 0);
        });
    }

});
