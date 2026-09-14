import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Building2,
  CalendarCheck2,
  Edit3,
  Plus,
  RotateCcw,
  Trash2
} from "lucide-react";

import toast from "react-hot-toast";

import {
  api,
  apiMessage,
  unwrap
} from "../../api/client";

import {
  ConfirmDialog,
  Field,
  FilterBar,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  PrimaryButton,
  SearchBox,
  SecondaryButton,
  Select,
  StatusBadge,
  TableShell,
  Textarea
} from "../../components/common/UI";

import {
  useAuth
} from "../../context/AuthContext";

import {
  CATEGORY_META
} from "../../lib/constants";

import {
  formatCurrency,
  formatDate,
  today
} from "../../lib/format";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const blankLine = () => ({
  item_id: "",
  description: "",
  category: "",
  hsn_code: "",
  bags: "",
  qty: "",
  uom: "kg",
  rate: "",
  gst_percent: ""
});

const blankForm = (
  unitId = ""
) => ({
  unit_id:
    unitId
      ? String(unitId)
      : "",

  po_date:
    today(),

  expected_date:
    "",

  supplier_id:
    "",

  supplier_name:
    "",

  address:
    "",

  mobile:
    "",

  gstin:
    "",

  supplier_reference:
    "",

  notes:
    "",

  items: [
    blankLine()
  ]
});

