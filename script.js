let score = 0;
let purchasedPuzzlePieces = new Set();
const specialGiftVideoUrl = 'gift.mp4';
const puzzleRows = 2;
const puzzleCols = 4;
const puzzleCellCount = puzzleRows * puzzleCols;
const puzzlePieceCosts = [100, 120, 145, 160, 180, 220, 250, 300];

const gameState = {
    game1: {},
    game2: {},
    game3: {},
    game4: {},
    game5: {},
    game6: {},
    game7: {},
    game8: {},
    game9: {},
    game10: {}
};

const gameIds = ['game1', 'game2', 'game3', 'game4', 'game5', 'game6', 'game7', 'game8', 'game9', 'game10'];
const totalGames = gameIds.length;
const completedGames = new Set();
const gameNames = {
    1: 'Игра 1',
    2: 'Игра 2',
    3: 'Игра 3',
    4: 'Игра 4',
    5: 'Игра 5',
    6: 'Игра 6',
    7: 'Игра 7',
    8: 'Игра 8',
    9: 'Игра 9',
    10: 'Игра 10'
};

function runGameCleanups() {
    Object.values(gameState).forEach((state) => {
        if (!state || typeof state.cleanup !== 'function') return;
        state.cleanup();
        state.cleanup = null;
    });
}

function areAllGamesCompleted() {
    return completedGames.size >= totalGames;
}

function hideAllScreens() {
    runGameCleanups();

    document.getElementById('mainContent').style.display = 'none';
    const selector = document.getElementById('gameSelector');
    if (selector) selector.style.display = 'none';
    document.getElementById('marketContainer').style.display = 'none';
    document.getElementById('finalQuestion').style.display = 'none';
    gameIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const paperOverlay = document.getElementById('game9LoveOverlay');
    if (paperOverlay) paperOverlay.classList.remove('show');

    const emojiStorm = document.getElementById('loveEmojiStorm');
    if (emojiStorm) {
        emojiStorm.classList.remove('show');
        emojiStorm.innerHTML = '';
    }
}

function updateScore() {
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = String(score);
}

function showPopup(message, type = 'info', duration = 1700) {
    let popup = document.getElementById('gamePopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'gamePopup';
        popup.className = 'game-popup';
        document.body.appendChild(popup);
    }

    popup.textContent = message;
    popup.className = `game-popup show ${type}`;

    if (popup.hideTimer) clearTimeout(popup.hideTimer);
    popup.hideTimer = setTimeout(() => {
        popup.classList.remove('show');
    }, duration);
}

function showPopupAndRun(message, type, action, duration = 1700, afterDelay = 120) {
    showPopup(message, type, duration);
    setTimeout(() => {
        if (typeof action === 'function') action();
    }, duration + afterDelay);
}

function showImagePopupAndRun(imageUrl, action, duration = 5000) {
    let overlay = document.getElementById('photoPopupOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'photoPopupOverlay';
        overlay.className = 'photo-popup-overlay';
        overlay.innerHTML = `
            <div class="photo-popup-card">
                <img id="photoPopupImage" alt="Нечто особенное" />
            </div>
        `;
        document.body.appendChild(overlay);
    }

    const img = document.getElementById('photoPopupImage');
    img.src = imageUrl;
    overlay.classList.add('show');

    if (overlay.hideTimer) clearTimeout(overlay.hideTimer);
    overlay.hideTimer = setTimeout(() => {
        overlay.classList.remove('show');
        if (typeof action === 'function') action();
    }, duration);
}

function reward(points, text) {
    score += points;
    updateScore();
    if (text) showPopup(`${text} +${points} баллов`, 'success');
}

function startGames() {
    showGameSelector();
}

function updateGameSelectorButtons() {
    const buttons = document.querySelectorAll('.game-select-card[data-game-id]');
    buttons.forEach((btn) => {
        const id = Number(btn.dataset.gameId);
        const done = completedGames.has(id);
        btn.classList.toggle('done', done);
    });

    const openSecretBtn = document.getElementById('openSecretBtn');
    if (openSecretBtn) {
        const left = Math.max(0, totalGames - completedGames.size);
        openSecretBtn.disabled = left > 0;
        openSecretBtn.textContent = left > 0
            ? `Секретный подарок (${left} игр осталось)`
            : 'Открыть секретный подарок';
    }
}

function showGameSelector(message = '') {
    hideAllScreens();
    const selector = document.getElementById('gameSelector');
    if (selector) selector.style.display = 'block';

    const messageEl = document.getElementById('gameSelectMessage');
    if (messageEl) messageEl.textContent = message;
    updateGameSelectorButtons();
}

function openSecretGift() {
    if (!areAllGamesCompleted()) {
        const left = Math.max(0, totalGames - completedGames.size);
        showPopup(`Сначала пройди все игры. Осталось: ${left}`, 'warn');
        return;
    }
    showMarket();
}

function openMarketForTest() {
    score = 5000;
    updateScore();
    showPopup('Тестовый режим: баланс 5000', 'info', 1200);
    showMarket();
}

function ensureSwitchGameButtons() {
    gameIds.forEach((id) => {
        const container = document.getElementById(id);
        if (!container) return;
        if (container.querySelector('.switch-game-wrap')) return;

        const wrap = document.createElement('div');
        wrap.className = 'switch-game-wrap';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-small switch-game-btn';
        btn.textContent = 'Выбрать другую игру';
        btn.onclick = () => showGameSelector('Выбери игру для продолжения');

        wrap.appendChild(btn);
        container.appendChild(wrap);
    });
}

function startSelectedGame(gameNumber) {
    const gameMap = {
        1: startGame1,
        2: startGame2,
        3: startGame3,
        4: startGame4,
        5: startGame5,
        6: startGame6,
        7: startGame7,
        8: startGame8,
        9: startGame9,
        10: startGame10
    };

    const handler = gameMap[gameNumber];
    if (typeof handler !== 'function') return;
    handler();
}

