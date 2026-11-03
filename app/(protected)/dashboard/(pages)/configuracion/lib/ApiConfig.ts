import axios from "axios";


const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function getExchangeRatesByApi(): Promise<[]> {
  try {
    const response = await axios.get<[]>(`${API_URL}/exchange-rates`);
    return response.data;
  } catch (error) {
    return [];
  }
}