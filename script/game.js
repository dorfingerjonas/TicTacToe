let isXTurn = true;
let gameOver = false;

window.addEventListener('load', () => {
    const resetGameBtn = document.getElementById('resetGameBtn');
    const backBtn = document.getElementById('backBtn');

    buildGrid();
    addEventListenersToCells();

    resetGameBtn.addEventListener('click', resetGame);
    backBtn.addEventListener('click', back);
});

function buildGrid() {
    const wrapper = document.getElementById('gameWindow');
    let row = document.createElement('div');

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');

        cell.setAttribute('id', `cell${i+1}`);
        cell.setAttribute('class', `cell`);
        row.appendChild(cell);

        if ((i+1) % 3 === 0) {
            row.classList.add('row');
            wrapper.appendChild(row);
            row = document.createElement('div');
        }
    }
}

function addEventListenersToCells() {
    const resultText = document.getElementById('resultText');

    for (let i = 0; i < 9; i++) {
        const cell = document.getElementById(`cell${i+1}`);

        cell.addEventListener('click', () => {
            if (!gameOver) {
                if (!cell.isUsed) {
                    let symbol;

                    if (isXTurn) {
                        drawCross(cell);
                        symbol = 'cross';
                        resultText.textContent = "circle's turn";
                    } else {
                        drawCircle(cell);
                        symbol = 'circle';
                        resultText.textContent = "cross' turn";
                    }

                    isXTurn = !isXTurn;
                    cell.isUsed = true;
                    cell.symbol = symbol;

                    let areThreeInARow = checkThreeInOneRow(symbol);

                    if (areThreeInARow[0]) {
                        gameOver = true;
                        console.log(`${symbol} has won.`);
                        resultText.textContent = `${symbol} has won.`;
                        setTimeout(() => {
                            delightLosingRows(areThreeInARow);
                        }, 500);
                    }

                    setTimeout(() => {
                        if (checkIfGameIsDraw() && !gameOver) {
                            resultText.textContent = `draw, no one has won.`;
                            gameOver = true;
                        }
                    }, 550);
                } else {
                    console.log('sorry, this field is already used');
                }
            }
        });
    }
}

function drawCircle(cell) {
    const circle = document.createElement('div');
    const circleRight = document.createElement('div');
    const circleLeft = document.createElement('div');
    const wholeCircleRight = document.createElement('div');
    const wholeCircleLeft = document.createElement('div');

    circle.setAttribute('class', 'circle');
    circleRight.setAttribute('class', 'circleWrapper circleWrapperRight');
    circleLeft.setAttribute('class', 'circleWrapper circleWrapperLeft');
    wholeCircleRight.setAttribute('class', 'wholeCircle circleRight');
    wholeCircleLeft.setAttribute('class', 'wholeCircle circleLeft');

    circleRight.appendChild(wholeCircleRight);
    circleLeft.appendChild(wholeCircleLeft);
    circle.appendChild(circleRight);
    circle.appendChild(circleLeft);
    cell.appendChild(circle);
}

function drawCross(cell) {
    const lineWrapper = document.createElement('div')
    const line1 = document.createElement('div');
    const line2 = document.createElement('div');
    const animation = 'line 250ms ease-in-out 300ms forwards';

    lineWrapper.classList.add('cross');
    line1.classList.add('line1');
    line2.classList.add('line2');

    lineWrapper.appendChild(line1);
    lineWrapper.appendChild(line2);
    cell.appendChild(lineWrapper);

    line1.style.animation = animation;
    line2.style.animation = animation;
}

function getCellIndizesOfOneSymbol(symbol) {
    let result = '';

    for (let i = 0; i < 9; i++) {
        const cell = document.getElementById(`cell${i+1}`);

        if (cell.symbol === symbol) {
            result += (i + 1).toString();
        }
    }

    return result;
}

function checkThreeInOneRow(symbol) {
    const winningPosibilities = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['1', '4', '7'],
        ['2', '5', '8'],
        ['3', '6', '9'],
        ['1', '5', '9'],
        ['3', '5', '7']
    ];

    const cellIndizes = getCellIndizesOfOneSymbol(symbol);
    let contains = false;
    let winningOrder = [];

    for (const posibility of winningPosibilities) {
        if (cellIndizes.includes(posibility[0]) &&
            cellIndizes.includes(posibility[1]) &&
            cellIndizes.includes(posibility[2]) ) {
            contains = true;
            winningOrder = posibility;
        }
    }

    return [contains, winningOrder];
}

function resetGame() {
    const resultText = document.getElementById('resultText');

    for (let i = 0; i < 9; i++) {
        const cell = document.getElementById(`cell${i + 1}`);

        cell.symbol = '';
        cell.isUsed = false;
        isXTurn = true;
        gameOver = false;

        while (cell.firstChild) cell.removeChild(cell.firstChild);

        resultText.innerHTML = "cross' turn";
    }
}

function back() {
    document.getElementById('startScreen').classList.toggle('hide');
    document.getElementById('localScreen').classList.toggle('hide');
}

function checkIfGameIsDraw() {
    let isDraw = true;

    for (let i = 0; i < 9; i++) {
        const cell = document.getElementById(`cell${i + 1}`);

        if (!cell.isUsed) {
            isDraw = false;
        }
    }

    return isDraw;
}

function delightLosingRows(data) {
    for (let i = 0; i < 9; i++) {
        if (i + 1 != data[1][0] && i + 1 != data[1][1] && i + 1 != data[1][2]) {
            if (document.getElementById(`cell${i + 1}`).childNodes[0] !== undefined) {
                document.getElementById(`cell${i + 1}`).childNodes[0].classList.add('lowlight');
            }
        }
    }
}