/*=========================================
            PIC DUEL
            GAME.JS
=========================================*/

/* ---------- SCREENS ---------- */

const introScreen = document.getElementById("introScreen");
const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const winnerScreen = document.getElementById("winnerScreen");

/* ---------- MENU ---------- */

const categorySelect = document.getElementById("categorySelect");
const timeSelect = document.getElementById("timeSelect");

const easyCheckbox = document.getElementById("easyDifficulty");
const mediumCheckbox = document.getElementById("mediumDifficulty");
const hardCheckbox = document.getElementById("hardDifficulty");

const startGameButton = document.getElementById("startGameButton");
const tournamentSetup = document.getElementById("tournamentSetup");
const initialChallengerSelect = document.getElementById("initialChallengerSelect");
const initialOpponentSelect = document.getElementById("initialOpponentSelect");
const tournamentPlayerCount = document.getElementById("tournamentPlayerCount");
const tournamentPlayerInputs = document.getElementById("tournamentPlayerInputs");
const tournamentBracket = document.getElementById("tournamentBracket");

// Ensure challenger selects have a CSS class for clearer styling
if (initialChallengerSelect) initialChallengerSelect.classList.add('challengerSelect');
if (initialOpponentSelect) initialOpponentSelect.classList.add('challengerSelect');

// Add small preview elements after the selects so selection state is always visible
function ensurePreviewElements() {
    if (!initialChallengerSelect || !initialOpponentSelect) return;
    if (!document.getElementById('challengerPreview')) {
        const p = document.createElement('div');
        p.id = 'challengerPreview';
        p.className = 'challengerPreview';
        initialChallengerSelect.parentNode.appendChild(p);
    }
    if (!document.getElementById('opponentPreview')) {
        const p = document.createElement('div');
        p.id = 'opponentPreview';
        p.className = 'challengerPreview';
        initialOpponentSelect.parentNode.appendChild(p);
    }
}

function updatePreviewTexts() {
    ensurePreviewElements();
    const ch = document.getElementById('initialChallengerSelect');
    const op = document.getElementById('initialOpponentSelect');
    const chPreview = document.getElementById('challengerPreview');
    const opPreview = document.getElementById('opponentPreview');
    if (chPreview) chPreview.textContent = `Selected: ${ch?.value || '<none>'}`;
    if (opPreview) opPreview.textContent = `Selected: ${op?.value || '<none>'}`;
}

// Custom dropdown builder: mirrors a <select> with a styled list and keeps the select value in sync
function buildCustomFromSelect(selectEl) {
    if (!selectEl) return;
    // mark native select hidden
    selectEl.classList.add('native-hidden');

    const id = selectEl.id || selectEl.dataset.customId || `select_${Math.random().toString(36).slice(2,8)}`;
    selectEl.dataset.customId = id;
    const existing = document.querySelector(`.custom-for-${id}`);
    if (existing) existing.remove();

    const wrapper = document.createElement('div');
    wrapper.className = `custom-select custom-for-${id}`;

    const toggle = document.createElement('div');
    toggle.className = 'custom-select__toggle';
    toggle.tabIndex = 0;
    toggle.setAttribute('role','button');
    toggle.setAttribute('aria-haspopup','listbox');

    const labelSpan = document.createElement('span');
    // prefer the selected option's visible text for label
    const selIndex = selectEl.selectedIndex >= 0 ? selectEl.selectedIndex : 0;
    labelSpan.textContent = (selectEl.options[selIndex] && selectEl.options[selIndex].textContent) || selectEl.value || '';
    toggle.appendChild(labelSpan);

    const list = document.createElement('div');
    list.className = 'custom-select__list';
    list.style.display = 'none';

    Array.from(selectEl.options).forEach(opt => {
        const item = document.createElement('div');
        item.className = 'custom-select__item';
        item.textContent = opt.textContent;
        item.dataset.value = opt.value;
        if (opt.value === selectEl.value) item.classList.add('active');
        
        item.addEventListener('click', () => {
            // Αφαίρεση active από τα άλλα αδερφά custom στοιχεία[cite: 1]
            const siblings = list.querySelectorAll('.custom-select__item');
            siblings.forEach(sib => sib.classList.remove('active'));
            
            // Προσθήκη active στο τρέχον στοιχείο[cite: 1]
            item.classList.add('active');
            
            // Ενημέρωση του native select και του dataset για ασφάλεια[cite: 1]
            selectEl.value = opt.value;
            selectEl.dataset.selectedValue = opt.value;
            
            // Ενημέρωση του label[cite: 1]
            labelSpan.textContent = opt.textContent;
            
            // Κλείσιμο λίστας[cite: 1]
            list.style.display = 'none';
            
            // Dispatch event για να το καταλάβει το υπόλοιπο σύστημα[cite: 1]
            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        });
        list.appendChild(item);
    });

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    });

    // close on outside click
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            list.style.display = 'none';
        }
    });

    wrapper.appendChild(toggle);
    wrapper.appendChild(list);

    // insert after the select's parent (keeps layout similar)
    if (selectEl.parentNode) {
        selectEl.parentNode.appendChild(wrapper);
    }

    // update preview when underlying native select changes
    selectEl.addEventListener('change', () => {
        try { labelSpan.textContent = selectEl.options[selectEl.selectedIndex]?.textContent || selectEl.value; } catch(e){}
        try { updatePreviewTexts(); } catch(e){}
    });
}

/* Αντικατάστησε τις παλιές συναρτήσεις με αυτές */
function initCustomSelects() {
    const containers = document.querySelectorAll('.custom-select-container');

    containers.forEach(container => {
        const trigger = container.querySelector('.custom-select-trigger');
        const optionsWrapper = container.querySelector('.custom-options-wrapper');
        const select = container.querySelector('select');
        const options = container.querySelectorAll('.custom-option');

        if (!trigger || !optionsWrapper || !select) return;

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // Κλείσιμο άλλων dropdowns
            document.querySelectorAll('.custom-select-container').forEach(c => {
                if (c !== container) c.classList.remove('open');
            });
            container.classList.toggle('open');
        });

        // Click σε επιλογή
        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Ενημέρωση του visual trigger
                trigger.textContent = opt.textContent;
                
                // Ενημέρωση του κρυφού select
                select.value = opt.dataset.value;
                
                // Highlight της επιλογής
                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                
                // Κλείσιμο
                container.classList.remove('open');
                
                // Trigger change event για να ενημερωθεί το παιχνίδι
                select.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
    });

    // Κλείσιμο με κλικ έξω
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select-container').forEach(c => c.classList.remove('open'));
    });
}
function updatePlayerDropdowns() {
    const count = parseInt(document.getElementById('tournamentPlayerCount').value);
    const challengerSelect = document.getElementById('initialChallengerSelect');
    const opponentSelect = document.getElementById('initialOpponentSelect');
    
    // Καθαρισμός υπαρχόντων options
    challengerSelect.innerHTML = '';
    opponentSelect.innerHTML = '';

    // Δημιουργία νέων options μέχρι τον αριθμό count
    for (let i = 1; i <= count; i++) {
        let opt1 = new Option(`Player ${i}`, `Player ${i}`);
        let opt2 = new Option(`Player ${i}`, `Player ${i}`);
        challengerSelect.add(opt1);
        opponentSelect.add(opt2);
    }

    // Προαιρετικά: Ενημέρωση και του Custom UI (αν έχεις δική σου λογική)
    // Εδώ θα έπρεπε να καλέσεις ξανά την ανακατασκευή των custom-options-wrapper
}

