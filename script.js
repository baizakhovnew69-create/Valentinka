let score = 0;
let purchasedPuzzlePieces = new Set();
const puzzleImageUrl = 'puzzle.jpg';
const puzzleRows = 2;
const puzzleCols = 4;
const puzzlePieceCosts = [100, 120, 145, 160, 180, 220, 250, 300];
const puzzleEdges = buildPuzzleEdges(puzzleRows, puzzleCols);

const gameState = {
    game1: {},
    game2: {},
    game3: {},
    game4: {},
    game5: {},
    game6: {},
    game7: {},
    game8: {}
};

const gameIds = ['game1', 'game2', 'game3', 'game4', 'game5', 'game6', 'game7', 'game8'];

function hideAllScreens() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('marketContainer').style.display = 'none';
    document.getElementById('finalQuestion').style.display = 'none';
    gameIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function updateScore() {
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = String(score);
}

function reward(points, text) {
    score += points;
    updateScore();
    if (text) alert(`${text} +${points} баллов`);
}

function startGames() {
    hideAllScreens();
    startGame1();
}

function nextGame(nextFn, delay = 900) {
    setTimeout(nextFn, delay);
}

function clearIntervals(list) {
    list.forEach((id) => {
        if (id) clearInterval(id);
    });
}

// ===== Game 1 =====
function startGame1() {
    hideAllScreens();
    document.getElementById('game1').style.display = 'block';

    const area = document.getElementById('game1Area');
    const timerEl = document.getElementById('game1Timer');
    const caughtEl = document.getElementById('game1Caught');

    area.innerHTML = '';
    let timer = 25;
    let caught = 0;
    const target = 18;

    timerEl.textContent = String(timer);
    caughtEl.textContent = String(caught);

    const spawn = setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'falling-heart';
        heart.textContent = Math.random() > 0.45 ? '💖' : '💘';
        heart.style.left = `${Math.random() * Math.max(10, area.clientWidth - 46)}px`;
        heart.style.animationDuration = `${0.7 + Math.random() * 0.5}s`;

        heart.onclick = (e) => {
            e.stopPropagation();
            caught += 1;
            caughtEl.textContent = String(caught);
            heart.remove();
            createParticles(e.clientX, e.clientY, '✨');
        };

        area.appendChild(heart);
        setTimeout(() => heart.remove(), 1600);
    }, 330);

    const tick = setInterval(() => {
        timer -= 1;
        timerEl.textContent = String(timer);
        if (timer <= 0) {
            clearIntervals([spawn, tick]);
            const passed = caught >= target;
            reward(passed ? 220 : 150, passed ? 'Игра 1 пройдена!' : 'Игра 1 завершена');
            nextGame(startGame2);
        }
    }, 1000);
}

// ===== Game 2 =====
function startGame2() {
    hideAllScreens();
    document.getElementById('game2').style.display = 'block';

    const board = document.getElementById('game2Board');
    const timerEl = document.getElementById('game2Timer');
    const hitsEl = document.getElementById('game2Hits');

    let timer = 22;
    let hits = 0;
    const targetHits = 24;
    timerEl.textContent = String(timer);
    hitsEl.textContent = String(hits);

    function renderBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const btn = document.createElement('button');
            btn.className = 'target-cell';
            const good = Math.random() < 0.32;
            btn.dataset.good = good ? '1' : '0';
            btn.textContent = good ? '💛' : '🩶';
            btn.onclick = () => {
                if (btn.dataset.good === '1') {
                    hits += 1;
                } else {
                    hits = Math.max(0, hits - 1);
                }
                hitsEl.textContent = String(hits);
                renderBoard();
            };
            board.appendChild(btn);
        }
    }

    renderBoard();
    const rerender = setInterval(renderBoard, 900);
    const tick = setInterval(() => {
        timer -= 1;
        timerEl.textContent = String(timer);
        if (timer <= 0) {
            clearIntervals([rerender, tick]);
            const passed = hits >= targetHits;
            reward(passed ? 210 : 145, passed ? 'Игра 2 пройдена!' : 'Игра 2 завершена');
            nextGame(startGame3);
        }
    }, 1000);
}

