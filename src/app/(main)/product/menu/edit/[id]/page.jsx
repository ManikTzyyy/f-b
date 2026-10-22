import EditMenuClient from "./EditMenuClient";

export const instant = false;

export default async function EditMenuRoute({ params }) {
  const { id } = await params;
  return <EditMenuClient id={id} />;
}
