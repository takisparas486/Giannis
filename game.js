/*=========================================
            PIC DUEL
            GAME.JS
            PART 1
=========================================*/

/* ---------- SCREENS ---------- */

const introScreen = document.getElementById("introScreen");
const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const winnerScreen = document.getElementById("winnerScreen");

/* ---------- MENU ---------- */

const player1Input = document.getElementById("player1Input");
const player2Input = document.getElementById("player2Input");

const categorySelect = document.getElementById("categorySelect");
const timeSelect = document.getElementById("timeSelect");

const easyCheckbox = document.getElementById("easyDifficulty");
const mediumCheckbox = document.getElementById("mediumDifficulty");
const hardCheckbox = document.getElementById("hardDifficulty");

const startGameButton = document.getElementById("startGameButton");

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

function setMessageFeedback(type) {
    if (!messageBox) return;
    messageBox.classList.remove("correct", "wrong");
    if (type === "correct") {
        messageBox.classList.add("correct");
    }
    if (type === "wrong") {
        messageBox.classList.add("wrong");
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

let speechRecognition = null;
let speechRecognitionPermissionDenied = false;
let speechRecognitionRestartTimer = null;
let wsStream = null;
let mediaStream = null;
let audioCtx = null;
let sourceNode = null;
let processor = null;

let currentImage = null;

let currentImages = [];

let waitingAfterPass = false;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let tickToggle = false;
let confettiParticles = [];
let confettiAnimationFrame = null;
let confettiCanvas = null;
let confettiCtx = null;

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
            PART 2
=========================================*/

/* ---------- INTRO ---------- */

function showScreen(targetScreen) {

    screens.forEach(screen => {

        screen.classList.remove("active");

    });

    if (targetScreen) {

        targetScreen.classList.add("active");

    }

}

function populateCategorySelect() {

    if (!categorySelect) return;

    categorySelect.innerHTML = "";

    Object.entries(categories).forEach(([key, items]) => {

        if (!Array.isArray(items)) return;

        const option = document.createElement("option");

        option.value = key;
        option.textContent = key
            .split("-")
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");

        categorySelect.appendChild(option);

    });

    if (categorySelect.options.length > 0) {

        categorySelect.selectedIndex = 0;

    }

}

window.addEventListener("load", () => {

    populateCategorySelect();
    setupConfettiCanvas();
    showScreen(introScreen);

    setTimeout(() => {

        showScreen(menuScreen);

    }, 2500);

});


/* ---------- START BUTTON ---------- */

startGameButton.addEventListener("click", startGame);
continueButton.addEventListener("click", openStatistics);

statisticsPlayAgainButton.addEventListener(
    "click",
    playAgain
);

statisticsMenuButton.addEventListener(
    "click",
    backToMenu
);


/* ---------- START GAME ---------- */

function startGame() {

    if (
        !easyCheckbox.checked &&
        !mediumCheckbox.checked &&
        !hardCheckbox.checked
    ) {

        alert("Επίλεξε τουλάχιστον μία δυσκολία.");

        return;

    }

    if (player1Input.value.trim() === "") {

        alert("Δώσε όνομα Παίκτη 1.");

        return;

    }

    if (player2Input.value.trim() === "") {

        alert("Δώσε όνομα Παίκτη 2.");

        return;

    }

    player1Name.textContent = player1Input.value;

    player2Name.textContent = player2Input.value;


    player1Time = Number(timeSelect.value);

    player2Time = Number(timeSelect.value);


    player1Timer.textContent = player1Time;

    player2Timer.textContent = player2Time;


    currentPlayer = 1;

    currentCategory.textContent =
        categorySelect.options[
            categorySelect.selectedIndex
        ].text;


    currentImages = [...categories[
        categorySelect.value
    ]];


    showScreen(gameScreen);

    updatePlayerLights();

    gameRunning = true;


    loadNextImage();

    startTimer();

    startSpeechRecognition();

}

/*=========================================
            PART 3
=========================================*/

function loadNextImage() {

    if (!gameRunning) return;

    const selectedDifficulties = [];

    if (easyCheckbox.checked) {

        selectedDifficulties.push("easy");

    }

    if (mediumCheckbox.checked) {

        selectedDifficulties.push("medium");

    }

    if (hardCheckbox.checked) {

        selectedDifficulties.push("hard");

    }

    const availableImages = currentImages.filter(image =>

        selectedDifficulties.includes(image.difficulty)

    );

    if (availableImages.length === 0) {

        finishGame();

        return;

    }

    const randomIndex = Math.floor(

        Math.random() * availableImages.length

    );

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

    currentImages = currentImages.filter(

        image => image !== currentImage

    );

}

/*=========================================
            PART 4
=========================================*/

/* ---------- TIMER ---------- */

function startTimer(){

    clearInterval(timer);

    timer = setInterval(() => {

        if(!gameRunning) return;


        if(currentPlayer === 1){

            player1Time--;

            player1Timer.textContent = player1Time;

if(player1Time <= 10){

    playSound("tick");

    player1Timer.classList.add("danger");

}

            if(player1Time <= 0){

                finishGame(2);

            }

        }

        else{

            player2Time--;

            player2Timer.textContent = player2Time;


if(player2Time <= 10){

    playSound("tick");

    player2Timer.classList.add("danger");

}

            if(player2Time <= 0){

                finishGame(1);

            }

        }

    },1000);

}

/* ---------- CHANGE PLAYER ---------- */

function switchPlayer(){

    currentPlayer = currentPlayer === 1 ? 2 : 1;

    updatePlayerLights();

}

/* ---------- PLAYER LIGHTS ---------- */

function updatePlayerLights(){

    const leftLight = document.getElementById("leftPlayerLight");
    const rightLight = document.getElementById("rightPlayerLight");

    if(leftLight) leftLight.classList.remove("active");
    if(rightLight) rightLight.classList.remove("active");

    if(currentPlayer === 1){

        if(leftLight) leftLight.classList.add("active");

    }

    else{

        if(rightLight) rightLight.classList.add("active");

    }

}

/*=========================================
            PART 5
        VOICE RECOGNITION
=========================================*/

/* ---------- SPEECH ---------- */

async function startSpeechRecognition(){
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Η συσκευή δεν υποστηρίζει καταγραφή ήχου.");
        return;
    }

    if (speechRecognitionPermissionDenied) {
        setMicStatus("error");
        return;
    }

    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
        console.error("Mic permission denied", error);
        speechRecognitionPermissionDenied = true;
        setMicStatus("error");
        return;
    }

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sourceNode = audioCtx.createMediaStreamSource(mediaStream);
    processor = audioCtx.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0);
        const int16Buffer = floatTo16BitPCM(inputBuffer);
        if (wsStream && wsStream.readyState === WebSocket.OPEN) {
            wsStream.send(int16Buffer);
        }
    };

    sourceNode.connect(processor);
    processor.connect(audioCtx.destination);

    const host = window.location.hostname || 'localhost';
    wsStream = new WebSocket(`ws://${host}:3000/ws`);
    wsStream.binaryType = "arraybuffer";

    wsStream.onopen = () => {
        setMicStatus("listening");
    };

    wsStream.onmessage = (event) => {
        if (!event.data) return;
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'transcript' && typeof data.transcript === 'string') {
                if (data.isFinal) {
                    handleRemoteTranscript(data.transcript);
                }
            }
        } catch (e) {
            console.warn('Invalid transcript message', e);
        }
    };

    wsStream.onerror = () => {
        setMicStatus("error");
    };

    wsStream.onclose = () => {
        setMicStatus("off");
    };
}

