import { getOrders } from "./actions";
import { OrdersClient } from "./orders-client";

export const metadata = {
  title: "Fulfillment Queue | Admin",
};

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Marketing Fulfillment
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage clinic orders, download QR assets, and update shipping statuses.
        </p>
      </div>

      <OrdersClient orders={orders} />
    </div>
  );
}