// ===== Game 3 =====
const memoryEmojis = ['💖', '💘', '💝', '💗'];
function startGame3() {
    hideAllScreens();
    document.getElementById('game3').style.display = 'block';

    const display = document.getElementById('seqDisplay');
    const buttons = document.getElementById('seqButtons');
    const info = document.getElementById('seqInfo');

    let sequence = [];
    let input = [];
    let level = 0;
    let allowInput = false;

    buttons.innerHTML = '';
    memoryEmojis.forEach((emoji) => {
        const btn = document.createElement('button');
        btn.className = 'memory-btn';
        btn.textContent = emoji;
        btn.onclick = () => {
            if (!allowInput) return;
            input.push(emoji);
            const idx = input.length - 1;
            if (input[idx] !== sequence[idx]) {
                allowInput = false;
                info.textContent = `Ошибка на уровне ${level}`;
                reward(155 + level * 8, 'Игра 3 завершена');
                nextGame(startGame4, 1100);
                return;
            }

            if (input.length === sequence.length) {
                if (sequence.length >= 7) {
                    allowInput = false;
                    info.textContent = 'Идеально!';
                    reward(240, 'Игра 3 пройдена!');
                    nextGame(startGame4, 900);
                    return;
                }
                allowInput = false;
                info.textContent = 'Верно, следующий раунд';
                setTimeout(nextRound, 700);
            }
        };
        buttons.appendChild(btn);
    });

    function showSequence() {
        let i = 0;
        display.textContent = '';
        const interval = setInterval(() => {
            display.textContent = sequence[i];
            i += 1;
            if (i >= sequence.length) {
                clearInterval(interval);
                setTimeout(() => {
                    display.textContent = 'Повтори последовательность';
                    allowInput = true;
                }, 350);
            }
        }, 620);
    }

    function nextRound() {
        level += 1;
        input = [];
        sequence.push(memoryEmojis[Math.floor(Math.random() * memoryEmojis.length)]);
        info.textContent = `Уровень ${level}`;
        showSequence();
    }

    nextRound();
}

// ===== Game 4 =====
const typingPhrases = [
    'любовь это выбор каждый день',
    'сердце помнит важные моменты',
    'ты сияешь ярче всех звезд',
    'самое ценное это внимание',
    'вместе можно пройти все'
];

function startGame4() {
    hideAllScreens();
    document.getElementById('game4').style.display = 'block';

    const targetEl = document.getElementById('typeTarget');
    const inputEl = document.getElementById('typeInput');
    const timerEl = document.getElementById('typeTimer');
    const progressEl = document.getElementById('typeProgress');
    const info = document.getElementById('typeInfo');

    const list = typingPhrases.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    let timer = 40;
    let done = 0;

    gameState.game4 = { list, done, active: 0, ended: false };

    inputEl.value = '';
    targetEl.textContent = list[0];
    progressEl.textContent = String(done);
    timerEl.textContent = String(timer);
    info.textContent = '';
    inputEl.focus();

    gameState.game4.tick = setInterval(() => {
        timer -= 1;
        timerEl.textContent = String(timer);
        if (timer <= 0) {
            finishGame4();
        }
    }, 1000);
}

function submitTypingRound() {
    const state = gameState.game4;
    if (!state || state.ended) return;

    const inputEl = document.getElementById('typeInput');
    const progressEl = document.getElementById('typeProgress');
    const targetEl = document.getElementById('typeTarget');
    const info = document.getElementById('typeInfo');

    const typed = inputEl.value.trim().toLowerCase();
    const needed = state.list[state.active];

    if (typed === needed) {
        state.done += 1;
        state.active += 1;
        progressEl.textContent = String(state.done);
        inputEl.value = '';
        info.textContent = 'Точно!';
        if (state.done >= 3) {
            finishGame4(true);
            return;
        }
        targetEl.textContent = state.list[state.active];
    } else {
        info.textContent = 'Есть ошибка, попробуй снова';
    }
}

function finishGame4(forceWin = false) {
    const state = gameState.game4;
    if (!state || state.ended) return;
    state.ended = true;
    clearIntervals([state.tick]);

    const done = state.done;
    const passed = forceWin || done >= 3;
    reward(passed ? 230 : 150 + done * 20, passed ? 'Игра 4 пройдена!' : 'Игра 4 завершена');
    nextGame(startGame5);
}

// ===== Game 5 =====
function createMathTask() {
    const a = 8 + Math.floor(Math.random() * 24);
    const b = 3 + Math.floor(Math.random() * 12);
    const op = ['+', '-', '*'][Math.floor(Math.random() * 3)];
    let answer = 0;
    if (op === '+') answer = a + b;
    if (op === '-') answer = a - b;
    if (op === '*') answer = a * b;
    return { text: `${a} ${op} ${b}`, answer };
}

