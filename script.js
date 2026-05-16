const numberDisplay = document.getElementById("numberDisplay");
const toggleBtn = document.getElementById("toggleBtn");

const modal = document.getElementById("modal");
const finalNumber = document.getElementById("finalNumber");
const closeModalBtn = document.getElementById("closeModalBtn");

let isRunning = false;
let generatorInterval = null;
let currentNumber = 0;

function generateNumber() {
  currentNumber = Math.floor(Math.random() * 100) + 1;
  numberDisplay.textContent = currentNumber;
}

toggleBtn.addEventListener("click", function () {
  if (!isRunning) {
    // Start generating
    isRunning = true;
    toggleBtn.textContent = "Stop";
    toggleBtn.classList.add("stop");

    generatorInterval = setInterval(generateNumber, 100);
  } else {
    // Stop generating
    isRunning = false;
    toggleBtn.textContent = "Start";
    toggleBtn.classList.remove("stop");

    clearInterval(generatorInterval);

    finalNumber.textContent = currentNumber;
    modal.classList.add("show");
  }
});

closeModalBtn.addEventListener("click", function () {
  modal.classList.remove("show");
});