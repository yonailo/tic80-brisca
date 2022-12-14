// title:   brisca
// author:  juan fco rodriguez hervella juan.fco.rodriguez@gmail.com
// desc:    Brisca game as know in Spain.
// site:    http://www.tuxe.es
// license: MIT License 
// version: 0.1
// script:  js

var groups = ['oros', 'copas', 'espadas', 'bastos'];

var Game = {
	cards: [],
	triunfo: '',
	turno: '',
	playerCards: [],
	computerCards: [],
	p1Score: 0,
	comScore: 0,
	cursor: '',
	handWinner: '',
	p1PlayedCard: false,
	comPlayedCard: false,
	p1PlayedSlot: '',
	comPlayedSlot: '',
	whoPlayedFirst: false,
	handWinner: false,
 
	getCard: function(index, group) {
		var card = this.findCard(index, group);
		return card;
	},
	
	findCard: function(index, group) {
		var i = 0;
		switch(group) {
			case 'oros':
				i = i + 0;
				break;
			case 'copas':
			 i = i + 10;
				break;
			case 'espadas':
			 i = i + 20;
				break;
			case 'bastos':
			 i = i + 30;
				break;
		}
		
		i = i + index;
		
		return this.cards[i];
	},
	
	spawnCards: function() {
	 	this.cards = [];
		
		for(var i = 0; i < groups.length; i++) {
		 var group = groups[i];
			for(var j = 0; j < 10; j++) {
				this.cards.push(new Card(j, group));
			}
		}
	},
	
	shuffleCards: function() {
		var tmp, current, top = this.cards.length;
		if(top) while(--top) {
			current = Math.floor(Math.random() * (top + 1));
			tmp = this.cards[current];
			this.cards[current] = this.cards[top];
			this.cards[top] = tmp;
		}
	},

	popFromBarajaToPos: function(turno, pos) {
		var positionsP1 = [[0,88], [5*8,88], [10*8, 88]];
		var positionsCOM = [[0,0], [5*8, 0], [10*8, 0]];

		var current = '';
		if(turno == 'player') {
			current = positionsP1[pos];
		}
		else {
			current = positionsCOM[pos];
		}

		var card = '';
		if(this.cards.length == 0) {
			if(this.triunfo && this.triunfo.isTriunfo) {
				card = this.triunfo;
				card.isTriunfo = false;
			}
			else {
				if(turno == 'player') {
					this.playerCards[pos] = false;
				}
				else {
					this.computerCards[pos] = false;
				}
				return false;
			}
		}
		else {
			card = this.cards.pop();
		}
		
		card.x = current[0];
		card.y = current[1];
		

		if(turno == 'player') {
			card.hide = false;
			this.playerCards[pos] = card;
		}
		else {
			card.hide = true;
			this.computerCards[pos] = card;
		}
	},
	
	setupGame: function() {
	 	this.p1Score = 0;
		this.comScore = 0;
	 	this.spawnCards();
		this.shuffleCards();
		
		this.p1PlayedCard = false;
		this.comPlayedCard = false;
		this.turno = 'new_game';
		this.whoPlayedFirst = false;
		this.handWinner = false;

		// Player cards
		this.playerCards = [];
		
		this.popFromBarajaToPos('player', 0);
		this.popFromBarajaToPos('player', 1);
		this.popFromBarajaToPos('player', 2);
		
  		// computerCards
		this.computerCards = [];
		
		this.popFromBarajaToPos('computer', 0);
		this.popFromBarajaToPos('computer', 1);
		this.popFromBarajaToPos('computer', 2);

		this.triunfo = this.cards.pop();
		this.triunfo.isTriunfo = true;
		this.cursor = new Cursor(this);
	},

	setupNewHand() {
		this.p1PlayedCard = false;
		this.comPlayedCard = false;
		this.whoPlayedFirst = false;
		this.turno = this.handWinner;
		
		if(this.handWinner == 'player') {
			this.popFromBarajaToPos('player', this.p1PlayedSlot);
			this.popFromBarajaToPos('computer', this.comPlayedSlot);
		}
		else {
			this.popFromBarajaToPos('computer', this.comPlayedSlot);
			this.popFromBarajaToPos('player', this.p1PlayedSlot);	
		}

		this.handWinner = false;

		this.comPlayedSlot = '';
		this.p1PlayedSlot = '';
	},
	
	setHandWinner: function() {
		var p1Points = this.p1PlayedCard.getPoints();
		var p1Group = this.p1PlayedCard.group;

		var comPoints = this.comPlayedCard.getPoints();
		var comGroup = this.comPlayedCard.group;

		var triunfoGroup = this.triunfo.group;

		if((p1Group != triunfoGroup && comGroup != triunfoGroup) ||
			(p1Group == triunfoGroup && comGroup == triunfoGroup)) {

			if(p1Group == comGroup) {
				if(p1Points > comPoints) {
					this.handWinner = 'player';
				}
				else if(p1Points < comPoints) {
					this.handWinner = 'computer';
				}
				else if(this.p1PlayedCard.index > this.comPlayedCard.index) {
					this.handWinner = 'player';
				}
				else {
					this.handWinner = 'computer';
				}
			}
			else {
				this.handWinner = this.whoPlayedFirst;
			}
		}
		else if(p1Group == triunfoGroup) {
			this.handWinner = 'player';
		}
		else if(comGroup == triunfoGroup) {
			this.handWinner = 'computer';
		}
		
	},

	updateScores: function() {
		var total = this.p1PlayedCard.getPoints() + this.comPlayedCard.getPoints();
		if(this.handWinner == 'player') {
			this.p1Score += total;
		}
		else {
			this.comScore += total;
		}
	},

	
	update: function() {
		if(this.isGameOver()) {
			this.turno = 'game_over';
		}

		if(this.turno == 'player') {
			if(! this.whoPlayedFirst) {
				this.whoPlayedFirst = 'player';
			}
			this.cursor.update();
		}
		
		if(this.turno == 'computer') {
			if(! this.whoPlayedFirst) {
				this.whoPlayedFirst = 'computer';
			}
			this.computerMove();
		}

		if(this.p1PlayedCard && this.comPlayedCard && this.turno == 'end') {
			this.setHandWinner();
			this.updateScores();	
			
			this.turno = 'waiting';
		}

		if(this.turno == 'waiting') {
			// UP
			if(btnp(0)) {
				this.setupNewHand();
			}
		}

		if(this.turno == 'game_over') {
			// UP
			if(btnp(0)) {
				this.setupGame();
			}
		}

		if(this.turno == 'new_game') {
			// UP
			if(btnp(0)) {
				this.turno = 'player';
			}
		}
	},
	
	selectLessPointsAndNotTriunfo: function() {
		
		var points = 999;
		var pos = -1;

		for(var i = 0; i < this.computerCards.length; i++) {
			var card = this.computerCards[i];
			if(! card) {
				continue;
			}

			card_points = card.getPoints();
			if(card_points < points) {
				if(card.group != this.triunfo.group) {
					if(card_points != 11 && card_points != 10) {
						points = card_points;
						pos = i;
					}
				}
			}
		}

		if(pos != -1) {
			return pos;
		}

		for(var i = 0; i < this.computerCards.length; i++) {
			var card = this.computerCards[i];
			if(! card) {
				continue;
			}

			card_points = card.getPoints();
			if(card_points < points) {
				points = card_points;
				pos = i;
			}
		}

		if(pos == -1) {
			for(var i = 0; i < this.computerCards.length; i++) {
				var card = this.computerCards[i];
				if(! card) {
					continue;
				}

				pos = i;
			}
		}

		return pos;
	},

	tryToWin: function() {
		var p1Points = this.p1PlayedCard.getPoints();
		var p1Index = this.p1PlayedCard.index;
		var p1Group = this.p1PlayedCard.group;

		var pos = -1;
		var points = 0;

		// Tries to win with a card of the same group
		for(var i = 0; i < this.computerCards.length; i++) {
			var card = this.computerCards[i];
			if(! card) {
				continue;
			}

			if(card.group == p1Group) {
				if(card.getPoints() > p1Points) {
					if(pos != -1) {
						if(card.getPoints() > points) {
							pos = i;
							points = card.getPoints();
						}
					} 
					else {
						pos = i;
						points = card.getPoints();
					}
				}
				else if(p1Points == 0) {
					if(card.index > p1Index) {
						pos = i;
					}
				}
			}
		}

		if(pos != -1) {
			return pos;
		}

		// Tries to win with a triunfo
		for(var i = 0; i < this.computerCards.length; i++) {
			var card = this.computerCards[i];
			if(! card) {
				continue;
			}

			if(card.group == this.triunfo.group) {
				if(p1Group == this.triunfo.group) {
					if(card.getPoints() > p1Points) {
						pos = i;
					}
				}
				else {
					if(pos != -1) {
						if(card.getPoints() < this.computerCards[pos].getPoints()) {
							pos = i;
						}
					}
					else {
						if(p1Points == 10 || p1Points == 11) {
							pos = i;
						}
						else {
							if(card.getPoints() != 10 && card.getPoints() != 11) {
								pos = i;
							}
						}
					}
				}
			}
		}

		if(pos != -1) {
			return pos;
		}

		// Tries to lose the miminum number of points
		return this.selectLessPointsAndNotTriunfo();
	},

	selectWinnerHand: function() {

		var p1Points = this.p1PlayedCard.getPoints();

		if(this.p1PlayedCard.group == this.triunfo.group) {	
			if(p1Points == 0) {
				return this.selectLessPointsAndNotTriunfo();
			}
			else {
				return this.tryToWin();
			}
		}
		else {
			return this.tryToWin();
		}
	},

	guessBestComputerMove: function() {

		if(! this.p1PlayedCard)  {
			return this.selectLessPointsAndNotTriunfo();		
		}
		else {
			return this.selectWinnerHand();
		}
	},

	isGameOver: function() {
		if(! this.playerCards[0] &&
			! this.playerCards[1] && 
			! this.playerCards[2] &&
			! this.computerCards[0] &&
			! this.computerCards[1] && 
			! this.computerCards[2]) {
				return true;
		}
		else {
			return false;
		}

		
	},

	playerMove: function(cursorIndex) {
		
		if(this.whoPlayedFirst == 'player') {
			sfx(0,'B-5',10);
		}

		var card = this.playerCards[cursorIndex];
		if(! card || card.played) {
			return;
		}
		card.x = 16*8;
		card.y = 9*8;
		card.played = true;
		
		this.p1PlayedCard = card;
		this.p1PlayedSlot = cursorIndex;
		
		if(! this.comPlayedCard) {
			this.turno = 'computer';
		}
		else {
			this.turno = 'end';
		}
	},

	computerMove: function() {

		if(this.whoPlayedFirst == 'computer') {
			sfx(0,'C-3',10);
		}

		var pos = this.guessBestComputerMove();

		var card = this.computerCards[pos];
		card.x = 21*8;
		card.y = 9*8;
		card.hide = false;
		card.played = true;

		this.comPlayedCard = card;
		this.comPlayedSlot = pos;

		if(! this.p1PlayedCard) {
			this.turno = 'player';
		}
		else {
			this.turno = 'end';
		}
	},
	
	render: function() {
		this.renderComputerCards();
		this.renderPlayerCards();
		this.renderTriunfo();
		this.renderBaraja();
		this.renderScores();
		
		if(this.turno == 'player') {
			print('P1 te toca!',70,65,12,false,1,true);
		}
		
		print('P1',16*8,15*8+4,12,false,1,true);
		print('COM',21*8,15*8+4,12,false,1,true);
		print('TIME:',16*8,2*8,12,false,1,true);
		print(parseInt(t/60),16*8,3*8,12,false,1,true);
		
		this.cursor.render();
		
		if(this.turno == 'waiting') {
			this.renderWinnerMessage();
		}

		if(this.turno == 'game_over') {
			this.renderGameOver();
		}

		if(this.turno == 'new_game') {
			this.renderNewGame();
		}
	},
	
	renderNewGame: function() {
		rect(50, 20, 150, 100, 11);
		print('Choose cards with arrow ', 55, 30, 6, false, 1, false);
		print('keys. Z to play, UP to ', 55, 40, 6, false, 1, false);
		print('continue.', 55, 50, 6, false, 1, false);
		print('GOOD LUCK !!', 70, 80, 6, false, 1, false);
	},

	renderWinnerMessage: function() {
		if(this.handWinner == 'player') {
			message = 'You win !!';
			bg_color = 11;
			fg_color = 6;
		}
		else {
			message = 'You lose :(';
			bg_color = 2;
			fg_color = 12;
		}

		rect(50, 20, 70, 15, bg_color);
		print(message, 55, 25, fg_color, false, 1, false);
	},

	renderGameOver: function() {
		rect(50, 20, 120, 30, 11);
		print('GAME OVER', 55, 30, 6, false, 2, false);
	},

	renderScores: function() {
		print('P1  score: ' + this.p1Score,2,60,12,true,1,true);
		print('COM score: ' + this.comScore,2,70,12,true,1,true);
	},
	
	renderComputerCards: function() {
		if(this.computerCards[0]) {
			this.computerCards[0].render();
		}

		if(this.computerCards[1]) {
 			this.computerCards[1].render();
		}

		if(this.computerCards[2]) {
			this.computerCards[2].render();
		}
	},
	
	renderPlayerCards: function() {
		if(this.playerCards[0]) {
			this.playerCards[0].render();
		}

		if(this.playerCards[1]) {
			this.playerCards[1].render();
		}

		if(this.playerCards[2]) {
			this.playerCards[2].render();
		}
	},
	
	renderTriunfo: function() {
		if(this.triunfo.isTriunfo) {
			this.triunfo.x = 21*8;
			this.triunfo.y = 0;
			this.triunfo.hide = false;
			this.triunfo.render();
		}
		print('Triunfo',21*8+4,52,12,false,1,true);
		print(this.triunfo.group,21*8+4,60,12,false,1,true);
	},
	
	renderBaraja: function() {
	 var x = 26*8;
		var y = 0;
		
		for(i = 0; i < this.cards.length; i++) {
			var card = this.cards[i];
			card.hide = true;
			card.x = x;
			card.y = y;
			card.render();
			
			y = y + 2;
			x = x;
		}
		
		print('Baraja',x + 4,y + 50,12,false,1,true);
		print('('+ this.cards.length + ')',x + 4, y + 58,12,false,1,true);
	},
	
}

