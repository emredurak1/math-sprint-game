'use strict';

import shuffle from './shuffle.js';

// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
const wrongButton = document.querySelector('.wrong');
const rightButton = document.querySelector('.right');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';

// Scroll
let valueY = 0;

// Refresh Splash Page Best Scores
const bestScoresToDOM = function () {
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
  });
};

// Check Local Storage for Best Scores, Set bestScoreArray
const getSavedBestScores = function () {
  if (localStorage.getItem('bestScores')) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
};

// Update Best Score Array
const updateBestScore = function () {
  bestScoreArray.forEach((score, index) => {
    // Select correct Best Score to update
    if (questionAmount == score.questions) {
      // Return Best Score as number with one decimal
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      // Update if the new final score is less or replacing zero
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  // Update Splash Page
  bestScoresToDOM();
  // Save to Local Storage
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
};

const playAgain = function () {
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
};

const showScorePage = function () {
  setTimeout(() => (playAgainBtn.hidden = false), 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
};

const scoresToDOM = function () {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  itemContainer.scrollTo({ top: 0, behavior: 'instant' });
  showScorePage();
};

// Stop Timer, Process Results, go to Score Page
const checkTime = function () {
  if (playerGuessArray.length == questionAmount) {
    clearInterval(timer);
    equationsArray.forEach((el, i) => {
      if (el.evaluated === playerGuessArray[i]) return;
      else {
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    scoresToDOM();
  }
};

// Add a tenth of a second to timePlayed
const addTime = function () {
  timePlayed += 0.1;
  checkTime();
};

const startTimer = function () {
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer);
};

// Scroll, Stroe user selection in PlayerGuessArray
const select = function (guessedTrue) {
  // Scroll 80 pixels
  valueY += 80;
  itemContainer.scroll({
    top: valueY,
    left: 0,
    behavior: 'smooth',
  });
  return guessedTrue
    ? playerGuessArray.push('true')
    : playerGuessArray.push('false');
};

// Get Random Number up to a max number

const showGamePage = function () {
  gamePage.hidden = false;
  countdownPage.hidden = true;
};

const getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// Add Equations to DOM
const equationsToDOM = function () {
  equationsArray.forEach((equation, index) => {
    const html = `<div class="item"><h1>${equation.value}</h1></div>`;
    itemContainer.insertAdjacentHTML('beforeend', html);
  });
};

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

const getRadioValue = function () {
  let radioValue;
  radioInputs.forEach(radioInput => {
    if (radioInput.checked) radioValue = radioInput.value;
  });
  return radioValue;
};

const countdownStart = function () {
  let count = 3;
  countdown.textContent = count;
  const timeCountDown = setInterval(() => {
    count--;
    if (count === 0) countdown.textContent = 'Go!';
    else if (count === -1) {
      showGamePage();
      clearInterval(timeCountDown);
    } else {
      countdown.textContent = count;
    }
  }, 1000);
};

const showCountdown = function () {
  splashPage.hidden = true;
  countdownPage.hidden = false;
  populateGamePage();
  countdownStart();
};

const selectQuestionAmount = function (e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  if (questionAmount) showCountdown();
};

startForm.addEventListener('click', () => {
  radioContainers.forEach(radioEl => {
    radioEl.classList.remove('selected-label');
    radioEl.classList.add(
      `${radioEl.children[1].checked ? 'selected-label' : null}`
    );
  });
});

startForm.addEventListener('submit', selectQuestionAmount);
wrongButton.addEventListener('click', select.bind(null, false));
rightButton.addEventListener('click', select.bind(null, true));
playAgainBtn.addEventListener('click', playAgain);
gamePage.addEventListener('click', startTimer);

getSavedBestScores();
