import * as React from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import type { Customer } from "@/core/types/customer";
import {
  createCustomer,
  inactiveCustomerByEmail,
  listCustomersPaginated,
  updateCustomerByEmail,
} from "@/infrastructure/adapters/api/service/customer/customer.service";
import { customerTableColumns } from "@/core/helpers/columnTable";

export function useCustomerManagement() {
  // --- STATE MANAGEMENT ---
  const [rows, setRows] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Pagination State
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);

  // Column Visibility State
  const [columnVisibility, setColumnVisibility] = React.useState({
    nombre: true,
    email: true,
    plan: true,
    estado: true,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(
    null
  );

  // --- DATA FETCHING ---
  const fetchPage = React.useCallback(async (p: number, l: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCustomersPaginated(p, l);
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

  // --- HANDLERS ---
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

  const handleFormSubmit = async (customer: Customer) => {
    try {
      const payload = {
        name: customer.name.trim(),
        last_name: (customer.last_name ?? "").trim(),
        email: customer.email.trim().toLowerCase(),
        phone: Number(customer.phone),
      };

      if (editingCustomer) {
        await updateCustomerByEmail(editingCustomer.email, payload);
      } else {
        await createCustomer(payload);
      }
      handleCloseModal();
      await fetchPage(page, limit); // Recarga la página actual
    } catch (e) {
      console.error("[CustomerManagement] Error al guardar:", e);
      alert(e instanceof Error ? e.message : "No se pudo guardar el cliente.");
    }
  };

  const handleDelete = async (c: Customer) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `El cliente "${c.name}" será marcado como inactivo.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, ¡inactivar!",
      cancelButtonText: "No, cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await inactiveCustomerByEmail(c.email);
          Swal.fire(
            "¡Inactivado!",
            `El cliente ${c.name} ha sido inactivado.`,
            "success"
          );
          await fetchPage(page, limit);
        } catch (e) {
          console.error("[CustomerManagement] Error al inactivar:", e);
          const errorMessage =
            e instanceof Error ? e.message : "No se pudo inactivar el cliente.";
          Swal.fire("Error", errorMessage, "error");
        }
      }
    });
  };

  const handleView = (c: Customer) => alert(`Ver: ${c.name}`);

  // --- DERIVED DATA ---
  const visibleSkeletonCols = customerTableColumns
    .filter(
      (col) => columnVisibility[col.id as keyof typeof columnVisibility] ?? true
    )
    .map((col) => col.width);

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const from = rows.length ? (page - 1) * limit + 1 : 0;
  const to = rows.length ? (page - 1) * limit + rows.length : 0;

  // --- RETURNED VALUES ---
  return {
    rows,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalItems,
    columnVisibility,
    setColumnVisibility,
    isModalOpen,
    editingCustomer,
    handleAdd,
    handleEdit,
    handleCloseModal,
    handleFormSubmit,
    handleDelete,
    handleView,
    visibleSkeletonCols,
    canPrev,
    canNext,
    from,
    to,
  };
}
