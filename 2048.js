var ngame = (function(){
	
	var Game = function(slotSize, maxNumber) {
		// Grid Size
		this.slotSize = slotSize;

		// Winning Number
		this.maxNumber = maxNumber;

		// Flag denoting that game is complete
		this.gameComplete = false;

		// Random number that are allowed in the grid
		this.allowedNumbers = [2, 4];

		// Total number of slots in a grid
		this.totalSlots = slotSize * slotSize;

		// Map of Slot Numbers to its location (row, col)
		this.slotNumbers = {};

		// Map of location (row, col) of slots to its data
		this.slotLocations = {};

		// Total random numbers to be generated at the start of game
		this.totalRandomNumbers = 2;

		// Start preparing the game grid
		this.prepareGrid();
	}

	/**
	 * Prepares the game grid
	 *
	 * Basically it creates two essential maps
	 * 1) Mapping Slot Numbers to its location (row, col)
	 * 2) Mapping location (row, col) of slots to its data
	 */
	Game.prototype.prepareGrid = function() {
		var level = 0;
		var row = level;
		var col = 0;

		for(var i = 0; i < this.totalSlots; i++) {

			if(col == this.slotSize) {
				level++;
				row = level;
				col = 0;
			}

			this.slotNumbers[i] = row + '_' + col;

			if(this.slotLocations[row]) {
				this.slotLocations[row][col] = 0;
			}else {
				this.slotLocations[row] = {};
				this.slotLocations[row][col] = 0;
			}

			col++;
			
		}
	}

	/**
	 * Action up
	 */
	Game.prototype.up = function() {
		var swapped = false;

		/**
		 * i is row and j is col here
		 *
		 * Outer loop, loops thru second row till the last row
		 * Inner loop, loops thri each column in a row
		 *
		 * While inner loop is going on, at each interval all previous rows are compared
		 * and merged accordingly.
		 *
		 * Since its an up action, row is decreamented and validated as per game logic
		 */
		for(var i = 1; i < this.slotSize; i++) {
			for(var j = 0; j < this.slotSize; j++) {
				var k = i;
				while(k > 0) {
					// compute new value
					var newRow = k - 1;
					
					var number = this.slotLocations[newRow][j];

					// Up and down shift are same, just rows and columns are interchanged
					swapped = this.shiftUpAndDown(k, j, newRow, number, swapped);	

					// Break the loop, if the number is anything greater than 0, we need to stop as soon as on pair is merged
					if(number > 0) {
						break;
					}

					k--;
				}			
			}
		}

		/**
		 * Perform internal game actions, once user has played his move, like
		 *
		 * checking if game is over or won
		 * generater random numbers, etc
		 */
		this.performPostActions(swapped);

	}

	Game.prototype.down = function() {
		var swapped = false;

		for(var i = this.slotSize - 2; i >= 0; i--) {
			for(var j = 0; j < this.slotSize; j++) {
				var k = i;
				while(k < this.slotSize - 1) {
					// compute new value
					var newRow = k + 1;
					
					var number = this.slotLocations[newRow][j];

					// Up and down shift are same, just rows and columns are interchanged
					swapped = this.shiftUpAndDown(k, j, newRow, number, swapped);

					// Break the loop, if the number is anything greater than 0, we need to stop as soon as on pair is merged
					if(number > 0) {
						break;
					}

					k++;
				}			
			}
		}

		/**
		 * Perform internal game actions, once user has played his move, like
		 *
		 * checking if game is over or won
		 * generater random numbers, etc
		 */
		this.performPostActions(swapped);	
	}

	Game.prototype.right = function() {
		var swapped = false;

		for(var i = 0; i < this.slotSize; i++) {
			for(var j = this.slotSize - 2; j >= 0; j--) {
				var k = j;
				while(k < this.slotSize - 1) {
					// compute new value
					var newRow = k + 1;
					
					var number = this.slotLocations[i][newRow];

					// Left and right shift are same, just rows and columns are interchanged
					swapped = this.shiftRightAndLeft(i, k, newRow, number, swapped);	

					// Break the loop, if the number is anything greater than 0, we need to stop as soon as on pair is merged
					if(number > 0) {
						break;
					}

					k++;
				}			
			}
		}

		/**
		 * Perform internal game actions, once user has played his move, like
		 *
		 * checking if game is over or won
		 * generater random numbers, etc
		 */
		this.performPostActions(swapped);	
	}

	Game.prototype.left = function() {
		var swapped = false;

		for(var i = 0; i < this.slotSize; i++) {
			for(var j = 1; j < this.slotSize; j++) {
				var k = j;
				while(k > 0) {
					// compute new value
					var newRow = k - 1;
					
					var number = this.slotLocations[i][newRow];

					// Left and right shift are same, just rows and columns are interchanged
					swapped = this.shiftRightAndLeft(i, k, newRow, number, swapped);

					// Break the loop, if the number is anything greater than 0, we need to stop as soon as on pair is merged
					if(number > 0) {
						break;
					}

					k--;
				}			
			}
		}

		/**
		 * Perform internal game actions, once user has played his move, like
		 *
		 * checking if game is over or won
		 * generater random numbers, etc
		 */
		this.performPostActions(swapped);	
	}

	Game.prototype.shiftRightAndLeft = function(row, col, newRow, number, swapped) {

		// Check if the numbers in two adjacent slots are same or the next or previous one is 0
		if(number == this.slotLocations[row][col] || number == 0) {
			// Swap the number only when current number is greater than 0
			if(this.slotLocations[row][col] > 0) {
				// Merge the slots
				this.slotLocations[row][newRow] = number + this.slotLocations[row][col];

				// Check if the merged slot contains the max number defined in game rules
				if(this.slotLocations[row][newRow] == this.maxNumber) {
					this.gameComplete = true;
				}

				// If the merged slot is greated than 0, block that slot, so that no new random numnber occupies that slot in future
				if(this.slotLocations[row][newRow] > 0) {
					this.blockSlotByLocation(row, newRow);
				}

				// Update the map of location (row, col) of slots to its data
				this.slotLocations[row][col] = 0;

				// un block the current slot, so that any new random numnber  can occupy this slot in future
				this.unblockSlotByLocation(row, col);

				// Set the swapped flat to true, indicating that new random number can be generated now
				swapped = true;
			}
		}	

		return swapped;
	}

	Game.prototype.shiftUpAndDown = function(row, col, newRow, number, swapped) {

		// Check if the numbers in two adjacent slots are same or the next or previous one is 0
		if(number == this.slotLocations[row][col] || number == 0) {
			// Swap the number only when current number is greater than 0
			if(this.slotLocations[row][col] > 0) {
				// Merge the slots
				this.slotLocations[newRow][col] = number + this.slotLocations[row][col];

				// Check if the merged slot contains the max number defined in game rules
				if(this.slotLocations[newRow][col] == this.maxNumber) {
					this.gameComplete = true;
				}

				// If the merged slot is greated than 0, block that slot, so that no new random numnber occupies that slot in future
				if(this.slotLocations[newRow][col] > 0) {
					this.blockSlotByLocation(newRow, col);
				}

				// Update the map of location (row, col) of slots to its data
				this.slotLocations[row][col] = 0;

				// un block the current slot, so that any new random numnber  can occupy this slot in future
				this.unblockSlotByLocation(row, col);

				// Set the swapped flat to true, indicating that new random number can be generated now
				swapped = true;
			}
		}	

		return swapped;
	}

	/**
	 * Starts the game
	 */
	Game.prototype.start = function() {	
		this.generateRandomNumbers(this.totalRandomNumbers);
		
		this.printGrid();
	}

	/**
	 * Perform internal game actions, once user has played his move, like
	 *
	 * checking if game is over or won
	 * generater random numbers, etc
	 */
	Game.prototype.performPostActions = function(swapped) {
		// validate if game is over
		if(this.isGameOver()) {
			alert('Game Over!');
			return false;
		}

		if(swapped) {
			this.generateRandomNumbers(1);
		}

		this.printGrid();

		// validate if game is complete
		if(this.isGameComplete()) {
			alert('You Won!');
			return false;
		}

		return true;
	}

	/**
	 * Game over validation
	 * @return {Boolean}
	 */
	Game.prototype.isGameOver = function() {
		return (Object.keys(this.slotNumbers).length == 0);
	}

	/**
	 * Game won validation
	 * @return {Boolean}
	 */
	Game.prototype.isGameComplete = function() {
		return this.gameComplete;
	}

	/**
	 * Generating random number and placing into desired slot in the grid
	 */
	Game.prototype.generateRandomNumbers = function(randomNumbers) {
		for(var i = 0; i < randomNumbers; i++) {
			// Pick random slot number
			var slotNumbersArray = Object.keys(this.slotNumbers);
			var randomSlotNumber = slotNumbersArray[Math.floor(Math.random() * slotNumbersArray.length)];

			// Pick random number either 2 or 4
			var number = this.allowedNumbers[Math.floor(Math.random() * this.allowedNumbers.length)];

			this.slotLocations[this.slotNumbers[randomSlotNumber].split('_')[0]][this.slotNumbers[randomSlotNumber].split('_')[1]] = number;
			
			delete this.slotNumbers[randomSlotNumber];
		}
	}

	/**
	 * Blocking the slot in the grid
	 * so that new random number doesn't occupy this space
	 */
	Game.prototype.blockSlotByLocation = function(row, col) {
		// find slot number
		var slotNumber = (row * this.slotSize) + col;

		delete this.slotNumbers[slotNumber];
	}

	/**
	 * Un blocking the slot in the grid
	 * so that new random number can occupy this space
	 */
	Game.prototype.unblockSlotByLocation = function(row, col) {
		// find slot number
		var slotNumber = (row * this.slotSize) + col;

		this.slotNumbers[slotNumber] = row + '_' + col;		
	}

	/**
	 * Printing the grid to allow user to take its next step
	 */
	Game.prototype.printGrid = function() {
		for(var i = 0; i < this.slotSize; i++) {
			var cols = [];
			for(var j = 0; j < this.slotSize; j++) {
				cols.push(this.slotLocations[i][j]);
			}
			console.log(cols.join(" "));
		}
	}

	var game = new Game(4, 2048);

	game.start();

	return {
		up: game.up.bind(game),
		down: game.down.bind(game),
		left: game.left.bind(game),
		right: game.right.bind(game),
	}
})();