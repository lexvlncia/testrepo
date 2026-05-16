const numberDisplay = document.getElementById("numberDisplay");
const toggleBtn = document.getElementById("toggleBtn");

const modal = document.getElementById("modal");
const finalNumber = document.getElementById("finalNumber");
const closeModalBtn = document.getElementById("closeModalBtn");

// Python Flask server endpoint
const pyserver = "http://127.0.0.1:5000/random";

let isRunning = false;
let generatorInterval = null;
let currentNumber = 0;

async function getRandomNumberFromPython() {
  try {
    const response = await fetch(pyserver);

    if (!response.ok) {
      throw new Error("Python server response error");
    }

    const data = await response.json();
    return data.number;
  } catch (error) {
    console.error("Failed to get number from Python:", error);
    return null;
  }
}

async function generateNumber() {
  const number = await getRandomNumberFromPython();

  if (number !== null) {
    currentNumber = number;
    numberDisplay.textContent = currentNumber;
  } else {
    numberDisplay.textContent = "ERR";
  }
}

toggleBtn.addEventListener("click", function () {
  if (!isRunning) {
    // Start generating
    isRunning = true;

    toggleBtn.textContent = "Stop";
    toggleBtn.classList.add("stop");

    // Generate immediately once
    generateNumber();

    // Then keep generating every 300ms
    generatorInterval = setInterval(generateNumber, 300);
  } else {
    // Stop generating
    isRunning = false;

    toggleBtn.textContent = "Start";
    toggleBtn.classList.remove("stop");

    clearInterval(generatorInterval);
    generatorInterval = null;

    finalNumber.textContent = currentNumber;
    modal.classList.add("show");
  }
});

closeModalBtn.addEventListener("click", function () {
  modal.classList.remove("show");
});