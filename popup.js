document.addEventListener('DOMContentLoaded', () => {
    const send = (type, value = null) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, {type, value});
        });
    };

    // Toggles
    document.getElementById('focusLock').onchange = (e) => send('TOGGLE_FOCUS', e.target.checked);
    document.getElementById('syllables').onchange = (e) => send('TOGGLE_SYLLABLES', e.target.checked);

    // Themes
    document.querySelectorAll('.theme-dot').forEach(dot => {
        dot.onclick = () => {
            document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            send('SET_THEME', dot.dataset.theme);
        };
    });

    // AI Actions
    document.getElementById('summarizeBtn').onclick = async () => {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        chrome.tabs.sendMessage(tab.id, {type: 'GET_TEXT'}, async (res) => {
            if (!res) return;
            const data = await AIService.generateSummary(res.text);
            chrome.tabs.sendMessage(tab.id, {type: 'SHOW_SUMMARY', data});
        });
    };

    document.getElementById('applyLevelBtn').onclick = async () => {
        const level = document.getElementById('readingLevel').value;
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        chrome.tabs.sendMessage(tab.id, {type: 'GET_TEXT'}, async (res) => {
            const simplified = await AIService.simplify(res.text, level);
            chrome.tabs.sendMessage(tab.id, {type: 'REPLACE_TEXT', text: simplified});
        });
    };

    document.getElementById('readBtn').onclick = () => send('START_KARAOKE');
});