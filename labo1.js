/* Objet float qui contient toutes les valeurs nécessaire aux
différents calcul durant l'execution du programme. l'objet est créé avec
des valeurs par défaut, à savoir tous les bits à 0, encodé sur 32 bits.*/
var float = {
  nbBits: 32,

  signValue: "+1",
  signEncoding: 0,
  sign: -2 * this.signEncoding + 1,

  exponentValue: -127,
  exponentEncoding: 0,
  exponentSize: 8,
  getExponentSize: function() {
    // Cf. page wiki anglaise de la norme IEEE754, section "interchange formats"
    if (this.nbBits == 16) {
      return 5;
    } else if (this.nbBits == 32) {
      return 8;
    }
    return Math.round(4 * Math.log(this.nbBits) / Math.log(2) - 13);
  },

  mantissaValue: 1,
  mantissaEncoding: 0,
  mantissaSize: 23,
  hiddenBit: Math.pow(2, this.mantissaSize),

  shift: Math.pow(2, (this.exponentSize - 1)) - 1,
  sup: this.exponentEncoding - this.shift
};

/*******************************************************/
/*  Utilitaires : simplifications d'accès aux éléments  */
/*******************************************************/

function $(id) {
  return document.getElementById(id);
}

/* Initialise l'application avec ses valeurs par défaut (remet tous les
bits de l'exposant et de la mantisse à 0). Fonction appelée au chargement
de la page/refresh. */
function onLoad() {
  updateNbBits();
  updateSign();
  updateExponent();
  updateMantissa();
  updateDecimal();
  updateBinary();
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
        updateDecimal();
        updateBinary();
      };
    } else {
      checkbox.onclick = function() {
        updateMantissa();
        updateDecimal();
        updateBinary();
      };
    }

  $(id).appendChild(checkbox);
  }
}

// Permet d'ajouter/supprimer dynamiquement les checkbox de l'exposant en fonction du nombre de bits choisi.
function updateNbBits() {
  clearCheckbox("binaryExponent");
  clearCheckbox("binaryMantissa");

  float.nbBits = document.getElementsByName('nbBits')[0].value;
  float.exponentSize = float.getExponentSize();
  float.mantissaSize = float.nbBits - float.exponentSize - 1;
  float.shift = Math.pow(2, (float.exponentSize - 1)) - 1;
  float.sup = float.exponentEncoding - float.shift;
  float.hiddenBit = Math.pow(2, float.mantissaSize);
  updateExponent();

  createCheckbox("binaryExponent", "exponentCheckbox", float.exponentSize);
  createCheckbox("binaryMantissa", "mantissaCheckbox", float.mantissaSize);
}

// Met à jour dynamiquement la valeur du signe quand sa checkbox est chochée/décochée
function updateSign() {
  let checkbox = document.getElementsByName("signCheckbox")[0];

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
  float.exponentEncoding = getDecimalValue(document.getElementsByName('exponentCheckbox'));
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
  float.mantissaEncoding = getDecimalValue(document.getElementsByName('mantissaCheckbox'));
  float.mantissaValue = (float.mantissaEncoding + float.hiddenBit) / float.hiddenBit;
$('mantissaValue').innerHTML = float.mantissaValue;
  $('mantissaEncoding').innerHTML = float.mantissaEncoding;
}

/* Met à jour dynamiquement la représentation décimale à chaque fois qu'une checkbox est modifiée */
function updateDecimal() {
  if (float.exponentEncoding == 0 && float.mantissaEncoding == 0) {
    document.getElementsByName('decimal')[0].value = 0;
  } else if (float.exponentEncoding == 0 && float.mantissaEncoding != 0) {
    document.getElementsByName('decimal')[0].value = "denormalized";
  } else if (float.exponentEncoding == Math.pow(2, float.exponentSize) - 1 && float.mantissaEncoding == 0) {
    document.getElementsByName('decimal')[0].value = "infinity";
  } else if (float.exponentEncoding == Math.pow(2, float.exponentSize) - 1 && float.mantissaEncoding != 0) {
    document.getElementsByName('decimal')[0].value = "NaN";
  } else {
    document.getElementsByName('decimal')[0].value = float.sign * Math.pow(2, float.sup) * float.mantissaValue;
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

/* Met à jour dynamiquement la représentation binaire à chaque fois qu'une checkbox est modifiée */
function updateBinary() {
  document.getElementsByName('binary')[0].value = "";
  document.getElementsByName('binary')[0].value += float.signEncoding;

  document.getElementsByName('binary')[0].value += getBinaryValue(document.getElementsByName('exponentCheckbox'));

  document.getElementsByName('binary')[0].value += getBinaryValue(document.getElementsByName('mantissaCheckbox'));
}

/**************************************************/
/*  Mise à jour dynamique depuis valeur décimale  */
/**************************************************/

// Apelé à chaque changement dans l'input pour la valeur décimal. Va mettre à jour le tableau.
function updateFromDecimal() {
  updateSignFromDecimal();
  updateExponentFromDecimal();
  updateMantissaFromDecimal();
  updateBinary();
}

// Met à jour la colonne Sign du tableau lors d'un  changement de signe dans décimal.
function updateSignFromDecimal() {
  let signCheckbox = document.getElementsByName("signCheckbox")[0];
  if ($('dec').value[0] == "-") {
    signCheckbox.checked = true;
  } else {
    signCheckbox.checked = false;
  }
  updateSign();
}

// Retourne la valeur décimale entrée, sans prendre compte du signe
function getDecimalInput() {
  let decimalValue;

  if (float.signEncoding) {
    decimalValue = $('dec').value.substring(1);
  } else {
    decimalValue = $('dec').value;
  }
  return decimalValue;
}

// Prend une liste de checkbox ainsi que sont type (exposant ou mantisse), puis les mets à jour en fonction des valeur de la ligne "Encoded as".
function updateCheckboxFromDecimal(checkboxList, type) {
  let encode;
  if (type == "exponent") {
    encode = float.exponentEncoding;
  } else {
    encode = parseInt(float.mantissaEncoding);
  }

  let j = 0;
  for (let i = 0; i < checkboxList.length; i++) {
    if ( i >= (checkboxList.length - encode.toString(2).length)) {
      if (encode.toString(2)[j] == 1) {
        checkboxList[i].checked = true;
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
function updateExponentFromDecimal() {
  let decimalValue = getDecimalInput();
  let checkboxList = document.getElementsByName('exponentCheckbox');

  if (decimalValue == 0) {
    float.exponentEncoding = 0;
  } else {
    float.exponentEncoding = float.shift + Math.floor(Math.log(decimalValue) / Math.log(2));
  }

  updateCheckboxFromDecimal(checkboxList, "exponent");
  updateExponent();
}

// Met à jour la colonne Mantissa du tableau en fonction de la valeur décimale entrée
function updateMantissaFromDecimal() {
  float.mantissaValue = getDecimalInput() / Math.pow(2, float.sup);
  if (float.mantissaValue <= 0) {
    float.mantissaValue = 1;
    float.mantissaEncoding = 0;
  } else {
    float.mantissaEncoding = float.mantissaValue * float.hiddenBit - float.hiddenBit;
  }

  let checkboxList = document.getElementsByName('mantissaCheckbox');
  updateCheckboxFromDecimal(checkboxList, "mantissa");
  updateMantissa();
}
