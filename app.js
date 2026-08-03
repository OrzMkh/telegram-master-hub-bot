let currentDashboardCategory = "bikes";
let currentBikesSubCategory = "flitgo"; // 'flitgo' or 'rich'
let selectedYear = 2026;
let currentGranularity = "month";
let currentPreset = "30days";

let customStartDate = null;
let customEndDate = null;

let selectedCityId = null;
let selectedCityIsRich = false;

let currentTaskFilter = "all"; // 'all', 'active', 'done'
let ratingSelectedTaskId = null;
let ratingSelectedValue = 5;



// Global City Modal Functions
function openEditCityModal(id, name, total, isRich) {
    selectedCityId = parseInt(id, 10);
    selectedCityIsRich = (isRich === true || isRich === 'true');

    const titleEl = document.getElementById("modalCityTitle");
    if (titleEl) titleEl.textContent = `Парк: ${name}`;

    const inputCityTotal = document.getElementById("inputCityTotal");
    if (inputCityTotal) inputCityTotal.value = total;

    document.getElementById("editCityModal")?.classList.remove("hidden");
}

function closeEditCityModal() {
    document.getElementById("editCityModal")?.classList.add("hidden");
}

async function saveCityModal() {
    const inputVal = document.getElementById("inputCityTotal")?.value;
    if (!selectedCityId || !inputVal) return;

    const total = parseInt(inputVal, 10);
    const endpoint = selectedCityIsRich ? "/api/rich/cities/update" : "/api/cities/update";

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ city_id: selectedCityId, total_bikes: total })
        });
        const data = await res.json();
        console.log("Save city response:", data);

        closeEditCityModal();
        updateDashboardView();
        loadBikesData();
        loadRichData();
    } catch (e) {
        console.error("Save city modal error:", e);
        closeEditCityModal();
    }
}

window.openEditCityModal = openEditCityModal;
window.closeEditCityModal = closeEditCityModal;
window.saveCityModal = saveCityModal;

// Task Filtering Handlers
function setTaskFilter(filter) {
    currentTaskFilter = filter;
    document.getElementById("btnFilterTaskAll")?.classList.remove("active");
    document.getElementById("btnFilterTaskActive")?.classList.remove("active");
    document.getElementById("btnFilterTaskDone")?.classList.remove("active");

    if (filter === "all") document.getElementById("btnFilterTaskAll")?.classList.add("active");
    if (filter === "active") document.getElementById("btnFilterTaskActive")?.classList.add("active");
    if (filter === "done") document.getElementById("btnFilterTaskDone")?.classList.add("active");

    loadTasksData();
}

window.setTaskFilter = setTaskFilter;

// Rating Modal Functions
function openRateTaskModal(taskId) {
    ratingSelectedTaskId = taskId;
    ratingSelectedValue = 5;
    selectTaskRating(5);

    const subEl = document.getElementById("rateTaskSubtitle");
    if (subEl) subEl.textContent = `Оценка качества выполнения задачи #${taskId}:`;

    const commInput = document.getElementById("inputRateComment");
    if (commInput) commInput.value = "";

    document.getElementById("rateTaskModal")?.classList.remove("hidden");
}

function closeRateTaskModal() {
    document.getElementById("rateTaskModal")?.classList.add("hidden");
}

function selectTaskRating(stars) {
    ratingSelectedValue = stars;
    for (let i = 1; i <= 5; i++) {
        const starBtn = document.getElementById(`star${i}`);
        if (starBtn) {
            starBtn.style.opacity = i <= stars ? "1.0" : "0.3";
            starBtn.style.transform = i <= stars ? "scale(1.2)" : "scale(1.0)";
        }
    }
}

async function saveRateTaskModal() {
    if (!ratingSelectedTaskId) return;
    const comment = document.getElementById("inputRateComment")?.value || "";

    try {
        await fetch("/api/tasks/rate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task_id: ratingSelectedTaskId, rating: ratingSelectedValue, rating_comment: comment })
        });
        closeRateTaskModal();
        loadTasksData();
        updateDashboardView();
    } catch (e) {
        console.error("Save rating error:", e);
        closeRateTaskModal();
    }
}

window.openRateTaskModal = openRateTaskModal;
window.closeRateTaskModal = closeRateTaskModal;
window.selectTaskRating = selectTaskRating;
window.saveRateTaskModal = saveRateTaskModal;

// Global Task Modal Functions
function openCreateTaskModal() {
    populateAssigneesDropdown();
    document.getElementById("createTaskModal")?.classList.remove("hidden");
}

function closeCreateTaskModal() {
    document.getElementById("createTaskModal")?.classList.add("hidden");
}

async function saveCreateTaskModal() {
    const text = document.getElementById("inputTaskText")?.value;
    const priority = document.getElementById("selectTaskPriority")?.value || "Medium";
    const city = document.getElementById("selectTaskCity")?.value || "Ташкент";
    const assignee = document.getElementById("selectTaskAssignee")?.value || "Сотрудник";
    const sla = document.getElementById("selectTaskSLA")?.value || "24 часа";

    if (!text) return;

    try {
        await fetch("/api/tasks/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task_text: text, priority: priority, city: city, assignee: assignee, sla_deadline: sla })
        });
        closeCreateTaskModal();
        loadTasksData();
        updateDashboardView();
    } catch (e) {
        console.error("Create task error:", e);
        closeCreateTaskModal();
    }
}

window.openCreateTaskModal = openCreateTaskModal;
window.closeCreateTaskModal = closeCreateTaskModal;
window.saveCreateTaskModal = saveCreateTaskModal;

// Global Rich City Modal Functions
function openAddRichCityModal() {
    document.getElementById("addRichCityModal")?.classList.remove("hidden");
}

function closeAddRichCityModal() {
    document.getElementById("addRichCityModal")?.classList.add("hidden");
}

async function saveAddRichCityModal() {
    const name = document.getElementById("inputRichCityName")?.value;
    const total = document.getElementById("inputRichCityTotal")?.value;

    if (!name || !total) return;

    try {
        await fetch("/api/rich/cities/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, total_bikes: parseInt(total, 10) })
        });
        closeAddRichCityModal();
        loadRichData();
        updateDashboardView();
    } catch (e) {
        console.error("Add rich city error:", e);
        closeAddRichCityModal();
    }
}

window.openAddRichCityModal = openAddRichCityModal;
window.closeAddRichCityModal = closeAddRichCityModal;
window.saveAddRichCityModal = saveAddRichCityModal;

// Global Add Bot Modal Functions
function openAddBotModal() {
    document.getElementById("addBotModal")?.classList.remove("hidden");
}

function closeAddBotModal() {
    document.getElementById("addBotModal")?.classList.add("hidden");
}

async function saveAddBotModal() {
    const botName = document.getElementById("inputBotName")?.value;
    const botUsername = document.getElementById("inputBotUsername")?.value;
    const botToken = document.getElementById("inputBotToken")?.value;
    const project = document.getElementById("selectBotProject")?.value;
    const city = document.getElementById("inputBotCity")?.value;
    const reportType = document.getElementById("selectBotReportType")?.value;

    if (!botName || !botToken) return;

    try {
        await fetch("/api/bots/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bot_name: botName, bot_token: botToken, bot_username: botUsername, project_type: project, city_name: city, report_type: reportType })
        });
        closeAddBotModal();
        loadBotsData();
    } catch (e) {
        console.error("Add bot error:", e);
        closeAddBotModal();
    }
}

window.openAddBotModal = openAddBotModal;
window.closeAddBotModal = closeAddBotModal;
window.saveAddBotModal = saveAddBotModal;

