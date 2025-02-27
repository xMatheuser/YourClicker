    // Conectar ao servidor
    const socket = io('/');

    // Estado local mínimo
    let activePlayerIndex = -1;
    let gameState = { players: [] }; // Inicializar com um array vazio para evitar undefined
    let isSpacePressed = false;

    // Elementos DOM
    const progressBar = document.getElementById('progress-bar');
    const clicksDisplay = document.getElementById('clicks');
    const levelDisplay = document.getElementById('level');
    const targetDisplay = document.getElementById('target');
    const coinsDisplay = document.getElementById('coins');
    const clickPowerDisplay = document.getElementById('click-power');
    const clickArea = document.getElementById('click-area');
    const gameContainer = document.querySelector('.game-container');
    const upgradesContainer = document.getElementById('upgrades-container');
    const achievementsContainer = document.getElementById('achievements-container');
    const notification = document.getElementById('notification');
    const playerList = document.getElementById('player-list');
    const playerNameInput = document.getElementById('player-name');
    const playerRoleSelect = document.getElementById('player-role');
    const addPlayerButton = document.getElementById('add-player');
    const switchPlayerButton = document.getElementById('switch-player');
    const activePlayerDisplay = document.getElementById('active-player');
    const contributionContainer = document.getElementById('contribution-container');
    const teamProgressBar = document.getElementById('team-progress-bar');
    const teamProgressDisplay = document.getElementById('team-progress');
    const teamGoalDisplay = document.getElementById('team-goal');
    const teamGoalDisplayExtra = document.getElementById('team-goal-display');
    const teamBonusMessage = document.getElementById('team-bonus-message');
    const chatContainer = document.getElementById('chat-container');

    // Inicializar jogo
    function initGame() {
      // Não chamar updateDisplays() aqui, pois gameState ainda não está pronto
      // Apenas configurar os eventos iniciais

      // Eventos de clique
      clickArea.addEventListener('click', () => {
        socket.emit('click');
      });

      document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' && !isSpacePressed) {
          event.preventDefault();
          isSpacePressed = true;
          socket.emit('click');
          clickArea.classList.add('active');
        }
      });

      document.addEventListener('keyup', (event) => {
        if (event.code === 'Space') {
          isSpacePressed = false;
          clickArea.classList.remove('active');
        }
      });

      // Adicionar jogador
      addPlayerButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        const playerRole = playerRoleSelect.value;
        if (playerName === '') {
          showNotification('Por favor, insira um nome para o jogador');
          return;
        }
        socket.emit('addPlayer', { name: playerName, role: playerRole });
        playerNameInput.value = '';
      });

      // Alternar jogador
      switchPlayerButton.addEventListener('click', switchPlayer);

      // Inicializar renderizações básicas
      renderUpgrades();
      renderAchievements();
    }

    // Receber atualizações do estado do jogo
    socket.on('gameStateUpdate', (newState) => {
      gameState = newState;

      // Inicializar activePlayerIndex apenas se houver jogadores
      if (activePlayerIndex === -1 && gameState.players && gameState.players.length > 0) {
        activePlayerIndex = 0;
      }

      // Atualizar interface apenas se houver um jogador ativo válido
      if (gameState.players && gameState.players.length > 0 && activePlayerIndex >= 0) {
        const activePlayer = gameState.players[activePlayerIndex];
        if (activePlayer) {
          clicksDisplay.textContent = Math.floor(activePlayer.clicks);
          levelDisplay.textContent = activePlayer.level;
          targetDisplay.textContent = Math.ceil(activePlayer.targetClicks || 10);
          coinsDisplay.textContent = Math.floor(activePlayer.coins);
          clickPowerDisplay.textContent = calculateClickValue(activePlayer).toFixed(1);
          progressBar.style.width = `${Math.min(100, (activePlayer.clicks / (activePlayer.targetClicks || 10)) * 100)}%`;
        }
      } else {
        // Caso não haja jogadores, exibir valores padrão ou mensagem
        clicksDisplay.textContent = 0;
        levelDisplay.textContent = 1;
        targetDisplay.textContent = 10;
        coinsDisplay.textContent = 0;
        clickPowerDisplay.textContent = 1;
        progressBar.style.width = '0%';
        activePlayerDisplay.textContent = '-';
      }

      renderPlayers();
      renderContributions();
      renderUpgrades();
      teamProgressDisplay.textContent = gameState.teamLevel || 1;
      teamGoalDisplay.textContent = gameState.teamGoal || 5;
      teamGoalDisplayExtra.textContent = gameState.teamGoal || 5;
      teamProgressBar.style.width = `${Math.min(100, ((gameState.teamLevel || 1) / (gameState.teamGoal || 5)) * 100)}%`;
    });

    // Receber mensagens do chat
    socket.on('chatMessage', ({ text, type }) => {
      addChatMessage(text, type);
    });

    // Alternar jogador
    function switchPlayer() {
      if (!gameState.players || gameState.players.length === 0) {
        showNotification('Não há jogadores para alternar!');
        return;
      }
      activePlayerIndex = (activePlayerIndex + 1) % gameState.players.length;
      updateActivePlayer();
      updateDisplays();
    }

    // Atualizar jogador ativo
    function updateActivePlayer() {
      const playerTags = document.querySelectorAll('.player-tag');
      playerTags.forEach((tag, index) => {
        tag.setAttribute('data-active', index === activePlayerIndex ? 'true' : 'false');
      });
      if (gameState.players && gameState.players.length > 0 && activePlayerIndex >= 0) {
        activePlayerDisplay.textContent = gameState.players[activePlayerIndex]?.name || '-';
      } else {
        activePlayerDisplay.textContent = '-';
      }
    }

    // Calcular valor do clique (simplificado no cliente)
    function calculateClickValue(player) {
      let clickPower = 1;
      if (player.role === 'clicker') clickPower *= 1.2;
      return clickPower;
    }

    // Atualizar exibições
    function updateDisplays() {
      if (gameState.players && gameState.players.length > 0 && activePlayerIndex >= 0) {
        const activePlayer = gameState.players[activePlayerIndex];
        if (activePlayer) {
          clicksDisplay.textContent = Math.floor(activePlayer.clicks);
          levelDisplay.textContent = activePlayer.level;
          targetDisplay.textContent = Math.ceil(activePlayer.targetClicks || 10);
          coinsDisplay.textContent = Math.floor(activePlayer.coins);
          clickPowerDisplay.textContent = calculateClickValue(activePlayer).toFixed(1);
          progressBar.style.width = `${Math.min(100, (activePlayer.clicks / (activePlayer.targetClicks || 10)) * 100)}%`;
        }
      } else {
        clicksDisplay.textContent = 0;
        levelDisplay.textContent = 1;
        targetDisplay.textContent = 10;
        coinsDisplay.textContent = 0;
        clickPowerDisplay.textContent = 1;
        progressBar.style.width = '0%';
      }
    }

    // Renderizar lista de jogadores
    function renderPlayers() {
      playerList.innerHTML = '';
      if (!gameState.players) return; // Evitar erro se players for undefined
      gameState.players.forEach((player, index) => {
        const playerTag = document.createElement('div');
        playerTag.className = 'player-tag';
        playerTag.setAttribute('data-active', index === activePlayerIndex ? 'true' : 'false');
        const roleClass = `role-${player.role}`;
        const initials = player.name.slice(0, 2).toUpperCase();
        playerTag.innerHTML = `
          <div class="player-avatar" style="background-color: #007bff">${initials}</div>
          ${player.name}
          <span class="player-role ${roleClass}">${getRoleName(player.role)}</span>
        `;
        playerList.appendChild(playerTag);
      });
    }

    // Renderizar contribuições
    function renderContributions() {
      contributionContainer.innerHTML = '';
      if (!gameState.players || gameState.players.length === 0) {
        contributionContainer.innerHTML = '<div>Adicione jogadores para ver as contribuições</div>';
        return;
      }
      const totalContribution = gameState.players.reduce((sum, p) => sum + p.contribution, 1) || 1;
      gameState.players.forEach(player => {
        const percentage = (player.contribution / totalContribution * 100) || 0;
        const contributionElement = document.createElement('div');
        contributionElement.className = 'player-contribution';
        contributionElement.innerHTML = `
          <div>
            <div class="player-avatar" style="background-color: #007bff">${player.name.slice(0, 2).toUpperCase()}</div>
            ${player.name} (Nv. ${player.level})
          </div>
          <div>${Math.floor(player.contribution)} cliques (${percentage.toFixed(1)}%)</div>
        `;
        const barContainer = document.createElement('div');
        barContainer.className = 'contribution-bar';
        const barFill = document.createElement('div');
        barFill.className = 'contribution-fill';
        barFill.style.width = `${percentage}%`;
        barFill.style.backgroundColor = '#007bff';
        barContainer.appendChild(barFill);
        contributionElement.appendChild(barContainer);
        contributionContainer.appendChild(contributionElement);
      });
    }

    // Renderizar upgrades (simplificado, lógica movida para o servidor)
    function renderUpgrades() {
      upgradesContainer.innerHTML = '<div>Upgrades gerenciados pelo servidor (em desenvolvimento)</div>';
    }

    // Renderizar objetivos (simplificado, lógica movida para o servidor)
    function renderAchievements() {
      achievementsContainer.innerHTML = '<div>Objetivos gerenciados pelo servidor (em desenvolvimento)</div>';
    }

    // Adicionar mensagem ao chat
    function addChatMessage(text, type) {
      const messageElement = document.createElement('div');
      messageElement.className = `chat-message chat-${type}`;
      messageElement.textContent = text;
      chatContainer.appendChild(messageElement);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Mostrar notificação
    function showNotification(message) {
      notification.textContent = message;
      notification.classList.add('show');
      setTimeout(() => notification.classList.remove('show'), 3000);
    }

    // Obter nome do papel
    function getRoleName(role) {
      const roles = { clicker: 'Clicker', upgrader: 'Upgrader', supporter: 'Supporter' };
      return roles[role] || role;
    }

    // Iniciar o jogo
    initGame();