/*  ________   _
 * |  __ \  \ | |
 * | |__| |  \| | Author: Rob Niemeyer
 * |  _  / |\   | https://coreteam.com.br
 * |_| \_\_| \__| https://smallunit.github.io
 */

/* Input Rules
 */

// Redimensona verticalmente o elemento para ajustar ao tamanho do texto
function resizeTextareaVerticallyToFitText(element) {
  element.removeAttribute('style');
  element.style.height = element.scrollHeight + 'px';
};

// Remove todos os caracteres não permitidos e espaços consecutivos
function removeDisallowedCharacters(string) {
  // Primeiramente, converte tudo para minúsculo
  string = string.toLowerCase();
  // Converte as vogais acentuadas e cedilhas em caracteres regulares através de seus respectivos códigos unicode
  string = string.replace(/[\u00E0-\u00E5]+/g, 'a');
  string = string.replace(/[\u00E7]+/g, 'c');
  string = string.replace(/[\u00E8-\u00EB]+/g, 'e');
  string = string.replace(/[\u00EC-\u00EF]+/g, 'i');
  string = string.replace(/[\u00F2-\u00F6]+/g, 'o');
  string = string.replace(/[\u00F9-\u00FC]+/g, 'u');
  // Restringe a entrada de texto aos caracteres permitidos através de seus respectivos códigos unicode
  string = string.replace(/[^\u0061-\u007A\s]+/g, '');
  return string;
}

// Evita que o cursor de texto perca a posição quando o método replace é chamado
const textCursorPosition = {
  _previousLength: 0,
  _selectionStart: 0,
  _selectionEnd: 0,
  _inputType: '',
  save: function (element, inputType) {
    this._previousLength = element.value.length;
    this._selectionStart = element.selectionStart;
    this._selectionEnd = element.selectionEnd;
    this._inputType = inputType;
  },
  restore: function (input) {
    const currentLength = input.value.length;
    let cursorPosition = this._selectionStart;
    // Se o usuário incrementou o tamanho da cadeia, move o cursor para a direita na mesma quantidade de caracteres inseridos
    if (this._previousLength < currentLength) {
      cursorPosition = this._selectionEnd + (currentLength - this._previousLength);
    // Se o usuário removeu um único caractere com backspace e sem realizar uma seleção de texto, move o cursor uma casa para a esquerda
    } else if (this._inputType === 'deleteContentBackward' && this._selectionStart === this._selectionEnd) {
      cursorPosition = this._selectionStart - 1;
    // Se o usuário diminuiu ou manteve o tamanho da cadeia, selecionando e colando
    } else if (currentLength <= this._previousLength && this._selectionStart !== this._selectionEnd) {
      cursorPosition = currentLength - (this._previousLength - this._selectionEnd);
    }
    // Para todos os outros casos, mantém o cursor na posição inicial
    // Finalmente, insere o cursor de texto na posição desejada
    input.focus();
    input.setSelectionRange(cursorPosition, cursorPosition);
  }
}

// Remove os espaços excessivos no input
function removeExtraSpaces(string) {
  return string.replace(/\s+/g, ' ').trim();
}

/* End Input Rules
 * Data Converter
 */

// Verifica se há uma query string e, se houver, retorna seu valor
function checkForQueryString(string) {
  const url = new URL(window.location);
  const params = new URLSearchParams(url.search);
  if(params.has(string) && params.get(string) !== '') {
    return params.get(string);
  }
  return false;
}

// Substitui o caracter em uma dada posição na cadeia pelo valor desejado
function replaceCharAt(index, replacement, string) {
  return string.substring(0, index) + replacement + string.substring(++index);
}

