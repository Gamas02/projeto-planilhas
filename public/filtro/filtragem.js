export function filtrarCompras(compras, filtros) {
  let comprasFiltradas = [...compras];
  
  if (filtros.cliente) {
    comprasFiltradas = comprasFiltradas.filter(compra => 
      compra.cliente_email.includes(filtros.cliente)
    );
  }
  
  if (filtros.dataInicio) {
    comprasFiltradas = comprasFiltradas.filter(compra => {
      const dataCompra = new Date(compra.data_compra);
      return dataCompra >= new Date(filtros.dataInicio);
    });
  }
  
  if (filtros.dataFim) {
    comprasFiltradas = comprasFiltradas.filter(compra => {
      const dataCompra = new Date(compra.data_compra);
      return dataCompra <= new Date(filtros.dataFim);
    });
  }
  
  return comprasFiltradas;
}