function startGame5() {
    hideAllScreens();
    document.getElementById('game5').style.display = 'block';

    const questionEl = document.getElementById('mathQuestion');
    const answerEl = document.getElementById('mathAnswer');
    const timerEl = document.getElementById('mathTimer');
    const progressEl = document.getElementById('mathProgress');
    const info = document.getElementById('mathInfo');

    let timer = 45;
    gameState.game5 = {
        solved: 0,
        correct: 0,
        current: createMathTask(),
        ended: false
    };

    questionEl.textContent = gameState.game5.current.text;
    progressEl.textContent = '0';
    timerEl.textContent = String(timer);
    info.textContent = '';
    answerEl.value = '';
    answerEl.focus();

    gameState.game5.tick = setInterval(() => {
        timer -= 1;
        timerEl.textContent = String(timer);
        if (timer <= 0) {
            finishGame5();
        }
    }, 1000);
}

function submitMathAnswer() {
    const state = gameState.game5;
    if (!state || state.ended) return;

    const answerEl = document.getElementById('mathAnswer');
    const progressEl = document.getElementById('mathProgress');
    const questionEl = document.getElementById('mathQuestion');
    const info = document.getElementById('mathInfo');

    const value = Number(answerEl.value);
    state.solved += 1;
    if (value === state.current.answer) {
        state.correct += 1;
        info.textContent = 'Верно';
    } else {
        info.textContent = `Неверно, было ${state.current.answer}`;
    }

    progressEl.textContent = String(state.solved);

    if (state.solved >= 10) {
        finishGame5();
        return;
    }

    state.current = createMathTask();
    questionEl.textContent = state.current.text;
    answerEl.value = '';
    answerEl.focus();
}

function finishGame5() {
    const state = gameState.game5;
    if (!state || state.ended) return;
    state.ended = true;
    clearIntervals([state.tick]);

    const passed = state.correct >= 7;
    const points = passed ? 240 : 160 + state.correct * 8;
    reward(points, passed ? 'Игра 5 пройдена!' : 'Игра 5 завершена');
    nextGame(startGame6);
}

// ===== Game 6 =====
function startGame6() {
    hideAllScreens();
    document.getElementById('game6').style.display = 'block';

    const show = document.getElementById('patternShow');
    const grid = document.getElementById('patternGrid');
    const info = document.getElementById('patternInfo');

    const order = [];
    while (order.length < 8) {
        const n = Math.floor(Math.random() * 16);
        if (!order.includes(n)) order.push(n);
    }

    let input = [];
    let unlocked = false;
    gameState.game6 = { order, input, ended: false };

    grid.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const btn = document.createElement('button');
        btn.className = 'pattern-cell';
        btn.textContent = '';
        btn.onclick = () => {
            const state = gameState.game6;
            if (!unlocked || state.ended) return;
            input.push(i);
            btn.classList.add('active');

            const idx = input.length - 1;
            if (input[idx] !== order[idx]) {
                state.ended = true;
                info.textContent = 'Маршрут нарушен';
                reward(170, 'Игра 6 завершена');
                nextGame(startGame7, 900);
                return;
            }

            if (input.length === order.length) {
                state.ended = true;
                info.textContent = 'Маршрут повторен';
                reward(250, 'Игра 6 пройдена!');
                nextGame(startGame7, 900);
            }
        };
        grid.appendChild(btn);
    }

    info.textContent = 'Смотри маршрут';
    let pointer = 0;
    const cells = grid.querySelectorAll('.pattern-cell');
    const showInterval = setInterval(() => {
        cells.forEach((c) => c.classList.remove('show'));
        cells[order[pointer]].classList.add('show');
        pointer += 1;
        if (pointer >= order.length) {
            clearInterval(showInterval);
            setTimeout(() => {
                cells.forEach((c) => c.classList.remove('show'));
                show.textContent = 'Теперь повтори маршрут';
                info.textContent = 'Кликай клетки в правильном порядке';
                unlocked = true;
            }, 450);
        }
    }, 540);

    show.textContent = `Маршрут длиной ${order.length}`;
}

