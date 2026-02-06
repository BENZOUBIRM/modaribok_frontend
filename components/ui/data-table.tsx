import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDataTable,
  type ColumnDef,
  type SortDirection,
} from '@/hooks/use-data-table';
import { useLanguage } from '@/i18n/useLanguage';

// Sort icon component
interface SortIconProps {
  direction: SortDirection;
}

const SortIcon: React.FC<SortIconProps> = ({ direction }) => {
  if (direction === 'asc') {
    return (
      <Icon
        icon="solar:alt-arrow-up-linear"
        className="ms-2 h-4 w-4 inline-block"
      />
    );
  }
  if (direction === 'desc') {
    return (
      <Icon
        icon="solar:alt-arrow-down-linear"
        className="ms-2 h-4 w-4 inline-block"
      />
    );
  }
  return (
    <Icon
      icon="solar:sort-linear"
      className="ms-2 h-4 w-4 inline-block opacity-50"
    />
  );
};

// Action button type
export interface ActionButton<T = any> {
  icon: string;
  label: string;
  variant: 'info' | 'success' | 'warning' | 'danger';
  onClick: (row: T) => void;
}

// DataTable props
export interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: ActionButton<T>[];
  pageSize?: number;
  searchKeys?: string[];
  rowIdKey?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  showSelection?: boolean;
  showBorders?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  pageSize = 10,
  searchKeys = [],
  rowIdKey = 'id',
  showSearch = true,
  showPagination = true,
  showSelection = false,
  showBorders: initialShowBorders = true,
  onSelectionChange,
}: DataTableProps<T>) {
  // Table settings state
  const [showBorders, setShowBorders] = useState(initialShowBorders);
  
  // Get RTL status for proper dropdown alignment
  const { isRTL } = useLanguage();

  const {
    displayData,
    sortConfig,
    handleSort,
    searchQuery,
    setSearchQuery,
    pagination,
    goToPage,
    setPageSize,
    visibleColumns,
    toggleColumn,
    selectedRows,
    toggleRow,
    toggleAllRows,
    isAllSelected,
  } = useDataTable({
    data,
    columns,
    initialPageSize: pageSize,
    searchKeys,
    rowIdKey,
  });

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedRows));
    }
  }, [selectedRows, onSelectionChange]);

  // Get visible columns
  const visibleColumnDefs = columns.filter((col) =>
    visibleColumns.includes(col.key)
  );

  // Action button variant styles
  const actionVariants = {
    info: 'bg-blue-500 hover:bg-blue-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      {(showSearch || columns.length > 0) && (
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1 max-w-sm">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>
          )}

          {/* Table Settings dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" title="Table Settings">
                <Icon icon="solar:settings-linear" className="h-4 w-4 sm:me-2" />
                <span className="hidden sm:inline">Table Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-52">
              {/* Display Options */}
              <DropdownMenuLabel>Display Options</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showBorders}
                onCheckedChange={setShowBorders}
              >
                <Icon icon="solar:table-linear" className="me-2 h-4 w-4" />
                Show Borders
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              
              {/* Column Visibility */}
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns.includes(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table bordered={showBorders} className="border-0">
          <TableHeader>
            <TableRow>
              {/* Selection checkbox */}
              {showSelection && (
                <TableHead className="w-[50px] !p-0">
                  <div className="flex items-center justify-center h-full w-full px-4 py-2">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleAllRows}
                      aria-label="Select all rows"
                    />
                  </div>
                </TableHead>
              )}

              {/* Column headers */}
              {visibleColumnDefs.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className={`text-center ${column.sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center justify-center">
                    {column.label}
                    {column.sortable && (
                      <SortIcon
                        direction={
                          sortConfig.key === column.key
                            ? sortConfig.direction
                            : null
                        }
                      />
                    )}
                  </div>
                </TableHead>
              ))}

              {/* Actions column */}
              {actions.length > 0 && (
                <TableHead className="text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleColumnDefs.length +
                    (showSelection ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Icon icon="solar:file-text-linear" className="h-8 w-8" />
                    <p>No results found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((row, rowIndex) => {
                const rowId = String(row[rowIdKey]);
                const isSelected = selectedRows.has(rowId);

                return (
                  <TableRow key={rowId || rowIndex} data-state={isSelected ? 'selected' : undefined}>
                    {/* Selection checkbox */}
                    {showSelection && (
                      <TableCell className="w-[50px] !p-0">
                        <div className="flex items-center justify-center h-full w-full py-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRow(rowId)}
                            aria-label={`Select row ${rowId}`}
                          />
                        </div>
                      </TableCell>
                    )}

                    {/* Column cells */}
                    {visibleColumnDefs.map((column) => (
                      <TableCell key={column.key} className="text-center">
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </TableCell>
                    ))}

                    {/* Action buttons */}
                    {actions.length > 0 && (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(row)}
                              className={`inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                                actionVariants[action.variant]
                              }`}
                              title={action.label}
                              aria-label={action.label}
                            >
                              <Icon icon={action.icon} className="h-4 w-4" />
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && pagination.totalPages > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Results info */}
          <div className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalItems
              )}
            </span>{' '}
            of <span className="font-medium">{pagination.totalItems}</span> results
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={pagination.currentPage === 1}
              >
                <Icon icon="solar:double-alt-arrow-left-linear" className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <Icon icon="solar:alt-arrow-left-linear" className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Page</span>
                <span className="font-medium">{pagination.currentPage}</span>
                <span className="text-muted-foreground">of</span>
                <span className="font-medium">{pagination.totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <Icon icon="solar:alt-arrow-right-linear" className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <Icon icon="solar:double-alt-arrow-right-linear" className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
