// starting values
let current = "0"; // current number being typed
let result = 0; // total result
let prev = null; // math symbol that should be applied once = clicked
let done = false; // has = been clicked?
let prevOperation = null; // last symbol used by = (so pressing = again can repeat it)
let prevNumber = null; // last number used by = (so pressing = again can repeat it)
let error = false; // did the last calculation fail? (e.g. divide by zero)

// symbols shown on screen
const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷", "%": "%" };

const display = document.querySelector(".display");

// most digits a typed number can have (so it fits on screen without needing wrapping)
const MAX_DIGITS = 12;

// map keys to the same values the buttons use (for keyboard support)
const keys = {
    "+": "+", "-": "-", "*": "*", "/": "/", "%": "%", "=": "=", ".": ".",
    "C": "C", "c": "C",
    "Enter": "=", "Backspace": "back", "Escape": "C",
};

// runs once when the page loads: connects the buttons and keyboard to the calculator
function init() {
    // event listened for button section
    document.querySelector(".calculator-buttons").addEventListener("click", function (event) {
        // find the button that was clicked 
        const button = event.target.closest("button");
        if (button === null) {
            return;
        }
        // data-value for symbol + text for numbers
        const value = button.dataset.value || button.textContent;
        handleInput(value);
    })

    document.addEventListener("keydown", function (event) {
        // skip browser shortcuts
        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }
        // digits stay digits
        // nonnumeric via keys map
        const value = /^[0-9]$/.test(event.key) ? event.key : keys[event.key];
        if (value === undefined) { // key isn't used by the calculator
            return;
        }
        // stop default behavior
        event.preventDefault();
        handleInput(value);
    })

    render(); // show starting value
}

// how to handle input via either clicking on button or through keyboard
function handleInput(value) {
    error = false;
    // if it is not a number, it is a symbol
    if (isNaN(value)) {
        processNonNumber(value);
    } else {
        processNumber(value);
    }

    // calculation failed, so start fresh on next input
    if (error) {
        reset();
    }
    render();
}

// update the screen
function render() {
    if (error) {
        display.textContent = "Error";
    } else if (prev === null) {
        display.textContent = current;
    } else {
        display.textContent = format(result) + symbols[prev] + current;
    }

    // shrink font until the text fits on one line
    let size = 40;
    display.style.fontSize = ""; // back to the 40px from style.css
    while (display.scrollWidth > display.clientWidth && size > 16) {
        size -= 1;
        display.style.fontSize = size + "px";
    }
}

// number --> text for the screen
// scientific notation for 12-digit+ numbers 
function format(number) {
    if (Math.abs(number) >= 10 ** MAX_DIGITS) {
        return number.toExponential();
    }
    return String(number);
}

function reset() {
    current = "0";
    result = 0;
    prev = null;
    done = false;
    prevOperation = null;
    prevNumber = null;
}

function processNumber(num) {
    // start new calc bc = was just clicked
    if (done) {
        current = num;
        done = false;
        return;
    }

    // OR continue calc if not = recently
    if (current === "0" || current === "") {
        // instead of 02 it should be 2 (i.e. no starting 0)
        current = num;
    } else if (current.replace(/[-.]/g, "").length < MAX_DIGITS) {
        // concat strings if under the digit limit so typed numbers fit without wrapping
        current += num;
    }
}

function processNonNumber(symbol) {
    // switch-case statement for easy readibility and cleanliness
    // (vs. if-else)
    switch (symbol) {
        case "C": // reset
            reset();
            break;
        case "back":
            deleteLast();
            break;
        case "=":
            processEquals();
            break;
        case ".": // new functionality
            makeDecimal();
            break;
        case "negative":
            makeNegative();
            break;
        default: // +, -, *, /, %
            processOperation(symbol);
    }
}

function deleteLast() {
    done = false;
    if (current.length <= 1 || current === '-' || (current.length === 2 && current.startsWith('-')) || current.includes("e")) { // last removed, so back to default
        current = "0";
    } else {
        // take all but last entry
        current = current.substring(0, current.length - 1);
    }
}

function processEquals() {
    if (prev !== null && current !== "") {
        // remember operation so pressing = again can repeat it
        // (since this is what real ios calculator does) 
        prevOperation = prev;
        prevNumber = parseFloat(current);
        calc(prevNumber);
    } else if (prev === null && done && prevOperation !== null) {
        // = pressed again
        // so we need to repeat last operation on the result (e.g. 8 / 2 = 4, = 2, = 1)
        result = parseFloat(current);
        prev = prevOperation;
        calc(prevNumber);
    } else {
        return;
    }
    if (error) {
        return;
    }
    // reset and set new current value based on calc result
    prev = null;
    current = format(result);
    result = 0;
    done = true;
}

function processOperation(symbol) {
    if (current === "") {
        prev = symbol;
        return;
    }
    const num = parseFloat(current); // string --> number
    if (prev === null) {
        result = num;
    } else {
        // there is pending symbol, so need to calculate
        calc(num);
        if (error) {
            return;
        }
    }
    // save and reset
    prev = symbol;
    current = "";
}

function calc(number) {
    switch (prev) {
        case "*":
            result = result * number;
            break;
        case "/":
            result = result / number;
            break;
        case "+":
            result = result + number;
            break;
        case "-":
            result = result - number;
            break;
        case "%": // extra functionality: modulo
            result = result % number;
            break;
    }
    // dividing by zero gives infinity or nan so flagging this as error
    if (!isFinite(result)) {
        error = true;
        return;
    }
    // round to 12 significant digits 
    // parseFloat removes trailing zeros
    result = parseFloat(result.toPrecision(12));
}

function makeNegative() {
    if (current === "" || current === "0") { // no sign flip
        return;
    }
    if (current.startsWith("-")) {
        // remove leading - to make positive
        current = current.substring(1);
    } else {
        current = '-' + current;
    }
}

function makeDecimal() {
    // new number, so start with 0.__
    if (done || current === "") {
        current = "0.";
        done = false;
        return;
    }
    // if current doesnt already have a decimal, then we can add one
    if (!current.includes(".")) {
        current += ".";
    }
}

// start the calculator
init();