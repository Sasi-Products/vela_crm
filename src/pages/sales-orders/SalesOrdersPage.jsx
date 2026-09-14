import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Building2,
  Edit3,
  Plus,
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

  so_date:
    today(),

  expected_delivery_date:
    "",

  customer_id:
    "",

  customer_name:
    "",

  address:
    "",

  mobile:
    "",

  gstin:
    "",

  customer_order_no:
    "",

  status:
    "pending",

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

export default function SalesOrdersPage() {
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
    customers,
    setCustomers
  ] = useState([]);

  const [
    items,
    setItems
  ] = useState([]);

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
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
    deleteOrder,
    setDeleteOrder
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
  /* Permissions                                                              */
  /* ------------------------------------------------------------------------ */

  const canCreate =
    hasPermission(
      "sales_orders.create"
    );

  const canEdit =
    hasPermission(
      "sales_orders.edit"
    );

  const canDelete =
    hasPermission(
      "sales_orders.delete"
    );

  /* ------------------------------------------------------------------------ */
  /* Units                                                                    */
  /* ------------------------------------------------------------------------ */

  const loadUnits =
    async () => {
      if (!isSuperAdmin) {
        return;
      }

      try {
        const response =
          await api.get(
            "/units"
          );

        setUnits(
          unwrap(
            response
          ) || []
        );
      } catch (error) {
        console.error(
          "Failed to fetch units:",
          error
        );
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Masters                                                                  */
  /* ------------------------------------------------------------------------ */

  const loadMasters =
    async () => {
      if (
        !canCreate &&
        !canEdit
      ) {
        return;
      }

      try {
        const [
          customerResponse,
          itemResponse
        ] =
          await Promise.all([
            api.get(
              "/parties",
              {
                params: {
                  type:
                    "customer",

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

        setCustomers(
          unwrap(
            customerResponse
          ) || []
        );

        setItems(
          unwrap(
            itemResponse
          ) || []
        );
      } catch (error) {
        console.error(
          "Failed to load Sales Order masters:",
          error
        );

        toast.error(
          apiMessage(error)
        );
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Orders                                                                   */
  /* ------------------------------------------------------------------------ */

  const loadOrders =
    async () => {
      setLoading(true);

      try {
        const params = {};

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
            "/sales-orders",
            {
              params
            }
          );

        setRows(
          unwrap(
            response
          ) || []
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
  /* Initial Load                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    loadUnits();
    loadMasters();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [
    unitFilter,
    statusFilter
  ]);

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
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
              ${row.so_no || ""}
              ${row.customer_name || ""}
              ${row.customer_order_no || ""}
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
  /* Effective Quantity                                                       */
  /* ------------------------------------------------------------------------ */

  const effectiveQty =
    (
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
            String(
              item.id
            ) ===
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

  const startCreate =
    () => {
      setEditing(
        null
      );

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

      setOpen(
        true
      );
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

      so_date:
        row.so_date ||
        today(),

      expected_delivery_date:
        row.expected_delivery_date ||
        "",

      customer_id:
        String(
          row.customer_id ||
          ""
        ),

      customer_name:
        row.customer_name ||
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

      customer_order_no:
        row.customer_order_no ||
        "",

      status:
        row.status ||
        "pending",

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

    setOpen(
      true
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Customer                                                                 */
  /* ------------------------------------------------------------------------ */

  const selectCustomer =
    (
      id
    ) => {
      const customer =
        customers.find(
          (item) =>
            String(
              item.id
            ) ===
            String(id)
        );

      setForm(
        (old) => ({
          ...old,

          customer_id:
            id,

          customer_name:
            customer?.name ||
            "",

          address:
            customer?.address ||
            "",

          mobile:
            customer?.mobile ||
            "",

          gstin:
            customer?.gstin ||
            ""
        })
      );
    };

  /* ------------------------------------------------------------------------ */
  /* Lines                                                                    */
  /* ------------------------------------------------------------------------ */

  const updateLine =
    (
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

  const selectItem =
    (
      index,
      itemId
    ) => {
      const master =
        items.find(
          (item) =>
            String(
              item.id
            ) ===
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

  const addLine =
    () => {
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

  const removeLine =
    (
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

      so_date:
        form.so_date,

      expected_delivery_date:
        form.expected_delivery_date ||
        null,

      customer_id:
        form.customer_id
          ? Number(
              form.customer_id
            )
          : null,

      customer_name:
        form.customer_name
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

      customer_order_no:
        form.customer_order_no ||
        null,

      status:
        form.status,

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
      !form.customer_id &&
      !form.customer_name.trim()
    ) {
      toast.error(
        "Choose a customer"
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

    setBusy(
      true
    );

    try {
      if (editing) {
        await api.put(
          `/sales-orders/${editing.id}`,
          buildPayload()
        );

        toast.success(
          "Sales Order updated"
        );
      } else {
        await api.post(
          "/sales-orders",
          buildPayload()
        );

        toast.success(
          "Sales Order created"
        );
      }

      setOpen(
        false
      );

      await loadOrders();
    } catch (error) {
      toast.error(
        apiMessage(error)
      );
    } finally {
      setBusy(
        false
      );
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

      setBusy(
        true
      );

      try {
        await api.delete(
          `/sales-orders/${deleteOrder.id}`
        );

        toast.success(
          "Sales Order deleted"
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
        setBusy(
          false
        );
      }
    };

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales Planning"
        title="Sales Orders"
        description="Manage customer Sales Orders unit-wise before creating outward Delivery Challans."
        actions={
          canCreate
            ? (
                <PrimaryButton
                  icon={Plus}
                  onClick={
                    startCreate
                  }
                >
                  New Sales Order
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
          value={
            search
          }
          onChange={
            setSearch
          }
          placeholder="Search SO no, customer, reference..."
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
                "confirmed",

              label:
                "Confirmed"
            },

            {
              value:
                "completed",

              label:
                "Completed"
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
                label="Loading Sales Orders..."
              />
            )
          : (
              <TableShell>
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>
                        SO No
                      </th>

                      <th>
                        Unit
                      </th>

                      <th>
                        Customer
                      </th>

                      <th>
                        SO Date
                      </th>

                      <th>
                        Expected Delivery
                      </th>

                      <th>
                        Customer Ref
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
                                  row.so_no
                                }
                              </div>
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
                                  row.customer_name
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
                                  row.so_date
                                )
                              }
                            </td>

                            <td>
                              {
                                row.expected_delivery_date
                                  ? formatDate(
                                      row.expected_delivery_date
                                    )
                                  : "—"
                              }
                            </td>

                            <td>
                              {
                                row.customer_order_no ||
                                "—"
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
                                      title="Edit Sales Order"
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
                                      title="Delete Sales Order"
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
                            No Sales Orders found for the selected filters.
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
      {/* Sales Order Form                                                   */}
      {/* ------------------------------------------------------------------ */}

      <Modal
        open={
          open
        }
        onClose={() =>
          setOpen(false)
        }
        title={
          editing
            ? `Edit Sales Order · ${editing.so_no}`
            : "Create Sales Order"
        }
        description="Sales Order is a planning document. Stock moves only after an outward Delivery Challan is approved."
        size="max-w-7xl"
      >
        <form
          onSubmit={
            save
          }
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

            <Field label="SO Date">
              <Input
                required
                type="date"
                value={
                  form.so_date
                }
                onChange={
                  (event) =>
                    setForm(
                      (old) => ({
                        ...old,

                        so_date:
                          event.target.value
                      })
                    )
                }
              />
            </Field>

            <Field label="Expected Delivery">
              <Input
                type="date"
                value={
                  form.expected_delivery_date
                }
                onChange={
                  (event) =>
                    setForm(
                      (old) => ({
                        ...old,

                        expected_delivery_date:
                          event.target.value
                      })
                    )
                }
              />
            </Field>

            <Field label="Status">
              <Select
                value={
                  form.status
                }
                onChange={
                  (event) =>
                    setForm(
                      (old) => ({
                        ...old,

                        status:
                          event.target.value
                      })
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
                      "confirmed",

                    label:
                      "Confirmed"
                  },

                  {
                    value:
                      "completed",

                    label:
                      "Completed"
                  },

                  {
                    value:
                      "cancelled",

                    label:
                      "Cancelled"
                  }
                ]}
              />
            </Field>

            <Field label="Customer">
              <Select
                required
                value={
                  form.customer_id
                }
                onChange={
                  (event) =>
                    selectCustomer(
                      event.target.value
                    )
                }
                options={
                  customers.map(
                    (customer) => ({
                      value:
                        String(
                          customer.id
                        ),

                      label:
                        `${customer.name}${customer.gstin ? ` · ${customer.gstin}` : ""}`
                    })
                  )
                }
                placeholder="Choose Customer"
              />
            </Field>

            <Field label="Customer Order / Reference No">
              <Input
                value={
                  form.customer_order_no
                }
                onChange={
                  (event) =>
                    setForm(
                      (old) => ({
                        ...old,

                        customer_order_no:
                          event.target.value
                      })
                    )
                }
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

            <Field
              label="Address"
              className="md:col-span-2 xl:col-span-4"
            >
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
          {/* Items                                                          */}
          {/* -------------------------------------------------------------- */}

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">
                  Sales Order Items
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Rate, GST, HSN and stock profile are loaded from the Item master.
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
              disabled={
                busy
              }
            >
              {
                busy
                  ? "Saving..."
                  : editing
                    ? "Update Sales Order"
                    : "Create Sales Order"
              }
            </PrimaryButton>
          </div>
        </form>
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
        title="Delete Sales Order"
        description={
          `Delete ${deleteOrder?.so_no || "this Sales Order"}? All Sales Order item rows will also be permanently removed.`
        }
        confirmText="Delete Sales Order"
        danger
        busy={
          busy
        }
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