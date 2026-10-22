import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

export function SimpleTable({
  data,
  table,
  loading,
  dataMap = [],
  onEdit,
  onDelete,
  showAction = false,
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {table.map((e) => {
            return <TableHead key={e}>{e}</TableHead>;
          })}
          {showAction && <TableHead className="text-center">Action</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center h-32">
              <div className="flex justify-center items-center">
                <Spinner />
              </div>
            </TableCell>
          </TableRow>
        ) : data.length == 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center h-32">
              <div className="flex justify-center items-center text-sm text-stone-400">
                no data found
              </div>
            </TableCell>
          </TableRow>
        ) : (
          data.map((e) => {
            return (
              <TableRow key={e.id} className="text-sm">
                {dataMap.map((key) => (
                  <TableCell key={key}>{e[key]}</TableCell>
                ))}
                {showAction && (
                  <TableCell className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      className="bg-amber-300 hover:bg-amber-600"
                      onClick={() => onEdit?.(e)}>
                      <Edit />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            type="button"
                            className="bg-red-500 hover:bg-red-700">
                            <Trash />
                          </Button>
                        }
                      />

                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash />
                          </AlertDialogMedia>
                          <AlertDialogTitle>Delete</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this item? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete?.(e)}>
                            Yes
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                )}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
