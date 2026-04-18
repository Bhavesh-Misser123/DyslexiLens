const AIService = {
    // Mocking API for demo purposes. 
    // In production, fetch from OpenAI/Anthropic
    async simplify(text, level) {
        const levels = ["Child-friendly summary: ", "Simplified version: ", "Original: "];
        return new Promise(res => setTimeout(() => {
            res(levels[level] + text.substring(0, 500) + "...");
        }, 1000));
    },

    async generateSummary(text) {
        return new Promise(res => setTimeout(() => {
            res({
                bullets: [
                    "Main topic covers the impact of AI on reading.",
                    "Dyslexic users benefit from increased spacing.",
                    "Syllable splitting reduces cognitive load."
                ],
                takeaway: "Technology is making text more accessible for everyone."
            });
        }, 1000));
    }
};