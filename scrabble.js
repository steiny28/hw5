/*
File: styles.css 
GUI Assignment: Scrabble Game 
Nicole Ramirez, UMass Lowell Computer Science, nicole_ramirez@student.uml.edu 
Copyright (c) 2024 by Nicole Ramirez. All rights reserved. May be freely copied or 
excerpted for educational purposes with credit to the author. 
*/
$(function() {
    let score = 0;
    let totalScore = 0;
    let tiles = [];
    const tileImagesPath = 'Scrabble_Tiles/';
    const maxDeals = 13;
    const maxTiles = 100;
    let dealCount = 0;
    let tilesDealt = 0;

    const boardImages = {
        'blank': 'boardBlankTile.jpg',
        'double-word': 'boardDoubleTile.jpg',
        'double-letter': 'doubleLetterBoard.png'
    };

    const boardState = Array(9).fill(null); // To keep track of the board state

    function initializeGame() {
        createTiles();
        renderTileRack();
        renderBoard();
        makeDraggable();
        makeDroppable();
        updateRemainingTiles();
    }

    function createTiles() {
        tiles = [];
        for (const letter in ScrabbleTiles) {
            for (let i = 0; i < ScrabbleTiles[letter]["original-distribution"]; i++) {
                tiles.push(letter);
            }
        }
    }

    function renderTileRack() {
        const rack = $('#tile-rack');
        rack.empty();
        for (let i = 0; i < 7; i++) {
            if (tilesDealt >= maxTiles) break;
            const tileLetter = getRandomTile();
            const tile = $('<div></div>').addClass('tile').append(`<img src="${tileImagesPath}Scrabble_Tile_${tileLetter === '_' ? 'Blank' : tileLetter}.jpg" alt="${tileLetter}" />`);
            tile.data('letter', tileLetter);
            rack.append(tile);
            tilesDealt++;
        }
    }

    function renderBoard() {
        $('#letter-overlay').empty();
        const boardSpaces = [
            'blank', 'double-word', 'blank', 'double-letter', 'blank', 'double-letter', 'blank', 'double-word', 'blank'
        ];
        boardSpaces.forEach((space, index) => {
            const boardSpace = $('<div></div>').addClass(`board-space ${space}`).append(`<img src="${boardImages[space]}" alt="${space}" />`);
            boardSpace.data('index', index); // Store the index of the board space
            $('#letter-overlay').append(boardSpace);
        });
    }

    function getRandomTile() {
        const randomIndex = Math.floor(Math.random() * tiles.length);
        const tile = tiles[randomIndex];
        tiles.splice(randomIndex, 1);
        return tile;
    }

    function makeDraggable() {
        $('.tile').draggable({
            revert: 'invalid'
        });
    }

    function makeDroppable() {
        $('#letter-overlay .board-space').droppable({
            accept: '.tile',
            drop: function(event, ui) {
                const tile = ui.draggable;
                const letter = tile.data('letter');
                const img = tile.find('img').clone().css({ width: '100%', height: '100%' });
                $(this).empty().append(img);
                tile.remove();
                const boardIndex = $(this).data('index');
                boardState[boardIndex] = letter; // Update the board state
            }
        });
    }

    function calculateScore() {
        let currentScore = 0;
        let doubleWordScore = 1;

        boardState.forEach((letter, index) => {
            if (letter) {
                const spaceClass = $(`#letter-overlay .board-space:eq(${index})`).attr('class').split(' ')[1]; // Get the space type (blank, double-word, etc.)
                let letterScore = ScrabbleTiles[letter]["value"];

                if (spaceClass === 'double-letter') {
                    letterScore *= 2;
                }

                if (spaceClass === 'double-word') {
                    doubleWordScore *= 2;
                }

                currentScore += letterScore;
            }
        });

        // Apply double word score multiplier
        currentScore *= doubleWordScore;

        score = currentScore;
        $('#score').text('Score: ' + score);
    }

    function updateRemainingTiles() {
        const remainingTiles = maxTiles - tilesDealt;
        $('#remaining-tiles').text('Remaining Tiles: ' + remainingTiles);
    }

    $('#deal-tiles').click(function() {
        dealCount++;
        if (dealCount <= maxDeals && tilesDealt < maxTiles) {
            renderTileRack();
            makeDraggable();
            updateRemainingTiles();
        }
        if (dealCount >= maxDeals) {
            $(this).prop('disabled', true);
            alert('You have reached the maximum number of deals.');
        }
    });

    $('#submit-word').click(function() {
        calculateScore();
        alert('Word submitted: ' + score + ' points');
        totalScore += score;
        $('#total-score').text('Total Score: ' + totalScore);
        score = 0;
        $('#score').text('Score: 0');

        // Clear the tile images from the board spaces but keep the board
        $('#letter-overlay .board-space').each(function() {
            $(this).find('img').not(':first').remove();
        });
        
        boardState.fill(null); // Clear the board state
    });

    $('#new-game').click(function() {
        score = 0;
        totalScore = 0;
        tilesDealt = 0;
        dealCount = 0;
        $('#deal-tiles').prop('disabled', false);
        initializeGame();
        $('#total-score').text('Total Score: 0');
        boardState.fill(null); // Clear the board state
    });

    initializeGame();
});
