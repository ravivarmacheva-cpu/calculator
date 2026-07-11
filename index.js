
(function(){
    const display = document.getElementById('display');
    const opRow = document.getElementById('opRow');
    const stage = document.getElementById('stage');
  
    let current = '0';
    let previous = null;
    let operator = null;
    let justEvaluated = false;
    let pendingNewNumber = false;
  
    const MAX_DIGITS = 12;
  
    function formatNumber(numStr){
      if (numStr === 'Error') return numStr;
      let num = parseFloat(numStr);
      if (Object.is(num, -0)) num = 0;
      if (Math.abs(num) > 999999999999) return num.toExponential(5);
      let str = numStr;
      if (str.length > MAX_DIGITS + 1 && str.includes('.')) {
        str = parseFloat(str).toPrecision(MAX_DIGITS - String(Math.trunc(num)).replace('-','').length);
        str = parseFloat(str).toString();
      }
      return str;
    }
  
    function updateDisplay(){
      display.textContent = formatNumber(current);
      if (operator && previous !== null){
        opRow.textContent = `${formatNumber(previous)} ${operator}`;
      } else {
        opRow.innerHTML = '&nbsp;';
      }
    }
  
    function clearAll(){
      current = '0';
      previous = null;
      operator = null;
      justEvaluated = false;
      pendingNewNumber = false;
      updateDisplay();
    }
  
    function toggleSign(){
      if (current === '0') return;
      current = current.startsWith('-') ? current.slice(1) : '-' + current;
      updateDisplay();
    }
  
    function percent(){
      current = String(parseFloat(current) / 100);
      updateDisplay();
    }
  
    function compute(a, b, op){
      a = parseFloat(a); b = parseFloat(b);
      switch(op){
        case '+': return a + b;
        case '−': return a - b;
        case '×': return a * b;
        case '÷': return b === 0 ? NaN : a / b;
        default: return b;
      }
    }
  
    function setOperator(op){
      if (operator && previous !== null && !pendingNewNumber && !justEvaluated){
        const result = compute(previous, current, operator);
        current = isNaN(result) || !isFinite(result) ? 'Error' : String(result);
      }
      previous = current;
      operator = op;
      pendingNewNumber = true;
      updateDisplay();
    }
  
    function inputDigit(d){
      if (pendingNewNumber || justEvaluated){
        current = d;
        pendingNewNumber = false;
        justEvaluated = false;
      } else if (current === '0'){
        current = d;
      } else if (current.replace('-','').length < MAX_DIGITS) {
        current += d;
      }
      updateDisplay();
    }
  
    function inputDecimal(){
      if (pendingNewNumber || justEvaluated){
        current = '0.';
        pendingNewNumber = false;
        justEvaluated = false;
      } else if (!current.includes('.')){
        current += '.';
      }
      updateDisplay();
    }
  
    function equals(){
      if (operator === null || previous === null) return;
      const result = compute(previous, current, operator);
      current = isNaN(result) || !isFinite(result) ? 'Error' : String(result);
      previous = null;
      operator = null;
      justEvaluated = true;
      pendingNewNumber = false;
      updateDisplay();
    }
  
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
      key.addEventListener('click', () => {
        const action = key.dataset.action;
        const value = key.dataset.value;
  
        switch(action){
          case 'digit': inputDigit(value); break;
          case 'decimal': inputDecimal(); break;
          case 'clear': clearAll(); break;
          case 'sign': toggleSign(); break;
          case 'percent': percent(); break;
          case 'operator': setOperator(value); break;
          case 'equals': equals(); break;
        }
      });
    });
  
    // keyboard support
    window.addEventListener('keydown', (e) => {
      const k = e.key;
      let selector = null;
      if (/^[0-9]$/.test(k)) { inputDigit(k); selector = `[data-action="digit"][data-value="${k}"]`; }
      else if (k === '.') { inputDecimal(); selector = '[data-action="decimal"]'; }
      else if (k === '+') { setOperator('+'); selector = '[data-value="+"]'; }
      else if (k === '-') { setOperator('−'); selector = '[data-value="−"]'; }
      else if (k === '*') { setOperator('×'); selector = '[data-value="×"]'; }
      else if (k === '/') { e.preventDefault(); setOperator('÷'); selector = '[data-value="÷"]'; }
      else if (k === 'Enter' || k === '=') { equals(); selector = '[data-action="equals"]'; }
      else if (k === 'Escape') { clearAll(); selector = '[data-action="clear"]'; }
      else if (k === '%') { percent(); selector = '[data-action="percent"]'; }
      else if (k === 'Backspace') {
        current = current.length > 1 ? current.slice(0, -1) : '0';
        updateDisplay();
      }
  
      if (selector){
        const el = document.querySelector(selector);
        if (el){
          el.classList.add('pressed');
          setTimeout(() => el.classList.remove('pressed'), 110);
        }
      }
    });
  
    // mouse parallax tilt for real 3D feel
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    document.addEventListener('mousemove', (e) => {
      const px = (e.clientX / window.innerWidth) - 0.5;
      const py = (e.clientY / window.innerHeight) - 0.5;
      targetX = px * 18;
      targetY = py * -14;
    });
  
    function animate(){
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      stage.style.transform = `rotateY(${curX}deg) rotateX(${curY}deg)`;
      requestAnimationFrame(animate);
    }
    animate();
  
    updateDisplay();
  })();