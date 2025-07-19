document.addEventListener('DOMContentLoaded', () => {
  const mcqList = document.getElementById('mcq-list');
  const categorySelect = document.getElementById('category-select');
  const toggleBtn = document.getElementById('theme-toggle');
  const paginationWrapper = document.getElementById('pagination');

  const MCQS_PER_PAGE = 50;
  let currentPage = 1;
  let allMcqs = [];
  let filteredMcqs = [];

  // Theme Toggle: Apply saved theme on load
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

  // Fetch MCQs JSON & initialize filtered list
  async function fetchAndRenderMCQs() {
    try {
      const response = await fetch('mcqs/mcq.json');
      allMcqs = await response.json();
      filteredMcqs = [...allMcqs]; // Start with all MCQs displayed
      renderPaginatedMcqs();
      renderPaginationControls();
    } catch (err) {
      console.error("Failed to load MCQs:", err);
    }
  }

  // Render MCQs for current page from filtered list
  function renderPaginatedMcqs() {
    mcqList.innerHTML = '';
    const start = (currentPage - 1) * MCQS_PER_PAGE;
    const end = start + MCQS_PER_PAGE;
    const mcqsToRender = filteredMcqs.slice(start, end);

    mcqsToRender.forEach((mcq, index) => {
      const mcqBlock = document.createElement('div');
      mcqBlock.className = 'mcq-container';
      mcqBlock.setAttribute('data-category', mcq.category);

      let optionsHTML = '';
      mcq.options.forEach(opt => {
        optionsHTML += `<div class="option" data-correct="${opt.correct}"${opt.explanation ? ` data-explanation="${opt.explanation}"` : ''}>${opt.text}</div>`;
      });

      const globalIndex = start + index + 1;
      mcqBlock.innerHTML = `
        <div class="question-header">
          <span class="question-number">${globalIndex}.</span>
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

  // Render Previous, Next buttons and page indicator
  function renderPaginationControls() {
    const totalPages = Math.ceil(filteredMcqs.length / MCQS_PER_PAGE);
    paginationWrapper.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '⬅ Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
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

  // Scroll to top of MCQ list after page change
  function scrollToTop() {
    mcqList.scrollIntoView({ behavior: 'smooth' });
  }

  // Handle answer selection and show correct/wrong + explanation
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
  });

  // Update filtered MCQs on category change, reset page to 1
  categorySelect.addEventListener('change', () => {
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
