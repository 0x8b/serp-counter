function getElementsByXPath(xpath, parent) {
    let results = [];

    let query = document.evaluate(xpath, parent || document.body,
        null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    for (let i = 0, length = query.snapshotLength; i < length; ++i) {
        results.push(query.snapshotItem(i));
    }

    return results;
}


function sliceIntoChunks(arr, chunkSize) {
    const results = [];

    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);

        results.push(chunk);
    }

    return results;
}


function mode(arr) {
    return arr.sort((a, b) => arr.filter(v => v === a).length - arr.filter(v => v === b).length).pop();
}


function counterOffset() {
    if (location.href) {
        const match = location.href.match(/start=(?<offset>\d+)/);

        return +match?.groups?.offset || 0;
    }

    return 0;
}



function getOffset(element) {
    const rect = element.getBoundingClientRect();

    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        height: rect.height,
    };
}


function main({ textFilters, cssFilters }) {
    const httpsElements = sliceIntoChunks(getElementsByXPath("//*[text()[contains(.,'https://')]]"), 3).map((arr) => arr.sort(() => Math.random() - 0.5)).flat();

    const ancestors = [];

    for (let i = 0; i < httpsElements.length - 1; i += 2) {
        const range = new Range();

        range.setStart(httpsElements[i], 0);
        range.setEnd(httpsElements[i + 1], 0);

        ancestors.push(range.commonAncestorContainer);
    }

    const root = mode(ancestors);
    const results = Array
        .from(document.querySelectorAll("div", root))
        .filter((node) => node.parentElement === root);

    const blacklist = textFilters
        .split("\n")
        .map(e => e.trim())
        .filter(e => e.length);

    const blacklistRegExp = blacklist.join("|");

    let filtered = results.filter((serp) => {

        // if contains blacklisted string
        if (serp.textContent.match(new RegExp(blacklistRegExp))) {
            console.log("contains blacklisted string", serp);

            // search for blacklisted strings
            const analysis = blacklist.flatMap((phrase) => {
                const elements = getElementsByXPath(`descendant::*[text()[contains(., "${phrase}")]]`, serp);

                return elements.map((element) => {
                    const bbox = element.getBoundingClientRect();

                    return bbox.width > 0 && bbox.height > 0;
                });
            });

            // return false if any blacklisted string is visible
            return !analysis.some(visible => visible);
        } else {
            return true;
        }
    });

    let position = counterOffset() + 1;

    for (let i = 0; i < filtered.length; i++) {
        const node = filtered[i];
        const subresults = [
            ...new Set(getElementsByXPath("descendant::*[text()[contains(.,'http')]]", node)
                .filter(node => node.textContent.indexOf("http://") === 0 || node.textContent.indexOf("https://") === 0)
                .map(node => getOffset(node))
                .filter(rect => rect.height > 0)
                .map(rect => Math.floor(rect.top / 10) * 10))
        ].length;

        node.setAttribute("data-serp-counter", subresults >= 2 ? `${position}-${position + subresults - 1}` : `${position}`);
        node.classList.add("serp-counter");

        position += subresults >= 2 ? subresults : 1;
    }
}

chrome.storage.sync.get(["textFilters", "cssFilters"], (options) => {
    setInterval(() => {
        if (!document.querySelector(".serp-counter")) {
            setTimeout(main(options), 750);
        }
    }, 750);

    setTimeout(main(options), 750);
});