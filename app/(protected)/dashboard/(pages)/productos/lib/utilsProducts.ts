// import * as XLSX from 'xlsx';
import { ProductType } from './zodProducts';
// import { getProductsByApi } from './dataProducts';

export const exportProductsToExcel = async () => {

  // const products: ProductType[] = await getProductsByApi();

  // const data = products.map((product) => {
  //   const vialeStock = product.stock.find(item => item.deposit.name === 'Viale(local)')?.quantity || 0;
  //   const cerritoLocalStock = product.stock.find(item => item.deposit.name === 'Cerrito(local)')?.quantity || 0;
  //   const cerritoCasaStock = product.stock.find(item => item.deposit.name === 'Cerrito(casa)')?.quantity || 0;

  //   return {
  //     SKU: product.SKU,
  //     NOMBRE: product.name,
  //     'COD BARRA': product.barcode,
  //     CATEGORIA: product.category.name,
  //     'Viale(local)': vialeStock,
  //     'Cerrito(local)': cerritoLocalStock,
  //     'Cerrito(casa)': cerritoCasaStock,
  //     COSTO: product.cost,
  //     PRECIO: product.price,
  //     MAYORISTA: product.priceWholesaler,
  //     'TIENDA NUBE': product.isActiveShop ? 'SI' : 'NO',
  //   };
  // });

  // const workbook = XLSX.utils.book_new();
  // const worksheet = XLSX.utils.json_to_sheet(data);
  // XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  // XLSX.writeFile(workbook, 'products.xlsx');
};