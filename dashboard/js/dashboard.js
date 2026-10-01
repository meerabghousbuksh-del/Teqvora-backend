/* =========================================
   DASHBOARD
   Every number comes from /api/dashboard/*
========================================= */

var state = { page: 1, chart: null, searchTimer: null };
var $ = function (id) { return document.getElementById(id); };

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; });
}

function formatDate(value) {
    return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

async function api(path, options) {
    var response = await fetch(window.API_BASE + path, Object.assign({ credentials: 'include' }, options));

    if (response.status === 401) {
        window.location.href = 'login.html';
        throw new Error('Not logged in');
    }

    var result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Something went wrong.');
    return result.data;
}

function showError(message) {
    $('pageError').textContent = message;
    $('pageError').hidden = !message;
}

/* ---------- Lists ---------- */

function renderList(id, rows, buildHtml) {
    $(id).innerHTML = rows.length
        ? rows.map(buildHtml).join('')
        : '<li class="empty">No data yet</li>';
}

function renderCountList(id, rows) {
    renderList(id, rows, function (row) {
        return '<li><span>' + escapeHtml(row.label) + '</span><strong>' + row.count + '</strong></li>';
    });
}

/* ---------- Overview ---------- */

async function loadOverview() {
    var stats = await api('/api/dashboard/stats');
    var cards = [
        ['Total visitors', stats.totalVisitors],
        ['Page views', stats.totalPageViews],
        ['Submissions', stats.totalSubmissions],
        ["Today's visitors", stats.todayVisitors],
        ["Today's submissions", stats.todaySubmissions]
    ];

    $('statGrid').innerHTML = cards.map(function (card) {
        return '<div class="stat"><span>' + card[0] + '</span><strong>' + card[1].toLocaleString() + '</strong></div>';
    }).join('');

    renderList('recentInquiries', stats.recentSubmissions, function (item) {
        return '<li><span>' + escapeHtml(item.name) + ' <small>' + escapeHtml(item.service) + '</small></span><small>' + formatDate(item.createdAt) + '</small></li>';
    });
    renderList('recentActivity', stats.recentActivity, function (item) {
        return '<li><span>' + escapeHtml(item.path) + ' <small>' + escapeHtml(item.device) + ' / ' + escapeHtml(item.referrer) + '</small></span><small>' + formatDate(item.createdAt) + '</small></li>';
    });
}

/* ---------- Analytics ---------- */

async function loadAnalytics() {
    var data = await api('/api/dashboard/visitors?days=' + $('daysSelect').value);

    if (state.chart) state.chart.destroy();
    state.chart = new Chart($('trafficChart'), {
        type: 'line',
        data: {
            labels: data.byDay.map(function (d) { return d.date.slice(5); }),
            datasets: [
                { label: 'Visitors', data: data.byDay.map(function (d) { return d.visitors; }), borderColor: '#FF4D00', backgroundColor: 'rgba(255,77,0,0.1)', fill: true, tension: 0.3 },
                { label: 'Page views', data: data.byDay.map(function (d) { return d.pageViews; }), borderColor: '#172033', tension: 0.3 }
            ]
        },
        options: { maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
    });

    renderCountList('topPages', data.topPages);
    renderCountList('referrers', data.referrers);
    renderCountList('devices', data.devices);
    renderCountList('browsers', data.browsers);
    renderCountList('operatingSystems', data.operatingSystems);
}

/* ---------- Submissions ---------- */

async function loadSubmissions() {
    var params = new URLSearchParams({ page: state.page, limit: 15 });
    if ($('searchInput').value.trim()) params.set('search', $('searchInput').value.trim());
    if ($('statusFilter').value) params.set('status', $('statusFilter').value);
    if ($('serviceFilter').value) params.set('service', $('serviceFilter').value);

    var data = await api('/api/dashboard/submissions?' + params);

    $('submissionRows').innerHTML = data.items.length
        ? data.items.map(function (item) {
            return '<tr data-id="' + item._id + '"><td>' + escapeHtml(item.name) + '</td><td>' + escapeHtml(item.email) +
                '</td><td>' + escapeHtml(item.service) + '</td><td>' + formatDate(item.createdAt) +
                '</td><td><span class="badge badge-' + item.status + '">' + item.status + '</span></td></tr>';
        }).join('')
        : '<tr><td colspan="5" class="empty">No submissions found</td></tr>';

    $('pageInfo').textContent = 'Page ' + data.page + ' of ' + data.pages + ' (' + data.total + ' total)';
    $('prevPage').disabled = data.page <= 1;
    $('nextPage').disabled = data.page >= data.pages;
}

async function openSubmission(id) {
    var item = await api('/api/dashboard/submissions/' + id);
    var rows = [['Email', item.email], ['Service', item.service], ['Subject', item.subject || '-'], ['Status', item.status], ['Received', formatDate(item.createdAt)], ['Message', item.message]];

    $('modalName').textContent = item.name;
    $('modalDetails').innerHTML = rows.map(function (row) {
        return '<dt>' + row[0] + '</dt><dd>' + escapeHtml(row[1]) + '</dd>';
    }).join('');
    $('submissionModal').hidden = false;
}

/* ---------- Navigation & events ---------- */

var loaders = { overview: loadOverview, analytics: loadAnalytics, submissions: loadSubmissions };

async function showView(name) {
    document.querySelectorAll('.view').forEach(function (v) { v.classList.toggle('is-active', v.id === 'view-' + name); });
    document.querySelectorAll('.nav-item[data-view]').forEach(function (b) { b.classList.toggle('is-active', b.dataset.view === name); });
    $('viewTitle').textContent = name.charAt(0).toUpperCase() + name.slice(1);
    $('sidebar').classList.remove('is-open');
    showError('');

    try {
        await loaders[name]();
    } catch (error) {
        showError(error.message);
    }
}

document.querySelectorAll('.nav-item[data-view]').forEach(function (button) {
    button.addEventListener('click', function () { showView(button.dataset.view); });
});

$('menuButton').addEventListener('click', function () { $('sidebar').classList.toggle('is-open'); });
$('daysSelect').addEventListener('change', loadAnalytics);
$('prevPage').addEventListener('click', function () { state.page--; loadSubmissions(); });
$('nextPage').addEventListener('click', function () { state.page++; loadSubmissions(); });
$('modalClose').addEventListener('click', function () { $('submissionModal').hidden = true; });

['statusFilter', 'serviceFilter'].forEach(function (id) {
    $(id).addEventListener('change', function () { state.page = 1; loadSubmissions(); });
});

$('searchInput').addEventListener('input', function () {
    clearTimeout(state.searchTimer);
    state.searchTimer = setTimeout(function () { state.page = 1; loadSubmissions(); }, 350);
});

$('submissionRows').addEventListener('click', function (event) {
    var row = event.target.closest('tr[data-id]');
    if (row) openSubmission(row.dataset.id).catch(function (error) { showError(error.message); });
});

$('logoutButton').addEventListener('click', async function () {
    await api('/api/auth/logout', { method: 'POST' }).catch(function () {});
    window.location.href = 'login.html';
});

/* ---------- Start ---------- */

(async function init() {
    var me = await api('/api/auth/me'); // redirects to login if not authenticated
    $('userName').textContent = me.name;

    // Service filter options come from the same list the contact form validates against
    var services = ['Shopify Development', 'Amazon FBA Management', 'TikTok Shop Management', 'Walmart Marketplace', 'Etsy Store Management', 'Product Research & Sourcing', 'Amazon PPC', 'Product Listing Optimization', 'Branding & Graphic Design', 'Virtual Assistant Services'];
    $('serviceFilter').insertAdjacentHTML('beforeend', services.map(function (s) {
        return '<option>' + escapeHtml(s) + '</option>';
    }).join(''));

    showView('overview');
})();