// Event listener για να τρέχει αυτόματα όταν αλλάζει ο αριθμός παικτών
document.getElementById('tournamentPlayerCount').addEventListener('change', function() {
    const maxPlayers = parseInt(this.value);
    const dropdowns = ['challengerSelectContainer', 'opponentSelectContainer'];

    dropdowns.forEach(containerId => {
        const container = document.getElementById(containerId);
        const options = container.querySelectorAll('.custom-option');
        
        options.forEach((opt, index) => {
            // Ο index ξεκινά από το 0, άρα ο 1ος παίκτης είναι index 0
            if (index < maxPlayers) {
                opt.style.display = 'block'; // Δείξε τον παίκτη
            } else {
                opt.style.display = 'none';  // Κρύψε τον παίκτη
            }
        });
    });
});
document.querySelectorAll('.custom-select-container').forEach(container => {
    const trigger = container.querySelector('.custom-select-trigger');
    const optionsWrapper = container.querySelector('.custom-options-wrapper');
    const options = container.querySelectorAll('.custom-option');
    const hiddenSelect = container.querySelector('select');

    // Άνοιγμα/Κλείσιμο dropdown
    trigger.addEventListener('click', () => {
        optionsWrapper.classList.toggle('show');
    });

    // Επιλογή παίκτη
    options.forEach(option => {
        option.addEventListener('click', function() {
            // Αφαίρεση selected από όλους
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            // Ενημέρωση του κειμένου στο trigger
            trigger.textContent = this.textContent;

            // Ενημέρωση του κρυφού select
            hiddenSelect.value = this.getAttribute('data-value');
            
            // Κλείσιμο του dropdown
            optionsWrapper.classList.remove('show');
            
            // Dispatch event για να "καταλάβει" το υπόλοιπο παιχνίδι την αλλαγή
            hiddenSelect.dispatchEvent(new Event('change'));
        });
    });
});
/* ---------- GAME ---------- */

const player1Name = document.getElementById("player1Name");
const player2Name = document.getElementById("player2Name");

const player1Timer = document.getElementById("player1Timer");
const player2Timer = document.getElementById("player2Timer");

const currentCategory = document.getElementById("currentCategory");

const gameImage = document.getElementById("gameImage");

const answerCaption = document.getElementById("answerCaption");

const messageBox = document.getElementById("messageBox");
const micStatus = document.getElementById("micStatus");

function setMicStatus(status) {
    if (!micStatus) return;
    micStatus.className = `mic-status ${status}`;
    const textSpan = micStatus.querySelector(".status-text");
    if (!textSpan) return;
    switch (status) {
        case "listening":
            textSpan.textContent = "Μικρόφωνο: ανοιχτό";
            break;
        case "retry":
            textSpan.textContent = "Μικρόφωνο: επανασύνδεση...";
            break;
        case "error":
            textSpan.textContent = "Μικρόφωνο: σφάλμα";
            break;
        case "off":
            textSpan.textContent = "Μικρόφωνο: περιμένει";
            break;
        default:
            textSpan.textContent = "Μικρόφωνο: αδρανές";
    }
}

const debugLog = document.getElementById("debugLog");

function setMessageFeedback(type) {
    if (!messageBox) return;
    messageBox.classList.remove("correct", "wrong", "pass");
    if (type === "correct") {
        messageBox.classList.add("correct");
    }
    if (type === "wrong") {
        messageBox.classList.add("wrong");
    }
    if (type === "pass") {
        messageBox.classList.add("pass");
    }
}

function logDebug(text) {
    console.log(text);
    if (debugLog) {
        debugLog.textContent = text;
    }
}

/* ---------- WINNER ---------- */

const winnerName = document.getElementById("winnerName");
const winnerDescription = document.getElementById("winnerDescription");
const continueButton = document.getElementById("continueButton");
const statisticsScreen = document.getElementById("statisticsScreen");

const statisticsPlayAgainButton =
    document.getElementById("statisticsPlayAgainButton");

const statisticsMenuButton =
    document.getElementById("statisticsMenuButton");

const screens = [
    introScreen,
    menuScreen,
    gameScreen,
    winnerScreen,
    statisticsScreen
];

/* ---------- VARIABLES ---------- */

let player1Time = 60;
let player2Time = 60;

let currentPlayer = 1;

let timer = null;

let gameRunning = false;

let browserSpeechRecognition = null;
let usingBrowserSpeechFallback = false;
let lastProcessedTranscript = "";
let lastProcessedTranscriptTime = 0;

let currentImage = null;

let currentImages = [];

let waitingAfterPass = false;
let tournamentPlayers = [];
let tournamentOpponentQueue = [];
let currentChallenger = null;
let tournamentCurrentMatch = null;
let tournamentAutoAdvanceTimeout = null;
let tournamentPaused = false;
let tournamentPauseTimer = null;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let tickToggle = false;
let confettiParticles = [];
let confettiAnimationFrame = null;
let confettiCanvas = null;
let confettiCtx = null;

/* ---------- PLAYER STATS ---------- */

let player1Stats = {
    correct: 0,
    wrong: 0,
    pass: 0,
    streak: 0,
    bestStreak: 0
};

let player2Stats = {
    correct: 0,
    wrong: 0,
    pass: 0,
    streak: 0,
    bestStreak: 0
};


/*=========================================
            GAME CONTROL
=========================================*/

function showScreen(targetScreen) {
    screens.forEach(screen => {
        if (screen) {
            screen.classList.remove("active");
        }
    });
    if (targetScreen) {
        targetScreen.classList.add("active");
    }
}

function showTournamentSetup(show = true) {
    if (!tournamentSetup) return;
    tournamentSetup.classList.toggle("hidden", !show);
    tournamentSetup.classList.toggle("inactive", !show);
}

