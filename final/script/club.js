const meetings = [
    {
        id: "2026-11-15",
        date: "Nov 15, 2026",
        title: "The Evolution of Gotham Villains",
        universe: "dc",
        reading: { id: "dc-1", title: "Batman: The Dark Knight Returns" }
    },
    {
        id: "2026-11-28",
        date: "Nov 28, 2026",
        title: "Exploring Alternate Marvel Timelines",
        universe: "marvel",
        reading: { id: "marvel-4", title: "House of X / Powers of X" }
    }
];

const rsvpStorageKey = "multiverse_club_rsvps";
const form = document.getElementById("club-form");
const meetingField = form.elements.meeting;
const meetingFilter = document.getElementById("meeting-filter");
const schedule = document.getElementById("club-schedule");
const savedList = document.getElementById("rsvp-list");
const successMessage = document.getElementById("rsvp-success");
const errorMessage = document.getElementById("rsvp-error");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let rsvps = loadRsvps();

function loadRsvps() {
    try {
        const saved = JSON.parse(localStorage.getItem(rsvpStorageKey));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveRsvps(nextRsvps) {
    errorMessage.hidden = true;
    try {
        localStorage.setItem(rsvpStorageKey, JSON.stringify(nextRsvps));
        rsvps = nextRsvps;
        return true;
    } catch {
        errorMessage.textContent = "This browser could not save the change. Check your storage settings and try again.";
        errorMessage.hidden = false;
        return false;
    }
}

function renderMeetings() {
    const universe = meetingFilter.value;
    const visibleMeetings = meetings.filter(meeting => universe === "all" || meeting.universe === universe);
    schedule.replaceChildren();

    const count = visibleMeetings.length;
    document.getElementById("meeting-count").textContent = count + (count === 1 ? " meeting" : " meetings");
    if (!count) {
        const message = schedule.insertRow().insertCell();
        message.colSpan = 2;
        message.textContent = "No meetings found.";
        return;
    }

    for (const meeting of visibleMeetings) {
        const row = document.createElement("tr");
        const date = document.createElement("th");
        date.scope = "row";
        date.className = "text-nowrap";

        const time = document.createElement("time");
        time.dateTime = meeting.id;
        time.textContent = meeting.date;
        date.append(time);

        const discussion = document.createElement("td");
        const choose = document.createElement("button");
        choose.type = "button";
        choose.className = "btn btn-sm btn-outline-secondary text-start";
        choose.textContent = meeting.title;
        choose.setAttribute("aria-label", "Select meeting: " + meeting.title);
        choose.addEventListener("click", () => {
            meetingField.value = meeting.id;
            setFieldError(meetingField, "");
            meetingField.focus();
        });
        discussion.append(choose);
        row.append(date, discussion);
        schedule.append(row);
    }
}

function updateRsvpCount() {
    document.getElementById("rsvp-count").textContent = rsvps.length;
    document.getElementById("rsvp-empty").hidden = rsvps.length > 0;
}

function appendRsvp(rsvp, animate = false) {
    const meeting = meetings.find(item => item.id === rsvp.meeting);
    const entry = document.createElement("li");
    entry.className = "border rounded p-2 mt-2 text-break";

    const label = document.createElement("p");
    label.className = "mb-1";
    label.textContent = rsvp.name + " — " + (meeting ? meeting.title : rsvp.meeting);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-sm btn-outline-danger";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", "Remove RSVP for " + label.textContent);
    remove.addEventListener("click", () => {
        if (!saveRsvps(rsvps.filter(item => item !== rsvp))) return;
        remove.disabled = true;
        successMessage.hidden = true;
        document.getElementById("saved-rsvps-title").focus();

        function finishRemoval() {
            entry.remove();
            updateRsvpCount();
        }

        if (window.jQuery && !reducedMotion.matches) {
            window.jQuery(entry).stop(true, true).slideUp(180, finishRemoval);
        } else {
            finishRemoval();
        }
    });

    entry.append(label);
    if (meeting) {
        const date = document.createElement("time");
        date.className = "d-block small text-body-secondary mb-1";
        date.dateTime = meeting.id;
        date.textContent = meeting.date;

        const reading = document.createElement("a");
        reading.className = "d-block small mb-2";
        reading.href = "../" + meeting.universe + "/#" + meeting.reading.id;
        reading.textContent = "Reading: " + meeting.reading.title;
        entry.append(date, reading);
    }
    entry.append(remove);
    savedList.append(entry);
    if (animate && window.jQuery && !reducedMotion.matches) {
        window.jQuery(entry).hide().slideDown(180);
    }
}

function setFieldError(field, message) {
    document.getElementById(field.id + "-error").textContent = message;
    field.classList.toggle("is-invalid", Boolean(message));
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
}

function validateField(field) {
    const messages = {
        name: "Enter your full name.",
        email: "Enter a valid email address.",
        universe: "Choose your favorite universe.",
        meeting: "Choose an upcoming meeting."
    };
    const valid = field.value.trim() && field.validity.valid;
    setFieldError(field, valid ? "" : messages[field.name]);
    return Boolean(valid);
}

const requiredFields = [...form.querySelectorAll("[required]")];

for (const field of requiredFields) {
    field.addEventListener("input", () => {
        if (field.classList.contains("is-invalid")) validateField(field);
    });
}

form.addEventListener("submit", event => {
    event.preventDefault();
    if (window.jQuery) window.jQuery(successMessage).stop(true, true).css("display", "");
    successMessage.hidden = true;
    errorMessage.hidden = true;

    const invalidFields = requiredFields.filter(field => !validateField(field));
    if (invalidFields.length) {
        invalidFields[0].focus();
        return;
    }

    const data = new FormData(form);
    const rsvp = {
        name: data.get("name").trim(),
        email: data.get("email").trim(),
        universe: data.get("universe"),
        meeting: data.get("meeting"),
        interests: data.get("interests").trim(),
        comment: data.get("comment").trim()
    };

    const duplicate = rsvps.some(item =>
        item.meeting === rsvp.meeting && item.email.toLowerCase() === rsvp.email.toLowerCase()
    );
    if (duplicate) {
        setFieldError(meetingField, "This email already has an RSVP for the selected meeting.");
        meetingField.focus();
        return;
    }

    if (!saveRsvps([...rsvps, rsvp])) return;
    appendRsvp(rsvp, true);
    updateRsvpCount();
    form.reset();

    successMessage.textContent = "Your RSVP was saved on this device.";
    successMessage.hidden = false;
    if (window.jQuery && !reducedMotion.matches) {
        window.jQuery(successMessage).hide().fadeIn(180);
    }
});

for (const meeting of meetings) {
    meetingField.add(new Option(meeting.date + " — " + meeting.title, meeting.id));
}
meetingFilter.addEventListener("change", renderMeetings);
renderMeetings();
rsvps.forEach(rsvp => appendRsvp(rsvp));
updateRsvpCount();
document.getElementById("club-content").hidden = false;
