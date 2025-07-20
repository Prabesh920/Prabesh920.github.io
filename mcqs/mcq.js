document.addEventListener('DOMContentLoaded', () => {
  const mcqList = document.getElementById('mcq-list');
  const categorySelect = document.getElementById('category-select');
  const toggleBtn = document.getElementById('theme-toggle');

  // Theme Toggle
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

  // Fetch MCQs
  async function fetchAndRenderMCQs() {
    try {
      const response = await fetch('mcqs/mcq.json');
      const mcqData = await response.json();
      mcqList.innerHTML = '';

      mcqData.forEach(mcq => {
        const mcqBlock = document.createElement('div');
        mcqBlock.className = 'mcq-container';
        mcqBlock.setAttribute('data-category', mcq.category);

        let optionsHTML = '';
        mcq.options.forEach(opt => {
          optionsHTML += `<div class="option" data-correct="${opt.correct}"${opt.explanation ? ` data-explanation="${opt.explanation}"` : ''}>${opt.text}</div>`;
        });

        mcqBlock.innerHTML = `
          <div class="question-header">
            <span class="question-number">${mcq.number}.</span>
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
    } catch (err) {
      console.error("Failed to load MCQs:", err);
    }
  }

  // Handle Answer Selection
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

  // Category Filter
  categorySelect.addEventListener('change', () => {
    const selected = categorySelect.value;
    const mcqs = mcqList.querySelectorAll('.mcq-container');
    mcqs.forEach(mcq => {
      mcq.style.display = (selected === 'all' || mcq.dataset.category === selected) ? '' : 'none';
    });
  });

  fetchAndRenderMCQs();
});
