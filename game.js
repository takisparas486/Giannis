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

/* ---------- WINNER ---------- */

const winnerName = document.getElementById("winnerName");
const winnerDescription = document.getElementById("winnerDescription");
const continueButton = document.getElementById("continueButton");
const statisticsScreen = document.getElementById("statisticsScreen");

const statisticsPlayAgainButton =
    document.getElementById("statisticsPlayAgainButton");

const statisticsMenuButton =
    document.getElementById("statisticsMenuButton");

/* ---------- VARIABLES ---------- */

let player1Time = 60;
let player2Time = 60;

let currentPlayer = 1;

let timer = null;

let gameRunning = false;

let speechRecognition = null;

let currentImage = null;

let currentImages = [];

let waitingAfterPass = false;

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

window.addEventListener("load", () => {

    introScreen.classList.add("show");

    setTimeout(() => {

        introScreen.classList.add("hide");

        setTimeout(() => {

            introScreen.style.display = "none";

            menuScreen.classList.add("show");

        }, 800);

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

continueButton.addEventListener("click", () => {

    winnerScreen.classList.remove("show");

    statisticsScreen.classList.add("show");

});


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


    menuScreen.classList.remove("show");

    gameScreen.classList.add("show");


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

    setTimeout(() => {

        gameImage.src = currentImage.image;

        gameImage.classList.remove("imageHidden");

        gameImage.classList.add("imageVisible");

    }, 250);

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

        if(waitingAfterPass) return;

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

}

/*=========================================
            PART 5
        VOICE RECOGNITION
=========================================*/

/* ---------- SPEECH ---------- */

function startSpeechRecognition(){

    if(
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
    ){

        alert("Η συσκευή δεν υποστηρίζει Speech Recognition.");

        return;

    }

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognition();

    speechRecognition.lang = "el-GR";

    speechRecognition.continuous = true;

    speechRecognition.interimResults = false;

    speechRecognition.onresult = handleSpeechResult;

    speechRecognition.onerror = () => {};

    speechRecognition.onend = () => {

        if(gameRunning){

            speechRecognition.start();

        }

    };

    speechRecognition.start();

}

/* ---------- RESULT ---------- */

function handleSpeechResult(event){

    if(waitingAfterPass) return;

    const spokenText = event.results[
        event.results.length - 1
    ][0].transcript
    .trim()
    .toLowerCase();

    if(
        spokenText === "πάσο" ||
        spokenText === "πασο" ||
        spokenText === "pass"
    ){

        handlePass();

        return;

    }

    checkAnswer(spokenText);

}

/*=========================================
            PART 6
        ANSWER CHECK
=========================================*/

function checkAnswer(spokenText){

    if(!currentImage) return;

    let answers = [];

if(currentImage.answer){

    answers = [currentImage.answer];

}

else if(currentImage.answers){

    answers = currentImage.answers;

}

answers = answers.map(answer =>

    answer.trim().toLowerCase()

);

spokenText = spokenText.trim().toLowerCase();

if(answers.includes(spokenText)){

        playSound("correct");

        messageBox.textContent = "✔ Σωστό!";

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

}

/*=========================================
            PART 7
            PASS
=========================================*/

function handlePass(){

    if(waitingAfterPass) return;

    waitingAfterPass = true;

    playSound("pass");

    messageBox.textContent = "ΠΑΣΟ";

    if(currentPlayer === 1){

        player1Stats.pass++;

        player1Stats.streak = 0;

    }

    else{

        player2Stats.pass++;

        player2Stats.streak = 0;

    }

    answerCaption.textContent = currentImage.answer;

    answerCaption.classList.add("show");

    const iceOverlay = document.getElementById("iceOverlay");

    if(iceOverlay){

        iceOverlay.classList.add("show");

    }

    setTimeout(() => {

        answerCaption.classList.remove("show");

        if(iceOverlay){

            iceOverlay.classList.remove("show");

        }

        waitingAfterPass = false;

        switchPlayer();

        loadNextImage();

    },3000);

}

/*=========================================
            PART 8
        SOUNDS & FINISH
=========================================*/

/* ---------- SOUNDS ---------- */

const sounds = {

    intro: new Audio("sounds/intro.mp3"),

    menu: new Audio("sounds/menu.mp3"),

    tick: new Audio("sounds/tick.mp3"),

    correct: new Audio("sounds/correct.mp3"),

    wrong: new Audio("sounds/wrong.mp3"),

    pass: new Audio("sounds/pass.mp3"),

    timeout: new Audio("sounds/timeout.mp3"),

    victory: new Audio("sounds/victory.mp3")

};

function playSound(sound){

    if(!sounds[sound]) return;

    sounds[sound].currentTime = 0;

    sounds[sound].play();

}

/* ---------- FINISH ---------- */

function finishGame(winnerPlayer){

    gameRunning = false;

    clearInterval(timer);

    if(speechRecognition){

        speechRecognition.stop();

    }

    gameScreen.classList.remove("show");

    winnerScreen.classList.add("show");

    const winner =

        winnerPlayer === 1 ?

        player1Input.value :

        player2Input.value;

    winnerName.textContent = winner;

    winnerDescription.textContent =

        "🏆 Νικητής του Pic Duel";

    playSound("victory");

}

function finishGame(winnerPlayer){

    gameRunning = false;

    ...

    playSound("victory");

}

/* ---------- OPEN STATISTICS ---------- */

function openStatistics(){

    winnerScreen.classList.remove("show");

    statisticsScreen.classList.add("show");

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
        player1Time;

    document.getElementById("player2Correct").textContent =
        player2Stats.correct;

    document.getElementById("player2Wrong").textContent =
        player2Stats.wrong;

    document.getElementById("player2Pass").textContent =
        player2Stats.pass;

    document.getElementById("player2BestStreak").textContent =
        player2Stats.bestStreak;

    document.getElementById("player2TimeLeft").textContent =
        player2Time;

    const player1Total =
        player1Stats.correct + player1Stats.wrong;

    const player2Total =
        player2Stats.correct + player2Stats.wrong;

    document.getElementById("player1Accuracy").textContent =
        player1Total === 0
        ? "0%"
        : Math.round(player1Stats.correct / player1Total * 100) + "%";

    document.getElementById("player2Accuracy").textContent =
        player2Total === 0
        ? "0%"
        : Math.round(player2Stats.correct / player2Total * 100) + "%";

}


/*=========================================
        SCREEN NAVIGATION
=========================================*/

function openStatistics(){

    winnerScreen.classList.remove("show");

    statisticsScreen.classList.add("show");

    fillStatistics();

}

function playAgain(){

    location.reload();

}

function backToMenu(){

    statisticsScreen.classList.remove("show");

    menuScreen.classList.add("show");

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

