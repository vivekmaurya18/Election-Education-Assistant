// Assistant Logic
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerHTML = text.replace(/\n/g, '<br>');
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleSend(customMessage = null) {
    const isCustom = typeof customMessage === 'string';
    const text = isCustom ? customMessage : userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    if (!isCustom) userInput.value = '';

    // Show "typing" indicator
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot', 'typing-indicator');
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: text }),
        });

        const data = await response.json();

        // Remove typing indicator and add real message
        chatMessages.removeChild(typingDiv);
        addMessage(data.reply, 'bot');
    } catch (error) {
        console.error('Error:', error);
        chatMessages.removeChild(typingDiv);
        addMessage("I'm having trouble connecting to the server. Please try again later. 🙏", 'bot');
    }
}

sendBtn?.addEventListener('click', handleSend);
userInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// Quiz Logic
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

const startQuizBtn = document.getElementById('startQuizBtn');
const quizStart = document.getElementById('quizStart');
const quizContent = document.getElementById('quizContent');
const quizResult = document.getElementById('quizResult');
const questionText = document.getElementById('questionText');
const quizOptions = document.getElementById('quizOptions');
const questionNumber = document.getElementById('questionNumber');
const progressBar = document.getElementById('progress');
const quizFeedback = document.getElementById('quizFeedback');

async function startQuiz() {
    try {
        const response = await fetch('/api/quiz');
        currentQuestions = await response.json();
        quizStart.style.display = 'none';
        quizContent.style.display = 'block';
        showQuestion();
    } catch (error) {
        console.error('Failed to load quiz:', error);
    }
}

if (startQuizBtn) {
    startQuizBtn.addEventListener('click', startQuiz);
}

// Language Support
let currentLang = localStorage.getItem('nirvachan_lang') || 'en';

const translations = {
    en: {
        question: "Question",
        correct: "Correct!",
        incorrect: "Incorrect.",
        perfect: "Perfect score! You are a true Nirvachan Expert! 🏆",
        good: "Good job! You have a solid understanding of the process. 👍",
        keepLearning: "Keep exploring the Roadmap and Assistant to learn more! 📚"
    },
    hi: {
        question: "प्रश्न",
        correct: "सही!",
        incorrect: "गलत।",
        perfect: "शानदार स्कोर! आप वास्तव में एक निर्वाचन विशेषज्ञ हैं! 🏆",
        good: "बहुत अच्छा! आपको चुनाव प्रक्रिया की अच्छी समझ है। 👍",
        keepLearning: "अधिक जानकारी के लिए रोडमैप और निर्वाचन सहायक का उपयोग करें! 📚"
    }
};

function updateLanguage() {
    const elements = document.querySelectorAll('[data-en]');
    elements.forEach(el => {
        if (currentLang === 'hi') {
            el.innerHTML = el.getAttribute('data-hi');
            if (el.hasAttribute('data-hi-placeholder')) {
                el.placeholder = el.getAttribute('data-hi-placeholder');
            }
        } else {
            el.innerHTML = el.getAttribute('data-en');
            if (el.hasAttribute('data-en-placeholder')) {
                el.placeholder = el.getAttribute('data-en-placeholder');
            }
        }
    });

    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.innerText = currentLang === 'en' ? 'HI' : 'EN';
    }
    
    // Update active quiz question if any
    if (currentQuestions.length > 0 && quizContent.style.display === 'block') {
        showQuestion();
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    localStorage.setItem('nirvachan_lang', currentLang);
    updateLanguage();
}

document.getElementById('langBtn')?.addEventListener('click', toggleLanguage);

// Back to Top Logic
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Update Quiz Logic for bilingual support
function showQuestion() {
    const q = currentQuestions[currentQuestionIndex];
    questionText.innerText = currentLang === 'hi' ? q.questionHi : q.question;
    questionNumber.innerText = `${translations[currentLang].question} ${currentQuestionIndex + 1}/${currentQuestions.length}`;
    progressBar.style.width = `${((currentQuestionIndex) / currentQuestions.length) * 100}%`;

    quizOptions.innerHTML = '';
    quizFeedback.style.display = 'none';

    const opts = currentLang === 'hi' ? q.optionsHi : q.options;
    opts.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(index);
        quizOptions.appendChild(btn);
    });
}

function handleAnswer(selectedIndex) {
    const q = currentQuestions[currentQuestionIndex];
    const options = quizOptions.querySelectorAll('.option-btn');

    options.forEach(btn => btn.disabled = true);

    const t = translations[currentLang];
    const explanation = currentLang === 'hi' ? q.explanationHi : q.explanation;
    
    if (selectedIndex === q.correctAnswer) {
        score++;
        options[selectedIndex].classList.add('correct');
        quizFeedback.innerHTML = `<strong>${t.correct}</strong> ${explanation}`;
        quizFeedback.style.background = 'rgba(19, 136, 8, 0.1)';
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[q.correctAnswer].classList.add('correct');
        quizFeedback.innerHTML = `<strong>${t.incorrect}</strong> ${explanation}`;
        quizFeedback.style.background = 'rgba(255, 68, 68, 0.1)';
    }

    quizFeedback.style.display = 'block';

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 3000);
}

function showResults() {
    quizContent.style.display = 'none';
    quizResult.style.display = 'block';
    document.getElementById('resultScore').innerText = `${score}/${currentQuestions.length}`;

    const t = translations[currentLang];
    if (score === currentQuestions.length) {
        document.getElementById('resultText').innerText = t.perfect;
    } else if (score >= currentQuestions.length / 2) {
        document.getElementById('resultText').innerText = t.good;
    } else {
        document.getElementById('resultText').innerText = t.keepLearning;
    }
}

// Suggested Questions should handle language
document.querySelectorAll('.suggested-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        handleSend(chip.innerText);
    });
});

// Initialize
updateLanguage();

const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.step, .module-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});