// Interactive Period Selector Handlers
function setGranularity(gran) {
    currentGranularity = gran;
    document.querySelectorAll(".granularity-btn").forEach(btn => {
        if (btn.getAttribute("data-gran") === gran) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    updatePeriodLabel();
    updateDashboardView();
}

function selectPeriodPreset(preset) {
    currentPreset = preset;
    document.querySelectorAll(".preset-pill").forEach(btn => {
        btn.classList.remove("active");
    });
    if (event && event.target) {
        event.target.classList.add("active");
    }
    updatePeriodLabel();
    updateDashboardView();
}

function openCustomDateModal() {
    document.getElementById("customDateModal")?.classList.remove("hidden");
}

function closeCustomDateModal() {
    document.getElementById("customDateModal")?.classList.add("hidden");
}

function applyCustomDateRange() {
    const sInput = document.getElementById("inputStartDate");
    const eInput = document.getElementById("inputEndDate");

    if (sInput && eInput && sInput.value && eInput.value) {
        customStartDate = sInput.value;
        customEndDate = eInput.value;

        const d1 = new Date(customStartDate);
        const d2 = new Date(customEndDate);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const lbl = document.getElementById("currentPeriodLabel");
        if (lbl) {
            lbl.textContent = `📅 ${customStartDate} — ${customEndDate} (${diffDays} дн.)`;
        }

        currentPreset = `custom_${customStartDate}_${customEndDate}`;

        document.querySelectorAll(".preset-pill").forEach(btn => btn.classList.remove("active"));
        document.getElementById("btnCustomDateModal")?.classList.add("active");
    }

    closeCustomDateModal();
    updateDashboardView();
}

function shiftYear(delta) {
    const targetYear = selectedYear + delta;
    if (targetYear < 2025 || targetYear > 2026) return;
    selectedYear = targetYear;
    const yearLbl = document.getElementById("selectedYearLabel");
    if (yearLbl) yearLbl.textContent = selectedYear;
    updatePeriodLabel();
    updateDashboardView();
}

function updatePeriodLabel() {
    const lbl = document.getElementById("currentPeriodLabel");
    if (!lbl) return;
    if (currentPreset.startsWith("custom_")) return;

    let text = `Июль - Август ${selectedYear} (${currentPreset})`;
    if (currentPreset === "7days") text = `Последние 7 дней (${selectedYear})`;
    if (currentPreset === "30days") text = `Последние 30 дней (${selectedYear})`;
    if (currentPreset === "90days") text = `Последние 90 дней (${selectedYear})`;
    if (currentPreset === "365days") text = `Весь ${selectedYear} год (365 дней)`;
    lbl.textContent = text;
}

window.setGranularity = setGranularity;
window.selectPeriodPreset = selectPeriodPreset;
window.openCustomDateModal = openCustomDateModal;
window.closeCustomDateModal = closeCustomDateModal;
window.applyCustomDateRange = applyCustomDateRange;
window.shiftYear = shiftYear;

// Sub-Category Switcher for Bikes (FlitGo vs Rich)
function selectBikesSubCategory(sub) {
    currentBikesSubCategory = sub;
    const btnFlitGo = document.getElementById("btnBikesFlitGo");
    const btnRich = document.getElementById("btnBikesRich");

    if (sub === "flitgo") {
        if (btnFlitGo) {
            btnFlitGo.style.background = "rgba(56,189,248,0.2)";
            btnFlitGo.style.color = "var(--accent-blue)";
            btnFlitGo.style.borderColor = "var(--accent-blue)";
        }
        if (btnRich) {
            btnRich.style.background = "rgba(255,255,255,0.05)";
            btnRich.style.color = "var(--text-muted)";
            btnRich.style.borderColor = "transparent";
        }
    } else {
        if (btnFlitGo) {
            btnFlitGo.style.background = "rgba(255,255,255,0.05)";
            btnFlitGo.style.color = "var(--text-muted)";
            btnFlitGo.style.borderColor = "transparent";
        }
        if (btnRich) {
            btnRich.style.background = "rgba(192,132,252,0.2)";
            btnRich.style.color = "var(--accent-purple)";
            btnRich.style.borderColor = "var(--accent-purple)";
        }
    }

    updateDashboardView();
}

window.selectBikesSubCategory = selectBikesSubCategory;

// Category Switcher for Dashboard
function selectDashboardCategory(category) {
    currentDashboardCategory = category;

    const btnBikes = document.getElementById("btnCatBikes");
    const btnTasks = document.getElementById("btnCatTasks");
    const bikesSubBox = document.getElementById("bikesSubCategoryBox");

    if (category === "bikes") {
        if (btnBikes) btnBikes.className = "btn category-btn active";
        if (btnTasks) btnTasks.className = "btn category-btn";
        if (bikesSubBox) bikesSubBox.style.display = "grid";
    } else {
        if (btnBikes) btnBikes.className = "btn category-btn";
        if (btnTasks) btnTasks.className = "btn category-btn active";
        if (bikesSubBox) bikesSubBox.style.display = "none";
    }

    updateDashboardView();
}

window.selectDashboardCategory = selectDashboardCategory;

// Modal for Broken Bikes Breakdown by City
async function openBrokenBikesModal() {
    const modal = document.getElementById("brokenBikesModal");
    const container = document.getElementById("brokenBikesList");

    if (modal) modal.classList.remove("hidden");
    if (!container) return;

    container.innerHTML = `<div class="loading-spinner">Загрузка отчётов по городам...</div>`;

    try {
        const res = await fetch("/api/broken_bikes_by_city");
        const list = await res.json();

        if (!list || list.length === 0) {
            container.innerHTML = `<div class="muted-text text-center">Отчёты о сломанных байках отсутствуют</div>`;
            return;
        }

        const totalBroken = list.reduce((sum, item) => sum + parseInt(item.broken_bikes || 0, 10), 0);

        container.innerHTML = list.map(item => {
            const count = parseInt(item.broken_bikes || 0, 10);
            return `
                <div class="report-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; margin-bottom:8px; background:rgba(30,41,59,0.8); border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
                    <div>
                        <div style="font-weight:700; font-size:14px; color:var(--text-main);">🏙 ${item.city}</div>
                        <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
                            👤 @${item.username || 'куратор'} • 📅 ${item.report_date || 'Последний отчёт'}
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <span class="badge" style="background:rgba(245,158,11,0.2); color:#f59e0b; border-color:#f59e0b; font-size:13px; font-weight:700; padding:4px 10px;">
                            🛠 ${count} сломано
                        </span>
                    </div>
                </div>
            `;
        }).join("") + `
            <div style="text-align:center; padding:10px; font-weight:700; color:var(--accent-purple); font-size:13px; border-top:1px dashed rgba(255,255,255,0.1); margin-top:10px;">
                Итого в ремзоне по всем городам: ${totalBroken} байков
            </div>
        `;
    } catch (e) {
        console.error("Failed to load broken bikes by city:", e);
        container.innerHTML = `<div class="muted-text text-center">Ошибка загрузки данных</div>`;
    }
}

function closeBrokenBikesModal() {
    document.getElementById("brokenBikesModal")?.classList.add("hidden");
}

window.openBrokenBikesModal = openBrokenBikesModal;
window.closeBrokenBikesModal = closeBrokenBikesModal;

// Render Team Leads HTML helper
function getTeamLeadsHTML(leadsData) {
    return leadsData.map(lead => {
        const total = lead.total || 0;
        const done = lead.done || 0;
        const active = lead.active || 0;
        const effPercent = total > 0 ? Math.round((done / total) * 100) : 0;

        let ratingScore = "5.0";
        let ratingStars = "⭐️⭐️⭐️⭐️⭐️";
        let effStatus = "Превосходно";
        let effColor = "#10b981";
        let badgeBg = "rgba(16, 185, 129, 0.15)";

        if (effPercent >= 90) {
            ratingScore = "5.0"; ratingStars = "⭐️⭐️⭐️⭐️⭐️"; effStatus = "Отлично (A+)"; effColor = "#10b981"; badgeBg = "rgba(16, 185, 129, 0.15)";
        } else if (effPercent >= 75) {
            ratingScore = "4.5"; ratingStars = "⭐️⭐️⭐️⭐️☆"; effStatus = "Отлично (A)"; effColor = "#38bdf8"; badgeBg = "rgba(56, 189, 248, 0.15)";
        } else if (effPercent >= 60) {
            ratingScore = "4.0"; ratingStars = "⭐️⭐️⭐️⭐️☆"; effStatus = "Хорошо (B)"; effColor = "#818cf8"; badgeBg = "rgba(129, 140, 248, 0.15)";
        } else if (effPercent >= 50) {
            ratingScore = "3.5"; ratingStars = "⭐️⭐️⭐️☆☆"; effStatus = "Средне (C)"; effColor = "#f59e0b"; badgeBg = "rgba(245, 158, 11, 0.15)";
        } else {
            ratingScore = "2.8"; ratingStars = "⭐️⭐️☆☆☆"; effStatus = "Низкая (D)"; effColor = "#f43f5e"; badgeBg = "rgba(244, 63, 94, 0.15)";
        }

        return `
            <div class="report-item" style="display:flex; flex-direction:column; gap:12px; margin-bottom:14px; padding:16px; border-radius:14px; background:rgba(30,41,59,0.7); border:1px solid rgba(255,255,255,0.08);">
                <div class="rep-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="rep-city" style="font-size:15px; font-weight:700;">👤 ${lead.name}</span>
                        <span class="badge" style="background:rgba(99,102,241,0.15); color:var(--accent-blue); border-color:rgba(99,102,241,0.3); font-size:11px;">${lead.role}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px; background:${badgeBg}; padding:5px 12px; border-radius:20px; border:1px solid ${effColor};">
                        <span style="font-size:13px; font-weight:700; color:${effColor};">${ratingScore} ${ratingStars}</span>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; background:rgba(15,23,42,0.6); padding:10px 12px; border-radius:10px; font-size:12px;">
                    <div>⚡️ Эффективность: <b style="color:${effColor}; font-size:13px;">${effPercent}%</b></div>
                    <div>🎯 Оценка работы: <b style="color:${effColor}; font-size:13px;">${effStatus}</b></div>
                </div>

                <div class="rep-details" style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted);">
                    <span>Всего задач: <b style="color:var(--text-main); font-size:13px;">${total}</b></span>
                    <span>В работе: <b style="color:#f59e0b; font-size:13px;">${active}</b></span>
                    <span>Завершено: <b style="color:var(--accent-emerald); font-size:13px;">${done}</b></span>
                </div>

                <div style="width:100%;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-bottom:4px;">
                        <span>Прогресс закрытия задач</span>
                        <span style="color:${effColor}; font-weight:700;">${effPercent}%</span>
                    </div>
                    <div style="width:100%; background:rgba(255,255,255,0.08); border-radius:8px; height:8px; overflow:hidden;">
                        <div style="width:${effPercent}%; background:linear-gradient(90deg, ${effColor}, var(--accent-blue)); height:100%; border-radius:8px; transition:width 0.4s ease;"></div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

let kpiChartInstance = null;
let currentKpiMonth = "2026-08";

function changeKpiMonth(val) {
    currentKpiMonth = val;
    renderKpiChartAndDetails(val);
}
window.changeKpiMonth = changeKpiMonth;

async function renderKpiChartAndDetails(month) {
    currentKpiMonth = month || currentKpiMonth;
    let leadsData = [];

    try {
        const res = await fetch(`/api/team_leads_tasks?month=${currentKpiMonth}`);
        leadsData = await res.json();
    } catch (e) {
        console.error("Fetch team leads tasks error:", e);
    }

    const labels = leadsData.map(l => l.name);
    const doneTasks = leadsData.map(l => l.done);
    const activeTasks = leadsData.map(l => l.active);
    const ratings = leadsData.map(l => l.done > 0 ? (l.avg_rating || 0) : 0);

    const canvas = document.getElementById("kpiTeamLeadsChart");
    if (canvas) {
        if (kpiChartInstance) {
            kpiChartInstance.destroy();
        }

        const ctx = canvas.getContext("2d");
        kpiChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "✅ Выполнено",
                        data: doneTasks,
                        backgroundColor: "rgba(16, 185, 129, 0.8)",
                        borderColor: "#10b981",
                        borderWidth: 1,
                        borderRadius: 6
                    },
                    {
                        label: "⚡️ В работе",
                        data: activeTasks,
                        backgroundColor: "rgba(245, 158, 11, 0.8)",
                        borderColor: "#f59e0b",
                        borderWidth: 1,
                        borderRadius: 6
                    },
                    {
                        label: "⭐️ Оценка (1-5)",
                        data: ratings,
                        type: "line",
                        borderColor: "#c084fc",
                        backgroundColor: "rgba(192, 132, 252, 0.2)",
                        pointBackgroundColor: "#c084fc",
                        pointRadius: 5,
                        yAxisID: "y1"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: "#94a3b8", font: { size: 11 } } }
                },
                scales: {
                    x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.05)" } },
                    y: {
                        beginAtZero: true,
                        ticks: { color: "#94a3b8", precision: 0 },
                        grid: { color: "rgba(255,255,255,0.05)" },
                        title: { display: true, text: "Задачи", color: "#94a3b8", font: { size: 10 } }
                    },
                    y1: {
                        position: "right",
                        min: 0,
                        max: 5,
                        ticks: { color: "#c084fc", stepSize: 1 },
                        grid: { drawOnChartArea: false },
                        title: { display: true, text: "Оценка", color: "#c084fc", font: { size: 10 } }
                    }
                }
            }
        });
    }

    const feed = document.getElementById("kpiTeamLeadsFeed");
    if (feed) {
        if (!leadsData || leadsData.length === 0) {
            feed.innerHTML = `<div class="muted-text text-center">Данных за этот месяц нет</div>`;
        } else {
            feed.innerHTML = leadsData.map(l => `
                <div style="background:rgba(30,41,59,0.7); padding:10px 14px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <div>
                        <div style="font-weight:700; font-size:13px; color:var(--text-main);">${l.name}</div>
                        <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
                            Выполнено: <b style="color:var(--accent-emerald);">${l.done}</b> из ${l.total} • Эффективность: <b style="color:var(--accent-blue);">${l.percent}%</b>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:13px; font-weight:700; color:var(--accent-purple);">${l.done > 0 ? '⭐️ ' + l.avg_rating : '—'}</span>
                        <div style="font-size:10px; color:var(--text-muted);">Средняя оценка</div>
                    </div>
                </div>
            `).join("");
        }
    }
}

// Update Dashboard View
async function updateDashboardView() {
    const container = document.getElementById("dashboardCategoryContent");
    if (!container) return;

    if (currentDashboardCategory === "bikes") {
        if (currentBikesSubCategory === "flitgo") {
            let totalBikes = 0;
            let onlineShare = 0;
            let brokenBikes = 0;
            let citiesHTML = "";

            try {
                const res = await fetch("/api/cities");
                let cities = await res.json();

                if (selectedYear === 2026) {
                    totalBikes = cities.reduce((sum, c) => sum + (parseInt(c.total_bikes, 10) || 0), 0);
                    let totalIssued = cities.reduce((sum, c) => sum + (parseInt(c.issued, 10) || 0), 0);
                    brokenBikes = cities.reduce((sum, c) => sum + (parseInt(c.broken_bikes, 10) || 0), 0);
                    onlineShare = totalBikes > 0 ? Math.min(100, Math.round(((totalIssued + brokenBikes) / totalBikes) * 100)) : 0;
                }

                cities.sort((a, b) => (a.name.includes("Ташкент") ? -1 : b.name.includes("Ташкент") ? 1 : a.id - b.id));

                citiesHTML = cities.map(c => {
                    const iss = selectedYear === 2026 ? (c.issued || 0) : 0;
                    const pct = selectedYear === 2026 ? (c.percent_online || 0) : 0;
                    return `
                    <div class="city-card" style="margin-bottom:10px;">
                        <div class="city-header">
                            <span class="city-name" style="font-size:15px; font-weight:700;">🏙 ${c.name}</span>
                            <button class="btn-edit-city" onclick="openEditCityModal('${c.id}', '${c.name}', ${c.total_bikes}, false)">✏️ Изменить</button>
                        </div>
                        <div class="city-metrics" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
                            <div class="metric"><span class="val" style="font-size:14px;">${c.total_bikes.toLocaleString('ru-RU')}</span><span class="lbl">Парк</span></div>
                            <div class="metric"><span class="val" style="font-size:14px; color:var(--accent-blue);">${iss.toLocaleString('ru-RU')}</span><span class="lbl">На линии</span></div>
                            <div class="metric"><span class="val" style="font-size:14px; color:var(--accent-emerald);">${pct}%</span><span class="lbl">% На линии</span></div>
                        </div>
                    </div>
                `}).join("");
            } catch (e) {
                console.error("Cities fetch error:", e);
            }

            container.innerHTML = `
                <div class="stats-grid" style="margin-top:16px; margin-bottom:16px;">
                    <div class="stat-card gradient-blue">
                        <div class="stat-icon">🛵</div>
                        <div class="stat-val">${totalBikes.toLocaleString("ru-RU")}</div>
                        <div class="stat-lbl">Всего байков FlitGo</div>
                    </div>
                    <div class="stat-card gradient-emerald">
                        <div class="stat-icon">📊</div>
                        <div class="stat-val">${onlineShare}%</div>
                        <div class="stat-lbl">Доля на линии</div>
                    </div>
                    <div class="stat-card gradient-amber" onclick="openBrokenBikesModal()" style="grid-column: span 2; cursor: pointer; border: 1px solid rgba(245,158,11,0.4); transition: transform 0.2s ease;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div class="stat-icon">🛠</div>
                            <span class="badge" style="background:rgba(245,158,11,0.2); color:#f59e0b; border-color:#f59e0b; font-size:10px;">🔍 Нажмите для деталей по городам</span>
                        </div>
                        <div class="stat-val" style="color:#f59e0b; font-size:26px; font-weight:700; margin-top:4px;">${brokenBikes}</div>
                        <div class="stat-lbl">Байков в ремзоне / на сервисе</div>
                    </div>
                </div>

                <div class="card-box">
                    <div class="card-header" style="margin-bottom:12px;">
                        <h4>🏙 Города парка FlitGo</h4>
                        <span class="badge" style="color:var(--accent-blue);">Лимиты парка</span>
                    </div>
                    <div class="cities-grid">
                        ${citiesHTML}
                    </div>
                </div>
            `;
        } else if (currentBikesSubCategory === "rich") {
            let totalRichFleet = 350;
            let activeBots = 3;

            let richCitiesHTML = "";
            try {
                const resStats = await fetch("/api/rich/stats");
                const stats = await resStats.json();
                totalRichFleet = stats.total_rich_fleet || 350;
                activeBots = stats.active_rich_bots || 3;

                const resCities = await fetch("/api/rich/cities");
                let cities = await resCities.json();
                cities.sort((a, b) => (a.name.includes("Ташкент") ? -1 : b.name.includes("Ташкент") ? 1 : a.id - b.id));

                richCitiesHTML = cities.map(c => `
                    <div class="city-card" style="margin-bottom:8px;">
                        <div class="city-header">
                            <span class="city-name" style="font-size:15px; font-weight:700;"><b style="color:#f97316;">R</b> ${c.name}</span>
                            <button class="btn-edit-city" onclick="openEditCityModal('${c.id}', '${c.name}', ${c.total_bikes}, true)">✏️ Изменить</button>
                        </div>
                        <div class="city-metrics" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
                            <div class="metric"><span class="val" style="color:var(--accent-purple); font-size:14px;">${c.total_bikes}</span><span class="lbl">Парк</span></div>
                            <div class="metric"><span class="val" style="color:var(--accent-blue); font-size:14px;">${c.issued || 0}</span><span class="lbl">На линии</span></div>
                            <div class="metric"><span class="val" style="color:var(--accent-emerald); font-size:14px;">${c.percent_online || 0}%</span><span class="lbl">% На линии</span></div>
                        </div>
                    </div>
                `).join("");
            } catch (e) {
                console.error("Rich fetch error:", e);
            }

            let richReportsHTML = "";
            try {
                const resRep = await fetch("/api/rich/reports");
                const reports = await resRep.json();
                if (reports.length === 0) {
                    richReportsHTML = `<div class="muted-text text-center">Отчёты Rich пока отсутствуют</div>`;
                } else {
                    richReportsHTML = reports.map(r => `
                        <div class="report-item" style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:10px 14px; border-radius:10px; margin-bottom:8px;">
                            <div>
                                <div style="font-weight:700; font-size:14px; color:var(--text-main);"><b style="color:#f97316;">R</b> ${r.city || 'Город Rich'}</div>
                                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">👤 @${r.username || 'оператор'} • 📅 ${r.report_date || ''}</div>
                                ${r.comment ? `<div style="font-size:12px; color:#f59e0b; margin-top:2px;">💬 ${r.comment}</div>` : ''}
                            </div>
                            <div style="text-align:right;">
                                <div style="font-size:13px; color:var(--accent-blue);">🛵 Выдано: <b>${r.issued || 0}</b></div>
                                <div style="font-size:12px; color:var(--text-muted);">🏠 На базе: <b>${r.returned || 0}</b></div>
                            </div>
                        </div>
                    `).join("");
                }
            } catch(e) {
                console.error("Rich reports fetch error:", e);
            }

            container.innerHTML = `
                <div class="stats-grid" style="margin-top:16px; margin-bottom:16px;">
                    <div class="stat-card gradient-purple">
                        <div class="stat-icon"><b style="color:#f97316; font-weight:900;">R</b></div>
                        <div class="stat-val" style="color:var(--accent-purple);">${totalRichFleet}</div>
                        <div class="stat-lbl">Общий парк Гибридов Rich</div>
                    </div>
                    <div class="stat-card gradient-emerald">
                        <div class="stat-icon">🤖</div>
                        <div class="stat-val">${activeBots}</div>
                        <div class="stat-lbl">Ботов Rich</div>
                    </div>
                </div>

                <div class="card-box" style="margin-bottom:16px;">
                    <div class="card-header" style="margin-bottom:12px;">
                        <h4>🏙 Города и сервисы Rich</h4>
                        <span class="badge" style="color:var(--accent-purple);">Экосистема Rich</span>
                    </div>
                    <div class="cities-grid">
                        ${richCitiesHTML}
                    </div>
                </div>

                <div class="card-box">
                    <div class="card-header" style="margin-bottom:12px;">
                        <h4>📊 Отчётность Rich</h4>
                        <span class="badge" style="color:var(--accent-emerald);">Живые отчёты</span>
                    </div>
                    <div id="richReportsList">
                        ${richReportsHTML}
                    </div>
                </div>
            `;
        }
    } else if (currentDashboardCategory === "tasks") {
        let leadsData = [];

        try {
            const res = await fetch(`/api/team_leads_tasks?month=${currentKpiMonth}`);
            leadsData = await res.json();
        } catch (e) {
            console.error("Fetch team leads tasks error:", e);
        }

        const grandTotal = leadsData.reduce((acc, l) => acc + l.total, 0);
        const grandActive = leadsData.reduce((acc, l) => acc + l.active, 0);
        const grandDone = leadsData.reduce((acc, l) => acc + l.done, 0);
        const grandEff = grandTotal > 0 ? Math.round((grandDone / grandTotal) * 100) : 0;

        container.innerHTML = `
            <div class="stats-grid" style="margin-top:16px; margin-bottom:16px;">
                <div class="stat-card gradient-blue">
                    <div class="stat-icon">📋</div>
                    <div class="stat-val">${grandTotal}</div>
                    <div class="stat-lbl">Всего задач</div>
                </div>
                <div class="stat-card gradient-amber">
                    <div class="stat-icon">⚡️</div>
                    <div class="stat-val">${grandActive}</div>
                    <div class="stat-lbl">В работе</div>
                </div>
                <div class="stat-card gradient-emerald">
                    <div class="stat-icon">✅</div>
                    <div class="stat-val">${grandDone}</div>
                    <div class="stat-lbl">Успешно закрыто</div>
                </div>
                <div class="stat-card gradient-purple">
                    <div class="stat-icon">📊</div>
                    <div class="stat-val">${grandEff}%</div>
                    <div class="stat-lbl">Общая Эффективность</div>
                </div>
            </div>

            <div class="card-box">
                <div class="card-header" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <h4>📊 Фактические результаты Тимлидов</h4>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:12px; color:var(--text-muted);">Месяц:</span>
                        <select id="selectKpiMonth" class="form-input" onchange="changeKpiMonth(this.value)" style="padding:4px 10px; font-size:12px; margin:0; width:auto; background:rgba(30,41,59,0.9); border-color:var(--accent-purple);">
                            <option value="2026-08" ${currentKpiMonth === '2026-08' ? 'selected' : ''}>Август 2026</option>
                            <option value="2026-07" ${currentKpiMonth === '2026-07' ? 'selected' : ''}>Июль 2026</option>
                            <option value="2026-06" ${currentKpiMonth === '2026-06' ? 'selected' : ''}>Июнь 2026</option>
                            <option value="2026-05" ${currentKpiMonth === '2026-05' ? 'selected' : ''}>Май 2026</option>
                        </select>
                    </div>
                </div>

                <div style="position:relative; height:220px; margin: 12px 0;">
                    <canvas id="kpiTeamLeadsChart"></canvas>
                </div>

                <div id="kpiTeamLeadsFeed" class="reports-feed" style="margin-top:12px;"></div>
            </div>
        `;

        setTimeout(() => {
            renderKpiChartAndDetails(currentKpiMonth);
        }, 50);
    }
}

window.updateDashboardView = updateDashboardView;

// Global switchTab function
function switchTab(targetTab) {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(b => {
        if (b.getAttribute("data-tab") === targetTab) {
            b.classList.add("active");
        } else {
            b.classList.remove("active");
        }
    });

    tabContents.forEach(c => {
        if (c.id === `tab-${targetTab}`) {
            c.classList.add("active");
        } else {
            c.classList.remove("active");
        }
    });

    if (targetTab === "overview") updateDashboardView();
    if (targetTab === "bikes") loadBikesData();
    if (targetTab === "tasks") loadTasksData();
    if (targetTab === "employees") loadUsersData();
    if (targetTab === "rich") loadRichData();
    if (targetTab === "payroll") loadPayrollData();
    if (targetTab === "bots") loadBotsData();
}

window.switchTab = switchTab;

let currentTelegramUser = null;

async function loadBikesData() {
    const citiesList = document.getElementById("citiesList");
    const recentReportsList = document.getElementById("recentReportsList");

    try {
        const resCities = await fetch("/api/cities");
        let cities = await resCities.json();
        cities.sort((a, b) => (a.name.includes("Ташкент") ? -1 : b.name.includes("Ташкент") ? 1 : a.id - b.id));

        if (cities.length === 0) {
            citiesList.innerHTML = `<div class="muted-text text-center">Города не найдены</div>`;
        } else {
            citiesList.innerHTML = cities.map(c => `
                <div class="city-card" style="margin-bottom:10px;">
                    <div class="city-header">
                        <span class="city-name" style="font-size:15px; font-weight:700;">🏙 ${c.name}</span>
                        <button class="btn-edit-city" onclick="openEditCityModal('${c.id}', '${c.name}', ${c.total_bikes}, false)">✏️ Изменить</button>
                    </div>
                    <div class="city-metrics" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
                        <div class="metric"><span class="val" style="font-size:14px;">${c.total_bikes.toLocaleString('ru-RU')}</span><span class="lbl">Парк</span></div>
                        <div class="metric"><span class="val" style="font-size:14px; color:var(--accent-blue);">${(c.issued || 0).toLocaleString('ru-RU')}</span><span class="lbl">На линии</span></div>
                        <div class="metric"><span class="val" style="font-size:14px; color:var(--accent-emerald);">${c.percent_online || 0}%</span><span class="lbl">% На линии</span></div>
                    </div>
                </div>
            `).join("");
        }

        const resReports = await fetch("/api/reports");
        const reports = await resReports.json();

        if (reports.length === 0) {
            recentReportsList.innerHTML = `<div class="muted-text text-center">Отчёты пока отсутствуют</div>`;
        } else {
            recentReportsList.innerHTML = reports.map(r => `
                <div class="report-item">
                    <div class="rep-header">
                        <span class="rep-city">🏙 ${r.city || 'Город'}</span>
                        <span class="rep-date">${r.report_date || ''}</span>
                    </div>
                    <div class="rep-details">
                        <span>👤 @${r.username || 'куратор'}</span>
                        <span>Выдано: <b>${r.issued || 0}</b></span>
                        <span>Сломано: <b style="color:var(--accent-red)">${r.broken_bikes || 0}</b></span>
                    </div>
                </div>
            `).join("");
        }

    } catch (e) {
        console.error("Failed to load bikes data:", e);
    }
}

function getSlaBadge(t) {
    const isDone = t.status === "Done";
    let isOverdue = false;

    if (t.is_overdue === 1 || t.is_overdue === true) {
        isOverdue = true;
    } else if (t.sla_deadline && t.sla_deadline.includes("-")) {
        const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
        const checkTime = isDone && t.completed_at ? t.completed_at : nowStr;
        if (checkTime > t.sla_deadline) {
            isOverdue = true;
        }
    }

    if (isDone) {
        if (isOverdue) {
            return `<span style="color:#f43f5e; font-weight:700;">⚠️ Просрочено</span>`;
        } else {
            return `<span style="color:#10b981; font-weight:700;">✅ Сделано вовремя</span>`;
        }
    } else {
        if (isOverdue) {
            return `<span style="color:#f43f5e; font-weight:700;">⚠️ Просрочено (${t.sla_deadline || '24 часа'})</span>`;
        } else {
            const slaText = t.sla_deadline ? t.sla_deadline : "24 часа";
            return `<span style="color:var(--accent-blue); font-weight:600;">${slaText}</span>`;
        }
    }
}

async function loadTasksData() {
    const tasksList = document.getElementById("tasksList");

    try {
        const res = await fetch("/api/tasks");
        let tasks = await res.json();

        // Apply task status filtering
        if (currentTaskFilter === "active") tasks = tasks.filter(t => t.status !== "Done");
        if (currentTaskFilter === "done") tasks = tasks.filter(t => t.status === "Done");

        const countBadge = document.getElementById("taskCountBadge");
        if (countBadge) countBadge.textContent = `Показано: ${tasks.length}`;

        if (tasks.length === 0) {
            tasksList.innerHTML = `<div class="muted-text text-center">Задач не найдено</div>`;
        } else {
            tasksList.innerHTML = tasks.map(t => {
                const isDone = t.status === "Done";
                const statusClass = isDone ? "closed" : "active";
                const statusText = isDone ? "Завершено" : "В работе";

                const priority = t.priority || "Medium";
                let prioBadge = `<span class="badge" style="background:rgba(245,158,11,0.15); color:#f59e0b; border-color:#f59e0b; font-size:10px;">🟡 Средний</span>`;
                if (priority === "High") prioBadge = `<span class="badge" style="background:rgba(244,63,94,0.15); color:#f43f5e; border-color:#f43f5e; font-size:10px;">🔴 Срочно</span>`;
                if (priority === "Low") prioBadge = `<span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; border-color:#10b981; font-size:10px;">🟢 Обычный</span>`;

                const rating = t.rating || 0;
                let ratingHTML = "";
                if (isDone) {
                    if (rating > 0) {
                        const starsStr = "⭐️".repeat(rating);
                        ratingHTML = `
                            <div style="margin-top:10px; padding:8px 12px; background:rgba(192,132,252,0.15); border-radius:10px; border:1px solid var(--accent-purple); display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <span style="font-size:12px; font-weight:700; color:var(--accent-purple);">Оценка админа: ${starsStr} (${rating}/5)</span>
                                    ${t.rating_comment ? `<div style="font-size:11px; color:var(--text-muted); margin-top:2px;">💬 "${t.rating_comment}"</div>` : ''}
                                </div>
                                <button class="btn-sm" onclick="openRateTaskModal(${t.id})" style="font-size:10px; padding:3px 8px;">✏️ Изменить</button>
                            </div>
                        `;
                    } else {
                        ratingHTML = `
                            <button class="btn-sm btn-primary-sm" onclick="openRateTaskModal(${t.id})" style="margin-top:10px; width:100%; background:linear-gradient(135deg, #c084fc, #9333ea);">
                                ⭐️ Оценить работу (1-5 звезд)
                            </button>
                        `;
                    }
                }

                return `
                <div class="task-card" style="margin-bottom:12px; padding:14px; background:rgba(30,41,59,0.7); border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
                    <div class="task-header" style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span class="task-id" style="font-weight:700;">#${t.id}</span>
                            ${prioBadge}
                        </div>
                        <span class="task-status ${statusClass}">${statusText}</span>
                    </div>

                    <div class="task-text" style="font-size:14px; font-weight:600; margin:8px 0; color:var(--text-main);">${t.task_text}</div>

                    <div class="task-meta" style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--text-muted);">
                        <span>👤 Исполнитель: <b style="color:var(--text-main);">${t.assignee || 'Команда'}</b></span>
                        <span>⏱ SLA: ${getSlaBadge(t)}</span>
                    </div>

                    ${!isDone ? `<button class="btn-sm btn-primary-sm" onclick="completeTaskAction(${t.id})" style="margin-top:10px; width:100%;">✅ Завершить задачу</button>` : ''}
                    ${ratingHTML}
                </div>
            `;
            }).join("");
        }
    } catch (e) {
        console.error("Failed to load tasks data:", e);
    }
}

