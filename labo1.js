/* Objet float qui contient toutes les valeurs nécessaire aux
différents calcul durant l'execution du programme. l'objet est créé avec
des valeurs par défaut, à savoir tous les bits à 0, encodé sur 32 bits.*/
var Float = function() {
  this.nbBits = 32;

  this.signValue = "+1";
  this.signEncoding = 0;
  this.sign = -2 * this.signEncoding + 1;

  this.exponentValue = -127;
  this.exponentEncoding = 0;
  this.exponentSize = 8;
  this.getExponentSize = function() {
    // Cf. page wiki anglaise de la norme IEEE754, section "interchange formats"
    if (this.nbBits == 16) {
      return 5;
    } else if (this.nbBits == 32) {
      return 8;
    }
    return Math.round(4 * Math.log(this.nbBits) / Math.log(2) - 13);
  },

  this.mantissaValue = 1;
  this.mantissaEncoding = 0;
  this.mantissaSize = 23;
  this.hiddenBit = Math.pow(2, this.mantissaSize);

  this.shift = Math.pow(2, (this.exponentSize - 1)) - 1;
  this.sup = this.exponentEncoding - this.shift;
};

var float = new Float();
var float1 = new Float();
var float2 = new Float();

function copyFloat(floatCopy) {
  floatCopy.nbBits = float.nbBits;

  floatCopy.signValue = float.signValue;
  floatCopy.signEncoding = float.signEncoding;
  floatCopy.sign = float.sign;

  floatCopy.exponentValue = float.exponentValue;
  floatCopy.exponentEncoding = float.exponentEncoding;
  floatCopy.exponentSize = float.exponentSize;

  floatCopy.mantissaValue = float.mantissaValue;
  floatCopy.mantissaEncoding = float.mantissaEncoding;
  floatCopy.mantissaSize = float.mantissaSize;
  floatCopy.hiddenBit = float.hiddenBit;

  floatCopy.shift = float.shift;
  floatCopy.sup = float.sup;
}

/********************************************************/
/*  Utilitaires : simplifications d'accès aux éléments  */
/********************************************************/

function $(id) {
  return document.getElementById(id);
}

function $name(name) {
  return document.getElementsByName(name);
}

/* Initialise l'application avec ses valeurs par défaut (remet tous les
bits de l'exposant et de la mantisse à 0). Fonction appelée au chargement
de la page/refresh. */
function onLoad() {
  updateNbBits();
  updateSign();
  updateExponent();
  updateMantissa();
  updateDecimal($name('decimal')[0]);
  updateBinary($name('binary')[0]);
}

/**************************************************/
/*    Mise à jour dynamique depuis le tableau     */
/**************************************************/

// Supprime toutes les checkbox de l'id donné
function clearCheckbox(id) {
  let checkboxList = $(id);
  while (checkboxList.firstChild) {
    checkboxList.removeChild(checkboxList.firstChild);
  }
}

// Créer 'size' checkbox dans la cellule 'id', avec le nom 'name'.
function createCheckbox(id, name, size) {
  for (let i = 0; i < size; i++) {
    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.name = name;
    checkbox.value = "1";

    if (name == "exponentCheckbox") {
      checkbox.onclick = function() {
        updateExponent();
        updateDecimal($name('decimal')[0]);
        updateBinary($name('binary')[0]);
      };
    } else {
      checkbox.onclick = function() {
        updateMantissa();
        updateDecimal($name('decimal')[0]);
        updateBinary($name('binary')[0]);
      };
    }

    $(id).appendChild(checkbox);
  }
}

// Permet d'ajouter/supprimer dynamiquement les checkbox de l'exposant en fonction du nombre de bits choisi.
function updateNbBits() {
  clearCheckbox("binaryExponent");
  clearCheckbox("binaryMantissa");

  float.nbBits = $name('nbBits')[0].value;

  if (float.nbBits < 12) {
    float.nbBits = 12;
    $name('nbBits')[0].value = 12;
  } else if (float.nbBits > 128) {
    float.nbBits = 128;
    $name('nbBits')[0].value = 128;
  }

  float.exponentSize = float.getExponentSize();
  float.mantissaSize = float.nbBits - float.exponentSize - 1;
  float.shift = Math.pow(2, (float.exponentSize - 1)) - 1;
  float.sup = float.exponentEncoding - float.shift;
  float.hiddenBit = Math.pow(2, float.mantissaSize);
  updateExponent();
  updateMantissa();
  updateDecimal($name('decimal')[0]);
  updateBinary($name('binary')[0]);
  createCheckbox("binaryExponent", "exponentCheckbox", float.exponentSize);
  createCheckbox("binaryMantissa", "mantissaCheckbox", float.mantissaSize);
}

