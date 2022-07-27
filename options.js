function save_options() {
    const textFilters = document.querySelector("#text-filters").value.trim();
    const cssFilters = document.querySelector("#css-filters").value.trim();

    chrome.storage.sync.set({
        textFilters,
        cssFilters
    }, () => {
        const button = document.querySelector("#save");
        button.textContent = "Options saved!";

        setTimeout(() => {
            button.textContent = "Save";
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        textFilters: "Więcej firm\nWynik z kalkulatora\nZnajdź więcej na\nZnajdź wyniki na\nPodobne wyszukiwania\nWięcej miejsc\nPodobne pytania",
        cssFilters: `[aria-label='równa się']`
    }, (options) => {
        document.querySelector("#text-filters").value = options.textFilters;
        document.querySelector("#css-filters").value = options.cssFilters;
    });
}

document.addEventListener("DOMContentLoaded", restore_options);
document.querySelector("#save").addEventListener("click", save_options);