function renderTournamentInputs() {
    if (!tournamentPlayerInputs || !tournamentPlayerCount) return;

    const count = Math.max(2, Math.min(15, Number(tournamentPlayerCount.value) || 2));
    tournamentPlayerInputs.innerHTML = "";

    // Αρχικοποίηση του array των παικτών αν είναι άδειο
    if (tournamentPlayers.length === 0) {
        tournamentPlayers = Array.from({ length: count }, (_, i) => ({
            name: `Player ${i + 1}`,
            category: categorySelect?.value || "animals"
        }));
    }

    for (let i = 0; i < count; i++) {
        if (!tournamentPlayers[i]) {
            tournamentPlayers[i] = { name: `Player ${i + 1}`, category: categorySelect?.value || "animals" };
        }

        const row = document.createElement("div");
        row.className = "playerRow";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.maxLength = 20;
        nameInput.placeholder = `Player ${i + 1}`;
        nameInput.value = tournamentPlayers[i].name;
        nameInput.className = "tournamentNameInput";

        // Αποθήκευση του ονόματος στο object όταν αλλάζει
        nameInput.addEventListener("input", (e) => {
            tournamentPlayers[i].name = e.target.value.trim();
            populateChallengeSelectors();
        });

        const categorySelectField = document.createElement("select");
        categorySelectField.className = "playerCategorySelect";
        categorySelectField.dataset.playerIndex = i; // Κρατάμε το index του παίκτη

        row.appendChild(nameInput);
        row.appendChild(categorySelectField);
        tournamentPlayerInputs.appendChild(row);
    }

    populateCategorySelect();
    populateChallengeSelectors();
}

// Διορθωμένο: Διαβάζει πλέον 100% σωστά το Pokémon από το custom select[cite: 1]
function collectTournamentPlayers() {
    // Επειδή πλέον αποθηκεύουμε τα δεδομένα απευθείας στο tournamentPlayers array 
    // real-time μέσω των event listeners, επιστρέφουμε απλά το φιλτραρισμένο array!
    const activePlayers = tournamentPlayers.filter(p => p && p.name.trim() !== "");
    console.log("🚀 Real-time collected players:", activePlayers);
    return activePlayers;
}

function populateChallengeSelectors() {
    if (!initialChallengerSelect || !initialOpponentSelect || !tournamentPlayerInputs) return;

    const rows = Array.from(tournamentPlayerInputs.querySelectorAll(".playerRow"));
    const players = rows.map(row => {
        const input = row.querySelector("input[type='text']");
        return input ? input.value.trim() : "";
    }).filter(name => name);

    console.log('populateChallengeSelectors → players:', players);

    const previousChallenger = initialChallengerSelect.value;
    const previousOpponent = initialOpponentSelect.value;

    initialChallengerSelect.innerHTML = "";
    initialOpponentSelect.innerHTML = "";
    if (players.length < 2) {
        initialChallengerSelect.disabled = true;
        initialOpponentSelect.disabled = true;
        const placeholder = document.createElement("option");
        placeholder.textContent = "Πρόσθεσε 2+ παίκτες";
        initialChallengerSelect.appendChild(placeholder);
        initialOpponentSelect.appendChild(placeholder.cloneNode(true));
        return;
    }

    initialChallengerSelect.disabled = false;
    initialOpponentSelect.disabled = false;

    players.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        initialChallengerSelect.appendChild(option);
    });

    if (players.includes(previousChallenger)) {
        initialChallengerSelect.value = previousChallenger;
    } else {
        initialChallengerSelect.value = players[0];
    }

    const challengerName = initialChallengerSelect.value;
    const opponentList = players.filter(name => name !== challengerName);

    opponentList.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        initialOpponentSelect.appendChild(option);
    });

    if (opponentList.includes(previousOpponent)) {
        initialOpponentSelect.value = previousOpponent;
    } else if (opponentList.length > 0) {
        initialOpponentSelect.value = opponentList[0];
    }

    try { updatePreviewTexts(); } catch (e) { console.warn('preview update failed', e); }

    try { buildCustomFromSelect(initialChallengerSelect); } catch (e) { /* ignore */ }
    try { buildCustomFromSelect(initialOpponentSelect); } catch (e) { /* ignore */ }
}

function populateCategorySelect() {
    if (!categories) return;

    const categoryKeys = Object.keys(categories);
    if (categoryKeys.length === 0) return;

    const fillSelect = (selectElement, value) => {
        if (!selectElement) return;
        selectElement.innerHTML = "";

        categoryKeys.forEach(key => {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = key
                .split("-")
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
            selectElement.appendChild(option);
        });

        if (value) {
            selectElement.value = value;
        }
    };

    fillSelect(categorySelect, categorySelect?.value);

    if (tournamentPlayerInputs) {
        const selectFields = tournamentPlayerInputs.querySelectorAll("select");
        selectFields.forEach(selectField => {
            const idx = selectField.dataset.playerIndex;
            const savedValue = tournamentPlayers[idx] ? tournamentPlayers[idx].category : categorySelect?.value;
            
            fillSelect(selectField, savedValue);

            // 🎯 Η ΔΙΟΡΘΩΣΗ: Διαβάζουμε το index ΔΥΝΑΜΙΚΑ από το e.target τη στιγμή του change!
            selectField.onchange = function(e) {
                const currentPlayerIdx = e.target.dataset.playerIndex;
                if (tournamentPlayers[currentPlayerIdx]) {
                    tournamentPlayers[currentPlayerIdx].category = e.target.value;
                    console.log(`🎯 ΕΝΗΜΕΡΩΘΗΚΕ: Ο Player ${Number(currentPlayerIdx) + 1} (index ${currentPlayerIdx}) έχει πλέον κατηγορία: ${e.target.value}`);
                }
            };

            try { buildCustomFromSelect(selectField); } catch (e) { /* ignore */ }
        });
    }

    if (categorySelect && categorySelect.options.length > 0 && !categorySelect.value) {
        categorySelect.selectedIndex = 0;
    }
}

function getRandomCategoryKey() {
    const availableKeys = Object.keys(categories || {});
    if (availableKeys.length === 0) return "animals";
    return availableKeys[Math.floor(Math.random() * availableKeys.length)];
}

function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function startTournamentMode() {
    const players = collectTournamentPlayers();

    if (players.length < 2) {
        alert("Πρόσθεσε τουλάχιστον 2 παίκτες για τουρνουά.");
        return false;
    }

    const challengerName = initialChallengerSelect?.value;
    const opponentName = initialOpponentSelect?.value;

    const selectedChallenger = players.find(p => p.name === challengerName) || players[Math.floor(Math.random() * players.length)];
    const selectedOpponent = players.find(p => p.name === opponentName && p.name !== selectedChallenger.name)
        || players.find(p => p.name !== selectedChallenger.name);

    currentChallenger = selectedChallenger;
    const remainingOpponents = players.filter(p => p.name !== selectedChallenger.name && p.name !== selectedOpponent.name);
    tournamentOpponentQueue = [selectedOpponent, ...shuffleArray(remainingOpponents)];
    tournamentPlayers = players;
    tournamentCurrentMatch = null;
    tournamentPaused = false;
    clearTimeout(tournamentAutoAdvanceTimeout);
    clearTimeout(tournamentPauseTimer);
    renderTournamentBracket();
    
    // 🎯 Η ΜΕΓΑΛΗ ΑΛΛΑΓΗ ΕΔΩ: 
    // Παίρνουμε ΠΡΩΤΑ την κατηγορία του Αντιπάλου (selectedOpponent), 
    // όπως λέει ο κανόνας του παιχνιδιού σου!
    const categoryKey = selectedOpponent.category || selectedChallenger.category || getRandomCategoryKey();
    
    // Δημιουργία του πρώτου match
    tournamentCurrentMatch = {
        player1: selectedChallenger.name,
        player2: selectedOpponent.name,
        categoryKey,
        challenger: selectedChallenger,
        opponent: selectedOpponent
    };
    
    beginMatch(tournamentCurrentMatch.player1, tournamentCurrentMatch.player2, tournamentCurrentMatch.categoryKey);
    return true;
}

