/* ==========================================
   PicDuel
   game.js
   Part 1
========================================== */

/* ---------- SCREENS ---------- */

const introScreen = document.getElementById("introScreen");
const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const winnerScreen = document.getElementById("winnerScreen");

/* ---------- BUTTONS ---------- */

const startGameButton = document.getElementById("startGameButton");
const playAgainButton = document.getElementById("playAgainButton");
const backToMenuButton = document.getElementById("backToMenuButton");

/* ---------- MENU ---------- */

const player1Input = document.getElementById("player1Input");
const player2Input = document.getElementById("player2Input");

const categorySelect = document.getElementById("categorySelect");
const difficultySelect = document.getElementById("difficultySelect");
const timeSelect = document.getElementById("timeSelect");

/* ---------- GAME ---------- */

const player1Name = document.getElementById("player1Name");
const player2Name = document.getElementById("player2Name");

const player1Timer = document.getElementById("player1Timer");
const player2Timer = document.getElementById("player2Timer");

const currentCategory = document.getElementById("currentCategory");

const gameImage = document.getElementById("gameImage");

const messageBox = document.getElementById("messageBox");

/* ---------- WINNER ---------- */

const winnerName = document.getElementById("winnerName");
const winnerDescription = document.getElementById("winnerDescription");

/* ---------- VARIABLES ---------- */

let player1Time = 60;
let player2Time = 60;

let currentPlayer = 1;

let timer = null;

let gameRunning = false;

let currentImages = [];

let currentImage = null;

/* ==========================================
   INTRO
========================================== */

window.addEventListener("load", () => {

    setTimeout(() => {

        introScreen.classList.add("hidden");

        menuScreen.classList.remove("hidden");

    }, 2500);

});

/* ==========================================
   CATEGORY MENU
========================================== */

function loadCategories() {

    categorySelect.innerHTML = "";

    for (const category in categories) {

        const option = document.createElement("option");

        option.value = category;

        option.textContent = category
            .replaceAll("-", " ")
            .replace(/\b\w/g, letter => letter.toUpperCase());

        categorySelect.appendChild(option);

    }

}

loadCategories();


/* ==========================================
   START GAME
========================================== */

startGameButton.addEventListener("click", startGame);


function startGame() {

    menuScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    player1Name.textContent =
        player1Input.value.trim() || "Παίκτης 1";

    player2Name.textContent =
        player2Input.value.trim() || "Παίκτης 2";

    player1Time = Number(timeSelect.value);

    player2Time = Number(timeSelect.value);

    player1Timer.textContent = player1Time;

    player2Timer.textContent = player2Time;

    currentPlayer = 1;

    gameRunning = true;

    messageBox.textContent = "Πες αυτό που βλέπεις!";

    currentCategory.textContent =
        categorySelect.options[categorySelect.selectedIndex].text;

    currentImages = [...categories[categorySelect.value]];

    showRandomImage();

    startTimer();

}


/* ==========================================
   SHOW RANDOM IMAGE
========================================== */

function showRandomImage() {

    if (currentImages.length === 0) {

        finishGame();

        return;

    }

    const filteredImages = currentImages.filter(item => {

        if (difficultySelect.value === "mixed") {

            return true;

        }

        return item.difficulty === difficultySelect.value;

    });

    if (filteredImages.length === 0) {

        finishGame();

        return;

    }

    const randomImage =
        filteredImages[Math.floor(Math.random() * filteredImages.length)];

    currentImage = randomImage;

    gameImage.src = randomImage.image;

}