async function completeTaskAction(taskId) {
    try {
        await fetch("/api/tasks/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task_id: taskId })
        });
        loadTasksData();
        updateDashboardView();
    } catch (e) {
        console.error("Complete task error:", e);
    }
}

window.completeTaskAction = completeTaskAction;

async function populateAssigneesDropdown() {
    const dropdown = document.getElementById("selectTaskAssignee");
    if (!dropdown) return;

    const defaultTeam = [
        { name: "Ильясбек", username: "isslamov", role: "Тимлид" },
        { name: "Мужахидбек", username: "axi0603", role: "Тимлид" },
        { name: "Жахабек", username: "Silent_trickster", role: "Тимлид" }
    ];

    let options = `<option value="Команда">Укажите исполнителя...</option>`;

    defaultTeam.forEach(t => {
        options += `<option value="@${t.username}">${t.name} (@${t.username})</option>`;
    });

    try {
        const res = await fetch("/api/users");
        const users = await res.json();
        users.forEach(u => {
            const uname = (u.username || "").replace("@", "").trim();
            if (uname && !defaultTeam.some(dt => dt.username.toLowerCase() === uname.toLowerCase())) {
                const name = u.full_name || u.username || `User ${u.user_id}`;
                options += `<option value="@${uname}">${name} (@${uname})</option>`;
            }
        });
    } catch (e) {
        console.error("Fetch users for dropdown error:", e);
    }

    dropdown.innerHTML = options;
}