function startNextTournamentMatch() {
    clearTimeout(tournamentAutoAdvanceTimeout);
    clearTimeout(tournamentPauseTimer);
    tournamentPaused = false;

    if (!currentChallenger) {
        finishTournament("Winner");
        return;
    }

    if (tournamentOpponentQueue.length === 0) {
        finishTournament(currentChallenger.name);
        return;
    }

    const opponent = tournamentOpponentQueue.shift();
const categoryKey = opponent.category || currentChallenger.category || getRandomCategoryKey();
    const match = {
        player1: currentChallenger.name,
        player2: opponent.name,
        categoryKey,
        challenger: currentChallenger,
        opponent
    };

    tournamentCurrentMatch = match;
    renderTournamentBracket();
    beginMatch(match.player1, match.player2, match.categoryKey);
}

function renderTournamentBracket(showRoadToFinal = false) {
    if (!tournamentBracket) return;

    tournamentBracket.classList.remove("hidden");
    tournamentBracket.innerHTML = "";

    const roundLabel = document.createElement("div");
    roundLabel.className = "roundLabel";
    roundLabel.textContent = currentChallenger
        ? `Challenger • ${currentChallenger.name}`
        : `Tournament`;
    tournamentBracket.appendChild(roundLabel);

    const playersList = document.createElement("div");
    playersList.className = "bracketItem";
    const remainingNames = currentChallenger
        ? [currentChallenger.name, ...tournamentOpponentQueue.map(p => p.name)]
        : tournamentPlayers.map(p => p.name);
    playersList.textContent = remainingNames.join(" • ");
    tournamentBracket.appendChild(playersList);
}

function updateTournamentBracket(winnerName, showRoadToFinal = false) {
    if (!tournamentBracket) return;
    renderTournamentBracket(showRoadToFinal);
}

function showTournamentPauseScreen(winnerPlayerName, categoryKey) {
    tournamentPaused = true;
    const formattedCategory = categoryKey
        ? categoryKey
            .split("-")
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ")
        : "";

    if (winnerName) {
        winnerName.textContent = winnerPlayerName;
    }

    if (winnerDescription) {
        winnerDescription.textContent = categoryKey
            ? `🏆 Νικητής της αναμέτρησης • Επόμενη κατηγορία: ${formattedCategory}`
            : "🏆 Νικητής της αναμέτρησης";
    }

    showScreen(winnerScreen);
    playSound("victory");

    if (answerCaption) {
        answerCaption.textContent = categoryKey
            ? `Επόμενο matchup • Κατηγορία: ${formattedCategory}`
            : "Καλή τύχη στον επόμενο γύρο!";
        answerCaption.classList.add("show", "pass");
    }

    clearTimeout(tournamentPauseTimer);
    tournamentPauseTimer = setTimeout(() => {
        tournamentPaused = false;
        if (answerCaption) {
            answerCaption.classList.remove("show", "pass");
            answerCaption.textContent = "";
        }
        startNextTournamentMatch();
    }, 2200);
}

function finishTournament(champion = "Winner") {
    showScreen(winnerScreen);
    winnerName.textContent = champion;
    winnerDescription.textContent = "🏆 Πρωταθλητής του Τουρνουά";
    playSound("victory");
}

function beginMatch(player1NameText, player2NameText, categoryKey) {
    player1Name.textContent = player1NameText;
    player2Name.textContent = player2NameText;

    player1Time = Number(timeSelect.value);
    player2Time = Number(timeSelect.value);

    player1Timer.textContent = player1Time;
    player2Timer.textContent = player2Time;

    currentPlayer = 1;

    currentCategory.textContent = categoryKey
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    currentImages = [...categories[categoryKey]];

    showScreen(gameScreen);

    ensureAudio();
    audioContext.resume().catch(() => {});

    updatePlayerLights();

    gameRunning = true;

    loadNextImage();
    startTimer();

    logDebug("Game started. Audio resumed. Αναμονή για φωνητική εισαγωγή.");
    startSpeechRecognition();
}

/*=========================================
            LOAD NEXT IMAGE
=========================================*/

function loadNextImage() {
    if (!gameRunning) return;

    const selectedDifficulties = [];
    if (easyCheckbox.checked) selectedDifficulties.push("easy");
    if (mediumCheckbox.checked) selectedDifficulties.push("medium");
    if (hardCheckbox.checked) selectedDifficulties.push("hard");

    const availableImages = currentImages.filter(image =>
        selectedDifficulties.includes(image.difficulty)
    );

    if (availableImages.length === 0) {
        finishGame();
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableImages.length);
    currentImage = availableImages[randomIndex];

    gameImage.classList.remove("imageVisible");
    gameImage.classList.add("imageHidden");

    const imageFrame = document.querySelector(".imageFrame");
    if (imageFrame) {
        imageFrame.classList.add("changeAnim");
    }

    setTimeout(() => {
        gameImage.src = currentImage.image;
        gameImage.classList.remove("imageHidden");
        gameImage.classList.add("imageVisible");
    }, 250);

    setTimeout(() => {
        if (imageFrame) {
            imageFrame.classList.remove("changeAnim");
        }
    }, 600);

    currentImages = currentImages.filter(image => image !== currentImage);
}

/*=========================================
            TIMER & SWITCH
=========================================*/

function startTimer() {
    clearInterval(timer);

    timer = setInterval(() => {
        if (!gameRunning) return;

        if (currentPlayer === 1) {
            player1Time--;
            player1Timer.textContent = player1Time;

            if (player1Time <= 10) {
                playSound("tick");
                player1Timer.classList.add("danger");
            }

            if (player1Time <= 0) {
                finishGame(2);
            }
        } else {
            player2Time--;
            player2Timer.textContent = player2Time;

            if (player2Time <= 10) {
                playSound("tick");
                player2Timer.classList.add("danger");
            }

            if (player2Time <= 0) {
                finishGame(1);
            }
        }
    }, 1000);
}

function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updatePlayerLights();
}

function updatePlayerLights() {
    const leftLight = document.getElementById("leftPlayerLight");
    const rightLight = document.getElementById("rightPlayerLight");

    if (leftLight) leftLight.classList.remove("active");
    if (rightLight) rightLight.classList.remove("active");

    if (currentPlayer === 1) {
        if (leftLight) leftLight.classList.add("active");
    } else {
        if (rightLight) rightLight.classList.add("active");
    }
}

/*=========================================
        VOICE RECOGNITION
=========================================*/

