import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MyTableHeader({
  limitData = [],
  onCreate,
  searchValue,
  onSearchChange,
  limitValue,
  onLimitChange,
  buttonLabel,
}) {
  return (
    <div className="flex justify-between items-end pt-4 pb-2">
      <div className="flex gap-2">
        <Input
          className="text-sm w-fit"
          type="text"
          placeholder="search data"
          value={searchValue}
          onChange={onSearchChange}
        />

        <Select value={String(limitValue)} onValueChange={onLimitChange}>
          <SelectTrigger className="">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>limit</SelectLabel>
              {limitData.map((item) => (
                <SelectItem key={item} value={String(item)}>
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Button type="button" onClick={onCreate}>
        {buttonLabel}
      </Button>
    </div>
  );
}
