let score = 0;
let currentGame = 0;
let purchasedGifts = new Set(); // Отслеживаем купленные подарки
let gameStates = {
    game1Completed: false,
    game2Completed: false,
    game3Completed: false,
    game4Completed: false,
    game5Completed: false
};

// Начало игры
function startGames() {
    document.getElementById('mainContent').style.display = 'none';
    currentGame = 1;
    startGame1();
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

// ===== Игра 1: Поймай сердца =====
let game1Timer = 30;
let caughtHearts = 0;

function startGame1() {
    document.getElementById('game1').style.display = 'block';
    document.getElementById('caught').textContent = '0';
    document.getElementById('timer').textContent = '30';
    caughtHearts = 0;
    game1Timer = 30;

    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '';

    // Настраиваем таймер
    const timerInterval = setInterval(() => {
        game1Timer--;
        document.getElementById('timer').textContent = game1Timer;
        
        if (game1Timer <= 0) {
            clearInterval(timerInterval);
            clearInterval(heartInterval);
            
            if (caughtHearts >= 7) {
                score += 30;
                gameStates.game1Completed = true;
                updateScore();
                setTimeout(() => {
                    alert('🌟 Молодец! Поймал ' + caughtHearts + ' сердец! +30 баллов');
                    startGame2();
                }, 500);
            } else {
                alert('Придётся ещё тренироваться! Попытался 😢');
                startGame1();
            }
        }
    }, 1000);

    // Порождаю падающие сердца (на мобилке реже)
    const isMobile = window.innerWidth <= 768;
    const heartSpeed = isMobile ? 1000 : 800;
    
    const heartInterval = setInterval(() => {
        if (game1Timer > 0) {
            const heart = document.createElement('div');
            heart.className = 'falling-heart';
            heart.textContent = '💕';
            heart.style.left = Math.random() * (gameArea.offsetWidth - 50) + 'px';
            heart.style.animationDuration = (2 + Math.random()) + 's';
            
            heart.onclick = (e) => {
                e.stopPropagation();
                heart.remove();
                caughtHearts++;
                score += 10;
                document.getElementById('caught').textContent = caughtHearts;
                updateScore();
                createParticles(e.clientX, e.clientY, '💝');
            };
            
            gameArea.appendChild(heart);
            setTimeout(() => {
                if (heart.parentNode) heart.remove();
            }, 3000);
        }
    }, heartSpeed);
}

// ===== Игра 2: Угадай число =====
let secretNumber;
let guessAttempts = 3;

function startGame2() {
    document.getElementById('game1').style.display = 'none';
    document.getElementById('game2').style.display = 'block';
    
    secretNumber = Math.floor(Math.random() * 10) + 1;
    guessAttempts = 3;
    document.getElementById('numberResult').textContent = '';
    document.getElementById('numberInput').value = '';
    document.getElementById('attemptsLeft').textContent = 'Осталось попыток: 3';
    document.getElementById('numberInput').focus();
}

function guessNumber() {
    const input = parseInt(document.getElementById('numberInput').value);
    const resultDiv = document.getElementById('numberResult');
    
    if (!input || input < 1 || input > 10) {
        resultDiv.textContent = 'Пожалуйста введи число от 1 до 10';
        return;
    }
    
    guessAttempts--;
    
    if (input === secretNumber) {
        resultDiv.textContent = '🌟 Молодец! Это было ' + secretNumber + '! +25 баллов';
        score += 25;
        gameStates.game2Completed = true;
        updateScore();
        setTimeout(() => startGame3(), 1500);
    } else if (guessAttempts > 0) {
        const hint = input < secretNumber ? 'число больше ⬆' : 'число меньше ⬇';
        resultDiv.textContent = '🤔 ' + hint + ' | Осталось: ' + guessAttempts;
        document.getElementById('attemptsLeft').textContent = 'Осталось попыток: ' + guessAttempts;
    } else {
        resultDiv.textContent = '😢 Попытки кончились! Число было ' + secretNumber;
        setTimeout(() => {
            if (confirm('Хочешь попробовать ещё?')) {
                startGame2();
            } else {
                score += 15;
                gameStates.game2Completed = true;
                updateScore();
                startGame3();
            }
        }, 1500);
    }
    document.getElementById('numberInput').value = '';
}

// ===== Игра 3: Память =====
let memorySequence = [];
let playerSequence = [];
let emojis = ['💕', '💖', '💗', '💝'];

function startGame3() {
    document.getElementById('game2').style.display = 'none';
    document.getElementById('game3').style.display = 'block';
    
    memorySequence = [];
    playerSequence = [];
    addToMemorySequence();
}

function addToMemorySequence() {
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    memorySequence.push(randomEmoji);
    
    document.getElementById('sequenceDisplay').textContent = memorySequence.join(' ');
    
    playerSequence = [];
    createMemoryButtons();
}

function createMemoryButtons() {
    const container = document.getElementById('memoryButtons');
    container.innerHTML = '';
    
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = 'memory-btn';
        btn.textContent = emoji;
        btn.onclick = () => {
            playerSequence.push(emoji);
            checkMemorySequence();
        };
        container.appendChild(btn);
    });
}

