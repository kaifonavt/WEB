$(document).ready(function () {
    const QUIZ_JSON_URL = "./quiz.json";
    let quizData = [];
    let currentIndex = 0;
    let score = 0;
    let isAnswered = false;
    $.getJSON(QUIZ_JSON_URL)
        .done(function (data) {
            if (!Array.isArray(data) || data.length === 0) {
                $("#quiz-status")
                    .addClass("alert alert-warning")
                    .text("No quiz questions found.");
                return;
            }

            quizData = data;
            $("#quiz-status").addClass("d-none");
            $("#quiz-counter, #quiz-card").removeClass("d-none");
            $("#quiz-total-score").text(quizData.length);

            renderQuestion();
        })
        .fail(function () {
            $("#quiz-status")
                .addClass("alert alert-danger")
                .text("Failed to load quiz data. Make sure you are running on a local server (e.g., Live Server).");
        });

    function renderQuestion() {
        isAnswered = false;
        const current = quizData[currentIndex];
        const total = quizData.length;

        $("#quiz-counter").text(`${currentIndex + 1} / ${total}`);
        const progressPercent = Math.round((currentIndex / total) * 100);
        $("#quiz-progress").css("width", `${progressPercent}%`).attr("aria-valuenow", progressPercent);

        $("#quiz-universe").text(current.universe);
        $("#quiz-question").text(current.question);

        $("#quiz-feedback").addClass("d-none").removeClass("alert-success alert-danger");
        $("#quiz-next-btn")
            .prop("disabled", true)
            .text(currentIndex === total - 1 ? "Finish Quiz" : "Next Question");

        const $optionsContainer = $("#quiz-options").empty();
        current.options.forEach((optionText, index) => {
            const $btn = $("<button>")
                .attr("type", "button")
                .addClass("btn btn-outline-secondary text-start fw-semibold py-2 px-3 quiz-option")
                .attr("data-index", index)
                .text(optionText);
            $optionsContainer.append($btn);
        });
    }

    $(document).on("click", ".quiz-option", function () {
        if (isAnswered) return;
        isAnswered = true;

        const selectedIndex = Number($(this).data("index"));
        const correctIndex = quizData[currentIndex].answer;

        $(".quiz-option").prop("disabled", true);

        if (selectedIndex === correctIndex) {
            score++;
            $("#quiz-score").text(score);
            $(this).removeClass("btn-outline-secondary").addClass("btn-success");
            $("#quiz-feedback")
                .removeClass("d-none")
                .addClass("alert-success")
                .text("Correct! Great job.");
        } else {
            $(this).removeClass("btn-outline-secondary").addClass("btn-danger");
            $(`.quiz-option[data-index="${correctIndex}"]`)
                .removeClass("btn-outline-secondary")
                .addClass("btn-success");
            $("#quiz-feedback")
                .removeClass("d-none")
                .addClass("alert-danger")
                .text(`Wrong! The correct answer is: ${quizData[currentIndex].options[correctIndex]}.`);
        }

        $("#quiz-next-btn").prop("disabled", false);
    });

    $("#quiz-next-btn").on("click", function () {
        currentIndex++;
        if (currentIndex < quizData.length) {
            renderQuestion();
        } else {
            showResults();
        }
    });

    function showResults() {
        $("#quiz-progress").css("width", "100%").attr("aria-valuenow", 100);
        $("#quiz-body").addClass("d-none");
        $("#quiz-result").removeClass("d-none");
        $("#quiz-final-score").text(score);

        let rank = "Rookie Sidekick";
        if (score === quizData.length) {
            rank = "Supreme Comic Book Master!";
        } else if (score >= 10) {
            rank = "Justice League & Avengers Member";
        } else if (score >= 6) {
            rank = "Neighborhood Vigilante";
        }
        $("#quiz-rank").text(rank);
    }

    $("#quiz-restart-btn").on("click", function () {
        currentIndex = 0;
        score = 0;
        $("#quiz-score").text(score);
        $("#quiz-result").addClass("d-none");
        $("#quiz-body").removeClass("d-none");
        renderQuestion();
    });
});