var Cursor = function(Game) {
 	this.game = Game;
 	this.pos = [[0,11*8],[5*8,11*8],[10*8,11*8]];
	this.index = 0;
	
	this.update = function() {
		if(this.game.turno == 'computer') {
			return;
		}
		
	 	// right ->
		if(btnp(3)) {
			this.index = this.index + 1;
			if(this.index == 3) {
				this.index = 0;
			}
		}
		
		// left <-
		if(btnp(2)) {
			this.index = this.index - 1;
			if(this.index == -1) {
				this.index = 2;
			}
		}
		
		// button A or key Z
		if(btnp(4)) {
			this.game.playerMove(this.index);
		}
	}
	
	this.render = function() {
			if(this.game.turno == 'player') {
	 			var x = this.pos[this.index][0];
				var y = this.pos[this.index][1];
		
				rectb(x,y,4*8,6*8,4);
			}
 }
}

var Card = function(index, group) {
	this.index = index;
	this.group = group;
	this.x = 0;
	this.y = 0;
	this.blankSpr = 144;
	this.hide = false;
	this.played = false;
	this.isTriunfo = false;

	this.getPoints = function() {
		var points = [11,0,10,0,0,0,0,2,3,4];
		return points[this.index];
	}

	this.render = function() {

		if(this.hide) {
			if(! key(16)) {
				this.renderHide();
				return;
			}
		}
  
		if(this.index == 0) {
			this.renderAS();	
		}
		if(this.index == 1) {
			this.renderDOS();
		}
		if(this.index == 2) {
			this.renderTRES();
		}
		if(this.index == 3) {
			this.renderCUATRO();
		}
		if(this.index == 4) {
			this.renderCINCO();
		}
		if(this.index == 5) {
			this.renderSEIS();
		}
		if(this.index == 6) {
			this.renderSIETE();
		}
		if(this.index == 7) {
			this.renderSOTA();
		}
		if(this.index == 8) {
			this.renderCABALLO();
		}
		if(this.index == 9) {
			this.renderREY();
		}
	}
	
	this.renderHide = function() {
		spr(148,this.x,this.y,-1,1,0,0,4,6);
	}
	
	this.renderAS = function() {
		spr(this.blankSpr,this.x,this.y,-1,1,0,0,4,6);
		
		switch(this.group) {
			case 'oros':
				spr(84,this.x,this.y,-1,1,0,0,4,4);
				break;
			case 'copas':
				spr(92,this.x,this.y,-1,1,0,0,4,4);
				break;
			case 'espadas':
				spr(88,this.x,this.y,-1,1,0,0,4,4);
				break;
			case 'bastos':
				spr(80,this.x,this.y,-1,1,0,0,4,4);
				break;
		}
		
		print('As', this.x + 6, this.y + 34, 15, false, 1, true);
		print(this.group.substr(0,4), this.x + 6, this.y + 42, 15, false, 1, true);
	}
	
	this.renderDOS = function() {
		var grpSpr = this.getGrpSpr(this.group);
		
		spr(this.blankSpr,this.x,this.y,-1,1,0,0,4,6);
		spr(grpSpr, this.x + 8, this.y + 2,-1,2);
		spr(grpSpr, this.x + 8, this.y + 24,-1,2);
		print('2 ' + group.substr(0,4), this.x + 6, this.y + 42, 15, false, 1, true);
	}
	
	this.renderTRES = function() {
		var grpSpr = this.getGrpSpr(this.group);
		
		spr(this.blankSpr,this.x,this.y,-1,1,0,0,4,6);
		spr(grpSpr,this.x + 1, this.y + 2,-1,2);
		spr(grpSpr,this.x + 15, this.y + 12,-1,2);
		spr(grpSpr,this.x + 1, this.y + 24,-1,2);
		print('3 ' + group.substr(0,4), this.x + 6, this.y + 42, 15, false, 1, true);
	}  
	
	this.renderCUATRO = function() { 
		var grpSpr = this.getGrpSpr(this.group);
		
		spr(this.blankSpr,this.x,this.y,-1,1,0,0,4,6);
		spr(grpSpr,this.x + 6, this.y + 8, -1, 1);
		spr(grpSpr,this.x + 18, this.y + 8, -1, 1);
		spr(grpSpr,this.x + 6, this.y + 28, -1, 1);
		spr(grpSpr,this.x + 18, this.y + 28, -1, 1);
		
		print('4 ' + group.substr(0,4), this.x + 6, this.y + 42, 15, false, 1, true);
	}
	
	this.renderCINCO = function() {
		var grpSpr = this.getGrpSpr(this.group);

		spr(this.blankSpr,this.x,this.y,-1,1,0,0,4,6);
		spr(grpSpr,this.x + 6, this.y + 8, -1, 1);
		spr(grpSpr,this.x + 18, this.y + 8, -1, 1);
		spr(grpSpr,this.x + 6, this.y + 32, -1, 1);
		spr(grpSpr,this.x + 18, this.y + 32, -1, 1);
		
  spr(grpSpr,this.x + 12, this.y + 20, -1, 1);
  
		print('5 ' + group.substr(0,4), this.x + 6, this.y + 42, 15, false, 1, true);
	}
	
	this.renderSEIS = function() {
		var grpSpr = this.getGrpSpr(this.group);

		spr(this.blankSpr,this.x,this.y,-1,1,0,0,4,6);
		spr(grpSpr,this.x + 6, this.y + 8, -1, 1);
		spr(grpSpr,this.x + 18, this.y + 8, -1, 1);
		spr(grpSpr,this.x + 6, this.y + 20, -1, 1);
		spr(grpSpr,this.x + 18, this.y + 20, -1, 1);
		spr(grpSpr,this.x + 6, this.y + 32, -1, 1);
		spr(grpSpr,this.x + 18, this.y + 32, -1, 1);
  
		print('6 ' + group.substr(0,4), this.x + 6, this.y + 42, 15, false, 1, true);

	}
 
 this.renderSIETE = function() {
		var grpSpr = this.getGrpSpr(this.group);

		spr(this.blankSpr,this.x,this.y,-1,1,0,0,4,6);
		spr(grpSpr,this.x + 2, this.y + 8, -1, 1);
		spr(grpSpr,this.x + 22, this.y + 8, -1, 1);
		spr(grpSpr,this.x + 2, this.y + 20, -1, 1);
		spr(grpSpr,this.x + 22, this.y + 20, -1, 1);
		spr(grpSpr,this.x + 2, this.y + 32, -1, 1);
		spr(grpSpr,this.x + 22, this.y + 32, -1, 1);

  spr(grpSpr,this.x + 12, this.y + 20, -1, 1);
  
		print('7 ' + group.substr(0,4), this.x + 6, this.y + 42, 15, false, 1, true);

 }
 
 this.renderSOTA = function() {
		var grpSpr = this.getGrpSpr(this.group);

		spr(this.blankSpr,this.x,this.y,-1,1,0,0,4,6);

		spr(16,this.x,this.y,-1,1,0,0,4,4);
  spr(grpSpr, this.x + 2, this.y,-1);
  
		print('Sota', this.x + 6, this.y + 34, 15, false, 1, true);
		print(this.group.substr(0,4), this.x + 6, this.y + 42, 15, false, 1, true);
 }
 
 this.renderCABALLO = function() {
		var grpSpr = this.getGrpSpr(this.group);

		spr(this.blankSpr,this.x,this.y,-1,1,0,0,4,6);

		spr(20,this.x,this.y,-1,1,0,0,4,4);
  spr(grpSpr, this.x + 2, this.y,-1)
  
		print('Caballo', this.x + 2, this.y + 34, 15, false, 1, true);
		print(this.group.substr(0,4), this.x + 2, this.y + 42, 15, false, 1, true);

 }
 
 this.renderREY = function() {
		var grpSpr = this.getGrpSpr(this.group);

		spr(this.blankSpr,this.x,this.y,-1,1,0,0,4,6);

		spr(24,this.x,this.y,-1,1,0,0,4,4);
  spr(grpSpr, this.x + 2, this.y,-1)
  
		print('Rey', this.x + 8, this.y + 34, 15, false, 1, true);
		print(this.group.substr(0,4), this.x + 8, this.y + 42, 15, false, 1, true);

 }
	
	this.getGrpSpr = function(group) {
	 var grpSpr = '';
		
		switch(group) {
			case 'oros':
			 grpSpr = 0;
				break;
			case 'copas':
			 grpSpr = 1;
				break;
			case 'espadas':
			 grpSpr = 2;
				break;
			case 'bastos':
			 grpSpr = 3;
				break;
		}
		
		return grpSpr;
	}
}