// ===== Game 7 =====
const quizData = [
    { q: 'Какое число является простым?', a: ['21', '29', '33', '39'], c: 1 },
    { q: 'Какая планета ближе всего к Солнцу?', a: ['Венера', 'Марс', 'Меркурий', 'Юпитер'], c: 2 },
    { q: 'Сколько секунд в 3 минутах?', a: ['120', '150', '180', '210'], c: 2 },
    { q: 'Какой металл жидкий при комнатной температуре?', a: ['Медь', 'Ртуть', 'Свинец', 'Серебро'], c: 1 },
    { q: 'Корень из 144 это:', a: ['10', '11', '12', '13'], c: 2 },
    { q: 'Сколько континентов на Земле?', a: ['5', '6', '7', '8'], c: 2 }
];

function startGame7() {
    hideAllScreens();
    document.getElementById('game7').style.display = 'block';

    gameState.game7 = { idx: 0, correct: 0 };
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const state = gameState.game7;
    const qEl = document.getElementById('quizQuestion');
    const options = document.getElementById('quizOptions');
    const progress = document.getElementById('quizProgress');

    if (state.idx >= quizData.length) {
        const passed = state.correct >= 4;
        reward(passed ? 230 : 155 + state.correct * 15, passed ? 'Игра 7 пройдена!' : 'Игра 7 завершена');
        nextGame(startGame8, 800);
        return;
    }

    const item = quizData[state.idx];
    qEl.textContent = item.q;
    progress.textContent = `Вопрос ${state.idx + 1}/${quizData.length}, верно: ${state.correct}`;
    options.innerHTML = '';

    item.a.forEach((answer, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.textContent = answer;
        btn.onclick = () => {
            if (idx === item.c) state.correct += 1;
            state.idx += 1;
            renderQuizQuestion();
        };
        options.appendChild(btn);
    });
}

// ===== Game 8 =====
function startGame8() {
    hideAllScreens();
    document.getElementById('game8').style.display = 'block';

    const area = document.getElementById('bossArea');
    const timerEl = document.getElementById('bossTimer');
    const hitsEl = document.getElementById('bossHits');

    let timer = 20;
    let hits = 0;
    const target = 28;
    area.innerHTML = '';
    timerEl.textContent = String(timer);
    hitsEl.textContent = String(hits);

    const spawn = setInterval(() => {
        const t = document.createElement('button');
        t.className = 'boss-target';
        t.textContent = '🎯';
        t.style.left = `${Math.random() * Math.max(10, area.clientWidth - 48)}px`;
        t.style.top = `${Math.random() * Math.max(10, area.clientHeight - 48)}px`;
        t.onclick = () => {
            hits += 1;
            hitsEl.textContent = String(hits);
            t.remove();
        };
        area.appendChild(t);
        setTimeout(() => t.remove(), 760);
    }, 220);

    const tick = setInterval(() => {
        timer -= 1;
        timerEl.textContent = String(timer);
        if (timer <= 0) {
            clearIntervals([spawn, tick]);
            const passed = hits >= target;
            reward(passed ? 280 : 180, passed ? 'Финальная игра пройдена!' : 'Финальная игра завершена');
            nextGame(showMarket, 900);
        }
    }, 1000);
}

// ===== Puzzle Market =====
function showMarket() {
    hideAllScreens();
    document.getElementById('marketContainer').style.display = 'block';
    renderPuzzlePreview();
    renderPuzzleMarketItems();
    updateMarketDisplay();
}

function renderPuzzlePreview() {
    const preview = document.getElementById('puzzlePreview');
    preview.innerHTML = '';

    for (let i = 0; i < puzzlePieceCosts.length; i++) {
        const row = Math.floor(i / puzzleCols);
        const col = i % puzzleCols;
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.dataset.pieceId = String(i);
        piece.textContent = String(i + 1);
        applyPuzzleShape(piece, row, col);
        preview.appendChild(piece);
    }
}

function renderPuzzleMarketItems() {
    const market = document.getElementById('marketItems');
    market.innerHTML = '';

    puzzlePieceCosts.forEach((cost, i) => {
        const item = document.createElement('div');
        item.className = 'market-item';
        item.dataset.pieceId = String(i);
        item.innerHTML = `
            <span class="item-name">Часть ${i + 1}</span>
            <span class="item-cost">${cost} баллов</span>
            <button class="btn-market" onclick="buyPuzzlePart(${i})">Купить</button>
        `;
        market.appendChild(item);
    });
}

