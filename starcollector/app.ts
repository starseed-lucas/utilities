interface Task {
    id: string;
    name: string;
    type: 'daily' | 'oneoff';
    stars: number;
    completed: boolean;
    lastCompleted?: string; // ISO date string
}

interface Reward {
    id: string;
    name: string;
    starsNeeded: number;
    claimed: boolean;
}

interface AppData {
    tasks: Task[];
    rewards: Reward[];
    earnedStars: number;
    theme: 'robots' | 'dinosaur' | 'unicorn' | 'pirate' | 'princess' | 'space' | 'superhero' | 'ocean';
    googleIntegration: boolean;
    googleApiKey?: string;
    lastSync?: string; // ISO date string
}

class StarRewardsApp {
    private data: AppData;
    private editMode: boolean = false;
    private activeTaskTab: 'daily' | 'oneoff' = 'daily';
    private activeEditTab: 'editTasks' | 'editRewards' = 'editTasks';
    private googleSyncInterval: number | null = null;

    constructor() {
        this.data = this.loadData();
        this.initializeApp();
    }

    private initializeApp(): void {
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
    }

    private loadData(): AppData {
        const savedData = localStorage.getItem('starRewardsData');
        if (savedData) {
            return JSON.parse(savedData);
        } else {
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
    }

    private saveData(): void {
        localStorage.setItem('starRewardsData', JSON.stringify(this.data));
        this.updateStarsDisplay();
        
        if (this.data.googleIntegration && this.data.googleApiKey) {
            this.syncToGoogle();
        }
    }

    private updateStarsDisplay(): void {
        const totalStarsElement = document.getElementById('totalStarsCount');
        if (totalStarsElement) {
            // Animate the change
            totalStarsElement.classList.add('star-update');
            totalStarsElement.textContent = this.data.earnedStars.toString();
            
            // Remove animation class after animation completes
            setTimeout(() => {
                totalStarsElement.classList.remove('star-update');
            }, 500);
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 11);
    }

// Update applyTheme method
private applyTheme(): void {
    document.body.classList.remove(
        'robots-theme', 
        'dinosaur-theme', 
        'unicorn-theme', 
        'pirate-theme', 
        'princess-theme',
        'space-theme',
        'superhero-theme',
        'ocean-theme'
    );
    document.body.classList.add(`${this.data.theme}-theme`);

    // Update theme emoticon
    const themeEmoticon = document.getElementById('themeEmoticon');
    if (themeEmoticon) {
        // Set emoticon based on theme
        switch(this.data.theme) {
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
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === this.data.theme) {
            btn.classList.add('active');
        }
    });
}

    private renderTasks(): void {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;

        taskList.innerHTML = '';

        const filteredTasks = this.data.tasks.filter(task => task.type === this.activeTaskTab);

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="empty-message">No tasks yet. Add some in the settings!</p>';
            return;
        }

        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;

            const starSymbols = '⭐'.repeat(task.stars);

            taskElement.innerHTML = `
                <div class="task-content">
                    <span class="task-name">${task.name}</span>
                    <span class="stars">${starSymbols}</span>
                </div>
                <div class="task-actions">
                    ${!task.completed ? 
                        `<button class="complete-btn" data-id="${task.id}">✓</button>` : 
                        '<span class="completed-text">✓ Done</span>'}
                </div>
            `;

