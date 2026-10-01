/* =========================================
   VISITOR ANALYTICS
   One request per page per browser session.
========================================= */

(function () {
    function randomId() {
        if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
        return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
    }

    // localStorage = same visitor across days, sessionStorage = one browsing session
    function getStoredId(storage, key) {
        var id = storage.getItem(key);
        if (!id) {
            id = randomId();
            storage.setItem(key, id);
        }
        return id;
    }

    function externalReferrer() {
        if (!document.referrer) return '';
        try {
            var host = new URL(document.referrer).hostname;
            return host === location.hostname ? '' : host;
        } catch (error) {
            return '';
        }
    }

    try {
        var visitKey = 'visited:' + location.pathname;
        if (sessionStorage.getItem(visitKey)) return; // refresh does not count again
        sessionStorage.setItem(visitKey, '1');

        fetch(window.API_BASE + '/api/analytics/visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
            body: JSON.stringify({
                visitorId: getStoredId(localStorage, 'tq_visitor'),
                sessionId: getStoredId(sessionStorage, 'tq_session'),
                path: location.pathname,
                title: document.title,
                referrer: externalReferrer()
            })
        });
    } catch (error) {
        // Analytics must never break the website
    }
})();
