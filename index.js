import express from "express";
import moment from "moment";
import fs from "fs";

moment().format();
const app = express();
const PORT = 3000;

app.use(express.json());

// Define working hours (Monday to Friday, 9 AM - 5 PM)
const WORKING_DAYS = [1, 2, 3, 4, 5];
const START_HOUR = 9; // 9 AM
const END_HOUR = 17; // 5 PM

// Middleware to check if the request is within working hours
const checkWorkingHours = (req, res, next) => {
  const now = moment();
  const currentDay = now.isoWeekday();
  const currentHour = now.hour();

  console.log(`Current time: ${now.format("LLLL")}`); // Log the current time
  console.log(`Day: ${currentDay}, Hour: ${currentHour}`); // Log day and hour

  const isWithinWorkingHours =
    WORKING_DAYS.includes(currentDay) &&
    currentHour >= START_HOUR &&
    currentHour < END_HOUR;

  if (isWithinWorkingHours) {
    next(); // Proceed if within working hours
  } else {
    console.log("Redirecting to /closed: We are currently closed."); // Log redirect
    res.redirect("/closed"); // Redirect to closed page
  }
};

// Middleware to apply working hours check, excluding the closed page
app.use((req, res, next) => {
  if (["/", "/services", "/contact"].includes(req.path)) {
    checkWorkingHours(req, res, next);
  } else {
    next();
  }
});

// Serve static files
app.use(express.static("public"));

// Utility function to read and send HTML files
const serveHtmlFile = (res, filePath) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error(err); // Log the error
      return res.status(500).send("<h1>Server error</h1><p>Try again.</p>");
    }
    res.status(200).send(data); // Send the HTML file content
  });
};

// Routes for Home, Our Services, and Contact Us pages
app.get("/", (req, res) => {
  console.log("Serving index.html");
  serveHtmlFile(res, "public/index.html");
});

app.get("/test", (req, res) => {
  console.log("Serving index.html");
  serveHtmlFile(res, "public/test.html");
});

app.get("/services", (req, res) => {
  console.log("Serving services.html");
  serveHtmlFile(res, "public/services.html");
});

app.get("/contact", (req, res) => {
  console.log("Serving contact.html");
  serveHtmlFile(res, "public/contact.html");
});

// Closed page route
app.get("/closed", (req, res) => {
  console.log("Serving closed.html");
  serveHtmlFile(res, "public/closed.html");
});

// Endpoint to fetch working hours and the next opening time
app.get("/api/hours", (req, res) => {
  const now = moment();
  const currentDay = now.isoWeekday();
  const currentHour = now.hour();

  let nextOpenTime;

  // Determine if we are currently closed
  if (
    WORKING_DAYS.includes(currentDay) &&
    currentHour >= START_HOUR &&
    currentHour < END_HOUR
  ) {
    nextOpenTime = null; // Currently open
  } else {
    // Calculate the next open time
    if (currentDay === 5 && currentHour >= END_HOUR) {
      // If it's Friday after hours, next open is Monday 9 AM
      nextOpenTime = moment()
        .isoWeekday(1)
        .hour(START_HOUR)
        .minute(0)
        .second(0)
        .toISOString();
    } else if (currentDay === 6) {
      // If it's Saturday, next open is Monday 9 AM
      nextOpenTime = moment()
        .isoWeekday(1)
        .hour(START_HOUR)
        .minute(0)
        .second(0)
        .toISOString();
    } else if (currentDay === 7 || currentHour >= END_HOUR) {
      // If it's Sunday or after working hours on a weekday, next open is the next day at 9 AM
      nextOpenTime = moment()
        .add(1, "days")
        .isoWeekday(currentDay + 1)
        .hour(START_HOUR)
        .minute(0)
        .second(0)
        .toISOString();
    } else if (currentHour < START_HOUR) {
      // If it's a working day but before working hours
      nextOpenTime = moment()
        .hour(START_HOUR)
        .minute(0)
        .second(0)
        .toISOString();
    }
  }

  res.json({ nextOpenTime });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