function checkMemorySequence() {
    const current = playerSequence.length - 1;
    
    if (playerSequence[current] !== memorySequence[current]) {
        document.getElementById('memoryResult').textContent = '😢 Ошибка! Ты дошёл до ' + memorySequence.length + ' элементов';
        score += 20;
        gameStates.game3Completed = true;
        updateScore();
        setTimeout(finishAllGames, 2000);
    } else if (playerSequence.length === memorySequence.length) {
        document.getElementById('memoryResult').textContent = '🌟 Правильно! Понять ещё?';
        score += 10;
        updateScore();
        setTimeout(addToMemorySequence, 1500);
    }
}

function finishAllGames() {
    document.getElementById('game3').style.display = 'none';
    document.getElementById('game4').style.display = 'block';
    startGame4();
}

// ===== Игра 4: Быстрые клики =====
let game4Timer = 20;
let game4Clicks = 0;
let game4Interval;
let emojiTargets = ['❤️', '💕', '💖', '💗', '💝'];

function startGame4() {
    document.getElementById('game4').style.display = 'block';
    const gameArea = document.getElementById('gameArea4');
    gameArea.innerHTML = '';
    gameArea.style.position = 'relative';
    
    game4Timer = 20;
    game4Clicks = 0;
    document.getElementById('game4Timer').textContent = '20';
    document.getElementById('game4Clicks').textContent = '0';
    
    // Создаём эмодзи для клика
    function spawnEmoji() {
        const emoji = document.createElement('div');
        emoji.className = 'quick-emoji';
        emoji.textContent = emojiTargets[Math.floor(Math.random() * emojiTargets.length)];
        emoji.style.left = Math.random() * (gameArea.clientWidth - 60) + 'px';
        emoji.style.top = Math.random() * (gameArea.clientHeight - 60) + 'px';
        
        emoji.onclick = (e) => {
            e.stopPropagation();
            game4Clicks++;
            document.getElementById('game4Clicks').textContent = game4Clicks;
            emoji.style.animation = 'fadeOutEmoji 0.3s ease-out forwards';
            setTimeout(() => emoji.remove(), 300);
        };
        
        gameArea.appendChild(emoji);
        
        setTimeout(() => {
            if (emoji.parentNode) {
                emoji.remove();
            }
        }, 1000);
    }
    
    // Спавним эмодзи каждые 300мс
    game4Interval = setInterval(spawnEmoji, 300);
    
    // Таймер
    const timerInterval = setInterval(() => {
        game4Timer--;
        document.getElementById('game4Timer').textContent = game4Timer;
        
        if (game4Timer <= 0) {
            clearInterval(timerInterval);
            clearInterval(game4Interval);
            gameArea.innerHTML = '';
            
            if (game4Clicks >= 15) {
                score += 35;
                gameStates.game4Completed = true;
                updateScore();
                setTimeout(() => {
                    alert('🚀 Отлично! Клики: ' + game4Clicks + '! +35 баллов');
                    startGame5();
                }, 500);
            } else {
                score += 15;
                gameStates.game4Completed = true;
                updateScore();
                setTimeout(() => {
                    alert('⏱️ Времени вышло! Клики: ' + game4Clicks + '. +15 баллов');
                    startGame5();
                }, 500);
            }
        }
    }, 1000);
}

// ===== Игра 5: Любовный Квиз =====
let currentQuestion = 0;
let game5Score = 0;

const quizQuestions = [
    {
        question: '❤️ Что для тебя главное в любви?',
        answers: ['😊 Улыбка', '🤝 Верность', '🎵 Творчество', '💪 Поддержка']
    },
    {
        question: '💕 Как ты проявляешь чувства?',
        answers: ['🎁 Дарю подарки', '💬 Говорю комплименты', '🤗 Обнимаю', '👂 Слушаю']
    },
    {
        question: '💖 Чем ты хочешь заниматься?',
        answers: ['🍽️ Готовить', '🎬 Смотреть фильмы', '🚗 Путешествовать', '🎮 Учиться']
    }
];