async function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        setMicStatus("error");
        messageBox.textContent = "Το browser δεν υποστηρίζει αναγνώριση ομιλίας.";
        console.warn("Browser speech recognition unavailable");
        return;
    }

    logDebug("Παραχωρείται δωρεάν browser speech recognition.");
    startBrowserSpeechRecognition();
}

function stopSpeechRecognition() {
    stopBrowserSpeechRecognition();
}

function startBrowserSpeechRecognition() {
    console.log('Starting browser speech recognition fallback');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('Browser speech recognition not supported');
        setMicStatus('error');
        messageBox.textContent = "Το browser δεν υποστηρίζει αναγνώριση ομιλίας.";
        return;
    }

    usingBrowserSpeechFallback = true;
    browserSpeechRecognition = new SpeechRecognition();
    browserSpeechRecognition.lang = 'el-GR';
    browserSpeechRecognition.continuous = true;
    browserSpeechRecognition.interimResults = true;
    browserSpeechRecognition.maxAlternatives = 1;

    browserSpeechRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (!result || !result[0]) continue;
            const transcript = pickBestTranscript(result, result.isFinal);
            if (!transcript) continue;

            const isFinal = result.isFinal;
            logDebug(`${isFinal ? 'Final' : 'Interim'}: ${transcript}`);

            handleRemoteTranscript(transcript, isFinal);
        }
    };

    browserSpeechRecognition.onerror = (event) => {
        const errorMessage = event.error || event.message || 'unknown';
        console.error('Browser SpeechRecognition error', event);
        logDebug(`SpeechRecognition error: ${errorMessage}`);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setMicStatus('error');
            messageBox.textContent = "Δεν επιτρέπεται η χρήση μικροφώνου.";
            return;
        }

        if (event.error === 'aborted') {
            return;
        }

        if (gameRunning) {
            setMicStatus('retry');
            messageBox.textContent = "Προσπάθεια επανασύνδεσης ομιλίας...";
        } else {
            setMicStatus('error');
        }
    };

    browserSpeechRecognition.onend = () => {
        if (gameRunning && usingBrowserSpeechFallback && !waitingAfterPass) {
            setTimeout(() => {
                if (browserSpeechRecognition && !waitingAfterPass) {
                    try {
                        browserSpeechRecognition.start();
                        logDebug('SpeechRecognition restarted after end');
                    } catch (e) {
                        console.warn('Browser recognition restart failed', e);
                    }
                }
            }, 500);
        }
    };

    try {
        browserSpeechRecognition.start();
        setMicStatus('listening');
        logDebug('Browser speech recognition started.');
    } catch (error) {
        console.error('Browser SpeechRecognition start failed', error);
        setMicStatus('error');
        logDebug('Browser speech recognition failed to start.');
    }
}

function stopBrowserSpeechRecognition() {
    if (!browserSpeechRecognition) return;
    try {
        browserSpeechRecognition.abort();
    } catch (e) {}
    browserSpeechRecognition = null;
    usingBrowserSpeechFallback = false;
}

function handleRemoteTranscript(transcript, isFinal = true) {
    logDebug(`Transcript received: ${transcript}`);
    console.log("handleRemoteTranscript", transcript, isFinal);
    if (waitingAfterPass) return;

    const normalizedText = normalizeSpokenText(transcript);
    if (!normalizedText) return;
    console.log("normalized transcript", normalizedText);

    const cleanedTranscript = normalizedText.replace(/[.!,;:]/g, "").trim();
    const shortTranscript = cleanedTranscript.replace(/\s+/g, "").length;

    if (shortTranscript <= 2 && cleanedTranscript !== "πασο" && cleanedTranscript !== "πασου") {
        return;
    }

    const now = Date.now();
    if (cleanedTranscript && cleanedTranscript === lastProcessedTranscript && now - lastProcessedTranscriptTime < 1500) {
        return;
    }
    lastProcessedTranscript = cleanedTranscript;
    lastProcessedTranscriptTime = now;

    if (isPassCommand(cleanedTranscript)) {
        console.log("detected pass command", cleanedTranscript);
        handlePass();
        return;
    }

    if (!isFinal) {
        if (checkAnswer(cleanedTranscript, false)) {
            return;
        }
        return;
    }

    checkAnswer(cleanedTranscript, isFinal);
}

function isPassCommand(normalizedText) {
    const cleaned = (normalizedText || "").toLowerCase().trim();
    if (!cleaned) return false;

    const passRegex = /\b(πασο|πασου|pazo|paso|pass)\b/;
    if (passRegex.test(cleaned)) {
        return true;
    }

    const normalized = cleaned.replace(/\s+/g, "").trim();
    if (normalized === "πασο" || normalized === "πασου") {
        return true;
    }

    return similarity(cleaned, "πασο") >= 0.9 || similarity(cleaned, "πασου") >= 0.9;
}

function normalizeSpokenText(text) {
    return normalizeAnswerText(text);
}

function pickBestTranscript(result, isFinal) {
    if (!result || result.length === 0) return '';
    let best = result[0];
    for (let i = 1; i < result.length; i++) {
        const candidate = result[i];
        if (!candidate) continue;
        const candidateConfidence = Number(candidate.confidence || 0);
        const bestConfidence = Number(best.confidence || 0);
        if (candidateConfidence > bestConfidence) {
            best = candidate;
            continue;
        }
        if (!bestConfidence && candidate.transcript && candidate.transcript.length > (best.transcript || '').length) {
            best = candidate;
        }
    }
    return (best.transcript || '').trim();
}


/*=========================================
            ANSWER CHECK
=========================================*/

function transliterateGreekText(text) {
    return text
        .replace(/αι/g, "ai")
        .replace(/ει/g, "ei")
        .replace(/οι/g, "oi")
        .replace(/υι/g, "yi")
        .replace(/ευ/g, "eu")
        .replace(/ου/g, "ou")
        .replace(/γγ/g, "ng")
        .replace(/α/g, "a")
        .replace(/β/g, "v")
        .replace(/γ/g, "g")
        .replace(/δ/g, "d")
        .replace(/ε/g, "e")
        .replace(/ζ/g, "z")
        .replace(/η/g, "i")
        .replace(/θ/g, "th")
        .replace(/ι/g, "i")
        .replace(/κ/g, "k")
        .replace(/λ/g, "l")
        .replace(/μ/g, "m")
        .replace(/ν/g, "n")
        .replace(/ξ/g, "x")
        .replace(/ο/g, "o")
        .replace(/π/g, "p")
        .replace(/ρ/g, "r")
        .replace(/σ/g, "s")
        .replace(/ς/g, "s")
        .replace(/τ/g, "t")
        .replace(/υ/g, "y")
        .replace(/φ/g, "f")
        .replace(/χ/g, "ch")
        .replace(/ψ/g, "ps")
        .replace(/ω/g, "o")
        .replace(/ά/g, "a")
        .replace(/έ/g, "e")
        .replace(/ή/g, "i")
        .replace(/ί/g, "i")
        .replace(/ό/g, "o")
        .replace(/ύ/g, "y")
        .replace(/ώ/g, "o")
        .replace(/ϊ/g, "i")
        .replace(/ϋ/g, "y")
        .replace(/ΐ/g, "i")
        .replace(/ΰ/g, "y");
}

