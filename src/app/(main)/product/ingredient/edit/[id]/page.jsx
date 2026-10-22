import EditIngredientPage from "./EditIngredientClient";

export const instant = false;

export default async function Page({ params }) {
  const { id } = await params;
  return <EditIngredientPage id={id} />;
}
