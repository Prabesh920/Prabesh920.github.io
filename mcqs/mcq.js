// Initialize or load score from localStorage
let score = {
  correct: parseInt(localStorage.getItem('score-correct')) || 0,
  wrong: parseInt(localStorage.getItem('score-wrong')) || 0,
  skipped: parseInt(localStorage.getItem('score-skipped')) || 0,
};

function updateScoreUI() {
  document.getElementById('score-correct').textContent = score.correct;
  document.getElementById('score-wrong').textContent = score.wrong;
  document.getElementById('score-skipped').textContent = score.skipped;
}

updateScoreUI();

function saveScore() {
  localStorage.setItem('score-correct', score.correct);
  localStorage.setItem('score-wrong', score.wrong);
  localStorage.setItem('score-skipped', score.skipped);
}

document.getElementById('reset-score').addEventListener('click', () => {
  score.correct = 0;
  score.wrong = 0;
  score.skipped = 0;
  saveScore();
  updateScoreUI();
});

function answerQuestion(isCorrect) {
  if (isCorrect === true) {
    score.correct++;
  } else if (isCorrect === false) {
    score.wrong++;
  } else {
    score.skipped++;
  }
  saveScore();
  updateScoreUI();
}

let answeredMap = {}; // Keeps track of answered questions by index

document.addEventListener('DOMContentLoaded', () => {
  const mcqList = document.getElementById('mcq-list');
  const categorySelect = document.getElementById('category-select');
  const toggleBtn = document.getElementById('theme-toggle');
  const paginationWrapper = document.getElementById('pagination');

  const MCQS_PER_PAGE = 10;
  let currentPage = 1;
  let allMcqs = [];
  let filteredMcqs = [];

  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    toggleBtn.textContent = '🌙 Dark Mode';
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    toggleBtn.textContent = isLight ? '🌙 Dark Mode' : '🌞 Light Mode';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });

  async function fetchAndRenderMCQs() {
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    const startTime = Date.now();
    try {
      const response = await fetch('mcqs/mcq.json');
      allMcqs = await response.json();
      filteredMcqs = [...allMcqs];
    } catch (err) {
      console.error("Failed to load MCQs:", err);
    }

    const elapsedTime = Date.now() - startTime;
    const delay = Math.max(0, 1000 - elapsedTime);

    setTimeout(() => {
      renderPaginatedMcqs();
      renderPaginationControls();
      loader.style.display = 'none';
    }, delay);
  }

  function renderPaginatedMcqs() {
    mcqList.innerHTML = '';
    const start = (currentPage - 1) * MCQS_PER_PAGE;
    const end = start + MCQS_PER_PAGE;
    const mcqsToRender = filteredMcqs.slice(start, end);

    mcqsToRender.forEach((mcq, index) => {
      const globalIndex = start + index;
      const mcqBlock = document.createElement('div');
      mcqBlock.className = 'mcq-container';
      mcqBlock.setAttribute('data-category', mcq.category);
      mcqBlock.setAttribute('data-global-index', globalIndex);

      let optionsHTML = '';
      mcq.options.forEach(opt => {
        optionsHTML += `<div class="option" data-correct="${opt.correct}"${opt.explanation ? ` data-explanation="${opt.explanation}"` : ''}>${opt.text}</div>`;
      });

      mcqBlock.innerHTML = `
        <div class="question-header">
          <span class="question-number">${globalIndex + 1}.</span>
          <span class="question-text">${mcq.question}</span>
        </div>
        <div class="options-wrapper">${optionsHTML}</div>
        <div class="explanation" style="display:none;"></div>
        <div class="sidebar">
          <button class="sidebar-btn">📘 Answer & Solution</button>
          <button class="sidebar-btn">💬 Discussion in Board</button>
          <button class="sidebar-btn">🔖 Save for Later</button>
        </div>
      `;

      mcqList.appendChild(mcqBlock);
    });
  }

  function renderPaginationControls() {
    const totalPages = Math.ceil(filteredMcqs.length / MCQS_PER_PAGE);
    paginationWrapper.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '⬅ Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
      markSkipped();
      if (currentPage > 1) {
        currentPage--;
        renderPaginatedMcqs();
        renderPaginationControls();
        scrollToTop();
      }
    };

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next ➡';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
      markSkipped();
      if (currentPage < totalPages) {
        currentPage++;
        renderPaginatedMcqs();
        renderPaginationControls();
        scrollToTop();
      }
    };

    const pageIndicator = document.createElement('span');
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    pageIndicator.style.margin = '0 1rem';

    paginationWrapper.appendChild(prevBtn);
    paginationWrapper.appendChild(pageIndicator);
    paginationWrapper.appendChild(nextBtn);
  }

  function scrollToTop() {
    mcqList.scrollIntoView({ behavior: 'smooth' });
  }

  function markSkipped() {
    const start = (currentPage - 1) * MCQS_PER_PAGE;
    const end = start + MCQS_PER_PAGE;
    for (let i = start; i < end; i++) {
      if (!answeredMap[i]) {
        answeredMap[i] = 'skipped';
        answerQuestion(null);
      }
    }
  }

  mcqList.addEventListener('click', e => {
    if (!e.target.classList.contains('option')) return;

    const option = e.target;
    const mcqContainer = option.closest('.mcq-container');
    if (!mcqContainer || option.classList.contains('disabled')) return;

    const options = mcqContainer.querySelectorAll('.option');
    const explanationBox = mcqContainer.querySelector('.explanation');

    options.forEach(opt => opt.classList.add('disabled'));
    options.forEach(opt => {
      if (opt.dataset.correct === 'true') {
        opt.classList.add('correct');
        if (!opt.innerHTML.includes('✔️')) opt.innerHTML += ' ✔️';
      }
    });

    if (option.dataset.correct !== 'true') {
      option.classList.add('wrong');
      if (!option.innerHTML.includes('❌')) option.innerHTML += ' ❌';
    }

    const correctOption = [...options].find(opt => opt.dataset.correct === 'true');
    if (correctOption && correctOption.dataset.explanation) {
      explanationBox.innerHTML = `<strong>Explanation:</strong><br>${correctOption.dataset.explanation}`;
      explanationBox.style.display = 'block';
    }

    const globalIndex = parseInt(mcqContainer.getAttribute('data-global-index'));
    if (!answeredMap[globalIndex]) {
      answeredMap[globalIndex] = 'answered';
      answerQuestion(option.dataset.correct === 'true');
    }
  });

  categorySelect.addEventListener('change', () => {
    markSkipped();
    const selected = categorySelect.value;
    currentPage = 1;
    if (selected === 'all') {
      filteredMcqs = [...allMcqs];
    } else {
      filteredMcqs = allMcqs.filter(mcq => mcq.category === selected);
    }
    renderPaginatedMcqs();
    renderPaginationControls();
  });

  fetchAndRenderMCQs();
});