const money = (
  value
) => Number(
  value || 0
);

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PurchaseOrdersPage() {
  const {
    user,
    isSuperAdmin,
    hasPermission
  } = useAuth();

  /* ------------------------------------------------------------------------ */
  /* Data                                                                     */
  /* ------------------------------------------------------------------------ */

  const [
    rows,
    setRows
  ] = useState([]);

  const [
    units,
    setUnits
  ] = useState([]);

  const [
    suppliers,
    setSuppliers
  ] = useState([]);

  const [
    items,
    setItems
  ] = useState([]);

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    busy,
    setBusy
  ] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const [
    search,
    setSearch
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter
  ] = useState("");

  /*
   * Super Admin:
   * "" = All Units
   *
   * Admin / Employee:
   * always their assigned unit.
   */
  const [
    unitFilter,
    setUnitFilter
  ] = useState(
    isSuperAdmin
      ? ""
      : String(
          user?.unit_id ||
          ""
        )
  );

  /* ------------------------------------------------------------------------ */
  /* Form                                                                     */
  /* ------------------------------------------------------------------------ */

  const [
    open,
    setOpen
  ] = useState(false);

  const [
    editing,
    setEditing
  ] = useState(null);

  const [
    form,
    setForm
  ] = useState(
    () =>
      blankForm(
        user?.unit_id
      )
  );

  /* ------------------------------------------------------------------------ */
  /* Received Date                                                            */
  /* ------------------------------------------------------------------------ */

  const [
    receiveOrder,
    setReceiveOrder
  ] = useState(null);

  const [
    receivedDate,
    setReceivedDate
  ] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const [
    deleteOrder,
    setDeleteOrder
  ] = useState(null);

  /* ------------------------------------------------------------------------ */
  /* Permissions                                                              */
  /* ------------------------------------------------------------------------ */

  const canCreate =
    hasPermission(
      "purchase_orders.create"
    );

  const canEdit =
    hasPermission(
      "purchase_orders.edit"
    );

  const canReceive =
    hasPermission(
      "purchase_orders.receive"
    );

  const canDelete =
    hasPermission(
      "purchase_orders.delete"
    );

  /* ------------------------------------------------------------------------ */
  /* Load Units                                                               */
  /* ------------------------------------------------------------------------ */

  const loadUnits = async () => {
    if (!isSuperAdmin) {
      return;
    }

    try {
      const response =
        await api.get(
          "/units"
        );

      setUnits(
        unwrap(response) ||
        []
      );
    } catch (error) {
      console.error(
        "Failed to fetch units:",
        error
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Load Form Masters                                                        */
  /* ------------------------------------------------------------------------ */

  const loadMasters = async () => {
    if (
      !canCreate &&
      !canEdit
    ) {
      return;
    }

    try {
      const [
        supplierResponse,
        itemResponse
      ] =
        await Promise.all([
          api.get(
            "/parties",
            {
              params: {
                type:
                  "supplier",

                status:
                  "active"
              }
            }
          ),

          api.get(
            "/items",
            {
              params: {
                status:
                  "active"
              }
            }
          )
        ]);

      setSuppliers(
        unwrap(
          supplierResponse
        ) || []
      );

      setItems(
        unwrap(
          itemResponse
        ) || []
      );
    } catch (error) {
      console.error(
        "Failed to load Purchase Order masters:",
        error
      );

      toast.error(
        apiMessage(error)
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Load Orders                                                              */
  /* ------------------------------------------------------------------------ */

  const loadOrders = async () => {
    setLoading(true);

    try {
      const params = {};

      /*
       * Super Admin can select a unit.
       *
       * Admin and Employee backend already scopes
       * records to assigned unit.
       */
      if (
        isSuperAdmin &&
        unitFilter
      ) {
        params.unitId =
          unitFilter;
      }

      if (
        statusFilter
      ) {
        params.status =
          statusFilter;
      }

      const response =
        await api.get(
          "/purchase-orders",
          {
            params
          }
        );

      setRows(
        unwrap(response) ||
        []
      );
    } catch (error) {
      toast.error(
        apiMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Initial Masters                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    loadUnits();
    loadMasters();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Refresh Orders when Unit / Status changes                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    loadOrders();
  }, [
    unitFilter,
    statusFilter
  ]);

  /* ------------------------------------------------------------------------ */
  /* Local Search                                                             */
  /* ------------------------------------------------------------------------ */

  const filteredRows =
    useMemo(
      () => {
        const text =
          search
            .trim()
            .toLowerCase();

        if (!text) {
          return rows;
        }

        return rows.filter(
          (row) =>
            `
              ${row.po_no || ""}
              ${row.supplier_name || ""}
              ${row.supplier_reference || ""}
              ${row.gstin || ""}
              ${row.mobile || ""}
              ${row.unit?.unit_code || ""}
              ${row.unit?.unit_name || ""}
            `
              .toLowerCase()
              .includes(text)
        );
      },
      [
        rows,
        search
      ]
    );

  /* ------------------------------------------------------------------------ */
  /* Quantity                                                                 */
  /* ------------------------------------------------------------------------ */

  const effectiveQty = (
    line
  ) => {
    const enteredQty =
      money(
        line.qty
      );

    if (
      enteredQty > 0
    ) {
      return enteredQty;
    }

    const master =
      items.find(
        (item) =>
          String(item.id) ===
          String(
            line.item_id
          )
      );

    const standardWeight =
      money(
        master
          ?.standard_weight_kg
      );

    const packages =
      money(
        line.bags
      );

    if (
      packages > 0 &&
      standardWeight > 0
    ) {
      return (
        packages *
        standardWeight
      );
    }

    return 0;
  };

  /* ------------------------------------------------------------------------ */
  /* Totals                                                                   */
  /* ------------------------------------------------------------------------ */

  const totals =
    useMemo(
      () => {
        let subtotal = 0;
        let tax = 0;

        form.items.forEach(
          (line) => {
            const qty =
              effectiveQty(
                line
              );

            const amount =
              qty *
              money(
                line.rate
              );

            const lineTax =
              (
                amount *
                money(
                  line.gst_percent
                )
              ) /
              100;

            subtotal +=
              amount;

            tax +=
              lineTax;
          }
        );

        return {
          subtotal,

          tax,

          total:
            subtotal +
            tax
        };
      },
      [
        form.items,
        items
      ]
    );

  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  const startCreate = () => {
    setEditing(
      null
    );

    /*
     * If Super Admin currently filtered by one unit,
     * automatically select that unit in Create form.
     */
    const defaultUnit =
      isSuperAdmin
        ? unitFilter
        : String(
            user?.unit_id ||
            ""
          );

    setForm(
      blankForm(
        defaultUnit
      )
    );

    setOpen(true);
  };

  /* ------------------------------------------------------------------------ */
  /* Edit                                                                     */
  /* ------------------------------------------------------------------------ */

  const startEdit = (
    row
  ) => {
    setEditing(row);

    setForm({
      unit_id:
        String(
          row.unit_id ||
          ""
        ),

      po_date:
        row.po_date ||
        today(),

      expected_date:
        row.expected_date ||
        "",

      supplier_id:
        String(
          row.supplier_id ||
          ""
        ),

      supplier_name:
        row.supplier_name ||
        "",

      address:
        row.address ||
        "",

      mobile:
        row.mobile ||
        "",

      gstin:
        row.gstin ||
        "",

      supplier_reference:
        row.supplier_reference ||
        "",

      notes:
        row.notes ||
        "",

      items:
        (
          row.items ||
          []
        ).length
          ? row.items.map(
              (line) => ({
                item_id:
                  String(
                    line.item_id ||
                    ""
                  ),

                description:
                  line.description ||
                  "",

                category:
                  line.category ||
                  "",

                hsn_code:
                  line.hsn_code ||
                  "",

                bags:
                  String(
                    line.bags ??
                    ""
                  ),

                qty:
                  String(
                    line.qty ??
                    ""
                  ),

                uom:
                  line.uom ||
                  "kg",

                rate:
                  String(
                    line.rate ??
                    ""
                  ),

                gst_percent:
                  String(
                    line.gst_percent ??
                    ""
                  )
              })
            )
          : [
              blankLine()
            ]
    });

    setOpen(true);
  };

  /* ------------------------------------------------------------------------ */
  /* Supplier                                                                 */
  /* ------------------------------------------------------------------------ */

  const selectSupplier = (
    id
  ) => {
    const supplier =
      suppliers.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    setForm(
      (old) => ({
        ...old,

        supplier_id:
          id,

        supplier_name:
          supplier?.name ||
          "",

        address:
          supplier?.address ||
          "",

        mobile:
          supplier?.mobile ||
          "",

        gstin:
          supplier?.gstin ||
          ""
      })
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Lines                                                                    */
  /* ------------------------------------------------------------------------ */

  const updateLine = (
    index,
    key,
    value
  ) => {
    setForm(
      (old) => ({
        ...old,

        items:
          old.items.map(
            (
              line,
              lineIndex
            ) =>
              lineIndex ===
              index
                ? {
                    ...line,

                    [key]:
                      value
                  }
                : line
          )
      })
    );
  };

  const selectItem = (
    index,
    itemId
  ) => {
    const master =
      items.find(
        (item) =>
          String(item.id) ===
          String(itemId)
      );

    if (!master) {
      updateLine(
        index,
        "item_id",
        itemId
      );

      return;
    }

    setForm(
      (old) => ({
        ...old,

        items:
          old.items.map(
            (
              line,
              lineIndex
            ) => {
              if (
                lineIndex !==
                index
              ) {
                return line;
              }

              return {
                ...line,

                item_id:
                  String(
                    master.id
                  ),

                description:
                  master.item_name ||
                  "",

                category:
                  master.category ||
                  "",

                hsn_code:
                  master.hsn_code ||
                  "",

                uom:
                  master.uom ||
                  "kg",

                rate:
                  String(
                    master.default_rate ??
                    0
                  ),

                gst_percent:
                  String(
                    master.gst_percent ??
                    0
                  )
              };
            }
          )
      })
    );
  };

  const addLine = () => {
    setForm(
      (old) => ({
        ...old,

        items: [
          ...old.items,
          blankLine()
        ]
      })
    );
  };

  const removeLine = (
    index
  ) => {
    setForm(
      (old) => ({
        ...old,

        items:
          old.items.filter(
            (
              _,
              lineIndex
            ) =>
              lineIndex !==
              index
          )
      })
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Payload                                                                  */
  /* ------------------------------------------------------------------------ */

  const buildPayload =
    () => ({
      unit_id:
        Number(
          form.unit_id
        ),

      po_date:
        form.po_date,

      expected_date:
        form.expected_date ||
        null,

      supplier_id:
        form.supplier_id
          ? Number(
              form.supplier_id
            )
          : null,

      supplier_name:
        form.supplier_name
          .trim(),

      address:
        form.address ||
        null,

      mobile:
        form.mobile ||
        null,

      gstin:
        form.gstin ||
        null,

      supplier_reference:
        form.supplier_reference ||
        null,

      notes:
        form.notes ||
        null,

      items:
        form.items.map(
          (
            line,
            index
          ) => ({
            item_id:
              line.item_id
                ? Number(
                    line.item_id
                  )
                : null,

            sl_no:
              index + 1,

            description:
              line.description,

            category:
              line.category,

            hsn_code:
              line.hsn_code ||
              null,

            bags:
              Number(
                line.bags ||
                0
              ),

            qty:
              Number(
                line.qty ||
                0
              ),

            uom:
              line.uom ||
              "kg",

            rate:
              Number(
                line.rate ||
                0
              ),

            gst_percent:
              Number(
                line.gst_percent ||
                0
              )
          })
        )
    });

  /* ------------------------------------------------------------------------ */
  /* Save                                                                     */
  /* ------------------------------------------------------------------------ */

  const save = async (
    event
  ) => {
    event.preventDefault();

    if (!form.unit_id) {
      toast.error(
        "Choose a unit"
      );

      return;
    }

    if (
      !form.supplier_id &&
      !form.supplier_name.trim()
    ) {
      toast.error(
        "Choose a supplier"
      );

      return;
    }

    const invalidLine =
      form.items.some(
        (line) =>
          !line.description ||
          effectiveQty(
            line
          ) <= 0
      );

    if (
      !form.items.length ||
      invalidLine
    ) {
      toast.error(
        "Every item must have a description and valid quantity / package count"
      );

      return;
    }

    setBusy(true);

    try {
      if (editing) {
        await api.put(
          `/purchase-orders/${editing.id}`,
          buildPayload()
        );

        toast.success(
          "Purchase Order updated"
        );
      } else {
        await api.post(
          "/purchase-orders",
          buildPayload()
        );

        toast.success(
          "Purchase Order created"
        );
      }

      setOpen(false);

      await loadOrders();
    } catch (error) {
      toast.error(
        apiMessage(error)
      );
    } finally {
      setBusy(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Received Date                                                            */
  /* ------------------------------------------------------------------------ */

  const saveReceivedDate =
    async () => {
      if (!receiveOrder) {
        return;
      }

      setBusy(true);

      try {
        await api.patch(
          `/purchase-orders/${receiveOrder.id}/received-date`,
          {
            received_date:
              receivedDate ||
              null
          }
        );

        toast.success(
          receivedDate
            ? "Received date updated"
            : "Received date cleared"
        );

        setReceiveOrder(
          null
        );

        await loadOrders();
      } catch (error) {
        toast.error(
          apiMessage(error)
        );
      } finally {
        setBusy(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const remove =
    async () => {
      if (!deleteOrder) {
        return;
      }

      setBusy(true);

      try {
        await api.delete(
          `/purchase-orders/${deleteOrder.id}`
        );

        toast.success(
          "Purchase Order deleted"
        );

        setDeleteOrder(
          null
        );

        await loadOrders();
      } catch (error) {
        toast.error(
          apiMessage(error)
        );
      } finally {
        setBusy(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Procurement"
        title="Purchase Orders"
        description="Manage supplier Purchase Orders unit-wise and update received dates when the materials arrive."
        actions={
          canCreate
            ? (
                <PrimaryButton
                  icon={Plus}
                  onClick={
                    startCreate
                  }
                >
                  New Purchase Order
                </PrimaryButton>
              )
            : null
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* Filters                                                            */}
      {/* ------------------------------------------------------------------ */}

      <FilterBar>
        <SearchBox
          value={search}
          onChange={
            setSearch
          }
          placeholder="Search PO no, supplier, reference..."
        />

        {
          isSuperAdmin
            ? (
                <div className="min-w-[210px]">
                  <Select
                    value={
                      unitFilter
                    }
                    onChange={
                      (event) =>
                        setUnitFilter(
                          event.target.value
                        )
                    }
                    options={
                      units.map(
                        (unit) => ({
                          value:
                            String(
                              unit.id
                            ),

                          label:
                            `${unit.unit_code} · ${unit.unit_name}`
                        })
                      )
                    }
                    placeholder="All Units"
                  />
                </div>
              )
            : (
                <div className="flex min-h-11 min-w-[210px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                  <Building2
                    size={16}
                    className="text-slate-400"
                  />

                  <span>
                    {
                      user?.unit?.unit_code ||
                      "Unit"
                    }
                    {
                      user?.unit?.unit_name
                        ? ` · ${user.unit.unit_name}`
                        : ""
                    }
                  </span>
                </div>
              )
        }

        <Select
          value={
            statusFilter
          }
          onChange={
            (event) =>
              setStatusFilter(
                event.target.value
              )
          }
          options={[
            {
              value:
                "pending",

              label:
                "Pending"
            },

            {
              value:
                "received",

              label:
                "Received"
            },

            {
              value:
                "cancelled",

              label:
                "Cancelled"
            }
          ]}
          placeholder="All Status"
          className="sm:w-44"
        />
      </FilterBar>

      {/* ------------------------------------------------------------------ */}
      {/* Table                                                              */}
      {/* ------------------------------------------------------------------ */}

      {
        loading
          ? (
              <LoadingBlock
                label="Loading Purchase Orders..."
              />
            )
          : (
              <TableShell>
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>
                        PO No
                      </th>

                      <th>
                        Unit
                      </th>

                      <th>
                        Supplier
                      </th>

                      <th>
                        PO Date
                      </th>

                      <th>
                        Expected
                      </th>

                      <th>
                        Received
                      </th>

                      <th>
                        Total
                      </th>

                      <th>
                        Status
                      </th>

                      <th className="text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {
                      filteredRows.map(
                        (row) => (
                          <tr
                            key={
                              row.id
                            }
                          >
                            <td>
                              <div className="font-semibold text-slate-950">
                                {
                                  row.po_no
                                }
                              </div>

                              {
                                row.supplier_reference &&
                                (
                                  <div className="mt-1 text-xs text-slate-400">
                                    Ref: {
                                      row.supplier_reference
                                    }
                                  </div>
                                )
                              }
                            </td>

                            <td>
                              <div className="font-semibold text-slate-800">
                                {
                                  row.unit?.unit_code ||
                                  "—"
                                }
                              </div>

                              <div className="text-xs text-slate-400">
                                {
                                  row.unit?.unit_name ||
                                  ""
                                }
                              </div>
                            </td>

                            <td>
                              <div className="font-semibold text-slate-800">
                                {
                                  row.supplier_name
                                }
                              </div>

                              <div className="text-xs text-slate-400">
                                {
                                  row.gstin ||
                                  row.mobile ||
                                  "—"
                                }
                              </div>
                            </td>

                            <td>
                              {
                                formatDate(
                                  row.po_date
                                )
                              }
                            </td>

                            <td>
                              {
                                formatDate(
                                  row.expected_date
                                )
                              }
                            </td>

                            <td>
                              {
                                row.received_date
                                  ? formatDate(
                                      row.received_date
                                    )
                                  : (
                                      <span className="text-slate-400">
                                        Not received
                                      </span>
                                    )
                              }
                            </td>

                            <td className="font-semibold">
                              {
                                formatCurrency(
                                  row.total_amount
                                )
                              }
                            </td>

                            <td>
                              <StatusBadge
                                value={
                                  row.status
                                }
                              />
                            </td>

                            <td>
                              <div className="flex justify-end gap-1">
                                {
                                  canReceive &&
                                  row.status !==
                                    "cancelled" &&
                                  (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReceiveOrder(
                                          row
                                        );

                                        setReceivedDate(
                                          row.received_date ||
                                          today()
                                        );
                                      }}
                                      className="rounded-xl p-2 text-emerald-700 transition hover:bg-emerald-50"
                                      title="Update received date"
                                    >
                                      <CalendarCheck2
                                        size={17}
                                      />
                                    </button>
                                  )
                                }

                                {
                                  canEdit &&
                                  (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        startEdit(
                                          row
                                        )
                                      }
                                      className="rounded-xl p-2 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                                      title="Edit Purchase Order"
                                    >
                                      <Edit3
                                        size={17}
                                      />
                                    </button>
                                  )
                                }

                                {
                                  canDelete &&
                                  (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDeleteOrder(
                                          row
                                        )
                                      }
                                      className="rounded-xl p-2 text-rose-600 transition hover:bg-rose-50"
                                      title="Delete Purchase Order"
                                    >
                                      <Trash2
                                        size={17}
                                      />
                                    </button>
                                  )
                                }
                              </div>
                            </td>
                          </tr>
                        )
                      )
                    }

                    {
                      !filteredRows.length &&
                      (
                        <tr>
                          <td
                            colSpan="9"
                            className="py-12 text-center text-sm text-slate-400"
                          >
                            No Purchase Orders found for the selected filters.
                          </td>
                        </tr>
                      )
                    }
                  </tbody>
                </table>
              </TableShell>
            )
      }

      {/* ------------------------------------------------------------------ */}
      {/* Purchase Order Form                                                */}
      {/* ------------------------------------------------------------------ */}

      <Modal
        open={open}
        onClose={() =>
          setOpen(false)
        }
        title={
          editing
            ? `Edit Purchase Order · ${editing.po_no}`
            : "Create Purchase Order"
        }
        description="Purchase Order is a planning document. Stock is received only through Purchase DC / Inward approval."
        size="max-w-7xl"
      >
        <form
          onSubmit={save}
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {
              isSuperAdmin
                ? (
                    <Field label="Unit">
                      <Select
                        required
                        value={
                          form.unit_id
                        }
                        disabled={
                          !!editing
                        }
                        onChange={
                          (event) =>
                            setForm(
                              (old) => ({
                                ...old,

                                unit_id:
                                  event.target.value
                              })
                            )
                        }
                        options={
                          units
                            .filter(
                              (unit) =>
                                unit.status ===
                                "active"
                            )
                            .map(
                              (unit) => ({
                                value:
                                  String(
                                    unit.id
                                  ),

                                label:
                                  `${unit.unit_code} · ${unit.unit_name}`
                              })
                            )
                        }
                        placeholder="Choose Unit"
                      />
                    </Field>
                  )
                : (
                    <Field label="Unit">
                      <Input
                        readOnly
                        value={
                          `${user?.unit?.unit_code || ""} · ${user?.unit?.unit_name || ""}`
                        }
                      />
                    </Field>
                  )
            }

            <Field label="PO Date">
              <Input
                required
                type="date"
                value={
                  form.po_date
                }
                onChange={
                  (event) =>
                    setForm(
                      (old) => ({
                        ...old,

                        po_date:
                          event.target.value
                      })
                    )
                }
              />
            </Field>

            <Field label="Expected Date">
              <Input
                type="date"
                value={
                  form.expected_date
                }
                onChange={
                  (event) =>
                    setForm(
                      (old) => ({
                        ...old,

                        expected_date:
                          event.target.value
                      })
                    )
                }
              />
            </Field>

            <Field label="Supplier Reference">
              <Input
                value={
                  form.supplier_reference
                }
                onChange={
                  (event) =>
                    setForm(
                      (old) => ({
                        ...old,

                        supplier_reference:
                          event.target.value
                      })
                    )
                }
              />
            </Field>

            <Field label="Supplier">
              <Select
                required
                value={
                  form.supplier_id
                }
                onChange={
                  (event) =>
                    selectSupplier(
                      event.target.value
                    )
                }
                options={
                  suppliers.map(
                    (supplier) => ({
                      value:
                        String(
                          supplier.id
                        ),

                      label:
                        `${supplier.name}${supplier.gstin ? ` · ${supplier.gstin}` : ""}`
                    })
                  )
                }
                placeholder="Choose Supplier"
              />
            </Field>

            <Field label="Mobile">
              <Input
                value={
                  form.mobile
                }
                onChange={
                  (event) =>
                    setForm(
                      (old) => ({
                        ...old,

                        mobile:
                          event.target.value
                      })
                    )
                }
              />
            </Field>

            <Field label="GSTIN">
              <Input
                value={
                  form.gstin
                }
                onChange={
                  (event) =>
                    setForm(
                      (old) => ({
                        ...old,

                        gstin:
                          event.target.value.toUpperCase()
                      })
                    )
                }
              />
            </Field>

            <Field label="Address">
              <Input
                value={
                  form.address
                }
                onChange={
                  (event) =>
                    setForm(
                      (old) => ({
                        ...old,

                        address:
                          event.target.value
                      })
                    )
                }
              />
            </Field>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Order Items                                                    */}
          {/* -------------------------------------------------------------- */}

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">
                  Purchase Order Items
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Quantity and package calculation follows the Item master stock profile.
                </p>
              </div>

              <SecondaryButton
                type="button"
                icon={Plus}
                onClick={
                  addLine
                }
              >
                Add Item
              </SecondaryButton>
            </div>

            <div className="space-y-3">
              {
                form.items.map(
                  (
                    line,
                    index
                  ) => {
                    const master =
                      items.find(
                        (item) =>
                          String(
                            item.id
                          ) ===
                          String(
                            line.item_id
                          )
                      );

                    const meta =
                      CATEGORY_META[
                        line.category
                      ] || {
                        packageLabel:
                          "Packages"
                      };

                    return (
                      <div
                        key={
                          index
                        }
                        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 xl:grid-cols-[1.4fr_1.3fr_.7fr_.7fr_.7fr_.7fr_auto]"
                      >
                        <Field label="Item">
                          <Select
                            required
                            value={
                              line.item_id
                            }
                            onChange={
                              (event) =>
                                selectItem(
                                  index,
                                  event.target.value
                                )
                            }
                            options={
                              items.map(
                                (item) => ({
                                  value:
                                    String(
                                      item.id
                                    ),

                                  label:
                                    `${item.item_code} · ${item.item_name}`
                                })
                              )
                            }
                            placeholder="Choose Item"
                          />
                        </Field>

                        <Field label="Description">
                          <Input
                            value={
                              line.description
                            }
                            onChange={
                              (event) =>
                                updateLine(
                                  index,
                                  "description",
                                  event.target.value
                                )
                            }
                          />
                        </Field>

                        <Field
                          label={
                            meta.packageLabel ||
                            "Packages"
                          }
                        >
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              line.bags
                            }
                            onChange={
                              (event) =>
                                updateLine(
                                  index,
                                  "bags",
                                  event.target.value
                                )
                            }
                          />
                        </Field>

                        <Field
                          label="Qty Kg"
                          hint={
                            master?.standard_weight_kg
                              ? `Auto: ${master.standard_weight_kg} kg/package`
                              : null
                          }
                        >
                          <Input
                            type="number"
                            min="0"
                            step="0.001"
                            value={
                              line.qty
                            }
                            onChange={
                              (event) =>
                                updateLine(
                                  index,
                                  "qty",
                                  event.target.value
                                )
                            }
                          />
                        </Field>

                        <Field label="Rate">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              line.rate
                            }
                            onChange={
                              (event) =>
                                updateLine(
                                  index,
                                  "rate",
                                  event.target.value
                                )
                            }
                          />
                        </Field>

                        <Field label="GST %">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={
                              line.gst_percent
                            }
                            onChange={
                              (event) =>
                                updateLine(
                                  index,
                                  "gst_percent",
                                  event.target.value
                                )
                            }
                          />
                        </Field>

                        <div className="flex items-end">
                          <button
                            type="button"
                            disabled={
                              form.items.length ===
                              1
                            }
                            onClick={() =>
                              removeLine(
                                index
                              )
                            }
                            className="grid h-12 w-12 place-items-center rounded-2xl border border-rose-100 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  }
                )
              }
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Summary
                label="Subtotal"
                value={
                  formatCurrency(
                    totals.subtotal
                  )
                }
              />

              <Summary
                label="Tax"
                value={
                  formatCurrency(
                    totals.tax
                  )
                }
              />

              <Summary
                label="Grand Total"
                value={
                  formatCurrency(
                    totals.total
                  )
                }
                strong
              />
            </div>
          </div>

          <Field label="Notes">
            <Textarea
              value={
                form.notes
              }
              onChange={
                (event) =>
                  setForm(
                    (old) => ({
                      ...old,

                      notes:
                        event.target.value
                    })
                  )
              }
            />
          </Field>

          <div className="flex justify-end gap-2">
            <SecondaryButton
              type="button"
              onClick={() =>
                setOpen(false)
              }
            >
              Cancel
            </SecondaryButton>

            <PrimaryButton
              disabled={busy}
            >
              {
                busy
                  ? "Saving..."
                  : editing
                    ? "Update Purchase Order"
                    : "Create Purchase Order"
              }
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* Received Date                                                      */}
      {/* ------------------------------------------------------------------ */}

      <Modal
        open={
          !!receiveOrder
        }
        onClose={() =>
          setReceiveOrder(
            null
          )
        }
        title={
          `Received Date · ${receiveOrder?.po_no || ""}`
        }
        description="Enter the actual material received date. Clearing the received date will move the Purchase Order back to Pending."
        size="max-w-md"
      >
        <Field label="Received Date">
          <Input
            type="date"
            value={
              receivedDate
            }
            onChange={
              (event) =>
                setReceivedDate(
                  event.target.value
                )
            }
          />
        </Field>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {
            receiveOrder
              ?.received_date &&
            (
              <SecondaryButton
                icon={RotateCcw}
                onClick={() =>
                  setReceivedDate(
                    ""
                  )
                }
              >
                Clear Date
              </SecondaryButton>
            )
          }

          <SecondaryButton
            onClick={() =>
              setReceiveOrder(
                null
              )
            }
          >
            Cancel
          </SecondaryButton>

          <PrimaryButton
            disabled={busy}
            onClick={
              saveReceivedDate
            }
          >
            {
              busy
                ? "Saving..."
                : "Update Received Date"
            }
          </PrimaryButton>
        </div>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* Delete                                                             */}
      {/* ------------------------------------------------------------------ */}

      <ConfirmDialog
        open={
          !!deleteOrder
        }
        onClose={() =>
          setDeleteOrder(
            null
          )
        }
        onConfirm={
          remove
        }
        title="Delete Purchase Order"
        description={
          `Delete ${deleteOrder?.po_no || "this Purchase Order"}? All Purchase Order item rows will also be permanently removed.`
        }
        confirmText="Delete Purchase Order"
        danger
        busy={busy}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

function Summary({
  label,
  value,
  strong = false
}) {
  return (
    <div
      className={
        `rounded-2xl p-4 ${
          strong
            ? "bg-slate-950 text-white"
            : "bg-white"
        }`
      }
    >
      <div
        className={
          `text-xs ${
            strong
              ? "text-slate-400"
              : "text-slate-500"
          }`
        }
      >
        {label}
      </div>

      <div className="mt-1 font-bold">
        {value}
      </div>
    </div>
  );
}