async function loadUsersData() {
    const usersList = document.getElementById("usersList");
    if (!usersList) return;
    try {
        const res = await fetch("/api/users");
        const users = await res.json();

        if (users.length === 0) {
            usersList.innerHTML = `<div class="muted-text text-center">Пользователи не найдены</div>`;
        } else {
            usersList.innerHTML = users.map(u => `
                <div class="user-card">
                    <div class="user-card-info">
                        <div class="u-name">${u.full_name || u.username || 'Пользователь'}</div>
                        <div class="u-meta">@${u.username || 'no_user'} • Роль: ${u.role || 'Partner'}</div>
                    </div>
                    <button class="toggle-access-btn ${u.is_active ? 'active' : ''}" data-id="${u.user_id}" data-active="${u.is_active}">
                        ${u.is_active ? '✅ Доступ виден' : '🚫 Заблокирован'}
                    </button>
                </div>
            `).join("");

            document.querySelectorAll(".toggle-access-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const uid = parseInt(btn.getAttribute("data-id"), 10);
                    const currActive = parseInt(btn.getAttribute("data-active"), 10);
                    const newActive = currActive === 1 ? 0 : 1;

                    await fetch("/api/users/toggle_access", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: uid, is_active: newActive })
                    });
                    loadUsersData();
                });
            });
        }
    } catch (e) {
        console.error("Failed to load users data:", e);
    }
}

