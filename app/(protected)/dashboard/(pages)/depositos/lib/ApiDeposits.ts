import axios from "axios";
import { DepositType } from "./zodDeposits";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function getDepositsByApi(): Promise<DepositType[]> {
  try {
    const response = await axios.get<DepositType[]>(`${API_URL}/deposits`);
    return response.data;
  } catch (error) {
    return [];
  }
}