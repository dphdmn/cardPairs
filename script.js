document.body.style.overflow = "hidden";
const cardValues8 = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const cardValues12 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I"];
var cardValues = cardValues8;
var totalPairs = 8;
var cardsBlocked = true;
var expectedUnlock = 0;
let cards = [];

const harderButton = document.getElementById("harder-button");

harderButton.addEventListener("click", () => {
    if (totalPairs === 8){
        cardValues = cardValues12;
        totalPairs = 12;
        resetGame();
        logResult("mode12");
        const gameContainer = document.querySelector(".game-container");
        gameContainer.style.gridTemplateColumns = 'repeat(6, 1fr)';
        createCardElements();
        harderButton.innerHTML = "Easier";
    } else{
        cardValues = cardValues8;
        totalPairs = 8;
        resetGame();
        logResult("mode8");
        const gameContainer = document.querySelector(".game-container");
        gameContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
        createCardElements();
        harderButton.innerHTML = "Harder";
    }
});

var eng = Random.MersenneTwister19937.autoSeed();
var myrandom = new Random.Random(eng);
const generateCardPairs = () => {
    const selectedPairs = [];
    while (selectedPairs.length < totalPairs) {
        const randomIndex = myrandom.integer(0, cardValues.length - 1);
        const selectedValue = cardValues[randomIndex];
        if (selectedPairs.indexOf(selectedValue) === -1) {
            selectedPairs.push(selectedValue);
        }
    }
    const cardPairs = [...selectedPairs, ...selectedPairs];
    return shuffleArray(cardPairs);
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = myrandom.integer(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const createCardElements = () => {
    cardsBlocked = false;
    expectedUnlock = 0;
    const gameContainer = document.querySelector(".game-container");

    cards = generateCardPairs();

    cards.forEach((value, index) => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.dataset.value = value;
        cardElement.dataset.index = index;

        const frontElement = document.createElement("div");
        frontElement.classList.add("front");
        frontElement.textContent = "";

        const backElement = document.createElement("div");
        backElement.classList.add("back");
        backElement.textContent = value;

        cardElement.appendChild(frontElement);
        cardElement.appendChild(backElement);

        // Add the event listener for card clicks
        cardElement.addEventListener("click", handleCardClick);

        gameContainer.appendChild(cardElement);
    });
};

let firstCard = null;
let secondCard = null;
let canClick = false;
let startTime = null;
let timerInterval;

const timerElement = document.getElementById("timer");
const newGameButton = document.getElementById("new-game-button");

const logButton = document.getElementById("copy-log");
const startTimer = () => {
    startTime = new Date().getTime();
    timerInterval = setInterval(updateTimer, 10);
};

const stopTimer = () => {
    clearInterval(timerInterval);
};

const updateTimer = () => {
    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - startTime)/1000; 

    if (cardsBlocked && elapsedTime > expectedUnlock){
        unlock();
    }
    timerElement.textContent = elapsedTime.toFixed(2);
};

const resultsContainer = document.querySelector(".results");
let results = [];

function copyArrayToClipboard(results) {
    const textToCopy = results.join(', ');
    navigator.clipboard.writeText(textToCopy).then(function() {
        // Create the floating message
        const floatingMessage = document.createElement('div');
        floatingMessage.className = 'floating-message';
        floatingMessage.textContent = 'Stats copied to clipboard!';
        document.body.appendChild(floatingMessage);

        // Display the message
        floatingMessage.style.display = 'block';

        // Start a timer to fade out the message after a delay (e.g., 3 seconds)
        setTimeout(function() {
            floatingMessage.style.opacity = '0';
        }, 500);

        // Remove the message after the transition completes
        setTimeout(function() {
            document.body.removeChild(floatingMessage);
        }, 1500); // Wait for the 1.5s transition plus an additional 3s delay
    }).catch(function(err) {
        console.error('Unable to copy to clipboard: ', err);
    });
}


logButton.addEventListener("click", () => {
    copyArrayToClipboard(results);
});
function resetGame(){
    const gameContainer = document.querySelector(".game-container");
    // Remove all current cards
    while (gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild);
    }

    // Reset variables
    stopTimer();
    timerElement.textContent = "READY";
    firstCard = null;
    secondCard = null;
    canClick = false;
}


newGameButton.addEventListener("click", () => {
    if (!(document.querySelectorAll(".card.opened").length === totalPairs * 2)) {
        if (results.length > 0) {
            if (results[results.length - 1] !== "reset") {
                logResult("reset");
            }
        }
    }
    resetGame();
    // Create new card elements
    createCardElements();


});

const logResult = (result) => {
    results.push(result);
    updateResults();
};

const updateResults = () => {
    console.log(results);
};

const handleCardClick = (event) => {
    if (!canClick) {
        if (timerElement.textContent === "READY") {
            startTimer();
            canClick = true;
            timerElement.textContent = "0.0";
        } else {
            return;
        }
    }

    const cardElement = event.currentTarget; // Use event.currentTarget instead of event.target

    if (!cardElement.classList.contains("card")) return; // Check if the clicked element has the "card" class
    play('flip');
    if (!firstCard) {
        firstCard = cardElement;
        cardElement.classList.add("opened");
    } else if (!secondCard && cardElement !== firstCard) {
        secondCard = cardElement;

        cardElement.classList.add("opened");

        if (firstCard.dataset.value === secondCard.dataset.value) {
            play('bell')
            firstCard.querySelectorAll('div').forEach(child => child.style.backgroundColor = '#2ecc71');
            secondCard.querySelectorAll('div').forEach(child => child.style.backgroundColor = '#2ecc71');
            firstCard.removeEventListener("click", handleCardClick);
            secondCard.removeEventListener("click", handleCardClick);
            firstCard = null;
            secondCard = null;

            // Check if all pairs are opened
            if (document.querySelectorAll(".card.opened").length === totalPairs * 2) {
                stopTimer();
                play('win');
                canClick = false;
                const elapsedTime = timerElement.textContent;
                logResult(`${elapsedTime}`);
            }
        } else {
            canClick = false;
            cardsBlocked = true;
            expectedUnlock = parseFloat(timerElement.textContent) + 0.6;
        }
    }
};

function unlock(){
    if (firstCard !== null && secondCard !== null) {
        firstCard.classList.remove("opened");
        secondCard.classList.remove("opened");
        firstCard = null;
        secondCard = null;
        expectedUnlock = 0;
        canClick = true;
    }
}
createCardElements();

// Define a mapping of sound names to file paths
const soundMap = {
    flip: 'sounds/flip.mp3',
    bell: 'sounds/bell.wav',
    win: 'sounds/win.mp3',
};

// Create audio elements for each sound and add them to the document
const audioElements = {};
for (const soundName in soundMap) {
    const audio = new Audio(soundMap[soundName]);
    audioElements[soundName] = audio;
    document.body.appendChild(audio); // Add audio elements to the document (you can add them to any container)
}

// Function to play a sound by name
function play(soundName) {
    const audio = audioElements[soundName];
    if (audio) {
        audio.currentTime = 0; // Rewind the sound to the beginning (in case it's already playing)
        audio.play();
    }
}
logResult("mode8");