function repairSpeechText(text) {
    let value = (text || "")
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .normalize("NFC")
        .trim()
        .toLowerCase();

    value = transliterateGreekText(value);

    for (let i = 0; i < 3; i++) {
        const nextValue = value
            .replace(/\b([a-z0-9])\s+([a-z0-9])\b/g, "$1$2")
            .replace(/\b([a-z0-9])\s+([a-z0-9]{2,})\b/g, "$1$2")
            .replace(/\b([a-z0-9]{2,})\s+([a-z0-9])\b/g, "$1$2")
            .replace(/\s+/g, " ")
            .trim();

        if (nextValue === value) break;
        value = nextValue;
    }

    return value
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeAnswerText(text) {
    if (text == null) return "";
    let value = repairSpeechText(text);
    value = value.replace(/\b(το|η|ο|τη|την|τον|στο|στη|στον|και|θα|να|εγω|εσύ|εσυ|είναι|ειναι|είμαι|ειμαι|σε)\b/gi, " ");
    return value.replace(/\s+/g, " ").trim();
}

function phoneticKey(text) {
    let value = normalizeAnswerText(text);
    if (!value) return "";

    value = value
        .replace(/j/g, "g")
        .replace(/c/g, "k")
        .replace(/y/g, "i")
        .replace(/v/g, "b")
        .replace(/ph/g, "f")
        .replace(/th/g, "t")
        .replace(/ch/g, "k")
        .replace(/tz/g, "ts")
        .replace(/ks/g, "x")
        .replace(/ou/g, "u")
        .replace(/ei/g, "i")
        .replace(/ai/g, "e")
        .replace(/oi/g, "i")
        .replace(/(.)\1+/g, "$1");

    return value.replace(/[^a-z0-9]/g, "");
}

function getFuzzyPhraseScore(answerText, spokenText) {
    const answerWords = normalizeAnswerText(answerText).split(/\s+/).filter(Boolean);
    const spokenWords = normalizeAnswerText(spokenText).split(/\s+/).filter(Boolean);

    if (answerWords.length === 0 || spokenWords.length === 0) return 0;

    let score = 0;
    const usedIndexes = new Set();

    answerWords.forEach(answerWord => {
        let bestScore = 0;
        let bestIndex = -1;

        spokenWords.forEach((spokenWord, index) => {
            if (usedIndexes.has(index)) return;
            const similarityScore = Math.max(
                wordSimilarity(answerWord, spokenWord),
                wordSimilarity(phoneticKey(answerWord), phoneticKey(spokenWord))
            );
            if (similarityScore > bestScore) {
                bestScore = similarityScore;
                bestIndex = index;
            }
        });

        if (bestScore >= 0.55) {
            score += bestScore;
            if (bestIndex >= 0) {
                usedIndexes.add(bestIndex);
            }
        }
    });

    return score / Math.max(answerWords.length, 1);
}

function getConsonantSkeleton(text) {
    return normalizeAnswerText(text)
        .replace(/[aeiou]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .replace(/(.)\1+/g, "$1");
}

function getVowelReducedKey(text) {
    return normalizeAnswerText(text)
        .replace(/[aeiou]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .replace(/(.)\1+/g, "$1");
}

function answerMatches(answerText, spokenText, isFinal = true) {
    const normalizedAnswer = normalizeAnswerText(answerText);
    const normalizedSpoken = normalizeAnswerText(spokenText);
    if (!normalizedAnswer || !normalizedSpoken) return false;

    const compactAnswer = normalizedAnswer.replace(/\s+/g, "");
    const compactSpoken = normalizedSpoken.replace(/\s+/g, "");

    if (normalizedSpoken === normalizedAnswer) return true;
    if (compactSpoken === compactAnswer) return true;
    if (normalizedSpoken.includes(normalizedAnswer)) return true;
    if (normalizedAnswer.includes(normalizedSpoken)) return true;
    if (compactSpoken.includes(compactAnswer)) return true;
    if (compactAnswer.includes(compactSpoken)) return true;

    if (compactSpoken.length >= 3 && compactAnswer.length >= 4) {
        if (compactAnswer.startsWith(compactSpoken) || compactSpoken.startsWith(compactAnswer)) {
            return true;
        }
    }

    const answerWords = normalizedAnswer.split(/\s+/).filter(w => w.length > 1);
    const spokenWords = normalizedSpoken.split(/\s+/).filter(w => w.length > 1);

    if (answerWords.length > 0 && answerWords.every(word => spokenWords.includes(word))) {
        return true;
    }

    if (spokenWords.some(word => answerWords.includes(word))) {
        return true;
    }

    const answerPhonetic = phoneticKey(normalizedAnswer);
    const spokenPhonetic = phoneticKey(normalizedSpoken);
    if (answerPhonetic && spokenPhonetic) {
        if (answerPhonetic === spokenPhonetic) return true;
        const phoneticSimilarity = similarity(answerPhonetic, spokenPhonetic);
        if (phoneticSimilarity >= (isFinal ? 0.65 : 0.82)) {
            return true;
        }
    }

    const answerSkeleton = getConsonantSkeleton(normalizedAnswer);
    const spokenSkeleton = getConsonantSkeleton(normalizedSpoken);
    if (answerSkeleton && spokenSkeleton) {
        if (answerSkeleton === spokenSkeleton) return true;
        const skeletonSimilarity = similarity(answerSkeleton, spokenSkeleton);
        if (skeletonSimilarity >= (isFinal ? 0.72 : 0.86)) {
            return true;
        }
    }

    const answerVowelReduced = getVowelReducedKey(normalizedAnswer);
    const spokenVowelReduced = getVowelReducedKey(normalizedSpoken);
    if (answerVowelReduced && spokenVowelReduced) {
        if (answerVowelReduced === spokenVowelReduced) return true;
        const reducedSimilarity = similarity(answerVowelReduced, spokenVowelReduced);
        if (reducedSimilarity >= (isFinal ? 0.68 : 0.84)) {
            return true;
        }
    }

    const overallSimilarity = similarity(normalizedAnswer, normalizedSpoken);
    if (overallSimilarity >= (isFinal ? 0.5 : 0.76)) {
        return true;
    }

    if (isFinal) {
        const fuzzyPhraseScore = getFuzzyPhraseScore(normalizedAnswer, normalizedSpoken);
        if (fuzzyPhraseScore >= 0.6) {
            return true;
        }

        if (answerWords.length === 1 && spokenWords.length === 1) {
            const singleWordSimilarity = wordSimilarity(answerWords[0], spokenWords[0]);
            if (singleWordSimilarity >= 0.62) {
                return true;
            }
        }

        const strongWordMatch = answerWords.some(answerWord =>
            spokenWords.some(spokenWord => wordSimilarity(answerWord, spokenWord) >= 0.7)
        );
        if (strongWordMatch) {
            return true;
        }

        const closeWordMatches = answerWords.filter(answerWord =>
            spokenWords.some(spokenWord => wordSimilarity(answerWord, spokenWord) >= 0.58)
        );
        if (closeWordMatches.length >= Math.max(1, Math.floor(answerWords.length / 2))) {
            return true;
        }

        if (answerWords.length > 0 && spokenWords.length > 0) {
            const sharedWordCount = answerWords.filter(word => spokenWords.includes(word)).length;
            if (sharedWordCount >= Math.max(1, Math.floor(answerWords.length / 2))) {
                return true;
            }

            if (answerWords.some(word => word.length >= 4 && spokenWords.some(spokenWord => spokenWord.includes(word) || word.includes(spokenWord)))) {
                return true;
            }
        }
    }

    return false;
}

function wordSimilarity(a, b) {
    return similarity(a, b);
}

function similarity(a, b) {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    const distance = levenshteinDistance(a, b);
    return 1 - distance / maxLen;
}

function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function checkAnswer(spokenText, isFinal = true) {
    if (!currentImage) return false;

    let answers = [];
    if (currentImage.answer) {
        answers = [currentImage.answer];
    } else if (currentImage.answers) {
        answers = currentImage.answers;
    }

    const normalizedSpoken = normalizeAnswerText(spokenText);
    const matched = answers.some(answer => answerMatches(answer, normalizedSpoken, isFinal));

    if (matched) {
        playSound("correct");
        messageBox.textContent = "✔ Σωστό!";
        setMessageFeedback("correct");

        if (currentPlayer === 1) {
            player1Stats.correct++;
            player1Stats.streak++;
            player1Stats.bestStreak = Math.max(player1Stats.bestStreak, player1Stats.streak);
        } else {
            player2Stats.correct++;
            player2Stats.streak++;
            player2Stats.bestStreak = Math.max(player2Stats.bestStreak, player2Stats.streak);
        }

        switchPlayer();
        loadNextImage();
        return true;
    }

    if (!isFinal) {
        return false;
    }

    if (currentPlayer === 1) {
        player1Stats.wrong++;
        player1Stats.streak = 0;
    } else {
        player2Stats.wrong++;
        player2Stats.streak = 0;
    }

    messageBox.textContent = "✖ Λάθος";
    setMessageFeedback("wrong");
    playSound("buzzer");
    return false;
}

/*=========================================
                    PASS
=========================================*/

function handlePass() {
    if (waitingAfterPass) return;
    waitingAfterPass = true;

    playSound("ice");
    playSound("pass");

    const answerText = currentImage && currentImage.answer
        ? currentImage.answer
        : currentImage && currentImage.answers
            ? currentImage.answers.join(', ')
            : '';

    if (answerText) {
        answerCaption.textContent = `✅ Σωστή απάντηση: ${answerText}`;
        answerCaption.classList.add("show", "pass");
    }

    messageBox.textContent = "ΠΑΣΟ - η σωστή απάντηση εμφανίζεται παρακάτω";
    setMessageFeedback("pass");

    if (currentPlayer === 1) {
        player1Stats.pass++;
        player1Stats.streak = 0;
    } else {
        player2Stats.pass++;
        player2Stats.streak = 0;
    }

    if (gameScreen) {
        gameScreen.classList.add("frozen");
    }

    const iceOverlay = document.getElementById("iceOverlay");
    if (iceOverlay) {
        iceOverlay.classList.add("show");
    }

    setTimeout(() => {
        if (iceOverlay) {
            iceOverlay.classList.remove("show");
        }
        if (gameScreen) {
            gameScreen.classList.remove("frozen");
        }
        waitingAfterPass = false;
        loadNextImage();
    }, 3200);
}

/*=========================================
            AUDIO & CONFETTI
=========================================*/

function ensureAudio() {
    if (!audioContext) return;
    if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
    }
}

function playTone(frequency, type = "sine", duration = 0.12, volume = 0.2) {
    if (!audioContext) return;
    ensureAudio();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.stop(audioContext.currentTime + duration + 0.02);
}

function playSound(sound) {
    switch (sound) {
        case "tick":
            tickToggle = !tickToggle;
            playTone(tickToggle ? 520 : 440, "square", 0.06, 0.14);
            break;
        case "ice":
            playTone(380, "triangle", 0.18, 0.12);
            setTimeout(() => playTone(460, "triangle", 0.12, 0.08), 80);
            break;
        case "correct":
            playTone(880, "triangle", 0.18, 0.22);
            playTone(1320, "triangle", 0.12, 0.18);
            break;
        case "buzzer":
            playTone(180, "sawtooth", 0.32, 0.24);
            break;
        case "pass":
            playTone(260, "sawtooth", 0.18, 0.18);
            break;
        case "timeout":
            playTone(120, "square", 0.28, 0.22);
            break;
        case "victory":
            playTone(880, "triangle", 0.18, 0.2);
            playTone(1100, "triangle", 0.16, 0.18);
            startConfetti();
            break;
        default:
            break;
    }
}

function setupConfettiCanvas() {
    confettiCanvas = document.getElementById("confettiCanvas");
    if (!confettiCanvas) return;
    confettiCtx = confettiCanvas.getContext("2d");
    window.addEventListener("resize", resizeConfettiCanvas);
    resizeConfettiCanvas();
}

function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = confettiCanvas.clientWidth;
    confettiCanvas.height = confettiCanvas.clientHeight;
}

function startConfetti() {
    if (!confettiCtx) return;
    confettiParticles = Array.from({ length: 80 }, () => ({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        size: Math.random() * 8 + 6,
        speed: Math.random() * 2 + 2,
        angle: Math.random() * Math.PI * 2,
        color: `hsl(${Math.random() * 360}, 90%, 70%)`,
        tilt: Math.random() * 10 - 10,
        tiltSpeed: Math.random() * 0.08 + 0.06
    }));
    if (confettiAnimationFrame) {
        cancelAnimationFrame(confettiAnimationFrame);
    }
    function updateConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiParticles.forEach(particle => {
            particle.y += particle.speed;
            particle.x += Math.sin(particle.angle) * 2;
            particle.tilt += particle.tiltSpeed;
            if (particle.y > confettiCanvas.height + particle.size) {
                particle.y = -particle.size;
                particle.x = Math.random() * confettiCanvas.width;
            }
            confettiCtx.fillStyle = particle.color;
            confettiCtx.fillRect(
                particle.x + particle.tilt,
                particle.y,
                particle.size,
                particle.size * 0.35
            );
        });
        confettiAnimationFrame = requestAnimationFrame(updateConfetti);
    }
    updateConfetti();
    setTimeout(stopConfetti, 3500);
}

