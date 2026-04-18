document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    readability: document.getElementById('toggleReadability'),
    ruler: document.getElementById('toggleRuler'),
    spacing: document.getElementById('lineSpacing'),
    clean: document.getElementById('cleanPageBtn'),
    read: document.getElementById('readSelectedBtn'),
    simplify: document.getElementById('simplifyBtn')
  };

  chrome.storage.sync.get(['readability', 'ruler', 'spacing'], (data) => {
    elements.readability.checked = data.readability || false;
    elements.ruler.checked = data.ruler || false;
    elements.spacing.value = data.spacing || 1.5;
  });

  elements.readability.addEventListener('change', (e) => {
    chrome.storage.sync.set({ readability: e.target.checked });
    sendMessageToContent({ type: 'TOGGLE_READABILITY', value: e.target.checked });
  });

  elements.ruler.addEventListener('change', (e) => {
    chrome.storage.sync.set({ ruler: e.target.checked });
    sendMessageToContent({ type: 'TOGGLE_RULER', value: e.target.checked });
  });

  elements.spacing.addEventListener('input', (e) => {
    chrome.storage.sync.set({ spacing: e.target.value });
    sendMessageToContent({ type: 'UPDATE_SPACING', value: e.target.value });
  });

  elements.clean.addEventListener('click', () => sendMessageToContent({ type: 'CLEAN_PAGE' }));
  elements.read.addEventListener('click', () => sendMessageToContent({ type: 'READ_TEXT' }));

  elements.simplify.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' }, async (response) => {
      if (response && response.text) {
        elements.simplify.innerText = "Simplifying...";
        const simplified = await AISimplifier.simplify(response.text);
        chrome.tabs.sendMessage(tab.id, { type: 'SHOW_AI_PANEL', text: simplified });
        elements.simplify.innerText = "✨ AI Simplify Selection";
      } else {
        alert("Please select some text first!");
      }
    });
  });
});

function sendMessageToContent(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, message);
  });
}