import axios from "axios";
import { CategoryType } from "./zodCategories";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function getCategoriesByApi(): Promise<CategoryType[]> {
  try {
    const response = await axios.get<CategoryType[]>(`${API_URL}/categories`);
    return response.data;
  } catch (error) {
    return [];
  }
}