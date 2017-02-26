
 // Cette fonction permet d'ajouter dynamiquement les checkbox de l'exposant
function exponentCheckbox() {
  var checkboxList = document.getElementById('binaryExponent');
  while (checkboxList.firstChild) {
    checkboxList.removeChild(checkboxList.firstChild);
  }

  var nbBits = document.getElementsByName('nbBits')[0].value;
  var exponentSize;

  // Cf. page wiki anglaise de la norme IEEE754, section "interchange formats"
  if (nbBits == 16) {
    exponentSize = 5;
  } else if (nbBits == 32) {
    exponentSize = 8;
  } else {
    exponentSize = Math.round(4 * Math.log(nbBits) / Math.log(2) - 13);
  }

  for (var i = 0; i < exponentSize; i++) {
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.name = "exponentCheckbox";
    checkbox.value = "1";

    document.getElementById('binaryExponent').appendChild(checkbox);
  }
}
