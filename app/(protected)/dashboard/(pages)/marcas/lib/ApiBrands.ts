import axios from "axios";
import { BrandType } from "./zodBrands";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function getBrandsByApi(): Promise<BrandType[]> {
  try {
    const response = await axios.get<BrandType[]>(`${API_URL}/brands`);
    return response.data;
  } catch (error) {
    return [];
  }
}