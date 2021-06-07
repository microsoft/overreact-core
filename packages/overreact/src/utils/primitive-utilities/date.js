
/**
 * Get the current timestamp
 * @returns {number} - the timestamp since epoch in milliseconds
*/
export function getTimestamp() {
    // TODO: this method should not be here, as it depends on Web API performance
    if (window.performance && window.performance.now && window.performance.timing) {
        return window.performance.timing.navigationStart + window.performance.now();
    }

    return Date.now();
}