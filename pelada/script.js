// Player data structure
let players = [];
let teams = [];

// DOM Elements
const playerForm = document.getElementById('player-form');
const playerNameInput = document.getElementById('player-name');
const playerLevelSelect = document.getElementById('player-level');
const playersContainer = document.getElementById('players-container');
const playerCountSpan = document.getElementById('player-count');
const generateTeamsBtn = document.getElementById('generate-teams');
const reshuffleTeamsBtn = document.getElementById('reshuffle-teams');
const clearListBtn = document.getElementById('clear-list');
const teamsSection = document.getElementById('teams-section');
const teamsContainer = document.getElementById('teams-container');

// Level mapping for display
const levelMap = {
    1: 'Iniciante',
    2: 'Médio',
    3: 'Bom',
    4: 'Craque'
};

// Level class mapping for styling
const levelClassMap = {
    1: 'level-1',
    2: 'level-2',
    3: 'level-3',
    4: 'level-4'
};

// Add player event listener
playerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = playerNameInput.value.trim();
    const level = parseInt(playerLevelSelect.value);
    
    if (name && level) {
        addPlayer(name, level);
        playerNameInput.value = '';
        playerLevelSelect.value = '';
        playerNameInput.focus();
    }
});

// Add player function
function addPlayer(name, level) {
    const player = {
        id: Date.now(), // Simple ID generation
        name: name,
        level: level
    };
    
    players.push(player);
    renderPlayersList();
    updateUI();
}

// Render players list
function renderPlayersList() {
    playersContainer.innerHTML = '';
    
    if (players.length === 0) {
        playersContainer.innerHTML = '<p>Nenhum jogador adicionado ainda.</p>';
        return;
    }
    
    players.forEach(player => {
        const li = document.createElement('li');
        li.className = 'player-item';
        li.innerHTML = `
            <div class="player-info">
                <span class="player-name">${player.name}</span>
                <span class="player-level ${levelClassMap[player.level]}">${levelMap[player.level]}</span>
            </div>
            <button class="delete-player" data-id="${player.id}">Remover</button>
        `;
        playersContainer.appendChild(li);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-player').forEach(button => {
        button.addEventListener('click', function() {
            const playerId = parseInt(this.getAttribute('data-id'));
            removePlayer(playerId);
        });
    });
}

// Remove player
function removePlayer(playerId) {
    players = players.filter(player => player.id !== playerId);
    renderPlayersList();
    updateUI();
}

// Update UI elements
function updateUI() {
    playerCountSpan.textContent = players.length;
    
    // Enable/disable buttons based on player count
    generateTeamsBtn.disabled = players.length < 2;
    reshuffleTeamsBtn.disabled = teams.length === 0 || players.length < 2;
}

// Clear players list
clearListBtn.addEventListener('click', function() {
    if (confirm('Tem certeza que deseja limpar toda a lista de jogadores?')) {
        players = [];
        teams = [];
        renderPlayersList();
        teamsSection.style.display = 'none';
        updateUI();
    }
});

// Generate teams
generateTeamsBtn.addEventListener('click', function() {
    if (players.length >= 2) {
        generateBalancedTeams();
        renderTeams();
        teamsSection.style.display = 'block';
    }
});

// Reshuffle teams
reshuffleTeamsBtn.addEventListener('click', function() {
    if (players.length >= 2) {
        generateBalancedTeams();
        renderTeams();
        teamsSection.style.display = 'block';
    }
});

// Generate balanced teams algorithm
function generateBalancedTeams() {
    // Reset teams
    teams = [];
    
    // Create a copy of players and sort by level (descending)
    const sortedPlayers = [...players].sort((a, b) => b.level - a.level);
    
    // Determine number of teams (2 teams if <= 6 players, otherwise 3 teams)
    const numTeams = sortedPlayers.length <= 6 ? 2 : Math.min(3, Math.ceil(sortedPlayers.length / 5));
    
    // Initialize teams
    for (let i = 0; i < numTeams; i++) {
        teams.push({
            id: i + 1,
            name: `Time ${i + 1}`,
            players: [],
            totalLevel: 0
        });
    }
    
    // Distribute players using snake draft approach for balance
    for (let i = 0; i < sortedPlayers.length; i++) {
        // Calculate which team gets the player (snake draft)
        let teamIndex;
        if (Math.floor(i / numTeams) % 2 === 0) {
            // Normal order
            teamIndex = i % numTeams;
        } else {
            // Reverse order
            teamIndex = numTeams - 1 - (i % numTeams);
        }
        
        teams[teamIndex].players.push(sortedPlayers[i]);
        teams[teamIndex].totalLevel += sortedPlayers[i].level;
    }
}

// Render teams
function renderTeams() {
    teamsContainer.innerHTML = '';
    
    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        
        let playersHTML = '';
        team.players.forEach(player => {
            playersHTML += `
                <li class="team-player">
                    <span>${player.name}</span>
                    <span class="player-total-level">${levelMap[player.level]}</span>
                </li>
            `;
        });
        
        teamCard.innerHTML = `
            <div class="team-header">
                <h3 class="team-name">${team.name}</h3>
                <div class="team-stats">Total Nível: ${team.totalLevel} | Jogadores: ${team.players.length}</div>
            </div>
            <ul class="team-players">
                ${playersHTML}
            </ul>
        `;
        
        teamsContainer.appendChild(teamCard);
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    renderPlayersList();
    updateUI();
});