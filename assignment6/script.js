let partyData = [
    {
        floor: 2,
        name: "Balcony",
        guests: [
            { name: "Aigerim", color: "blue", time: "20:45", aitu: true, things: ["phone", "cup"] },
            { name: "Aliya", color: "red", time: "21:15", aitu: true, things: ["phone", "bag"] },
            { name: "Madina", color: "green", time: "22:10", aitu: true, things: ["phone", "bag"] },
            { name: "Ivan", color: "blue", time: "20:10", aitu: true, things: ["cup"] }
        ]
    },
    {
        floor: 2,
        name: "Hall",
        guests: [
            { name: "Arman", color: "red", time: "20:35", aitu: true, things: ["bag", "glasses"] },
            { name: "Sophia", color: "purple", time: "21:20", aitu: false, things: ["phone"] },
            { name: "Dias", color: "green", time: "19:45", aitu: true, things: ["bag", "cup", "glasses"] },
            { name: "Bekzat", color: "blue", time: "20:55", aitu: true, things: ["bag", "cup", "glasses"] },
            { name: "Aruzhan", color: "blue", time: "21:50", aitu: false, things: ["phone"] },
            { name: "Saule", color: "green", time: "21:25", aitu: false, things: ["glasses"] }
        ]
    },
    {
        floor: 1,
        name: "Kitchen",
        guests: [
            { name: "Nurlan", color: "red", time: "19:40", aitu: true, things: ["phone", "bag"] },
            { name: "Emma", color: "green", time: "20:15", aitu: true, things: ["phone", "bag", "cup"] },
            { name: "Timur", color: "green", time: "21:05", aitu: true, things: ["phone", "bag"] },
            { name: "Sergey", color: "orange", time: "20:50", aitu: false, things: ["glasses"] },
            { name: "Yertan", color: "pink", time: "21:40", aitu: true, things: ["glasses"] },
            { name: "Kamila", color: "dark", time: "20:05", aitu: true, things: ["crumbs"] }
        ]
    },
    {
        floor: 1,
        name: "Living room",
        guests: [
            { name: "Daniel", color: "blue", time: "19:55", aitu: true, things: ["glasses"] },
            { name: "Zarina", color: "green", time: "22:30", aitu: false, things: ["crumbs" , "cup"] },
            { name: "Natasha", color: "purple", time: "20:30", aitu: true, things: ["bag"] },
            { name: "Askar", color: "brown", time: "21:00", aitu: true, things: ["cup"] },
            { name: "Inkar", color: "purple", time: "20:20", aitu: true, things: ["bag"] }
        ]
    }
];

const colorMap = {
    blue: "#007bff", red: "#dc3545", green: "#28a745",
    purple: "#6f42c1", orange: "#fd7e14", pink: "#e83e8c",
    dark: "#343a40", brown: "#795548"
};

function renderPage() {
    let container = $("#floors-container").empty();
    [2, 1].forEach(floorNum => {
        let floorDiv = $(`<div class="floor" data-floor="${floorNum}"></div>`);
        let roomsOnFloor = partyData.filter(r => r.floor === floorNum);

        roomsOnFloor.forEach(room => {
            let roomDiv = $(`<div class="room" data-room="${room.name}"><h3>${room.name} (Floor ${room.floor})</h3><button class="sort-btn">Sort by time</button><div class="guests-container"></div></div>`);
            let guestsContainer = roomDiv.find(".guests-container");

            room.guests.forEach(g => {
                let avatarUrl = `https://api.dicebear.com/9.x/open-peeps/svg?seed=${g.name}`;
                let thingsAttr = g.things.join(",");
                let card = $(`
                <div class="guest-card"
                     data-name="${g.name}"
                     data-time="${g.time}"
                     data-aitu="${g.aitu}"
                     data-color="${g.color}"
                     data-things="${thingsAttr}">
                    <img src="${avatarUrl}" style="border-color: ${colorMap[g.color] || '#000'}">
                    <div>
                        <div style="font-weight: bold; font-size: 12px;">${g.name}</div>
                        <div style="font-size: 10px;">${g.time}</div>
                        ${g.aitu ? '<span class="badge">AITU</span>' : ''}
                    </div>
                </div>
            `);
                guestsContainer.append(card);
            });
            floorDiv.append(roomDiv);
        });
        container.append(floorDiv);
    });
}

