export function arraysEqual(a: Array<any>, b: Array<any>) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export const getLastWord = (lines: string[]) => {
  if (lines.length === 0) return '';
  const lastLine = lines[lines.length - 1];
  const words = lastLine.split(' ');
  return words[words.length - 1];
}

export function hasDuplicates(array: Array<any>) {
  return (new Set(array)).size !== array.length;
}

export const getTimePercentageClass = (timePercentageLeft: number) => {
  if (timePercentageLeft === 100) return 'w-full';
  return `w-[${Math.round(timePercentageLeft)}%]`;
}

export const getFunnyMiss = () => {
  const funnyMisses = [
    'Bro What?',
    'tf is this?',
    'nah',
    '?',
  ];
  return funnyMisses[Math.floor(Math.random() * funnyMisses.length)];
}

export const getNumberString = (number: number): string => {
  if (number === 0) return 'zero';
  
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
  const convertHundreds = (n: number): string => {
    let result = '';
    
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    
    if (hundred > 0) {
      result += ones[hundred] + ' hundred';
      if (remainder > 0) result += ' ';
    }
    
    if (remainder >= 10 && remainder < 20) {
      result += teens[remainder - 10];
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;
      
      if (ten > 0) {
        result += tens[ten];
        if (one > 0) result += ' ';
      }
      
      if (one > 0) {
        result += ones[one];
      }
    }
    
    return result;
  };
  
  if (number < 1000) {
    return convertHundreds(number);
  }
  
  const thousands = Math.floor(number / 1000);
  const remainder = number % 1000;
  
  let result = convertHundreds(thousands) + ' thousand';
  
  if (remainder > 0) {
    result += ' ' + convertHundreds(remainder);
  }

  console.log(result);
  
  return result;
}