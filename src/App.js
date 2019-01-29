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
      score: 0
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
    if (this.state.cards.length > 4) { //Don't update after 5 cards ***Will have to change
      if (nextState.score !== this.state.score || nextState.selectedRadio !== this.state.selectedRadio || nextState.cards !== this.state.cards) { //Exception if score is being updated
        return true;
      }
      else {
        return false; //Possibly change
      }
    }

    else {
      return true;
    }
  }
  componentDidUpdate() {
    //this.handleAddition();
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
  scoreCrib (input) {
    var nums = [];
    for (var i = 0; i < input.length; i++) {
      input[i][0] === 'J' ? nums.push(11) : input[i][0] === 'Q' ? nums.push(12) : input[i][0] === 'K' ? nums.push(13) : input[i][0] === 'A' ? nums.push(1) : nums.push(Number(input[i][0]));
    }
      this.setState({
        score: this.pairCounter(input) + this.flushCounter(input) + this.heelNob(nums, input) + this.runCounter(nums) + this.fifteenCounter(nums)
      }); //only one because this function will count each pair twice
  }
  fifteenCounter (cards) {
    var score = 0;
    var sumNumbers = 0;
    for (var i = 0; i < cards.length; i++) {
      if (cards[i] > 10) {
        cards.splice(i,1,10); //replaces jack,queen,king with 10 for adding purposes
      }
      sumNumbers += cards[i]; //adds numbers with replaced cards for following function
    }
    if (sumNumbers === 15) { //Counts combos of 5 cards
      score += 2;
    }
    for (var j = 0; j < cards.length; j++) {
      if (sumNumbers - cards[j] === 15) { //Counts combos of 4 cards
        score += 2;
      }
      for (var k = j + 1; k < cards.length; k++) {
        if (cards[j] + cards[k] === 15) { //Counts combos of 2 cards
          score += 2;
        }
        if (sumNumbers - cards[j] - cards[k] === 15) { //Counts combos of 3 cards
          score += 2;
        }
      }
    }
    return score;
  } //fifteenCounter
  runCounter (cards) { //counts runs
    var numbers = cards.sort(function sortIt(a,b) {return a - b;});
      //console.log(numRemoved[0],numbers);
      var i = 0, counter = 0, pairMult = 1, score = 0;
      while (i < numbers.length) {
        if (numbers[i] + 1 === numbers[i+1]) { //numbers in a row
          counter += 1;
        }
        else if (numbers[i] === numbers[i+1] && numbers[i+1] === numbers[i+2]) { //triples
          pairMult += 2;
          i++; //skips the 3rd pair, already accounted for
        }
        else if (numbers[i] === numbers[i+1]) { //doubles, accounts for 2 doubles
          if (pairMult === 1) {
            pairMult += 1;
          }
          else {
            pairMult += 2;
          }
        }
        else if (counter < 2) { //Non run numbers without a run already
          counter = 0;
          pairMult = 1;
        }
        else { //If a run has occured, breaks off function to avoid doubles not in run
          break;
        }
        i++;
      }
    if (counter >= 2) { //Counts run
      score += pairMult * (counter + 1);
    }
    return score;
  } //runCounter
  flushCounter (input) { //Counts flushes
    var suits = ["♣","♦","♥","♠"], score = 0;
    for(var i = 0; i < 4; i++) {
      var counter = 0;
      for(var j = 0; j < 4; j++) {
        if(input[j][1] === suits[i]) {
          counter += 1;
        }
      }
      if (counter >= 4 && input[4][1] === suits[i]) {
        counter += 1
      }
      if (counter >= 4) {
        score += counter;
      }
    }
    if (this.state.selectedRadio === "crib" && score < 5) {
      score = 0;
    }
    return score;
  } //flushCounter
  pairCounter (input) { //Counts Pairs
    var score = 0;
    for(var i = 0; i < 4; i++) {
        var j = i + 1;
      while(j <= 4) {
        if(input[i][0] === input[j][0]) {
          score += 2;
        }
        j++;
      }
    }
    return score;
  } //pairCounter
  heelNob (nums,input) {  //***NOT IN THE LAST 5 POINTS***
    //heels
    var score = 0;
    if (nums[4] === 11 && this.state.selectedRadio === 'dealer') { //if crib card is a jack and dealer is true
      score += 2;
    }
    //nobs
    for(var i = 0; i < 4; i++) {
      if (input[i][0] === 'J' && input[i][1] === input[4][1]) { //checks if cards are a jack & if suit matches crib card
        score += 1;
      }
    }
    return score;
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
      selectedRadio: 'regular'
    });
  }
  handleRemove (event) {
    for(var i = 0; i < this.state.cards.length; i++) {
      console.log(event.target);
      if (this.state.cards[i][0] === event.target.id[0] && this.state.cards[i][1] === event.target.id[2]) {
        console.log(this.state.cards.slice(0,i).concat(this.state.cards.slice(i+1)))
        this.setState({
          cards: this.state.cards.slice(0,i).concat(this.state.cards.slice(i+1)) //[this.state.cards.slice(0,i),this.state.cards.slice(i+1)]
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
      return 'blue';
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
      return 'blue';
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