// Met à jour dynamiquement la valeur du signe quand sa checkbox est chochée/décochée
function updateSign() {
  let checkbox = $name("signCheckbox")[0];

  if (checkbox.checked) {
    float.signValue = "-1";
    float.signEncoding = 1;
  } else {
    float.signValue = "+1";
    float.signEncoding = 0;
  }

  float.sign = -2 * float.signEncoding + 1;

  $('signValue').innerHTML = float.signValue;
  $('signEncoding').innerHTML = float.signEncoding;
}

/* Retourne une valeur décimale qui dpéend des checkbox cochées/décochées
de la liste pasée en argument */
function getDecimalValue(checkboxList) {
  let decimalValue = 0;
  for (let i = 0; i < checkboxList.length; i++) {
    if (checkboxList[i].checked) {
      decimalValue += Math.pow(2, checkboxList.length-1 - i);
    }
  }
  return decimalValue;
}

// Met à jour dynamiquement la valeur de l'exposant quand ses checkbox sont cochées/décochées
function updateExponent() {
  float.exponentEncoding = getDecimalValue($name('exponentCheckbox'));
  float.sup = float.exponentEncoding - float.shift;

  if (float.exponentEncoding == 0) {
    $('exponentValue').innerHTML = "2<sup id='sup'>" + float.sup + "</sup>" + "(denormalized)";
  } else {
    $('exponentValue').innerHTML = "2<sup id='sup'>" + float.sup + "</sup>";
  }

  $('exponentEncoding').innerHTML = float.exponentEncoding;
}

// Met à jour dynamiquement la valeur de la mantisse quand ses checkbox cochées/décochées
function updateMantissa() {
  float.mantissaEncoding = getDecimalValue($name('mantissaCheckbox'));
  float.mantissaValue = (float.mantissaEncoding + float.hiddenBit) / float.hiddenBit;
  $('mantissaValue').innerHTML = float.mantissaValue;
  $('mantissaEncoding').innerHTML = float.mantissaEncoding;
}

/* Met à jour dynamiquement la représentation décimale à chaque fois qu'une checkbox est modifiée */
function updateDecimal(input) {
  if (float.exponentEncoding == 0 && float.mantissaEncoding == 0) {
    input.value = 0;
  } else if (float.exponentEncoding == 0 && float.mantissaEncoding != 0) {
    input.value = "denormalized";
  } else if (float.exponentEncoding == Math.pow(2, float.exponentSize) - 1 && float.mantissaEncoding == 0) {
    input.value = "infinity";
  } else if (float.exponentEncoding == Math.pow(2, float.exponentSize) - 1 && float.mantissaEncoding != 0) {
    input.value = "NaN";
  } else {
    input.value = float.sign * Math.pow(2, float.sup) * (float.mantissaEncoding + float.hiddenBit) / float.hiddenBit;
  }
}

/* Retourne une valeur binaire qui dpéend des checkbox cochées/décochées
de la liste pasée en argument */
function getBinaryValue(checkboxList) {
  let bin = "";
  for (let i = 0; i < checkboxList.length; i++) {
    if (checkboxList[i].checked) {
      bin += 1;
    } else {
      bin += 0;
    }
  }
  return bin;
}

/* Met à jour dynamiquement la représentation binaire spécifiée à chaque fois qu'une checkbox est modifiée */
function updateBinary(input) {
  input.value = "";
  input.value += float.signEncoding;

  input.value += getBinaryValue($name('exponentCheckbox'));
  input.value += getBinaryValue($name('mantissaCheckbox'));
  copyFloat(float1); // sauve l'état du float (c'est fonction est appelée à chaque changement)
}

/**************************************************/
/*  Mise à jour dynamique depuis valeur décimale  */
/**************************************************/

// Apelé à chaque changement dans l'input pour la valeur décimal. Va mettre à jour le tableau.
function updateFromDecimal(input) {
  updateSignFromDecimal(input);
  updateExponentFromDecimal(input);
  updateMantissaFromDecimal(input);
  updateBinary($name('binary')[0]);
  copyFloat(float1);
}

// Met à jour la colonne Sign du tableau lors d'un  changement de signe dans decimal representation.
function updateSignFromDecimal(input) {
  let signCheckbox = $name("signCheckbox")[0];
  if (input.value[0] == "-") {
    signCheckbox.checked = true;
  } else {
    signCheckbox.checked = false;
  }
  updateSign();
}

// Retourne la valeur décimale entrée, sans prendre compte du signe
function getDecimalInput(input) {
  let decimalValue;

  if (float.signEncoding) {
    decimalValue = input.value.substring(1);
  } else {
    decimalValue = input.value;
  }
  return decimalValue;
}

