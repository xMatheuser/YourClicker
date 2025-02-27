const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let gameState = {
  clicks: 0,
  level: 1,
  targetClicks: 10,
  coins: 0,
  clickPower: 1,
  players: [],
  activePlayerIndex: -1,
  teamLevel: 1,
  teamGoal: 5,
};

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send the current game state to the new client
  socket.emit('gameState', gameState);
  
  // Handle player addition
  socket.on('addPlayer', (player) => {
    console.log('Adding player:', player);
    gameState.players.push(player);
    io.emit('gameState', gameState);
    console.log('Updated game state:', gameState);
  });

  // Handle player switch
  socket.on('switchPlayer', () => {
    gameState.activePlayerIndex = (gameState.activePlayerIndex + 1) % gameState.players.length;
    io.emit('gameState', gameState);
  });

  // Handle clicks
  socket.on('click', (clickValue) => {
    gameState.clicks += clickValue;
    if (gameState.clicks >= gameState.targetClicks) {
      gameState.level++;
      gameState.clicks = 0;
      gameState.targetClicks = Math.ceil(gameState.targetClicks * 1.25);
    }
    io.emit('gameState', gameState);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file when the root URL is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = server;
