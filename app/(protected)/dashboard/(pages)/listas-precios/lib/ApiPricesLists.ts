import axios from "axios";
import { PricesListType } from "./zodPricesLists";


const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function getPriceListByApi(): Promise<PricesListType[]> {
  try {
    const response = await axios.get<PricesListType[]>(`${API_URL}/price-list`);
    return response.data;
  } catch (error) {
    return [];
  }
}