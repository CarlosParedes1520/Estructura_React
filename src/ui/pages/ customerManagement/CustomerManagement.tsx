import * as React from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  SlidersHorizontal,
} from "lucide-react";
import { AppButton } from "@/ui/components/AppButton";
import { FormCustomer } from "./FormCustomer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Customer } from "@/core/types/customer";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { ReusableRowSkeleton } from "@/ui/components/RowSkeleton";
import { customerService } from "@/infrastructure/adapters/api/customer/application/service/customerService";
import type { CreateCustomerPayload } from "@/infrastructure/adapters/api/customer/domain/customer";


// ✨ Definición centralizada de las columnas para la tabla
const customerTableColumns = [
  { id: "nombre", label: "Nombre", width: "w-40" },
  { id: "email", label: "Email", width: "w-56" },
  { id: "plan", label: "Plan", width: "w-24" },
  { id: "estado", label: "Estado", width: "w-24" },
  { id: "acciones", label: "Acciones", width: "w-20" },
];

function IconButton({
  title,
  onClick,
  children,
}: React.PropsWithChildren<{ title: string; onClick?: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </button>
  );
}

export default function CustomerManagement() {
  const [rows, setRows] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);

  // ✨ ESTADO PARA LA VISIBILIDAD DE COLUMNAS
  const [columnVisibility, setColumnVisibility] = React.useState({
    nombre: true,
    email: true,
    plan: true,
    estado: true,
  });

  // Filtra las columnas del skeleton que deben ser visibles
  const visibleSkeletonCols = customerTableColumns
    .filter(
      (col) => columnVisibility[col.id as keyof typeof columnVisibility] ?? true
    )
    .map((col) => col.width);

  const fetchPage = React.useCallback(async (p: number, l: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await customerService.listPaginated(p, l);
      setRows(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error("[CustomerManagement] Error al listar (paginado):", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar clientes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPage(page, limit);
  }, [fetchPage, page, limit]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(
    null
  );

  const handleAdd = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  // ✅ El formulario retorna CreateCustomerPayload
  const handleFormSubmit = async (payload: CreateCustomerPayload) => {
    try {
      if (editingCustomer) {
        await customerService.updateByEmail(editingCustomer.email, payload);
      } else {
        await customerService.create(payload);
      }
      await fetchPage(page, limit);
      handleCloseModal();
    } catch (e) {
      console.error("[CustomerManagement] Error al guardar:", e);
      alert(e instanceof Error ? e.message : "No se pudo guardar el cliente.");
    }
  };

  const handleDelete = async (c: Customer) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Estás seguro?",
      text: `El cliente "${c.name}" será marcado como inactivo.`,
      icon: "warning",
      showCancelButton: true,
      reverseButtons: true, // Confirmar a la izquierda
      confirmButtonText: "Sí, inactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!isConfirmed) return;

    try {
      await customerService.inactiveByEmail(c.email);
      await fetchPage(page, limit);
      Swal.fire(
        "¡Inactivado!",
        `El cliente ${c.name} ha sido inactivado.`,
        "success"
      );
    } catch (e) {
      console.error("[CustomerManagement] Error al inactivar:", e);
      Swal.fire(
        "Error",
        e instanceof Error ? e.message : "No se pudo inactivar.",
        "error"
      );
    }
  };

  const handleView = (c: Customer) => alert(`Ver: ${c.name}`);
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const from = rows.length ? (page - 1) * limit + 1 : 0;
  const to = rows.length ? (page - 1) * limit + rows.length : 0;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Listado de Clientes
        </h1>
        <AppButton
          onClick={handleAdd}
          className="p-1.5 sm:px-4"
          leftIcon={<Plus className="h-4 w-4" />}
          title="Añadir Cliente"
        >
          <span className="hidden sm:inline">Añadir Cliente</span>
        </AppButton>
      </div>

      <Card>
        {/* ✨ CABECERA CON EL BOTÓN DE FILTRO */}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Clientes</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-8">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Columnas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Alternar columnas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {customerTableColumns
                .filter((col) => col.id !== "acciones")
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={
                      columnVisibility[col.id as keyof typeof columnVisibility]
                    }
                    onCheckedChange={(value) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        [col.id]: !!value,
                      }))
                    }
                  >
                    {col.label}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              {/* ✨ HEADER DE TABLA RENDERIZADO DINÁMICAMENTE */}
              <TableHeader className="hidden sm:table-header-group">
                <TableRow>
                  {customerTableColumns.map((col) => {
                    const isVisible =
                      columnVisibility[
                        col.id as keyof typeof columnVisibility
                      ] ?? true;
                    if (!isVisible) return null;

                    return (
                      <TableHead
                        key={col.id}
                        className={col.id === "acciones" ? "text-right" : ""}
                      >
                        {col.label}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading &&
                  Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
                    <ReusableRowSkeleton
                      key={`s-${i}`}
                      colWidths={visibleSkeletonCols}
                    />
                  ))}

                {!loading && rows.length === 0 && (
                  <TableRow className="block sm:table-row">
                    <TableCell
                      colSpan={customerTableColumns.length}
                      className="py-10 text-center text-slate-500 block sm:table-cell"
                    >
                      No hay clientes aún.
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  rows.map((c) => (
                    <TableRow
                      key={c._id ?? c.email}
                      className="block border-b border-slate-200 last:border-b-0 mb-4 sm:mb-0 sm:table-row sm:border-b"
                    >
                      {/* ✨ CELDAS RENDERIZADAS CONDICIONALMENTE */}
                      {columnVisibility.nombre && (
                        <TableCell
                          data-label="Nombre"
                          className="block p-4 pt-2 sm:p-2 flex flex-col items-start gap-1 sm:table-cell sm:text-left before:font-semibold before:text-slate-700 before:text-sm before:content-[attr(data-label)] before:block sm:before:hidden"
                        >
                          <span className="font-medium text-slate-900 sm:text-base">
                            {c.name}
                          </span>
                        </TableCell>
                      )}
                      {columnVisibility.email && (
                        <TableCell
                          data-label="Email"
                          className="block p-4 pt-0 sm:p-2 flex flex-col items-start gap-1 sm:table-cell sm:text-left before:font-semibold before:text-slate-700 before:text-sm before:content-[attr(data-label)] before:block sm:before:hidden"
                        >
                          <span className="text-slate-700 sm:text-base">
                            {c.email}
                          </span>
                        </TableCell>
                      )}
                      {columnVisibility.plan && (
                        <TableCell
                          data-label="Plan"
                          className="block p-4 pt-0 sm:p-2 flex flex-col items-start gap-1 sm:table-cell sm:text-left before:font-semibold before:text-slate-700 before:text-sm before:content-[attr(data-label)] before:block sm:before:hidden"
                        >
                          <span className="text-slate-700 sm:text-base">
                            N/A
                          </span>
                        </TableCell>
                      )}
                      {columnVisibility.estado && (
                        <TableCell
                          data-label="Estado"
                          className="block p-4 pt-0 sm:p-2 flex flex-col items-start gap-1 sm:table-cell sm:text-left before:font-semibold before:text-slate-700 before:text-sm before:content-[attr(data-label)] before:block sm:before:hidden"
                        >
                          <span className="text-slate-700 sm:text-base">
                            Activo
                          </span>
                        </TableCell>
                      )}
                      <TableCell className="block p-4 pt-2 sm:p-2 flex justify-end items-center gap-1.5 border-t border-dashed border-slate-200 mt-2 sm:table-cell sm:border-t-0 sm:mt-0 sm:justify-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <IconButton title="Ver" onClick={() => handleView(c)}>
                            <Eye className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            title="Editar"
                            onClick={() => handleEdit(c)}
                          >
                            <Pencil className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            title="Inactivar"
                            onClick={() => handleDelete(c)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              Mostrando{" "}
              <span className="font-medium text-slate-900">{from}</span>–
              <span className="font-medium text-slate-900">{to}</span> de{" "}
              <span className="font-medium text-slate-900">{totalItems}</span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setPage(1);
                  setLimit(parseInt(v, 10));
                }}
              >
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue placeholder="Tamaño" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} pág
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="mr-1"
                  onClick={() => setPage(1)}
                  disabled={!canPrev || loading}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="mr-1"
                  onClick={() => canPrev && setPage((p) => p - 1)}
                  disabled={!canPrev || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-2 text-sm text-slate-700">
                  Página{" "}
                  <span className="font-semibold text-slate-900">{page}</span> /{" "}
                  {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-1"
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-1"
                  onClick={() => setPage(totalPages)}
                  disabled={!canNext || loading}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="border-t border-slate-200 p-4 text-sm text-rose-600">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <FormCustomer
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit} // ✅ ahora recibe CreateCustomerPayload
        initialValues={editingCustomer ?? undefined}
        title={editingCustomer ? "Editar Cliente" : "Añadir Nuevo Cliente"}
      />
    </>
  );
}
