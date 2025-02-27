// Game state
let clicks = 0;
let level = 1;
let targetClicks = 20;
let coins = 0;
let clickPower = 1;
let isCoopMode = true;

const players = {
    player1: { clicks: 0, power: 1, key: 'Q', keyCode: 81, lastClickTime: 0, isActive: false },
    player2: { clicks: 0, power: 1, key: 'P', keyCode: 80, lastClickTime: 0, isActive: false }
};

// DOM elements
const elements = {
    progressBar: document.getElementById('progress-bar'),
    clicksDisplay: document.getElementById('clicks'),
    levelDisplay: document.getElementById('level'),
    targetDisplay: document.getElementById('target'),
    coinsDisplay: document.getElementById('coins'),
    clickPowerDisplay: document.getElementById('click-power'),
    player1Area: document.getElementById('player1-area'),
    player2Area: document.getElementById('player2-area'),
    player1Clicks: document.getElementById('player1-clicks'),
    player2Clicks: document.getElementById('player2-clicks'),
    player1Power: document.getElementById('player1-power'),
    player2Power: document.getElementById('player2-power'),
    player1Contribution: document.getElementById('player1-contribution'),
    player2Contribution: document.getElementById('player2-contribution'),
    player1ContributionBar: document.getElementById('player1-contribution-bar'),
    player2ContributionBar: document.getElementById('player2-contribution-bar'),
    teamBonus: document.getElementById('team-bonus'),
    upgradesContainer: document.getElementById('upgrades-container'),
    achievementsContainer: document.getElementById('achievements-container'),
    notification: document.getElementById('notification'),
    soloModeButton: document.getElementById('solo-mode-button'),
    coopModeButton: document.getElementById('coop-mode-button'),
    playerStats: document.querySelector('.player-stats'),
    clickAreas: document.querySelector('.click-areas')
};

// Upgrades e achievements permanecem iguais ao seu código original
const upgrades = [
    { id: 'click-power', name: 'Poder de Clique', description: 'Aumenta o valor de cada clique', basePrice: 10, level: 0, maxLevel: 10, effect: level => level + 1, priceIncrease: 1.5, forPlayer: null },
    { id: 'auto-clicker', name: 'Auto Clicker', description: 'Clica automaticamente a cada segundo', basePrice: 50, level: 0, maxLevel: 5, effect: level => level, priceIncrease: 2, forPlayer: null },
    { id: 'coin-boost', name: 'Boost de Moedas', description: 'Aumenta as moedas ganhas por nível', basePrice: 30, level: 0, maxLevel: 5, effect: level => 1 + level * 0.2, priceIncrease: 1.8, forPlayer: null },
    { id: 'progress-boost', name: 'Boost de Progresso', description: 'Reduz o aumento da dificuldade entre níveis', basePrice: 100, level: 0, maxLevel: 3, effect: level => 1.25 - (level * 0.05), priceIncrease: 2.5, forPlayer: null },
    { id: 'player1-power', name: 'Poder Jogador 1', description: 'Aumenta o poder de clique do Jogador 1', basePrice: 15, level: 0, maxLevel: 5, effect: level => level + 1, priceIncrease: 1.6, forPlayer: 'player1', coop: true },
    { id: 'player2-power', name: 'Poder Jogador 2', description: 'Aumenta o poder de clique do Jogador 2', basePrice: 15, level: 0, maxLevel: 5, effect: level => level + 1, priceIncrease: 1.6, forPlayer: 'player2', coop: true },
    { id: 'synergy-boost', name: 'Sinergia de Equipe', description: 'Aumenta o bônus quando ambos jogadores estão ativos', basePrice: 75, level: 0, maxLevel: 3, effect: level => 0.2 + (level * 0.1), priceIncrease: 2, forPlayer: null, coop: true, synergy: true }
];

const achievements = [
    { id: 'first-level', name: 'Primeiro Nível', description: 'Complete o nível 1', unlocked: false, requirement: () => level > 1, reward: 5 },
    { id: 'level-5', name: 'Persistente', description: 'Alcance o nível 5', unlocked: false, requirement: () => level >= 5, reward: 20 },
    { id: 'level-10', name: 'Dedicado', description: 'Alcance o nível 10', unlocked: false, requirement: () => level >= 10, reward: 50 },
    { id: 'level-25', name: 'Mestre Clicker', description: 'Alcance o nível 25', unlocked: false, requirement: () => level >= 25, reward: 150 },
    { id: 'coins-100', name: 'Colecionador', description: 'Acumule 100 moedas', unlocked: false, requirement: () => coins >= 100, reward: 10 },
    { id: 'upgrade-max', name: 'Aprimorado', description: 'Maximize um upgrade', unlocked: false, requirement: () => upgrades.some(upgrade => upgrade.level >= upgrade.maxLevel), reward: 75 },
    { id: 'team-balance', name: 'Equilíbrio de Equipe', description: 'Tenha contribuição balanceada entre jogadores (45-55%)', unlocked: false, requirement: () => {
        const total = players.player1.clicks + players.player2.clicks;
        if (total === 0) return false;
        const p1Percent = (players.player1.clicks / total) * 100;
        return p1Percent >= 45 && p1Percent <= 55;
    }, reward: 30, coop: true },
    { id: 'team-synergy', name: 'Sinergia Perfeita', description: 'Complete um nível com ambos jogadores contribuindo', unlocked: false, requirement: () => players.player1.isActive && players.player2.isActive, reward: 40, coop: true }
];

