const checkAgeButton = document.getElementById('check-age');
const birthYearInput = document.getElementById('birth-year');
const resultParagraph = document.getElementById('result');

checkAgeButton.addEventListener('click', () => {
    const birthYear = parseInt(birthYearInput.value);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    if (isNaN(birthYear)) {
        resultParagraph.textContent = 'Please enter a valid birth year';
    } else if (age < 18) {
        resultParagraph.textContent = `You are ${age} years old. You are not eligible`;
    } else {
        resultParagraph.textContent = `You are ${age} years old. You are eligible`;
    }
});