            taskList.appendChild(taskElement);
        });

        // Add click listeners to complete buttons
        const completeButtons = document.querySelectorAll('.complete-btn');
        completeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const taskId = target.getAttribute('data-id');
                if (taskId) {
                    this.completeTask(taskId);
                }
            });
        });
    }

    private renderRewards(): void {
        const rewardsList = document.getElementById('rewardsList');
        if (!rewardsList) return;

        rewardsList.innerHTML = '';

        if (this.data.rewards.length === 0) {
            rewardsList.innerHTML = '<p class="empty-message">No rewards yet. Add some in the settings!</p>';
            return;
        }

        this.data.rewards.forEach(reward => {
            const rewardElement = document.createElement('div');
            rewardElement.className = `reward-item ${reward.claimed ? 'claimed' : ''}`;
            rewardElement.dataset.id = reward.id;
            rewardElement.style.position = 'relative'; // For claimed badge positioning

            // Create star display with both earned and unearned stars
            const earnedStarsCount = Math.min(this.data.earnedStars, reward.starsNeeded);
            const unearnedStarsCount = reward.starsNeeded - earnedStarsCount;
            
            const earnedStars = '⭐'.repeat(Math.min(5, earnedStarsCount));
            const unearnedStars = '⭐'.repeat(Math.min(5, unearnedStarsCount));
            
            // Only show counts if more than 5 stars
            const extraCount = reward.starsNeeded > 5 ? ` +${reward.starsNeeded - 5}` : '';

            rewardElement.innerHTML = `
                <span class="reward-name">${reward.name}</span>
                <div class="reward-info">
                    <span class="stars-progress">
                        <span class="earned-stars">${earnedStars}</span>
                        <span class="unearned-stars" style="opacity: 0.3; filter: grayscale(1);">${unearnedStars}</span>
                        ${extraCount ? `<span class="extra-count">${extraCount}</span>` : ''}
                    </span>
                </div>
            `;

            rewardElement.addEventListener('click', () => {
                this.showRewardModal(reward);
            });

            rewardsList.appendChild(rewardElement);
        });
    }

    private setupEventListeners(): void {
        // Task tab switching
        const taskTabs = document.querySelectorAll('.task-tabs .tab');
        taskTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const tabType = target.getAttribute('data-tab') as 'daily' | 'oneoff';
                if (tabType) {
                    this.activeTaskTab = tabType;
                    taskTabs.forEach(t => t.classList.remove('active'));
                    target.classList.add('active');
                    this.renderTasks();
                }
            });
        });
        
        // Reset daily tasks button
        const resetDailyBtn = document.getElementById('resetDailyBtn');
        if (resetDailyBtn) {
            resetDailyBtn.addEventListener('click', () => {
                this.resetDailyTasks();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeButtons = document.querySelectorAll('.close');

        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'flex';
                this.updateSettingsUI();
            });
        }

        // Close buttons for modals
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal') as HTMLElement;
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Theme selection
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const theme = target.getAttribute('data-theme') as 'robots' | 'dinosaur' | 'unicorn' | 'pirate' | 'princess';
                if (theme) {
                    this.data.theme = theme;
                    this.applyTheme();
                    this.saveData();
                    this.showNotification('Theme updated!');
                }
            });
        });

        // Google integration toggle
        const googleToggle = document.getElementById('googleToggle') as HTMLInputElement;
        const googleApiKeySection = document.getElementById('googleApiKey');

        if (googleToggle && googleApiKeySection) {
            googleToggle.checked = this.data.googleIntegration;
            googleToggle.addEventListener('change', () => {
                this.data.googleIntegration = googleToggle.checked;
                if (googleToggle.checked) {
                    googleApiKeySection.classList.remove('hidden');
                } else {
                    googleApiKeySection.classList.add('hidden');
                    if (this.googleSyncInterval) {
                        clearInterval(this.googleSyncInterval);
                        this.googleSyncInterval = null;
                    }
                }
                this.saveData();
            });
        }

        // Save API key
        const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
        const saveApiKeyBtn = document.getElementById('saveApiKey');

        if (apiKeyInput && saveApiKeyBtn) {
            apiKeyInput.value = this.data.googleApiKey || '';
            saveApiKeyBtn.addEventListener('click', () => {
                this.data.googleApiKey = apiKeyInput.value;
                this.saveData();
                this.setupGoogleSync();
                this.showNotification('API key saved!');
            });
        }

        // Edit mode button
        const editModeBtn = document.getElementById('editModeBtn');
        const mathChallenge = document.getElementById('mathChallenge');

        if (editModeBtn && mathChallenge) {
            editModeBtn.addEventListener('click', () => {
                this.generateMathChallenge();
                mathChallenge.classList.remove('hidden');
            });
        }

        // Check math answer
        const mathAnswerInput = document.getElementById('mathAnswer') as HTMLInputElement;
        const checkAnswerBtn = document.getElementById('checkAnswer');
        const editModal = document.getElementById('editModal');

        if (mathAnswerInput && checkAnswerBtn && editModal) {
            checkAnswerBtn.addEventListener('click', () => {
                const userAnswer = parseInt(mathAnswerInput.value);
                const correctAnswer = parseInt(
                    (document.getElementById('mathQuestion') as HTMLElement).dataset.answer || '0'
                );

                if (userAnswer === correctAnswer) {
                    mathChallenge?.classList.add('hidden');
                    this.editMode = true;
                    editModal.style.display = 'flex';
                    this.renderEditItems();
                    this.showNotification('Edit mode enabled!');
                } else {
                    this.showNotification('Incorrect answer, try again!');
                    this.generateMathChallenge();
                }

                mathAnswerInput.value = '';
            });
        }

        // Edit tabs
        const editTabs = document.querySelectorAll('.edit-tabs .tab');
        editTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const tabType = target.getAttribute('data-tab') as 'editTasks' | 'editRewards';
                if (tabType) {
                    this.activeEditTab = tabType;
                    editTabs.forEach(t => t.classList.remove('active'));
                    target.classList.add('active');
                    
                    document.getElementById('editTasks')?.classList.add('hidden');
                    document.getElementById('editRewards')?.classList.add('hidden');
                    document.getElementById(tabType)?.classList.remove('hidden');
                    
                    this.renderEditItems();
                }
            });
        });

        // Add task/reward buttons
        const addTaskBtn = document.getElementById('addTaskBtn');
        const addRewardBtn = document.getElementById('addRewardBtn');
        const addItemModal = document.getElementById('addItemModal');
        const addItemTitle = document.getElementById('addItemTitle');
        const taskTypeGroup = document.getElementById('taskTypeGroup');
        const starsGroup = document.getElementById('starsGroup');
        const starsNeededGroup = document.getElementById('starsNeededGroup');

        if (addTaskBtn && addRewardBtn && addItemModal && addItemTitle && taskTypeGroup && starsGroup && starsNeededGroup) {
            addTaskBtn.addEventListener('click', () => {
                addItemTitle.textContent = 'Add Task';
                taskTypeGroup.classList.remove('hidden');
                starsGroup.classList.remove('hidden');
                starsNeededGroup.classList.add('hidden');
                addItemModal.style.display = 'flex';
                addItemModal.dataset.mode = 'task';
            });

            addRewardBtn.addEventListener('click', () => {
                addItemTitle.textContent = 'Add Reward';
                taskTypeGroup.classList.add('hidden');
                starsGroup.classList.add('hidden');
                starsNeededGroup.classList.remove('hidden');
                addItemModal.style.display = 'flex';
                addItemModal.dataset.mode = 'reward';
            });
        }

        // Save new item
        const addItemForm = document.getElementById('addItemForm');
        if (addItemForm) {
            addItemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('itemName') as HTMLInputElement;
                const mode = (addItemModal as HTMLElement).dataset.mode;

                if (mode === 'task') {
                    const typeSelect = document.getElementById('taskType') as HTMLSelectElement;
                    const starsInput = document.getElementById('starValue') as HTMLInputElement;
                    
                    const newTask: Task = {
                        id: this.generateId(),
                        name: nameInput.value,
                        type: typeSelect.value as 'daily' | 'oneoff',
                        stars: parseInt(starsInput.value),
                        completed: false
                    };

                    this.data.tasks.push(newTask);
                    this.showNotification('Task added!');
                } else if (mode === 'reward') {
                    const starsNeededInput = document.getElementById('starsNeeded') as HTMLInputElement;
                    
                    const newReward: Reward = {
                        id: this.generateId(),
                        name: nameInput.value,
                        starsNeeded: parseInt(starsNeededInput.value),
                        claimed: false
                    };

                    this.data.rewards.push(newReward);
                    this.showNotification('Reward added!');
                } else if (mode === 'editTask') {
                    const typeSelect = document.getElementById('taskType') as HTMLSelectElement;
                    const starsInput = document.getElementById('starValue') as HTMLInputElement;
                    const taskId = addItemModal?.dataset.itemId;
                    
                    const task = this.data.tasks.find(t => t.id === taskId);
                    if (task) {
                        task.name = nameInput.value;
                        task.type = typeSelect.value as 'daily' | 'oneoff';
                        task.stars = parseInt(starsInput.value);
                        this.showNotification('Task updated!');
                    }
                } else if (mode === 'editReward') {
                    const starsNeededInput = document.getElementById('starsNeeded') as HTMLInputElement;
                    const rewardId = addItemModal?.dataset.itemId;
                    
                    const reward = this.data.rewards.find(r => r.id === rewardId);
                    if (reward) {
                        reward.name = nameInput.value;
                        reward.starsNeeded = parseInt(starsNeededInput.value);
                        this.showNotification('Reward updated!');
                    }
                }

                this.saveData();
                this.renderTasks();
                this.renderRewards();
                this.renderEditItems();
                (addItemModal as HTMLElement).style.display = 'none';
                nameInput.value = '';
            });
        }

        // Reset data button
        const resetDataBtn = document.getElementById('resetDataBtn');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
                    localStorage.removeItem('starRewardsData');
                    this.data = this.loadData();
                    this.applyTheme();
                    this.renderTasks();
                    this.renderRewards();
                    this.updateStarsDisplay();
                    this.showNotification('All data has been reset!');
                    (document.getElementById('editModal') as HTMLElement).style.display = 'none';
                }
            });
        }
        
        // Clear finished rewards button
        const clearFinishedRewardsBtn = document.getElementById('clearFinishedRewardsBtn');
        if (clearFinishedRewardsBtn) {
            clearFinishedRewardsBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to remove all claimed rewards?')) {
                    const claimedRewardsCount = this.data.rewards.filter(r => r.claimed).length;
                    
                    if (claimedRewardsCount === 0) {
                        this.showNotification('No claimed rewards to remove!');
                        return;
                    }
                    
                    this.data.rewards = this.data.rewards.filter(r => !r.claimed);
                    this.saveData();
                    this.renderRewards();
                    this.renderEditItems();
                    this.showNotification(`Removed ${claimedRewardsCount} claimed reward${claimedRewardsCount !== 1 ? 's' : ''}!`);
                }
            });
        }
        
        // Reset claimed rewards button
        const resetClaimedRewardsBtn = document.getElementById('resetClaimedRewardsBtn');
        if (resetClaimedRewardsBtn) {
            resetClaimedRewardsBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all claimed rewards? They will be available to claim again.')) {
                    const claimedRewardsCount = this.data.rewards.filter(r => r.claimed).length;
                    
                    if (claimedRewardsCount === 0) {
                        this.showNotification('No claimed rewards to reset!');
                        return;
                    }
                    
                    this.data.rewards.forEach(reward => {
                        if (reward.claimed) {
                            reward.claimed = false;
                        }
                    });
                    
                    this.saveData();
                    this.renderRewards();
                    this.renderEditItems();
                    this.showNotification(`Reset ${claimedRewardsCount} claimed reward${claimedRewardsCount !== 1 ? 's' : ''}!`);
                }
            });
        }
        
        // Reset completed one-off tasks button
        const resetCompletedTasksBtn = document.getElementById('resetCompletedTasksBtn');
        if (resetCompletedTasksBtn) {
            resetCompletedTasksBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all completed one-off tasks?')) {
                    const completedTasksCount = this.data.tasks.filter(t => t.type === 'oneoff' && t.completed).length;
                    
                    if (completedTasksCount === 0) {
                        this.showNotification('No completed one-off tasks to reset!');
                        return;
                    }
                    
                    this.data.tasks.forEach(task => {
                        if (task.type === 'oneoff' && task.completed) {
                            task.completed = false;
                        }
                    });
                    
                    this.saveData();
                    this.renderTasks();
                    this.renderEditItems();
                    this.showNotification(`Reset ${completedTasksCount} completed one-off task${completedTasksCount !== 1 ? 's' : ''}!`);
                }
            });
        }
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const filterType = target.getAttribute('data-filter');
                const filterSection = target.closest('.edit-section');
                
                // Update active filter button
                filterSection?.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                
                // Apply filter to items
                this.filterEditItems(filterType);
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (e.target === modal) {
                    (modal as HTMLElement).style.display = 'none';
                }
            });
        });

        // Reward modal handling
        const rewardModal = document.getElementById('rewardModal');
        const claimRewardBtn = document.getElementById('claimRewardBtn');
        
        if (claimRewardBtn) {
            claimRewardBtn.addEventListener('click', () => {
                const rewardId = (rewardModal as HTMLElement).dataset.rewardId;
                if (rewardId) {
                    this.claimReward(rewardId);
                    (rewardModal as HTMLElement).style.display = 'none';
                }
            });
        }
    }