function initGame() {
    updateDisplays();
    renderUpgrades();
    renderAchievements();
    updateModeDisplay();

    elements.player1Area.addEventListener('click', (e) => {
        e.stopPropagation();
        playerClick('player1', e);
    });

    elements.player2Area.addEventListener('click', (e) => {
        e.stopPropagation();
        playerClick('player2', e);
    });

    document.addEventListener('keydown', (e) => {
        if (e.keyCode === players.player1.keyCode) playerClick('player1');
        else if (e.keyCode === players.player2.keyCode) playerClick('player2');
    });

    elements.soloModeButton.addEventListener('click', () => {
        isCoopMode = false;
        updateModeDisplay();
    });

    elements.coopModeButton.addEventListener('click', () => {
        isCoopMode = true;
        updateModeDisplay();
    });

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    setInterval(runAutoClicker, 1000);
    setInterval(checkAchievements, 2000);
    setInterval(checkPlayerActivity, 5000);
}

function playerClick(playerKey, event) {
    if (!isCoopMode && playerKey === 'player2') return;

    const player = players[playerKey];
    player.lastClickTime = Date.now();
    player.isActive = true;

    const clickValue = player.power;
    player.clicks += clickValue;
    clicks += clickValue;

    if (isCoopMode && players.player1.isActive && players.player2.isActive) {
        const synergyBoost = getUpgradeEffect('synergy-boost');
        clicks += clickValue * synergyBoost;
    }

    if (event) {
        createClickEffect(event, playerKey);
    } else {
        const area = elements[`${playerKey}Area`];
        const rect = area.getBoundingClientRect();
        createClickEffect({
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            target: area
        }, playerKey);
    }

    updateProgressBar();
    updatePlayerContributions();
    updateDisplays();

    if (clicks >= targetClicks) levelUp();
}

function createClickEffect(event, playerKey) {
    const effect = document.createElement('div');
    effect.classList.add('click-effect');
    
    const rect = event.target.getBoundingClientRect();
    effect.style.left = `${event.clientX - rect.left}px`;
    effect.style.top = `${event.clientY - rect.top}px`;
    effect.style.width = '50px';
    effect.style.height = '50px';
    effect.style.backgroundColor = playerKey === 'player1' ? '#2196F3' : '#FF5722';

    event.target.appendChild(effect);
    setTimeout(() => effect.remove(), 500);
}

function updateProgressBar() {
    const progress = (clicks / targetClicks) * 100;
    elements.progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
}

function updatePlayerContributions() {
    const totalClicks = players.player1.clicks + players.player2.clicks;
    if (totalClicks === 0) return;

    const p1Percent = Math.round((players.player1.clicks / totalClicks) * 100);
    const p2Percent = 100 - p1Percent;

    elements.player1Contribution.textContent = p1Percent + '%';
    elements.player2Contribution.textContent = p2Percent + '%';
    elements.player1ContributionBar.style.width = p1Percent + '%';
    elements.player2ContributionBar.style.width = p2Percent + '%';
}

function updateDisplays() {
    elements.clicksDisplay.textContent = Math.floor(clicks);
    elements.levelDisplay.textContent = level;
    elements.targetDisplay.textContent = Math.ceil(targetClicks);
    elements.coinsDisplay.textContent = Math.floor(coins);
    elements.clickPowerDisplay.textContent = clickPower;
    elements.player1Clicks.textContent = Math.floor(players.player1.clicks);
    elements.player2Clicks.textContent = Math.floor(players.player2.clicks);
    elements.player1Power.textContent = players.player1.power;
    elements.player2Power.textContent = players.player2.power;

    if (isCoopMode) {
        const synergyBoost = getUpgradeEffect('synergy-boost');
        elements.teamBonus.textContent = `Bônus de Equipe: +${Math.round(synergyBoost * 100)}% de poder quando ambos jogadores estão ativos!`;
    }
}

function updateModeDisplay() {
    if (isCoopMode) {
        elements.soloModeButton.classList.remove('active');
        elements.coopModeButton.classList.add('active');
        elements.teamBonus.style.display = 'block';
        elements.player2Area.style.opacity = '1';
        elements.player2Area.style.pointerEvents = 'auto';
        targetClicks = 20;
    } else {
        elements.soloModeButton.classList.add('active');
        elements.coopModeButton.classList.remove('active');
        elements.teamBonus.style.display = 'none';
        elements.player2Area.style.opacity = '0.5';
        elements.player2Area.style.pointerEvents = 'none';
        targetClicks = 10;
    }
    updateDisplays();
    renderUpgrades();
    renderAchievements();
    updateProgressBar(); // Garante que a barra reflita o modo
}