const cases = [
    { title: "1. Who is in the hall?", fn: () => $(".room[data-room='Hall'] .guest-card") },
    { title: "2. Yellow or purple clothing", fn: () => $(".guest-card").filter(function() { return ["yellow", "purple"].includes($(this).data("color")); }) },
    { title: "3. AITU students upstairs", fn: () => $(".floor[data-floor='2'] .guest-card[data-aitu='true']") },
    { title: "4. Has glasses or a bag", fn: () => $(".guest-card").filter(function() { let t = $(this).data("things"); return t.includes("glasses") || t.includes("bag"); }) },
    { title: "5. Came with nothing at all", fn: () => $(".guest-card").filter(function() { return !$(this).data("things") || $(this).data("things") === ""; }) },
    { title: "6. Phone but no bag", fn: () => $(".guest-card").filter(function() { let t = $(this).data("things"); return t.includes("phone") && !t.includes("bag"); }) },
    { title: "7. Arrived between 20:30 and 21:00", fn: () => $(".guest-card").filter(function() { let tm = $(this).data("time"); return tm >= "20:30" && tm <= "21:00"; }) },
    { title: "8. Arrived after 21:00 and not AITU", fn: () => $(".guest-card").filter(function() { return $(this).data("time") > "21:00" && $(this).data("aitu") === false; }) },
    { title: "9. Stands right next to Askar", fn: () => $(".guest-card[data-name='Askar']").prev().add($(".guest-card[data-name='Askar']").next()) },
    { title: "10. Last in each room", fn: () => $(".room .guests-container .guest-card:last-child") },
    { title: "11. Third in each room", fn: () => $(".room .guests-container .guest-card:nth-child(3)") },
    { title: "12. After Timur in his room", fn: () => $(".guest-card[data-name='Timur']").nextAll() },
    { title: "13. Right before someone in black (dark)", fn: () => $(".guest-card").filter(function() { return $(this).next().data("color") === "dark"; }) },
    { title: "14. Room of Aruzhan", fn: () => $(".guest-card[data-name='Aruzhan']").closest(".room") },
    { title: "15. Rooms with < 6 guests", fn: () => $(".room").filter(function() { return $(this).find(".guest-card").length < 6; }) },
    { title: "16. Room with cup, no glasses", fn: () => $(".room").filter(function() { return $(this).find(".guest-card").filter(function(){return $(this).data("things").includes("cup");}).length > 0 && $(this).find(".guest-card").filter(function(){return $(this).data("things").includes("glasses");}).length === 0; }) },
    { title: "17. First to each room", fn: () => $(".room .guests-container .guest-card:first-child") },
    { title: "18. Miras appears", fn: () => {
            let askaCard = $(".guest-card[data-name='Askar']");
            let mirasHtml = `<div class="guest-card" data-name="Miras" data-time="21:20" data-aitu="true" data-color="blue" data-things="phone">
            <img src="https://api.dicebear.com/9.x/open-peeps/svg?seed=Miras" style="border-color: ${colorMap['blue']}">
            <div><div style="font-weight: bold; font-size: 12px;">Miras</div><div style="font-size: 10px;">21:20</div><span class="badge">AITU</span></div>
        `;
            $(mirasHtml).insertBefore(askaCard).hide().fadeIn(1000);
            return $([]);
        }},
    { title: "19. Aliya goes home", fn: () => {
            $(".guest-card[data-name='Aliya']").fadeOut(1000, function() { $(this).remove(); });
            return $([]);
        }},
    { title: "20. Who took the cake (Thief)", fn: () => {
            return $(".floor[data-floor='1'] .guest-card").filter(function() {
                let t = $(this).data("time") > "21:00";
                let th = $(this).data("things");
                let hasCrumbs = th.includes("crumbs");
                let hasCup = th.includes("cup");
                let nextOrPrevAitu = $(this).prev().data("aitu") === true || $(this).next().data("aitu") === true;
                return t && hasCrumbs && !hasCup && nextOrPrevAitu;
            });
        }}
];