private completeTask(taskId: string): void {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (!task) return;

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
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    if (taskElement) {
        taskElement.classList.add('task-complete-animation');
        
        // Create floating stars animation
        for (let i = 0; i < task.stars; i++) {
            setTimeout(() => {
                this.createFloatingStar(taskElement as HTMLElement);
            }, i * 200);
        }
        
        // Update the task display
        setTimeout(() => {
            this.renderTasks();
            this.renderRewards(); // Refresh rewards in case any became available
            this.showNotification(`You earned ${task.stars} ⭐!`);
        }, 800);
    }
}

    private createFloatingStar(parentElement: HTMLElement): void {
        const star = document.createElement('span');
        star.className = 'floating-star';
        star.textContent = '⭐';
        star.style.fontSize = '1.5rem';
        
        // Random position within the parent element
        const rect = parentElement.getBoundingClientRect();
        const randomX = Math.floor(Math.random() * rect.width);
        const randomY = Math.floor(Math.random() * rect.height);
        
        star.style.position = 'absolute';
        star.style.left = `${randomX}px`;
        star.style.top = `${randomY}px`;
        star.style.zIndex = '10';
        
        parentElement.appendChild(star);
        
        // Remove after animation
        setTimeout(() => {
            star.remove();
        }, 1500);
    }

    private showRewardModal(reward: Reward): void {
        const rewardModal = document.getElementById('rewardModal');
        const rewardTitle = document.getElementById('rewardTitle');
        const rewardProgress = document.getElementById('rewardProgress');
        const progressText = document.getElementById('progressText');
        const claimRewardBtn = document.getElementById('claimRewardBtn');
        const starsProgressContainer = document.getElementById('starsProgressContainer');
        
        if (!rewardModal || !rewardTitle || !rewardProgress || !progressText || !claimRewardBtn || !starsProgressContainer) return;
        
        // Set reward data
        rewardModal.dataset.rewardId = reward.id;
        rewardTitle.textContent = reward.name;
        
        // Calculate progress
        const progress = Math.min(100, (this.data.earnedStars / reward.starsNeeded) * 100);
        rewardProgress.style.width = `${progress}%`;
        
        // Update text
        progressText.textContent = `${this.data.earnedStars}/${reward.starsNeeded} stars collected`;
        
        // Show star progress with individual stars
        starsProgressContainer.innerHTML = '';
        for (let i = 1; i <= reward.starsNeeded; i++) {
            const starElement = document.createElement('span');
            starElement.className = `progress-star ${i <= this.data.earnedStars ? 'earned' : 'unearned'}`;
            starElement.textContent = '⭐';
            starsProgressContainer.appendChild(starElement);
        }
        
        // Show/hide claim button
        if (this.data.earnedStars >= reward.starsNeeded && !reward.claimed) {
            claimRewardBtn.classList.remove('hidden');
        } else {
            claimRewardBtn.classList.add('hidden');
        }
        
        // Display modal
        rewardModal.style.display = 'flex';
    }

    private claimReward(rewardId: string): void {
        const reward = this.data.rewards.find(r => r.id === rewardId);
        if (!reward || reward.claimed) return;
        
        if (this.data.earnedStars >= reward.starsNeeded) {
            // Deduct stars
            this.data.earnedStars -= reward.starsNeeded;
            
            // Mark as claimed
            reward.claimed = true;
            
            // Save data
            this.saveData();
            
            // Show animation and notification
            const rewardElement = document.querySelector(`.reward-item[data-id="${rewardId}"]`);
            if (rewardElement) {
                rewardElement.classList.add('reward-claim-animation');
            }
            
            this.showNotification(`Reward claimed: ${reward.name}! 🎉`);
            this.renderRewards();
        }
    }

    private renderEditItems(): void {
        if (this.activeEditTab === 'editTasks') {
            const taskItems = document.getElementById('taskItems');
            if (!taskItems) return;
            
            taskItems.innerHTML = '';
            
            this.data.tasks.forEach(task => {
                const itemElement = document.createElement('div');
                itemElement.className = `edit-item ${task.completed ? 'completed' : ''}`;
                itemElement.dataset.id = task.id;
                itemElement.dataset.type = task.type;
                itemElement.dataset.status = task.completed ? 'completed' : 'active';
                
                itemElement.innerHTML = `
                    <div>
                        <span class="item-name">${task.name}</span>
                        <span class="item-details">${task.type}, ${task.stars} ⭐</span>
                        ${task.completed ? '<span class="status-badge completed">Completed</span>' : ''}
                    </div>
                    <div class="edit-buttons">
                        <button class="edit-btn" data-id="${task.id}">Edit</button>
                        ${task.completed && task.type === 'oneoff' ? 
                          `<button class="reset-btn" data-id="${task.id}">Reset</button>` : ''}
                        <button class="delete-btn" data-id="${task.id}">Delete</button>
                    </div>
                `;
                
                taskItems.appendChild(itemElement);
            });
            
            // Apply current filter
            const activeFilter = document.querySelector('#editTasks .filter-btn.active')?.getAttribute('data-filter');
            this.filterEditItems(activeFilter);
        } else {
            const rewardItems = document.getElementById('rewardItems');
            if (!rewardItems) return;
            
            rewardItems.innerHTML = '';
            
            this.data.rewards.forEach(reward => {
                const itemElement = document.createElement('div');
                itemElement.className = `edit-item ${reward.claimed ? 'claimed' : ''}`;
                itemElement.dataset.id = reward.id;
                itemElement.dataset.status = reward.claimed ? 'claimed' : 'active';
                
                itemElement.innerHTML = `
                    <div>
                        <span class="item-name">${reward.name}</span>
                        <span class="item-details">${reward.starsNeeded} ⭐</span>
                        ${reward.claimed ? '<span class="status-badge claimed">Claimed</span>' : ''}
                    </div>
                    <div class="edit-buttons">
                        <button class="edit-btn" data-id="${reward.id}">Edit</button>
                        ${reward.claimed ? 
                          `<button class="reset-btn" data-id="${reward.id}">Reset</button>` : ''}
                        <button class="delete-btn" data-id="${reward.id}">Delete</button>
                    </div>
                `;
                
                rewardItems.appendChild(itemElement);
            });
            
            // Apply current filter
            const activeFilter = document.querySelector('#editRewards .filter-btn.active')?.getAttribute('data-filter');
            this.filterEditItems(activeFilter);
        }
        
        // Add event listeners for edit buttons
        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const itemId = target.getAttribute('data-id');
                if (!itemId) return;
                
                const addItemModal = document.getElementById('addItemModal');
                const addItemTitle = document.getElementById('addItemTitle');
                const nameInput = document.getElementById('itemName') as HTMLInputElement;
                const taskTypeGroup = document.getElementById('taskTypeGroup');
                const starsGroup = document.getElementById('starsGroup');
                const starsNeededGroup = document.getElementById('starsNeededGroup');
                const typeSelect = document.getElementById('taskType') as HTMLSelectElement;
                const starsInput = document.getElementById('starValue') as HTMLInputElement;
                const starsNeededInput = document.getElementById('starsNeeded') as HTMLInputElement;
                
                if (!addItemModal || !addItemTitle || !nameInput) return;
                
                if (this.activeEditTab === 'editTasks') {
                    const task = this.data.tasks.find(t => t.id === itemId);
                    if (!task) return;
                    
                    addItemTitle.textContent = 'Edit Task';
                    nameInput.value = task.name;
                    
                    if (typeSelect) typeSelect.value = task.type;
                    if (starsInput) starsInput.value = task.stars.toString();
                    
                    taskTypeGroup?.classList.remove('hidden');
                    starsGroup?.classList.remove('hidden');
                    starsNeededGroup?.classList.add('hidden');
                    
                    addItemModal.dataset.mode = 'editTask';
                    addItemModal.dataset.itemId = itemId;
                } else {
                    const reward = this.data.rewards.find(r => r.id === itemId);
                    if (!reward) return;
                    
                    addItemTitle.textContent = 'Edit Reward';
                    nameInput.value = reward.name;
                    
                    if (starsNeededInput) starsNeededInput.value = reward.starsNeeded.toString();
                    
                    taskTypeGroup?.classList.add('hidden');
                    starsGroup?.classList.add('hidden');
                    starsNeededGroup?.classList.remove('hidden');
                    
                    addItemModal.dataset.mode = 'editReward';
                    addItemModal.dataset.itemId = itemId;
                }
                
                addItemModal.style.display = 'flex';
            });
        });
        
        // Add event listeners for reset buttons
        const resetButtons = document.querySelectorAll('.reset-btn');
        resetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const itemId = target.getAttribute('data-id');
                if (!itemId) return;
                
                if (this.activeEditTab === 'editTasks') {
                    const task = this.data.tasks.find(t => t.id === itemId);
                    if (task && task.completed) {
                        task.completed = false;
                        this.showNotification('Task reset successfully!');
                    }
                } else {
                    const reward = this.data.rewards.find(r => r.id === itemId);
                    if (reward && reward.claimed) {
                        reward.claimed = false;
                        this.showNotification('Reward reset successfully!');
                    }
                }
                
                this.saveData();
                this.renderTasks();
                this.renderRewards();
                this.renderEditItems();
            });
        });
        
        // Add event listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const itemId = target.getAttribute('data-id');
                if (!itemId) return;
                
                if (confirm('Are you sure you want to delete this item?')) {
                    if (this.activeEditTab === 'editTasks') {
                        this.data.tasks = this.data.tasks.filter(t => t.id !== itemId);
                        this.showNotification('Task deleted!');
                    } else {
                        this.data.rewards = this.data.rewards.filter(r => r.id !== itemId);
                        this.showNotification('Reward deleted!');
                    }
                    
                    this.saveData();
                    this.renderTasks();
                    this.renderRewards();
                    this.renderEditItems();
                }
            });
        });
    }

    private filterEditItems(filterType: string | null): void {
        if (!filterType || filterType === 'all') {
            // Show all items
            document.querySelectorAll('.edit-item').forEach(item => {
                (item as HTMLElement).style.display = 'flex';
            });
            return;
        }
        
        // Hide/show items based on filter
        document.querySelectorAll('.edit-item').forEach(item => {
            const status = item.getAttribute('data-status');
            if (status === filterType) {
                (item as HTMLElement).style.display = 'flex';
            } else {
                (item as HTMLElement).style.display = 'none';
            }
        });
    }

    private generateMathChallenge(): void {
        const mathQuestion = document.getElementById('mathQuestion');
        if (!mathQuestion) return;
        
        // Generate simple math for a 6-year-old
        const num1 = Math.floor(Math.random() * 5) + 1;
        const num2 = Math.floor(Math.random() * 5) + 1;
        const answer = num1 + num2;
        
        mathQuestion.textContent = `What is ${num1} + ${num2}?`;
        mathQuestion.dataset.answer = answer.toString();
    }

    private showNotification(message: string): void {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        if (!notification || !notificationText) return;
        
        notificationText.textContent = message;
        notification.classList.add('show');
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300);
        }, 2000);
    }

    private updateSettingsUI(): void {
        // Google integration
        const googleToggle = document.getElementById('googleToggle') as HTMLInputElement;
        const googleApiKeySection = document.getElementById('googleApiKey');
        const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
        
        if (googleToggle) googleToggle.checked = this.data.googleIntegration;
        if (apiKeyInput) apiKeyInput.value = this.data.googleApiKey || '';
        
        if (googleToggle && googleApiKeySection) {
            if (googleToggle.checked) {
                googleApiKeySection.classList.remove('hidden');
            } else {
                googleApiKeySection.classList.add('hidden');
            }
        }
        
        // Theme
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === this.data.theme) {
                btn.classList.add('active');
            }
        });
    }

    private checkAndResetDailyTasks(): void {
        const today = new Date().toDateString();
        
        this.data.tasks
            .filter(task => task.type === 'daily' && task.completed)
            .forEach(task => {
                const lastCompletedDate = task.lastCompleted ? 
                    new Date(task.lastCompleted).toDateString() : '';
                
                if (lastCompletedDate !== today) {
                    task.completed = false;
                }
            });
        
        this.renderTasks();
    }
    
    private resetDailyTasks(): void {
        if (confirm('Are you sure you want to reset all daily tasks?')) {
            this.data.tasks
                .filter(task => task.type === 'daily' && task.completed)
                .forEach(task => {
                    task.completed = false;
                });
            
            this.saveData();
            this.renderTasks();
            this.showNotification('Daily tasks have been reset!');
        }
    }

    private setupGoogleSync(): void {
        // Clear any existing interval
        if (this.googleSyncInterval) {
            clearInterval(this.googleSyncInterval);
        }
        
        // Sync immediately
        this.syncToGoogle();
        
        // Set up interval (every 5 minutes)
        this.googleSyncInterval = window.setInterval(() => {
            this.syncToGoogle();
        }, 5 * 60 * 1000);
    }