function selfTest(t) {
 var x = 0;
 var y = 0;
 
 var grpIndex = parseInt(t / 60) % 4;
 var group_name = groups[grpIndex];
 
 var hide = parseInt(t / (60 * 4)) % 2;
 
 print(group_name + ', ' + (hide ? 'hide on' : 'hide off'), 0, 120);
 
	for(var i = 0; i < 10; i++) {
		var card = Game.getCard(i, group_name);
	 	card.hide = hide;	
		card.x = x;
		card.y = y;
		card.render();
		
		x += 5 * 8;
		
		if(i == 5) {
		 x = 0;
			y = 62;
		}
	}
}

Game.setupGame();

var t = 0;

function TIC()
{
	cls(15);
	
	map(0,0,30,17,0,0,0);		
	
	Game.update();
	Game.render();
		
 //selfTest(t);
 t += 1;
 
 
}

// <TILES>
// 000:0004400000444400040000404404404444044044040000400044440000044000
// 001:0002200000222200022222200222222000222200000220000002200002222220
// 002:0002200000022000000220000444444000444400000bb000000bb000000bb000
// 003:0003300000033000003333000033030003033330033303300033330000033000
// 016:00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc
// 017:cc000000cc000000cc000066cc000043cc000043cc000444cc004404cc000004
// 018:2200000022220000666660003333400003034400333444403034004433340004
// 020:00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc
// 021:cc000000cc000000cc000000cc000000cc000000cc000004cc000043cc000043
// 022:000000000000000000000000022000002220000044440000333340000303400a
// 023:000000000000000000000000000a000000aa00000aa00000aa000000a0000000
// 024:00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc
// 025:cc0000cccc0000c3cc0000c0cc000cc3cc000ccccc000ccccc00022ccc0222aa
// 026:cccc00003333c0003033c000333cc000ccccccc0cccc00ccccc2000ccc222200
// 027:000000000000000000000000000000000000000000000000c000000000000000
// 032:0000000000000000000000660000000600000000000000000000000000000000
// 033:0000044400000222000002226000022266000222006666660066666600000666
// 034:2224440022226660222666662666666666666666666666666666666666666666
// 035:0000000000000000000000006000000066000000666000006666000000060000
// 036:0000000000000000000000000000000000000000000003330003303300030333
// 037:0000040400004004000000000000000033000aaa3300aaaa3333aaaa333333aa
// 038:333444aa303400a4333400a0aaaaaaa0aaaaaa00aaaaaaa0aaaaaaa0aaaaaaa0
// 039:0000000000000000400000000000000000000000000000000000000000000000
// 040:0000000000000000000000000000000000000000000000000000000200000002
// 041:0002aaaa0002aaaa0002aaaa0002aaaa0002a222000222222222666622226666
// 042:a2222222a2222222a222222a2222222a2222222a2222222a6666662a6662622a
// 043:00000000200000002000000020000000a2000000a2200000aa200000aa220000
// 049:0000044400000666000066660006666600066666000666660006666600066666
// 050:4444444066666466666664666666646666666466666664666666646666666466
// 051:0006600000006000600000006600000066000000660000006600000066000000
// 052:0333333303333330033300000000000000000000000000000000000000000000
// 053:3333333333333333333333330033333300333333003333330033333300333333
// 054:aaaaaaa033333330333333333333333333333333333333333333333333333333
// 055:0000000000000000300000003333000033030000330330003300300033003300
// 056:000000000000000b0000000b0000000b000000bb000000b0000000b0000000b0
// 057:b0022222b0022222000222220022222200222222002222220022222200222222
// 058:2266622a2262222a2262222a2262222a2262222a226222222262222222622222
// 059:aaa20000aaa22000aaaa2000aaaa2000aaaa2000aaaa2000aaaa2200aaaaa220
// 065:0006666600066666000000220000002200000022000000220000222200002222
// 066:6666646666666666220022222200222222002222220022222202222222022222
// 067:6600000066000000000000000000000000000000000000000000000000000000
// 068:0000333300003003000330030003000300030003003330330000000000000000
// 069:3333333333300000000000000000000030000000300000000000000000000000
// 070:3333333300333000003000030030033303300300033033300000000000000000
// 071:3000030030000300300003000000030000000300000000000000000000000000
// 072:00000bb000000b0000000b000000000000000000000000000000000000000000
// 073:0022222200222222000222220002222200022222000222000022220002202200
// 074:2262222222622222222222222222222022222200000022000002222000220220
// 075:2222222000000000000000000000000000000000000000000000000000000000
// 080:0222200000022222000022220000022200000222000000220000002200000002
// 081:0000000000000000220000002220000022220000222220002232220022322222
// 083:0000000000000000000000000330000003333000330330003303300030033000
// 084:0000000000000000000000000000000000000000000000000000000400000044
// 085:0000000000000044000044440004444400444444044444444444444444444444
// 086:0000000000000000440000004440000044440000444440004444444044444444
// 088:0000000000000200004422200242222204422222044222220444222204442222
// 089:0000000000000000000000000000000020000000220000002220000022220000
// 090:0000000000000000000000000000000000000000000000000000000600006666
// 091:0000000000000000000000000000660000006600006660006660000000000000
// 092:0000000000000000000000000000000000000000000000020000002200000222
// 093:0000024400022222002222220222222222222222222222222222222222222222
// 094:4200000022220000222220002222220022222220222222222222222222222222
// 095:0000000000000000000000000000000000000000000000002000000022000000
// 096:0000000200000000000000030000003300000333000003330000333300003303
// 097:2233222222232222222233333333333333333333333333333322222233222222
// 098:2000000322000003333000333333003333330033322222033322222023322222
// 099:3033000030330000333300003330000033300000330000003000000020000000
// 100:0000004400000044000000440000004400000004000000000000000000000000
// 101:4444444444444444444444444444444444444444044444440004444400004444
// 102:4444444444444444444444444444444444444440444440004440000044000000
// 104:0444422200004444000000220000000000000000000000000000000000000000
// 105:2222000042b00000bbb0000000bbb000000b6b6600066bb000060bbb00060bbb
// 106:00006000000060000000600000006000666660000000000000000000b0000002
// 107:0000000000000000000000000000000000000000000000000000000022222200
// 108:0044442204440444044404440044444400444444004002220044422200000222
// 109:2222222244444444444444444444444444444444222222222222222222222222
// 110:2222222244444444444444444444444444444444222222222222222222222222
// 111:2444400044044400440444004444400044444000220040002244400022000000
// 112:0003303300030033000303330033033000333330003333300003330000000000
// 113:3022222200222222002223220022223300222223000222220002222200023333
// 114:2233222222232222222232222222332232222322332223322332223333333333
// 115:2200000022000000222000002220000022220000222330003333000033330000
// 116:0000000000000000000000000000000000000000000000000000000000000004
// 117:0000044400000044000000000000333300000333000000330000000044444444
// 118:4000000000000000000000003300000030000000000000000000000044444444
// 120:0000000000000000000200000002000000022000000020000000222200000000
// 121:000600bb0006000b000600000006000000006000022260002000620000006620
// 122:bb000002bbb00020bbbb00200bbbb20000bbbb00000bbbb00022bbbb22200bbb
// 123:00000200000002000000220000222000022000200022222000000000b0000000
// 124:0000002200000000000000000000000000000000000000000000000000000000
// 125:222222220222222200002222000044440000aaaa0000aaaa0000aaaa0000aaaa
// 126:22222222222222002220000044400000aaa00000aaa00000aaa00000aaa00000
// 127:2000000000000000000000000000000000000000000000000000000000000000
// 129:0000333300002330000333330033333300300000000000000000000000000000
// 130:3330000300033333333333333333222302222222000022220000000200000000
// 131:3332000033320000222220002222200032222000222220002222220022222000
// 132:0000000400000004000000040000000400000000000000000000000000000000
// 133:2222222222222222222222224444444400000000000000000000000000000000
// 134:2222222422222224222222244444444400000000000000000000000000000000
// 136:0000000000000000000000000000000000666666000000000000000000000000
// 137:0000600200006000000660006666000060000000000000000000000000000000
// 138:200000bb0000000b000000000000000000000000000000000000000000000000
// 139:bb000000bbb00000bbbb00000bbbb00000bbb000000bb0000000000000000000
// 140:00000000000000000000000200000002000000020000000200000bbb00044444
// 141:000044440222222222222222222222222222222222222222bbbbbbbb44444444
// 142:444000002222220022222222222222222222222222222222bbbbbbbb44444444
// 143:000000000000000000000000000000000000000000000000b000000044440000
// 144:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 145:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 146:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 147:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 148:eeeeeeeeedddddddedeeeeeeededddddededddddededddddededddddededdddd
// 149:eeeeeeeeddddddddeeeeeeeedddddddddddddddddddddddddddddddddddddddd
// 150:eeeeeeeeddddddddeeeeeeeedddddddddddddddddddddddddddddddddddddddd
// 151:eeeeeeeedddddddeeeeeeededddddededddddededddddededddddededddddede
// 160:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 161:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 162:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 163:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 164:ededddddededddddededddddededddddededddddededddddededddddededdddd
// 165:ddddddddddddddddeeeeeeeedddddddddddddddddddddddddddddddddddddddd
// 166:ddddddddddddddddeeeeeeeedddddddddddddddddddddddddddddddddddddddd
// 167:dddddededddddedeeddddededddddededddddededddddededddddededddddede
// 176:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 177:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 178:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 179:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 180:ededddddededddddededddddededddddededddddededddddededddddededdddd
// 181:ddddddddddddddddddddddddddddddddddddddddeeeeeeeedddddddddddddddd
// 182:ddddddddddddddddddddddddddddddddddddddddeeeeeeeedddddddddddddddd
// 183:dddddededddddededddddededddddededddddedeeddddededddddededddddede
// 192:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 193:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 194:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 195:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 196:ededddddededddddededddddededddddededddddededddddededddddededdddd
// 197:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
// 198:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
// 199:dddddededddddededddddededddddededddddededddddededddddededddddede
// 208:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 209:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 210:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 211:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 212:ededddddededddddededddddededddddededddddededddddededddddededdddd
// 213:ddddddddddddddddeeeeeeeedddddddddddddddddddddddddddddddddddddddd
// 214:ddddddddddddddddeeeeeeeedddddddddddddddddddddddddddddddddddddddd
// 215:dddddededddddedeeddddededddddededddddededddddededddddededddddede
// 224:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 225:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 226:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 227:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// 228:ededddddededddddededddddededddddededddddedeeeeeeedddddddeeeeeeee
// 229:ddddddddddddddddddddddddddddddddddddddddeeeeeeeeddddddddeeeeeeee
// 230:ddddddddddddddddddddddddddddddddddddddddeeeeeeeeddddddddeeeeeeee
// 231:dddddededddddededddddededddddededddddedeeeeeeededddddddeeeeeeeee
// </TILES>

