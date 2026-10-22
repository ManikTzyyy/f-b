import PurchaseDetailClient from "./PurchaseDetailClient";

export const instant = false;

export default async function PurchaseDetailRoute({ params }) {
  const { id } = await params;
  return <PurchaseDetailClient id={id} />;
}