// Criptografar a mensagem
function encrypt(string) {
  // Regras da criptografia
  const encryptionRules = {
    a: 'ai',
    e: 'enter',
    i: 'imes',
    o: 'ober',
    u: 'ufat'
  };
  // Substitui os caracteres pelas cadeias definidas, em ordem decrescente
  let index = string.length;
  while(0 <= --index) {
    switch(string.charAt(index)) {
      case 'a':
        string = replaceCharAt(index, encryptionRules.a, string);
        break;
      case 'e':
        string = replaceCharAt(index, encryptionRules.e, string);
        break;
      case 'i':
        string = replaceCharAt(index, encryptionRules.i, string);
        break;
      case 'o':
        string = replaceCharAt(index, encryptionRules.o, string);
        break;
      case 'u':
        string = replaceCharAt(index, encryptionRules.u, string);
        break;
    }
  }
  return string;
}

// Descriptografa a mensagem
function decrypt(string) {
  // Regras da descriptografia usando expressões regulares
  const decryptionRules = {
    a: /ai/g,
    e: /enter/g,
    i: /imes/g,
    o: /ober/g,
    u: /ufat/g
  };
  // Para cada propriedade no objeto, realiza a substituição na cadeia de acordo com seu valor
  for (const property in decryptionRules) {
    string = string.replace(decryptionRules[property], property);
  }
  return string;
}

// Define se uma mensagem será criptografada ou descriptografada
function convertTheMessage(string) {
  if (checkForQueryString('encrypt') && checkForQueryString('encrypt') === 'true') {
    string = encrypt(string);
  } else if (checkForQueryString('decrypt') && checkForQueryString('decrypt') === 'true') {
    string = decrypt(string);
  }
  return string;
}

// Finalmente, exibe o resultado na página
function showMessage(string) { 
  document.getElementById('instructions').style.display = 'none';
  document.getElementById('card').classList.add('tornado');
  document.getElementById('message').style.display = 'grid';
  setTimeout(function () {
    document.getElementById('output').textContent = convertTheMessage(string);
  }, 200);
}

/* End Data Converter
 * Clipboard
 */

// Copia o texto para a área de transferência do usuário
function copyToClipboard(string) {
  navigator.clipboard.writeText(string);
}

// Exibe o tooltip
function showTooltip(element) {
  element.style.visibility = 'visible';
  element.style.opacity = 1;
  // Dispensa o tooltip após 1.2 segundos
  setTimeout(function () {
    element.style.opacity = 0;
    setTimeout(function () {
      element.style.visibility = 'hidden';
    }, 200);
  }, 1000);
}

/* End Clipboard
 * Page Load
 */

// Atribui as funções ao input quando a página é carregada
window.addEventListener('load', function () {
  const input = document.getElementById('input');

  /* Input Rules
   */

  const form = document.getElementById('form');
  // Dispara o evento sempre que o valor de um input ou textarea está a ponto de sofrer uma alteração
  input.addEventListener('beforeinput', function (event) {
    // Salva a posição do cursor de texto antes do valor ser inserido no input
    textCursorPosition.save(input, event.inputType);
  });
  // Dispara o evento somente após o valor de um input ou textarea ter sofrido uma alteração
  input.addEventListener('input', function (event) {
    resizeTextareaVerticallyToFitText(input);
    // Atribui as regras da aplicação ao input
    input.value = removeDisallowedCharacters(input.value);
    // Restaura a posição do cursor de texto
    textCursorPosition.restore(input);
  });
  // Remove espaços excessivos no texto ao enviar o formulário
  form.addEventListener('submit', function (event) {
    input.value = removeExtraSpaces(input.value);
    // Envia o form somente se o input não estiver vazio
    if ('' === input.value.trim()) {
      input.focus();
      event.preventDefault();
    }
  });

  /* End Input Rules
   * Data Converter
   */

  // Se houver mensagem na query string, carrega-a
  const queryMessage = checkForQueryString('message');
  if (queryMessage) {
    input.value = removeDisallowedCharacters(queryMessage);
    showMessage(removeDisallowedCharacters(queryMessage));
  }

  /* End Data Converter
   * Clipboard
   */

  const button = document.getElementById('copy-button');
  const paragraph = document.getElementById('output');
  const tooltip = document.getElementById('tooltip');
  button.addEventListener('click', function () {
    copyToClipboard(paragraph.textContent);
    showTooltip(tooltip);
  });
});

