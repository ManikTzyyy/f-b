import SalesDetailClient from "./SalesDetailClient";

export default async function SalesDetailRoute({ params }) {
  const { id } = await params;
  return <SalesDetailClient id={id} />;
}
