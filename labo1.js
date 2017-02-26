function onLoad() {
  updateNbBits();
  updateSign();
  updateExponent();
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
    checkbox.onclick = function(){ updateExponent(); };

    document.getElementById(id).appendChild(checkbox);

  }
}

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

// Cette fonction permet d'ajouter dynamiquement les checkbox de l'exposant
function updateNbBits() {
  clearCheckbox("binaryExponent");
  clearCheckbox("binaryMantissa");

  var nbBits = document.getElementsByName('nbBits')[0].value;
  var exponentSize = getExponentSize(nbBits);
  var mantissaSize = nbBits - exponentSize - 1;

  createCheckbox("binaryExponent", "exponentCheckbox", exponentSize);
  createCheckbox("binaryMantissa", "mantissaCheckbox", mantissaSize);
}

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

function updateExponent() {
  var nbBits = document.getElementsByName('nbBits')[0].value;
  var exponentSize = getExponentSize(nbBits);
  var shift = Math.pow(2, (exponentSize - 1)) - 1;
  var exponant = 0;
  var checkboxList = document.getElementsByName('exponentCheckbox');

  for (var i = 0; i < checkboxList.length; i++) {
    if (checkboxList[i].checked) {
      exponant += Math.pow(2, checkboxList.length-1 - i);
    }
  }

  var sup = exponant - shift;

  document.getElementById('valueExponent').innerHTML = "2<sup>" + sup + "</sup>";
  document.getElementById('encodeExponent').innerHTML = exponant;
}