// <MAP>
// 000:09192939990919293999091929399999999999999909192939990919293900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bcbcbcbcbcbcbcbcbc99bcbcbcbcbcbcbc99bcbc0000bcbcbc00bcbcbcbc0000000000000000000000000000000000000000000000000000000000999999999999999999
// 001:0a1a2a3a990a1a2a3a990a1a2a3a999999999999990a1a2a3a990a1a2a3a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc00bcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbc000000bc00bcbcbcbc0000000000000000000000000000000000000000000000000000000000999999990000000000
// 002:0b1b2b3b990b1b2b3b990b1b2b3b9999bbbbbbbb990b1b2b3b990b1b2b3b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc00bc0000bcbcbcbcbcbcbcbcbcbcbcbcbcbcbc000000bc0000bcbcbc0000000000000000000000000000000000000000000000000000000000999900990000000000
// 003:0c1c2c3c990c1c2c3c990c1c2c3c9999bbbbbbbb990c1c2c3c990c1c2c3c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc00bc0000000000bcbcbcbcbcbcbcbcbcbcbcbcbc000000bc00bcbcbc0000000000000000000000000000000000000000000000000000000000999900990000000000
// 004:0d1d2d3d990d1d2d3d990d1d2d3d9999bbbbbbbb990d1d2d3d990d1d2d3d999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bcbc000000000000bc00000000bcbcbcbcbcbcbc0000bcbc00bcbcbc0000000000000000000000000000000000000000000000000000000000999900990000999999
// 005:0e1e2e3e990e1e2e3e990e1e2e3e9999bbbbbbbb990e1e2e3e990e1e2e3e99999900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc00bcbcbcbc00bc00bcbcbc0000000000000000000000000000000000000000000000000000000000999900999999990000
// 006:99999999999999999999999999999999bbbbbbbb99999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc00bcbcbcbc00bcbcbc0000000000000000000000000000000000000000000000000000000000999900009999000099
// 007:99999999999999999999999999999999bbbbbbbb99999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bcbcbcbcbcbcbcbcbc00bcbcbc0000000000000000000000000000000000000000000000000000000000999900009900999999
// 008:99999999999999999999999999999999999999999999999999999999999999999900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc00bcbcbc00bcbcbc0000000000000000000000000000000000000000000000000000000000999900009900000000
// 009:9999999999999999999999999999999909192939bb09192939bbbb99999999999900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bcbcbcbcbcbcbcbcbc0000000000000000000000000000000000000000000000000000000000999900009999009900
// 010:999999999999999999999999999999990a1a2a3abb0a1a2a3abbbb99999999999900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bcbcbcbcbcbc00bcbcbcbcbc0000000000000000000000000000000000000000000000000000000000999900999999999999
// 011:091929399909192939990919293999990b1b2b3bbb0b1b2b3bbbbb999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000999999999999999999
// 012:0a1a2a3a990a1a2a3a990a1a2a3a99990c1c2c3cbb0c1c2c3cbbbb999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000999900999900000000
// 013:0b1b2b3b990b1b2b3b990b1b2b3b99990d1d2d3dbb0d1d2d3dbbbb999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000999900009900000000
// 014:0c1c2c3c990c1c2c3c990c1c2c3c99990e1e2e3ebb0e1e2e3ebbbb999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000999900000000000000
// 015:0d1d2d3d990d1d2d3d990d1d2d3d99999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000999900000000000000
// 016:0e1e2e3e990e1e2e3e990e1e2e3e99999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 017:000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 018:000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 019:000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 052:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 053:000099000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 054:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 055:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 056:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 057:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 058:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 059:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 060:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 061:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 062:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 063:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 064:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 065:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 066:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 067:000000000000000000000000000000000000000000000000000000000000999999999999999999999999999999999999999999999999999999999999000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 124:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009999999999999999999999999999999999999999999999999999990000000000000000000000000000000000000000000000000000000000000000
// 125:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009999999999999999999999999999999999999999999999999999990000000000000000000000000000000000000000000000000000000000000000
// 126:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009999999999999999999999999999999999999999999999999999990099000000000000000000000000000000000000000000000000000000000000
// 127:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009999999999999999999999999999999999999999999999999999999900000000000000000000000000000000000000000000000000000000000000
// 128:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009999999999999999999999999999999999999999999999999999990000000000000000000000000000000000000000000000000000000000000000
// 129:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009999999999999999999999999999999999999999999999999999990000000000000000000000000000000000000000000000000000000000000000
// 130:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc00bcbc00bcbcbcbcbcbcbc999999999999999999999999999999999999999999999999990000000000000000000000000000000000000000000000000000000000000000
// 131:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bcbc0000bcbcbcbcbcbcbcbcbcbc99bc9999999999999999999999999999999999999999999900000000000000000000000000000000000000000000000000000000000000
// 132:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bcbc0000bcbc00bc000099bcbc999999bcbcbcbcbc999999bc9999999999999999999999990000000000000000000000000000000000000000000000000000000000000000
// 133:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc0000bcbcbcbcbcbc99bcbc9999bcbc99999999bcbcbcbcbc99999999999999999999990000000000000000000000000000000000000000000000000000000000000000
// 134:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bcbcbcbc00bcbcbcbcbcbc99999999bcbc999999999999bc99bc99999999999999999999990000000000000000000000000000000000000000000000000000000000000000
// 135:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bcbcbcbcbcbcbcbc00bc9999bcbcbcbcbcbcbcbc9999bc99bc99999999999999999999990099000000000000000000000000000000000000000000000000000000000000
// </MAP>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000
// </SFX>

// <TRACKS>
// 000:100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </TRACKS>

// <PALETTE>
// 000:1a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57
// </PALETTE>

