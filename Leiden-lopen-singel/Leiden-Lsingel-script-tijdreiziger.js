document.addEventListener("DOMContentLoaded", () => {
    
    // Initialiseer
    buildJaartallenGrid();

    // Luister naar navigatie
    document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-page]');
        if (!button) return;
        setTimeout(() => {
            buildJaartallenGrid();
        }, 50);
    });
    
    /* ----- JAARTALLENGRID ----- */
    function buildJaartallenGrid() {
        const containers = document.querySelectorAll(".jaartallen-grid");
        containers.forEach(container => {
            container.innerHTML = "";
            if (!localStorage.getItem("timeTravelResults")) { 
                // Bouw input-grid
                for (let i = 1; i <= 12; i++) {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.inputMode = "numeric";
                    input.maxLength = 4;
                    input.className = "jaartal-cirkel";
                    input.placeholder = "...";
                    const storageKey = `leiden-lsingel-jaartal-${i}`;
                    const savedValue = localStorage.getItem(storageKey);
                    if (savedValue) {
                        input.value = savedValue;
                        input.classList.add("filled");
                    }
                    input.addEventListener("input", () => {
                        const value = input.value.replace(/\D/g, "").slice(0, 4);
                        input.value = value;
                        input.classList.remove("filled");
                        if (value.length > 0) {
                            input.classList.add("editing");
                        } else {
                            input.classList.remove("editing");
                            localStorage.removeItem(storageKey);
                        }
                    });
                    input.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") {
                            const value = input.value.trim();
                            input.classList.remove("editing");
                            if (value) {
                                localStorage.setItem(storageKey, value);
                                input.classList.add("filled");
                            } else {
                                localStorage.removeItem(storageKey);
                                input.classList.remove("filled");
                            }
                            input.blur();
                        }
                    });
                    input.addEventListener("blur", () => {
                        const value = input.value.trim();
                        input.classList.remove("editing");
                        if (value) {
                            localStorage.setItem(storageKey, value);
                            input.classList.add("filled");
                        } else {
                            localStorage.removeItem(storageKey);
                            input.classList.remove("filled");
                        }
                    });
                    container.appendChild(input);
                }
            } else {
                // Bouw resultaat-grid
                const results = JSON.parse(localStorage.getItem("timeTravelResults"));
                const selectedCircle = Number(localStorage.getItem("selectedTimeCircle"));
                for (let i = 1; i <= 12; i++) {
                    const value = localStorage.getItem(`leiden-lsingel-jaartal-${i}`) || "";
                    const circle = document.createElement("div");
                    circle.className = "jaartal-result";
                    circle.textContent = value;
                    circle.classList.add(results[i-1].correct ? "correct" : "incorrect");
                    if (selectedCircle === (i-1)) circle.classList.add("selected");
                    container.appendChild(circle);
                }
            }
        });
    }

    /* ---------- ONTKNOPING TIJDREIZIGER ---------- */
    const correctYears = [
    "1901", // cirkel 1
    "1942", // cirkel 2
    "1632", // cirkel 3
    "1840", // cirkel 4
    "1516", // cirkel 5
    "1869", // cirkel 6
    "2043", // cirkel 7
    "1887", // cirkel 8
    "1977", // cirkel 9
    "1611", // cirkel 10
    "1903", // cirkel 11
    "1745"  // cirkel 12
    ];
    
    const timeFinalButton = document.getElementById("timeFinalButton");
    if (timeFinalButton) {
        function updateTimeButtonState() {
            let allFilled = true;
            for (let i = 1; i <= 12; i++) {
                const value = localStorage.getItem(
                    `leiden-lsingel-jaartal-${i}`
                );
                if (!value || value.trim() === "") {
                    allFilled = false;
                    break;
                }
            }
            timeFinalButton.disabled = !allFilled;
        }
        document.addEventListener("input", () => {
            setTimeout(updateTimeButtonState, 10);
        });
        updateTimeButtonState();
    }

    if (timeFinalButton) {
        timeFinalButton.addEventListener("click", () => {
            const randomIndex = Math.floor(Math.random() * 12);
            let results = [];
            for (let i = 1; i <= 12; i++) {
                const entered =
                    localStorage.getItem(`leiden-lsingel-jaartal-${i}`) || "";
                const correct =
                    correctYears[i - 1];
                results.push({
                    correct: entered === correct
                });
            }
            localStorage.setItem(
                "timeTravelResults",
                JSON.stringify(results)
            );
            const chosenCircle = results[randomIndex];
            localStorage.setItem(
                "selectedTimeCircle",
                randomIndex
            );
            localStorage.setItem(
                "timerEnd",
                Date.now()
            );
            if (chosenCircle.correct) {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById('page-101').classList.add('active');
            } else {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById('page-100').classList.add('active');
            }
            buildJaartallenGrid();
        });
    }
});
