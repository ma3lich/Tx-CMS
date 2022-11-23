let inputGB = document.getElementById('inputGB');
let resulutMB = document.getElementById('resulutMB');
let coppyMB = document.getElementById('coppyMB');

inputGB.addEventListener('change', () => {
    resulutMB.value = inputGB.value * 1024
})

coppyMB.addEventListener('click', () => {
    navigator.clipboard.writeText(resulutMB.value);
})

let inputVC = document.getElementById('inputVC');
let resulutPR = document.getElementById('resulutPR');
let coppyPR = document.getElementById('coppyPR');

inputVC.addEventListener('change', () => {
    resulutPR.value = inputVC.value * 100
})

coppyPR.addEventListener('click', () => {
    navigator.clipboard.writeText(resulutPR.value);
})