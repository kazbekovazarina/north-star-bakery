const STORAGE_KEYS = {
  favorites: "northStarBakeryFavorites",
  formDraft: "northStarBakeryFormDraft"
};

const productCatalog = [
  { category: "Breads", items: [
    { id: "country-sourdough", name: "Country Sourdough", price: "$7-$9" },
    { id: "honey-wheat", name: "Honey Wheat", price: "$6-$8" },
    { id: "rosemary-focaccia", name: "Rosemary Focaccia", price: "$8-$12" }
  ]},
  { category: "Pastries", items: [
    { id: "butter-croissants", name: "Butter Croissants", price: "$4-$6" },
    { id: "seasonal-danishes", name: "Seasonal Danishes", price: "$5-$7" },
    { id: "morning-scones", name: "Morning Scones", price: "$4-$5" }
  ]},
  { category: "Cakes", items: [
    { id: "everyday-cakes", name: "Everyday Cakes", price: "$32-$45" },
    { id: "celebration-cakes", name: "Celebration Cakes", price: "$55-$120" },
    { id: "event-cakes", name: "Event Cakes", price: "Consultation required" }
  ]}
];

const validationMessages = {
  nameRequired: "Please enter your full name.",
  nameLength: "Name must contain at least 2 characters.",
  emailRequired: "Please enter your email address.",
  emailFormat: "Please enter a valid email address, such as name@example.com.",
  phoneRequired: "Please enter a phone number when phone is your preferred contact method.",
  contactMethod: "Please choose email or phone as your preferred contact method.",
  requestType: "Please select a request type.",
  pickupDate: "Please choose a pickup date at least two business days from today.",
  detailsRequired: "Please describe the item and quantity you need.",
  detailsLength: "Please provide at least 10 characters of order details."
};

function readStoredArray(key) {
  try {
    const storedValue = JSON.parse(localStorage.getItem(key));
    return Array.isArray(storedValue) ? storedValue : [];
  } catch (error) {
    return [];
  }
}

function getAllProducts() {
  return productCatalog.flatMap((group) => group.items);
}

function getFavoriteProducts() {
  const favoriteIds = readStoredArray(STORAGE_KEYS.favorites);
  return getAllProducts().filter((product) => favoriteIds.includes(product.id));
}

function saveFavorites(favoriteIds) {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favoriteIds));
}

function renderProducts() {
  const productList = document.querySelector("#product-list");
  if (!productList) return;

  const favoriteIds = readStoredArray(STORAGE_KEYS.favorites);
  productList.innerHTML = productCatalog.map((group) => `
    <article class="card product-card">
      <h3>${group.category}</h3>
      <ul>
        ${group.items.map((product) => {
          const isFavorite = favoriteIds.includes(product.id);
          return `<li><span><strong>${product.name}</strong><br>${product.price}</span>
            <button type="button" data-product-id="${product.id}" aria-pressed="${isFavorite}">
              ${isFavorite ? "Saved" : "Save"}
            </button></li>`;
        }).join("")}
      </ul>
    </article>`).join("");
}

function renderFavorites(message = "") {
  const list = document.querySelector("#favorites-list");
  if (!list) return;

  const favorites = getFavoriteProducts();
  const count = document.querySelector("#favorite-count");
  const status = document.querySelector("#favorites-status");
  const clearButton = document.querySelector("#clear-favorites");
  const preorderLink = document.querySelector("#preorder-favorites");

  count.textContent = favorites.length;
  list.innerHTML = favorites.map((product) => `<li>${product.name}</li>`).join("");
  status.textContent = message || (favorites.length
    ? `${favorites.length} favorite${favorites.length === 1 ? " is" : "s are"} saved for your next visit.`
    : "No favorites saved yet. Choose an item above to get started.");
  clearButton.disabled = favorites.length === 0;
  preorderLink.hidden = favorites.length === 0;
}

function toggleFavorite(productId) {
  const favoriteIds = readStoredArray(STORAGE_KEYS.favorites);
  const product = getAllProducts().find((item) => item.id === productId);
  const isSaved = favoriteIds.includes(productId);
  const updatedFavorites = isSaved
    ? favoriteIds.filter((id) => id !== productId)
    : [...favoriteIds, productId];

  saveFavorites(updatedFavorites);
  renderProducts();
  renderFavorites(product ? `${product.name} was ${isSaved ? "removed from" : "added to"} your favorites.` : "Favorites updated.");
}

