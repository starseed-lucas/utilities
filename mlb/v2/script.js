// Constants
const MLB_API_BASE_URL = 'https://statsapi.mlb.com/api/v1';
const TEAMS_ENDPOINT = '/teams';
const SCHEDULE_ENDPOINT = '/schedule';
const GAME_ENDPOINT = '/game';

// DOM Elements
const teamSelect = document.getElementById('teamSelect');
const gameSelect = document.getElementById('gameSelect');
const loadingElement = document.getElementById('loading');
const scoreboardElement = document.getElementById('scoreboard');
const gameDetailsElement = document.getElementById('gameDetails');

// Global state
let teams = [];
let selectedTeamId = null;
let games = [];
let currentGameData = null;

// Initialize the application
async function init() {
    try {
        // Fetch MLB teams
        await fetchTeams();
        
        // Set up event listeners
        teamSelect.addEventListener('change', handleTeamChange);
        gameSelect.addEventListener('change', handleGameChange);
        
        // If teams loaded, select the first one
        if (teams.length > 0) {
            teamSelect.value = teams[0].id;
            selectedTeamId = teams[0].id;
            await fetchTeamGames(selectedTeamId);
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize the application. Please try again later.');
    }
}

// Fetch all MLB teams
async function fetchTeams() {
    try {
        const response = await axios.get(`${MLB_API_BASE_URL}${TEAMS_ENDPOINT}`, {
            params: {
                sportId: 1  // MLB sport ID
            }
        });
        
        teams = response.data.teams || [];
        populateTeamSelect();
    } catch (error) {
        console.error('Error fetching teams:', error);
        showError('Failed to load MLB teams. Please try again later.');
    }
}

// Populate team select dropdown
function populateTeamSelect() {
    teamSelect.innerHTML = '';
    
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        teamSelect.appendChild(option);
    });
}

// Handle team selection change
async function handleTeamChange(event) {
    selectedTeamId = event.target.value;
    await fetchTeamGames(selectedTeamId);
}

// Fetch recent games for a team
async function fetchTeamGames(teamId) {
    try {
        loadingElement.classList.remove('hidden');
        scoreboardElement.classList.add('hidden');
        gameDetailsElement.classList.add('hidden');
        
        // Get games from the last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);
        
        const response = await axios.get(`${MLB_API_BASE_URL}${SCHEDULE_ENDPOINT}`, {
            params: {
                sportId: 1,
                teamId: teamId,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                gameType: 'R,F,D,L,W,C,P', // Regular season, Finals, Division, League, Wild Card, Championship, Playoffs
                fields: 'dates,date,games,gamePk,status,abstractGameState,teams,away,home,team,name,score'
            }
        });
        
        processGames(response.data);
    } catch (error) {
        console.error('Error fetching team games:', error);
        showError('Failed to load team games. Please try again later.');
    }
}

// Process and filter games data
function processGames(data) {
    games = [];
    
    if (data.dates && data.dates.length > 0) {
        // Flatten games from all dates and sort by date (newest first)
        data.dates.forEach(date => {
            if (date.games && date.games.length > 0) {
                date.games.forEach(game => {
                    // Only include games that have been completed
                    if (game.status && game.status.abstractGameState === 'Final') {
                        games.push({
                            id: game.gamePk,
                            date: date.date,
                            awayTeam: game.teams.away.team.name,
                            homeTeam: game.teams.home.team.name,
                            awayScore: game.teams.away.score,
                            homeScore: game.teams.home.score
                        });
                    }
                });
            }
        });
    }
    
    // Sort games by date (newest first)
    games.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit to 10 most recent games
    games = games.slice(0, 10);
    
    populateGameSelect();
}

