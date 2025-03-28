// models.ts - Contains all interfaces and type definitions

export interface Task {
    id: string;
    name: string;
    type: 'daily' | 'oneoff';
    stars: number;
    completed: boolean;
    lastCompleted?: string; // ISO date string
    order?: number; // For ordering tasks
}

export interface Reward {
    id: string;
    name: string;
    starsNeeded: number;
    claimed: boolean;
}

export interface AppData {
    tasks: Task[];
    rewards: Reward[];
    earnedStars: number;
    theme: 'robots' | 'dinosaur' | 'unicorn' | 'pirate' | 'princess' | 'space' | 'superhero' | 'ocean';
    googleIntegration: boolean;
    googleApiKey?: string;
    lastSync?: string; // ISO date string
}

// Default data to initialize the app
export const getDefaultData = (): AppData => {
    return {
        tasks: [
            { id: generateId(), name: '🦷 Brush teeth (morning)', type: 'daily', stars: 1, completed: false, order: 0 },
            { id: generateId(), name: '🛌 Make bed', type: 'daily', stars: 1, completed: false, order: 1 },
            { id: generateId(), name: '📚 Go to school', type: 'daily', stars: 2, completed: false, order: 2 },
            { id: generateId(), name: '🦷 Brush teeth (night)', type: 'daily', stars: 1, completed: false, order: 3 },
            { id: generateId(), name: '👕 Change clothes', type: 'daily', stars: 1, completed: false, order: 4 },
            { id: generateId(), name: '🧹 Clean room', type: 'oneoff', stars: 3, completed: false, order: 0 }
        ],
        rewards: [
            { id: generateId(), name: '🎮 Extra screen time', starsNeeded: 5, claimed: false },
            { id: generateId(), name: '🍦 Special treat', starsNeeded: 10, claimed: false },
            { id: generateId(), name: '🏞️ Trip to park', starsNeeded: 15, claimed: false }
        ],
        earnedStars: 0,
        theme: 'robots',
        googleIntegration: false
    };
};

// Helper function to generate unique IDs
export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 11);
};