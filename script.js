const MAX_QUESTIONS = 10;
const WIN_SCORE = MAX_QUESTIONS - 5;
const CORRECT_DELAY_MS = 500;
const WRONG_DELAY_MS = 3000;
const MAX_MATH_QUESTIONS = 50;
const MATH_WIN_SCORE = MAX_MATH_QUESTIONS - 5;

const allEntries = Object.entries(images);
if (allEntries.length < 4) {
    throw new Error("At least 4 words are required for this quiz.");
}

const quizImage = document.getElementById("quiz-image");
const wordSentence = document.getElementById("word-sentence");
const optionsContainer = document.getElementById("options");
const feedback = document.getElementById("feedback");
const scoreLabel = document.getElementById("score");
const restartBtn = document.getElementById("restart-btn");
const wordScoresContainer = document.getElementById("word-scores");
const appTitle = document.getElementById("app-title");
const mathToggleBtn = document.getElementById("math-toggle-btn");
const wordsSection = document.getElementById("words-section");
const mathSection = document.getElementById("math-section");
const mathProblem = document.getElementById("math-problem");
const mathOptionsContainer = document.getElementById("math-options");
const wrongLogSection = document.getElementById("wrong-log-section");
const wrongLogContainer = document.getElementById("wrong-log-list");
const wrongLogBtn = document.getElementById("wrong-log-btn");
const resultOverlay = document.getElementById("result-overlay");
const resultCloseBtn = document.getElementById("result-close-btn");
const resultMessage = document.getElementById("result-message");
const resultImage = document.getElementById("result-image");

let currentMode = "words";

function hideResultImage() {
    if (!resultImage || !resultOverlay || !resultMessage) {
        return;
    }

    resultOverlay.hidden = true;
    resultImage.removeAttribute("src");
    resultMessage.textContent = "";
}

function pickRandomImageUrl(imageMap) {
    if (!imageMap) {
        return "";
    }

    const urls = Object.values(imageMap).filter((url) => typeof url === "string" && url.length > 0);
    if (urls.length === 0) {
        return "";
    }

    const index = Math.floor(Math.random() * urls.length);
    return urls[index];
}

function showResultImage(didWin) {
    if (!resultImage || !resultOverlay || !resultMessage) {
        return;
    }

    const selectedImageUrl = didWin
        ? pickRandomImageUrl(winImageUrl)
        : pickRandomImageUrl(loseImageUrl);

    if (!selectedImageUrl) {
        hideResultImage();
        return;
    }

    resultMessage.textContent = didWin
        ? "כָּל הַכָּבוֹד, נִצַּחַתְּ !!!"
        : "לֹא נוֹרָא, פַּעַם הַבָּאָה תַּצְלִיחִי !";
    resultImage.src = selectedImageUrl;
    resultOverlay.hidden = false;
}

function hideWrongLogUI() {
    wrongLogBtn.hidden = true;
    wrongLogSection.hidden = true;
}

function handleGameEnd(endState) {
    if (!endState) {
        hideWrongLogUI();
        hideResultImage();
        return;
    }

    const shouldShowButton = !endState.didWin && endState.wrongCount > 0;
    wrongLogBtn.hidden = !shouldShowButton;
    wrongLogSection.hidden = true;
    showResultImage(endState.didWin);
}

const wordQuiz = window.createWordQuizModule({
    allEntries,
    sentenceTemplates,
    maxQuestions: MAX_QUESTIONS,
    winScore: WIN_SCORE,
    correctDelayMs: CORRECT_DELAY_MS,
    wrongDelayMs: WRONG_DELAY_MS,
    quizImage,
    wordSentence,
    optionsContainer,
    feedback,
    wordScoresContainer,
    wrongLogContainer,
    onGameEnd: handleGameEnd,
    onStatsChange: (stats) => {
        if (currentMode !== "words") {
            return;
        }

        scoreLabel.textContent = `נִיקּוּד: ${stats.score} | נוֹתְרוּ שְׁאֵלוֹת: ${stats.remaining}`;
    }
});

const mathQuiz = window.createMathQuizModule({
    maxQuestions: MAX_MATH_QUESTIONS,
    winScore: MATH_WIN_SCORE,
    correctDelayMs: CORRECT_DELAY_MS,
    wrongDelayMs: WRONG_DELAY_MS,
    feedback,
    mathProblem,
    mathOptionsContainer,
    wrongLogContainer,
    onGameEnd: handleGameEnd,
    onStatsChange: (stats) => {
        if (currentMode !== "math") {
            return;
        }

        scoreLabel.textContent = `נִיקּוּד: ${stats.score} | נוֹתְרוּ תַּרְגִּילִים: ${stats.remaining}`;
    }
});

function setMode(mode) {
    currentMode = mode;
    feedback.textContent = "";
    hideWrongLogUI();
    hideResultImage();

    if (mode === "math") {
        appTitle.textContent = "תַּרְגּוּל חֶשְׁבּוֹן";
        mathToggleBtn.textContent = "מילים";
        mathToggleBtn.classList.add("active");
        wordsSection.hidden = true;
        mathSection.hidden = false;
        wordQuiz.deactivate();
        mathQuiz.activate();
        return;
    }

    appTitle.textContent = "הַתְאֵם מִלָּה לַתְּמוּנָה";
    mathToggleBtn.textContent = "חשבון";
    mathToggleBtn.classList.remove("active");
    wordsSection.hidden = false;
    mathSection.hidden = true;
    mathQuiz.deactivate();
    wordQuiz.activate();
}

function restartCurrentMode() {
    const activeQuiz = currentMode === "math" ? mathQuiz : wordQuiz;
    const { totalQuestions } = activeQuiz.getStats();
    const shouldConfirmRestart = totalQuestions > 0;

    if (shouldConfirmRestart) {
        const confirmed = window.confirm("לְהַתְחִיל מֵחָדָשׁ? כָּל הַהִתְקַדְּמוּת הַנּוֹכְחִית תִּמָּחֵק.");
        if (!confirmed) {
            return;
        }
    }

    if (currentMode === "math") {
        mathQuiz.restart();
        return;
    }

    wordQuiz.restart();
}

restartBtn.addEventListener("click", restartCurrentMode);
resultCloseBtn.addEventListener("click", hideResultImage);
wrongLogBtn.addEventListener("click", () => {
    wrongLogSection.hidden = false;
});
mathToggleBtn.addEventListener("click", () => {
    const nextMode = currentMode === "words" ? "math" : "words";
    setMode(nextMode);
});

setMode("words");