function startGame5() {
    document.getElementById('game4').style.display = 'none';
    document.getElementById('game5').style.display = 'block';
    currentQuestion = 0;
    game5Score = 0;
    showQuizQuestion();
}

function showQuizQuestion() {
    if (currentQuestion >= quizQuestions.length) {
        finishQuiz();
        return;
    }
    
    const q = quizQuestions[currentQuestion];
    const container = document.getElementById('quizContainer');
    container.innerHTML = `
        <div class="quiz-game">
            <div class="quiz-question">${q.question}</div>
            <div class="quiz-options" id="quizOptions"></div>
        </div>
    `;
    
    const optionsContainer = document.getElementById('quizOptions');
    q.answers.forEach((answer, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(idx);
        optionsContainer.appendChild(btn);
    });
}

function selectAnswer(idx) {
    game5Score += 10;
    currentQuestion++;
    showQuizQuestion();
}

function finishQuiz() {
    document.getElementById('game5').style.display = 'none';
    score += 30;
    gameStates.game5Completed = true;
    updateScore();
    
    setTimeout(() => {
        alert('💝 Ты ответил на все вопросы! +30 баллов');
        showMarket();
    }, 500);
}

// ===== МАРКЕТ ПОДАРКОВ =====
const giftPrices = [50, 60, 70, 80, 100];
const giftEmojis = ['🌹', '🎀', '💌', '💐', '💎'];
const giftNames = ['Роза', 'Бант', 'Письмо', 'Букет', 'Бриллиант'];

function showMarket() {
    document.getElementById('game5').style.display = 'none';
    document.getElementById('marketContainer').style.display = 'block';
    updateMarketDisplay();
}

function updateMarketDisplay() {
    // Обновляем отображение купленных подарков
    giftPrices.forEach((price, idx) => {
        const piece = document.querySelector(`.gift-piece-${idx + 1}`);
        if (purchasedGifts.has(idx)) {
            piece.classList.add('unlocked');
        }
    });
    
    // Обновляем кнопки
    giftPrices.forEach((price, idx) => {
        const item = document.querySelector(`[data-gift-id="${idx}"]`);
        if (purchasedGifts.has(idx)) {
            item.classList.add('purchased');
        }
    });
    
    // Проверяем, собраны ли все подарки
    if (purchasedGifts.size === 5) {
        showFinalGift();
    }
}

function buyGiftPart(giftId, cost) {
    if (purchasedGifts.has(giftId)) {
        return;
    }
    
    if (score >= cost) {
        score -= cost;
        purchasedGifts.add(giftId);
        updateScore();
        updateMarketDisplay();
        
        // Показываем эмодзи подарка
        const piece = document.querySelector(`.gift-piece-${giftId + 1}`);
        piece.innerHTML = giftEmojis[giftId];
        
        if (purchasedGifts.size === 5) {
            showFinalGift();
        }
    } else {
        const insufficient = document.createElement('div');
        insufficient.className = 'insufficient-funds';
        insufficient.textContent = '❌ Недостаточно баллов!';
        document.querySelector(`[data-gift-id="${giftId}"]`).parentElement.appendChild(insufficient);
        setTimeout(() => insufficient.remove(), 2000);
    }
}

function showFinalGift() {
    const message = document.querySelector('.gift-message');
    if (!message) {
        const container = document.getElementById('marketContainer');
        const msg = document.createElement('div');
        msg.className = 'gift-message';
        msg.innerHTML = `🎉 Ты собрал весь подарок! 💝<br/>Это мое сердце, полное любви к тебе! 💕`;
        container.insertBefore(msg, container.firstChild);
    }
    
    setTimeout(() => {
        document.getElementById('marketContainer').style.display = 'none';
        document.getElementById('finalQuestion').style.display = 'block';
    }, 3000);
}

// Обработка кнопки "Да"
function handleYes() {
    // Останавливаем движение кнопки "Нет"
    if (moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
    }
    
    const response = document.querySelector('.final-question .response');
    const yesBtn = document.querySelector('.btn-yes');
    const noBtn = document.getElementById('noBtn');
    
    response.innerHTML = '❤️ Ура! Ты самая лучшая на свете! 💕';
    
    // Отключаем кнопки
    yesBtn.disabled = true;
    noBtn.disabled = true;
    yesBtn.style.pointerEvents = 'none';
    noBtn.style.pointerEvents = 'none';
    
    // Создаём конфетти
    createConfetti();
    score += 50;
    updateScore();
}

