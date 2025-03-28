// utils.ts - Contains utility functions and animations

import { Task } from './models';

// Create a floating star animation
export const createFloatingStar = (parentElement: HTMLElement): void => {
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
};

// Create zoom star animation effect
export const createZoomStar = (): void => {
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
};

// Check if tasks need to be reset based on date
export const shouldResetDailyTasks = (task: Task): boolean => {
    if (task.type !== 'daily' || !task.completed) return false;
    
    const today = new Date().toDateString();
    const lastCompletedDate = task.lastCompleted ? 
        new Date(task.lastCompleted).toDateString() : '';
    
    return lastCompletedDate !== today;
};

// Show notification toast
export const showNotification = (message: string): void => {
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
};

// Generate a simple math challenge for parent gate
export const generateMathChallenge = (): { question: string, answer: number } => {
    // Generate simple math for a young child
    const num1 = Math.floor(Math.random() * 5) + 1;
    const num2 = Math.floor(Math.random() * 5) + 1;
    const answer = num1 + num2;
    
    return {
        question: `What is ${num1} + ${num2}?`,
        answer
    };
};

// Initialize task order if needed
export const initializeTaskOrder = (tasks: Task[]): void => {
    // Group tasks by type
    const dailyTasks = tasks.filter(task => task.type === 'daily');
    const oneoffTasks = tasks.filter(task => task.type === 'oneoff');
    
    // Set order for daily tasks
    dailyTasks.forEach((task, index) => {
        if (typeof task.order !== 'number') {
            task.order = index;
        }
    });
    
    // Set order for one-off tasks
    oneoffTasks.forEach((task, index) => {
        if (typeof task.order !== 'number') {
            task.order = index;
        }
    });
};