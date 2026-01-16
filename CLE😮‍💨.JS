// Improved calculator script: button-only handling, keyboard support, chained ops, copy
(function(){
    const display = document.getElementById('display');
    const keys = document.querySelector('.calculator .keys');
    const copyBtn = document.getElementById('copy');

    let current = '0';
    let previous = null;
    let operator = null;
    let waitingForNewNumber = false;

    function updateDisplay(){
        display.value = String(current);
    }

    function clearAll(){ current = '0'; previous = null; operator = null; waitingForNewNumber = false; updateDisplay(); }

    function backspace(){
        if(waitingForNewNumber) return;
        if(current.length <= 1) current = '0'; else current = current.slice(0, -1);
        updateDisplay();
    }

    function inputDigit(d){
        if(waitingForNewNumber){ current = d; waitingForNewNumber = false; }
        else current = current === '0' ? d : current + d;
        updateDisplay();
    }

    function inputDecimal(){
        if(waitingForNewNumber){ current = '0.'; waitingForNewNumber = false; }
        else if(!current.includes('.')) current += '.';
        updateDisplay();
    }

    function performOperation(nextOperator){
        const inputValue = parseFloat(current);
        if(operator && waitingForNewNumber){ operator = nextOperator; return; }
        if(previous == null){ previous = inputValue; }
        else if(operator){
            let result = 0;
            switch(operator){
                case 'add': result = previous + inputValue; break;
                case 'subtract': result = previous - inputValue; break;
                case 'multiply': result = previous * inputValue; break;
                case 'divide': result = inputValue === 0 ? 'Error' : previous / inputValue; break;
            }
            previous = (result === 'Error') ? null : result;
            current = result === 'Error' ? 'Error' : String(roundResult(result));
        }
        waitingForNewNumber = true;
        operator = nextOperator;
        updateDisplay();
    }

    function roundResult(num){
        if(typeof num !== 'number') return num;
        return Math.round((num + Number.EPSILON) * 1e12) / 1e12; // avoid floating errors
    }

    // Button clicks
    keys.addEventListener('click', (e)=>{
        if(!e.target.matches('button')) return;
        const id = e.target.id;
        if(id === 'clear') { clearAll(); }
        else if(id === 'backspace') { backspace(); }
        else if(['add','subtract','multiply','divide'].includes(id)){ performOperation(id); }
        else if(id === 'decimal'){ inputDecimal(); }
        else if(id === 'equals'){ performOperation(null); operator = null; previous = null; waitingForNewNumber = false; }
        else {
            // assume numeric button
            const v = e.target.textContent.trim();
            if(/^[0-9]$/.test(v)) inputDigit(v);
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e)=>{
        if(e.key >= '0' && e.key <= '9') { inputDigit(e.key); e.preventDefault(); }
        else if(e.key === '.') { inputDecimal(); e.preventDefault(); }
        else if(e.key === 'Backspace') { backspace(); e.preventDefault(); }
        else if(e.key === 'Escape') { clearAll(); }
        else if(e.key === 'Enter' || e.key === '=') { performOperation(null); operator = null; previous = null; waitingForNewNumber = false; e.preventDefault(); }
        else if(e.key === '+') { performOperation('add'); }
        else if(e.key === '-') { performOperation('subtract'); }
        else if(e.key === '*') { performOperation('multiply'); }
        else if(e.key === '/') { performOperation('divide'); }
    });

    if(copyBtn){
        copyBtn.addEventListener('click', async ()=>{
            try{
                await navigator.clipboard.writeText(display.value);
                copyBtn.textContent = 'Copied';
                setTimeout(()=> copyBtn.textContent = 'Copy', 1200);
            }catch(err){
                copyBtn.textContent = 'Failed';
                setTimeout(()=> copyBtn.textContent = 'Copy', 1200);
            }
        });
    }

    // initialize
    clearAll();
})();