function levelUp() {
    level++;
    clicks = 0; // Resetar os cliques
    
    const progressBoost = getUpgradeEffect('progress-boost');
    targetClicks = Math.ceil(targetClicks * progressBoost);
    
    const coinBoost = getUpgradeEffect('coin-boost');
    const coinsAwarded = Math.floor(level * 5 * coinBoost);
    coins += coinsAwarded;
    
    players.player1.clicks = 0;
    players.player2.clicks = 0;

    showNotification(`Nível ${level} alcançado! +${coinsAwarded} moedas!`);
    elements.levelDisplay.classList.add('level-up');
    setTimeout(() => elements.levelDisplay.classList.remove('level-up'), 1000);

    updateProgressBar(); // Forçar a barra a reiniciar
    updatePlayerContributions();
    updateDisplays();
    checkAchievements();
}

function getUpgradeEffect(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    return upgrade ? upgrade.effect(upgrade.level) : 0;
}

function runAutoClicker() {
    const autoClickLevel = getUpgradeEffect('auto-clicker');
    if (autoClickLevel <= 0) return;

    if (isCoopMode) {
        const clicksPerPlayer = autoClickLevel / 2;
        players.player1.clicks += clicksPerPlayer * players.player1.power;
        players.player2.clicks += clicksPerPlayer * players.player2.power;
        clicks += autoClickLevel * ((players.player1.power + players.player2.power) / 2);
    } else {
        players.player1.clicks += autoClickLevel * players.player1.power;
        clicks += autoClickLevel * players.player1.power;
    }

    updateProgressBar();
    updatePlayerContributions();
    updateDisplays();
    if (clicks >= targetClicks) levelUp();
}

function checkAchievements() {
    let newlyUnlocked = false;
    achievements.forEach(achievement => {
        if (!achievement.unlocked && (!achievement.coop || isCoopMode) && achievement.requirement()) {
            achievement.unlocked = true;
            coins += achievement.reward;
            showNotification(`Objetivo Desbloqueado: ${achievement.name}! +${achievement.reward} moedas!`);
            newlyUnlocked = true;
        }
    });
    if (newlyUnlocked) {
        renderAchievements();
        updateDisplays();
    }
}

function checkPlayerActivity() {
    const now = Date.now();
    players.player1.isActive = now - players.player1.lastClickTime <= 15000;
    players.player2.isActive = now - players.player2.lastClickTime <= 15000;
}

function calculateUpgradePrice(upgrade) {
    return Math.floor(upgrade.basePrice * Math.pow(upgrade.priceIncrease, upgrade.level));
}

function buyUpgrade(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return false;

    const price = calculateUpgradePrice(upgrade);
    if (coins < price) return false;

    coins -= price;
    upgrade.level++;

    if (upgrade.id === 'click-power') clickPower = upgrade.effect(upgrade.level);
    else if (upgrade.id === 'player1-power') players.player1.power = upgrade.effect(upgrade.level);
    else if (upgrade.id === 'player2-power') players.player2.power = upgrade.effect(upgrade.level);

    showNotification(`Upgrade comprado: ${upgrade.name} nível ${upgrade.level}!`);
    updateDisplays();
    renderUpgrades();
    checkAchievements();
    return true;
}

function renderUpgrades() {
    elements.upgradesContainer.innerHTML = '';
    upgrades.forEach(upgrade => {
        if (!isCoopMode && upgrade.coop) return;

        const price = calculateUpgradePrice(upgrade);
        const canAfford = coins >= price;
        const maxLevel = upgrade.level >= upgrade.maxLevel;

        const upgradeElement = document.createElement('div');
        upgradeElement.className = `upgrade-item ${!canAfford || maxLevel ? 'disabled' : ''} ${upgrade.synergy ? 'synergy-upgrade' : ''}`;
        upgradeElement.innerHTML = `
            <div class="upgrade-info">
                <div>${upgrade.name}</div>
                <div class="upgrade-level">Nível ${upgrade.level}/${upgrade.maxLevel}</div>
                <div>${upgrade.description}</div>
            </div>
            <button class="buy-button" ${!canAfford || maxLevel ? 'disabled' : ''}>
                ${maxLevel ? 'MAX' : `${price} moedas`}
            </button>
        `;

        if (!maxLevel && canAfford) {
            upgradeElement.querySelector('.buy-button').addEventListener('click', () => buyUpgrade(upgrade.id));
        }
        elements.upgradesContainer.appendChild(upgradeElement);
    });
}

function renderAchievements() {
    elements.achievementsContainer.innerHTML = '';
    achievements.forEach(achievement => {
        if (!isCoopMode && achievement.coop) return;

        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        achievementElement.innerHTML = `
            <div class="achievement-info">
                <div>${achievement.name}</div>
                <div>${achievement.description}</div>
                ${achievement.unlocked ? `<div>Recompensa: ${achievement.reward} moedas</div>` : ''}
            </div>
        `;
        elements.achievementsContainer.appendChild(achievementElement);
    });
}

function showNotification(message) {
    elements.notification.textContent = message;
    elements.notification.classList.add('show');
    setTimeout(() => elements.notification.classList.remove('show'), 3000);
}

initGame();