function initCases() {
    let box = $("#case-buttons").empty();
    cases.forEach((c, idx) => {
        let btn = $(`<button>${c.title}</button>`);
        btn.on("click", function() {
            $(".guest-card, .room").removeClass("pale");
            let found = c.fn();

            if(found.hasClass("room")) {
                $(".room").not(found).addClass("pale");
            } else {
                $(".guest-card").not(found).addClass("pale");
            }
            found.stop(true, true).animate({top: "-=10px"}, 200).animate({top: "+=10px"}, 200);
            let names = found.map(function() { return $(this).data("name") || $(this).find("h3").text(); }).get().join(", ");
            $("#case-result").text(`Found (${found.length}): ${names}`);
        });
        box.append(btn);
    });
}

$("#btn-clear").on("click", function() {
    renderPage();
    $("#case-result").text("");
});

$(document.body).on("click", ".guest-card", function(e) {
    e.stopPropagation();
    let card = $(this);
    let name = card.data("name");
    let time = card.data("time");
    let aitu = card.data("aitu");
    let things = card.data("things");

    $("#modal-name").text(name);
    $("#modal-info").html(`Came at ${time}<br>${aitu ? 'AITU student' : 'Not AITU'}<br>Things: ${things || 'none'}`);
    let moveContainer = $("#modal-move-buttons").empty();
    partyData.forEach(r => {
        if(r.name !== card.closest(".room").find("h3").text().split(" ")[0]) {
            let mBtn = $("<button></button>").text(`Move to ${r.name}`);
            mBtn.on("click", function() {
                moveGuest(card, r.name);
                $("#modal-card").fadeOut();
            });
            moveContainer.append(mBtn);
        }
    });

    let pos = card.offset();
    let modal = $("#modal-card").css({top: pos.top, left: pos.left, width: 40, height: 40, opacity: 0}).show();
    modal.stop(true, true).animate({top: pos.top - 50, left: pos.left - 50, width: 250, opacity: 1}, 300);
});

$(document).on("click", function(e) {
    if(!$(e.target).closest("#modal-card, .guest-card").length) {
        $("#modal-card").fadeOut(200);
    }
});
$(document).on("keydown", function(e) {
    if(e.key === "Escape") {
        $("#modal-card").fadeOut(200);
    }
});

function moveGuest(card, targetRoomName) {
    let targetRoomContainer = $(`.room`).filter(function() { return $(this).find("h3").text().startsWith(targetRoomName); }).find(".guests-container");
    let startOffset = card.offset();
    let clone = card.clone().appendTo("body").css({
        position: "absolute",
        top: startOffset.top,
        left: startOffset.left,
        zIndex: 9999
    });
    card.animate({width: 0, opacity: 0}, 300, function() {
        $(this).remove();
    });

    let targetOffset = targetRoomContainer.offset();
    clone.animate({top: targetOffset.top, left: targetOffset.left}, 600, function() {
        clone.remove();
        targetRoomContainer.append(card.css({width: "", opacity: ""}));
    });
}
$(document.body).on("click", ".sort-btn", function() {
    let roomDiv = $(this).closest(".room");
    let container = roomDiv.find(".guests-container");
    let cards = container.children(".guest-card").get();
    let isSorted = container.data("sorted");

    if(isSorted) {
        renderPage();
    } else {
        cards.sort((a, b) => $(a).data("time").localeCompare($(b).data("time")));
        container.html(cards);
        container.data("sorted", true);
    }
});

$(document).ready(function() {
    renderPage();
    initCases();
});