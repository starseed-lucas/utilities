document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const STATS_API_BASE_URL = 'https://statsapi.mlb.com/api/v1';
    const teamSelect = document.getElementById('team-select');
    const gameSelect = document.getElementById('game-select');
    const loadingEl = document.getElementById('loading');
    const noDataEl = document.getElementById('no-data');
    
    // Cache for team data
    let teamsCache = {};
    let selectedTeamGames = [];
    
    // Initialize the app
    init();
    
    // Initialize the application
    async function init() {
        try {
            showLoading(); // Show loading initially
            
            // Load teams
            await loadTeams();
            
            // Set up event listeners
            teamSelect.addEventListener('change', handleTeamChange);
            gameSelect.addEventListener('change', handleGameChange);
            
            hideLoading(); // Hide loading after teams are loaded
        } catch (error) {
            console.error('Error initializing app:', error);
            hideLoading();
            showErrorMessage('FAILED TO INITIALIZE THE APPLICATION. PLEASE TRY AGAIN LATER.');
        }
    }
    
    // Load MLB teams
    async function loadTeams() {
        try {
            const response = await axios.get(`${STATS_API_BASE_URL}/teams?sportId=1`);
            const teams = response.data.teams;
            
            // Clear loading option
            teamSelect.innerHTML = '';
            
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'SELECT A TEAM';
            teamSelect.appendChild(defaultOption);
            
            // Sort teams alphabetically
            teams.sort((a, b) => a.name.localeCompare(b.name));
            
            // Add team options
            teams.forEach(team => {
                // Store team data in cache
                teamsCache[team.id] = team;
                
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.name.toUpperCase();
                teamSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading teams:', error);
            throw error; // Propagate error to init function
        }
    }
    
    // Handle team selection change
    async function handleTeamChange() {
        // Reset game select
        gameSelect.innerHTML = '';
        gameSelect.disabled = true;
        
        // Reset scoreboard elements
        resetScoreboard();
        showLoading();
        
        const teamId = teamSelect.value;
        
        if (!teamId) {
            // No team selected
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'SELECT A TEAM FIRST';
            gameSelect.appendChild(defaultOption);
            hideLoading();
            return;
        }
        
        try {
            // Get current season and current date
            const today = new Date();
            
            // Set start date to 30 days ago to get recent games
            const startDate = new Date();
            startDate.setDate(today.getDate() - 30);
            
            // Format dates as YYYY-MM-DD
            const startDateStr = formatDateForAPI(startDate);
            const endDateStr = formatDateForAPI(today);
            
            // Load team schedule (recent games)
            const response = await axios.get(
                `${STATS_API_BASE_URL}/schedule?teamId=${teamId}&startDate=${startDateStr}&endDate=${endDateStr}&sportId=1&gameType=R,F,D,L,W&hydrate=team,game(content(summary)),linescore`
            );
            
            // Get games
            let games = [];
            if (response.data.dates) {
                response.data.dates.forEach(date => {
                    if (date.games) {
                        games = games.concat(date.games);
                    }
                });
            }
            
            // Sort games by date (most recent first)
            games.sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));
            
            // Take only the 10 most recent games
            selectedTeamGames = games.slice(0, 10);
            
            // Populate game select
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'SELECT A GAME';
            gameSelect.appendChild(defaultOption);
            
            selectedTeamGames.forEach((game, index) => {
                const gameDate = new Date(game.gameDate);
                const opponent = game.teams.away.team.id == teamId 
                    ? game.teams.home.team.name 
                    : game.teams.away.team.name;
                
                const isHome = game.teams.home.team.id == teamId;
                const vsAt = isHome ? 'VS' : '@';
                
                const option = document.createElement('option');
                option.value = index; // Use index as value
                option.textContent = `${formatDate(gameDate)} ${vsAt} ${opponent.toUpperCase()}`;
                gameSelect.appendChild(option);
            });
            
            // Enable game select
            gameSelect.disabled = false;
            
            // If there are games, select the first one
            if (selectedTeamGames.length > 0) {
                gameSelect.value = 0;
                handleGameChange();
            } else {
                hideLoading();
                showNoData();
            }
            
        } catch (error) {
            console.error('Error loading team games:', error);
            hideLoading();
            showErrorMessage('FAILED TO LOAD TEAM GAMES. PLEASE TRY AGAIN LATER.');
        }
    }
    
    // Handle game selection change
    function handleGameChange() {
        resetScoreboard();
        showLoading();
        
        const gameIndex = gameSelect.value;
        
        if (!gameIndex) {
            hideLoading();
            return;
        }
        
        const game = selectedTeamGames[gameIndex];
        
        if (!game) {
            hideLoading();
            showNoData();
            return;
        }
        
        renderScoreboard(game);
    }
    
    // Render scoreboard with game data
    function renderScoreboard(game) {
        try {
            // Update inning scores with animation
            if (game.linescore && game.linescore.innings) {
                game.linescore.innings.forEach(inning => {
                    const inningNum = inning.num;
                    if (inningNum <= 9) {
                        if (inning.home) {
                            updateInningScore('home', inningNum, inning.home.runs || 0);
                        }
                        if (inning.away) {
                            updateInningScore('away', inningNum, inning.away.runs || 0);
                        }
                    }
                });
            }
            
            // Update totals
            if (game.linescore) {
                updateTotalScore('home', 'runs', game.linescore.teams.home.runs || 0);
                updateTotalScore('away', 'runs', game.linescore.teams.away.runs || 0);
                
                updateTotalScore('home', 'hits', game.linescore.teams.home.hits || 0);
                updateTotalScore('away', 'hits', game.linescore.teams.away.hits || 0);
                
                updateTotalScore('home', 'errors', game.linescore.teams.home.errors || 0);
                updateTotalScore('away', 'errors', game.linescore.teams.away.errors || 0);
                
                // Update base runners
                updateBaseRunners(game.linescore);
                
                // Update count
                updateCount(game.linescore);
            }
            
            hideLoading();
            
        } catch (error) {
            console.error('Error rendering scoreboard:', error);
            hideLoading();
            showErrorMessage('FAILED TO RENDER SCOREBOARD. PLEASE TRY ANOTHER GAME.');
        }
    }
    
    // Update inning score with animation
    function updateInningScore(team, inning, score) {
        const element = document.getElementById(`${team}-${inning}`);
        if (element) {
            element.textContent = score;
            element.classList.add('highlight');
            setTimeout(() => {
                element.classList.remove('highlight');
            }, 1500);
        }
    }
    
    // Update total score with animation
    function updateTotalScore(team, type, score) {
        const element = document.getElementById(`${team}-${type}`);
        if (element) {
            element.textContent = score;
            element.classList.add('highlight');
            setTimeout(() => {
                element.classList.remove('highlight');
            }, 1500);
        }
    }
    
    // Update base runners
    function updateBaseRunners(linescore) {
        // First base
        const firstBase = document.getElementById('first-base');
        const secondBase = document.getElementById('second-base');
        const thirdBase = document.getElementById('third-base');
        
        if (linescore.offense) {
            firstBase.classList.toggle('occupied', !!linescore.offense.first);
            secondBase.classList.toggle('occupied', !!linescore.offense.second);
            thirdBase.classList.toggle('occupied', !!linescore.offense.third);
        } else {
            // Clear bases if no offense data
            firstBase.classList.remove('occupied');
            secondBase.classList.remove('occupied');
            thirdBase.classList.remove('occupied');
        }
    }
    
    // Update count (balls, strikes, outs)
    function updateCount(linescore) {
        // Balls
        const balls = linescore.balls || 0;
        for (let i = 1; i <= 3; i++) {
            const ballElement = document.getElementById(`ball-${i}`);
            ballElement.classList.toggle('active', i <= balls);
        }
        
        // Strikes
        const strikes = linescore.strikes || 0;
        for (let i = 1; i <= 2; i++) {
            const strikeElement = document.getElementById(`strike-${i}`);
            strikeElement.classList.toggle('active', i <= strikes);
        }
        
        // Outs
        const outs = linescore.outs || 0;
        for (let i = 1; i <= 3; i++) {
            const outElement = document.getElementById(`out-${i}`);
            outElement.classList.toggle('active', i <= outs);
        }
    }
    
    // Reset scoreboard to default state
    function resetScoreboard() {
        // Reset inning scores
        for (let i = 1; i <= 9; i++) {
            document.getElementById(`home-${i}`).textContent = '0';
            document.getElementById(`away-${i}`).textContent = '0';
        }
        
        // Reset totals
        document.getElementById('home-runs').textContent = '0';
        document.getElementById('away-runs').textContent = '0';
        document.getElementById('home-hits').textContent = '0';
        document.getElementById('away-hits').textContent = '0';
        document.getElementById('home-errors').textContent = '0';
        document.getElementById('away-errors').textContent = '0';
        
        // Reset bases
        document.getElementById('first-base').classList.remove('occupied');
        document.getElementById('second-base').classList.remove('occupied');
        document.getElementById('third-base').classList.remove('occupied');
        
        // Reset count
        for (let i = 1; i <= 3; i++) {
            const ballElement = document.getElementById(`ball-${i}`);
            if (ballElement) ballElement.classList.remove('active');
            
            const outElement = document.getElementById(`out-${i}`);
            if (outElement) outElement.classList.remove('active');
            
            if (i <= 2) {
                const strikeElement = document.getElementById(`strike-${i}`);
                if (strikeElement) strikeElement.classList.remove('active');
            }
        }
    }
    
    // Helper function to format date as MM/DD/YYYY for display
    function formatDate(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }
    
    // Helper function to format date as YYYY-MM-DD for API
    function formatDateForAPI(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Show loading state
    function showLoading() {
        loadingEl.classList.remove('hidden');
    }
    
    // Hide loading state
    function hideLoading() {
        loadingEl.classList.add('hidden');
    }
    
    // Show no data message
    function showNoData() {
        noDataEl.classList.remove('hidden');
    }
    
    // Hide no data message
    function hideNoData() {
        noDataEl.classList.add('hidden');
    }
    
    // Show error message
    function showErrorMessage(message) {
        noDataEl.innerHTML = `<p>${message}</p><div class="vintage-bat"></div>`;
        noDataEl.classList.remove('hidden');
    }
});