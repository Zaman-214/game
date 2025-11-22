// app.js - Tic Tac Toe logic (two players local). Copy to a separate file and include in HTML with defer.
(() => {
  const WIN_COMBOS = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diagonals
  ];

  // DOM
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const turnEl = document.getElementById('turn');
  const restartBtn = document.getElementById('restartBtn');
  const resetScoresBtn = document.getElementById('resetScoresBtn');
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');

  // State
  let board;        // array of 9: 'X' | 'O' | ''
  let current;      // 'X' or 'O'
  let running = false;
  let scores = { X:0, O:0 };

  // Initialize UI
  function createCells(){
    boardEl.innerHTML = ''; // remove children
    for(let i=0;i<9;i++){
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.setAttribute('role','gridcell');
      btn.setAttribute('aria-label', `Cell ${i+1}`);
      btn.dataset.index = i;
      btn.type = 'button';
      btn.addEventListener('click', onCellClick);
      btn.addEventListener('touchstart', e => e.preventDefault(), {passive:false});
      boardEl.appendChild(btn);
    }
  }

  // Load scores from localStorage
  function loadScores(){
    try{
      const raw = localStorage.getItem('tictactoe_scores');
      if(raw) scores = JSON.parse(raw);
    }catch(e){ scores = {X:0,O:0} }
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
  }

  function saveScores(){
    try{ localStorage.setItem('tictactoe_scores', JSON.stringify(scores)) }catch(e){}
  }

  function startNewRound(firstPlayer = null){
    board = Array(9).fill('');
    current = firstPlayer || 'X';
    running = true;
    turnEl.textContent = current;
    statusEl.classList.remove('win-state');
    // update DOM cells
    const cells = boardEl.querySelectorAll('.cell');
    cells.forEach(c => {
      c.textContent = '';
      c.classList.remove('x','o','disabled','win');
      c.disabled = false;
    });
  }

  function endRound(result, winningIndices = []){
    running = false;
    if(result === 'draw'){
      statusEl.innerHTML = 'Draw! <strong>Restart to play again</strong>';
    } else {
      statusEl.innerHTML = `<strong>${result}</strong> wins!`;
      // animate winning cells
      winningIndices.forEach(i => {
        const c = boardEl.querySelector(`.cell[data-index="${i}"]`);
        if(c) c.classList.add('win');
      });
      // update scores
      scores[result] = (scores[result] || 0) + 1;
      saveScores();
      scoreXEl.textContent = scores.X;
      scoreOEl.textContent = scores.O;
    }
    turnEl.textContent = '—';
  }

  function checkWinner(){
    for(const combo of WIN_COMBOS){
      const [a,b,c] = combo;
      if(board[a] && board[a] === board[b] && board[a] === board[c]){
        return { winner: board[a], combo };
      }
    }
    // draw?
    if(board.every(cell => cell !== '')) return { winner: 'draw' };
    return null;
  }

  // Event handlers
  function onCellClick(e){
    if(!running) return;
    const idx = Number(this.dataset.index);
    if(board[idx]) return;
    makeMove(idx, current);
  }

  function makeMove(index, player){
    board[index] = player;
    const cell = boardEl.querySelector(`.cell[data-index="${index}"]`);
    if(cell){
      cell.textContent = player;
      cell.classList.add(player === 'X' ? 'x' : 'o');
      cell.classList.add('disabled');
      cell.disabled = true;
    }

    const result = checkWinner();
    if(result){
      if(result.winner === 'draw'){
        endRound('draw');
      } else {
        endRound(result.winner, result.combo);
      }
      return;
    }

    // switch turn
    current = current === 'X' ? 'O' : 'X';
    turnEl.textContent = current;
    statusEl.textContent = `Turn: ${current}`;
  }

  // Buttons
  restartBtn.addEventListener('click', () => startNewRound(current === 'X' ? 'O' : 'X'));
  resetScoresBtn.addEventListener('click', () => {
    if(confirm('Reset scores to zero?')){
      scores = { X:0, O:0 };
      saveScores();
      scoreXEl.textContent = 0;
      scoreOEl.textContent = 0;
    }
  });

  // Keyboard accessibility: number keys 1-9 map to cells
  window.addEventListener('keydown', (e) => {
    if(!running) return;
    // map digits 1-9
    if(e.key >= '1' && e.key <= '9'){
      const idx = Number(e.key)-1;
      const cell = boardEl.querySelector(`.cell[data-index="${idx}"]`);
      if(cell && !board[idx]) cell.click();
    }
    // space to restart when not running
    if(e.key === ' ' && !running){
      startNewRound();
      e.preventDefault();
    }
  });

  // Initialize app
  function init(){
    createCells();
    loadScores();
    startNewRound('X');
    statusEl.textContent = `Turn: ${current}`;
  }

  // run
  init();
})();
