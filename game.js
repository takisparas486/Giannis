const introScreen = document.getElementById("introScreen");
const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const winnerScreen = document.getElementById("winnerScreen");

const startGameButton = document.getElementById("startGameButton");
const playAgainButton = document.getElementById("playAgainButton");
const backToMenuButton = document.getElementById("backToMenuButton");

const player1Input = document.getElementById("player1Input");
const player2Input = document.getElementById("player2Input");
const categorySelect = document.getElementById("categorySelect");
const difficultySelect = document.getElementById("difficultySelect");
const timeSelect = document.getElementById("timeSelect");

const player1Name = document.getElementById("player1Name");
const player2Name = document.getElementById("player2Name");
const player1Timer = document.getElementById("player1Timer");
const player2Timer = document.getElementById("player2Timer");
const currentCategory = document.getElementById("currentCategory");
const gameImage = document.getElementById("gameImage");
const messageBox = document.getElementById("messageBox");
const answerForm = document.getElementById("answerForm");
const speakButton = document.getElementById("speakButton");
const turnHint = document.getElementById("turnHint");
const winnerName = document.getElementById("winnerName");
const winnerDescription = document.getElementById("winnerDescription");

let player1Time = 60;
let player2Time = 60;
let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1;
let timer = null;
let gameRunning = false;
let currentImages = [];
let currentImage = null;
let speechRecognition = null;
let listeningForAnswer = false;
let recognitionActive = false;

window.addEventListener("load", () => {
    setTimeout(() => {
        introScreen.classList.add("hidden");
        menuScreen.classList.remove("hidden");
    }, 1600);
});

function loadCategories() {
    categorySelect.innerHTML = "";

    Object.keys(categories).forEach((categoryKey) => {
        const option = document.createElement("option");
        option.value = categoryKey;

        const displayName = categoryKey
            .replaceAll("-", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

        option.textContent = displayName;
        categorySelect.appendChild(option);
    });
}

loadCategories();

startGameButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", startGame);
backToMenuButton.addEventListener("click", () => {
    winnerScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
});
speakButton?.addEventListener("click", startVoiceRecognition);

function startGame() {
    menuScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    winnerScreen.classList.add("hidden");
    listeningForAnswer = false;

    player1Name.textContent = player1Input.value.trim() || "Player 1";
    player2Name.textContent = player2Input.value.trim() || "Player 2";

    player1Time = Number(timeSelect.value);
    player2Time = Number(timeSelect.value);
    player1Score = 0;
    player2Score = 0;

    player1Timer.textContent = player1Time;
    player2Timer.textContent = player2Time;

    currentPlayer = 1;
    gameRunning = true;

    messageBox.textContent = "Microphone is on. Say the name!";
    currentCategory.textContent = categorySelect.options[categorySelect.selectedIndex].text;
    currentImages = [...categories[categorySelect.value]];

    showRandomImage();
    startVoiceRecognition();
}

function initSpeechRecognition() {
    if (speechRecognition || !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition = new SpeechRecognition();
    speechRecognition.lang = "en-US";
    speechRecognition.continuous = true;
    speechRecognition.interimResults = false;

    speechRecognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join(" ")
            .trim();

        listeningForAnswer = false;
        if (transcript) {
            handleVoiceAnswer(transcript);
        }
    };

    speechRecognition.onerror = (event) => {
        listeningForAnswer = false;
        recognitionActive = false;

        if (event.error === "not-allowed") {
            messageBox.textContent = "Microphone access was blocked. Please allow it once and try again.";
        } else {
            messageBox.textContent = "Microphone is unavailable right now.";
        }
    };

    speechRecognition.onend = () => {
        listeningForAnswer = false;
        recognitionActive = false;

        if (gameRunning) {
            startVoiceRecognition();
        }
    };
}

function startVoiceRecognition() {
    initSpeechRecognition();

    if (!speechRecognition) {
        messageBox.textContent = "Voice input is not supported in this browser.";
        return;
    }

    if (listeningForAnswer || recognitionActive) {
        return;
    }

    listeningForAnswer = true;
    recognitionActive = true;
    messageBox.textContent = "Microphone is on. Say the name.";

    try {
        speechRecognition.start();
    } catch (error) {
        listeningForAnswer = false;
        recognitionActive = false;
        messageBox.textContent = "Please allow microphone access and try again.";
    }
}

function showRandomImage() {
    if (!gameRunning) return;

    const availableImages = currentImages.filter((item) => {
        if (difficultySelect.value === "mixed") return true;
        return item.difficulty === difficultySelect.value;
    });

    if (availableImages.length === 0) {
        finishGame();
        return;
    }

    const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    currentImage = randomImage;
    currentImages = currentImages.filter((item) => item !== randomImage);

    gameImage.src = randomImage.image;
    turnHint.textContent = `Turn: ${currentPlayer === 1 ? player1Name.textContent : player2Name.textContent}`;
    startTimer();
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (!gameRunning) return;

        if (currentPlayer === 1) {
            player1Time -= 1;
            player1Timer.textContent = player1Time;

            if (player1Time <= 0) {
                handleTurnTimeout();
            }
        } else {
            player2Time -= 1;
            player2Timer.textContent = player2Time;

            if (player2Time <= 0) {
                handleTurnTimeout();
            }
        }
    }, 1000);
}

