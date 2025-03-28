// app.ts - Main application class

import { Task, Reward, AppData, getDefaultData, generateId } from './models';
import { 
    createFloatingStar, 
    createZoomStar, 
    shouldResetDailyTasks, 
    showNotification, 
    generateMathChallenge,
    initializeTaskOrder
} from './utils';
import { firebaseService } from './firebase-service';

class StarRewardsApp {
    private data: AppData;
    private editMode: boolean = false;
    private reorderMode: boolean = false;
    private activeTaskTab: 'daily' | 'oneoff' = 'daily';
    private activeEditTab: 'editTasks' | 'editRewards' = 'editTasks';
    private syncInterval: number | null = null;
    private draggedTask: HTMLElement | null = null;
    private originalTaskOrder: Task[] = [];

    constructor() {
        this.data = this.loadData();
        this.initializeApp();
    }

    private async initializeApp(): Promise<void> {
        this.applyTheme();
        this.renderTasks();
        this.renderRewards();
        this.updateStarsDisplay();
        this.setupEventListeners();

        // Initialize Firebase if enabled
        if (this.data.firebaseEnabled && this.data.userId) {
            await this.setupFirebaseSync();
        }

        // Reset daily tasks if needed
        this.checkAndResetDailyTasks();
        
        // Initialize task order if not already set
        this.ensureTaskOrder();
    }
    
    private ensureTaskOrder(): void {
        // Check if any tasks don't have an order property
        const needsOrdering = this.data.tasks.some(task => typeof task.order !== 'number');
        
        if (needsOrdering) {
            initializeTaskOrder(this.data.tasks);
            this.saveData();
        }
    }

    private loadData(): AppData {
        const savedData = localStorage.getItem('starRewardsData');
        if (savedData) {
            return JSON.parse(savedData);
        } else {
            // Use default data
            return getDefaultData();
        }
    }

