
document.getElementById("year").textContent =
  new Date().getFullYear();

const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");
const button = document.getElementById("submitBtn");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  status.textContent = "";
  button.disabled = true;
  button.textContent = "Sending...";

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Something went wrong.");
    }

    status.textContent = result.message;
    form.reset();

  } catch (error) {
    status.textContent =
      error.message || "Unable to connect to the server.";
  } finally {
    button.disabled = false;
    button.textContent = "Send Message ↗";
  }
});
