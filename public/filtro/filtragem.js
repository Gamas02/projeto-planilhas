import { getCompras } from "./banco.js";

export function filtrarCompras({ cliente, dataInicio, dataFim }) {
  let compras = getCompras();

  if (cliente) {
    compras = compras.filter(c => c.cliente === cliente);
  }

  if (dataInicio) {
    const inicio = new Date(dataInicio);
    compras = compras.filter(c => new Date(c.data.split(',')[0].split('/').reverse().join('-')) >= inicio);
  }

  if (dataFim) {
    const fim = new Date(dataFim);
    compras = compras.filter(c => new Date(c.data.split(',')[0].split('/').reverse().join('-')) <= fim);
  }

  return compras;
}
