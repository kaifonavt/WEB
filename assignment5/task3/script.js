const form = document.getElementById('ticket-form');
const previewEvent = document.getElementById('prev-event');
const previewDate = document.getElementById('prev-date');
const previewName = document.getElementById('prev-name');
const previewTotal = document.getElementById('prev-total');
const errorsCountEl = document.getElementById('errors-count');
const finalTicketEl = document.getElementById('final-ticket');

const seatsData = {
    vip: {left: 5, price: 100},
    standard: {left: 20, price: 50}
};
const soldOutDates = ['2026-11-01', '2026-12-31'];

function validateField(input) {
    const errorSpan = input.nextElementSibling;
    let errorMessage = "";
    input.setCustomValidity("");
    if (input.name === 'date' && input.value) {
        if (soldOutDates.includes(input.value)) {
            input.setCustomValidity("Tickets are sold out for this date.");
        } else if (new Date(input.value) < new Date()) {
            input.setCustomValidity("Date must be in the future.");
        }
    }

    if (input.name === 'quantity' && input.value) {
        const selectedType = form.elements['type'].value;
        if (selectedType && seatsData[selectedType]) {
            if (parseInt(input.value) > seatsData[selectedType].left) {
                input.setCustomValidity(`Maximum tickets available: ${seatsData[selectedType].left}`);
            }
        }
    }

    if (input.name === 'promo' && input.value) {
        if (input.value !== 'PROMO10') {
            input.setCustomValidity("Invalid promo code.");
        }
    }
    if (!input.checkValidity()) {
        if (input.validity.valueMissing) errorMessage = "This field is required.";
        else if (input.validity.patternMismatch) errorMessage = "Please enter First and Last name separated by a space.";
        else if (input.validity.typeMismatch) errorMessage = "Please enter a valid format.";
        else errorMessage = input.validationMessage;

        input.classList.add('invalid');
        input.setAttribute('aria-invalid', 'true');
    } else {
        input.classList.remove('invalid');
        input.setAttribute('aria-invalid', 'false');
    }

    errorSpan.textContent = errorMessage;
    return input.checkValidity();
}

function updatePreview() {
    previewEvent.textContent = `Event: ${form.elements['event'].options[form.elements['event'].selectedIndex].text || '-'}`;
    previewDate.textContent = `Date: ${form.elements['date'].value || '-'}`;
    previewName.textContent = `Name: ${form.elements['fullName'].value || '-'}`;

    const type = form.elements['type'].value;
    const qty = parseInt(form.elements['quantity'].value) || 0;
    const promo = form.elements['promo'].value;

    if (type && qty > 0) {
        let total = seatsData[type].price * qty;
        if (promo === 'PROMO10') total = total * 0.9;
        previewTotal.textContent = `Total: $${total} ${promo === 'PROMO10' ? '(Discount applied)' : ''}`;
    } else {
        previewTotal.textContent = 'Total: -';
    }
}

Array.from(form.elements).forEach(input => {
    if (input.tagName === 'BUTTON') return;

    input.addEventListener('input', () => {
        validateField(input);
        updatePreview();
    });

    input.addEventListener('blur', () => {
        validateField(input);
    });
});
form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalidInput = null;
    let errorsCount = 0;

    Array.from(form.elements).forEach(input => {
        if (input.tagName === 'BUTTON') return;
        if (!validateField(input)) {
            errorsCount++;
            if (!firstInvalidInput) firstInvalidInput = input;
        }
    });

    if (errorsCount > 0) {
        errorsCountEl.textContent = `Errors found: ${errorsCount}. Please correct them.`;
        firstInvalidInput.focus();
    } else {
        errorsCountEl.textContent = "";
        finalTicketEl.textContent = "";
        const bookingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const successMsg = document.createElement('h3');
        successMsg.style.color = 'green';
        successMsg.textContent = `Success! Your booking code is: ${bookingCode}`;
        finalTicketEl.appendChild(successMsg);
        form.reset();
        updatePreview();
    }
});