// Обработка кнопки "Нет"
let clickCount = 0;
let isMoving = false;
let moveInterval = null;

const persuasionMessages = [
    'Ты точно? 😕',
    'Подумай ещё! 🤔',
    'А может всё же да? 👉👈',
    'Не уходи! 💔',
    'Я буду ждать... 😢',
    'Серьёзно? 😭',
    'Одна последняя попытка? 🙏',
    'Ты меня обидишь! 💔',
    'Пожалуйста? 💕',
    'Ну пожалуйста! 🥺',
    'Я буду самой лучшей! ✨'
];

document.addEventListener('DOMContentLoaded', function() {
    const noBtn = document.getElementById('noBtn');
    if (noBtn) {
        noBtn.style.position = 'fixed';
        noBtn.addEventListener('click', handleNo);
    }
});

function moveButtonRandomly() {
    const noBtn = document.getElementById('noBtn');
    
    if (!noBtn) return;
    
    // Для мобильных устройств - уменьшенная область движения
    const isMobile = window.innerWidth <= 768;
    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 80;
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    
    // Устанавливаем новую позицию
    noBtn.style.left = randomX + 'px';
    noBtn.style.top = randomY + 'px';
}

function handleNo() {
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.querySelector('.btn-yes');
    const responseDiv = document.querySelector('.final-question .response');
    
    clickCount++;
    
    // Показываем сообщение переубеждения
    if (responseDiv) {
        const messageIndex = Math.min(clickCount - 1, persuasionMessages.length - 1);
        responseDiv.textContent = persuasionMessages[messageIndex];
        responseDiv.style.animation = 'none';
        setTimeout(() => {
            responseDiv.style.animation = 'responseShow 0.5s ease-out';
        }, 10);
    }
    
    // Если это первый клик - запускаем непрерывное движение
    if (!isMoving) {
        isMoving = true;
        noBtn.style.transition = 'none'; // Без плавности для резкого движения
        
        // Кнопка движется каждые 150ms
        moveInterval = setInterval(() => {
            moveButtonRandomly();
        }, 150);
        
        // Даём кнопке максимальный размер при первом нажатии
        noBtn.style.transform = 'scale(0.7)';
    }
    
    // Увеличиваем кнопку "Да"
    const newScale = 1 + clickCount * 0.2;
    yesBtn.style.transform = `scale(${newScale})`;
    yesBtn.style.boxShadow = `0 10px ${30 + clickCount * 5}px rgba(255, 20, 147, ${0.4 + clickCount * 0.1})`;
    
    // После 5 попыток кнопка "Нет" исчезает полностью
    if (clickCount >= 5) {
        noBtn.style.opacity = '0';
        noBtn.style.pointerEvents = 'none';
        responseDiv.innerHTML = '❌ Кнопка "Нет" убежала! Остаётся только "Да"! 💕';
    }
}

// Функция создания конфетти
function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    const colors = [
        '#ff1493',
        '#ff69b4',
        '#ffb6c1',
        '#ffc0cb',
        '#ee82ee',
        '#ff00ff',
        '#ff4081'
    ];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        const size = Math.random() * 8 + 6;
        const xPos = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const duration = Math.random() * 2 + 2.5;
        
        confetti.style.left = xPos + '%';
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animation = `confetti-fall ${duration}s linear ${delay}s forwards`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
        
        confettiContainer.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, (duration + delay) * 1000 + 100);
    }
}

// Функция создания частиц
function createParticles(x, y, emoji) {
    const particlesContainer = document.getElementById('particles');
    
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emoji;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = '20px';
        
        const angle = (Math.PI * 2 * i) / 5;
        const velocity = 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let px = x, py = y;
        const duration = 800;
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            px += vx * 0.016;
            py += vy * 0.016;
            
            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        }
        
        particlesContainer.appendChild(particle);
        animate();
    }
}

// Добавляем звёзды на фон
function createStars() {
    const starsContainer = document.querySelector('.stars-background');
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

// Инициализация
window.addEventListener('load', () => {
    createStars();
    console.log('💝 С Днём Святого Валентина! 💝');
    console.log('✨ Добро пожаловать на сайт-валентинку! ✨');
});