function initializeFavoritesFeature() {
  const productList = document.querySelector("#product-list");
  if (!productList) return;

  renderProducts();
  renderFavorites();

  productList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-product-id]");
    if (button) toggleFavorite(button.dataset.productId);
  });

  document.querySelector("#clear-favorites").addEventListener("click", () => {
    saveFavorites([]);
    renderProducts();
    renderFavorites("Your favorites list was cleared.");
  });
}

function getMinimumPickupDate() {
  const date = new Date();
  let businessDays = 0;
  while (businessDays < 2) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) businessDays += 1;
  }
  return date.toISOString().split("T")[0];
}

function showFieldError(field, message) {
  const error = document.querySelector(`#${field.id}-error`);
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) error.textContent = message;
  return message === "";
}

function validateForm(form) {
  const name = form.elements["customer-name"];
  const email = form.elements["customer-email"];
  const phone = form.elements["customer-phone"];
  const contactMethod = form.querySelector('input[name="contact-method"]:checked');
  const requestType = form.elements["request-type"];
  const pickupDate = form.elements["pickup-date"];
  const details = form.elements["item-details"];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const checks = [
    showFieldError(name, !name.value.trim() ? validationMessages.nameRequired : name.value.trim().length < 2 ? validationMessages.nameLength : ""),
    showFieldError(email, !email.value.trim() ? validationMessages.emailRequired : !emailPattern.test(email.value.trim()) ? validationMessages.emailFormat : ""),
    showFieldError(phone, contactMethod?.value === "phone" && !phone.value.trim() ? validationMessages.phoneRequired : ""),
    showFieldError(requestType, requestType.value ? "" : validationMessages.requestType),
    showFieldError(pickupDate, pickupDate.value && pickupDate.value >= getMinimumPickupDate() ? "" : validationMessages.pickupDate),
    showFieldError(details, !details.value.trim() ? validationMessages.detailsRequired : details.value.trim().length < 10 ? validationMessages.detailsLength : "")
  ];

  document.querySelector("#contact-method-error").textContent = contactMethod ? "" : validationMessages.contactMethod;
  if (!contactMethod) checks.push(false);
  return checks.every(Boolean);
}

function saveFormDraft(form) {
  const draft = {
    name: form.elements["customer-name"].value,
    email: form.elements["customer-email"].value,
    phone: form.elements["customer-phone"].value,
    contactMethod: form.querySelector('input[name="contact-method"]:checked')?.value || "",
    requestType: form.elements["request-type"].value,
    pickupDate: form.elements["pickup-date"].value,
    itemDetails: form.elements["item-details"].value,
    allergyNotes: form.elements["allergy-notes"].value
  };
  localStorage.setItem(STORAGE_KEYS.formDraft, JSON.stringify(draft));
}

function loadFormDraft(form) {
  let draft = {};
  try {
    draft = JSON.parse(localStorage.getItem(STORAGE_KEYS.formDraft)) || {};
  } catch (error) {
    draft = {};
  }

  form.elements["customer-name"].value = draft.name || "";
  form.elements["customer-email"].value = draft.email || "";
  form.elements["customer-phone"].value = draft.phone || "";
  form.elements["request-type"].value = draft.requestType || "";
  form.elements["pickup-date"].value = draft.pickupDate || "";
  form.elements["allergy-notes"].value = draft.allergyNotes || "";
  if (draft.contactMethod) {
    const option = form.querySelector(`input[name="contact-method"][value="${draft.contactMethod}"]`);
    if (option) option.checked = true;
  }

  const favorites = getFavoriteProducts();
  const favoriteText = favorites.length ? `Interested in: ${favorites.map((item) => item.name).join(", ")}.` : "";
  form.elements["item-details"].value = draft.itemDetails || favoriteText;
}

function initializeContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  const pickupDate = form.elements["pickup-date"];
  pickupDate.min = getMinimumPickupDate();
  loadFormDraft(form);
  form.addEventListener("input", () => saveFormDraft(form));
  form.addEventListener("change", () => saveFormDraft(form));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isValid = validateForm(form);
    const status = document.querySelector("#form-status");
    status.className = isValid ? "form-status success" : "form-status";
    status.textContent = isValid
      ? "Thank you! Your request is ready to send. The bakery will confirm availability and pricing."
      : "Please correct the highlighted fields before sending your request.";
    if (!isValid) form.querySelector('[aria-invalid="true"]')?.focus();
  });
}

initializeFavoritesFeature();
initializeContactForm();