// Populate game select dropdown
function populateGameSelect() {
    gameSelect.innerHTML = '';
    
    if (games.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No recent games available';
        gameSelect.appendChild(option);
        
        loadingElement.textContent = 'No recent games available for this team.';
        return;
    }
    
    games.forEach((game, index) => {
        const option = document.createElement('option');
        option.value = game.id;
        
        const dateObj = new Date(game.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        option.textContent = `${formattedDate}: ${game.awayTeam} (${game.awayScore}) @ ${game.homeTeam} (${game.homeScore})`;
        gameSelect.appendChild(option);
    });
    
    // Select the first game and load its data
    if (games.length > 0) {
        gameSelect.value = games[0].id;
        fetchGameData(games[0].id);
    }
}

// Handle game selection change
function handleGameChange(event) {
    const gameId = event.target.value;
    fetchGameData(gameId);
}

// Fetch detailed game data
async function fetchGameData(gameId) {
    try {
        loadingElement.classList.remove('hidden');
        scoreboardElement.classList.add('hidden');
        gameDetailsElement.classList.add('hidden');
        
        const boxscoreResponse = await axios.get(`${MLB_API_BASE_URL}${GAME_ENDPOINT}/${gameId}/boxscore`);
        const linescore = await axios.get(`${MLB_API_BASE_URL}${GAME_ENDPOINT}/${gameId}/linescore`);
        
        currentGameData = {
            boxscore: boxscoreResponse.data,
            linescore: linescore.data
        };
        
        renderScoreboard();
    } catch (error) {
        console.error('Error fetching game data:', error);
        showError('Failed to load game details. Please try again later.');
    }
}

// Render the scoreboard with game data
function renderScoreboard() {
    if (!currentGameData) {
        return;
    }
    
    const { boxscore, linescore } = currentGameData;
    
    // Set team names
    document.getElementById('awayTeamName').textContent = linescore.teams.away.team.name;
    document.getElementById('homeTeamName').textContent = linescore.teams.home.team.name;
    
    // Set innings scores
    const awayInningsElement = document.getElementById('awayInnings');
    const homeInningsElement = document.getElementById('homeInnings');
    
    awayInningsElement.innerHTML = '';
    homeInningsElement.innerHTML = '';
    
    // Display inning-by-inning scores
    const totalInnings = linescore.innings ? linescore.innings.length : 0;
    
    for (let i = 0; i < 9; i++) {
        const awayInningScore = document.createElement('div');
        const homeInningScore = document.createElement('div');
        
        if (i < totalInnings) {
            const inning = linescore.innings[i];
            awayInningScore.textContent = inning.away.runs || '0';
            // Handle "X" for bottom of the inning that wasn't played
            homeInningScore.textContent = inning.home.runs !== undefined ? inning.home.runs : 'X';
        } else {
            awayInningScore.textContent = '-';
            homeInningScore.textContent = '-';
        }
        
        awayInningsElement.appendChild(awayInningScore);
        homeInningsElement.appendChild(homeInningScore);
    }
    
    // Add R, H, E columns
    const awayRunsElement = document.createElement('div');
    const awayHitsElement = document.createElement('div');
    const awayErrorsElement = document.createElement('div');
    
    awayRunsElement.textContent = linescore.teams.away.runs || '0';
    awayHitsElement.textContent = linescore.teams.away.hits || '0';
    awayErrorsElement.textContent = linescore.teams.away.errors || '0';
    
    awayInningsElement.appendChild(awayRunsElement);
    awayInningsElement.appendChild(awayHitsElement);
    awayInningsElement.appendChild(awayErrorsElement);
    
    const homeRunsElement = document.createElement('div');
    const homeHitsElement = document.createElement('div');
    const homeErrorsElement = document.createElement('div');
    
    homeRunsElement.textContent = linescore.teams.home.runs || '0';
    homeHitsElement.textContent = linescore.teams.home.hits || '0';
    homeErrorsElement.textContent = linescore.teams.home.errors || '0';
    
    homeInningsElement.appendChild(homeRunsElement);
    homeInningsElement.appendChild(homeHitsElement);
    homeInningsElement.appendChild(homeErrorsElement);
    
    // Set game info (WP, LP, SV)
    const gameInfoElement = document.getElementById('gameInfo');
    let gameInfoText = '';
    
    if (boxscore.info && boxscore.info.length > 0) {
        // Look for WP, LP, and SV info
        const wpInfo = boxscore.info.find(item => item.label === 'WP');
        const lpInfo = boxscore.info.find(item => item.label === 'LP');
        const svInfo = boxscore.info.find(item => item.label === 'SV');
        
        if (wpInfo) gameInfoText += `WP: ${wpInfo.value} `;
        if (lpInfo) gameInfoText += `LP: ${lpInfo.value} `;
        if (svInfo) gameInfoText += `SV: ${svInfo.value}`;
    }
    
    gameInfoElement.textContent = gameInfoText;
    
    // Populate batting and pitching details
    populateTeamDetails(boxscore);
    
    // Show the scoreboard
    loadingElement.classList.add('hidden');
    scoreboardElement.classList.remove('hidden');
    gameDetailsElement.classList.remove('hidden');
}

// Populate team details (batting and pitching)
function populateTeamDetails(boxscore) {
    const awayTeam = boxscore.teams.away;
    const homeTeam = boxscore.teams.home;
    
    // Set team names in detail section
    document.getElementById('awayTeamNameDetail').textContent = awayTeam.team.name;
    document.getElementById('homeTeamNameDetail').textContent = homeTeam.team.name;
    
    // Populate batting tables
    populateBattingTable('awayBatting', awayTeam.batters, awayTeam.players);
    populateBattingTable('homeBatting', homeTeam.batters, homeTeam.players);
    
    // Populate pitching tables
    populatePitchingTable('awayPitching', awayTeam.pitchers, awayTeam.players);
    populatePitchingTable('homePitching', homeTeam.pitchers, homeTeam.players);
}

// Populate batting table
function populateBattingTable(tableId, batterIds, players) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = '';
    
    batterIds.forEach(batterId => {
        const player = players[`ID${batterId}`];
        if (!player || !player.stats || !player.stats.batting) return;
        
        const stats = player.stats.batting;
        
        const row = document.createElement('tr');
        
        // Player name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = `${player.person.fullName} ${player.position.abbreviation}`;
        row.appendChild(nameCell);
        
        // Stats cells
        const abCell = document.createElement('td');
        abCell.textContent = stats.atBats || '0';
        row.appendChild(abCell);
        
        const rCell = document.createElement('td');
        rCell.textContent = stats.runs || '0';
        row.appendChild(rCell);
        
        const hCell = document.createElement('td');
        hCell.textContent = stats.hits || '0';
        row.appendChild(hCell);
        
        const rbiCell = document.createElement('td');
        rbiCell.textContent = stats.rbi || '0';
        row.appendChild(rbiCell);
        
        tableBody.appendChild(row);
    });
}

