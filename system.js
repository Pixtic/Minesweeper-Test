document.addEventListener('DOMContentLoaded', function() {
    const board = document.querySelector('.board');
    const startBtn = document.getElementById('startBtn');
    const modeBtn = document.getElementById('modeBtn');
    const difficultySelect = document.getElementById('difficultySelect');

    let grid = [];
    let cellsList = [];
    let totalMines = 10;
    let rows = 8;
    let cols = 8;
    let revealedCount = 0;
    let isFlagMode = false;

    const difficulties = {
        easy: { rows: 8, cols: 8, mines: 10 },
        medium: { rows: 16, cols: 16, mines: 40 },
        hard: { rows: 16, cols: 30, mines: 99 }
    };

    function getNeighbor(row, col) {
        if (grid[row] && grid[row][col]) {
            return grid[row][col];
        }
        return null;
    }

    function countAdjacentMines(row, col) {
        let mineCount = 0;
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {
                const targetRow = row + rowOffset;
                const targetCol = col + colOffset;
                
                const neighbor = getNeighbor(targetRow, targetCol);
                if (neighbor && neighbor.dataset.isMine === "true") {
                    mineCount++;
                }
            }
        }
        return mineCount;
    }

    function checkWin() {
        const totalSafeCells = cellsList.length - totalMines;
        if (revealedCount === totalSafeCells) {
            setTimeout(function() {
                alert("Congratulations! You won!");
                const currentMode = difficultySelect.value;
                initGame(difficulties[currentMode].rows, difficulties[currentMode].cols, difficulties[currentMode].mines);
            }, 300);
        }
    }

    function toggleFlag(cellButton) {
        if (cellButton.classList.contains('cell_revealed')){
            return; 
        }
        cellButton.classList.toggle('cell_flag');
        cellButton.innerText = cellButton.classList.contains('cell_flag') ? "🚩" : "";
    }

    function revealCell(cellButton) {
        if (cellButton.classList.contains('cell_revealed') || cellButton.classList.contains('cell_flag')) {
            return;
        }

        cellButton.classList.remove('cell');
        cellButton.classList.add('cell_revealed');
        revealedCount++;

        if (cellButton.dataset.isMine === "true") {
            cellButton.innerText = "💣";
            cellButton.style.backgroundColor = "oklch(55% 0.22 25)";
            
            cellsList.forEach(c => {
                if (c.dataset.isMine === "true") {
                    c.innerText = "💣";
                    c.classList.remove('cell');
                    c.classList.add('cell_revealed');
                }
            });

            setTimeout(function() {
                alert("Game Over! Try again.");
                const currentMode = difficultySelect.value;
                initGame(difficulties[currentMode].rows, difficulties[currentMode].cols, difficulties[currentMode].mines); 
            }, 1000);
            return;
        }

        const currentRow = parseInt(cellButton.dataset.row);
        const currentCol = parseInt(cellButton.dataset.col);
        const totalMinesNearby = countAdjacentMines(currentRow, currentCol);

        if (totalMinesNearby > 0) {
            cellButton.innerText = totalMinesNearby;
            if (totalMinesNearby === 1) cellButton.style.color = "oklch(70% 0.15 220)";
            else if (totalMinesNearby === 2) cellButton.style.color = "oklch(75% 0.15 140)";
            else if (totalMinesNearby === 3) cellButton.style.color = "oklch(65% 0.2 25)";
            else if (totalMinesNearby >= 4) cellButton.style.color = "oklch(60% 0.15 290)";
        } else {
            cellButton.innerText = "";

            for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
                for (let colOffset = -1; colOffset <= 1; colOffset++) {
                    const targetRow = currentRow + rowOffset;
                    const targetCol = currentCol + colOffset;

                    const neighbor = getNeighbor(targetRow, targetCol);
                    if (neighbor) {
                        revealCell(neighbor);
                    }
                }
            }
        }

        checkWin();
    }

    function chordCell(cellButton) {
        const currentRow = parseInt(cellButton.dataset.row);
        const currentCol = parseInt(cellButton.dataset.col);
        const targetMineCount = countAdjacentMines(currentRow, currentCol);
        
        let flagCount = 0;
        const neighbors = [];

        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {
                const targetRow = currentRow + rowOffset;
                const targetCol = currentCol + colOffset;
                
                const neighbor = getNeighbor(targetRow, targetCol);
                if (neighbor) {
                    neighbors.push(neighbor);
                    if (neighbor.classList.contains('cell_flag')) {
                        flagCount++;
                    }
                }
            }
        }

        if (flagCount === targetMineCount) {
            neighbors.forEach(function(neighbor) {
                if (!neighbor.classList.contains('cell_flag') && !neighbor.classList.contains('cell_revealed')) {
                    revealCell(neighbor);
                }
            });
        }
    }

    function initGame(customRows, customCols, customMines) {
        board.innerHTML = "";
        grid = [];
        cellsList = [];
        revealedCount = 0;
        
        rows = parseInt(customRows);
        cols = parseInt(customCols);
        totalMines = Math.min(parseInt(customMines), (rows * cols) - 1);

        board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        for (let r = 0; r < rows; r++) {
            grid[r] = [];
            for (let c = 0; c < cols; c++) {
                const cellButton = document.createElement('button');
                cellButton.classList.add('cell');
                
                cellButton.dataset.row = r;
                cellButton.dataset.col = c;
                cellButton.dataset.isMine = "false";
                
                cellButton.addEventListener('contextmenu', function(event){
                    event.preventDefault(); 
                    toggleFlag(cellButton);
                });

                cellButton.addEventListener('click', function(){
                    if (isFlagMode) {
                        toggleFlag(cellButton);
                    } else {
                        if (cellButton.classList.contains('cell_revealed')) {
                            chordCell(cellButton);
                        } else {
                            revealCell(cellButton);
                        }
                    }
                });

                board.appendChild(cellButton);
                
                grid[r][c] = cellButton; 
                cellsList.push(cellButton);
            }
        }

        let minesPlaced = 0;
        while (minesPlaced < totalMines) {
            const randomIndex = Math.floor(Math.random() * cellsList.length);
            const targetCell = cellsList[randomIndex];
            if (targetCell.dataset.isMine === "false") {
                targetCell.dataset.isMine = "true";
                minesPlaced++;
            }
        }
    }

    difficultySelect.addEventListener('change', function() {
        const mode = difficultySelect.value;
        initGame(difficulties[mode].rows, difficulties[mode].cols, difficulties[mode].mines);
    });

    if (modeBtn) {
        modeBtn.addEventListener('click', function() {
            isFlagMode = !isFlagMode;
            modeBtn.innerText = isFlagMode ? "Mode: Flag" : "Mode: Reveal";
        });
    }

    startBtn.addEventListener('click', function() {
        const mode = difficultySelect.value;
        initGame(difficulties[mode].rows, difficulties[mode].cols, difficulties[mode].mines);
    });

    initGame(8, 8, 10);
});