// Add this method to the StarRewardsApp class
// Add this enhanced method to the StarRewardsApp class
private createZoomStar(): void {
    // Create container for the star
    const container = document.createElement('div');
    container.className = 'zoom-star-container';
    document.body.appendChild(container);
    
    // Create the zooming star
    const star = document.createElement('span');
    star.className = 'zoom-star';
    star.textContent = '⭐';
    container.appendChild(star);
    
    // Create glow element
    const glow = document.createElement('div');
    glow.className = 'star-glow';
    star.appendChild(glow);
    
    // Add screen shake effect
    const shakeIntensity = 5;
    const originalPosition = window.scrollY;
    
    // Small shake animation
    const shake = () => {
        const randomX = Math.random() * shakeIntensity * 2 - shakeIntensity;
        const randomY = Math.random() * shakeIntensity * 2 - shakeIntensity;
        document.body.style.transform = `translate(${randomX}px, ${randomY}px)`;
    };
    
    // Run shake several times
    const shakeInterval = setInterval(shake, 50);
    setTimeout(() => {
        clearInterval(shakeInterval);
        document.body.style.transform = 'translate(0px, 0px)';
    }, 300);
    
    // Remove after animation completes
    setTimeout(() => {
        container.remove();
    }, 1500);
}

    private syncToGoogle(): void {
        // This is a placeholder for Google Sheets API integration
        // In a real implementation, you would:
        // 1. Use the Google Sheets API to update a spreadsheet
        // 2. Handle authentication with the API key
        // 3. Format the data appropriately for the spreadsheet
        
        console.log('Syncing to Google...', this.data);
        
        // Update last sync time
        this.data.lastSync = new Date().toISOString();
        localStorage.setItem('starRewardsData', JSON.stringify(this.data));
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StarRewardsApp();
});