function stopConfetti() {
    if (confettiAnimationFrame) {
        cancelAnimationFrame(confettiAnimationFrame);
        confettiAnimationFrame = null;
    }
    if (confettiCtx && confettiCanvas) {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

/*=========================================
            FINISH GAME
=========================================*/

function finishGame(winnerPlayer) {
    gameRunning = false;
    clearInterval(timer);
    stopSpeechRecognition();

    if (tournamentCurrentMatch) {
        const winnerText = winnerPlayer === 1
            ? tournamentCurrentMatch.player1
            : tournamentCurrentMatch.player2;

        const resolvedWinner = winnerText || (winnerPlayer === 1 ? player1Name.textContent : player2Name.textContent);
        const challengerWon = resolvedWinner === tournamentCurrentMatch.challenger.name;

        if (!challengerWon) {
            currentChallenger = tournamentCurrentMatch.opponent;
        }

        tournamentCurrentMatch = null;
        updateTournamentBracket(resolvedWinner, true);

        const nextOpponent = tournamentOpponentQueue[0];
        if (!nextOpponent) {
            finishTournament(currentChallenger ? currentChallenger.name : resolvedWinner);
            return;
        }

        const nextCategory = currentChallenger && currentChallenger.category
            ? currentChallenger.category
            : nextOpponent.category || getRandomCategoryKey();
        showTournamentPauseScreen(resolvedWinner, nextCategory);
        return;
    }

    showScreen(winnerScreen);
    const winner = winnerPlayer === 1 ? player1Name.textContent : player2Name.textContent;
    winnerName.textContent = winner;
    winnerDescription.textContent = "🏆 Νικητής του Pic Duel";
    playSound("victory");
}

function continueToMenu(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    console.log('Continue clicked, returning to menu');
    clearTimeout(tournamentPauseTimer);
    clearTimeout(tournamentAutoAdvanceTimeout);
    tournamentPaused = false;
    tournamentCurrentMatch = null;
    tournamentOpponentQueue = [];
    currentChallenger = null;
    stopConfetti();
    resetGameState();
    showScreen(menuScreen);
}

function playAgain() {
    location.reload();
}

function backToMenu(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    continueToMenu(event);
}

function resetGameState() {
    gameRunning = false;
    waitingAfterPass = false;
    clearInterval(timer);
    stopSpeechRecognition();

    currentImage = null;
    currentImages = [];

    if (player1Timer) player1Timer.classList.remove("danger");
    if (player2Timer) player2Timer.classList.remove("danger");

    if (answerCaption) {
        answerCaption.classList.remove("show", "pass");
        answerCaption.textContent = "";
    }

    if (messageBox) {
        messageBox.textContent = "";
        messageBox.classList.remove("correct", "wrong", "pass");
    }

    if (gameScreen) {
        gameScreen.classList.remove("frozen");
    }

    const imageFrame = document.querySelector(".imageFrame");
    if (imageFrame) {
        imageFrame.classList.remove("changeAnim");
    }

    logDebug("Επιστροφή στο μενού για νέο παιχνίδι.");
}

/*=========================================
        FILL STATISTICS
=========================================*/

function fillStatistics() {
    document.getElementById("statsPlayer1Name").textContent = player1Name.textContent || "Player 1";
    document.getElementById("statsPlayer2Name").textContent = player2Name.textContent || "Player 2";

    document.getElementById("player1Correct").textContent = player1Stats.correct;
    document.getElementById("player1Wrong").textContent = player1Stats.wrong;
    document.getElementById("player1Pass").textContent = player1Stats.pass;
    document.getElementById("player1BestStreak").textContent = player1Stats.bestStreak;
    document.getElementById("player1TimeLeft").textContent = player1Time + "s";

    document.getElementById("player2Correct").textContent = player2Stats.correct;
    document.getElementById("player2Wrong").textContent = player2Stats.wrong;
    document.getElementById("player2Pass").textContent = player2Stats.pass;
    document.getElementById("player2BestStreak").textContent = player2Stats.bestStreak;
    document.getElementById("player2TimeLeft").textContent = player2Time + "s";

    const player1Attempts = player1Stats.correct + player1Stats.wrong;
    const player2Attempts = player2Stats.correct + player2Stats.wrong;

    document.getElementById("player1Accuracy").textContent =
        player1Attempts === 0
        ? "0%"
        : Math.round(player1Stats.correct / player1Attempts * 100) + "%";

    document.getElementById("player2Accuracy").textContent =
        player2Attempts === 0
        ? "0%"
        : Math.round(player2Stats.correct / player2Attempts * 100) + "%";
}

function openStatistics() {
    showScreen(statisticsScreen);
    fillStatistics();
}

function startGame() {
    if (!easyCheckbox.checked && !mediumCheckbox.checked && !hardCheckbox.checked) {
        alert("Επίλεξε τουλάχιστον μία δυσκολία.");
        return;
    }
    if (!startTournamentMode()) {
        return;
    }
}

/*=========================================
            INITIALIZATION
=========================================*/

window.addEventListener("load", () => {
    populateCategorySelect();
    setupConfettiCanvas();
    showScreen(introScreen);

    if (window.location.protocol === 'file:') {
        const msg = 'Η σελίδα φορτώθηκε απευθείας από file://. Χρησιμοποιήστε http://localhost:3000 για να λειτουργήσει σωστά.';
        console.warn(msg);
        logDebug(msg);
    }

    setTimeout(() => {
        showScreen(menuScreen);
    }, 2500);

    if (startGameButton) {
        startGameButton.addEventListener("click", startGame);
    }

    if (tournamentPlayerCount) {
        tournamentPlayerCount.addEventListener("change", renderTournamentInputs);
    }
    if (initialChallengerSelect) {
        initialChallengerSelect.addEventListener("change", (e) => {
            console.log('initialChallengerSelect change ->', e.target.value);
            populateChallengeSelectors();
        });
    }
    if (initialOpponentSelect) {
        initialOpponentSelect.addEventListener("change", (e) => {
            console.log('initialOpponentSelect change ->', e.target.value);
            populateChallengeSelectors();
        });
    }

    renderTournamentInputs();
    showTournamentSetup(true);

    try { initAllCustomSelects(); } catch (e) { console.warn('initAllCustomSelects failed', e); }

    if (continueButton) {
        continueButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            continueToMenu(event);
        });
        continueButton.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                continueToMenu(event);
            }
        });
        continueButton.setAttribute('aria-label', 'Continue to Main Menu');
        continueButton.style.pointerEvents = 'auto';
        continueButton.tabIndex = 0;
    }

    if (winnerScreen) {
        winnerScreen.addEventListener("click", (event) => {
            if (event.target.closest("#continueButton")) {
                return;
            }
            const clickedInsideWinnerContent = event.target.closest(".winnerContainer");
            if (!clickedInsideWinnerContent) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            continueToMenu(event);
        });
    }

    if (statisticsPlayAgainButton) {
        statisticsPlayAgainButton.addEventListener("click", playAgain);
    }

    if (statisticsMenuButton) {
        statisticsMenuButton.addEventListener("click", backToMenu);
    }
});