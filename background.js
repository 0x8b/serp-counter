chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.storage.sync.set({
            textFilters: "Więcej firm\nWynik z kalkulatora\nZnajdź więcej na\nZnajdź wyniki na\nPodobne wyszukiwania\nWięcej miejsc\nPodobne pytania",
            cssFilters: `[aria-label='równa się']`
        });
    }
});