import { getOrders, getClinicsAndProducts } from "./actions";
import { OrdersClient } from "./orders-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fulfillment & Orders | Admin Console",
};

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  const { clinics, products } = await getClinicsAndProducts();

  // Metrics
  const pendingCount = orders.filter((o) => o.order.status === "pending" || o.order.status === "processing").length;
  const shippedCount = orders.filter((o) => o.order.status === "shipped").length;
  const deliveredCount = orders.filter((o) => o.order.status === "delivered").length;
  const grossRevenue = orders.reduce((sum, o) => sum + (o.order.amount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Marketing Fulfillment & Logistics
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Fulfillment Command Center
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Dispatch physical brand collaterals, acrylic QR standees, prescription booklets, and track courier shipments.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Dispatch</p>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-semibold">
              Action Required
            </span>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-2">{pendingCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Transit / Shipped</p>
          <p className="text-3xl font-black text-blue-600 mt-2">{shippedCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Delivered</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{deliveredCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Order Value</p>
          <p className="text-3xl font-black text-purple-600 mt-2">
            ₹{grossRevenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Orders Interactive Client Interface */}
      <OrdersClient orders={orders} clinics={clinics} products={products} />
    </div>
  );
}