async function loadRichData() {
    const richCitiesList = document.getElementById("richCitiesList");
    const richReportsList = document.getElementById("richReportsList");

    try {
        const resStats = await fetch("/api/rich/stats");
        const stats = await resStats.json();
        document.getElementById("richStatFleet").textContent = stats.total_rich_fleet || 0;
        document.getElementById("richStatBots").textContent = stats.active_rich_bots || 3;

        const resCities = await fetch("/api/rich/cities");
        let cities = await resCities.json();
        cities.sort((a, b) => (a.name.includes("Ташкент") ? -1 : b.name.includes("Ташкент") ? 1 : a.id - b.id));

        if (cities.length === 0) {
            richCitiesList.innerHTML = `<div class="muted-text text-center">Города Rich не найдены</div>`;
        } else {
            richCitiesList.innerHTML = cities.map(c => `
                <div class="city-card">
                    <div class="city-header">
                        <span class="city-name">🅁 ${c.name}</span>
                        <button class="btn-edit-city" onclick="openEditCityModal('${c.id}', '${c.name}', ${c.total_bikes}, true)">✏️ Изменить</button>
                    </div>
                    <div class="city-metrics">
                        <div class="metric"><span class="val">${c.total_bikes}</span><span class="lbl">Лимит Гибридов Rich</span></div>
                        <div class="metric"><span class="val">100%</span><span class="lbl">Аптайм</span></div>
                    </div>
                </div>
            `).join("");
        }

        const resReports = await fetch("/api/rich/reports");
        const reports = await resReports.json();

        if (reports.length === 0) {
            richReportsList.innerHTML = `<div class="muted-text text-center">Отчёты Rich пока отсутствуют</div>`;
        } else {
            richReportsList.innerHTML = reports.map(r => `
                <div class="report-item">
                    <div class="rep-header">
                        <span class="rep-city">🅁 ${r.city || 'Город Rich'}</span>
                        <span class="rep-date">${r.report_date || ''}</span>
                    </div>
                    <div class="rep-details">
                        <span>👤 @${r.username || 'оператор'}</span>
                        <span>Выдано: <b>${r.issued || 0}</b></span>
                    </div>
                </div>
            `).join("");
        }

    } catch (e) {
        console.error("Failed to load rich data:", e);
    }
}

