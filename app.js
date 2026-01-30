document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let currentDate = new Date(); // The month currently being viewed
    let selectedDate = null; // The specific date clicked
    let events = JSON.parse(localStorage.getItem('familyCalendarEvents')) || [];
    let currentFilter = 'all';

    // --- DOM Elements ---
    const calendarDays = document.getElementById('calendarDays');
    const currentRequestMonthLabel = document.getElementById('currentRequestMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const todayBtn = document.getElementById('todayBtn');

    // Sidebar
    const sideCurrentDay = document.getElementById('currentDay');
    const sideCurrentFullDate = document.getElementById('currentFullDate');
    const upcomingEventsList = document.getElementById('upcomingEventsList');
    const categoryItems = document.querySelectorAll('.category-item');
    const addEventSideBtn = document.getElementById('addEventBtn');

    // Modal
    const modal = document.getElementById('eventModal');
    const closeModalBtn = document.getElementById('closeModal');
    const eventForm = document.getElementById('eventForm');
    const eventDateInput = document.getElementById('eventDate');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventCategoryInputs = document.querySelectorAll('input[name="category"]');
    const eventTimeInput = document.getElementById('eventTime');
    const eventDescInput = document.getElementById('eventDesc');
    const eventIdInput = document.getElementById('eventId');
    const modalTitle = document.getElementById('modalTitle');
    const deleteEventBtn = document.getElementById('deleteEventBtn');

    // --- Initialization ---
    init();

    function init() {
        renderCalendar();
        updateSidebarDate();
        renderUpcomingEvents();
        setupEventListeners();
    }

    // --- Core Logic ---

    function setupEventListeners() {
        // Navigation
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        todayBtn.addEventListener('click', () => {
            currentDate = new Date();
            renderCalendar();
        });

        // Categories
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update UI
                categoryItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Update Filter
                currentFilter = item.dataset.category;
                renderCalendar();
                renderUpcomingEvents();
            });
        });

        // Modal triggers
        addEventSideBtn.addEventListener('click', () => {
            // Default to today
            openModal(new Date());
        });

        closeModalBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form Submit
        eventForm.addEventListener('submit', handleEventSubmit);

        // Delete Event
        deleteEventBtn.addEventListener('click', deleteEvent);
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Update Header
        currentRequestMonthLabel.textContent = `${year}年 ${month + 1}月`;

        // Clear Grid
        calendarDays.innerHTML = '';

        // Calculate Days
        let firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
        // Adjust for Monday start: Mon=0, ..., Sun=6
        firstDayIndex = (firstDayIndex + 6) % 7;

        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();

        let lastDayIndex = new Date(year, month + 1, 0).getDay();
        // Adjust for Monday start
        lastDayIndex = (lastDayIndex + 6) % 7;

        const nextDays = 7 - lastDayIndex - 1;

        // Previous Month Filler
        for (let x = firstDayIndex; x > 0; x--) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day', 'prev-date');
            dayDiv.innerHTML = `<div class="day-header">${prevLastDay - x + 1}</div>`;
            calendarDays.appendChild(dayDiv);
        }

        // Current Month Days
        for (let i = 1; i <= lastDay; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');

            // Check if Today
            if (i === new Date().getDate() &&
                year === new Date().getFullYear() &&
                month === new Date().getMonth()) {
                dayDiv.classList.add('today');
            }

            // Day Header
            const headerDiv = document.createElement('div');
            headerDiv.classList.add('day-header');
            headerDiv.textContent = i;
            dayDiv.appendChild(headerDiv);

            // Events container
            const eventsDiv = document.createElement('div');
            eventsDiv.classList.add('day-events');

            // Get events for this day
            const dateString = formatDateString(year, month, i);
            const dayEvents = getEventsForDate(dateString);

            dayEvents.forEach(evt => {
                if (currentFilter !== 'all' && evt.category !== currentFilter) return;

                const pill = document.createElement('div');
                pill.classList.add('event-pill', evt.category);
                pill.textContent = evt.title;
                pill.title = evt.title + (evt.time ? ` (${evt.time})` : '');

                pill.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent opening new event modal
                    openModal(null, evt);
                });

                eventsDiv.appendChild(pill);
            });

            dayDiv.appendChild(eventsDiv);

            // Click to add event
            dayDiv.addEventListener('click', () => {
                const clickedDate = new Date(year, month, i);
                openModal(clickedDate);
            });

            calendarDays.appendChild(dayDiv);
        }

        // Next Month Filler
        for (let j = 1; j <= nextDays; j++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day', 'next-date');
            dayDiv.innerHTML = `<div class="day-header">${j}</div>`;
            calendarDays.appendChild(dayDiv);
        }
    }

    function updateSidebarDate() {
        const now = new Date();
        sideCurrentDay.textContent = now.getDate();

        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        sideCurrentFullDate.textContent = new Intl.DateTimeFormat('ja-JP', options).format(now);
    }

    function renderUpcomingEvents() {
        upcomingEventsList.innerHTML = '';

        // Get future events, sort by date
        const nowStr = new Date().toISOString().split('T')[0];

        const futureEvents = events.filter(evt => {
            if (currentFilter !== 'all' && evt.category !== currentFilter) return false;
            return evt.date >= nowStr;
        }).sort((a, b) => {
            if (a.date === b.date) {
                return (a.time || '00:00').localeCompare(b.time || '00:00');
            }
            return a.date.localeCompare(b.date);
        });

        if (futureEvents.length === 0) {
            upcomingEventsList.innerHTML = '<div class="empty-state">予定はありません</div>';
            return;
        }

        // Show max 5 items
        futureEvents.slice(0, 5).forEach(evt => {
            const el = document.createElement('div');
            el.classList.add('event-card-mini');
            el.style.borderLeftColor = `var(--accent-${evt.category})`;

            const dateObj = new Date(evt.date);
            const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

            el.innerHTML = `
                <div style="font-size: 0.8rem; opacity: 0.8; display:flex; justify-content:space-between;">
                    <span>${dateStr}</span>
                    <span>${evt.time || ''}</span>
                </div>
                <div style="font-weight: 600; margin-top: 2px;">${evt.title}</div>
            `;

            el.addEventListener('click', () => {
                openModal(null, evt);
            });

            upcomingEventsList.appendChild(el);
        });
    }

    // --- Data Helpers ---

    function getEventsForDate(dateStr) {
        return events.filter(e => e.date === dateStr);
    }

    function formatDateString(year, month, day) {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    }

    function saveEvents() {
        localStorage.setItem('familyCalendarEvents', JSON.stringify(events));
        renderCalendar();
        renderUpcomingEvents();
    }

    // --- Modal Logic ---

    function openModal(dateObj = null, eventObj = null) {
        modal.classList.add('open');

        if (eventObj) {
            // Edit Mode
            modalTitle.textContent = '予定を編集';
            eventIdInput.value = eventObj.id;
            eventTitleInput.value = eventObj.title;
            eventDateInput.value = eventObj.date;
            eventTimeInput.value = eventObj.time;
            eventDescInput.value = eventObj.description;

            // Set Radio
            eventCategoryInputs.forEach(input => {
                if (input.value === eventObj.category) input.checked = true;
            });

            deleteEventBtn.classList.remove('hidden');
        } else {
            // Add Mode
            modalTitle.textContent = '予定を追加';
            eventIdInput.value = '';
            eventForm.reset();
            deleteEventBtn.classList.add('hidden');

            // Reset to default category
            document.getElementById('cat-family').checked = true;

            if (dateObj) {
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                eventDateInput.value = `${year}-${month}-${day}`;
            } else {
                eventDateInput.valueAsDate = new Date();
            }
        }
    }

    function closeModal() {
        modal.classList.remove('open');
    }

    function handleEventSubmit(e) {
        e.preventDefault();

        const id = eventIdInput.value;
        const title = eventTitleInput.value;
        const date = eventDateInput.value;
        const time = eventTimeInput.value;
        const description = eventDescInput.value;
        const category = document.querySelector('input[name="category"]:checked').value;

        if (!title || !date) return;

        if (id) {
            // Update existing
            const index = events.findIndex(evt => evt.id === id);
            if (index !== -1) {
                events[index] = { ...events[index], title, date, time, description, category };
            }
        } else {
            // Create new
            const newEvent = {
                id: Date.now().toString(),
                title,
                date,
                time,
                description,
                category
            };
            events.push(newEvent);
        }

        saveEvents();
        closeModal();
    }

    function deleteEvent() {
        const id = eventIdInput.value;
        if (!id) return;

        if (confirm('本当にこの予定を削除しますか？')) {
            events = events.filter(evt => evt.id !== id);
            saveEvents();
            closeModal();
        }
    }
});