    private async saveData(): Promise<void> {
        localStorage.setItem('starRewardsData', JSON.stringify(this.data));
        this.updateStarsDisplay();
        
        // Sync to Firebase if enabled
        if (this.data.firebaseEnabled && firebaseService.isUserSignedIn()) {
            await this.syncToFirebase();
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

        // Get tasks for the current tab and sort them by order
        const filteredTasks = this.data.tasks
            .filter(task => task.type === this.activeTaskTab)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="empty-message">No tasks yet. Add some in the settings!</p>';
            return;
        }

        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''} ${this.reorderMode ? 'reorder-mode' : ''}`;
            taskElement.dataset.id = task.id;
            taskElement.dataset.order = (task.order || 0).toString();

            const starSymbols = '⭐'.repeat(task.stars);

            taskElement.innerHTML = `
                ${this.reorderMode ? '<span class="drag-handle">⋮⋮</span>' : ''}
                <div class="task-content">
                    <span class="task-name">${task.name}</span>
                    <span class="stars">${starSymbols}</span>
                </div>
                <div class="task-actions">
                    ${!task.completed && !this.reorderMode ? 
                        `<button class="complete-btn" data-id="${task.id}">✓</button>` : 
                        this.reorderMode ? '' : '<span class="completed-text">✓ Done</span>'}
                </div>
            `;

            taskList.appendChild(taskElement);
            
            // Add drag functionality if in reorder mode
            if (this.reorderMode) {
                this.addDragListeners(taskElement);
            }
        });

        // Add click listeners to complete buttons (if not in reorder mode)
        if (!this.reorderMode) {
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
        
        // Show/hide task order controls
        const taskOrderControls = document.getElementById('taskOrderControls');
        if (taskOrderControls) {
            if (this.reorderMode) {
                taskOrderControls.classList.remove('hidden');
            } else {
                taskOrderControls.classList.add('hidden');
            }
        }
    }
    
    private addDragListeners(element: HTMLElement): void {
        element.setAttribute('draggable', 'true');
        
        element.addEventListener('dragstart', (e) => {
            this.draggedTask = element;
            element.classList.add('dragging');
            
            // For Firefox compatibility
            if (e.dataTransfer) {
                e.dataTransfer.setData('text/plain', element.dataset.id || '');
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        
        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
            this.draggedTask = null;
        });
        
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'move';
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (!this.draggedTask || element === this.draggedTask) return;
            
            const taskList = document.getElementById('taskList');
            if (!taskList) return;
            
            // Get positions for reordering
            const draggedId = this.draggedTask.dataset.id;
            const targetId = element.dataset.id;
            
            if (!draggedId || !targetId) return;
            
            // Find the tasks in the data array
            const draggedTask = this.data.tasks.find(t => t.id === draggedId);
            const targetTask = this.data.tasks.find(t => t.id === targetId);
            
            if (!draggedTask || !targetTask || draggedTask.type !== targetTask.type) return;
            
            // Get all tasks of this type and sort them by current order
            const tasksOfType = this.data.tasks
                .filter(t => t.type === this.activeTaskTab)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            
            // Find new position for the dragged task
            const draggedIndex = tasksOfType.findIndex(t => t.id === draggedId);
            const targetIndex = tasksOfType.findIndex(t => t.id === targetId);
            
            if (draggedIndex === -1 || targetIndex === -1) return;
            
            // Remove the dragged task from its current position
            const [removedTask] = tasksOfType.splice(draggedIndex, 1);
            
            // Insert it at the target position
            tasksOfType.splice(targetIndex, 0, removedTask);
            
            // Update the order values
            tasksOfType.forEach((task, index) => {
                task.order = index;
            });
            
            // Re-render the task list
            this.renderTasks();
        });
    }
    
    private saveTaskOrder(): void {
        // Actually, we're already updating the task order in real-time during drag and drop
        // So we just need to save the data and exit reorder mode
        this.saveData();
        this.toggleReorderMode();
        showNotification('Task order saved!');
    }
    
    private toggleReorderMode(): void {
        if (!this.reorderMode) {
            // Save current task order before entering reorder mode
            this.originalTaskOrder = JSON.parse(JSON.stringify(this.data.tasks));
        } else {
            // If canceling reorder mode without saving, restore original order
            const saveButton = document.getElementById('taskOrderSaveBtn');
            if (saveButton && !saveButton.classList.contains('clicked')) {
                this.data.tasks = this.originalTaskOrder;
            }
        }
        
        // Toggle mode
        this.reorderMode = !this.reorderMode;
        
        // Update UI
        this.renderTasks();
        
        // Toggle button text
        const reorderBtn = document.getElementById('reorderTasksBtn');
        if (reorderBtn) {
            reorderBtn.textContent = this.reorderMode ? 'Cancel Reordering' : 'Reorder Tasks';
            reorderBtn.style.backgroundColor = this.reorderMode ? 
                'var(--accent-color)' : 'var(--secondary-color)';
        }
    }
    
    private cancelTaskReordering(): void {
        // Restore original task order
        this.data.tasks = this.originalTaskOrder;
        
        // Exit reorder mode
        this.reorderMode = false;
        this.renderTasks();
        
        // Reset reorder button
        const reorderBtn = document.getElementById('reorderTasksBtn');
        if (reorderBtn) {
            reorderBtn.textContent = 'Reorder Tasks';
            reorderBtn.style.backgroundColor = 'var(--secondary-color)';
        }
        
        showNotification('Reordering cancelled');
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
                // If in reorder mode, don't allow tab switching
                if (this.reorderMode) return;
                
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
        
        // Reorder tasks button
        const reorderTasksBtn = document.getElementById('reorderTasksBtn');
        if (reorderTasksBtn) {
            reorderTasksBtn.addEventListener('click', () => {
                this.toggleReorderMode();
            });
        }
        
        // Save task order button
        const taskOrderSaveBtn = document.getElementById('taskOrderSaveBtn');
        if (taskOrderSaveBtn) {
            taskOrderSaveBtn.addEventListener('click', () => {
                taskOrderSaveBtn.classList.add('clicked');
                this.saveTaskOrder();
                setTimeout(() => {
                    taskOrderSaveBtn.classList.remove('clicked');
                }, 500);
            });
        }
        
        // Cancel task reordering button
        const taskOrderCancelBtn = document.getElementById('taskOrderCancelBtn');
        if (taskOrderCancelBtn) {
            taskOrderCancelBtn.addEventListener('click', () => {
                this.cancelTaskReordering();
            });
        }
        
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

        // Setup all other event listeners
        this.setupThemeListeners();
        this.setupFirebaseListeners();
        this.setupEditModeListeners();
        this.setupRewardModalListeners();
        this.setupEditItemListeners();
        this.setupModalCloseListeners();
    }
    
    private setupThemeListeners(): void {
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const theme = target.getAttribute('data-theme') as 'robots' | 'dinosaur' | 'unicorn' | 'pirate' | 'princess' | 'space' | 'superhero' | 'ocean';
                if (theme) {
                    this.data.theme = theme;
                    this.applyTheme();
                    this.saveData();
                    showNotification('Theme updated!');
                }
            });
        });
    }
    
    private setupFirebaseListeners(): void {
        const firebaseToggle = document.getElementById('firebaseToggle') as HTMLInputElement;
        const firebaseLoginBtn = document.getElementById('firebaseLoginBtn');
        const firebaseLogoutBtn = document.getElementById('firebaseLogoutBtn');
        
        if (firebaseToggle) {
            firebaseToggle.checked = this.data.firebaseEnabled;
            firebaseToggle.addEventListener('change', () => {
                this.data.firebaseEnabled = firebaseToggle.checked;
                
                if (firebaseToggle.checked) {
                    // Show login button if not signed in
                    if (!firebaseService.isUserSignedIn() && firebaseLoginBtn) {
                        firebaseLoginBtn.classList.remove('hidden');
                    }
                } else {
                    // Clear sync interval if we're disabling Firebase
                    if (this.syncInterval) {
                        clearInterval(this.syncInterval);
                        this.syncInterval = null;
                    }
                    
                    // Hide Firebase buttons
                    if (firebaseLoginBtn) firebaseLoginBtn.classList.add('hidden');
                    if (firebaseLogoutBtn) firebaseLogoutBtn.classList.add('hidden');
                }
                
                this.saveData();
                this.updateFirebaseUI();
            });
        }
        
        if (firebaseLoginBtn) {
            firebaseLoginBtn.addEventListener('click', async () => {
                const user = await firebaseService.signInWithGoogle();
                if (user) {
                    this.data.userId = user.uid;
                    await this.setupFirebaseSync();
                    showNotification('Signed in to Firebase!');
                    this.updateFirebaseUI();
                } else {
                    showNotification('Failed to sign in to Firebase!');
                }
            });
        }
        
        if (firebaseLogoutBtn) {
            firebaseLogoutBtn.addEventListener('click', async () => {
                await firebaseService.signOut();
                this.data.userId = undefined;
                
                // Clear sync interval
                if (this.syncInterval) {
                    clearInterval(this.syncInterval);
                    this.syncInterval = null;
                }
                
                this.saveData();
                showNotification('Signed out from Firebase!');
                this.updateFirebaseUI();
            });
        }
    }
    
    private updateFirebaseUI(): void {
        const firebaseToggle = document.getElementById('firebaseToggle') as HTMLInputElement;
        const firebaseLoginBtn = document.getElementById('firebaseLoginBtn');
        const firebaseLogoutBtn = document.getElementById('firebaseLogoutBtn');
        const firebaseStatus = document.getElementById('firebaseStatus');
        
        if (firebaseToggle) {
            firebaseToggle.checked = this.data.firebaseEnabled;
        }
        
        if (this.data.firebaseEnabled) {
            if (firebaseService.isUserSignedIn()) {
                // User is signed in
                if (firebaseLoginBtn) firebaseLoginBtn.classList.add('hidden');
                if (firebaseLogoutBtn) firebaseLogoutBtn.classList.remove('hidden');
                if (firebaseStatus) {
                    firebaseStatus.textContent = `Connected as ${firebaseService.getUserId()}`;
                    firebaseStatus.classList.remove('hidden');
                }
            } else {
                // User is not signed in
                if (firebaseLoginBtn) firebaseLoginBtn.classList.remove('hidden');
                if (firebaseLogoutBtn) firebaseLogoutBtn.classList.add('hidden');
                if (firebaseStatus) {
                    firebaseStatus.textContent = 'Not connected';
                    firebaseStatus.classList.remove('hidden');
                }
            }
        } else {
            // Firebase is disabled
            if (firebaseLoginBtn) firebaseLoginBtn.classList.add('hidden');
            if (firebaseLogoutBtn) firebaseLogoutBtn.classList.add('hidden');
            if (firebaseStatus) firebaseStatus.classList.add('hidden');
        }
    }
    
    private setupRewardModalListeners(): void {
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
    
    private setupEditItemListeners(): void {
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
        
        // Add more edit item listeners here
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.showAddItemModal('task');
            });
        }
        
        const addRewardBtn = document.getElementById('addRewardBtn');
        if (addRewardBtn) {
            addRewardBtn.addEventListener('click', () => {
                this.showAddItemModal('reward');
            });
        }
        
        // Reset buttons
        const resetCompletedTasksBtn = document.getElementById('resetCompletedTasksBtn');
        if (resetCompletedTasksBtn) {
            resetCompletedTasksBtn.addEventListener('click', () => {
                this.resetCompletedOneoffTasks();
            });
        }
        
        const resetClaimedRewardsBtn = document.getElementById('resetClaimedRewardsBtn');
        if (resetClaimedRewardsBtn) {
            resetClaimedRewardsBtn.addEventListener('click', () => {
                this.resetClaimedRewards();
            });
        }
        
        const clearFinishedRewardsBtn = document.getElementById('clearFinishedRewardsBtn');
        if (clearFinishedRewardsBtn) {
            clearFinishedRewardsBtn.addEventListener('click', () => {
                this.clearClaimedRewards();
            });
        }
        
        // Reset all data
        const resetDataBtn = document.getElementById('resetDataBtn');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
                    this.data = getDefaultData();
                    this.saveData();
                    this.renderTasks();
                    this.renderRewards();
                    this.renderEditItems();
                    showNotification('All data has been reset!');
                }
            });
        }
        
        // Add Item form submit
        const addItemForm = document.getElementById('addItemForm');
        if (addItemForm) {
            addItemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveItemFromForm();
            });
        }
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const filterType = target.getAttribute('data-filter');
                
                // Update active class
                const parentSection = target.closest('.edit-section');
                if (parentSection) {
                    parentSection.querySelectorAll('.filter-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                }
                target.classList.add('active');
                
                this.filterEditItems(filterType);
            });
        });
    }
    
    private setupModalCloseListeners(): void {
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (e.target === modal) {
                    (modal as HTMLElement).style.display = 'none';
                }
            });
        });
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
        createZoomStar();
        
        // Show animation
        const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('task-complete-animation');
            
            // Create floating stars animation
            for (let i = 0; i < task.stars; i++) {
                setTimeout(() => {
                    createFloatingStar(taskElement as HTMLElement);
                }, i * 200);
            }
            
            // Update the task display
            setTimeout(() => {
                this.renderTasks();
                this.renderRewards(); // Refresh rewards in case any became available
                showNotification(`You earned ${task.stars} ⭐!`);
            }, 800);
        }
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
            
            showNotification(`Reward claimed: ${reward.name}! 🎉`);
            this.renderRewards();
        }
    }
    
    private renderEditItems(): void {
        if (this.activeEditTab === 'editTasks') {
            const taskItems = document.getElementById('taskItems');
            if (!taskItems) return;
            
            taskItems.innerHTML = '';
            
            // Sort tasks by their order property for each type
            const dailyTasks = this.data.tasks
                .filter(task => task.type === 'daily')
                .sort((a, b) => (a.order || 0) - (b.order || 0));
                
            const oneoffTasks = this.data.tasks
                .filter(task => task.type === 'oneoff')
                .sort((a, b) => (a.order || 0) - (b.order || 0));
                
            // Combine the sorted arrays
            const sortedTasks = [...dailyTasks, ...oneoffTasks];
            
            sortedTasks.forEach(task => {
                const itemElement = document.createElement('div');
                itemElement.className = `edit-item ${task.completed ? 'completed' : ''}`;
                itemElement.dataset.id = task.id;
                itemElement.dataset.type = task.type;
                itemElement.dataset.status = task.completed ? 'completed' : 'active';
                
                itemElement.innerHTML = `
                    <div>
                        <span class="item-name">${task.name}</span>
                        <span class="item-details">${task.type}, ${task.stars} ⭐, Order: ${task.order || 0}</span>
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
        this.addEditItemEventListeners();
    }
    
    private addEditItemEventListeners(): void {
        // Add event listeners for edit buttons
        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const itemId = target.getAttribute('data-id');
                if (!itemId) return;
                
                this.showEditItemModal(itemId);
            });
        });
        
        // Add event listeners for reset buttons
        const resetButtons = document.querySelectorAll('.reset-btn');
        resetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const itemId = target.getAttribute('data-id');
                if (!itemId) return;
                
                this.resetItem(itemId);
            });
        });
        
        // Add event listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const itemId = target.getAttribute('data-id');
                if (!itemId) return;
                
                this.deleteItem(itemId);
            });
        });
    }
    
    private showAddItemModal(type: 'task' | 'reward'): void {
        const addItemModal = document.getElementById('addItemModal');
        const addItemTitle = document.getElementById('addItemTitle');
        const nameInput = document.getElementById('itemName') as HTMLInputElement;
        const taskTypeGroup = document.getElementById('taskTypeGroup');
        const starsGroup = document.getElementById('starsGroup');
        const starsNeededGroup = document.getElementById('starsNeededGroup');
        
        if (!addItemModal || !addItemTitle || !nameInput) return;
        
        if (type === 'task') {
            addItemTitle.textContent = 'Add Task';
            nameInput.value = '';
            
            taskTypeGroup?.classList.remove('hidden');
            starsGroup?.classList.remove('hidden');
            starsNeededGroup?.classList.add('hidden');
            
            addItemModal.dataset.mode = 'addTask';
        } else {
            addItemTitle.textContent = 'Add Reward';
            nameInput.value = '';
            
            taskTypeGroup?.classList.add('hidden');
            starsGroup?.classList.add('hidden');
            starsNeededGroup?.classList.remove('hidden');
            
            addItemModal.dataset.mode = 'addReward';
        }
        
        addItemModal.style.display = 'flex';
    }
    
    private showEditItemModal(itemId: string): void {
        const addItemModal = document.getElementById('addItemModal');
        const addItemTitle = document.getElementById('addItemTitle');
        const nameInput = document.getElementById('itemName') as HTMLInputElement;
        const taskTypeGroup = document.getElementById('taskTypeGroup');
        const starsGroup = document.getElementById('starsGroup');
        const starsNeededGroup = document.getElementById('starsNeededGroup');
        
        if (!addItemModal || !addItemTitle || !nameInput) return;
        
        if (this.activeEditTab === 'editTasks') {
            const task = this.data.tasks.find(t => t.id === itemId);
            if (!task) return;
            
            const typeSelect = document.getElementById('taskType') as HTMLSelectElement;
            const starsInput = document.getElementById('starValue') as HTMLInputElement;
            
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
            
            const starsNeededInput = document.getElementById('starsNeeded') as HTMLInputElement;
            
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
    }
    
    private saveItemFromForm(): void {
        const addItemModal = document.getElementById('addItemModal');
        const nameInput = document.getElementById('itemName') as HTMLInputElement;
        
        if (!addItemModal || !nameInput) return;
        
        const mode = addItemModal.dataset.mode;
        const itemId = addItemModal.dataset.itemId;
        
        if (mode === 'addTask') {
            const typeSelect = document.getElementById('taskType') as HTMLSelectElement;
            const starsInput = document.getElementById('starValue') as HTMLInputElement;
            
            if (!typeSelect || !starsInput) return;
            
            const newTask: Task = {
                id: generateId(),
                name: nameInput.value,
                type: typeSelect.value as 'daily' | 'oneoff',
                stars: parseInt(starsInput.value) || 1,
                completed: false,
                order: this.data.tasks.filter(t => t.type === typeSelect.value).length
            };
            
            this.data.tasks.push(newTask);
            showNotification('Task added!');
        } else if (mode === 'editTask' && itemId) {
            const typeSelect = document.getElementById('taskType') as HTMLSelectElement;
            const starsInput = document.getElementById('starValue') as HTMLInputElement;
            
            if (!typeSelect || !starsInput) return;
            
            const task = this.data.tasks.find(t => t.id === itemId);
            if (!task) return;
            
            task.name = nameInput.value;
            task.type = typeSelect.value as 'daily' | 'oneoff';
            task.stars = parseInt(starsInput.value) || 1;
            
            showNotification('Task updated!');
        } else if (mode === 'addReward') {
            const starsNeededInput = document.getElementById('starsNeeded') as HTMLInputElement;
            
            if (!starsNeededInput) return;
            
            const newReward: Reward = {
                id: generateId(),
                name: nameInput.value,
                starsNeeded: parseInt(starsNeededInput.value) || 5,
                claimed: false
            };
            
            this.data.rewards.push(newReward);
            showNotification('Reward added!');
        } else if (mode === 'editReward' && itemId) {
            const starsNeededInput = document.getElementById('starsNeeded') as HTMLInputElement;
            
            if (!starsNeededInput) return;
            
            const reward = this.data.rewards.find(r => r.id === itemId);
            if (!reward) return;
            
            reward.name = nameInput.value;
            reward.starsNeeded = parseInt(starsNeededInput.value) || 5;
            
            showNotification('Reward updated!');
        }
        
        this.saveData();
        this.renderTasks();
        this.renderRewards();
        this.renderEditItems();
        
        // Close modal
        addItemModal.style.display = 'none';
    }
    
    private resetItem(itemId: string): void {
        if (this.activeEditTab === 'editTasks') {
            const task = this.data.tasks.find(t => t.id === itemId);
            if (task && task.completed) {
                task.completed = false;
                showNotification('Task reset successfully!');
            }
        } else {
            const reward = this.data.rewards.find(r => r.id === itemId);
            if (reward && reward.claimed) {
                reward.claimed = false;
                showNotification('Reward reset successfully!');
            }
        }
        
        this.saveData();
        this.renderTasks();
        this.renderRewards();
        this.renderEditItems();
    }
    
    private deleteItem(itemId: string): void {
        if (confirm('Are you sure you want to delete this item?')) {
            if (this.activeEditTab === 'editTasks') {
                this.data.tasks = this.data.tasks.filter(t => t.id !== itemId);
                showNotification('Task deleted!');
            } else {
                this.data.rewards = this.data.rewards.filter(r => r.id !== itemId);
                showNotification('Reward deleted!');
            }
            
            this.saveData();
            this.renderTasks();
            this.renderRewards();
            this.renderEditItems();
        }
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
    
    private resetCompletedOneoffTasks(): void {
        if (confirm('Are you sure you want to reset all completed one-off tasks?')) {
            let resetCount = 0;
            
            this.data.tasks.forEach(task => {
                if (task.type === 'oneoff' && task.completed) {
                    task.completed = false;
                    resetCount++;
                }
            });
            
            if (resetCount === 0) {
                showNotification('No completed one-off tasks to reset!');
                return;
            }
            
            this.saveData();
            this.renderTasks();
            this.renderEditItems();
            showNotification(`Reset ${resetCount} completed one-off tasks!`);
        }
    }
    
    private resetClaimedRewards(): void {
        if (confirm('Are you sure you want to reset all claimed rewards?')) {
            let resetCount = 0;
            
            this.data.rewards.forEach(reward => {
                if (reward.claimed) {
                    reward.claimed = false;
                    resetCount++;
                }
            });
            
            if (resetCount === 0) {
                showNotification('No claimed rewards to reset!');
                return;
            }
            
            this.saveData();
            this.renderRewards();
            this.renderEditItems();
            showNotification(`Reset ${resetCount} claimed rewards!`);
        }
    }
    
    private clearClaimedRewards(): void {
        if (confirm('Are you sure you want to remove all claimed rewards?')) {
            const initialCount = this.data.rewards.length;
            
            this.data.rewards = this.data.rewards.filter(reward => !reward.claimed);
            
            const removedCount = initialCount - this.data.rewards.length;
            
            if (removedCount === 0) {
                showNotification('No claimed rewards to remove!');
                return;
            }
            
            this.saveData();
            this.renderRewards();
            this.renderEditItems();
            showNotification(`Removed ${removedCount} claimed rewards!`);
        }
    }

    private updateSettingsUI(): void {
        // Firebase integration
        const firebaseToggle = document.getElementById('firebaseToggle') as HTMLInputElement;
        
        if (firebaseToggle) {
            firebaseToggle.checked = this.data.firebaseEnabled;
        }
        
        this.updateFirebaseUI();
        
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
        let resetCount = 0;
        
        this.data.tasks
            .filter(task => task.type === 'daily' && task.completed)
            .forEach(task => {
                if (shouldResetDailyTasks(task)) {
                    task.completed = false;
                    resetCount++;
                }
            });
        
        if (resetCount > 0) {
            this.saveData();
            this.renderTasks();
            showNotification(`Reset ${resetCount} daily tasks for a new day!`);
        }
    }
    
    private resetDailyTasks(): void {
        if (confirm('Are you sure you want to reset all daily tasks?')) {
            const resetCount = this.data.tasks
                .filter(task => task.type === 'daily' && task.completed)
                .length;
                
            if (resetCount === 0) {
                showNotification('No completed daily tasks to reset!');
                return;
            }
            
            this.data.tasks
                .filter(task => task.type === 'daily' && task.completed)
                .forEach(task => {
                    task.completed = false;
                });
            
            this.saveData();
            this.renderTasks();
            showNotification(`Daily tasks have been reset!`);
        }
    }

    private async setupFirebaseSync(): Promise<void> {
        // Clear any existing interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // Initial data load from Firebase if available
        if (firebaseService.isUserSignedIn()) {
            const firebaseData = await firebaseService.loadData();
            
            if (firebaseData) {
                // Merge data - take the more recent version
                if (firebaseData.lastSync && (!this.data.lastSync || new Date(firebaseData.lastSync) > new Date(this.data.lastSync))) {
                    this.data = firebaseData;
                    this.renderTasks();
                    this.renderRewards();
                    this.updateStarsDisplay();
                    showNotification('Data loaded from Firebase!');
                } else {
                    // Local data is newer, sync to Firebase
                    await this.syncToFirebase();
                }
            } else {
                // No data in Firebase yet, do initial sync
                await this.syncToFirebase();
            }
        }
        
        // Set up sync interval (every 5 minutes)
        this.syncInterval = window.setInterval(async () => {
            await this.syncToFirebase();
        }, 5 * 60 * 1000);
    }

    private async syncToFirebase(): Promise<void> {
        if (!this.data.firebaseEnabled || !firebaseService.isUserSignedIn()) return;
        
        // Update last sync time
        this.data.lastSync = new Date().toISOString();
        this.data.userId = firebaseService.getUserId() || undefined;
        
        // Save to local storage first
        localStorage.setItem('starRewardsData', JSON.stringify(this.data));
        
        // Now save to Firebase
        const success = await firebaseService.saveData(this.data);
        if (!success) {
            showNotification('Failed to sync with Firebase!');
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StarRewardsApp();
});