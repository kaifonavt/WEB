$(document).ready(function () {
    const STORAGE_KEY = "multiverse_reading_list";
    function getReadingList() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Failed to read from localStorage:", e);
            return [];
        }
    }

    function saveReadingList(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        updateNavBadge(list.length);
    }

    function updateNavBadge(count) {
        $("#nav-reading-count").text(count);
    }

    function syncCatalogButtons() {
        const savedIds = new Set(getReadingList().map((item) => String(item.id)));

        $("#comics-list .toggle-reading-btn").each(function () {
            const $btn = $(this);
            const isAdded = savedIds.has(String($btn.data("id")));
            setButtonAppearance($btn, isAdded);
        });
    }

    function setButtonAppearance($btn, isAdded) {
        if (!$btn.length) return;

        if (isAdded) {
            $btn.removeClass("btn-outline-secondary")
                .addClass("btn-danger")
                .html('<i class="bi bi-trash me-1"></i>Remove');
        } else {
            $btn.removeClass("btn-danger")
                .addClass("btn-outline-secondary")
                .html('<i class="bi bi-bookmark-plus me-1"></i>Add to Reading List');
        }
    }

    function renderReadingList() {
        const $listContainer = $("#reading-list-items");
        if (!$listContainer.length) return;

        const list = getReadingList();
        const total = list.length;
        const completed = list.filter((item) => item.read).length;

        $listContainer.empty();
        $("#reading-list-count").text(total);

        if (total === 0) {
            $("#reading-list-empty").removeClass("d-none");
            $("#clear-list-btn").addClass("d-none");
            updateProgressBar(0, 0);
            return;
        }

        $("#reading-list-empty").addClass("d-none");
        $("#clear-list-btn").removeClass("d-none");
        updateProgressBar(completed, total);

        list.forEach((comic) => {
            const universeBadge = comic.universe === "Marvel" ? "bg-danger" : "bg-primary";

            const $item = $("<div>").addClass(
                `list-group-item border rounded-0 p-3 mb-2 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 ${
                    comic.read ? "bg-body-secondary" : "bg-body"
                }`
            );

            const $left = $("<div>").addClass("d-flex align-items-center gap-3");

            const $thumbWrap = $("<div>").addClass("col-3 col-sm-2 col-md-1 flex-shrink-0");
            const $thumbRatio = $("<div>").addClass("ratio ratio-1x1 border");
            const $thumb = $("<img>")
                .addClass("object-fit-cover w-100 h-100")
                .attr("src", comic.image)
                .attr("alt", comic.title);
            $thumbRatio.append($thumb);
            $thumbWrap.append($thumbRatio);

            const $textWrap = $("<div>");
            const $headerRow = $("<div>").addClass("d-flex align-items-center gap-2 mb-1");
            const $badge = $("<span>")
                .addClass(`badge ${universeBadge} rounded-0 text-uppercase`)
                .text(comic.universe);
            const $title = $("<h5>")
                .addClass(`h6 fw-bold text-uppercase m-0 ${comic.read ? "text-decoration-line-through text-muted" : ""}`)
                .text(comic.title);

            $headerRow.append($badge, $title);

            const $info = $("<p>")
                .addClass("small text-secondary mb-0 d-none d-md-block")
                .text(comic.info);

            $textWrap.append($headerRow, $info);
            $left.append($thumbWrap, $textWrap);

            const $actions = $("<div>").addClass("d-flex align-items-center gap-2 flex-shrink-0");

            const $readBtn = $("<button>")
                .attr("type", "button")
                .attr("data-id", comic.id)
                .addClass(
                    `btn btn-sm rounded-0 fw-bold toggle-read-btn ${
                        comic.read ? "btn-success" : "btn-outline-success"
                    }`
                )
                .html(
                    comic.read
                        ? '<i class="bi bi-check-circle-fill me-1"></i>Read'
                        : '<i class="bi bi-circle me-1"></i>Mark Read'
                );

            const $removeBtn = $("<button>")
                .attr("type", "button")
                .attr("data-id", comic.id)
                .addClass("btn btn-sm btn-outline-danger rounded-0 fw-bold toggle-reading-btn")
                .html('<i class="bi bi-trash me-1"></i>Remove');

            $actions.append($readBtn, $removeBtn);
            $item.append($left, $actions);
            $listContainer.append($item);
        });
    }

    function updateProgressBar(completed, total) {
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        $("#reading-progress-text").text(`${completed} / ${total} Read (${percent}%)`);
        $("#reading-progress-bar")
            .css("width", `${percent}%`)
            .attr("aria-valuenow", percent)
            .text(`${percent}%`);
    }

    $(document).on("click", ".toggle-reading-btn", function () {
        const $btn = $(this);
        const comicId = String($btn.data("id"));
        let list = getReadingList();
        const exists = list.some((item) => String(item.id) === comicId);

        if (exists) {
            list = list.filter((item) => String(item.id) !== comicId);
        } else {
            list.push({
                id: comicId,
                title: $btn.data("title"),
                universe: $btn.data("universe"),
                image: $btn.data("image"),
                info: $btn.data("info"),
                read: false
            });
        }

        saveReadingList(list);
        syncCatalogButtons();
        renderReadingList();
    });

    $(document).on("click", ".toggle-read-btn", function () {
        const comicId = String($(this).data("id"));
        const list = getReadingList().map((item) =>
            String(item.id) === comicId ? { ...item, read: !item.read } : item
        );
        saveReadingList(list);
        renderReadingList();
    });

    $("#clear-list-btn").on("click", function () {
        saveReadingList([]);
        syncCatalogButtons();
        renderReadingList();
    });

    $(document).on("comics:loaded", function () {
        syncCatalogButtons();
    });

    $(window).on("storage", function (e) {
        if (e.originalEvent.key === STORAGE_KEY) {
            updateNavBadge(getReadingList().length);
            syncCatalogButtons();
            renderReadingList();
        }
    });

    updateNavBadge(getReadingList().length);
    syncCatalogButtons();
    renderReadingList();
});