function stopSpeechRecognition() {
    if (wsStream) {
        try {
            wsStream.send(JSON.stringify({ type: 'stop' }));
        } catch (e) {}
        wsStream.close();
        wsStream = null;
    }

    if (processor) {
        processor.disconnect();
        processor = null;
    }
    if (sourceNode) {
        sourceNode.disconnect();
        sourceNode = null;
    }
    if (audioCtx) {
        audioCtx.close().catch(() => {});
        audioCtx = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    if (speechRecognitionRestartTimer) {
        clearTimeout(speechRecognitionRestartTimer);
        speechRecognitionRestartTimer = null;
    }
}

/* ---------- RESULT ---------- */

function handleRemoteTranscript(transcript) {
    if (waitingAfterPass) return;
    const normalizedText = normalizeSpokenText(transcript);
    if (/(?:\b|^)(πάσο|πασο|pass)(?:\b|$)/u.test(normalizedText)) {
        handlePass();
        return;
    }
    checkAnswer(normalizedText);
}

function normalizeSpokenText(text) {
    return text
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .trim()
        .toLowerCase();
}

function handleSpeechResult(event){

    if(waitingAfterPass) return;

    const spokenText = event.results[
        event.results.length - 1
    ][0].transcript
    .trim();

    const normalizedText = normalizeSpokenText(spokenText);

    if(/(?:\b|^)(πάσο|πασο|pass)(?:\b|$)/u.test(normalizedText)){

        handlePass();

        return;

    }

    checkAnswer(normalizedText);

}

/*=========================================
            PART 6
        ANSWER CHECK
=========================================*/

function normalizeAnswerText(text) {
    return text
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .trim()
        .toLowerCase();
}

function answerMatches(answerText, spokenText) {
    const normalizedAnswer = normalizeAnswerText(answerText);
    const normalizedSpoken = normalizeAnswerText(spokenText);
    if (!normalizedAnswer || !normalizedSpoken) return false;
    if (normalizedSpoken === normalizedAnswer) return true;
    if (normalizedSpoken.includes(normalizedAnswer)) return true;
    if (normalizedAnswer.includes(normalizedSpoken)) return true;
    const answerWords = normalizedAnswer.split(/\s+/).filter(w => w.length > 1);
    const spokenWords = normalizedSpoken.split(/\s+/).filter(w => w.length > 1);
    if (answerWords.length > 0 && answerWords.every(word => spokenWords.includes(word))) {
        return true;
    }
    if (spokenWords.some(word => answerWords.includes(word))) {
        return true;
    }
    return false;
}

function checkAnswer(spokenText){

    if(!currentImage) return;

    let answers = [];

if(currentImage.answer){

    answers = [currentImage.answer];

}

else if(currentImage.answers){

    answers = currentImage.answers;

}

const normalizedSpoken = normalizeAnswerText(spokenText);

const matched = answers.some(answer => answerMatches(answer, normalizedSpoken));

if(matched){

        playSound("correct");

        messageBox.textContent = "✔ Σωστό!";
        setMessageFeedback("correct");

        if(currentPlayer === 1){

            player1Stats.correct++;

            player1Stats.streak++;

            player1Stats.bestStreak = Math.max(

                player1Stats.bestStreak,

                player1Stats.streak

            );

        }

        else{

            player2Stats.correct++;

            player2Stats.streak++;

            player2Stats.bestStreak = Math.max(

                player2Stats.bestStreak,

                player2Stats.streak

            );

        }

        messageBox.textContent = "✔ Σωστό!";
        setMessageFeedback("correct");
        switchPlayer();

        loadNextImage();

        return;

    }

    if(currentPlayer === 1){

        player1Stats.wrong++;

        player1Stats.streak = 0;

    }

    else{

        player2Stats.wrong++;

        player2Stats.streak = 0;

    }

    messageBox.textContent = "✖ Λάθος";
    setMessageFeedback("wrong");

    playSound("buzzer");
}

/*=========================================
            PART 7
            PASS
=========================================*/

function handlePass(){

    if(waitingAfterPass) return;

    waitingAfterPass = true;

    playSound("ice");
    playSound("pass");

    messageBox.textContent = "ΠΑΣΟ - νέα εικόνα";
    setMessageFeedback("wrong");

    if(currentPlayer === 1){

        player1Stats.pass++;

        player1Stats.streak = 0;

    }

    else{

        player2Stats.pass++;

        player2Stats.streak = 0;

    }

    if (gameScreen) {
        gameScreen.classList.add("frozen");
    }

    const iceOverlay = document.getElementById("iceOverlay");

    if(iceOverlay){

        iceOverlay.classList.add("show");

    }

    setTimeout(() => {

        if(iceOverlay){

            iceOverlay.classList.remove("show");

        }

        if (gameScreen) {
            gameScreen.classList.remove("frozen");
        }

        waitingAfterPass = false;
        loadNextImage();

    },3000);

}

/*=========================================
            PART 8
        SOUNDS & FINISH
=========================================*/

/* ---------- SOUNDS ---------- */


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

/* ---------- FINISH ---------- */

function finishGame(winnerPlayer){

    gameRunning = false;

    clearInterval(timer);

    stopSpeechRecognition();

    showScreen(winnerScreen);

    const winner =

        winnerPlayer === 1 ?

        player1Input.value :

        player2Input.value;

    winnerName.textContent = winner;

    winnerDescription.textContent =

        "🏆 Νικητής του Pic Duel";

    playSound("victory");

}

/* ---------- OPEN STATISTICS ---------- */

function openStatistics(){

    showScreen(statisticsScreen);

    fillStatistics();

}


/*=========================================
        SCREEN NAVIGATION
=========================================*/

function playAgain(){

    location.reload();

}

function backToMenu(){

    showScreen(menuScreen);

}

/*=========================================
        FILL STATISTICS
=========================================*/

function fillStatistics(){

    document.getElementById("statsPlayer1Name").textContent =
        player1Input.value;

    document.getElementById("statsPlayer2Name").textContent =
        player2Input.value;

    document.getElementById("player1Correct").textContent =
        player1Stats.correct;

    document.getElementById("player1Wrong").textContent =
        player1Stats.wrong;

    document.getElementById("player1Pass").textContent =
        player1Stats.pass;

    document.getElementById("player1BestStreak").textContent =
        player1Stats.bestStreak;

    document.getElementById("player1TimeLeft").textContent =
        player1Time + "s";

    document.getElementById("player2Correct").textContent =
        player2Stats.correct;

    document.getElementById("player2Wrong").textContent =
        player2Stats.wrong;

    document.getElementById("player2Pass").textContent =
        player2Stats.pass;

    document.getElementById("player2BestStreak").textContent =
        player2Stats.bestStreak;

    document.getElementById("player2TimeLeft").textContent =
        player2Time + "s";

    const player1Attempts =
        player1Stats.correct + player1Stats.wrong;

    const player2Attempts =
        player2Stats.correct + player2Stats.wrong;

    document.getElementById("player1Accuracy").textContent =
        player1Attempts === 0
        ? "0%"
        : Math.round(
            player1Stats.correct /
            player1Attempts * 100
        ) + "%";

    document.getElementById("player2Accuracy").textContent =
        player2Attempts === 0
        ? "0%"
        : Math.round(
            player2Stats.correct /
            player2Attempts * 100
        ) + "%";

}

