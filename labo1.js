// Initialise l'application avec ses valeurs par défaut
function onLoad() {
  updateNbBits();
  updateSign();
  updateExponent();
  updateMantissa();
  updateDecimal();
}

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
      };
    } else {
      checkbox.onclick = function() {
        updateMantissa();
        updateDecimal();
      };
    }

    document.getElementById(id).appendChild(checkbox);
  }
}

// Retourne la taille de l'exposant en nombre de bits
function getExponentSize(nbBits) {
  var exponentSize;

  // Cf. page wiki anglaise de la norme IEEE754, section "interchange formats"
  if (nbBits == 16) {
    exponentSize = 5;
  } else if (nbBits == 32) {
    exponentSize = 8;
  } else {
    exponentSize = Math.round(4 * Math.log(nbBits) / Math.log(2) - 13);
  }
  return exponentSize;
}

// Permet d'ajouter/supprimer dynamiquement les checkbox de l'exposant en fonction du nombre de bits choisi.
function updateNbBits() {
  clearCheckbox("binaryExponent");
  clearCheckbox("binaryMantissa");

  var nbBits = document.getElementsByName('nbBits')[0].value;
  var exponentSize = getExponentSize(nbBits);
  var mantissaSize = nbBits - exponentSize - 1;

  createCheckbox("binaryExponent", "exponentCheckbox", exponentSize);
  createCheckbox("binaryMantissa", "mantissaCheckbox", mantissaSize);
}

// Met à jour dynamiquement la valeur du signe, quand sa checkbox est chochée/décochée
function updateSign() {
  var checkbox = document.getElementsByName("signCheckbox")[0];

  if (checkbox.checked) {
    document.getElementById('valueSign').innerHTML = "-1";
    document.getElementById('encodeSign').innerHTML = "1";
  } else {
    document.getElementById('valueSign').innerHTML = "+1";
    document.getElementById('encodeSign').innerHTML = "0";
  }
}

// Retourne une valeur décimale qui varie en fonction des checkbox cochées/décochées
function getBinaryValue(checkboxList) {
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
  var nbBits = document.getElementsByName('nbBits')[0].value;
  var exponentSize = getExponentSize(nbBits);

  var shift = Math.pow(2, (exponentSize - 1)) - 1;
  var exponant = getBinaryValue(document.getElementsByName('exponentCheckbox'));
  var sup = exponant - shift;

  if (exponant == 0) {
    document.getElementById('valueExponent').innerHTML = "2<sup id='sup'>" + sup + "</sup>" + "(denormalized)";
  } else {
    document.getElementById('valueExponent').innerHTML = "2<sup id='sup'>" + sup + "</sup>";
  }

  document.getElementById('encodeExponent').innerHTML = exponant;
}

// Met à jour dynamiquement la valeur de la mantisse en fonction des checkbox cochées/décochées
function updateMantissa() {
  var nbBits = document.getElementsByName('nbBits')[0].value;
  var exponentSize = getExponentSize(nbBits);
  var mantissaSize = nbBits - exponentSize;

  var mantissa = getBinaryValue(document.getElementsByName('mantissaCheckbox'));
  var hiddenBit = Math.pow(2, mantissaSize-1);
  document.getElementById('valueMantissa').innerHTML = (mantissa + hiddenBit) / hiddenBit;
  document.getElementById('encodeMantissa').innerHTML = mantissa;
}

function updateDecimal() {
  var nbBits = document.getElementsByName('nbBits')[0].value;
  var exponentSize = getExponentSize(nbBits);
  var sign = -2 * document.getElementById('encodeSign').innerHTML + 1;
  var exponant = Math.pow(2, document.getElementById('sup').innerHTML);
  var mantissa = document.getElementById('valueMantissa').innerHTML;
  var encodeExponent = document.getElementById('encodeExponent').innerHTML;
  var encodeMantissa = document.getElementById('encodeMantissa').innerHTML;

  if (encodeExponent == 0 && encodeMantissa == 0) {
    document.getElementsByName('decimal')[0].value = 0;
  } else if (encodeExponent == 0 && encodeMantissa != 0) {
    document.getElementsByName('decimal')[0].value = "denormalized";
  } else if (encodeExponent == Math.pow(2, exponentSize) - 1 && encodeMantissa == 0) {
    document.getElementsByName('decimal')[0].value = "infinity";
  } else if (encodeExponent == Math.pow(2, exponentSize) - 1 && encodeMantissa != 0) {
    document.getElementsByName('decimal')[0].value = "NaN";
  } else {
    document.getElementsByName('decimal')[0].value = sign * exponant * mantissa;
  }
}