function buyPuzzlePart(pieceId) {
    if (purchasedPuzzlePieces.has(pieceId)) return;

    const cost = puzzlePieceCosts[pieceId];
    if (score < cost) {
        const item = document.querySelector(`.market-item[data-piece-id="${pieceId}"]`);
        if (item) {
            const warn = document.createElement('div');
            warn.className = 'insufficient-funds';
            warn.textContent = 'Недостаточно баллов';
            item.appendChild(warn);
            setTimeout(() => warn.remove(), 1500);
        }
        document.getElementById('playAgainMarket').style.display = 'inline-block';
        return;
    }

    score -= cost;
    purchasedPuzzlePieces.add(pieceId);
    updateScore();
    updateMarketDisplay();

    if (purchasedPuzzlePieces.size === puzzlePieceCosts.length) {
        revealCompletedPuzzle();
    }
}

function updateMarketDisplay() {
    for (let i = 0; i < puzzlePieceCosts.length; i++) {
        const piece = document.querySelector(`.puzzle-piece[data-piece-id="${i}"]`);
        const item = document.querySelector(`.market-item[data-piece-id="${i}"]`);
        const btn = item ? item.querySelector('.btn-market') : null;

        if (purchasedPuzzlePieces.has(i)) {
            if (piece) {
                piece.classList.add('unlocked');
                piece.textContent = '✓';
            }
            if (item) item.classList.add('purchased');
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Куплено';
            }
        }
    }
}

function revealCompletedPuzzle() {
    const preview = document.getElementById('puzzlePreview');
    const pieces = preview.querySelectorAll('.puzzle-piece');

    pieces.forEach((piece, i) => {
        const row = Math.floor(i / puzzleCols);
        const col = i % puzzleCols;
        piece.classList.add('revealed');
        piece.textContent = '';
        piece.style.backgroundImage = `url("${puzzleImageUrl}")`;
        piece.style.backgroundSize = `${puzzleCols * 100}% ${puzzleRows * 100}%`;
        piece.style.backgroundPosition = `${(col / (puzzleCols - 1)) * 100}% ${(row / (puzzleRows - 1)) * 100}%`;
    });

    const message = document.createElement('div');
    message.className = 'gift-message';
    message.textContent = 'Пазл собран. Фото открыто.';
    const exists = document.querySelector('#marketContainer .gift-message');
    if (!exists) {
        document.getElementById('marketContainer').prepend(message);
    }
}

function buildPuzzleEdges(rows, cols) {
    const edges = [];
    for (let r = 0; r < rows; r++) {
        edges[r] = [];
        for (let c = 0; c < cols; c++) {
            const top = r === 0 ? 0 : -edges[r - 1][c].bottom;
            const left = c === 0 ? 0 : -edges[r][c - 1].right;
            const right = c === cols - 1 ? 0 : ((r + c) % 2 === 0 ? 1 : -1);
            const bottom = r === rows - 1 ? 0 : ((r * 3 + c) % 2 === 0 ? -1 : 1);
            edges[r][c] = { top, right, bottom, left };
        }
    }
    return edges;
}

function applyPuzzleShape(piece, row, col) {
    const edge = puzzleEdges[row][col];
    const path = buildPuzzlePath(edge);
    piece.style.clipPath = `path('${path}')`;
    piece.style.webkitClipPath = `path('${path}')`;
}

function buildPuzzlePath(edge) {
    const tabOut = 6;
    const tabIn = 18;
    const curveStart = 35;
    const curveEnd = 65;

    const topY = edge.top === 1 ? tabOut : edge.top === -1 ? tabIn : 0;
    const rightX = edge.right === 1 ? 100 - tabOut : edge.right === -1 ? 100 - tabIn : 100;
    const bottomY = edge.bottom === 1 ? 100 - tabOut : edge.bottom === -1 ? 100 - tabIn : 100;
    const leftX = edge.left === 1 ? tabOut : edge.left === -1 ? tabIn : 0;

    return [
        'M 0 0',
        edge.top === 0
            ? 'L 100 0'
            : `L ${curveStart} 0 C 42 ${topY} 58 ${topY} ${curveEnd} 0 L 100 0`,
        edge.right === 0
            ? 'L 100 100'
            : `L 100 ${curveStart} C ${rightX} 42 ${rightX} 58 100 ${curveEnd} L 100 100`,
        edge.bottom === 0
            ? 'L 0 100'
            : `L ${curveEnd} 100 C 58 ${bottomY} 42 ${bottomY} ${curveStart} 100 L 0 100`,
        edge.left === 0
            ? 'L 0 0 Z'
            : `L 0 ${curveEnd} C ${leftX} 58 ${leftX} 42 0 ${curveStart} L 0 0 Z`
    ].join(' ');
}

