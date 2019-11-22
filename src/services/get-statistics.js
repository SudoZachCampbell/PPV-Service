
const countKeywords = (keywordList) => {
    let keywordTracker = {}
    keywordList.forEach(keyword => {
        if(keyword in keywordTracker) {
            keywordTracker[keyword]++
        } else {
            keywordTracker[keyword] = 1
        }
    });
    return keywordTracker;
}

module.exports = {
    countKeywords
}