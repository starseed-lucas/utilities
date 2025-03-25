var StarRewardsApp = /** @class */ (function () {
    function StarRewardsApp() {
        this.editMode = false;
        this.activeTaskTab = 'daily';
        this.activeEditTab = 'editTasks';
        this.googleSyncInterval = null;
        this.data = this.loadData();
        this.initializeApp();
    }
    StarRewardsApp.prototype.initializeApp = function () {
        this.applyTheme();
        this.renderTasks();
        this.renderRewards();
        this.updateStarsDisplay();
        this.setupEventListeners();
        if (this.data.googleIntegration && this.data.googleApiKey) {
            this.setupGoogleSync();
        }
        // Reset daily tasks if needed
        this.checkAndResetDailyTasks();
    };
    StarRewardsApp.prototype.loadData = function () {
        var savedData = localStorage.getItem('starRewardsData');
        if (savedData) {
            return JSON.parse(savedData);
        }
        else {
            // Default data
            return {
                tasks: [
                    { id: this.generateId(), name: '🦷 Brush teeth (morning)', type: 'daily', stars: 1, completed: false },
                    { id: this.generateId(), name: '🛌 Make bed', type: 'daily', stars: 1, completed: false },
                    { id: this.generateId(), name: '📚 Go to school', type: 'daily', stars: 2, completed: false },
                    { id: this.generateId(), name: '🦷 Brush teeth (night)', type: 'daily', stars: 1, completed: false },
                    { id: this.generateId(), name: '👕 Change clothes', type: 'daily', stars: 1, completed: false },
                    { id: this.generateId(), name: '🧹 Clean room', type: 'oneoff', stars: 3, completed: false }
                ],
                rewards: [
                    { id: this.generateId(), name: '🎮 Extra screen time', starsNeeded: 5, claimed: false },
                    { id: this.generateId(), name: '🍦 Special treat', starsNeeded: 10, claimed: false },
                    { id: this.generateId(), name: '🏞️ Trip to park', starsNeeded: 15, claimed: false }
                ],
                earnedStars: 0,
                theme: 'robots',
                googleIntegration: false
            };
        }
    };
    StarRewardsApp.prototype.saveData = function () {
        localStorage.setItem('starRewardsData', JSON.stringify(this.data));
        this.updateStarsDisplay();
        if (this.data.googleIntegration && this.data.googleApiKey) {
            this.syncToGoogle();
        }
    };
    StarRewardsApp.prototype.updateStarsDisplay = function () {
        var totalStarsElement = document.getElementById('totalStarsCount');
        if (totalStarsElement) {
            // Animate the change
            totalStarsElement.classList.add('star-update');
            totalStarsElement.textContent = this.data.earnedStars.toString();
            // Remove animation class after animation completes
            setTimeout(function () {
                totalStarsElement.classList.remove('star-update');
            }, 500);
        }
    };
    StarRewardsApp.prototype.generateId = function () {
        return Math.random().toString(36).substring(2, 11);
    };
    // Update applyTheme method
    StarRewardsApp.prototype.applyTheme = function () {
        var _this = this;
        document.body.classList.remove('robots-theme', 'dinosaur-theme', 'unicorn-theme', 'pirate-theme', 'princess-theme', 'space-theme', 'superhero-theme', 'ocean-theme');
        document.body.classList.add("".concat(this.data.theme, "-theme"));
        // Update theme emoticon
        var themeEmoticon = document.getElementById('themeEmoticon');
        if (themeEmoticon) {
            // Set emoticon based on theme
            switch (this.data.theme) {
                case 'robots':
                    themeEmoticon.textContent = '🤖';
                    break;
                case 'dinosaur':
                    themeEmoticon.textContent = '🦖';
                    break;
                case 'unicorn':
                    themeEmoticon.textContent = '🦄';
                    break;
                case 'pirate':
                    themeEmoticon.textContent = '🏴‍☠️';
                    break;
                case 'princess':
                    themeEmoticon.textContent = '👸';
                    break;
                case 'space':
                    themeEmoticon.textContent = '🚀';
                    break;
                case 'superhero':
                    themeEmoticon.textContent = '🦸';
                    break;
                case 'ocean':
                    themeEmoticon.textContent = '🐠';
                    break;
            }
            // Add a small animation effect when changing
            themeEmoticon.classList.remove('emoticon-change');
            void themeEmoticon.offsetWidth; // Force reflow to restart animation
            themeEmoticon.classList.add('emoticon-change');
        }
        // Update active theme button
        var themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(function (btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === _this.data.theme) {
                btn.classList.add('active');
            }
        });
    };
    StarRewardsApp.prototype.renderTasks = function () {
        var _this = this;
        var taskList = document.getElementById('taskList');
        if (!taskList)
            return;
        taskList.innerHTML = '';
        var filteredTasks = this.data.tasks.filter(function (task) { return task.type === _this.activeTaskTab; });
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="empty-message">No tasks yet. Add some in the settings!</p>';
            return;
        }
        filteredTasks.forEach(function (task) {
            var taskElement = document.createElement('div');
            taskElement.className = "task-item ".concat(task.completed ? 'completed' : '');
            taskElement.dataset.id = task.id;
            var starSymbols = '⭐'.repeat(task.stars);
            taskElement.innerHTML = "\n                <div class=\"task-content\">\n                    <span class=\"task-name\">".concat(task.name, "</span>\n                    <span class=\"stars\">").concat(starSymbols, "</span>\n                </div>\n                <div class=\"task-actions\">\n                    ").concat(!task.completed ?
                "<button class=\"complete-btn\" data-id=\"".concat(task.id, "\">\u2713</button>") :
                '<span class="completed-text">✓ Done</span>', "\n                </div>\n            ");
            taskList.appendChild(taskElement);
        });
        // Add click listeners to complete buttons
        var completeButtons = document.querySelectorAll('.complete-btn');
        completeButtons.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var target = e.target;
                var taskId = target.getAttribute('data-id');
                if (taskId) {
                    _this.completeTask(taskId);
                }
            });
        });
    };
    StarRewardsApp.prototype.renderRewards = function () {
        var _this = this;
        var rewardsList = document.getElementById('rewardsList');
        if (!rewardsList)
            return;
        rewardsList.innerHTML = '';
        if (this.data.rewards.length === 0) {
            rewardsList.innerHTML = '<p class="empty-message">No rewards yet. Add some in the settings!</p>';
            return;
        }
        this.data.rewards.forEach(function (reward) {
            var rewardElement = document.createElement('div');
            rewardElement.className = "reward-item ".concat(reward.claimed ? 'claimed' : '');
            rewardElement.dataset.id = reward.id;
            rewardElement.style.position = 'relative'; // For claimed badge positioning
            // Create star display with both earned and unearned stars
            var earnedStarsCount = Math.min(_this.data.earnedStars, reward.starsNeeded);
            var unearnedStarsCount = reward.starsNeeded - earnedStarsCount;
            var earnedStars = '⭐'.repeat(Math.min(5, earnedStarsCount));
            var unearnedStars = '⭐'.repeat(Math.min(5, unearnedStarsCount));
            // Only show counts if more than 5 stars
            var extraCount = reward.starsNeeded > 5 ? " +".concat(reward.starsNeeded - 5) : '';
            rewardElement.innerHTML = "\n                <span class=\"reward-name\">".concat(reward.name, "</span>\n                <div class=\"reward-info\">\n                    <span class=\"stars-progress\">\n                        <span class=\"earned-stars\">").concat(earnedStars, "</span>\n                        <span class=\"unearned-stars\" style=\"opacity: 0.3; filter: grayscale(1);\">").concat(unearnedStars, "</span>\n                        ").concat(extraCount ? "<span class=\"extra-count\">".concat(extraCount, "</span>") : '', "\n                    </span>\n                </div>\n            ");
            rewardElement.addEventListener('click', function () {
                _this.showRewardModal(reward);
            });
            rewardsList.appendChild(rewardElement);
        });
    };
    StarRewardsApp.prototype.setupEventListeners = function () {
        var _this = this;
        // Task tab switching
        var taskTabs = document.querySelectorAll('.task-tabs .tab');
        taskTabs.forEach(function (tab) {
            tab.addEventListener('click', function (e) {
                var target = e.target;
                var tabType = target.getAttribute('data-tab');
                if (tabType) {
                    _this.activeTaskTab = tabType;
                    taskTabs.forEach(function (t) { return t.classList.remove('active'); });
                    target.classList.add('active');
                    _this.renderTasks();
                }
            });
        });
        // Reset daily tasks button
        var resetDailyBtn = document.getElementById('resetDailyBtn');
        if (resetDailyBtn) {
            resetDailyBtn.addEventListener('click', function () {
                _this.resetDailyTasks();
            });
        }
        // Settings button
        var settingsBtn = document.getElementById('settingsBtn');
        var settingsModal = document.getElementById('settingsModal');
        var closeButtons = document.querySelectorAll('.close');
        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', function () {
                settingsModal.style.display = 'flex';
                _this.updateSettingsUI();
            });
        }
        // Close buttons for modals
        closeButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var modal = btn.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
        // Theme selection
        var themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var target = e.target;
                var theme = target.getAttribute('data-theme');
                if (theme) {
                    _this.data.theme = theme;
                    _this.applyTheme();
                    _this.saveData();
                    _this.showNotification('Theme updated!');
                }
            });
        });
        // Google integration toggle
        var googleToggle = document.getElementById('googleToggle');
        var googleApiKeySection = document.getElementById('googleApiKey');
        if (googleToggle && googleApiKeySection) {
            googleToggle.checked = this.data.googleIntegration;
            googleToggle.addEventListener('change', function () {
                _this.data.googleIntegration = googleToggle.checked;
                if (googleToggle.checked) {
                    googleApiKeySection.classList.remove('hidden');
                }
                else {
                    googleApiKeySection.classList.add('hidden');
                    if (_this.googleSyncInterval) {
                        clearInterval(_this.googleSyncInterval);
                        _this.googleSyncInterval = null;
                    }
                }
                _this.saveData();
            });
        }
        // Save API key
        var apiKeyInput = document.getElementById('apiKey');
        var saveApiKeyBtn = document.getElementById('saveApiKey');
        if (apiKeyInput && saveApiKeyBtn) {
            apiKeyInput.value = this.data.googleApiKey || '';
            saveApiKeyBtn.addEventListener('click', function () {
                _this.data.googleApiKey = apiKeyInput.value;
                _this.saveData();
                _this.setupGoogleSync();
                _this.showNotification('API key saved!');
            });
        }
        // Edit mode button
        var editModeBtn = document.getElementById('editModeBtn');
        var mathChallenge = document.getElementById('mathChallenge');
        if (editModeBtn && mathChallenge) {
            editModeBtn.addEventListener('click', function () {
                _this.generateMathChallenge();
                mathChallenge.classList.remove('hidden');
            });
        }
        // Check math answer
        var mathAnswerInput = document.getElementById('mathAnswer');
        var checkAnswerBtn = document.getElementById('checkAnswer');
        var editModal = document.getElementById('editModal');
        if (mathAnswerInput && checkAnswerBtn && editModal) {
            checkAnswerBtn.addEventListener('click', function () {
                var userAnswer = parseInt(mathAnswerInput.value);
                var correctAnswer = parseInt(document.getElementById('mathQuestion').dataset.answer || '0');
                if (userAnswer === correctAnswer) {
                    mathChallenge === null || mathChallenge === void 0 ? void 0 : mathChallenge.classList.add('hidden');
                    _this.editMode = true;
                    editModal.style.display = 'flex';
                    _this.renderEditItems();
                    _this.showNotification('Edit mode enabled!');
                }
                else {
                    _this.showNotification('Incorrect answer, try again!');
                    _this.generateMathChallenge();
                }
                mathAnswerInput.value = '';
            });
        }
        // Edit tabs
        var editTabs = document.querySelectorAll('.edit-tabs .tab');
        editTabs.forEach(function (tab) {
            tab.addEventListener('click', function (e) {
                var _a, _b, _c;
                var target = e.target;
                var tabType = target.getAttribute('data-tab');
                if (tabType) {
                    _this.activeEditTab = tabType;
                    editTabs.forEach(function (t) { return t.classList.remove('active'); });
                    target.classList.add('active');
                    (_a = document.getElementById('editTasks')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
                    (_b = document.getElementById('editRewards')) === null || _b === void 0 ? void 0 : _b.classList.add('hidden');
                    (_c = document.getElementById(tabType)) === null || _c === void 0 ? void 0 : _c.classList.remove('hidden');
                    _this.renderEditItems();
                }
            });
        });
        // Add task/reward buttons
        var addTaskBtn = document.getElementById('addTaskBtn');
        var addRewardBtn = document.getElementById('addRewardBtn');
        var addItemModal = document.getElementById('addItemModal');
        var addItemTitle = document.getElementById('addItemTitle');
        var taskTypeGroup = document.getElementById('taskTypeGroup');
        var starsGroup = document.getElementById('starsGroup');
        var starsNeededGroup = document.getElementById('starsNeededGroup');
        if (addTaskBtn && addRewardBtn && addItemModal && addItemTitle && taskTypeGroup && starsGroup && starsNeededGroup) {
            addTaskBtn.addEventListener('click', function () {
                addItemTitle.textContent = 'Add Task';
                taskTypeGroup.classList.remove('hidden');
                starsGroup.classList.remove('hidden');
                starsNeededGroup.classList.add('hidden');
                addItemModal.style.display = 'flex';
                addItemModal.dataset.mode = 'task';
            });
            addRewardBtn.addEventListener('click', function () {
                addItemTitle.textContent = 'Add Reward';
                taskTypeGroup.classList.add('hidden');
                starsGroup.classList.add('hidden');
                starsNeededGroup.classList.remove('hidden');
                addItemModal.style.display = 'flex';
                addItemModal.dataset.mode = 'reward';
            });
        }
        // Save new item
        var addItemForm = document.getElementById('addItemForm');
        if (addItemForm) {
            addItemForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var nameInput = document.getElementById('itemName');
                var mode = addItemModal.dataset.mode;
                if (mode === 'task') {
                    var typeSelect = document.getElementById('taskType');
                    var starsInput = document.getElementById('starValue');
                    var newTask = {
                        id: _this.generateId(),
                        name: nameInput.value,
                        type: typeSelect.value,
                        stars: parseInt(starsInput.value),
                        completed: false
                    };
                    _this.data.tasks.push(newTask);
                    _this.showNotification('Task added!');
                }
                else if (mode === 'reward') {
                    var starsNeededInput = document.getElementById('starsNeeded');
                    var newReward = {
                        id: _this.generateId(),
                        name: nameInput.value,
                        starsNeeded: parseInt(starsNeededInput.value),
                        claimed: false
                    };
                    _this.data.rewards.push(newReward);
                    _this.showNotification('Reward added!');
                }
                else if (mode === 'editTask') {
                    var typeSelect = document.getElementById('taskType');
                    var starsInput = document.getElementById('starValue');
                    var taskId_1 = addItemModal === null || addItemModal === void 0 ? void 0 : addItemModal.dataset.itemId;
                    var task = _this.data.tasks.find(function (t) { return t.id === taskId_1; });
                    if (task) {
                        task.name = nameInput.value;
                        task.type = typeSelect.value;
                        task.stars = parseInt(starsInput.value);
                        _this.showNotification('Task updated!');
                    }
                }
                else if (mode === 'editReward') {
                    var starsNeededInput = document.getElementById('starsNeeded');
                    var rewardId_1 = addItemModal === null || addItemModal === void 0 ? void 0 : addItemModal.dataset.itemId;
                    var reward = _this.data.rewards.find(function (r) { return r.id === rewardId_1; });
                    if (reward) {
                        reward.name = nameInput.value;
                        reward.starsNeeded = parseInt(starsNeededInput.value);
                        _this.showNotification('Reward updated!');
                    }
                }
                _this.saveData();
                _this.renderTasks();
                _this.renderRewards();
                _this.renderEditItems();
                addItemModal.style.display = 'none';
                nameInput.value = '';
            });
        }
        // Reset data button
        var resetDataBtn = document.getElementById('resetDataBtn');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', function () {
                if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
                    localStorage.removeItem('starRewardsData');
                    _this.data = _this.loadData();
                    _this.applyTheme();
                    _this.renderTasks();
                    _this.renderRewards();
                    _this.updateStarsDisplay();
                    _this.showNotification('All data has been reset!');
                    document.getElementById('editModal').style.display = 'none';
                }
            });
        }
        // Clear finished rewards button
        var clearFinishedRewardsBtn = document.getElementById('clearFinishedRewardsBtn');
        if (clearFinishedRewardsBtn) {
            clearFinishedRewardsBtn.addEventListener('click', function () {
                if (confirm('Are you sure you want to remove all claimed rewards?')) {
                    var claimedRewardsCount = _this.data.rewards.filter(function (r) { return r.claimed; }).length;
                    if (claimedRewardsCount === 0) {
                        _this.showNotification('No claimed rewards to remove!');
                        return;
                    }
                    _this.data.rewards = _this.data.rewards.filter(function (r) { return !r.claimed; });
                    _this.saveData();
                    _this.renderRewards();
                    _this.renderEditItems();
                    _this.showNotification("Removed ".concat(claimedRewardsCount, " claimed reward").concat(claimedRewardsCount !== 1 ? 's' : '', "!"));
                }
            });
        }
        // Reset claimed rewards button
        var resetClaimedRewardsBtn = document.getElementById('resetClaimedRewardsBtn');
        if (resetClaimedRewardsBtn) {
            resetClaimedRewardsBtn.addEventListener('click', function () {
                if (confirm('Are you sure you want to reset all claimed rewards? They will be available to claim again.')) {
                    var claimedRewardsCount = _this.data.rewards.filter(function (r) { return r.claimed; }).length;
                    if (claimedRewardsCount === 0) {
                        _this.showNotification('No claimed rewards to reset!');
                        return;
                    }
                    _this.data.rewards.forEach(function (reward) {
                        if (reward.claimed) {
                            reward.claimed = false;
                        }
                    });
                    _this.saveData();
                    _this.renderRewards();
                    _this.renderEditItems();
                    _this.showNotification("Reset ".concat(claimedRewardsCount, " claimed reward").concat(claimedRewardsCount !== 1 ? 's' : '', "!"));
                }
            });
        }
        // Reset completed one-off tasks button
        var resetCompletedTasksBtn = document.getElementById('resetCompletedTasksBtn');
        if (resetCompletedTasksBtn) {
            resetCompletedTasksBtn.addEventListener('click', function () {
                if (confirm('Are you sure you want to reset all completed one-off tasks?')) {
                    var completedTasksCount = _this.data.tasks.filter(function (t) { return t.type === 'oneoff' && t.completed; }).length;
                    if (completedTasksCount === 0) {
                        _this.showNotification('No completed one-off tasks to reset!');
                        return;
                    }
                    _this.data.tasks.forEach(function (task) {
                        if (task.type === 'oneoff' && task.completed) {
                            task.completed = false;
                        }
                    });
                    _this.saveData();
                    _this.renderTasks();
                    _this.renderEditItems();
                    _this.showNotification("Reset ".concat(completedTasksCount, " completed one-off task").concat(completedTasksCount !== 1 ? 's' : '', "!"));
                }
            });
        }
        // Filter buttons
        var filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var target = e.target;
                var filterType = target.getAttribute('data-filter');
                var filterSection = target.closest('.edit-section');
                // Update active filter button
                filterSection === null || filterSection === void 0 ? void 0 : filterSection.querySelectorAll('.filter-btn').forEach(function (b) { return b.classList.remove('active'); });
                target.classList.add('active');
                // Apply filter to items
                _this.filterEditItems(filterType);
            });
        });
        // Close modals when clicking outside
        window.addEventListener('click', function (e) {
            var modals = document.querySelectorAll('.modal');
            modals.forEach(function (modal) {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        // Reward modal handling
        var rewardModal = document.getElementById('rewardModal');
        var claimRewardBtn = document.getElementById('claimRewardBtn');
        if (claimRewardBtn) {
            claimRewardBtn.addEventListener('click', function () {
                var rewardId = rewardModal.dataset.rewardId;
                if (rewardId) {
                    _this.claimReward(rewardId);
                    rewardModal.style.display = 'none';
                }
            });
        }
    };
    StarRewardsApp.prototype.completeTask = function (taskId) {
        var _this = this;
        var task = this.data.tasks.find(function (t) { return t.id === taskId; });
        if (!task)
            return;
        // Add stars
        this.data.earnedStars += task.stars;
        // Mark as completed
        task.completed = true;
        task.lastCompleted = new Date().toISOString();
        // Save data
        this.saveData();
        // Create zooming star animation
        this.createZoomStar();
        // Show animation
        var taskElement = document.querySelector(".task-item[data-id=\"".concat(taskId, "\"]"));
        if (taskElement) {
            taskElement.classList.add('task-complete-animation');
            // Create floating stars animation
            for (var i = 0; i < task.stars; i++) {
                setTimeout(function () {
                    _this.createFloatingStar(taskElement);
                }, i * 200);
            }
            // Update the task display
            setTimeout(function () {
                _this.renderTasks();
                _this.renderRewards(); // Refresh rewards in case any became available
                _this.showNotification("You earned ".concat(task.stars, " \u2B50!"));
            }, 800);
        }
    };
    StarRewardsApp.prototype.createFloatingStar = function (parentElement) {
        var star = document.createElement('span');
        star.className = 'floating-star';
        star.textContent = '⭐';
        star.style.fontSize = '1.5rem';
        // Random position within the parent element
        var rect = parentElement.getBoundingClientRect();
        var randomX = Math.floor(Math.random() * rect.width);
        var randomY = Math.floor(Math.random() * rect.height);
        star.style.position = 'absolute';
        star.style.left = "".concat(randomX, "px");
        star.style.top = "".concat(randomY, "px");
        star.style.zIndex = '10';
        parentElement.appendChild(star);
        // Remove after animation
        setTimeout(function () {
            star.remove();
        }, 1500);
    };
    StarRewardsApp.prototype.showRewardModal = function (reward) {
        var rewardModal = document.getElementById('rewardModal');
        var rewardTitle = document.getElementById('rewardTitle');
        var rewardProgress = document.getElementById('rewardProgress');
        var progressText = document.getElementById('progressText');
        var claimRewardBtn = document.getElementById('claimRewardBtn');
        var starsProgressContainer = document.getElementById('starsProgressContainer');
        if (!rewardModal || !rewardTitle || !rewardProgress || !progressText || !claimRewardBtn || !starsProgressContainer)
            return;
        // Set reward data
        rewardModal.dataset.rewardId = reward.id;
        rewardTitle.textContent = reward.name;
        // Calculate progress
        var progress = Math.min(100, (this.data.earnedStars / reward.starsNeeded) * 100);
        rewardProgress.style.width = "".concat(progress, "%");
        // Update text
        progressText.textContent = "".concat(this.data.earnedStars, "/").concat(reward.starsNeeded, " stars collected");
        // Show star progress with individual stars
        starsProgressContainer.innerHTML = '';
        for (var i = 1; i <= reward.starsNeeded; i++) {
            var starElement = document.createElement('span');
            starElement.className = "progress-star ".concat(i <= this.data.earnedStars ? 'earned' : 'unearned');
            starElement.textContent = '⭐';
            starsProgressContainer.appendChild(starElement);
        }
        // Show/hide claim button
        if (this.data.earnedStars >= reward.starsNeeded && !reward.claimed) {
            claimRewardBtn.classList.remove('hidden');
        }
        else {
            claimRewardBtn.classList.add('hidden');
        }
        // Display modal
        rewardModal.style.display = 'flex';
    };
    StarRewardsApp.prototype.claimReward = function (rewardId) {
        var reward = this.data.rewards.find(function (r) { return r.id === rewardId; });
        if (!reward || reward.claimed)
            return;
        if (this.data.earnedStars >= reward.starsNeeded) {
            // Deduct stars
            this.data.earnedStars -= reward.starsNeeded;
            // Mark as claimed
            reward.claimed = true;
            // Save data
            this.saveData();
            // Show animation and notification
            var rewardElement = document.querySelector(".reward-item[data-id=\"".concat(rewardId, "\"]"));
            if (rewardElement) {
                rewardElement.classList.add('reward-claim-animation');
            }
            this.showNotification("Reward claimed: ".concat(reward.name, "! \uD83C\uDF89"));
            this.renderRewards();
        }
    };
    StarRewardsApp.prototype.renderEditItems = function () {
        var _this = this;
        var _a, _b;
        if (this.activeEditTab === 'editTasks') {
            var taskItems_1 = document.getElementById('taskItems');
            if (!taskItems_1)
                return;
            taskItems_1.innerHTML = '';
            this.data.tasks.forEach(function (task) {
                var itemElement = document.createElement('div');
                itemElement.className = "edit-item ".concat(task.completed ? 'completed' : '');
                itemElement.dataset.id = task.id;
                itemElement.dataset.type = task.type;
                itemElement.dataset.status = task.completed ? 'completed' : 'active';
                itemElement.innerHTML = "\n                    <div>\n                        <span class=\"item-name\">".concat(task.name, "</span>\n                        <span class=\"item-details\">").concat(task.type, ", ").concat(task.stars, " \u2B50</span>\n                        ").concat(task.completed ? '<span class="status-badge completed">Completed</span>' : '', "\n                    </div>\n                    <div class=\"edit-buttons\">\n                        <button class=\"edit-btn\" data-id=\"").concat(task.id, "\">Edit</button>\n                        ").concat(task.completed && task.type === 'oneoff' ?
                    "<button class=\"reset-btn\" data-id=\"".concat(task.id, "\">Reset</button>") : '', "\n                        <button class=\"delete-btn\" data-id=\"").concat(task.id, "\">Delete</button>\n                    </div>\n                ");
                taskItems_1.appendChild(itemElement);
            });
            // Apply current filter
            var activeFilter = (_a = document.querySelector('#editTasks .filter-btn.active')) === null || _a === void 0 ? void 0 : _a.getAttribute('data-filter');
            this.filterEditItems(activeFilter);
        }
        else {
            var rewardItems_1 = document.getElementById('rewardItems');
            if (!rewardItems_1)
                return;
            rewardItems_1.innerHTML = '';
            this.data.rewards.forEach(function (reward) {
                var itemElement = document.createElement('div');
                itemElement.className = "edit-item ".concat(reward.claimed ? 'claimed' : '');
                itemElement.dataset.id = reward.id;
                itemElement.dataset.status = reward.claimed ? 'claimed' : 'active';
                itemElement.innerHTML = "\n                    <div>\n                        <span class=\"item-name\">".concat(reward.name, "</span>\n                        <span class=\"item-details\">").concat(reward.starsNeeded, " \u2B50</span>\n                        ").concat(reward.claimed ? '<span class="status-badge claimed">Claimed</span>' : '', "\n                    </div>\n                    <div class=\"edit-buttons\">\n                        <button class=\"edit-btn\" data-id=\"").concat(reward.id, "\">Edit</button>\n                        ").concat(reward.claimed ?
                    "<button class=\"reset-btn\" data-id=\"".concat(reward.id, "\">Reset</button>") : '', "\n                        <button class=\"delete-btn\" data-id=\"").concat(reward.id, "\">Delete</button>\n                    </div>\n                ");
                rewardItems_1.appendChild(itemElement);
            });
            // Apply current filter
            var activeFilter = (_b = document.querySelector('#editRewards .filter-btn.active')) === null || _b === void 0 ? void 0 : _b.getAttribute('data-filter');
            this.filterEditItems(activeFilter);
        }
        // Add event listeners for edit buttons
        var editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var target = e.target;
                var itemId = target.getAttribute('data-id');
                if (!itemId)
                    return;
                var addItemModal = document.getElementById('addItemModal');
                var addItemTitle = document.getElementById('addItemTitle');
                var nameInput = document.getElementById('itemName');
                var taskTypeGroup = document.getElementById('taskTypeGroup');
                var starsGroup = document.getElementById('starsGroup');
                var starsNeededGroup = document.getElementById('starsNeededGroup');
                var typeSelect = document.getElementById('taskType');
                var starsInput = document.getElementById('starValue');
                var starsNeededInput = document.getElementById('starsNeeded');
                if (!addItemModal || !addItemTitle || !nameInput)
                    return;
                if (_this.activeEditTab === 'editTasks') {
                    var task = _this.data.tasks.find(function (t) { return t.id === itemId; });
                    if (!task)
                        return;
                    addItemTitle.textContent = 'Edit Task';
                    nameInput.value = task.name;
                    if (typeSelect)
                        typeSelect.value = task.type;
                    if (starsInput)
                        starsInput.value = task.stars.toString();
                    taskTypeGroup === null || taskTypeGroup === void 0 ? void 0 : taskTypeGroup.classList.remove('hidden');
                    starsGroup === null || starsGroup === void 0 ? void 0 : starsGroup.classList.remove('hidden');
                    starsNeededGroup === null || starsNeededGroup === void 0 ? void 0 : starsNeededGroup.classList.add('hidden');
                    addItemModal.dataset.mode = 'editTask';
                    addItemModal.dataset.itemId = itemId;
                }
                else {
                    var reward = _this.data.rewards.find(function (r) { return r.id === itemId; });
                    if (!reward)
                        return;
                    addItemTitle.textContent = 'Edit Reward';
                    nameInput.value = reward.name;
                    if (starsNeededInput)
                        starsNeededInput.value = reward.starsNeeded.toString();
                    taskTypeGroup === null || taskTypeGroup === void 0 ? void 0 : taskTypeGroup.classList.add('hidden');
                    starsGroup === null || starsGroup === void 0 ? void 0 : starsGroup.classList.add('hidden');
                    starsNeededGroup === null || starsNeededGroup === void 0 ? void 0 : starsNeededGroup.classList.remove('hidden');
                    addItemModal.dataset.mode = 'editReward';
                    addItemModal.dataset.itemId = itemId;
                }
                addItemModal.style.display = 'flex';
            });
        });
        // Add event listeners for reset buttons
        var resetButtons = document.querySelectorAll('.reset-btn');
        resetButtons.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var target = e.target;
                var itemId = target.getAttribute('data-id');
                if (!itemId)
                    return;
                if (_this.activeEditTab === 'editTasks') {
                    var task = _this.data.tasks.find(function (t) { return t.id === itemId; });
                    if (task && task.completed) {
                        task.completed = false;
                        _this.showNotification('Task reset successfully!');
                    }
                }
                else {
                    var reward = _this.data.rewards.find(function (r) { return r.id === itemId; });
                    if (reward && reward.claimed) {
                        reward.claimed = false;
                        _this.showNotification('Reward reset successfully!');
                    }
                }
                _this.saveData();
                _this.renderTasks();
                _this.renderRewards();
                _this.renderEditItems();
            });
        });
        // Add event listeners for delete buttons
        var deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var target = e.target;
                var itemId = target.getAttribute('data-id');
                if (!itemId)
                    return;
                if (confirm('Are you sure you want to delete this item?')) {
                    if (_this.activeEditTab === 'editTasks') {
                        _this.data.tasks = _this.data.tasks.filter(function (t) { return t.id !== itemId; });
                        _this.showNotification('Task deleted!');
                    }
                    else {
                        _this.data.rewards = _this.data.rewards.filter(function (r) { return r.id !== itemId; });
                        _this.showNotification('Reward deleted!');
                    }
                    _this.saveData();
                    _this.renderTasks();
                    _this.renderRewards();
                    _this.renderEditItems();
                }
            });
        });
    };
    StarRewardsApp.prototype.filterEditItems = function (filterType) {
        if (!filterType || filterType === 'all') {
            // Show all items
            document.querySelectorAll('.edit-item').forEach(function (item) {
                item.style.display = 'flex';
            });
            return;
        }
        // Hide/show items based on filter
        document.querySelectorAll('.edit-item').forEach(function (item) {
            var status = item.getAttribute('data-status');
            if (status === filterType) {
                item.style.display = 'flex';
            }
            else {
                item.style.display = 'none';
            }
        });
    };
    StarRewardsApp.prototype.generateMathChallenge = function () {
        var mathQuestion = document.getElementById('mathQuestion');
        if (!mathQuestion)
            return;
        // Generate simple math for a 6-year-old
        var num1 = Math.floor(Math.random() * 5) + 1;
        var num2 = Math.floor(Math.random() * 5) + 1;
        var answer = num1 + num2;
        mathQuestion.textContent = "What is ".concat(num1, " + ").concat(num2, "?");
        mathQuestion.dataset.answer = answer.toString();
    };
    StarRewardsApp.prototype.showNotification = function (message) {
        var notification = document.getElementById('notification');
        var notificationText = document.getElementById('notificationText');
        if (!notification || !notificationText)
            return;
        notificationText.textContent = message;
        notification.classList.add('show');
        notification.classList.remove('hidden');
        setTimeout(function () {
            notification.classList.remove('show');
            setTimeout(function () {
                notification.classList.add('hidden');
            }, 300);
        }, 2000);
    };
    StarRewardsApp.prototype.updateSettingsUI = function () {
        var _this = this;
        // Google integration
        var googleToggle = document.getElementById('googleToggle');
        var googleApiKeySection = document.getElementById('googleApiKey');
        var apiKeyInput = document.getElementById('apiKey');
        if (googleToggle)
            googleToggle.checked = this.data.googleIntegration;
        if (apiKeyInput)
            apiKeyInput.value = this.data.googleApiKey || '';
        if (googleToggle && googleApiKeySection) {
            if (googleToggle.checked) {
                googleApiKeySection.classList.remove('hidden');
            }
            else {
                googleApiKeySection.classList.add('hidden');
            }
        }
        // Theme
        var themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(function (btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === _this.data.theme) {
                btn.classList.add('active');
            }
        });
    };
    StarRewardsApp.prototype.checkAndResetDailyTasks = function () {
        var today = new Date().toDateString();
        this.data.tasks
            .filter(function (task) { return task.type === 'daily' && task.completed; })
            .forEach(function (task) {
            var lastCompletedDate = task.lastCompleted ?
                new Date(task.lastCompleted).toDateString() : '';
            if (lastCompletedDate !== today) {
                task.completed = false;
            }
        });
        this.renderTasks();
    };
    StarRewardsApp.prototype.resetDailyTasks = function () {
        if (confirm('Are you sure you want to reset all daily tasks?')) {
            this.data.tasks
                .filter(function (task) { return task.type === 'daily' && task.completed; })
                .forEach(function (task) {
                task.completed = false;
            });
            this.saveData();
            this.renderTasks();
            this.showNotification('Daily tasks have been reset!');
        }
    };
    StarRewardsApp.prototype.setupGoogleSync = function () {
        var _this = this;
        // Clear any existing interval
        if (this.googleSyncInterval) {
            clearInterval(this.googleSyncInterval);
        }
        // Sync immediately
        this.syncToGoogle();
        // Set up interval (every 5 minutes)
        this.googleSyncInterval = window.setInterval(function () {
            _this.syncToGoogle();
        }, 5 * 60 * 1000);
    };
    // Add this method to the StarRewardsApp class
    // Add this enhanced method to the StarRewardsApp class
    StarRewardsApp.prototype.createZoomStar = function () {
        // Create container for the star
        var container = document.createElement('div');
        container.className = 'zoom-star-container';
        document.body.appendChild(container);
        // Create the zooming star
        var star = document.createElement('span');
        star.className = 'zoom-star';
        star.textContent = '⭐';
        container.appendChild(star);
        // Create glow element
        var glow = document.createElement('div');
        glow.className = 'star-glow';
        star.appendChild(glow);
        // Add screen shake effect
        var shakeIntensity = 5;
        var originalPosition = window.scrollY;
        // Small shake animation
        var shake = function () {
            var randomX = Math.random() * shakeIntensity * 2 - shakeIntensity;
            var randomY = Math.random() * shakeIntensity * 2 - shakeIntensity;
            document.body.style.transform = "translate(".concat(randomX, "px, ").concat(randomY, "px)");
        };
        // Run shake several times
        var shakeInterval = setInterval(shake, 50);
        setTimeout(function () {
            clearInterval(shakeInterval);
            document.body.style.transform = 'translate(0px, 0px)';
        }, 300);
        // Remove after animation completes
        setTimeout(function () {
            container.remove();
        }, 1500);
    };
    StarRewardsApp.prototype.syncToGoogle = function () {
        // This is a placeholder for Google Sheets API integration
        // In a real implementation, you would:
        // 1. Use the Google Sheets API to update a spreadsheet
        // 2. Handle authentication with the API key
        // 3. Format the data appropriately for the spreadsheet
        console.log('Syncing to Google...', this.data);
        // Update last sync time
        this.data.lastSync = new Date().toISOString();
        localStorage.setItem('starRewardsData', JSON.stringify(this.data));
    };
    return StarRewardsApp;
}());
// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    new StarRewardsApp();
});
