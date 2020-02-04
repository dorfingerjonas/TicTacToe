let isXTurn = true;
let gameOver = false;

window.addEventListener('load', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyAYGi02IDN0pj8j6WpyCu9zPlMMNldFbEk",
        authDomain: "tictactoe-b5f38.firebaseapp.com",
        databaseURL: "https://tictactoe-b5f38.firebaseio.com",
        projectId: "tictactoe-b5f38",
        storageBucket: "tictactoe-b5f38.appspot.com",
        messagingSenderId: "1067628874201",
        appId: "1:1067628874201:web:eb678a8a3f3e01761231c8",
        measurementId: "G-7GNWN8HBJ5"
    };
    
    firebase.initializeApp(firebaseConfig);

    const resetGameBtn = document.getElementById('resetGameBtn');
    const continueBtn = document.getElementById('continueBtn');
    const signupScreen = document.getElementById('signupScreen');
    const gameScreen = document.getElementById('gameScreen');
    const playersToChallenge = document.getElementById('playersToChallenge');

    buildGrid();
    addEventListenersToCells();

    resetGameBtn.addEventListener('click', resetGame);
    continueBtn.addEventListener('click', login);
    window.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && !signupScreen.className.includes('hide')) {
            login();
        }
    });

    firebase.database().ref('games/waitingPlayers').on('value', (snapshot) => {
        console.log('changes detected');
        console.log(snapshot.val());

        while (playersToChallenge.firstChild) {
            playersToChallenge.removeChild(playersToChallenge.firstChild);
        }

        if (snapshot.val() !== null) {
            for (const index in snapshot.val()) {
                if (snapshot.val()[index].username !== sessionStorage.getItem('username')) {
                    playersToChallenge.appendChild(createWaitingPlayer(snapshot.val()[index]));
                }
            }
        }
        
        if (playersToChallenge.childNodes.length === 0) {
            const text = document.createElement('p');
            text.textContent = 'No players are waiting for game.'
            playersToChallenge.appendChild(text);
        }
    });

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            firebase.database().ref('games/waitingPlayers/' + user.uid).set({
                username: sessionStorage.getItem('username'),
                uid: user.uid
            });

            firebase.database().ref('games/waitingPlayers/' + user.uid + '/gameRequest').on('value', (snapshot) => {
                if (snapshot.val() !== null) {
                    const requestWindow = document.getElementById('requestWindow');
                    const requestText = document.getElementById('requestText');
                    const acceptRequest = document.getElementById('acceptRequest');
                    const declineRequest = document.getElementById('declineRequest');
                    const request = [];

                    for (const index in snapshot.val()) {
                        request.push(snapshot.val()[index]);    
                    }

                    firebase.database().ref('games/waitingPlayers/' + request[0]).once('value').then((snapshot2) => {
                        requestText.textContent = `${snapshot2.val().username} wants to play with you!`;
                        requestWindow.classList.remove('hide');
                        sessionStorage.setItem('usernameEnime', snapshot2.val().username);
                        sessionStorage.setItem('uidEnime', snapshot2.val().uid);

                        setTimeout(() => {
                            requestWindow.style.opacity = 1;
                            requestWindow.style.transform = 'scale(1)';
                        }, 10);
                    });

                    declineRequest.addEventListener('click', () => {
                        requestWindow.style.opacity = 0;
                        requestWindow.style.transform = 'scale(.6)';

                        setTimeout(() => {
                            requestWindow.classList.add('hide');
                        }, 300);

                        firebase.database().ref('games/waitingPlayers/' + user.uid + '/gameRequest').remove();
                        firebase.database().ref('games/waitingPlayers/' + user.uid + '/newGame').remove();
                    });

                    acceptRequest.addEventListener('click', () => {
                        firebase.database().ref('games/playing/' + new Date().getTime()).set({
                            player1: {username: sessionStorage.getItem('username'), symbol: 'cross', uid: firebase.auth().currentUser.uid},
                            player2: {username: sessionStorage.getItem('usernameEnime'), symbol: 'circle', uid: sessionStorage.getItem('uidEnime')},
                            nextTurn: {isXTurn: true, clickedCell: -1}
                        });

                        firebase.database().ref(`games/waitingPlayers/${sessionStorage.getItem('uidEnime')}`).update({
                            newGame: true
                        });

                        signupScreen.classList.add('hide');
                        gameScreen.classList.remove('hide');

                        declineRequest.click();
                    });
                }
            });

            firebase.database().ref('games/waitingPlayers/' + user.uid + '/newGame').on('value', (snapshot) => {
                if (snapshot.val() !== null) {
                    signupScreen.classList.add('hide');
                    gameScreen.classList.remove('hide');
                }
            });

            signupScreen.classList.add('hide');
            signupScreen.classList.remove('hide');
            playersToChallenge.classList.remove('disable');
        } else {
            signupScreen.classList.add('hide');
            signupScreen.classList.remove('hide');
            sessionStorage.removeItem('username');
        }
    });
});

function login() {
    const username = document.getElementById('usernameInput');

    if (username.value === '' || username.value === ' ') {
        username.classList.add('errorInput');
    } else {
        username.classList.remove('errorInput');
        sessionStorage.setItem('username', username.value);
        firebase.auth().signInAnonymously();
    }
}

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

function createWaitingPlayer(playerData) {
    const player = document.createElement('div');
    const name = document.createElement('p');

    name.textContent = playerData.username;

    player.addEventListener('click', () => {
        console.log(playerData.username + ' is selected');

        firebase.database().ref('games/waitingPlayers/' + playerData.uid + '/gameRequest').set({
            uid: firebase.auth().currentUser.uid
        });
    });

    player.classList.add('player');
    player.appendChild(name);

    return player;
}