document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const STATS_API_BASE_URL = 'https://statsapi.mlb.com/api/v1';
    const teamSelect = document.getElementById('team-select');
    const gameSelect = document.getElementById('game-select');
    const teamLoadingIndicator = document.getElementById('team-loading');
    const gameLoadingIndicator = document.getElementById('game-loading');
    const noDataEl = document.getElementById('no-data');
    
    // Cache for team data
    let teamsCache = {};
    let selectedTeamGames = [];
    
    // Initialize the app
    init();
    
    // Initialize the application
    async function init() {
        try {
            // Show team loading indicator
            setTeamLoading(true);
            
            // Load teams
            await loadTeams();
            
            // Set up event listeners
            teamSelect.addEventListener('change', handleTeamChange);
            gameSelect.addEventListener('change', handleGameChange);
            
            // Hide team loading indicator
            setTeamLoading(false);
        } catch (error) {
            console.error('Error initializing app:', error);
            setTeamLoading(false);
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
        
        const teamId = teamSelect.value;
        
        if (!teamId) {
            // No team selected
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'SELECT A TEAM FIRST';
            gameSelect.appendChild(defaultOption);
            
            // Update game info
            updateGameInfo(null);
            
            return;
        }
        
        try {
            // Show game loading indicator
            setGameLoading(true);
            
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
                `${STATS_API_BASE_URL}/schedule?teamId=${teamId}&startDate=${startDateStr}&endDate=${endDateStr}&sportId=1&gameType=R,F,D,L,W&hydrate=team,game(content(summary)),linescore,venue`
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
            
            // Hide game loading indicator
            setGameLoading(false);
            
            // If there are games, select the first one
            if (selectedTeamGames.length > 0) {
                gameSelect.value = 0;
                handleGameChange();
            } else {
                showNoData();
            }
            
        } catch (error) {
            console.error('Error loading team games:', error);
            setGameLoading(false);
            showErrorMessage('FAILED TO LOAD TEAM GAMES. PLEASE TRY AGAIN LATER.');
        }
    }
    
    // Handle game selection change
    function handleGameChange() {
        resetScoreboard();
        
        const gameIndex = gameSelect.value;
        
        if (!gameIndex) {
            updateGameInfo(null);
            return;
        }
        
        const game = selectedTeamGames[gameIndex];
        
        if (!game) {
            showNoData();
            return;
        }
        
        renderScoreboard(game);
    }
    
    // Render scoreboard with game data
    function renderScoreboard(game) {
        try {
            // Set team names
            updateTeamNames(game);
            
            // Update game info (status, date, location)
            updateGameInfo(game);
            
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
            
        } catch (error) {
            console.error('Error rendering scoreboard:', error);
            showErrorMessage('FAILED TO RENDER SCOREBOARD. PLEASE TRY ANOTHER GAME.');
        }
    }
    
    // Update team names
    function updateTeamNames(game) {
        if (game) {
            const homeTeamEl = document.getElementById('home-team');
            const awayTeamEl = document.getElementById('away-team');
            
            homeTeamEl.textContent = game.teams.home.team.teamName.toUpperCase();
            awayTeamEl.textContent = game.teams.away.team.teamName.toUpperCase();
        }
    }
    
    // Update game information (status, date, location)
    function updateGameInfo(game) {
        const statusLight = document.getElementById('game-status-light');
        const statusText = document.getElementById('game-status-text');
        const dateTimeEl = document.getElementById('game-date-time');
        const locationEl = document.getElementById('game-location');
        
        if (!game) {
            statusLight.className = 'game-status-light';
            statusText.textContent = 'SELECT A GAME';
            dateTimeEl.textContent = '';
            locationEl.textContent = '';
            return;
        }
        
        // Set game date and time
        const gameDate = new Date(game.gameDate);
        dateTimeEl.textContent = formatDateTimeWithDay(gameDate);
        
        // Set game location
        if (game.venue) {
            locationEl.textContent = `${game.venue.name}, ${game.venue.location?.city || ''}`;
        } else {
            locationEl.textContent = '';
        }
        
        // Set game status
        let statusClass = '';
        let statusDisplay = '';
        
        if (game.status) {
            // Game status: scheduled, live, final
            if (game.status.abstractGameState === 'Final') {
                statusClass = 'final';
                statusDisplay = 'FINAL';
            } else if (game.status.abstractGameState === 'Live') {
                statusClass = 'live';
                
                if (game.linescore && game.linescore.currentInningOrdinal) {
                    statusDisplay = `LIVE - ${game.linescore.inningState} ${game.linescore.currentInningOrdinal}`;
                } else {
                    statusDisplay = 'LIVE';
                }
            } else {
                statusClass = 'upcoming';
                statusDisplay = 'UPCOMING';
            }
        }
        
        statusLight.className = `game-status-light ${statusClass}`;
        statusText.textContent = statusDisplay;
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
        // Get base elements
        const firstBase = document.getElementById('first-base');
        const secondBase = document.getElementById('second-base');
        const thirdBase = document.getElementById('third-base');
        
        if (linescore.offense) {
            // First base
            firstBase.classList.toggle('occupied', !!linescore.offense.first);
            
            // Second base
            secondBase.classList.toggle('occupied', !!linescore.offense.second);
            
            // Third base
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
            if (ballElement) {
                ballElement.classList.toggle('active', i <= balls);
            }
        }
        
        // Strikes
        const strikes = linescore.strikes || 0;
        for (let i = 1; i <= 2; i++) {
            const strikeElement = document.getElementById(`strike-${i}`);
            if (strikeElement) {
                strikeElement.classList.toggle('active', i <= strikes);
            }
        }
        
        // Outs
        const outs = linescore.outs || 0;
        for (let i = 1; i <= 3; i++) {
            const outElement = document.getElementById(`out-${i}`);
            if (outElement) {
                outElement.classList.toggle('active', i <= outs);
            }
        }
    }
    
    // Reset scoreboard to default state
    function resetScoreboard() {
        // Reset team names
        document.getElementById('home-team').textContent = 'HOME';
        document.getElementById('away-team').textContent = 'VISITOR';
        
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
        
        // Hide any error messages
        hideNoData();
    }
    
    // Helper function to format date as MM/DD/YYYY for display
    function formatDate(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }
    
    // Helper function to format date and time with day of week for display
    function formatDateTimeWithDay(date) {
        const options = { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options).toUpperCase();
    }
    
    // Helper function to format date as YYYY-MM-DD for API
    function formatDateForAPI(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Set team loading state
    function setTeamLoading(isLoading) {
        if (isLoading) {
            teamLoadingIndicator.classList.add('active');
        } else {
            teamLoadingIndicator.classList.remove('active');
        }
    }
    
    // Set game loading state
    function setGameLoading(isLoading) {
        if (isLoading) {
            gameLoadingIndicator.classList.add('active');
        } else {
            gameLoadingIndicator.classList.remove('active');
        }
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