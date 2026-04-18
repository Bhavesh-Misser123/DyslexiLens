let rulerElement = null;

chrome.storage.sync.get(['readability', 'ruler', 'spacing'], (data) => {
  if (data.readability) applyReadability(true);
  if (data.ruler) toggleRuler(true);
  if (data.spacing) updateSpacing(data.spacing);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'TOGGLE_READABILITY': applyReadability(request.value); break;
    case 'TOGGLE_RULER': toggleRuler(request.value); break;
    case 'UPDATE_SPACING': updateSpacing(request.value); break;
    case 'CLEAN_PAGE': cleanReadingMode(); break;
    case 'READ_TEXT': readText(); break;
    case 'GET_SELECTION': sendResponse({ text: window.getSelection().toString() }); break;
    case 'SHOW_AI_PANEL': showAIPanel(request.text); break;
  }
});

function applyReadability(active) {
  if (active) {
    document.body.classList.add('nr-reading-mode');
    const style = document.createElement('style');
    style.id = 'nr-font-styles';
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Andika&display=swap');
      .nr-reading-mode { font-family: 'Andika', sans-serif !important; background-color: #fdf6e3 !important; }
      .nr-reading-mode p { letter-spacing: 0.05em !important; word-spacing: 0.1em !important; }
    `;
    document.head.appendChild(style);
  } else {
    document.body.classList.remove('nr-reading-mode');
    const style = document.getElementById('nr-font-styles');
    if (style) style.remove();
  }
}

function toggleRuler(active) {
  if (active) {
    rulerElement = document.createElement('div');
    rulerElement.id = 'nr-focus-ruler';
    document.body.appendChild(rulerElement);
    window.onmousemove = (e) => { rulerElement.style.top = (e.clientY - 20) + 'px'; };
  } else {
    if (rulerElement) rulerElement.remove();
    window.onmousemove = null;
  }
}

function updateSpacing(val) { document.body.style.lineHeight = val; }

function cleanReadingMode() {
  ['nav', 'header', 'footer', 'aside', '.ads'].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.style.display = 'none');
  });
}

function readText() {
  const text = window.getSelection().toString() || "No text selected.";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function showAIPanel(text) {
  let panel = document.getElementById('nr-ai-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'nr-ai-panel';
    document.body.appendChild(panel);
  }
  panel.innerHTML = `<strong>AI Summary</strong><button id="close-nr">✖</button><div>${text}</div>`;
  panel.style.display = 'block';
  document.getElementById('close-nr').onclick = () => panel.style.display = 'none';
}