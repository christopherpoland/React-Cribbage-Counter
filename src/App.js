import React, { Component } from 'react';
import './App.css';
class App extends Component {
  constructor(props) {
    super(props);
    // STATE
    this.state = {
      cards: [],
      suit: '',
      number: '',
      selectedRadio: 'regular',
      score: 0,
      points: []
    };
  // BINDINGS
    this.handleColors = this.handleColors.bind(this);
    this.handleRadio = this.handleRadio.bind(this);
    this.scoreCrib = this.scoreCrib.bind(this);
    this.pairCounter = this.pairCounter.bind(this);
    this.flushCounter = this.flushCounter.bind(this);
    this.runCounter = this.runCounter.bind(this);
    this.fifteenCounter = this.fifteenCounter.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleClickTop = this.handleClickTop.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }
  shouldComponentUpdate (nextProps,nextState) {
    for (var i = 0; i < this.state.cards.length; i++) {
      if (nextState.suit !== this.state.suit && this.state.suit !== '') {
        document.getElementById(this.state.cards[i][0]).removeAttribute("style", "pointer-events: none; color: red;");
      }
      if (nextState.number !== this.state.number && this.state.number !== '') {
        document.getElementById(this.state.cards[i][1]).removeAttribute("style", "pointer-events: none; color: red;");
      }
    }
    if (this.state.cards.length > 4) {
      if (nextState.score !== this.state.score || nextState.selectedRadio !== this.state.selectedRadio || nextState.cards !== this.state.cards) { //Exception if score is being updated
        return true;
      }
      else {
        return false;
      }
    }

    else {
      return true;
    }
  }
  componentDidUpdate() {
    if (this.state.cards.length === 5) {
      this.scoreCrib(this.state.cards);
    }
    if (this.state.cards.length < 5 && this.state.score > 0) {
      this.setState({
        score: 0
      })
    }
    this.handleColors();

  }

