import MenuDetailClient from "./MenuDetailClient";

export const instant = false;

export default async function MenuDetailRoute({ params }) {
  const { id } = await params;
  return <MenuDetailClient id={id} />;
}
