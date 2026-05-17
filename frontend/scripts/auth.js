import * as config from "./config.js";

const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const authForm = document.getElementById("authForm");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const submitBtn = document.getElementById("submitBtn");
const toggleQuestion = document.getElementById("toggleQuestion");
const toggleModeBtn = document.getElementById("toggleModeBtn");

const toast = document.getElementById("toast");

const confirmModal = document.getElementById("confirmModal");
const modalTitle = document.getElementById("modalTitle");
const confirmUsername = document.getElementById("confirmUsername");
const confirmPassword = document.getElementById("confirmPassword");
const cancelConfirmBtn = document.getElementById("cancelConfirmBtn");
const confirmBtn = document.getElementById("confirmBtn");

let mode = "login";
let pendingCredentials = null;
let toastTimer = null;

function showToast(message, type = "error") {
  clearTimeout(toastTimer);

  toast.textContent = message;
  toast.classList.add("show");

  if (type === "success") {
    toast.classList.add("success");
  } else {
    toast.classList.remove("success");
  }

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function setMode(newMode) {
  mode = newMode;

  usernameInput.value = "";
  passwordInput.value = "";
  pendingCredentials = null;

  if (mode === "login") {
    formTitle.textContent = "Login";
    formSubtitle.textContent = "Welcome back. Enter your credentials.";
    submitBtn.textContent = "Login";
    toggleQuestion.textContent = "No account yet?";
    toggleModeBtn.textContent = "Register";
  } else {
    formTitle.textContent = "Register";
    formSubtitle.textContent = "Create your account.";
    submitBtn.textContent = "Register";
    toggleQuestion.textContent = "Already have an account?";
    toggleModeBtn.textContent = "Login";
  }
}

function validateInputs(username, password) {
  if (username.length < 3 || username.length > 8) {
    return "Username must be 3 to 8 characters only.";
  }

  const passwordPattern = /^[A-Za-z0-9]{8}$/;

  if (!passwordPattern.test(password)) {
    return "Password must be exactly 8 alphanumeric characters.";
  }

  return null;
}

function openConfirmModal(username, password) {
  pendingCredentials = {
    username,
    password
  };

  modalTitle.textContent = "Confirm Registration";
  confirmUsername.textContent = username;

  // Masked for safety
  confirmPassword.textContent = password;

  confirmBtn.textContent = "Confirm Register";
  confirmModal.classList.add("show");
}

function closeConfirmModal() {
  confirmModal.classList.remove("show");
  pendingCredentials = null;
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  toggleModeBtn.disabled = isLoading;
  confirmBtn.disabled = isLoading;
  cancelConfirmBtn.disabled = isLoading;

  if (isLoading) {
    if (mode === "login") {
      submitBtn.textContent = "Logging in...";
    } else {
      confirmBtn.textContent = "Registering...";
    }
  } else {
    submitBtn.textContent = mode === "login" ? "Login" : "Register";
    confirmBtn.textContent = "Confirm Register";
  }
}

async function sendAuthRequest() {
  if (!pendingCredentials) return;

  setLoading(true);

  const endpoint = mode === "login" ? "/login" : "/register";

  try {
    const response = await fetch(config.API_BASE + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pendingCredentials)
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || "Something went wrong.");
      setLoading(false);
      return;
    }

    if (mode === "register") {
      closeConfirmModal();
      setLoading(false);
      showToast("Registration successful. You can now login.", "success");
      setMode("login");
      return;
    }

    localStorage.setItem("loggedUser", JSON.stringify(data.user));
    window.location.href = config.dashboard;

  } catch (error) {
    console.error(error);
    showToast("Cannot connect to Python server.");
    setLoading(false);
  }
}

toggleModeBtn.addEventListener("click", function () {
  setMode(mode === "login" ? "register" : "login");
});

authForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  const error = validateInputs(username, password);

  if (error) {
    showToast(error);
    return;
  }

  pendingCredentials = {
    username,
    password
  };

  if (mode === "login") {
    // Login directly, no confirmation modal
    sendAuthRequest();
  } else {
    // Register still uses confirmation modal
    openConfirmModal(username, password);
  }
});

cancelConfirmBtn.addEventListener("click", function () {
  closeConfirmModal();
});

confirmBtn.addEventListener("click", function () {
  sendAuthRequest();
});