// Prend une liste de checkbox ainsi que sont type (exposant ou mantisse), puis les mets à jour en fonction des valeur de la ligne "Encoded as".
function updateCheckboxFromDecimal(type) {
  let checkboxList = $name(type);
  let encode;
  if (type == "exponentCheckbox") {
    encode = float.exponentEncoding;
  } else {
    encode = parseInt(float.mantissaEncoding);
  }

  let j = 0;
  for (let i = 0; i < checkboxList.length; i++) {
    if ( i >= (checkboxList.length - encode.toString(2).length)) {  // S'il y a plus de checkbox que de bits, les
    if (encode.toString(2)[j] == 1) {                             // checkbox suppélmentaires seront focément
      checkboxList[i].checked = true;                             // décochées (valeur = 0)
    } else {
      checkboxList[i].checked = false;
    }
    j++;
  } else {
    checkboxList[i].checked = false;
  }
}
}

// Met à jour la colonne Exponent du tableau en fonction de la valeur décimale entrée
function updateExponentFromDecimal(input) {
  let decimalValue = getDecimalInput(input);

  if (decimalValue == 0) {
    float.exponentEncoding = 0;
  } else {
    float.exponentEncoding = float.shift + Math.floor(Math.log(decimalValue) / Math.log(2));
  }

  updateCheckboxFromDecimal("exponentCheckbox");
  updateExponent();
}

// Met à jour la colonne Mantissa du tableau en fonction de la valeur décimale entrée
function updateMantissaFromDecimal(input) {
  float.mantissaValue = getDecimalInput(input) / Math.pow(2, float.sup);
  if (float.mantissaValue <= 0) {
    float.mantissaValue = 1;
    float.mantissaEncoding = 0;
  } else {
    float.mantissaEncoding = float.mantissaValue * float.hiddenBit - float.hiddenBit;
  }

  updateCheckboxFromDecimal("mantissaCheckbox");
  updateMantissa();
}

/*************************************************/
/*  Mise à jour dynamique depuis valeur binaire  */
/*************************************************/

function updateFromBinary(input) {
  updateSignFromBinary(input);
  updateExponentFromBinary(input);
  updateMantissaFromBinary(input);
  updateDecimal($name('decimal')[0]);
}

// Met à jour la colonne Sign du tableau lors d'un  changement de signe dans binary representation.
function updateSignFromBinary(input) {
  let signCheckbox = $name("signCheckbox")[0];

  if (input.value[0] == 1) {
    signCheckbox.checked = true;
  } else {
    signCheckbox.checked = false;
  }

  updateSign();
}

function updateCheckboxFromBinary(input, type, start, size) {
  let checkboxList = $name(type);
  for (let i = 0; i < size; i++) {
    if (input.value[i+start] == 1) {
      checkboxList[i].checked = true;
    } else {
      checkboxList[i].checked = false;
    }
  }
}

function updateExponentFromBinary(input) {
  updateCheckboxFromBinary(input, "exponentCheckbox", 1, float.exponentSize)
  updateExponent();
}

function updateMantissaFromBinary(input) {
  updateCheckboxFromBinary(input, "mantissaCheckbox", float.exponentSize+1, float.mantissaSize);
  updateMantissa();
}

/**************/
/*  Addition  */
/**************/

// Met à jour le deuxième float à l'aide de la valeur décimale et appel l'addition
function updateFloatToAddFromDecimal(input) {
  // Construction du deuxième float
  updateSignFromDecimal(input);
  updateExponentFromDecimal(input);
  updateMantissaFromDecimal(input);
  updateBinary($('binToAdd'));
  updateDecimal($('decToAdd'));
  copyFloat(float2);

  updateFromDecimal($('dec')); // Pour que l'utilisateur ne voit pas que le tableau change.. :p

  addition();
}

// Met à jout le deuxième float à l'aide de la valeur binaire et appel l'addition
function updateFloatToAddFromBinary(input) {
  // Construction du deuxième float
  updateSignFromBinary(input);
  updateExponentFromBinary(input);
  updateMantissaFromBinary(input);
  updateDecimal($('decToAdd'));
  updateBinary($('binToAdd'));
  copyFloat(float2);

  updateFromBinary($('bin'));
  addition();
}

// Additionne les deux floats et affiche le résultat. L'addition ne tient pas compte du signe (ne fait pas de soustraction..)
function addition() {
  if (float1.sup > float2.sup) {
    floatMax = float1;
    floatMin = float2;
  } else {
    floatMax = float2;
    floatMin = float1;
  }

  // Cf. page anglaise wiki "Floating-point arithmetic" section 5.1 "addition and substraction".
  floatMin.mantissaValue = floatMin.mantissaValue / Math.pow(2, (floatMax.sup - floatMin.sup));
  floatMin.sup += (floatMax.sup - floatMin.sup);

  $('res').value = Math.pow(2, floatMax.sup) * (floatMax.mantissaValue + floatMin.mantissaValue);
}
