const thousands = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion'];
const tens = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const teens = ['', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

export const getNumberString = (number: number, currentString: string = '', index: number = 0): string => {
  if (number === 0 && index === 0) return 'zero';
  if (number === 0) return currentString;
  if (number < 10) return currentString + ones[number];
  if (number < 20) return currentString + teens[number - 10];
  if (number < 100) return currentString + tens[Math.floor(number / 10)] + (number % 10 > 0 ? ' ' + ones[number % 10] : '');
  return currentString + getNumberString(Math.floor(number / 1000), currentString, index + 1) + thousands[index] + (number % 1000 > 0 ? ' ' + getNumberString(number % 1000, '', 0) : '');
}
