import IngredientDetailClient from "./IngredientDetailClient";

export const instant = false;

export default async function IngredientDetailRoute({ params }) {
  const { id } = await params;
  return <IngredientDetailClient id={id} />;
}