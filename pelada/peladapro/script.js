// Player data structure
let players = [];
let teams = [];
let numberOfTeams = 2; // Default to 2 teams

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
const teamButtons = document.querySelectorAll('.team-btn');
const copyTeamsBtn = document.getElementById('copy-teams');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Level mapping for display
const levelMap = {
    1: 'Fraco',
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

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadPlayersFromLocalStorage();
    renderPlayersList();
    updateUI();
    
    // Check for dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

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

// Team selection event listeners
teamButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        teamButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Update number of teams
        numberOfTeams = parseInt(this.getAttribute('data-teams'));
        
        // Enable generate button if we have enough players
        updateUI();
    });
});

// Add player function
function addPlayer(name, level) {
    const player = {
        id: Date.now() + Math.random(), // Better ID generation
        name: name,
        level: level
    };
    
    players.push(player);
    savePlayersToLocalStorage();
    renderPlayersList();
    updateUI();
}

// Render players list
function renderPlayersList() {
    playersContainer.innerHTML = '';
    
    if (players.length === 0) {
        playersContainer.innerHTML = '<li class="empty-state">Nenhum jogador adicionado ainda</li>';
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
            <button class="delete-player" data-id="${player.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        playersContainer.appendChild(li);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-player').forEach(button => {
        button.addEventListener('click', function() {
            const playerId = parseFloat(this.getAttribute('data-id'));
            removePlayer(playerId);
        });
    });
}

// Remove player
function removePlayer(playerId) {
    players = players.filter(player => player.id !== playerId);
    savePlayersToLocalStorage();
    renderPlayersList();
    updateUI();
}

// Update UI elements
function updateUI() {
    playerCountSpan.textContent = players.length;
    
    // Enable/disable buttons based on player count
    generateTeamsBtn.disabled = players.length < numberOfTeams;
    reshuffleTeamsBtn.disabled = teams.length === 0 || players.length < numberOfTeams;
}

// Clear players list
clearListBtn.addEventListener('click', function() {
    if (players.length > 0 && confirm('Tem certeza que deseja limpar toda a lista de jogadores?')) {
        players = [];
        teams = [];
        savePlayersToLocalStorage();
        renderPlayersList();
        teamsSection.classList.add('hidden');
        updateUI();
    }
});

// Generate teams
generateTeamsBtn.addEventListener('click', function() {
    if (players.length >= numberOfTeams) {
        generateBalancedTeams();
        renderTeams();
        teamsSection.classList.remove('hidden');
    }
});

// Reshuffle teams
reshuffleTeamsBtn.addEventListener('click', function() {
    if (players.length >= numberOfTeams) {
        generateBalancedTeams();
        renderTeams();
    }
});

// Copy teams to clipboard
copyTeamsBtn.addEventListener('click', function() {
    copyTeamsToClipboard();
});

// Generate balanced teams algorithm
function generateBalancedTeams() {
    // Reset teams
    teams = [];
    
    // Create a copy of players and sort by level (descending)
    const sortedPlayers = [...players].sort((a, b) => b.level - a.level);
    
    // Initialize teams
    for (let i = 0; i < numberOfTeams; i++) {
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
        if (Math.floor(i / numberOfTeams) % 2 === 0) {
            // Normal order
            teamIndex = i % numberOfTeams;
        } else {
            // Reverse order
            teamIndex = numberOfTeams - 1 - (i % numberOfTeams);
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
                <div class="team-stats">Pontuação: ${team.totalLevel} | Jogadores: ${team.players.length}</div>
            </div>
            <ul class="team-players">
                ${playersHTML}
            </ul>
        `;
        
        teamsContainer.appendChild(teamCard);
    });
}

// Copy teams to clipboard
function copyTeamsToClipboard() {
    let text = "_TIMES GERADOS - PeladaPro_ \n\n";
    
    teams.forEach(team => {
        text += `${team.name} (Pontuação: ${team.totalLevel})\n`;
        team.players.forEach(player => {
            text += `- ${player.name} (${levelMap[player.level]})\n`;
        });
        text += "\n";
    });
    
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback to user
        const originalText = copyTeamsBtn.innerHTML;
        copyTeamsBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
            copyTeamsBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Falha ao copiar os times. Por favor, tente novamente.');
    });
}

// Dark mode toggle
darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    // Update icon
    if (document.body.classList.contains('dark-mode')) {
        this.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        this.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', 'disabled');
    }
});

// Local Storage Functions
function savePlayersToLocalStorage() {
    localStorage.setItem('peladaProPlayers', JSON.stringify(players));
}

function loadPlayersFromLocalStorage() {
    const storedPlayers = localStorage.getItem('peladaProPlayers');
    if (storedPlayers) {
        players = JSON.parse(storedPlayers);
    }
}