async function loadPayrollData() {
    const payrollList = document.getElementById("payrollList");
    if (!payrollList) return;
    try {
        const res = await fetch("/api/payroll");
        const list = await res.json();

        if (list.length === 0) {
            payrollList.innerHTML = `<div class="muted-text text-center">Сохранённых расчётов пока нет</div>`;
        } else {
            payrollList.innerHTML = list.map(item => `
                <div class="report-item">
                    <div class="rep-header">
                        <span class="rep-city">👤 ${item.employee_name}</span>
                        <span class="rep-date">${item.payment_date}</span>
                    </div>
                    <div class="rep-details" style="flex-wrap:wrap; gap:8px;">
                        <span>Аванс: <b>${(item.advance_amount || 0).toLocaleString()} сум</b></span>
                        <span>ЗП: <b>${(item.salary_amount || 0).toLocaleString()} сум</b></span>
                        <span>Налог (24%): <b style="color:#f59e0b">${(item.tax_amount || 0).toLocaleString()} сум</b></span>
                        <span>ФОТ: <b style="color:var(--accent-purple)">${(item.total_fot || 0).toLocaleString()} сум</b></span>
                    </div>
                </div>
            `).join("");
        }
    } catch (e) {
        console.error("Failed to load payroll data:", e);
    }
}

