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

// Initialise l'application avec ses valeurs par défaut
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

// Créer 'size' checkbox à la position 'id', avec le nom 'name'
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

// Retourne la taille de l'exposant en nombre de bits


// Permet d'ajouter/supprimer dynamiquement les checkbox de l'exposant en fonction du nombre de bits choisi.
function updateNbBits() {
  clearCheckbox("binaryExponent");
  clearCheckbox("binaryMantissa");

  float.nbBits = document.getElementsByName('nbBits')[0].value;
  float.exponentSize = float.getExponentSize();
  float.mantissaSize = float.nbBits - float.exponentSize - 1;
  float.shift = Math.pow(2, (float.exponentSize - 1)) - 1;
  float.sup = float.encodeExponent - float.shift;

  createCheckbox("binaryExponent", "exponentCheckbox", float.exponentSize);
  createCheckbox("binaryMantissa", "mantissaCheckbox", float.mantissaSize);
}

// Met à jour dynamiquement la valeur du signe, quand sa checkbox est chochée/décochée
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

// Retourne une valeur décimale qui varie en fonction des checkbox cochées/décochées
function getDecimalValue(checkboxList) {
  var binaryValue = 0;
  for (var i = 0; i < checkboxList.length; i++) {
    if (checkboxList[i].checked) {
      binaryValue += Math.pow(2, checkboxList.length-1 - i);
    }
  }
  return binaryValue;
}

// Met à jour dynamiquement la veuleur de l'exposant en fonction des checkbox cochées/décochées
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

// Met à jour dynamiquement la valeur de la mantisse en fonction des checkbox cochées/décochées
function updateMantissa() {
  float.encodeMantissa = getDecimalValue(document.getElementsByName('mantissaCheckbox'));
  var hiddenBit = Math.pow(2, float.mantissaSize);
  float.valueMantissa = (float.encodeMantissa + hiddenBit) / hiddenBit;
  document.getElementById('valueMantissa').innerHTML = float.valueMantissa;
  document.getElementById('encodeMantissa').innerHTML = float.encodeMantissa;
}

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

function updateBinary() {
  document.getElementsByName('binary')[0].value = "";
  document.getElementsByName('binary')[0].value += float.encodeSign;

  document.getElementsByName('binary')[0].value += getBinaryValue(document.getElementsByName('exponentCheckbox'));

document.getElementsByName('binary')[0].value += getBinaryValue(document.getElementsByName('mantissaCheckbox'));

}

/**************************************************/
/*  Mise à jour dynamique depuis valuer décimale  */
/**************************************************/

function updateFromDecimal() {
  updateSignFromDecimal();
}

function updateSignFromDecimal() {
  var signCheckbox = document.getElementsByName("signCheckbox")[0];
  if (document.getElementById('dec').value[0] == "-") {
    signCheckbox.checked = true;
  } else {
    signCheckbox.checked = false;
  }
  updateSign();
}
