window.addEventListener('load', () => {
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

});function addEventListenersToCells() {
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
                    } else {
                        drawCircle(cell);
                        symbol = 'circle';
                    }

                    isXTurn = !isXTurn;
                    cell.isUsed = true;
                    cell.symbol = symbol;

                    let areThreeInARow = checkThreeInOneRow(symbol);

                    if (areThreeInARow[0]) {
                        gameOver = true;
                        console.log(`${symbol} has won.`);
                        resultText.textContent = `${symbol} has won.`;
                    }

                    console.log(areThreeInARow);

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
}