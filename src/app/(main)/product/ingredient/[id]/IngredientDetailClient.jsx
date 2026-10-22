"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

import { Pen, Trash } from "lucide-react";

import { LabelInfo } from "@/components/layout/LabelInfo";

export default function IngredientDetailClient({ id }) {
  const router = useRouter();
  const [ingredient, setIngredient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadIngredient = async () => {
      try {
        const response = await fetch(`/api/product/ingredient?id=${id}`);
        const responseData = await response.json();
        if (!response.ok || !responseData.success) {
          throw new Error(responseData.message || "Failed to fetch ingredient");
        }
        if (active) setIngredient(responseData.data);
      } catch (error) {
        if (active) toast.error(error.message || "Failed to fetch ingredient");
      } finally {
        if (active) setLoading(false);
      }
    };
    if (id) loadIngredient();
    return () => {
      active = false;
    };
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/product/ingredient?id=${id}`, {
        method: "DELETE",
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to delete ingredient");
      }
      toast.success("Ingredient deleted");
      router.push("/product/ingredient");
    } catch (error) {
      toast.error(error.message || "Failed to delete ingredient");
    }
  };

  if (loading)
    return (
      <div className="w-full min-h-40 flex items-center justify-center">
        <Spinner />
      </div>
    );
  if (!ingredient) return <div className="p-4">Ingredient not found</div>;

  return (
    <>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Back
        </Button>

        <div className="flex justify-end gap-2 ">
          <Button
            className="bg-amber-300 hover:bg-amber-500 w-10 h-10"
            type="button"
            onClick={() => router.push(`/product/ingredient/edit/${id}`)}
          >
            <Pen />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="destructive"
                  className={" w-10 h-10"}
                >
                  <Trash />
                </Button>
              }
            ></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete ingredient?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex gap-10 flex-wrap">
        <div className="w-80 h-80 overflow-hidden rounded-lg">
          <img
            className="object-cover w-full h-full"
            src={ingredient.images}
            alt={ingredient.name}
          />
        </div>
        <div className="grid grid-cols-2 gap-6 h-fit">
          <LabelInfo label={'Name'} value={ingredient.name}/>
          <LabelInfo label={'Category'} value={ingredient.category.name}/>
          <LabelInfo label={'Stock'} value={`${ingredient.current_stock}/${ingredient.unit}`}/>
          
        </div>
      </div>
    </>
  );
}
