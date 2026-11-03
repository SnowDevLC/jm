import { StockPerDepositProps } from "../lib/zodProducts";
import { Input } from "@/components/ui/input";

export default function StockPerDeposit(props: StockPerDepositProps) {
  const { product } = props;

  return (
    <div className="flex flex-col gap-2">
      {product.stock.map((stockItem, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input value={stockItem.deposit.name} readOnly />
          <Input value={stockItem.quantity} readOnly/>
        </div>
      ))}
    </div>
  );
}
