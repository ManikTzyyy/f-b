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
  onRowClick,
  showAction = false,
  showPic = false,
  pic_url = "",
}) {
  let a = showPic ? table.length + 1 : table.length || 0;
  let b = showAction ? table.length + 1 : table.length || 0;
  const colLength = a + b;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showPic && <TableHead>Pic</TableHead>}
          {table.map((e) => {
            return <TableHead key={e}>{e}</TableHead>;
          })}
          {showAction && <TableHead className="text-center">Action</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={colLength} className="text-center h-32">
              <div className="flex justify-center items-center">
                <Spinner />
              </div>
            </TableCell>
          </TableRow>
        ) : data.length == 0 ? (
          <TableRow>
            <TableCell colSpan={colLength} className="text-center h-32">
              <div className="flex justify-center items-center text-sm text-stone-400">
                no data found
              </div>
            </TableCell>
          </TableRow>
        ) : (
          data.map((e) => {
            return (
              <TableRow
                key={e.id}
                className={`text-sm${onRowClick ? " cursor-pointer hover:bg-muted/50" : ""}`}
                onClick={() => onRowClick?.(e)}
              >
                {showPic && (
                  <TableCell className={e.available !== undefined && !e.available ? "bg-red-100/50" : ""}>
                    <div className="w-10 h-10 rounded-lg overflow-hidden">
                      <img
                        src={e[pic_url]}
                        alt={e.name || "Ingredient"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                )}
                {dataMap.map((key) => (
                  <TableCell
                    key={key}
                    className={e.available !== undefined && !e.available ? "bg-red-100/50" : ""}
                  >
                    {key === "available" && typeof e.available === "boolean" ? (
                      <span
                        className={
                          e.available
                            ? "font-medium text-green-600"
                            : "font-medium text-red-600"
                        }
                      >
                        {e.available ? "Available" : "Not available"}
                      </span>
                    ) : (
                      key.split(".").reduce((value, part) => value?.[part], e)
                    )}
                  </TableCell>
                ))}
                {showAction && (
                  <TableCell className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      className="bg-amber-300 hover:bg-amber-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit?.(e);
                      }}
                    >
                      <Edit />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            type="button"
                            className="bg-red-500 hover:bg-red-700"
                          >
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
                          <AlertDialogAction
                            onClick={(event) => {
                              event.stopPropagation();
                              onDelete?.(e);
                            }}
                          >
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
