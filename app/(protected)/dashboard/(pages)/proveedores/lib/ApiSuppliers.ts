import axios from "axios";
import { SupplierType } from "./zodSuppliers";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function getSuppliersByApi(): Promise<SupplierType[]> {
  try {
    const response = await axios.get<SupplierType[]>(`${API_URL}/suppliers`);
    return response.data;
  } catch (error) {
    return [];
  }
}