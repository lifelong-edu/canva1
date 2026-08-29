/**
 * CANVA MASTER TUTORIALS - INTERACTIVE APPLICATION ENGINE
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const tutorialSections = document.querySelectorAll('.tutorial-section');
    const currentBadge = document.getElementById('current-badge');
    const currentTitle = document.getElementById('current-title');
    const overallProgressText = document.getElementById('overall-progress-text');
    const overallProgressBar = document.getElementById('overall-progress-bar');
    const completedCountEl = document.getElementById('completed-count');
    const toggleAllCheckBtn = document.getElementById('toggle-all-check');
    const resetProgressBtn = document.getElementById('reset-progress-btn');
    const toast = document.getElementById('toast');

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const adminToggleBtn = document.getElementById('toggle-admin-mode');

    // Title metadata mapping
    const tutorialTitles = {
        'tutorial-1': { num: 'CHALLENGE #1', title: '그리드, 프레임, 글씨효과 사용한 작품만들기' },
        'tutorial-2': { num: 'CHALLENGE #2', title: 'POP글씨를 이용한 홍보물 만들기' },
        'tutorial-3': { num: 'CHALLENGE #3', title: '키워드로 디지털아트 만들기 및 목업에 넣는법 3가지' },
        'tutorial-4': { num: 'CHALLENGE #4', title: '포토샵같은 특수미러링 효과 상세페이지' },
        'tutorial-5': { num: 'CHALLENGE #5', title: '재밌는 스탑모션 영상만들기' },
        'tutorial-6': { num: 'CHALLENGE #6', title: '돈버는 디지털파일 워크시트지 만들기' },
        'tutorial-7': { num: 'CHALLENGE #7', title: '캔바 AI로 작품 5개 이상 만들기' }
    };

    let activeTutorialId = 'tutorial-1';
    let isAdminUnlocked = false; // Toggle for testing/instructor mode

    // --- State Storage Keys ---
    const STORAGE_KEY = 'canva_tutorial_progress_v1';
    const THEME_KEY = 'canva_theme_mode';
    let userProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    // --- Initialize ---
    initApp();

    function initApp() {
        initTheme();
        bindEvents();
        loadSavedProgress();
        applyDateLocking();
        updateOverallProgress();
    }

    // --- Theme Manager ---
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            updateThemeButton(true);
        } else {
            document.body.classList.remove('light-mode');
            updateThemeButton(false);
        }
    }

    function toggleTheme() {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
        updateThemeButton(isLight);
        showToast(isLight ? '☀️ 라이트 모드로 변경되었습니다.' : '🌙 다크 모드로 변경되었습니다.');
    }

    function updateThemeButton(isLight) {
        if (!themeToggleBtn) return;
        if (isLight) {
            themeToggleBtn.innerHTML = `<i class="fa-solid fa-moon"></i> 다크 모드`;
        } else {
            themeToggleBtn.innerHTML = `<i class="fa-solid fa-sun"></i> 라이트 모드`;
        }
    }

    // --- Date Locking Logic ---
    function applyDateLocking() {
        const today = new Date();
        // Today string format YYYY-MM-DD
        const todayStr = today.toISOString().split('T')[0];

        navButtons.forEach(btn => {
            const openDateStr = btn.getAttribute('data-open-date');
            const targetId = btn.getAttribute('data-target');
            const badgeEl = btn.querySelector('.open-date-badge');

            if (!openDateStr) return;

            const isFuture = openDateStr > todayStr && !isAdminUnlocked;

            if (isFuture) {
                btn.classList.add('locked');
                if (badgeEl) badgeEl.textContent = `🔒 ${openDateStr.replace(/-/g, '.')} 오픈`;
            } else {
                btn.classList.remove('locked');
                if (badgeEl) badgeEl.textContent = openDateStr.replace(/-/g, '.');
            }
        });

        // Ensure current active section renders properly (locked or unlocked)
        switchTutorial(activeTutorialId);
    }

    // --- Event Listeners Bindings ---
    function bindEvents() {
        // Theme toggle button
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleTheme);
        }

        // Tab switching with lock check
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const isLocked = btn.classList.contains('locked');

                if (isLocked) {
                    const openDateStr = btn.getAttribute('data-open-date');
                    showToast(`🔒 이 튜토리얼은 ${openDateStr}에 공개됩니다.`);
                    renderLockedView(targetId, openDateStr);
                    setActiveNav(btn);
                    return;
                }

                switchTutorial(targetId);
            });
        });

        // Secret Admin Reveal (URL query ?admin=true OR click logo 3 times)
        const urlParams = new URLSearchParams(window.location.search);
        let isAdminAuthorized = urlParams.get('admin') === 'true' || localStorage.getItem('canva_admin_revealed') === 'true';

        if (adminToggleBtn) {
            if (isAdminAuthorized) {
                adminToggleBtn.style.display = 'block';
            } else {
                adminToggleBtn.style.display = 'none';
            }

            // Triple click logo to reveal admin button secretly
            const logoBadge = document.querySelector('.logo-container');
            let logoClickCount = 0;
            let logoClickTimer;

            if (logoBadge) {
                logoBadge.style.cursor = 'pointer';
                logoBadge.addEventListener('click', () => {
                    logoClickCount++;
                    clearTimeout(logoClickTimer);

                    if (logoClickCount >= 3) {
                        isAdminAuthorized = true;
                        localStorage.setItem('canva_admin_revealed', 'true');
                        adminToggleBtn.style.display = 'block';
                        showToast('🔑 관리자 모드 버튼이 활성화되었습니다!');
                        logoClickCount = 0;
                    } else {
                        logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 1000);
                    }
                });
            }

            adminToggleBtn.addEventListener('click', () => {
                isAdminUnlocked = !isAdminUnlocked;
                if (isAdminUnlocked) {
                    adminToggleBtn.innerHTML = `<i class="fa-solid fa-lock"></i> 날짜 잠금 모드로 변경`;
                    adminToggleBtn.style.background = 'rgba(239, 68, 68, 0.2)';
                    adminToggleBtn.style.color = '#f87171';
                    showToast('🔓 [관리자 모드] 모든 튜토리얼이 해제되었습니다.');
                } else {
                    adminToggleBtn.innerHTML = `<i class="fa-solid fa-unlock-keyhole"></i> [관리자/강사] 전체 잠금 해제`;
                    adminToggleBtn.style.background = 'rgba(139, 92, 246, 0.12)';
                    adminToggleBtn.style.color = 'var(--canva-cyan)';
                    showToast('🔒 날짜 잠금 규칙이 다시 적용되었습니다.');
                }
                applyDateLocking();
            });
        }

        // Checkbox state changes
        document.querySelectorAll('.task-check').forEach((checkbox, index) => {
            checkbox.setAttribute('data-task-id', `task_${index}`);
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                userProgress[taskId] = e.target.checked;
                saveProgress();
                updateOverallProgress();
                checkTutorialCompletion(activeTutorialId);
            });
        });

        // Toggle all check for current active tutorial
        toggleAllCheckBtn.addEventListener('click', () => {
            const currentSection = document.getElementById(activeTutorialId);
            const checkboxes = currentSection.querySelectorAll('.task-check');
            
            // Check if all are already checked
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            
            checkboxes.forEach(cb => {
                cb.checked = !allChecked;
                const taskId = cb.getAttribute('data-task-id');
                userProgress[taskId] = !allChecked;
            });

            saveProgress();
            updateOverallProgress();
            checkTutorialCompletion(activeTutorialId);
            
            showToast(allChecked ? '체크리스트가 해제되었습니다.' : '축하합니다! 이 튜토리얼을 완료하였습니다. 🎉');
        });

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-copy');
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    const textToCopy = targetEl.textContent.trim();
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        showToast('📋 프롬프트가 클립보드에 복사되었습니다!');
                    }).catch(err => {
                        console.error('Copy failed:', err);
                    });
                }
            });
        });

        // Reset progress
        resetProgressBtn.addEventListener('click', () => {
            if (confirm('모든 학습 완료 기록과 진도율을 초기화하시겠습니까?')) {
                userProgress = {};
                localStorage.removeItem(STORAGE_KEY);
                document.querySelectorAll('.task-check').forEach(cb => cb.checked = false);
                document.querySelectorAll('.check-icon').forEach(icon => icon.classList.remove('completed'));
                updateOverallProgress();
                showToast('진도율이 성공적으로 초기화되었습니다.');
            }
        });
    }

    function setActiveNav(targetBtn) {
        navButtons.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
    }

    // Render locked screen overlay when clicking a locked tutorial
    function renderLockedView(targetId, openDateStr) {
        activeTutorialId = targetId;

        tutorialSections.forEach(sec => {
            if (sec.id === targetId) {
                sec.classList.add('active');
                // Hide normal step container if locked and show locked card
                const stepContainer = sec.querySelector('.step-container');
                let existingLockCard = sec.querySelector('.locked-card');

                if (stepContainer) stepContainer.style.display = 'none';

                if (!existingLockCard) {
                    existingLockCard = document.createElement('div');
                    existingLockCard.className = 'locked-card';
                    existingLockCard.innerHTML = `
                        <i class="fa-solid fa-lock lock-main-icon"></i>
                        <h3>아직 공개되지 않은 튜토리얼입니다</h3>
                        <p>정해진 개강 일정에 맞춰 순차적으로 튜토리얼이 오픈됩니다.</p>
                        <div class="locked-date-highlight"><i class="fa-regular fa-calendar-check"></i> 공개 예정일: ${openDateStr.replace(/-/g, '.')}</div>
                    `;
                    sec.appendChild(existingLockCard);
                } else {
                    existingLockCard.style.display = 'block';
                }
            } else {
                sec.classList.remove('active');
            }
        });

        if (tutorialTitles[targetId]) {
            currentBadge.textContent = `${tutorialTitles[targetId].num} (잠김)`;
            currentTitle.textContent = tutorialTitles[targetId].title;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Switch Active Tutorial ---
    function switchTutorial(targetId) {
        activeTutorialId = targetId;
        const targetBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
        const isLocked = targetBtn && targetBtn.classList.contains('locked');

        if (isLocked) {
            const openDateStr = targetBtn.getAttribute('data-open-date');
            renderLockedView(targetId, openDateStr);
            setActiveNav(targetBtn);
            return;
        }

        // Nav Active state
        navButtons.forEach(b => {
            if (b.getAttribute('data-target') === targetId) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        // Section Active state
        tutorialSections.forEach(sec => {
            if (sec.id === targetId) {
                sec.classList.add('active');
                const stepContainer = sec.querySelector('.step-container');
                const lockCard = sec.querySelector('.locked-card');
                if (stepContainer) stepContainer.style.display = 'flex';
                if (lockCard) lockCard.style.display = 'none';
            } else {
                sec.classList.remove('active');
            }
        });

        // Header Update
        if (tutorialTitles[targetId]) {
            currentBadge.textContent = tutorialTitles[targetId].num;
            currentTitle.textContent = tutorialTitles[targetId].title;
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Load Saved Checkbox States ---
    function loadSavedProgress() {
        document.querySelectorAll('.task-check').forEach(checkbox => {
            const taskId = checkbox.getAttribute('data-task-id');
            if (userProgress[taskId] !== undefined) {
                checkbox.checked = userProgress[taskId];
            }
        });
    }

    // --- Save to LocalStorage ---
    function saveProgress() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    }

    // --- Update Progress & Check Icons ---
    function updateOverallProgress() {
        const totalCheckboxes = document.querySelectorAll('.task-check').length;
        const checkedCount = document.querySelectorAll('.task-check:checked').length;
        
        const percentage = totalCheckboxes > 0 ? Math.round((checkedCount / totalCheckboxes) * 100) : 0;

        overallProgressText.textContent = `${percentage}%`;
        overallProgressBar.style.width = `${percentage}%`;

        // Check completion per tutorial (1 to 7)
        let completedTutorials = 0;
        for (let i = 1; i <= 7; i++) {
            const tutId = `tutorial-${i}`;
            const isCompleted = checkTutorialCompletion(tutId);
            if (isCompleted) completedTutorials++;
        }

        completedCountEl.textContent = completedTutorials;
    }

    // Check individual tutorial completion
    function checkTutorialCompletion(tutId) {
        const tutSection = document.getElementById(tutId);
        if (!tutSection) return false;

        const checkboxes = tutSection.querySelectorAll('.task-check');
        const num = tutId.replace('tutorial-', '');
        const checkIcon = document.getElementById(`check-t${num}`);

        if (checkboxes.length === 0) return false;

        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        if (checkIcon) {
            if (allChecked) {
                checkIcon.classList.add('completed');
            } else {
                checkIcon.classList.remove('completed');
            }
        }

        return allChecked;
    }

    // --- Toast Notification ---
    let toastTimeout;
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2600);
    }
});