function proceedFromMarket() {
    if (purchasedPuzzlePieces.size < puzzlePieceCosts.length) {
        alert('Сначала собери все 8 частей пазла');
        return;
    }
    hideAllScreens();
    document.getElementById('finalQuestion').style.display = 'block';
    resetFinalButtons();
}

function playAgain() {
    purchasedPuzzlePieces.clear();
    hideAllScreens();
    document.getElementById('playAgainMarket').style.display = 'none';
    score = 0;
    updateScore();
    resetFinalButtons();
    startGame1();
}

// ===== Final Buttons =====
let clickCount = 0;
let moveInterval = null;
const persuasionMessages = [
    'Точно нет?',
    'Подумай еще раз',
    'Может все-таки да?',
    'Я не сдаюсь',
    'Последняя попытка'
];

function moveButtonRandomly() {
    const noBtn = document.getElementById('noBtn');
    if (!noBtn) return;
    const maxX = window.innerWidth - 140;
    const maxY = window.innerHeight - 80;
    noBtn.style.left = `${Math.random() * maxX}px`;
    noBtn.style.top = `${Math.random() * maxY}px`;
}

function handleNo() {
    const noBtn = document.getElementById('noBtn');
    const response = document.querySelector('.final-question .response');
    clickCount += 1;

    if (clickCount === 1) {
        noBtn.classList.add('escaping');
        moveInterval = setInterval(moveButtonRandomly, 170);
    }

    response.textContent = persuasionMessages[Math.min(clickCount - 1, persuasionMessages.length - 1)];
}

function handleYes() {
    if (moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
    }
    const response = document.querySelector('.final-question .response');
    const yesBtn = document.querySelector('.btn-yes');
    const noBtn = document.getElementById('noBtn');

    yesBtn.disabled = true;
    noBtn.disabled = true;
    response.textContent = 'Ура! Спасибо за победу в испытании 💖';
    reward(100, 'Финал');
    createConfetti();
}

function resetFinalButtons() {
    if (moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
    }
    clickCount = 0;

    const yesBtn = document.querySelector('.btn-yes');
    const noBtn = document.getElementById('noBtn');
    const response = document.querySelector('.final-question .response');

    if (yesBtn) {
        yesBtn.disabled = false;
        yesBtn.style.pointerEvents = 'auto';
    }

    if (noBtn) {
        noBtn.disabled = false;
        noBtn.style.pointerEvents = 'auto';
        noBtn.classList.remove('escaping');
        noBtn.style.position = '';
        noBtn.style.left = '';
        noBtn.style.top = '';
    }

    if (response) {
        response.textContent = '';
    }
}

// ===== Effects =====
function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    const colors = ['#ff6b6b', '#ffd166', '#06d6a0', '#ef476f', '#118ab2'];

    for (let i = 0; i < 90; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.width = `${6 + Math.random() * 7}px`;
        confetti.style.height = confetti.style.width;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animation = `confetti-fall ${2.4 + Math.random() * 2.2}s linear forwards`;
        confettiContainer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4700);
    }
}

function createParticles(x, y, emoji) {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 5; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = emoji;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.fontSize = '18px';

        const angle = (Math.PI * 2 * i) / 5;
        const velocity = 80;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        const start = performance.now();

        function anim(ts) {
            const t = (ts - start) / 650;
            if (t >= 1) {
                p.remove();
                return;
            }
            p.style.left = `${x + vx * t}px`;
            p.style.top = `${y + vy * t}px`;
            p.style.opacity = String(1 - t);
            requestAnimationFrame(anim);
        }

        particlesContainer.appendChild(p);
        requestAnimationFrame(anim);
    }
}

function createStars() {
    const starsContainer = document.querySelector('.stars-background');
    if (!starsContainer) return;
    starsContainer.innerHTML = '';
    for (let i = 0; i < 40; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2.5}s`;
        starsContainer.appendChild(star);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const noBtn = document.getElementById('noBtn');
    if (noBtn) {
        noBtn.addEventListener('click', handleNo);
    }
});

window.addEventListener('load', () => {
    createStars();
    updateScore();
});
