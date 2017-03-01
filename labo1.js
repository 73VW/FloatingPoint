/* Objet float qui contient toutes les valeurs nécessaire aux
différents calcul durant l'execution du programme. l'objet est créé avec
des valeurs par défaut, à savoir tous les bits à 0, encodé sur 32 bits.*/
var float = {
  nbBits: 32,

  valueSign: "+1",
  encodeSign: 0,
  sign: -2 * this.encodeSign + 1,

  valueExponent: -127,
  encodeExponent: 0,
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

  valueMantissa: 1,
  encodeMantissa: 0,
  mantissaSize: 23,

  shift: Math.pow(2, (this.exponentSize - 1)) - 1,
  sup: this.encodeExponent - this.shift
};

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
  var checkboxList = document.getElementById(id);
  while (checkboxList.firstChild) {
    checkboxList.removeChild(checkboxList.firstChild);
  }
}

// Créer 'size' checkbox dans la cellule 'id', avec le nom 'name'.
function createCheckbox(id, name, size) {
  for (var i = 0; i < size; i++) {
    var checkbox = document.createElement('input');
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

    document.getElementById(id).appendChild(checkbox);
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
  float.sup = float.encodeExponent - float.shift;
  updateExponent();

  createCheckbox("binaryExponent", "exponentCheckbox", float.exponentSize);
  createCheckbox("binaryMantissa", "mantissaCheckbox", float.mantissaSize);
}

// Met à jour dynamiquement la valeur du signe quand sa checkbox est chochée/décochée
function updateSign() {
  var checkbox = document.getElementsByName("signCheckbox")[0];

  if (checkbox.checked) {
    float.valueSign = "-1";
    float.encodeSign = 1;
  } else {
    float.valueSign = "+1";
    float.encodeSign = 0;
  }

  float.sign = -2 * float.encodeSign + 1;

  document.getElementById('valueSign').innerHTML = float.valueSign;
  document.getElementById('encodeSign').innerHTML = float.encodeSign;
}

/* Retourne une valeur décimale qui dpéend des checkbox cochées/décochées
de la liste pasée en argument */
function getDecimalValue(checkboxList) {
  var decimalValue = 0;
  for (var i = 0; i < checkboxList.length; i++) {
    if (checkboxList[i].checked) {
      decimalValue += Math.pow(2, checkboxList.length-1 - i);
    }
  }
  return decimalValue;
}

// Met à jour dynamiquement la valeur de l'exposant quand ses checkbox sont cochées/décochées
function updateExponent() {
  float.encodeExponent = getDecimalValue(document.getElementsByName('exponentCheckbox'));
  float.sup = float.encodeExponent - float.shift;

  if (float.encodeExponent == 0) {
    document.getElementById('valueExponent').innerHTML = "2<sup id='sup'>" + float.sup + "</sup>" + "(denormalized)";
  } else {
    document.getElementById('valueExponent').innerHTML = "2<sup id='sup'>" + float.sup + "</sup>";
  }

  document.getElementById('encodeExponent').innerHTML = float.encodeExponent;
}

// Met à jour dynamiquement la valeur de la mantisse quand ses checkbox cochées/décochées
function updateMantissa() {
  float.encodeMantissa = getDecimalValue(document.getElementsByName('mantissaCheckbox'));
  var hiddenBit = Math.pow(2, float.mantissaSize);
  float.valueMantissa = (float.encodeMantissa + hiddenBit) / hiddenBit;
  document.getElementById('valueMantissa').innerHTML = float.valueMantissa;
  document.getElementById('encodeMantissa').innerHTML = float.encodeMantissa;
}

/* Met à jour dynamiquement la représentation décimale à chaque fois qu'une checkbox est modifiée */
function updateDecimal() {
  if (float.encodeExponent == 0 && float.encodeMantissa == 0) {
    document.getElementsByName('decimal')[0].value = 0;
  } else if (float.encodeExponent == 0 && float.encodeMantissa != 0) {
    document.getElementsByName('decimal')[0].value = "denormalized";
  } else if (float.encodeExponent == Math.pow(2, float.exponentSize) - 1 && float.encodeMantissa == 0) {
    document.getElementsByName('decimal')[0].value = "infinity";
  } else if (float.encodeExponent == Math.pow(2, float.exponentSize) - 1 && float.encodeMantissa != 0) {
    document.getElementsByName('decimal')[0].value = "NaN";
  } else {
    document.getElementsByName('decimal')[0].value = float.sign * Math.pow(2, float.sup) * float.valueMantissa;
  }
}

/* Retourne une valeur binaire qui dpéend des checkbox cochées/décochées
de la liste pasée en argument */
function getBinaryValue(checkboxList) {
  var bin = "";
  for (var i = 0; i < checkboxList.length; i++) {
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
  document.getElementsByName('binary')[0].value += float.encodeSign;

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
}

// Met à jour la colonne Sign du tableau lors d'un  changement dans décimal.
function updateSignFromDecimal() {
  var signCheckbox = document.getElementsByName("signCheckbox")[0];
  if (document.getElementById('dec').value[0] == "-") {
    signCheckbox.checked = true;
  } else {
    signCheckbox.checked = false;
  }
  updateSign();
  updateBinary();
  updateMantissaFromDecimal();
}

function updateExponentFromDecimal() {
  var decimalValue;

  if (float.encodeSign) {
    decimalValue = document.getElementById('dec').value.substring(1);
  } else {
    decimalValue = document.getElementById('dec').value;
  }

  var start;
  var checkboxList = document.getElementsByName('exponentCheckbox');
  if (decimalValue == 0) {
    float.encodeExponent = 0;
    start = 0
  } else {
    float.encodeExponent = float.shift + Math.floor(Math.log(decimalValue) / Math.log(2));
    start = checkboxList.length - float.encodeExponent.toString(2).length;
  }

  var j = 0;
  for (var i = start; i < checkboxList.length; i++) {
    if (float.encodeExponent.toString(2)[j] == 1) {
      checkboxList[i].checked = true;
    } else {
      checkboxList[i].checked = false;
    }
    j++;
  }
  updateExponent();
}

function updateMantissaFromDecimal() {

}
