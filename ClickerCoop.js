 // Estado do jogo
 let clicks = 0;
 let level = 1;
 let targetClicks = 10; // Requisito inicial
 let coins = 0;
 let clickPower = 1;
 let players = [];
 let activePlayerIndex = -1;
 let teamLevel = 1;
 let teamGoal = 5;
 let avatarColors = ['#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14', '#ffc107', '#28a745'];
 
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
 
 // Definição de upgrades
 const upgrades = [
   {
     id: 'click-power',
     name: 'Poder de Clique',
     description: 'Aumenta o valor de cada clique',
     basePrice: 10,
     level: 0,
     maxLevel: 10,
     effect: level => level + 1,
     priceIncrease: 1.5
   },
   {
     id: 'auto-clicker',
     name: 'Auto Clicker',
     description: 'Clica automaticamente a cada segundo',
     basePrice: 50,
     level: 0,
     maxLevel: 5,
     effect: level => level,
     priceIncrease: 2
   },
   {
     id: 'coin-boost',
     name: 'Boost de Moedas',
     description: 'Aumenta as moedas ganhas por nível',
     basePrice: 30,
     level: 0,
     maxLevel: 5,
     effect: level => 1 + level * 0.2, // 20% de aumento por nível
     priceIncrease: 1.8
   },
   {
     id: 'progress-boost',
     name: 'Boost de Progresso',
     description: 'Reduz o aumento da dificuldade entre níveis',
     basePrice: 100,
     level: 0,
     maxLevel: 3,
     effect: level => 1.25 - (level * 0.05), // Reduz de 1.25 para 1.10
     priceIncrease: 2.5
   },
   {
     id: 'team-synergy',
     name: 'Sinergia de Equipe',
     description: 'Aumenta o poder de clique baseado no número de jogadores',
     basePrice: 40,
     level: 0,
     maxLevel: 5,
     effect: level => level * (players.length * 0.1), // 10% por jogador por nível
     priceIncrease: 1.7
   },
   {
     id: 'shared-rewards',
     name: 'Recompensas Compartilhadas',
     description: 'Jogadores inativos recebem uma porcentagem das moedas ganhas',
     basePrice: 75,
     level: 0,
     maxLevel: 3,
     effect: level => level * 0.15, // 15% por nível
     priceIncrease: 2.2
   }
 ];
 
 // Definição de objetivos
 const achievements = [
   {
     id: 'first-level',
     name: 'Primeiro Nível',
     description: 'Complete o nível 1',
     unlocked: false,
     requirement: () => level > 1,
     reward: 5
   },
   {
     id: 'level-5',
     name: 'Persistente',
     description: 'Alcance o nível 5',
     unlocked: false,
     requirement: () => level >= 5,
     reward: 20
   },
   {
     id: 'level-10',
     name: 'Dedicado',
     description: 'Alcance o nível 10',
     unlocked: false,
     requirement: () => level >= 10,
     reward: 50
   },
   {
     id: 'level-25',
     name: 'Mestre Clicker',
     description: 'Alcance o nível 25',
     unlocked: false,
     requirement: () => level >= 25,
     reward: 150
   },
   {
     id: 'coins-100',
     name: 'Colecionador',
     description: 'Acumule 100 moedas',
     unlocked: false,
     requirement: () => coins >= 100,
     reward: 10
   },
   {
     id: 'upgrade-max',
     name: 'Aprimorado',
     description: 'Maximize um upgrade',
     unlocked: false,
     requirement: () => upgrades.some(upgrade => upgrade.level >= upgrade.maxLevel),
     reward: 75
   },
   {
     id: 'team-goal',
     name: 'Esforço de Equipe',
     description: 'Atinja o primeiro objetivo da equipe',
     unlocked: false,
     requirement: () => teamLevel > 1,
     reward: 30
   },
   {
     id: 'team-players-3',
     name: 'Trabalho em Equipe',
     description: 'Tenha 3 ou mais jogadores na equipe',
     unlocked: false,
     requirement: () => players.length >= 3,
     reward: 25
   }
 ];
 
 // Inicializar jogo
 function initGame() {
   updateDisplays();
   renderUpgrades();
   renderAchievements();
   
   // Adicionar eventos de clique
   clickArea.addEventListener('click', handleClick);
   addPlayerButton.addEventListener('click', addPlayer);
   switchPlayerButton.addEventListener('click', switchPlayer);
   
   // Iniciar timer do auto-clicker
   setInterval(runAutoClicker, 1000);
   
   // Iniciar timer de verificação de objetivos
   setInterval(checkAchievements, 2000);
   
   // Adicionar mensagem inicial
   addChatMessage("Bem-vindo ao Clicker Cooperativo! Adicione jogadores para começar.", "system");
 }
 
 // Adicionar jogador
 function addPlayer() {
   const playerName = playerNameInput.value.trim();
   const playerRole = playerRoleSelect.value;
   
   if (playerName === "") {
     showNotification("Por favor, insira um nome para o jogador");
     return;
   }
   
   // Verificar se o jogador já existe
   if (players.some(p => p.name === playerName)) {
     showNotification("Este jogador já existe!");
     return;
   }
   
   // Criar objeto de jogador
   const roleBonus = {
     clicker: { type: "clickPower", value: 0.2 },
     upgrader: { type: "upgradeCost", value: -0.15 },
     supporter: { type: "teamBonus", value: 0.1 }
   };
   
   const colorIndex = players.length % avatarColors.length;
   
   const player = {
     name: playerName,
     role: playerRole,
     bonus: roleBonus[playerRole],
     level: 1,
     clicks: 0,
     coins: 0,
     contribution: 0,
     avatarColor: avatarColors[colorIndex],
     initials: playerName.slice(0, 2).toUpperCase()
   };
   
   players.push(player);
   renderPlayers();
   
   // Definir como jogador ativo se for o primeiro
   if (players.length === 1) {
     activePlayerIndex = 0;
     updateActivePlayer();
   }
   
   playerNameInput.value = "";
   
   // Adicionar mensagem ao chat
   addChatMessage(`${playerName} entrou no jogo como ${getRoleName(playerRole)}!`, "system");
   checkAchievements();
   
   // Atualizar contribuições
   renderContributions();
 }
 
 // Alternar entre jogadores
 function switchPlayer() {
   if (players.length === 0) {
     showNotification("Não há jogadores para alternar!");
     return;
   }
   
   activePlayerIndex = (activePlayerIndex + 1) % players.length;
   updateActivePlayer();
   
   // Adicionar mensagem ao chat
   addChatMessage(`Jogador ativo alterado para ${players[activePlayerIndex].name}`, "system");
 }
 
 // Atualizar jogador ativo
 function updateActivePlayer() {
   // Atualizar visualmente qual jogador está ativo
   const playerTags = document.querySelectorAll('.player-tag');
   playerTags.forEach((tag, index) => {
     tag.setAttribute('data-active', index === activePlayerIndex ? "true" : "false");
   });
   
   activePlayerDisplay.textContent = players[activePlayerIndex]?.name || "-";
   
   // Atualizar estatísticas para o jogador ativo
   if (activePlayerIndex >= 0) {
     const player = players[activePlayerIndex];
     level = player.level;
     clicks = player.clicks;
     coins = player.coins;
     
     // Recalcular clickPower com os bônus do jogador
     updateClickPower();
     
     updateDisplays();
     updateProgressBar();
     renderUpgrades();
   }
 }
 
 // Obter nome amigável do papel
 function getRoleName(role) {
   const roles = {
     clicker: "Clicker",
     upgrader: "Upgrader",
     supporter: "Supporter"
   };
   return roles[role] || role;
 }
 
 // Renderizar lista de jogadores
 function renderPlayers() {
   playerList.innerHTML = '';
   
   players.forEach((player, index) => {
     const playerTag = document.createElement('div');
     playerTag.className = 'player-tag';
     playerTag.setAttribute('data-active', index === activePlayerIndex ? "true" : "false");
     
     const roleClass = `role-${player.role}`;
     
     playerTag.innerHTML = `
       <div class="player-avatar" style="background-color: ${player.avatarColor}">${player.initials}</div>
       ${player.name}
       <span class="player-role ${roleClass}">${getRoleName(player.role)}</span>
     `;
     
     playerList.appendChild(playerTag);
   });
 }
 
 // Renderizar contribuições dos jogadores
 function renderContributions() {
   contributionContainer.innerHTML = '';
   
   if (players.length === 0) {
     contributionContainer.innerHTML = '<div>Adicione jogadores para ver as contribuições</div>';
     return;
   }
   
   // Calcular contribuição total
   const totalContribution = players.reduce((sum, player) => sum + player.contribution, 1); // Evitar divisão por zero
   
   players.forEach(player => {
     const percentage = (player.contribution / totalContribution * 100) || 0;
     
     const contributionElement = document.createElement('div');
     contributionElement.className = 'player-contribution';
     
     contributionElement.innerHTML = `
       <div>
         <div class="player-avatar" style="background-color: ${player.avatarColor}">${player.initials}</div>
         ${player.name} (Nv. ${player.level})
       </div>
       <div>${Math.floor(player.contribution)} cliques (${percentage.toFixed(1)}%)</div>
     `;
     
     const barContainer = document.createElement('div');
     barContainer.className = 'contribution-bar';
     
     const barFill = document.createElement('div');
     barFill.className = 'contribution-fill';
     barFill.style.width = `${percentage}%`;
     barFill.style.backgroundColor = player.avatarColor;
     
     barContainer.appendChild(barFill);
     contributionElement.appendChild(barContainer);
     
     contributionContainer.appendChild(contributionElement);
   });
 }
 
 // Adicionar mensagem ao chat
 function addChatMessage(text, type) {
   const messageElement = document.createElement('div');
   messageElement.className = `chat-message chat-${type}`;
   messageElement.textContent = text;
   
   chatContainer.appendChild(messageElement);
   
   // Auto-scroll para a mensagem mais recente
   chatContainer.scrollTop = chatContainer.scrollHeight;
 }
 
 // Tratar clique
 function handleClick(event) {
   if (activePlayerIndex === -1) return;
   
   // Aplicar o clickPower atual com bônus
   const clickValue = calculateClickValue();
   clicks += clickValue;
   
   // Atualizar contribuição do jogador
   players[activePlayerIndex].clicks += clickValue;
   players[activePlayerIndex].contribution += clickValue;
   
   updateProgressBar();
   updateDisplays();
   
   // Verificar se a meta foi atingida
   if (clicks >= targetClicks) {
     levelUp();
   }
   
   // Ocasionalmente atualizar as contribuições (para não sobrecarregar o DOM)
   if (Math.random() < 0.1) {
     renderContributions();
   }
 }
 
 // Calcular valor do clique com todos os bônus
 function calculateClickValue() {
   let finalClickPower = clickPower;
   
   // Aplicar bônus de papel de "clicker" se aplicável
   if (players[activePlayerIndex]?.role === "clicker") {
     finalClickPower *= (1 + players[activePlayerIndex].bonus.value);
   }
   
   // Aplicar bônus de sinergia de equipe
   const teamSynergyBonus = getUpgradeEffect('team-synergy');
   if (teamSynergyBonus > 0) {
     finalClickPower *= (1 + teamSynergyBonus);
   }
   
   // Aplicar bônus de "supporter" (aumenta o poder de clique de todos)
   const supporterBonus = players.reduce((sum, p) => 
     p.role === "supporter" ? sum + p.bonus.value : sum, 0);
   if (supporterBonus > 0) {
     finalClickPower *= (1 + supporterBonus);
   }
   
   return Math.round(finalClickPower * 10) / 10; // Arredondar para 1 casa decimal
 }
 
 // Atualizar poder de clique base
 function updateClickPower() {
   clickPower = getUpgradeEffect('click-power');
   clickPowerDisplay.textContent = calculateClickValue().toFixed(1);
 }
 
 // Atualizar barra de progresso
 function updateProgressBar() {
   const progress = (clicks / targetClicks) * 100;
   progressBar.style.width = `${Math.min(100, progress)}%`;
   
   // Atualizar barra de progresso da equipe
   const teamProgress = (players.reduce((max, p) => Math.max(max, p.level), 0) / teamGoal) * 100;
   teamProgressBar.style.width = `${Math.min(100, teamProgress)}%`;
   teamProgressDisplay.textContent = players.reduce((max, p) => Math.max(max, p.level), 0);
 }
 
 // Atualizar elementos de exibição
 function updateDisplays() {
   clicksDisplay.textContent = Math.floor(clicks);
   levelDisplay.textContent = level;
   targetDisplay.textContent = Math.ceil(targetClicks);
   coinsDisplay.textContent = Math.floor(coins);
   
   // Atualizar exibições relacionadas à equipe
   teamGoalDisplay.textContent = teamGoal;
   teamGoalDisplayExtra.textContent = teamGoal;
   teamProgressDisplay.textContent = players.reduce((max, p) => Math.max(max, p.level), 0);
 }
 
 // Subir de nível
 function levelUp() {
   level++;
   
   // Atualizar o nível do jogador ativo
   if (activePlayerIndex >= 0) {
     players[activePlayerIndex].level = level;
   }
   
   // Aplicar efeito visual
   gameContainer.classList.add('level-up');
   setTimeout(() => {
     gameContainer.classList.remove('level-up');
   }, 1000);
   
   // Conceder moedas
   const coinBoost = getUpgradeEffect('coin-boost');
   const coinsAwarded = Math.round(level * 5 * coinBoost);
   coins += coinsAwarded;
   
   // Atualizar moedas do jogador ativo
   if (activePlayerIndex >= 0) {
     players[activePlayerIndex].coins = coins;
   }
   
   // Distribuir recompensas compartilhadas para jogadores inativos
   const sharedRewardBonus = getUpgradeEffect('shared-rewards');
   if (sharedRewardBonus > 0) {
     players.forEach((player, index) => {
       if (index !== activePlayerIndex) {
         const sharedCoins = Math.round(coinsAwarded * sharedRewardBonus);
         player.coins += sharedCoins;
         addChatMessage(`${player.name} recebeu ${sharedCoins} moedas compartilhadas!`, "system");
       }
     });
   }
   
   // Mostrar notificação
   showNotification(`${players[activePlayerIndex].name} alcançou o nível ${level}! +${coinsAwarded} moedas`);
   
   // Resetar cliques
   clicks = 0;
   
   // Aumentar meta com possível redução do boost de progresso
   const difficultyCurve = getUpgradeEffect('progress-boost');
   targetClicks = Math.ceil(targetClicks * difficultyCurve);
   
   // Verificar objetivo da equipe
   const highestLevel = players.reduce((max, p) => Math.max(max, p.level), 0);
   if (highestLevel >= teamGoal) {
     teamLevel++;
     teamGoal += 5; // Aumentar o objetivo da equipe
     teamBonusMessage.textContent = `Objetivo da equipe alcançado! Bônus: +${teamLevel * 10}% de moedas para todos!`;
     players.forEach(player => {
       player.coins += Math.round(player.coins * (teamLevel * 0.1));
     });
     addChatMessage(`Equipe atingiu o nível ${teamLevel}! Todos ganham +${teamLevel * 10}% de moedas!`, "system");
   }
   
   // Atualizar exibições
   updateProgressBar();
   updateDisplays();
   renderUpgrades();
   renderContributions();
   checkAchievements();
 }
 
 // Renderizar upgrades
 function renderUpgrades() {
   upgradesContainer.innerHTML = '';
   
   upgrades.forEach(upgrade => {
     let price = getUpgradePrice(upgrade);
     
     // Aplicar desconto de "upgrader" se houver jogadores com esse papel
     const upgraderDiscount = players.some(p => p.role === "upgrader") && upgrade.level < upgrade.maxLevel
       ? players.filter(p => p.role === "upgrader").reduce((sum, p) => sum + p.bonus.value, 0)
       : 0;
     price = Math.round(price * (1 + upgraderDiscount));
     
     const canAfford = coins >= price;
     const maxedOut = upgrade.level >= upgrade.maxLevel;
     
     const upgradeElement = document.createElement('div');
     upgradeElement.className = `upgrade-item ${(!canAfford || maxedOut) ? 'disabled' : ''}`;
     
     upgradeElement.innerHTML = `
       <div class="upgrade-info">
         <div><strong>${upgrade.name}</strong> <span class="upgrade-level">(Nível ${upgrade.level}/${upgrade.maxLevel})</span></div>
         <div>${upgrade.description}</div>
       </div>
       <button class="buy-button" ${(!canAfford || maxedOut) ? 'disabled' : ''}>${maxedOut ? 'MAX' : price + ' 🪙'}</button>
     `;
     
     // Adicionar evento de clique apenas se não estiver no máximo e puder pagar
     if (!maxedOut && canAfford) {
       upgradeElement.querySelector('.buy-button').addEventListener('click', (e) => {
         e.stopPropagation(); // Impedir que o clique global seja acionado
         buyUpgrade(upgrade.id);
       });
     }
     
     upgradesContainer.appendChild(upgradeElement);
   });
 }
 
 // Renderizar objetivos
 function renderAchievements() {
   achievementsContainer.innerHTML = '';
   
   achievements.forEach(achievement => {
     const achievementElement = document.createElement('div');
     achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
     
     achievementElement.innerHTML = `
       <div class="achievement-info">
         <div><strong>${achievement.name}</strong></div>
         <div>${achievement.description}</div>
         <div>${achievement.unlocked ? 'Concluído ✓' : `Recompensa: ${achievement.reward} 🪙`}</div>
       </div>
     `;
     
     achievementsContainer.appendChild(achievementElement);
   });
 }
 
 // Comprar upgrade
 function buyUpgrade(upgradeId) {
   const upgrade = upgrades.find(u => u.id === upgradeId);
   if (!upgrade) return;
   
   let price = getUpgradePrice(upgrade);
   
   // Aplicar desconto de "upgrader"
   const upgraderDiscount = players.some(p => p.role === "upgrader") && upgrade.level < upgrade.maxLevel
     ? players.filter(p => p.role === "upgrader").reduce((sum, p) => sum + p.bonus.value, 0)
     : 0;
   price = Math.round(price * (1 + upgraderDiscount));
   
   if (coins >= price && upgrade.level < upgrade.maxLevel) {
     coins -= price;
     upgrade.level++;
     
     // Atualizar moedas do jogador ativo
     if (activePlayerIndex >= 0) {
       players[activePlayerIndex].coins = coins;
     }
     
     // Aplicar efeitos dos upgrades
     if (upgradeId === 'click-power') {
       updateClickPower();
     }
     
     // Mostrar notificação
     showNotification(`Upgrade de ${upgrade.name} comprado por ${players[activePlayerIndex].name}!`);
     addChatMessage(`${players[activePlayerIndex].name} comprou ${upgrade.name} nível ${upgrade.level}`, "player");
     
     // Atualizar exibições
     updateDisplays();
     renderUpgrades();
     
     // Verificar conquistas após a compra
     if (upgrade.level >= upgrade.maxLevel) {
       checkAchievements();
     }
   }
 }
 
 // Obter preço do upgrade baseado no nível
 function getUpgradePrice(upgrade) {
   return Math.ceil(upgrade.basePrice * Math.pow(upgrade.priceIncrease, upgrade.level));
 }
 
 // Obter efeito do upgrade baseado no nível
 function getUpgradeEffect(upgradeId) {
   const upgrade = upgrades.find(u => u.id === upgradeId);
   if (!upgrade) return 0; // Retornar 0 se não encontrado
   
   return upgrade.effect(upgrade.level);
 }
 
 // Executar auto-clicker
 function runAutoClicker() {
   if (activePlayerIndex === -1) return;
   
   const autoClickPower = getUpgradeEffect('auto-clicker');
   if (autoClickPower > 0) {
     const clickValue = calculateClickValue() * autoClickPower;
     clicks += clickValue;
     players[activePlayerIndex].clicks += clickValue;
     players[activePlayerIndex].contribution += clickValue;
     
     updateProgressBar();
     updateDisplays();
     
     // Verificar se a meta foi atingida
     if (clicks >= targetClicks) {
       levelUp();
     }
   }
 }
 
 // Verificar conquistas
 function checkAchievements() {
   let newUnlocks = false;
   
   achievements.forEach(achievement => {
     if (!achievement.unlocked && achievement.requirement()) {
       achievement.unlocked = true;
       coins += achievement.reward;
       if (activePlayerIndex >= 0) {
         players[activePlayerIndex].coins = coins;
       }
       showNotification(`Objetivo alcançado: ${achievement.name}! +${achievement.reward} 🪙`);
       addChatMessage(`Equipe desbloqueou "${achievement.name}"! +${achievement.reward} moedas`, "system");
       newUnlocks = true;
     }
   });
   
   if (newUnlocks) {
     renderAchievements();
     renderUpgrades(); // Re-renderizar caso novas moedas permitam compras
     updateDisplays();
   }
 }
 
 // Mostrar notificação
 function showNotification(message) {
   notification.textContent = message;
   notification.classList.add('show');
   
   setTimeout(() => {
     notification.classList.remove('show');
   }, 3000);
 }
 
 // Inicializar o jogo
 initGame();