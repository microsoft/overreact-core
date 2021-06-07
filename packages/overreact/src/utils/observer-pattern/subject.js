/* global Set */
// Use the basic APIs of ES6 Set. If your site supports browsers not
// having Set natively, you should use a polyfill

/* Subject to observe */
export class Subject {
    constructor() {
        this.observers = new Set();
    }

    /**
     * Subscribe an observer to the subject
     * @param {Object} observer - The observer subscribing to the subject
     * @returns {void}
     */
    subscribe(observer) {
        if (!(observer instanceof Object)) {
            throw new Error('Invalid observer');
        }
        this.observers.add(observer);
    }

    /**
     * Unsubscribe an observer from the subject
     * @param {Object} observer - The observer to unsubscribe
     * @returns {void}
     */
    unsubscribe(observer) {
        this.observers.delete(observer);
    }

    /**
     * Notify the observers for a certain action
     * @param {string} action -
     *  Name of the action, it will map to the handler method name on the observer
     * @param {...*} args - Additional arguments
     * @returns {void}
     */
    notify(action, ...args) {
        this.observers.forEach((observer) => {
            if (typeof observer[action] === 'function') {
                observer[action](this, ...args);
            }
        });
    }
}

  