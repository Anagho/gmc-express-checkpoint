// Target UI elements
const nextOpenTimeElement = document.getElementById("nextOpenTime");
const countdownElement = document.getElementById("countdown");
const overlayElement = document.getElementById("overlay");
const checkBackText = document.getElementById("checkBackText");
const statusMessage = document.getElementById("statusMessage");
const homeLink = document.getElementById("homeLink");

// Function to fetch working hours from the server
async function fetchWorkingHours() {
  try {
    const response = await fetch("http://localhost:3000/api/hours");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    // Start countdown timer if there is a next open time
    if (data.nextOpenTime) {
      startCountdown(data.nextOpenTime);
      nextOpenTimeElement.textContent = `Opening at: ${new Date(
        data.nextOpenTime
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      statusMessage.textContent = "⌚ We're currently open!";
      nextOpenTimeElement.style.display = "none";
      overlayElement.style.backgroundImage = "url('images/open.jpg')";
      checkBackText.textContent = "hello click the button below to go to site";
      homeLink.textContent = "Go to Site";

      // Show redirection message and redirect to homepage
      countdownElement.textContent = "Redirecting to homepage...";

      // Redirect to the home page after 5 seconds
    //   redirectWithCountdown(5, "/");
    }
  } catch (error) {
    console.error("Error fetching working hours:", error);
    // countdownElement.textContent = "Error fetching countdown.";
  }
}

// Function to start countdown timer
function startCountdown(nextOpenTime) {
  const openTime = new Date(nextOpenTime).getTime();

  // Update countdown every second
  const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const timeRemaining = openTime - now;

    if (timeRemaining < 0) {
      clearInterval(countdownInterval); // Clear interval if countdown is complete
      statusMessage.textContent = "We're now open!";
      overlayElement.style.backgroundImage = "url('images/open.jpg')";
      checkBackText.style.display = "none";

      // Redirect to the home page after 5 seconds
      redirectWithCountdown(5, "/");

      return;
    }

    // Calculate time components
    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Display the countdown
    countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
    countdownElement.style.fontSize = "2.25rem";
  }, 1000);
}

// function to handle redirection with countdown
function redirectWithCountdown(seconds, redirectUrl) {
  let timeLeft = seconds;

  // Display initial countdown
  countdownElement.textContent = `Redirecting in ${timeLeft} seconds...`;

  // Update countdown every second
  const countdownInterval = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 0) {
      clearInterval(countdownInterval); // Clear the interval when countdown is complete
      window.location.href = redirectUrl; // Redirect to the specified URL
      countdownElement.textContent = `Redirecting in ${timeLeft} seconds...`; // Update countdown text
    } else {
      countdownElement.textContent = `Redirecting in ${timeLeft} seconds...`; // Update countdown text
    }
  }, 1000);
}

// Call the function to fetch working hours
fetchWorkingHours();