function completeGame(gameNumber, points, label = '') {
    const title = label || gameNames[gameNumber] || `Игра ${gameNumber}`;

    completedGames.add(gameNumber);
    score += points;
    updateScore();
    updateGameSelectorButtons();
    const allDone = areAllGamesCompleted();
    const message = allDone
        ? `Поздравляем! ${title} пройдена. Заработано ${points} баллов. Все игры закрыты: можно открыть секретный подарок.`
        : `Поздравляем! ${title} пройдена. Заработано ${points} баллов.`;

    showPopupAndRun(
        `${title} пройдена! +${points} баллов`,
        'success',
        () => showGameSelector(message),
        1200,
        80
    );
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
    const livesEl = document.getElementById('game1Lives');

    area.innerHTML = '';
    let timer = 25;
    let caught = 0;
    let lives = 3;
    const target = 32;
    const bombPenalty = 30;
    let ended = false;

    timerEl.textContent = String(timer);
    caughtEl.textContent = String(caught);
    livesEl.textContent = String(lives);

    const spawn = setInterval(() => {
        if (ended) return;
        const heart = document.createElement('div');
        heart.className = 'falling-heart';
        const isBomb = Math.random() < 0.40;
        heart.textContent = isBomb ? '💣' : (Math.random() > 0.45 ? '💖' : '💘');
        heart.style.left = `${Math.random() * Math.max(10, area.clientWidth - 46)}px`;
        heart.style.animationDuration = `${0.55 + Math.random() * 0.35}s`;

        heart.onclick = (e) => {
            if (ended) return;
            e.stopPropagation();
            if (isBomb) {
                lives -= 1;
                livesEl.textContent = String(lives);
                score = Math.max(0, score - bombPenalty);
                updateScore();
                heart.remove();
                createParticles(e.clientX, e.clientY, '💥');

                if (lives <= 0) {
                    ended = true;
                    clearIntervals([spawn, tick]);
                    showPopupAndRun(
                        'Ты потерял все жизни. Переигрываем 1 уровень.',
                        'warn',
                        () => nextGame(startGame1, 0)
                    );
                }
                return;
            }

            caught += 1;
            caughtEl.textContent = String(caught);
            heart.remove();
            createParticles(e.clientX, e.clientY, '✨');

            if (caught >= target) {
                ended = true;
                clearIntervals([spawn, tick]);
                completeGame(1, 260, 'Игра 1');
            }
        };

        area.appendChild(heart);
        setTimeout(() => heart.remove(), 1250);
    }, 230);

    const tick = setInterval(() => {
        timer -= 1;
        timerEl.textContent = String(timer);
        if (timer <= 0) {
            if (ended) return;
            ended = true;
            clearIntervals([spawn, tick]);
            if (caught >= target) {
                showPopup('Отлично, уровень пройден!', 'success');
                completeGame(1, 260, 'Игра 1');
            } else {
                showPopupAndRun(
                    'Время вышло. Чтобы пройти дальше, нужно поймать 32 сердца. Переигрываем уровень.',
                    'warn',
                    () => nextGame(startGame1, 0),
                    1700,
                    120
                );
            }
        }
    }, 1000);

    gameState.game1 = {
        cleanup: () => {
            ended = true;
            clearIntervals([spawn, tick]);
        }
    };
}

// ===== Game 2 =====
function startGame2() {
    hideAllScreens();
    document.getElementById('game2').style.display = 'block';

    const board = document.getElementById('game2Board');
    const timerEl = document.getElementById('game2Timer');
    const hitsEl = document.getElementById('game2Hits');

    let timer = 28;
    let hits = 0;
    const targetHits = 18;
    timerEl.textContent = String(timer);
    hitsEl.textContent = String(hits);

    function renderBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const btn = document.createElement('button');
            btn.className = 'target-cell';
            const good = Math.random() < 0.50;
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
    const rerender = setInterval(renderBoard, 1200);
    const tick = setInterval(() => {
        timer -= 1;
        timerEl.textContent = String(timer);
        if (timer <= 0) {
            clearIntervals([rerender, tick]);
            const passed = hits >= targetHits;
            if (passed) {
                completeGame(2, 210, 'Игра 2');
            } else {
                showPopupAndRun(
                    `Игра 2 не пройдена. Нужно минимум ${targetHits} попаданий.`,
                    'warn',
                    () => nextGame(startGame2, 0)
                );
            }
        }
    }, 1000);

    gameState.game2 = {
        cleanup: () => {
            clearIntervals([rerender, tick]);
        }
    };
}

