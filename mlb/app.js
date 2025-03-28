document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const STATS_API_BASE_URL = 'https://statsapi.mlb.com/api/v1';
    const teamSelect = document.getElementById('team-select');
    const gameSelect = document.getElementById('game-select');
    const loadingEl = document.getElementById('loading');
    const scoreboardEl = document.getElementById('scoreboard');
    const noDataEl = document.getElementById('no-data');
    
    // Cache for team data
    let teamsCache = {};
    let selectedTeamGames = [];
    
    // Initialize the app
    init();
    
    // Initialize the application
    async function init() {
        try {
            // Load teams
            await loadTeams();
            
            // Set up event listeners
            teamSelect.addEventListener('change', handleTeamChange);
            gameSelect.addEventListener('change', handleGameChange);
        } catch (error) {
            console.error('Error initializing app:', error);
            showErrorMessage('Failed to initialize the application. Please try again later.');
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
            defaultOption.textContent = 'Select a team';
            teamSelect.appendChild(defaultOption);
            
            // Sort teams alphabetically
            teams.sort((a, b) => a.name.localeCompare(b.name));
            
            // Add team options
            teams.forEach(team => {
                // Store team data in cache
                teamsCache[team.id] = team;
                
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.name;
                teamSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading teams:', error);
            showErrorMessage('Failed to load MLB teams. Please try again later.');
        }
    }
    
    // Handle team selection change
    async function handleTeamChange() {
        // Reset game select
        gameSelect.innerHTML = '';
        gameSelect.disabled = true;
        
        // Show loading
        resetScoreboard();
        showLoading();
        
        const teamId = teamSelect.value;
        
        if (!teamId) {
            // No team selected
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a team first';
            gameSelect.appendChild(defaultOption);
            hideLoading();
            return;
        }
        
        try {
            // Get current season and current date
            const today = new Date();
            const currentYear = today.getFullYear();
            
            // Set start date to 30 days ago to get recent games
            const startDate = new Date();
            startDate.setDate(today.getDate() - 30);
            
            // Format dates as YYYY-MM-DD
            const startDateStr = formatDate(startDate);
            const endDateStr = formatDate(today);
            
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
            defaultOption.textContent = 'Select a game';
            gameSelect.appendChild(defaultOption);
            
            selectedTeamGames.forEach((game, index) => {
                const gameDate = new Date(game.gameDate);
                const opponent = game.teams.away.team.id == teamId 
                    ? game.teams.home.team.name 
                    : game.teams.away.team.name;
                
                const isHome = game.teams.home.team.id == teamId;
                const vsAt = isHome ? 'vs' : '@';
                
                const option = document.createElement('option');
                option.value = index; // Use index as value
                option.textContent = `${formatDate(gameDate)} ${vsAt} ${opponent}`;
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
            showErrorMessage('Failed to load team games. Please try again later.');
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
            // Get team data
            const homeTeam = game.teams.home.team;
            const awayTeam = game.teams.away.team;
            
            // Set team names and records
            document.getElementById('home-team-name').textContent = homeTeam.name;
            document.getElementById('away-team-name').textContent = awayTeam.name;
            
            document.getElementById('home-team-record').textContent = `(${game.teams.home.leagueRecord.wins}-${game.teams.home.leagueRecord.losses})`;
            document.getElementById('away-team-record').textContent = `(${game.teams.away.leagueRecord.wins}-${game.teams.away.leagueRecord.losses})`;
            
            // Set team abbreviations
            document.getElementById('home-team-abbrev').textContent = homeTeam.abbreviation || homeTeam.teamName;
            document.getElementById('away-team-abbrev').textContent = awayTeam.abbreviation || awayTeam.teamName;
            
            // Set game status and date
            const gameDate = new Date(game.gameDate);
            document.getElementById('game-date').textContent = formatDateTime(gameDate);
            
            let gameStatus = 'Scheduled';
            if (game.status) {
                if (game.status.abstractGameState === 'Final') {
                    gameStatus = 'Final';
                } else if (game.status.abstractGameState === 'Live') {
                    gameStatus = `In Progress - ${game.linescore?.currentInningOrdinal || ''} ${game.linescore?.inningState || ''}`;
                }
            }
            document.getElementById('game-status').textContent = gameStatus;
            
            // Set runs, hits, errors
            if (game.linescore) {
                document.getElementById('home-runs').textContent = game.linescore.teams.home.runs || '0';
                document.getElementById('away-runs').textContent = game.linescore.teams.away.runs || '0';
                
                document.getElementById('home-hits').textContent = game.linescore.teams.home.hits || '0';
                document.getElementById('away-hits').textContent = game.linescore.teams.away.hits || '0';
                
                document.getElementById('home-errors').textContent = game.linescore.teams.home.errors || '0';
                document.getElementById('away-errors').textContent = game.linescore.teams.away.errors || '0';
                
                // Set inning scores
                if (game.linescore.innings) {
                    game.linescore.innings.forEach(inning => {
                        const inningNum = inning.num;
                        if (inningNum <= 9) {
                            if (inning.home) {
                                document.getElementById(`home-${inningNum}`).textContent = inning.home.runs || '0';
                            }
                            if (inning.away) {
                                document.getElementById(`away-${inningNum}`).textContent = inning.away.runs || '0';
                            }
                        }
                    });
                }
                
                // Set base status (for live games)
                if (game.linescore.offense) {
                    // Set bases
                    if (game.linescore.offense.first) {
                        document.getElementById('first-base').classList.add('occupied');
                    }
                    if (game.linescore.offense.second) {
                        document.getElementById('second-base').classList.add('occupied');
                    }
                    if (game.linescore.offense.third) {
                        document.getElementById('third-base').classList.add('occupied');
                    }
                    
                    // Set count
                    document.getElementById('balls').textContent = game.linescore.balls || '0';
                    document.getElementById('strikes').textContent = game.linescore.strikes || '0';
                    document.getElementById('outs').textContent = game.linescore.outs || '0';
                }
                
                // Set current play
                let currentPlay = 'No current play information available';
                if (game.linescore.currentInningOrdinal && game.linescore.inningState) {
                    currentPlay = `${game.linescore.inningState} ${game.linescore.currentInningOrdinal}`;
                    
                    if (game.linescore.offense && game.linescore.defense) {
                        const offenseTeam = game.linescore.offense.team.name;
                        const defenseTeam = game.linescore.defense.team.name;
                        currentPlay += ` - ${offenseTeam} batting, ${defenseTeam} fielding`;
                    }
                }
                document.getElementById('current-play').textContent = currentPlay;
            }
            
            // Show scoreboard
            hideLoading();
            showScoreboard();
            
        } catch (error) {
            console.error('Error rendering scoreboard:', error);
            hideLoading();
            showErrorMessage('Failed to render scoreboard. Please try another game.');
        }
    }
    
    // Helper function to format date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Helper function to format date and time
    function formatDateTime(date) {
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Show loading state
    function showLoading() {
        loadingEl.classList.remove('hidden');
        scoreboardEl.classList.add('hidden');
        noDataEl.classList.add('hidden');
    }
    
    // Hide loading state
    function hideLoading() {
        loadingEl.classList.add('hidden');
    }
    
    // Show scoreboard
    function showScoreboard() {
        scoreboardEl.classList.remove('hidden');
        noDataEl.classList.add('hidden');
    }
    
    // Show no data message
    function showNoData() {
        noDataEl.classList.remove('hidden');
        scoreboardEl.classList.add('hidden');
    }
    
    // Reset scoreboard to default state
    function resetScoreboard() {
        // Reset inning scores
        for (let i = 1; i <= 9; i++) {
            document.getElementById(`home-${i}`).textContent = '-';
            document.getElementById(`away-${i}`).textContent = '-';
        }
        
        // Reset totals
        document.getElementById('home-runs').textContent = '-';
        document.getElementById('away-runs').textContent = '-';
        document.getElementById('home-hits').textContent = '-';
        document.getElementById('away-hits').textContent = '-';
        document.getElementById('home-errors').textContent = '-';
        document.getElementById('away-errors').textContent = '-';
        
        // Reset bases
        document.getElementById('first-base').classList.remove('occupied');
        document.getElementById('second-base').classList.remove('occupied');
        document.getElementById('third-base').classList.remove('occupied');
        
        // Reset count
        document.getElementById('balls').textContent = '0';
        document.getElementById('strikes').textContent = '0';
        document.getElementById('outs').textContent = '0';
    }
    
    // Show error message
    function showErrorMessage(message) {
        noDataEl.textContent = message;
        noDataEl.classList.remove('hidden');
        scoreboardEl.classList.add('hidden');
    }
});
