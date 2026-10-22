import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({loading, page, totalPages}) {
  return (
    <div className="flex items-center justify-start gap-1 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={loading || page === 1}
        onClick={() => setPage((currentPage) => currentPage - 1)}
        aria-label="Previous page">
        <ChevronLeft />
      </Button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? "default" : "outline"}
            size="sm"
            disabled={loading}
            onClick={() => setPage(pageNumber)}
            aria-current={pageNumber === page ? "page" : undefined}>
            {pageNumber}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={loading || page === totalPages}
        onClick={() => setPage((currentPage) => currentPage + 1)}
        aria-label="Next page">
        <ChevronRight />
      </Button>
    </div>
  );
}