let currentBotsList = [];
let editingBotId = null;

async function loadBotsData() {
    const botsList = document.getElementById("botsList");
    if (!botsList) return;
    try {
        const res = await fetch("/api/bots");
        currentBotsList = await res.json();

        if (currentBotsList.length === 0) {
            botsList.innerHTML = `<div class="muted-text text-center">Подключенные боты отсутствуют</div>`;
        } else {
            botsList.innerHTML = currentBotsList.map(b => {
                const icon = b.project_type === "Rich" ? '<b style="color:#f97316; font-size:16px; font-weight:900; margin-right:4px;">R</b>' : (b.project_type === "FlitGo" ? "🛵" : "🤖");
                const cleanName = (b.bot_name || "").replace(/💎|🅁|🛵|📋|🤖/g, "").trim();
                return `
                <div class="user-card" onclick="openEditBotModal(${b.id})" style="cursor:pointer; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='scale(1.0)'">
                    <div class="user-card-info">
                        <div class="u-name">${icon} ${cleanName} <span class="badge" style="font-size:10px; margin-left:6px; ${b.project_type === 'Rich' ? 'border-color:#f97316; color:#f97316;' : ''}">${b.project_type}</span></div>
                        <div class="u-meta">🏙 ${b.city_name} • Тип: ${b.report_type} • Token: ${b.bot_token ? b.bot_token.slice(0, 10) : ''}...</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button class="btn-sm btn-secondary-sm" onclick="event.stopPropagation(); openEditBotModal(${b.id})" style="padding:4px 8px; font-size:11px;">✏️ Инфо</button>
                        <button class="toggle-access-btn toggle-bot-btn ${b.is_active ? 'active' : ''}" data-id="${b.id}" data-active="${b.is_active}" onclick="event.stopPropagation();">
                            ${b.is_active ? '🟢 Активен' : '🔴 Отключён'}
                        </button>
                    </div>
                </div>
            `;
            }).join("");

            document.querySelectorAll(".toggle-bot-btn").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const botId = parseInt(btn.getAttribute("data-id"), 10);
                    const currActive = parseInt(btn.getAttribute("data-active"), 10);
                    const newActive = currActive === 1 ? 0 : 1;

                    await fetch("/api/bots/toggle", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ bot_id: botId, is_active: newActive })
                    });
                    loadBotsData();
                });
            });
        }
    } catch (e) {
        console.error("Failed to load bots data:", e);
    }
}

function updateEditBotTgLinkPreview() {
    const rawUser = document.getElementById("editBotUsername")?.value.trim() || "";
    const token = document.getElementById("editBotToken")?.value.trim() || "";
    const linkEl = document.getElementById("editBotTgLink");
    if (!linkEl) return;

    if (rawUser) {
        let clean = rawUser.replace("https://t.me/", "").replace("t.me/", "").replace("@", "").trim();
        linkEl.href = `https://t.me/${clean}`;
        linkEl.textContent = `https://t.me/${clean}`;
    } else {
        const tokenParts = token.split(":");
        if (tokenParts.length > 0 && tokenParts[0].length > 3) {
            linkEl.href = `https://t.me/bot${tokenParts[0]}`;
            linkEl.textContent = `https://t.me/bot${tokenParts[0]}`;
        } else {
            linkEl.href = "https://t.me/BotFather";
            linkEl.textContent = "https://t.me/BotFather";
        }
    }
}

function openEditBotModal(botId) {
    const b = currentBotsList.find(item => item.id === botId);
    if (!b) return;

    editingBotId = botId;
    document.getElementById("editBotName").value = b.bot_name || "";
    document.getElementById("editBotUsername").value = b.bot_username ? `@${b.bot_username}` : "";
    document.getElementById("editBotProject").value = b.project_type || "FlitGo";
    document.getElementById("editBotCity").value = b.city_name || "";
    document.getElementById("editBotReportType").value = b.report_type || "Отчёт по байкам";
    document.getElementById("editBotToken").value = b.bot_token || "";

    updateEditBotTgLinkPreview();
    document.getElementById("editBotModal")?.classList.remove("hidden");
}

function closeEditBotModal() {
    editingBotId = null;
    document.getElementById("editBotModal")?.classList.add("hidden");
}

async function saveEditBotModal() {
    if (!editingBotId) return;

    const botName = document.getElementById("editBotName")?.value.trim();
    const botUsername = document.getElementById("editBotUsername")?.value.trim();
    const projectType = document.getElementById("editBotProject")?.value;
    const cityName = document.getElementById("editBotCity")?.value.trim();
    const reportType = document.getElementById("editBotReportType")?.value;
    const botToken = document.getElementById("editBotToken")?.value.trim();

    if (!botName || !botToken) {
        alert("⚠️ Название бота и токен обязательны!");
        return;
    }

    try {
        const res = await fetch("/api/bots/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                bot_id: editingBotId,
                bot_name: botName,
                bot_username: botUsername,
                project_type: projectType,
                city_name: cityName,
                report_type: reportType,
                bot_token: botToken
            })
        });
        if (res.ok) {
            closeEditBotModal();
            loadBotsData();
        } else {
            alert("❌ Ошибка при сохранении бота");
        }
    } catch (e) {
        console.error("Failed to update bot:", e);
        alert("❌ Ошибка соединения с сервером");
    }
}

async function deleteBotFromModal() {
    if (!editingBotId) return;
    if (!confirm("⚠️ Вы уверены, что хотите удалить этого бота из системы?")) return;

    try {
        const res = await fetch("/api/bots/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bot_id: editingBotId })
        });
        if (res.ok) {
            closeEditBotModal();
            loadBotsData();
        } else {
            alert("❌ Ошибка при удалении бота");
        }
    } catch (e) {
        console.error("Failed to delete bot:", e);
        alert("❌ Ошибка соединения с сервером");
    }
}

window.openEditBotModal = openEditBotModal;
window.closeEditBotModal = closeEditBotModal;
window.saveEditBotModal = saveEditBotModal;
window.deleteBotFromModal = deleteBotFromModal;
window.updateEditBotTgLinkPreview = updateEditBotTgLinkPreview;

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Telegram WebApp SDK if available
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
        if (tg.initDataUnsafe?.user) {
            currentTelegramUser = tg.initDataUnsafe.user;
            const u = currentTelegramUser;
            const name = u.first_name + (u.last_name ? " " + u.last_name : "");
            document.getElementById("userName").textContent = name;
            if (u.photo_url) {
                document.getElementById("userAvatar").innerHTML = `<img src="${u.photo_url}" style="width:100%;height:100%;border-radius:50%">`;
            }
        }
    }

    // Initialize Dashboard
    selectDashboardCategory("bikes");
    populateAssigneesDropdown();

    // Setup ZP Excel Upload Listeners
    const btnUpload = document.getElementById("btnTriggerExcelUpload");
    const fileInput = document.getElementById("excelFileInput");

    if (btnUpload && fileInput) {
        btnUpload.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            btnUpload.textContent = "⏳ Загрузка...";
            btnUpload.disabled = true;

            const reader = new FileReader();
            reader.onload = async (evt) => {
                const b64 = evt.target.result.split(",")[1];
                try {
                    const res = await fetch("/api/payroll/upload_schedule", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ file_b64: b64 })
                    });
                    
                    if (!res.ok) {
                        const errData = await res.json();
                        alert("Ошибка: " + (errData.error || "Не удалось распарсить файл"));
                        return;
                    }

                    const data = await res.json();
                    renderParsedPayrollData(data);
                } catch (err) {
                    console.error("Upload error:", err);
                    alert("Ошибка при передаче файла на сервер");
                } finally {
                    btnUpload.textContent = "📥 Загрузить График (.xlsx)";
                    btnUpload.disabled = false;
                    fileInput.value = ""; // reset
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // Handlers for Download and Telegram send buttons
    document.getElementById("btnDownloadExcelReport")?.addEventListener("click", () => {
        window.open("/api/payroll/download_excel", "_blank");
    });

    document.getElementById("btnSendTelegramExcelReport")?.addEventListener("click", async () => {
        const btn = document.getElementById("btnSendTelegramExcelReport");
        if (btn) {
            btn.textContent = "⏳ Отправка...";
            btn.disabled = true;
        }
        try {
            const res = await fetch("/api/payroll/send_telegram", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: "-1002638798110" })
            });
            const data = await res.json();
            if (data.status === "ok") {
                alert("📊 Ведомость успешно отправлена в Telegram группу!");
            } else {
                alert("Ошибка отправки: " + (data.error || "Неизвестная ошибка"));
            }
        } catch (err) {
            alert("Ошибка отправки в Telegram");
        } finally {
            if (btn) {
                btn.textContent = "📲 В Telegram";
                btn.disabled = false;
            }
        }
    });
});

