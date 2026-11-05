// starting values
let current = "0"; // current number being typed
let result = 0; // total result
let prev = null; // math symbol that should be applied once = clicked
let done = false; // has = been clicked? 

const display = document.querySelector(".display");
// event listened for button section
document.querySelector(".calculator-buttons").addEventListener("click", function (event) {
    // if not actually a button, no action needs to be taken
    if (event.target.tagName !== "BUTTON") {
        return;
    }
    // data-value for symbol + innertext for numbers
    const value = event.target.dataset.value || event.target.innerText;
    // if it is not a number, it is a symbol
    if (isNaN(value)) {
        processNonNumber(value);
    } else {
        processNumber(value);
    }

    // update current displayed value based on entry
    if (prev === null) {
        display.innerText = current;
    } else {
        display.innerText = result + prev + current;
    }
})

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
    } else {
        // concat strings 
        current += num;
    }
}

function processNonNumber(symbol) {
    if (symbol === 'C') { // reset
        current = "0";
        result = 0;
        prev = null;
    } else if (symbol === "back") {
        done = false;
        if (current.length <= 1) { // last removed, so back to default
            current = "0";
        } else {
            // take all but last entry
            current = current.substring(0, current.length - 1);
        }
    } else if (symbol === '=') {
        if (prev === null || current === "") {
            return;
        } else {
            calc(parseFloat(current));
            // reset and set new current value based on calc result
            prev = null;
            current = String(result);
            result = 0;
            done = true;
        }
    } else {
        processOperation(symbol);
    }
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
    }
    // save and reset
    prev = symbol;
    current = "";
}

function calc(number) {
    if (prev === '*') {
        result *= number;
    } else if (prev === '/') {
        result /= number;
    } else if (prev === '+') {
        result += number;
    } else if (prev === '-') {
        result -= number;
    }
}