// Populate pitching table
function populatePitchingTable(tableId, pitcherIds, players) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = '';
    
    pitcherIds.forEach(pitcherId => {
        const player = players[`ID${pitcherId}`];
        if (!player || !player.stats || !player.stats.pitching) return;
        
        const stats = player.stats.pitching;
        
        const row = document.createElement('tr');
        
        // Player name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = player.person.fullName;
        row.appendChild(nameCell);
        
        // Stats cells
        const ipCell = document.createElement('td');
        ipCell.textContent = stats.inningsPitched || '0';
        row.appendChild(ipCell);
        
        const hCell = document.createElement('td');
        hCell.textContent = stats.hits || '0';
        row.appendChild(hCell);
        
        const rCell = document.createElement('td');
        rCell.textContent = stats.runs || '0';
        row.appendChild(rCell);
        
        const erCell = document.createElement('td');
        erCell.textContent = stats.earnedRuns || '0';
        row.appendChild(erCell);
        
        const bbCell = document.createElement('td');
        bbCell.textContent = stats.baseOnBalls || '0';
        row.appendChild(bbCell);
        
        const soCell = document.createElement('td');
        soCell.textContent = stats.strikeOuts || '0';
        row.appendChild(soCell);
        
        tableBody.appendChild(row);
    });
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Show error message
function showError(message) {
    loadingElement.textContent = message;
    loadingElement.classList.remove('hidden');
    scoreboardElement.classList.add('hidden');
    gameDetailsElement.classList.add('hidden');
}

// Start the application
init();
