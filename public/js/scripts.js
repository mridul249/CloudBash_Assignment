// public/js/scripts.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("wordForm");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const submitButton = form.querySelector('button[type="submit"]');

  loadingSpinner.style.display = "none";

  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      loadingSpinner.style.display = "block";
      submitButton.disabled = true;
      submitButton.textContent = "Processing...";
    }

    form.classList.add("was-validated");
  });

  // Pagination link click handler
  const paginationLinks = document.querySelectorAll(".pagination .page-link");
  paginationLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault(); 
      loadingSpinner.style.display = "block";
      window.location.href = this.href;
    });
  });
});
