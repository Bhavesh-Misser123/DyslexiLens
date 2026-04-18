let isFocusLocked = false;
let originalHTML = "";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch(msg.type) {
        case 'SET_THEME': applyTheme(msg.value); break;
        case 'TOGGLE_FOCUS': toggleFocusLock(msg.value); break;
        case 'TOGGLE_SYLLABLES': toggleSyllables(msg.value); break;
        case 'START_KARAOKE': startKaraoke(); break;
        case 'GET_TEXT': sendResponse({text: document.body.innerText.substring(0, 2000)}); break;
        case 'SHOW_SUMMARY': createSummaryCard(msg.data); break;
        case 'REPLACE_TEXT': replaceMainContent(msg.text); break;
    }
});

function applyTheme(theme) {
    document.documentElement.className = `dl-theme-${theme}`;
}

function toggleFocusLock(active) {
    let overlay = document.getElementById('dl-focus-overlay');
    if (active) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'dl-focus-overlay';
            document.body.appendChild(overlay);
        }
        window.onmousemove = (e) => {
            overlay.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, transparent 100px, rgba(0,0,0,0.7) 150px)`;
        };
    } else {
        if (overlay) overlay.remove();
        window.onmousemove = null;
    }
}

function toggleSyllables(active) {
    if (active) {
        originalHTML = document.body.innerHTML;
        // Simple Syllable Regex for Demo
        const textNodes = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while (node = textNodes.nextNode()) {
            if (node.parentElement.tagName !== 'SCRIPT' && node.textContent.trim().length > 3) {
                node.textContent = node.textContent.replace(/([a-z]{2,})(?=[a-z]{2,})/gi, "$1·");
            }
        }
    } else if (originalHTML) {
        document.body.innerHTML = originalHTML;
    }
}

function startKaraoke() {
    const selection = window.getSelection().toString() || document.body.innerText.substring(0, 500);
    const utter = new SpeechSynthesisUtterance(selection);
    utter.rate = 0.85;

    utter.onboundary = (event) => {
        if (event.name === 'word') {
            // In a real demo, we'd wrap words in spans. 
            // For hackathon: show progress in a small toast.
            showToast(`Reading: ${Math.round((event.charIndex / selection.length) * 100)}%`);
        }
    };
    window.speechSynthesis.speak(utter);
}

function createSummaryCard(data) {
    let card = document.getElementById('dl-summary-card');
    if (!card) {
        card = document.createElement('div');
        card.id = 'dl-summary-card';
        document.body.appendChild(card);
    }
    card.innerHTML = `
        <h3>Smart Insights</h3>
        <ul>${data.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        <div class="takeaway"><strong>Takeaway:</strong> ${data.takeaway}</div>
        <button onclick="this.parentElement.remove()">Close</button>
    `;
}

function showToast(text) {
    let toast = document.getElementById('dl-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dl-toast';
        document.body.appendChild(toast);
    }
    toast.innerText = text;
}