function renderParsedPayrollData(data) {
    const summary = data.summary;
    const employees = data.employees;

    const box = document.getElementById("excelSummaryBox");
    if (box) box.classList.remove("hidden");

    document.getElementById("excelTotalAdvance").textContent = (summary.total_advance || 0).toLocaleString() + " сум";
    document.getElementById("excelTotalNet").textContent = (summary.total_net || 0).toLocaleString() + " сум";
    document.getElementById("excelTotalTax").textContent = (summary.total_tax || 0).toLocaleString() + " сум";
    document.getElementById("excelTotalFot").textContent = (summary.total_fot || 0).toLocaleString() + " сум";

    const tableContainer = document.getElementById("excelEmployeesTable");
    if (tableContainer) {
        if (!employees || employees.length === 0) {
            tableContainer.innerHTML = `<div class="muted-text text-center">Сотрудники не найдены</div>`;
        } else {
            tableContainer.innerHTML = employees.map((emp, idx) => `
                <div class="report-item" style="border-left: 3px solid var(--accent-purple); padding: 10px; margin-bottom: 8px; background: rgba(30, 41, 59, 0.5);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-weight:700; color:var(--text-main); font-size:13px;">${idx + 1}. ${emp.name}</span>
                        <span class="badge" style="font-size:10px; padding:2px 6px;">${emp.role}</span>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; font-size:11px; color:var(--text-muted);">
                        <div>Смены: <b style="color:var(--text-main);">${emp.exact_shifts}</b></div>
                        <div>Аванс: <b>${(emp.advance || 0).toLocaleString()}</b></div>
                        <div>ЗП к выдаче: <b style="color:var(--accent-blue);">${(emp.net_pay || 0).toLocaleString()}</b></div>
                        <div>Оклад: <b>${(emp.base_salary || 0).toLocaleString()}</b></div>
                        <div>Налог (24%): <b>${(emp.tax || 0).toLocaleString()}</b></div>
                        <div>ФОТ: <b style="color:var(--accent-purple);">${(emp.fot || 0).toLocaleString()}</b></div>
                    </div>
                </div>
            `).join("");
        }
    }
}

async function checkAuthPassword() {
    const input = document.getElementById("authPasswordInput");
    const errorMsg = document.getElementById("authErrorMsg");
    const overlay = document.getElementById("authLockOverlay");

    if (!input || !overlay) return;

    const pwd = input.value.trim();
    if (!pwd) {
        if (errorMsg) errorMsg.innerText = "⚠️ Введите пароль доступа";
        return;
    }

    if (errorMsg) errorMsg.innerText = "⏳ Проверка пароля...";

    try {
        const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: pwd })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            overlay.classList.add("unlocked");
            if (errorMsg) errorMsg.innerText = "";
        } else {
            if (errorMsg) errorMsg.innerText = "❌ Неверный пароль доступа";
            input.value = "";
            input.focus();
        }
    } catch (e) {
        if (errorMsg) errorMsg.innerText = "❌ Ошибка подключения к серверу";
    }
}

// Tab Scrolling & Custom Reordering Logic
function scrollTabs(offset) {
    const navContainer = document.getElementById("mainNavBar");
    if (navContainer) {
        navContainer.scrollBy({ left: offset, behavior: "smooth" });
    }
}

const defaultTabMeta = [
    { id: "overview", label: "Дашборд", icon: "📊" },
    { id: "bikes", label: "Байки", icon: "🛵" },
    { id: "tasks", label: "Задачи", icon: "📋" },
    { id: "employees", label: "Доступы", icon: "👥" },
    { id: "rich", label: "Rich", icon: "📙" },
    { id: "payroll", label: "Налоги & ЗП", icon: "💰" },
    { id: "bots", label: "Боты", icon: "⚙️" }
];

let currentTabOrder = [];

function applySavedTabOrder() {
    const saved = localStorage.getItem("master_hub_tab_order");
    if (saved) {
        try {
            currentTabOrder = JSON.parse(saved);
        } catch (e) {
            currentTabOrder = defaultTabMeta.map(t => t.id);
        }
    } else {
        currentTabOrder = defaultTabMeta.map(t => t.id);
    }

    const navContainer = document.getElementById("mainNavBar");
    if (!navContainer) return;

    currentTabOrder.forEach(tabId => {
        const btn = navContainer.querySelector(`[data-tab="${tabId}"]`);
        if (btn) navContainer.appendChild(btn);
    });
}

function openReorderTabsModal() {
    const modal = document.getElementById("reorderTabsModal");
    if (!modal) return;

    const saved = localStorage.getItem("master_hub_tab_order");
    if (saved) {
        try {
            currentTabOrder = JSON.parse(saved);
        } catch (e) {
            currentTabOrder = defaultTabMeta.map(t => t.id);
        }
    } else {
        currentTabOrder = defaultTabMeta.map(t => t.id);
    }

    renderReorderList();
    modal.classList.remove("hidden");
}

function closeReorderTabsModal() {
    const modal = document.getElementById("reorderTabsModal");
    if (modal) modal.classList.add("hidden");
}

function renderReorderList() {
    const list = document.getElementById("tabsReorderList");
    if (!list) return;

    list.innerHTML = currentTabOrder.map((tabId, idx) => {
        const meta = defaultTabMeta.find(m => m.id === tabId) || { id: tabId, label: tabId, icon: "📁" };
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(30,41,59,0.8); border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:16px;">${meta.icon}</span>
                    <span style="font-weight:600; font-size:14px;">${meta.label}</span>
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="nav-arrow-btn" onclick="moveTabOrder(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>⬆️ Вперёд</button>
                    <button class="nav-arrow-btn" onclick="moveTabOrder(${idx}, 1)" ${idx === currentTabOrder.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>⬇️ Назад</button>
                </div>
            </div>
        `;
    }).join("");
}

function moveTabOrder(index, direction) {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= currentTabOrder.length) return;
    const temp = currentTabOrder[index];
    currentTabOrder[index] = currentTabOrder[newIdx];
    currentTabOrder[newIdx] = temp;
    renderReorderList();
}

function saveTabOrderFromModal() {
    localStorage.setItem("master_hub_tab_order", JSON.stringify(currentTabOrder));
    applySavedTabOrder();
    closeReorderTabsModal();
    alert("✅ Порядок вкладок успешно сохранён!");
}

window.scrollTabs = scrollTabs;
window.openReorderTabsModal = openReorderTabsModal;
window.closeReorderTabsModal = closeReorderTabsModal;
window.moveTabOrder = moveTabOrder;
window.saveTabOrderFromModal = saveTabOrderFromModal;

document.addEventListener("DOMContentLoaded", () => {
    applySavedTabOrder();
    // Auto-refresh live data every 10 seconds
    setInterval(() => {
        if (typeof refreshCurrentTabData === "function") {
            refreshCurrentTabData();
        } else if (typeof fetchCitiesData === "function") {
            fetchCitiesData();
        }
    }, 10000);
});