  //FUNCTIONS
  handleClickTop(id) {
    if (this.state.cards.length < 5) {
      if (this.state.suit !== '' && String(this.props.numbers).indexOf(String(id)) >= 0) {
        this.setState({
          cards: [...this.state.cards,[id,this.state.suit]],
          suit: '',
          number: ''
        });
      }
      else if (this.state.number !== '' && String(this.props.suits).indexOf(String(id)) >= 0) {
        this.setState({
          cards: [...this.state.cards,[this.state.number,id]],
          suit: '',
          number: ''
        });
      }
      else if (this.props.suits.indexOf(id) >= 0) {
        this.setState({
          suit: id
        });
      }
      else if (String(this.props.numbers).indexOf(String(id)) >= 0) {
        this.setState({
          number: id
        });
      }
    }
  }
  scoreCrib (input) { //input = this.state.cards

    this.setState({
      score: this.pairCounter(input, 2)[0] + this.flushCounter(input)[0] + this.heelNob(input)[0] + this.runCounter(input)[0] + this.fifteenCounter(input,2)[0],
      points: [this.fifteenCounter(input, 2)[1], this.runCounter(input)[1], this.flushCounter(input)[1], this.pairCounter(input, 2)[1], this.heelNob(input)[1]   ]
    });
  }
  fifteenCounter (input, increment) {
    var nums = [];
    for (var i = 0; i < input.length; i++) {
      input[i][0] === 'J' || input[i][0] === 'Q' || input[i][0] === 'K' ? nums.push(10) : input[i][0] === 'A' ? nums.push(1) : nums.push(Number(input[i][0]));
    }
    var score = 0, sumNumbers = nums.reduce((a,b) => a + b), points = [];
    if (sumNumbers === 15) { //Counts combos of 5 cards
      score += increment; //adds to score contributed by 15's
      points.push(this.state.cards,increment); //pushes cards responsible for points to the state.points
    }
    for (var j = 0; j < nums.length; j++) {
      if (sumNumbers - nums[j] === 15) { //Counts combos of 4 cards
        score += increment;
        points.push(this.state.cards.slice(0,j).concat(this.state.cards.slice(j+1)),increment); //omits the one card not responsible
      }
      for (var k = j + 1; k < nums.length; k++) {
        if (nums[j] + nums[k] === 15) { //Counts combos of 2 cards
          score += increment;
          points.push([this.state.cards[j]].concat([this.state.cards[k]]),increment); //includes the 2 cards responsible
        }
        if (sumNumbers - nums[j] - nums[k] === 15) { //Counts combos of 3 cards
          score += increment;
          points.push(this.state.cards.slice(0,j).concat(this.state.cards.slice(j+1,k).concat(this.state.cards.slice(k+1))),increment)

        }
      }
    }
    if (points.length === 0) {
      return [score, null];
    }
    return [score, points];
  } //fifteenCounter
  runCounter (cards) { //counts runs
    var onlyNumbers = [], points = [];
    for (var j = 0; j < cards.length; j++) { //assigns numerical values to face cards/aces
      cards[j][0] === 'J' ? onlyNumbers.push([11,j]) : cards[j][0] === 'Q' ? onlyNumbers.push([12,j]) : cards[j][0] === 'K' ? onlyNumbers.push([13,j]) : cards[j][0] === 'A' ? onlyNumbers.push([1,j]) : onlyNumbers.push([Number(cards[j][0]),j]);
    }
    var numbers = onlyNumbers.sort(function sortIt(a,b) {
      if (a[0] > b[0]) {
        return 1;
      }
      else if (a[0] < b[0]) {
        return -1;
      }
      return 0;
    }); //sorts numbers
      var i = 0, counter = 0, pairMult = 1, score = 0; //Counter keeps track of amount of cards in a row, pairMult is the multiplier that assigns points based on multiple runs
      while (i < numbers.length - 1) {
        if (numbers[i][0] + 1 === numbers[i+1][0]) { //numbers in a row
          counter += 1;
          if (points[points.length - 1] !== cards[numbers[i][1]]) {
            points.push(cards[numbers[i][1]]);
          }
          points.push(cards[numbers[i + 1][1]]);
        }
        else if (i < 3 && (numbers[i][0] === numbers[i+1][0] && numbers[i+1][0] === numbers[i+2][0])) { //triples
          pairMult += 2;
          points.push(cards[numbers[i + 1][1]])
          i++; //skips the 3rd pair, already accounted for
        }


        else if (numbers[i][0] === numbers[i+1][0]) { //doubles, accounts for 2 doubles
          if (pairMult === 1) { //if this is first double, double multiplier
            pairMult += 1;
          }
          else {
            pairMult += 2; //if this is second double, double a second time (x4)
          }
          if (points[points.length - 1] !== cards[numbers[i][1]]) {
            points.push(cards[numbers[i][1]]);
          }
          points.push(cards[numbers[i + 1][1]]);
        }
        else if (counter < 2) { //Non run numbers without a run already (reset basically)
          counter = 0;
          pairMult = 1;
          points = [];
        }
        else { //If a run has occured, breaks off function to avoid doubles not in run
          break;
        }

        i++;
      }
    if (counter >= 2) { //Counts run
      score += pairMult * (counter + 1);
      return [score, [points,score]];
    }
    return [0,null];
  } //runCounter
  flushCounter (input) { //Counts flushes
    var suits = ["♣","♦","♥","♠"], score = 0;
    for(var i = 0; i < 4; i++) { //iterates through each suit
      var counter = 0;
      for (var j = 0; j < 4; j++) { //iterates through hand cards and adds to counter
        if (input[j][1] === suits[i]) {
          counter += 1;
        }
      }
      if (counter >= 4 && input[4][1] === suits[i]) { //if a flush is achieved, checks crib card for 1 more point
        counter += 1
        return [counter, [this.state.cards, counter]];
      }
      if (counter >= 4) { //adds to score
        score += counter;
        if (this.state.selectedRadio === "crib" && score < 5) { //if it is a crib and the 5th card is not consistent with flush, returns score of 0
          return[0];
        }
        return [score, [this.state.cards.slice(0,this.state.cards.length - 1), score]];
      }
    }
    return [0, null];
  } //flushCounter
  pairCounter (input, increment) { //Counts Pairs
    var score = 0, points = [];
    for(var i = 0; i < 4; i++) {
        var j = i + 1;
      while(j <= 4) {
        if(input[i][0] === input[j][0]) {
          score += increment;
          points.push([this.state.cards[i],this.state.cards[j]],increment)
        }
        j++;
      }
    }
    if (points.length === 0) {
      return [score, null];
    }
    return [score,points];
  } //pairCounter
  heelNob (input) {  //***NOT IN THE LAST 5 POINTS***
    //heels
    if (input[4][0] === "J" && this.state.selectedRadio === 'dealer') { //if crib card is a jack and dealer is true
      return [2, [input[4]]];
    }
    //nobs
    for (var i = 0; i < 4; i++) {
      if (input[i][0] === 'J' && input[i][1] === input[4][1]) { //checks if cards are a jack & if suit matches crib card
        return [1, [this.state.cards[i],1]];
      }
    }
    return [0,null];
  } //heelNob
  handleColors() {
    for (var i = 0; i < this.state.cards.length; i++) {
      if (this.state.cards[i][0] === this.state.number) {
        document.getElementById(this.state.cards[i][1]).setAttribute("style", "pointer-events: none; color: transparent;");
      }
      else if (this.state.suit === '' && this.state.number === '') {
        document.getElementById(this.state.cards[i][1]).removeAttribute("style", "pointer-events: none; color: transparent;");
        document.getElementById(this.state.cards[i][0]).removeAttribute("style", "pointer-events: none; color: transparent;");

      }
      else if (this.state.cards[i][1] === this.state.suit) {
        document.getElementById(this.state.cards[i][0]).setAttribute("style", "pointer-events: none; color: transparent;");
      }
    }
  }
  handleRadio (event) {
    this.setState({
      selectedRadio: event.target.value
    });
  }
  handleReset () {
    this.setState({
      cards: [],
      number: '',
      suit: '',
      score: 0,
      selectedRadio: 'regular',
      points: []
    });
  }
  handleRemove (event) {
    for(var i = 0; i < this.state.cards.length; i++) {
      if (this.state.cards[i][0] === event.target.id[0] && this.state.cards[i][1] === event.target.id[2]) {
        this.setState({
          cards: this.state.cards.slice(0,i).concat(this.state.cards.slice(i+1))
        })
      }
    }
  }
  render() {

    return (
      <div className="fullWrapper">
        <Cards cards = {this.state.cards} handleRemove = {this.handleRemove}/>
        <div id = "inputWrapper">
          <HandType handleClick = {this.handleRadio} selectedRadio = {this.state.selectedRadio}/>
          <div id ="score">Score: {this.state.score}</div>
        </div>
        <div className="buttonWrapper">
          <CardSuits labels = {this.props.suits} handleClick = {this.handleClickTop} suit = {this.state.suit} cards = {this.state.cards}/>
          <CardNumbers labels = {this.props.numbers} handleClick = {this.handleClickTop} number = {this.state.number} cards = {this.state.cards} reset = {this.handleReset}/>
        </div>
      </div>
    );
  }
}
App.defaultProps = {
  numbers: ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'],
  suits: ['♣','♦','♥','♠']
}
class HandType extends Component {
  render() {
    return (
      <div id = "formWrapper">
        <form>
          <label>
            <input type="radio" value="regular" checked={this.props.selectedRadio === 'regular'} onChange = {this.props.handleClick} />
            Regular
          </label>
          <label>
            <input type="radio" value="dealer" checked={this.props.selectedRadio === 'dealer'} onChange = {this.props.handleClick} />
            Dealer
          </label>
          <label>
            <input type="radio" value="crib" checked={this.props.selectedRadio === 'crib'} onChange = {this.props.handleClick} />
            Crib
          </label>
        </form>
      </div>
    );
  }

}
class Cards extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.cards !== this.props.cards) {
      return true;
    }
    else {
      return false;
    }
  }
  /*componentDidUpdate() {
    const yo = this.props.cards.map(i => <div id = {i} key = {i}>{i}</div>)
  } */
  //const yo = this.props.cards;
  render() {
    const cardDisplay = this.props.cards.map(i =>
    <div key = {"cardWrapperInside" + i}  id = "cardWrapperInside">
      <div className = "cardDisplay" id = {i[1]+"top"} key = {i}>
        <div id = "topLeft">{i}</div>
        <div id = "middleSuit">{i[1]}</div>
        <div id = "bottomRight">{i}</div>
      </div>
      <div className = "removeCard">
        <div className = "remove" onClick={this.props.handleRemove}>
          <i id = {i} className="material-icons">close</i>
        </div>
      </div>
    </div>
)

    return (
      <div id = "cardWrapper">
        {cardDisplay}
      </div>
    );
  }
}
class CardNumbers extends Component {
  constructor(props) {
    super(props);
  // BINDINGS
    this.passData = this.passData.bind(this);
    this.getColor = this.getColor.bind(this);
  }
  passData(e) {
    this.props.handleClick(e.target.id);
  }
  getColor(id) {
    if (this.props.number === String(id)) {
      return '#5792f2';
    }

  }
  render() {
    const numberLabels = this.props.labels.map(i => <div className = "buttons" id = {i} key = {i} onClick = {this.passData} style = {{color: this.getColor(i)}}>{i}</div>)
    return (
      <div id = "numberWrapper">
        {numberLabels}
        <div id = "reset" onClick = {this.props.reset}>Reset</div>
      </div>
    );
  }
}
class CardSuits extends Component {
  constructor(props) {
    super(props);
  // BINDINGS
    this.passData = this.passData.bind(this);
    this.getColor = this.getColor.bind(this);

  }
  passData(e) {
    this.props.handleClick(e.target.id);
  }
  getColor(id) {
    if (this.props.suit === String(id)) {
      return '#5792f2';
    }

  }
  render() {
    const suits = this.props.labels.map(i => <div className = "buttons" id = {i} key = {i} onClick = {this.passData} style = {{color: this.getColor(i)}}>{i}</div>)
    return (
      <div id = "suitWrapper">
        {suits}
      </div>
    );
  }
}
export default App;
