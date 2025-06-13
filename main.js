const sideExchangeType = document.querySelector('.parallel-type-exchange');
const officialExchangeType = document.querySelector('.official-type-exchange');
const fees = document.querySelector('.fees');
const calculator =document.querySelector('.calculator');
const dollarsToSend = document.querySelector('input[type="number"]');

const amountToSend = document.querySelector('.amount-to-send');
const feeToAmount = document.querySelector('.fee-to-amount');
const totalDollars = document.querySelector('.dollars-total');
const totalBolivians = document.querySelector('.bolivians-total');
const ratio = document.querySelector('.ratio');
const whatsAppLink = document.querySelector('.link');
const prices = document.querySelector('.cost');

let data = null;
let isMobile = null;

const formatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

async function getData() {
  const response = await fetch('./data.json');
  const data = await response.json();
  return data;
}

function calculate(amount) {
  let appliedFee = null;

  for (let fee of data.fees){
    if (fee.min > amount || amount > fee.max) continue;
    appliedFee = fee.fee;
    break;
  }

  ratio.textContent = `Comisión (${appliedFee * 100}%)`;
  amountToSend.textContent = formatter.format(amount);
  feeToAmount.textContent = formatter.format(Number(amount * appliedFee).toFixed(2));
  totalDollars.textContent = formatter.format(Number(amount * (1 + appliedFee)).toFixed(2));
  totalBolivians.textContent = formatter.format(Number((amount * (1 + appliedFee)).toFixed(2) * data.exchageRatio.parallel).toFixed(2));

  data.defaultMessage = `¡Hola! Me gustaría hacer un depósito de *$ ${amountToSend.innerText}* a un banco en el exterior`;
  whatsAppLink.setAttribute('href', isMobile
    ? `https://wa.me/${data.phoneNumber}?text=${encodeURIComponent(data.defaultMessage)}`
    : `https://web.whatsapp.com/send/?phone=${data.phoneNumber}&text=${encodeURIComponent(data.defaultMessage)}`)
  ;
}

async function setFeesAndPrices() {
  data = await getData()

  if (!data) return;


  sideExchangeType.textContent = formatter.format(data.exchageRatio.parallel);
  officialExchangeType.textContent = formatter.format(data.exchageRatio.official);

  data.fees.forEach(fee => {
    const feeCard = document.createElement('article');
    const feeDescription = document.createElement('p');
    const feeBreak = document.createElement('br')
    const feeValue = document.createElement('span');
    feeValue.textContent = `${fee.fee * 100}`;
    feeValue.classList.add('fee-value')
    feeDescription.textContent = `$${fee.min} - $${fee.max}`;
    feeDescription.appendChild(feeBreak);
    feeDescription.appendChild(feeValue);
    feeCard.appendChild(feeDescription);
    feeCard.classList.add('fee-card');
    fees.appendChild(feeCard);
  });
}

function setEvents() {
  calculator.addEventListener('submit', (event) => {
    const dollarsToPay = parseFloat(dollarsToSend.value)
    calculate(dollarsToPay);
    prices.focus();
    event.preventDefault();
  })
}

function setIsMobile(){
  isMobile = /iPhone|Android|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) dollarsToSend.focus();
}

function setWhatsAppLink() {
  whatsAppLink.setAttribute('href', isMobile
    ? `https://wa.me/${data.phoneNumber}?text=${encodeURIComponent(data.defaultMessage)}`
    : `https://web.whatsapp.com/send/?phone=${data.phoneNumber}&text=${encodeURIComponent(data.defaultMessage)}`);
}

async function main() {
  await setFeesAndPrices();
  setEvents();
  setIsMobile();
  setWhatsAppLink();
}

window.addEventListener('DOMContentLoaded', main)