// ===== Game 3 =====
const memoryEmojis = ['⚡', '🌙', '⭐', '🎵', '💎'];
const memoryLevelTarget = 10;
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
    let seqInterval = null;
    let seqDelay = null;

    function renderSequenceDisplay(stepText, symbol = '', entered = [], total = sequence.length) {
        const safeTotal = Math.max(0, total);
        const progress = Array.from({ length: safeTotal }, (_, idx) => {
            const value = entered[idx] || '';
            return `<span class="seq-input-item ${value ? 'filled' : ''}">${value || '·'}</span>`;
        }).join('');

        display.innerHTML = `
            <span class="seq-step">${stepText}</span>
            <span class="seq-symbol ${symbol ? 'seq-show' : ''}">${symbol || '&nbsp;'}</span>
            <span class="seq-input">${progress}</span>
        `;
    }

    buttons.innerHTML = '';
    memoryEmojis.forEach((emoji) => {
        const btn = document.createElement('button');
        btn.className = 'memory-btn';
        btn.textContent = emoji;
        btn.onclick = () => {
            if (!allowInput) return;
            input.push(emoji);
            renderSequenceDisplay(`Повтори последовательность ${input.length}/${sequence.length}`, '', input, sequence.length);
            const idx = input.length - 1;
            if (input[idx] !== sequence[idx]) {
                allowInput = false;
                info.textContent = `Ошибка на уровне ${level}`;
                renderSequenceDisplay(`Ошибка на уровне ${level}`, '', input, sequence.length);
                showPopupAndRun(
                    'Игра 3 не пройдена идеально. Повторяем уровень.',
                    'warn',
                    () => nextGame(startGame3, 0)
                );
                return;
            }

            if (input.length === sequence.length) {
                if (sequence.length >= memoryLevelTarget) {
                    allowInput = false;
                    info.textContent = 'Идеально!';
                    renderSequenceDisplay('Идеально!', '', input, sequence.length);
                    completeGame(3, 240, 'Игра 3');
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
        renderSequenceDisplay(`Уровень ${level}/${memoryLevelTarget}: запоминай`, '', [], sequence.length);
        seqInterval = setInterval(() => {
            renderSequenceDisplay(`Шаг ${i + 1}/${sequence.length}`, sequence[i], [], sequence.length);
            i += 1;
            if (i >= sequence.length) {
                clearInterval(seqInterval);
                seqInterval = null;
                seqDelay = setTimeout(() => {
                    renderSequenceDisplay('Повтори последовательность', '', [], sequence.length);
                    allowInput = true;
                }, 350);
            }
        }, 720);
    }

    function nextRound() {
        level += 1;
        input = [];
        sequence.push(memoryEmojis[Math.floor(Math.random() * memoryEmojis.length)]);
        info.textContent = `Уровень ${level}/${memoryLevelTarget}`;
        showSequence();
    }

    nextRound();

    gameState.game3 = {
        cleanup: () => {
            allowInput = false;
            if (seqInterval) clearInterval(seqInterval);
            if (seqDelay) clearTimeout(seqDelay);
        }
    };
}

// ===== Game 4 =====
const typingPhrases = [
    { prompt: 'архитектура надежного интерфейса требует дисциплины и внимания к деталям', answer: 'архитектура надежного интерфейса требует дисциплины и внимания к деталям' },
    { prompt: 'пепе вата шнене шнене вата вата шнене пепе вата фааа', answer: 'пепе вата шнене шнене вата вата шнене пепе вата фааа' },
    { prompt: 'оптимизация производительности важна даже для небольших интерактивных проектов', answer: 'оптимизация производительности важна даже для небольших интерактивных проектов' },
    { prompt: 'последовательное тестирование сценариев предотвращает скрытые регрессии', answer: 'последовательное тестирование сценариев предотвращает скрытые регрессии' },
    { prompt: 'комплексные пользовательские потоки нужно валидировать на мобильных устройствах', answer: 'комплексные пользовательские потоки нужно валидировать на мобильных устройствах' }
];
const fixedTypingTask = {
    prompt: 'Дополни фразу : Я тебя очень сильно Л****',
    answer: 'Я тебя очень сильно люблю'
};

function startGame4() {
    hideAllScreens();
    document.getElementById('game4').style.display = 'block';

    const targetEl = document.getElementById('typeTarget');
    const inputEl = document.getElementById('typeInput');
    const timerEl = document.getElementById('typeTimer');
    const progressEl = document.getElementById('typeProgress');
    const info = document.getElementById('typeInfo');

    const randomThree = typingPhrases.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    const list = [...randomThree, fixedTypingTask];
    let done = 0;

    gameState.game4 = {
        list,
        done,
        active: 0,
        ended: false,
        phraseTime: 60,
        cleanup: () => {
            const current = gameState.game4;
            if (!current) return;
            current.ended = true;
            clearIntervals([current.tick]);
        }
    };

    inputEl.value = '';
    targetEl.textContent = list[0].prompt;
    progressEl.textContent = String(done);
    timerEl.textContent = String(gameState.game4.phraseTime);
    info.textContent = '';
    inputEl.focus();

    startGame4PhraseTimer();
}

function startGame4PhraseTimer() {
    const state = gameState.game4;
    if (!state || state.ended) return;

    const timerEl = document.getElementById('typeTimer');
    clearIntervals([state.tick]);
    timerEl.textContent = String(state.phraseTime);

    state.tick = setInterval(() => {
        state.phraseTime -= 1;
        timerEl.textContent = String(state.phraseTime);
        if (state.phraseTime <= 0) {
            finishGame4(false);
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
    const task = state.list[state.active];
    const needed = task.answer.trim().toLowerCase();

    if (typed === needed) {
        state.done += 1;
        state.active += 1;
        progressEl.textContent = String(state.done);
        inputEl.value = '';
        info.textContent = 'Точно!';
        if (state.done >= 4) {
            finishGame4(true, task === fixedTypingTask);
            return;
        }
        state.phraseTime = 60;
        targetEl.textContent = state.list[state.active].prompt;
        startGame4PhraseTimer();
    } else {
        info.textContent = 'Есть ошибка, попробуй снова';
    }
}

function finishGame4(forceWin = false, showPhoto = false) {
    const state = gameState.game4;
    if (!state || state.ended) return;
    state.ended = true;
    clearIntervals([state.tick]);

    const done = state.done;
    const passed = forceWin || done >= 4;
    if (passed) {
        if (showPhoto) {
            showImagePopupAndRun('photo1.png', () => completeGame(4, 230, 'Игра 4'), 5000);
        } else {
            completeGame(4, 230, 'Игра 4');
        }
    } else {
        showPopupAndRun(
            'Игра 4 не пройдена идеально. Повторяем уровень.',
            'warn',
            () => nextGame(startGame4, 0)
        );
    }
}

// ===== Game 5 =====
const game5Config = {
    maxMistakes: 5,
    rounds: [
        ['Медина', 'я', 'тебя', 'люблю'],
        ['Ты', 'мой', 'самый', 'светлый', 'день'],
        ['С', 'тобой', 'все', 'становится', 'теплее'],
        ['Жаным', 'ты', 'моя', 'радость']
    ],
    decoyWords: ['нежность', 'улыбка', 'счастье', 'весна', 'мечта', 'поцелуй', 'звезды']
};

function startGame5() {
    hideAllScreens();
    document.getElementById('game5').style.display = 'block';

    gameState.game5 = {
        round: 0,
        mistakes: 0,
        progress: [],
        locked: false,
        ended: false,
        cleanup: () => {
            const current = gameState.game5;
            if (!current) return;
            current.ended = true;
            current.locked = true;
        }
    };

    updateGame5PhraseStats();
    renderGame5PhraseRound();
}

function updateGame5PhraseStats() {
    const state = gameState.game5;
    if (!state) return;

    const levelEl = document.getElementById('game5Level');
    const mistakesEl = document.getElementById('game5Mistakes');
    if (levelEl) levelEl.textContent = String(Math.min(game5Config.rounds.length, state.round + 1));
    if (mistakesEl) mistakesEl.textContent = String(state.mistakes);
}

function updateGame5PhraseTarget() {
    const state = gameState.game5;
    const targetEl = document.getElementById('game5Target');
    if (!state || !targetEl) return;

    const built = state.progress.join(' ');
    targetEl.textContent = built ? `Собрано: ${built}` : 'Собрано: ...';
}

function getGame5RoundWords(phrase) {
    const words = phrase.slice();
    const decoyPool = game5Config.decoyWords.filter((word) => !words.includes(word));
    const decoy = decoyPool[Math.floor(Math.random() * decoyPool.length)];
    words.push(decoy);
    return shuffleArray(words);
}

function renderGame5PhraseRound() {
    const state = gameState.game5;
    const board = document.getElementById('game5WordBoard');
    const info = document.getElementById('game5Info');
    if (!state || state.ended || !board) return;

    const phrase = game5Config.rounds[state.round];
    state.progress = [];
    state.locked = false;

    board.innerHTML = '';
    const wordPool = getGame5RoundWords(phrase);
    wordPool.forEach((word) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'word-chip';
        chip.textContent = word;
        chip.onclick = () => handleGame5WordClick(word, chip);
        board.appendChild(chip);
    });

    updateGame5PhraseTarget();
    updateGame5PhraseStats();
    if (info) {
        info.textContent = `Уровень ${state.round + 1}: собери фразу по порядку`;
    }
}

function handleGame5WordClick(word, chipEl) {
    const state = gameState.game5;
    const info = document.getElementById('game5Info');
    if (!state || state.ended || state.locked) return;

    const phrase = game5Config.rounds[state.round];
    const expectedWord = phrase[state.progress.length];
    if (word === expectedWord) {
        state.progress.push(word);
        if (chipEl) {
            chipEl.disabled = true;
            chipEl.classList.add('correct');
        }
        updateGame5PhraseTarget();

        if (state.progress.length >= phrase.length) {
            state.round += 1;
            if (state.round >= game5Config.rounds.length) {
                state.ended = true;
                completeGame(5, 260, 'Игра 5');
                return;
            }

            state.locked = true;
            if (info) info.textContent = 'Отлично! Следующая фраза...';
            updateGame5PhraseStats();

            setTimeout(() => {
                const current = gameState.game5;
                if (!current || current.ended) return;
                renderGame5PhraseRound();
            }, 550);
            return;
        }

        if (info) info.textContent = 'Верно, продолжай!';
        return;
    }

    state.mistakes += 1;
    updateGame5PhraseStats();
    if (chipEl) {
        chipEl.disabled = true;
        chipEl.classList.add('wrong');
    }
    if (info) {
        info.textContent = `Немного не то. Осталось ошибок: ${Math.max(0, game5Config.maxMistakes - state.mistakes)}`;
    }

    if (state.mistakes >= game5Config.maxMistakes) {
        state.ended = true;
        showPopupAndRun(
            'Игра 5 не пройдена. Слишком много ошибок, переигрываем уровень.',
            'warn',
            () => nextGame(startGame5, 0)
        );
    }
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

    gameState.game6 = {
        order,
        input: [],
        ended: false,
        unlocked: false,
        replaying: false,
        cleanup: () => {
            const current = gameState.game6;
            if (!current) return;
            current.ended = true;
            current.unlocked = false;
            current.replaying = false;
        }
    };

    grid.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const btn = document.createElement('button');
        btn.className = 'pattern-cell';
        btn.textContent = '';
        btn.onclick = () => {
            const state = gameState.game6;
            if (!state || !state.unlocked || state.ended || state.replaying) return;
            state.input.push(i);
            btn.classList.add('active');

            const idx = state.input.length - 1;
            if (state.input[idx] !== state.order[idx]) {
                state.ended = true;
                info.textContent = 'Маршрут нарушен';
                showPopupAndRun(
                    'Игра 6 не пройдена идеально. Повторяем уровень.',
                    'warn',
                    () => nextGame(startGame6, 0)
                );
                return;
            }

            if (state.input.length === state.order.length) {
                state.ended = true;
                info.textContent = 'Маршрут повторен';
                completeGame(6, 250, 'Игра 6');
            }
        };
        grid.appendChild(btn);
    }

    showGame6Route();
}

function showGame6Route() {
    const state = gameState.game6;
    if (!state || state.ended || state.replaying) return;

    const show = document.getElementById('patternShow');
    const grid = document.getElementById('patternGrid');
    const info = document.getElementById('patternInfo');
    const cells = grid.querySelectorAll('.pattern-cell');

    state.replaying = true;
    state.unlocked = false;
    state.input = [];

    cells.forEach((c) => c.classList.remove('show', 'active'));
    show.textContent = `Маршрут длиной ${state.order.length}`;
    info.textContent = 'Смотри маршрут';

    let pointer = 0;
    const showInterval = setInterval(() => {
        cells.forEach((c) => c.classList.remove('show'));
        cells[state.order[pointer]].classList.add('show');
        pointer += 1;
        if (pointer >= state.order.length) {
            clearInterval(showInterval);
            setTimeout(() => {
                cells.forEach((c) => c.classList.remove('show'));
                state.replaying = false;
                state.unlocked = true;
                show.textContent = 'Теперь повтори маршрут';
                info.textContent = 'Кликай клетки в правильном порядке';
            }, 450);
        }
    }, 540);
}

function replayGame6Route() {
    const state = gameState.game6;
    if (!state || state.ended) return;
    showGame6Route();
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

    gameState.game7 = { idx: 0, correct: 0, cleanup: () => {} };
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const state = gameState.game7;
    const qEl = document.getElementById('quizQuestion');
    const options = document.getElementById('quizOptions');
    const progress = document.getElementById('quizProgress');

    if (state.idx >= quizData.length) {
        const passed = state.correct === quizData.length;
        if (passed) {
            completeGame(7, 260, 'Игра 7');
        } else {
            showPopupAndRun(
                'Игра 7 не пройдена идеально. Нужны все правильные ответы.',
                'warn',
                () => nextGame(startGame7, 0)
            );
        }
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
            if (passed) {
                completeGame(8, 280, 'Игра 8');
            } else {
                showPopupAndRun(
                    'Игра 8 не пройдена идеально. Повторяем уровень.',
                    'warn',
                    () => nextGame(startGame8, 0)
                );
            }
        }
    }, 1000);

    gameState.game8 = {
        cleanup: () => {
            clearIntervals([spawn, tick]);
        }
    };
}

// ===== Shared Helpers =====
function shuffleArray(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function normalizeAngle(angle) {
    let value = angle % 360;
    if (value < 0) value += 360;
    return value;
}

function angularDistance(a, b) {
    const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
    return Math.min(diff, 360 - diff);
}

// ===== Game 9 =====
const game9PairSymbols = ['🍓', '🍇', '🍋', '🍒', '🍍', '🥝', '🌸', '⭐', '🎀', '💍', '🎵', '💡'];
const game9BonusCard = '🎁';
const game9PairTarget = 12;
const game9PreviewDuration = 15;
const game9StartLives = 10;
let game9LoveAcknowledgeHandler = null;

function ensureGame9LoveOverlay() {
    let overlay = document.getElementById('game9LoveOverlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'game9LoveOverlay';
    overlay.className = 'game9-love-overlay';
    overlay.innerHTML = `
        <div class="game9-love-paper">
            <div class="game9-love-paper-inner">
                <p class="game9-love-text">Я тебя люблю</p>
                <button type="button" class="btn btn-small game9-love-btn" id="game9LoveAckBtn">Я знаю</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const ackBtn = overlay.querySelector('#game9LoveAckBtn');
    if (ackBtn) {
        ackBtn.addEventListener('click', () => {
            if (typeof game9LoveAcknowledgeHandler === 'function') {
                game9LoveAcknowledgeHandler();
            }
        });
    }

    return overlay;
}

function hideGame9LoveOverlay() {
    const overlay = document.getElementById('game9LoveOverlay');
    if (!overlay) return;
    overlay.classList.remove('show');
}

function createLoveEmojiStorm(duration = 2600) {
    let layer = document.getElementById('loveEmojiStorm');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'loveEmojiStorm';
        layer.className = 'love-emoji-storm';
        document.body.appendChild(layer);
    }

    layer.innerHTML = '';
    layer.classList.add('show');

    const emojis = ['❤️', '💖', '💘', '💕', '💞', '🎆', '🎇', '✨', '🥰', '😍'];
    const total = 180;
    const w = Math.max(window.innerWidth, 320);
    const h = Math.max(window.innerHeight, 320);

    for (let i = 0; i < total; i++) {
        const node = document.createElement('span');
        node.className = 'love-emoji';
        node.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        const side = i % 4;
        let startX = 0;
        let startY = 0;
        let dx = 0;
        let dy = 0;

        if (side === 0) {
            startX = Math.random() * w;
            startY = -26;
            dx = (Math.random() - 0.5) * 180;
            dy = h + 80 + Math.random() * 120;
        } else if (side === 1) {
            startX = w + 26;
            startY = Math.random() * h;
            dx = -(w + 80 + Math.random() * 120);
            dy = (Math.random() - 0.5) * 200;
        } else if (side === 2) {
            startX = Math.random() * w;
            startY = h + 26;
            dx = (Math.random() - 0.5) * 180;
            dy = -(h + 80 + Math.random() * 120);
        } else {
            startX = -26;
            startY = Math.random() * h;
            dx = w + 80 + Math.random() * 120;
            dy = (Math.random() - 0.5) * 200;
        }

        node.style.left = `${startX}px`;
        node.style.top = `${startY}px`;
        node.style.fontSize = `${18 + Math.random() * 18}px`;
        node.style.setProperty('--dx', `${dx}px`);
        node.style.setProperty('--dy', `${dy}px`);
        node.style.animationDelay = `${Math.random() * 0.65}s`;
        node.style.animationDuration = `${1.8 + Math.random() * 1.8}s`;
        layer.appendChild(node);
    }

    setTimeout(() => {
        const currentLayer = document.getElementById('loveEmojiStorm');
        if (!currentLayer) return;
        currentLayer.classList.remove('show');
        currentLayer.innerHTML = '';
    }, duration + 1200);
}

function triggerGame9BonusSequence() {
    const state = gameState.game9;
    const info = document.getElementById('game9Info');
    if (!state || state.ended || state.bonusActivated) return;

    state.bonusActivated = true;
    state.locked = true;
    state.firstPick = -1;
    if (state.flipBackTimeout) {
        clearTimeout(state.flipBackTimeout);
        state.flipBackTimeout = null;
    }

    if (info) info.textContent = 'Секретная записка для Медины';
    renderGame9Grid();

    const overlay = ensureGame9LoveOverlay();
    if (!overlay) return;

    game9LoveAcknowledgeHandler = () => {
        const ackBtn = document.getElementById('game9LoveAckBtn');
        if (ackBtn) ackBtn.disabled = true;

        createLoveEmojiStorm(2600);

        setTimeout(() => {
            hideGame9LoveOverlay();
            if (ackBtn) ackBtn.disabled = false;
            game9LoveAcknowledgeHandler = null;
            const current = gameState.game9;
            if (!current || current.ended) return;
            current.locked = false;
            if (info) info.textContent = 'Секрет открыт. Продолжай искать пары.';
            renderGame9Grid();
        }, 2600);
    };

    overlay.classList.add('show');
}

function startGame9() {
    const prev = gameState.game9;
    if (prev && prev.previewTick) clearInterval(prev.previewTick);
    if (prev && prev.flipBackTimeout) clearTimeout(prev.flipBackTimeout);

    hideAllScreens();
    document.getElementById('game9').style.display = 'block';

    const cards = [];
    game9PairSymbols.forEach((symbol) => {
        cards.push({ symbol, matched: false, revealed: true, bonus: false });
        cards.push({ symbol, matched: false, revealed: true, bonus: false });
    });
    cards.push({ symbol: game9BonusCard, matched: false, revealed: true, bonus: true });

    gameState.game9 = {
        cards: shuffleArray(cards),
        previewLeft: game9PreviewDuration,
        lives: game9StartLives,
        pairs: 0,
        firstPick: -1,
        locked: true,
        ended: false,
        bonusActivated: false,
        previewTick: null,
        flipBackTimeout: null,
        cleanup: () => {
            const current = gameState.game9;
            if (!current) return;
            current.ended = true;
            current.locked = true;
            if (current.previewTick) clearInterval(current.previewTick);
            if (current.flipBackTimeout) clearTimeout(current.flipBackTimeout);
        }
    };

    updateGame9Stats();
    renderGame9Grid();
    const info = document.getElementById('game9Info');
    if (info) info.textContent = 'Запоминай раскладку: 15 секунд';

    const previewEl = document.getElementById('game9PreviewTimer');
    const state = gameState.game9;
    state.previewTick = setInterval(() => {
        const current = gameState.game9;
        if (!current || current.ended) return;

        current.previewLeft -= 1;
        if (previewEl) previewEl.textContent = String(Math.max(0, current.previewLeft));

        if (current.previewLeft <= 0) {
            clearInterval(current.previewTick);
            current.previewTick = null;
            current.locked = false;
            current.cards.forEach((card) => {
                if (!card.matched) card.revealed = false;
            });
            renderGame9Grid();
            if (info) info.textContent = 'Открывай пары. Если найдешь бонус, откроется секрет.';
        }
    }, 1000);
}

function updateGame9Stats() {
    const state = gameState.game9;
    if (!state) return;

    const previewEl = document.getElementById('game9PreviewTimer');
    const livesEl = document.getElementById('game9Lives');
    const pairsEl = document.getElementById('game9Pairs');

    if (previewEl) previewEl.textContent = String(Math.max(0, state.previewLeft));
    if (livesEl) livesEl.textContent = String(state.lives);
    if (pairsEl) pairsEl.textContent = String(state.pairs);
}

function renderGame9Grid() {
    const state = gameState.game9;
    const grid = document.getElementById('game9Grid');
    if (!state || !grid) return;

    grid.innerHTML = '';
    state.cards.forEach((card, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'logic-card';

        const opened = card.revealed || card.matched;
        if (opened) btn.classList.add('is-open');
        if (card.matched) btn.classList.add('is-matched');
        if (card.bonus) btn.classList.add('is-bonus');

        btn.textContent = opened ? card.symbol : '?';
        btn.disabled = state.locked || card.matched;
        btn.onclick = () => pickGame9Card(index);
        grid.appendChild(btn);
    });
}

function pickGame9Card(index) {
    const state = gameState.game9;
    const info = document.getElementById('game9Info');
    if (!state || state.ended || state.locked) return;

    const card = state.cards[index];
    if (!card || card.matched || card.revealed) return;

    card.revealed = true;
    renderGame9Grid();

    if (card.bonus) {
        card.matched = true;
        renderGame9Grid();
        if (info) info.textContent = 'Бонусная карта открыта';
        triggerGame9BonusSequence();
        return;
    }

    if (state.firstPick < 0) {
        state.firstPick = index;
        if (info) info.textContent = 'Выбери вторую карту';
        return;
    }

    const firstIndex = state.firstPick;
    const firstCard = state.cards[firstIndex];
    state.firstPick = -1;

    if (firstCard.symbol === card.symbol) {
        firstCard.matched = true;
        card.matched = true;
        state.pairs += 1;
        updateGame9Stats();
        renderGame9Grid();
        if (info) info.textContent = `Пара найдена: ${state.pairs}/${game9PairTarget}`;

        if (state.pairs >= game9PairTarget) {
            state.ended = true;
            if (state.previewTick) clearInterval(state.previewTick);
            completeGame(9, 320, 'Игра 9');
        }
        return;
    }

    state.lives -= 1;
    updateGame9Stats();

    if (state.lives <= 0) {
        state.ended = true;
        state.locked = true;
        renderGame9Grid();
        showPopupAndRun(
            'Игра 9 проиграна. Запускаем заново с новой раскладкой.',
            'warn',
            () => nextGame(startGame9, 0)
        );
        return;
    }

    state.locked = true;
    const secondIndex = index;
    if (info) info.textContent = `Не совпало. Жизней осталось: ${state.lives}`;
    state.flipBackTimeout = setTimeout(() => {
        const current = gameState.game9;
        if (!current || current.ended) return;
        current.cards[firstIndex].revealed = false;
        current.cards[secondIndex].revealed = false;
        current.locked = false;
        renderGame9Grid();
    }, 520);
}

// ===== Game 10 =====
const game10Levels = [
    { minSpeed: 1.7, maxSpeed: 2.3 },
    { minSpeed: 2.5, maxSpeed: 3.3 },
    { minSpeed: 3.4, maxSpeed: 4.4 }
];
const game10HitsPerLevel = 10;
const game10StartLives = 3;
const game10CollisionAngle = 16;
const game10HitSpeedGain = 0.14;
const game10ExtraSpeedCap = 1.6;

function generateGame10Sticks(count, minGap = 34) {
    const result = [];
    let attempts = 0;
    while (result.length < count && attempts < 400) {
        const candidate = Math.random() * 360;
        if (result.every((angle) => angularDistance(angle, candidate) >= minGap)) {
            result.push(candidate);
        }
        attempts += 1;
    }
    return result;
}

function startGame10() {
    const prev = gameState.game10;
    if (prev && prev.rafId) cancelAnimationFrame(prev.rafId);
    if (prev && prev.failTimeout) clearTimeout(prev.failTimeout);

    hideAllScreens();
    document.getElementById('game10').style.display = 'block';

    gameState.game10 = {
        level: 1,
        levelHits: 0,
        lives: game10StartLives,
        wheelAngle: Math.random() * 360,
        speed: 0,
        speedDirection: 1,
        levelMaxSpeed: 0,
        stuckAngles: [],
        ended: false,
        lockThrow: false,
        rafId: null,
        lastTs: 0,
        failTimeout: null,
        cleanup: () => {
            const current = gameState.game10;
            if (!current) return;
            current.ended = true;
            if (current.rafId) cancelAnimationFrame(current.rafId);
            if (current.failTimeout) clearTimeout(current.failTimeout);
        }
    };

    setupGame10Level(1, true);
    const info = document.getElementById('game10Info');
    if (info) info.textContent = 'Уровень 1: попади 10 из 10';
    runGame10Loop();
}

function setupGame10Level(level, resetLives = true) {
    const state = gameState.game10;
    if (!state) return;

    const cfg = game10Levels[Math.max(0, Math.min(game10Levels.length - 1, level - 1))];
    const direction = Math.random() > 0.5 ? 1 : -1;
    const baseSpeed = cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed);

    state.level = level;
    state.levelHits = 0;
    state.stuckAngles = [];
    state.wheelAngle = Math.random() * 360;
    state.speedDirection = direction;
    state.speed = baseSpeed * direction;
    state.levelMaxSpeed = cfg.maxSpeed + game10ExtraSpeedCap;
    state.lastTs = 0;
    state.lockThrow = false;
    if (resetLives) state.lives = game10StartLives;

    renderGame10Sticks();
    updateGame10WheelRotation();
    updateGame10Stats();
}

function updateGame10Stats() {
    const state = gameState.game10;
    if (!state) return;
    const levelEl = document.getElementById('game10Level');
    const hitsEl = document.getElementById('game10Hits');
    const livesEl = document.getElementById('game10Lives');
    if (levelEl) levelEl.textContent = String(state.level);
    if (hitsEl) hitsEl.textContent = String(state.levelHits);
    if (livesEl) livesEl.textContent = String(state.lives);
    updateGame10ReadyKnife();
}

function updateGame10ReadyKnife() {
    const state = gameState.game10;
    const readyKnife = document.getElementById('game10ReadyKnife');
    if (!readyKnife || !state) return;
    const visible = !state.ended && state.levelHits < game10HitsPerLevel;
    readyKnife.classList.toggle('hidden', !visible);
}

function animateGame10ReadyKnife() {
    const readyKnife = document.getElementById('game10ReadyKnife');
    if (!readyKnife || readyKnife.classList.contains('hidden')) return;
    readyKnife.classList.remove('throwing');
    void readyKnife.offsetWidth;
    readyKnife.classList.add('throwing');
    setTimeout(() => {
        const node = document.getElementById('game10ReadyKnife');
        if (node) node.classList.remove('throwing');
    }, 190);
}

function updateGame10WheelRotation() {
    const state = gameState.game10;
    const wheel = document.getElementById('knifeWheel');
    if (!state || !wheel) return;
    wheel.style.transform = `rotate(${state.wheelAngle}deg)`;
}

function renderGame10Sticks() {
    const state = gameState.game10;
    const sticks = document.getElementById('knifeSticks');
    if (!state || !sticks) return;

    sticks.innerHTML = '';
    const radius = 94;
    state.stuckAngles.forEach((angle) => {
        const knife = document.createElement('span');
        knife.className = 'wheel-knife';
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        knife.style.left = `calc(50% + ${x}px)`;
        knife.style.top = `calc(50% + ${y}px)`;
        knife.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
        sticks.appendChild(knife);
    });
}

function runGame10Loop() {
    const tick = (ts) => {
        const state = gameState.game10;
        if (!state || state.ended) return;

        if (!state.lastTs) state.lastTs = ts;
        const dt = Math.min(36, ts - state.lastTs);
        state.lastTs = ts;
        state.wheelAngle += state.speed * (dt / 16.666);
        updateGame10WheelRotation();

        state.rafId = requestAnimationFrame(tick);
    };

    const state = gameState.game10;
    if (!state || state.ended) return;
    state.rafId = requestAnimationFrame(tick);
}

function throwKnifeGame10() {
    const state = gameState.game10;
    const info = document.getElementById('game10Info');
    const board = document.getElementById('knifeBoard');
    if (!state || state.ended || state.lockThrow) return;

    state.lockThrow = true;
    animateGame10ReadyKnife();
    const impactAngle = normalizeAngle(90 - state.wheelAngle);
    const collision = state.stuckAngles.some((angle) => angularDistance(angle, impactAngle) < game10CollisionAngle);

    if (collision) {
        state.lives -= 1;
        updateGame10Stats();
        if (info) info.textContent = 'Столкновение с ножом';

        if (board) {
            board.classList.add('knife-board-fail');
            if (state.failTimeout) clearTimeout(state.failTimeout);
            state.failTimeout = setTimeout(() => {
                const currentBoard = document.getElementById('knifeBoard');
                if (currentBoard) currentBoard.classList.remove('knife-board-fail');
            }, 210);
        }

        if (state.lives <= 0) {
            state.ended = true;
            if (state.rafId) cancelAnimationFrame(state.rafId);
            updateGame10ReadyKnife();
            showPopupAndRun(
                'Жизни закончились. Начинаем с 1 уровня.',
                'warn',
                () => nextGame(startGame10, 0)
            );
            return;
        }

        setTimeout(() => {
            const current = gameState.game10;
            if (current && !current.ended) current.lockThrow = false;
        }, 280);
        return;
    }

    state.stuckAngles.push(impactAngle);
    state.levelHits += 1;
    const absSpeed = Math.min(state.levelMaxSpeed, Math.abs(state.speed) + game10HitSpeedGain);
    state.speed = absSpeed * state.speedDirection;
    renderGame10Sticks();
    updateGame10Stats();
    if (info) info.textContent = `Попадание: ${state.levelHits}/${game10HitsPerLevel}`;

    if (state.levelHits >= game10HitsPerLevel) {
        if (state.level >= game10Levels.length) {
            state.ended = true;
            if (state.rafId) cancelAnimationFrame(state.rafId);
            updateGame10ReadyKnife();
            completeGame(10, 360, 'Игра 10');
            return;
        }

        const nextLevel = state.level + 1;
        state.lockThrow = true;
        if (info) info.textContent = `Уровень ${state.level} пройден! Переход к уровню ${nextLevel}...`;
        setTimeout(() => {
            const current = gameState.game10;
            if (!current || current.ended) return;
            setupGame10Level(nextLevel, true);
            const infoEl = document.getElementById('game10Info');
            if (infoEl) infoEl.textContent = `Уровень ${nextLevel}: попади 10 из 10`;
        }, 640);
        return;
    }

    setTimeout(() => {
        const current = gameState.game10;
        if (current && !current.ended) current.lockThrow = false;
    }, 120);
}

// ===== Puzzle Market =====
function showMarket() {
    hideAllScreens();
    document.getElementById('marketContainer').style.display = 'block';
    const oldMessage = document.querySelector('#marketContainer .gift-message');
    if (oldMessage) oldMessage.remove();
    const marketButtons = document.getElementById('marketButtons');
    if (marketButtons) marketButtons.style.display = 'block';
    renderPuzzlePreview();
    updateMarketDisplay();

    if (purchasedPuzzlePieces.size === puzzleCellCount) {
        revealCompletedPuzzle();
    }
}

function renderPuzzlePreview() {
    const preview = document.getElementById('puzzlePreview');
    if (!preview) return;
    preview.classList.remove('puzzle-preview-complete');
    preview.innerHTML = '';

    for (let i = 0; i < puzzleCellCount; i++) {
        const piece = document.createElement('button');
        piece.type = 'button';
        piece.className = 'puzzle-piece puzzle-piece-locked';
        piece.dataset.pieceId = String(i);
        piece.innerHTML = `
            <span class="puzzle-piece-number">${i + 1}</span>
            <span class="puzzle-piece-cost">${puzzlePieceCosts[i] || 0} баллов</span>
        `;
        piece.onclick = () => openPuzzlePart(i);
        preview.appendChild(piece);
    }
}

function openPuzzlePart(pieceId) {
    if (purchasedPuzzlePieces.has(pieceId)) return;

    const cost = puzzlePieceCosts[pieceId] || 0;
    const piece = document.querySelector(`.puzzle-piece[data-piece-id="${pieceId}"]`);
    if (score < cost) {
        if (piece) {
            piece.classList.add('puzzle-piece-denied');
            setTimeout(() => piece.classList.remove('puzzle-piece-denied'), 420);
        }
        showPopup(`Нужно ${cost} баллов для этой ячейки`, 'warn', 1400);
        document.getElementById('playAgainMarket').style.display = 'inline-block';
        return;
    }

    score -= cost;
    purchasedPuzzlePieces.add(pieceId);
    updateScore();
    updateMarketDisplay(pieceId);

    if (purchasedPuzzlePieces.size === puzzleCellCount) {
        revealCompletedPuzzle();
    }
}

function updateMarketDisplay(newlyOpenedId = -1) {
    const progress = document.getElementById('puzzleProgress');
    if (progress) {
        progress.textContent = `Открыто частей: ${purchasedPuzzlePieces.size}/${puzzleCellCount}`;
    }

    for (let i = 0; i < puzzleCellCount; i++) {
        const piece = document.querySelector(`.puzzle-piece[data-piece-id="${i}"]`);
        if (!piece) continue;

        if (purchasedPuzzlePieces.has(i)) {
            piece.disabled = true;
            piece.classList.remove('puzzle-piece-locked');
            piece.classList.add('puzzle-piece-opened');
            piece.innerHTML = '<span class="puzzle-piece-opened-text">Открыто</span>';
            if (i === newlyOpenedId) {
                triggerGlassBreak(piece);
            }
            continue;
        }

        piece.disabled = false;
        piece.classList.remove('puzzle-piece-opened');
        piece.classList.add('puzzle-piece-locked');
        piece.innerHTML = `
            <span class="puzzle-piece-number">${i + 1}</span>
            <span class="puzzle-piece-cost">${puzzlePieceCosts[i] || 0} баллов</span>
        `;
    }
}

function revealCompletedPuzzle() {
    const preview = document.getElementById('puzzlePreview');
    if (!preview) return;
    preview.classList.add('puzzle-preview-complete');
    preview.innerHTML = `
        <video class="puzzle-final-special" id="puzzleFinalSpecial" autoplay playsinline preload="auto">
            <source src="${specialGiftVideoUrl}" type="video/mp4" />
        </video>
    `;

    const message = document.createElement('div');
    message.className = 'gift-message';
    message.textContent = `Все ${puzzleCellCount} ячеек открыты. Нечто особенное уже здесь.`;
    const exists = document.querySelector('#marketContainer .gift-message');
    if (!exists) {
        document.getElementById('marketContainer').prepend(message);
    }

    const marketButtons = document.getElementById('marketButtons');
    if (marketButtons) marketButtons.style.display = 'none';

    const specialVideo = document.getElementById('puzzleFinalSpecial');
    if (!specialVideo) return;
    specialVideo.currentTime = 0;
    specialVideo.muted = false;
    specialVideo.volume = 1;
    specialVideo.defaultMuted = false;

    const playPromise = specialVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
            showPopup('Нажми на видео один раз, чтобы включился звук', 'info', 1700);
            specialVideo.addEventListener('click', () => {
                specialVideo.muted = false;
                specialVideo.volume = 1;
                specialVideo.play().catch(() => {});
            }, { once: true });
        });
    }

    specialVideo.addEventListener('ended', () => {
        proceedFromMarket();
    }, { once: true });
}

function triggerGlassBreak(piece) {
    piece.classList.add('glass-break');
    for (let i = 0; i < 9; i++) {
        const shard = document.createElement('span');
        shard.className = 'glass-shard';
        shard.style.setProperty('--shard-x', `${(Math.random() - 0.5) * 96}px`);
        shard.style.setProperty('--shard-y', `${(Math.random() - 0.5) * 96}px`);
        shard.style.setProperty('--shard-rot', `${Math.floor(Math.random() * 220 - 110)}deg`);
        shard.style.left = `${25 + Math.random() * 50}%`;
        shard.style.top = `${25 + Math.random() * 50}%`;
        piece.appendChild(shard);
    }

    setTimeout(() => {
        piece.classList.remove('glass-break');
        piece.querySelectorAll('.glass-shard').forEach((shard) => shard.remove());
    }, 620);
}

function proceedFromMarket() {
    if (purchasedPuzzlePieces.size < puzzleCellCount) {
        showPopup(`Открой все ${puzzleCellCount} ячеек сетки`, 'warn');
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
    completedGames.clear();
    showGameSelector('Все игры сброшены. Выбери любую игру.');
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
    const rect = noBtn.getBoundingClientRect();
    const maxX = Math.max(0, window.innerWidth - rect.width - 10);
    const maxY = Math.max(0, window.innerHeight - rect.height - 10);
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
    response.textContent = 'Медина, ура! Спасибо, что сказала «да». Я тебя очень сильно люблю 💖';
    document.body.classList.add('hide-all-buttons');
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

    document.body.classList.remove('hide-all-buttons');
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
    ensureSwitchGameButtons();
    updateGameSelectorButtons();
});
