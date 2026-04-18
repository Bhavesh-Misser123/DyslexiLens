const AISimplifier = {
    async simplify(text) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("SIMPLIFIED: " + text.substring(0, 200) + "... [Simplified for easier reading]");
            }, 1000);
        });
    }
};