function handleTurnTimeout() {
    if (!gameRunning) return;

    messageBox.textContent = "Time is up! Switching turn.";
    switchTurn();
    showRandomImage();
}

function handleVoiceAnswer(transcript) {
    if (!gameRunning || !currentImage) return;

    const guess = (transcript || "").trim().toLowerCase();
    if (!guess) {
        messageBox.textContent = "I didn't catch that. Try again.";
        return;
    }

    const acceptedAnswers = currentImage.answers.map((answer) => answer.toLowerCase());
    const isCorrect = acceptedAnswers.some((answer) =>
        guess === answer || answer.includes(guess) || guess.includes(answer)
    );

    if (isCorrect) {
        if (currentPlayer === 1) {
            player1Score += 1;
        } else {
            player2Score += 1;
        }

        const activePlayerName = currentPlayer === 1 ? player1Name.textContent : player2Name.textContent;
        showFeedbackOverlay(`✅ Correct, ${activePlayerName}!`, "feedbackCorrect");
        messageBox.textContent = `✅ Correct, ${activePlayerName}!`;
        messageBox.style.color = "#2ecc71";
        messageBox.style.fontWeight = "700";
        setTimeout(() => {
            showRandomImage();
        }, 900);
    } else {
        const acceptedAnswer = currentImage.answers[0];
        showFeedbackOverlay(`❌ Wrong. ${acceptedAnswer}`, "feedbackWrong");
        messageBox.textContent = `❌ Wrong. The answer was: ${acceptedAnswer}`;
        messageBox.style.color = "#e74c3c";
        messageBox.style.fontWeight = "700";

        if (currentPlayer === 1) {
            player1Time = Math.max(0, player1Time - 5);
            player1Timer.textContent = player1Time;
        } else {
            player2Time = Math.max(0, player2Time - 5);
            player2Timer.textContent = player2Time;
        }

        switchTurn();

        setTimeout(() => {
            if (player1Time <= 0 || player2Time <= 0) {
                finishGame();
            } else {
                messageBox.style.color = "";
                messageBox.style.fontWeight = "";
                showRandomImage();
            }
        }, 1400);
    }
}

function showFeedbackOverlay(text, typeClass) {
    const overlay = document.createElement("div");
    overlay.className = `feedbackOverlay ${typeClass}`;
    overlay.textContent = text;
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.remove();
    }, 900);
}

function switchTurn() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
}

function finishGame() {
    clearInterval(timer);
    gameRunning = false;
    recognitionActive = false;
    listeningForAnswer = false;

    if (speechRecognition) {
        speechRecognition.stop();
    }

    gameScreen.classList.add("hidden");
    winnerScreen.classList.remove("hidden");

    const player1Label = player1Name.textContent.trim() || "Player 1";
    const player2Label = player2Name.textContent.trim() || "Player 2";

    let winnerText = player1Label;
    let descriptionText = `${player1Label} scored ${player1Score} points and ${player2Label} scored ${player2Score} points.`;

    if (player2Score > player1Score) {
        winnerText = player2Label;
        descriptionText = `${player2Label} scored ${player2Score} points and ${player1Label} scored ${player1Score} points.`;
    } else if (player1Score === player2Score) {
        if (player1Time > player2Time) {
            winnerText = player1Label;
        } else if (player2Time > player1Time) {
            winnerText = player2Label;
        } else {
            winnerText = "It is a draw!";
        }
    }

    winnerName.textContent = winnerText;
    winnerDescription.textContent = descriptionText;
}
