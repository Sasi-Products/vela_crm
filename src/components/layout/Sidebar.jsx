import {
  Boxes,
  Building2,
  ClipboardList,
  Gauge,
  History,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  Tags,
  Truck,
  UserCog,
  UsersRound,
  Warehouse,
  X
} from "lucide-react";

import {
  NavLink
} from "react-router-dom";

import {
  useAuth
} from "../../context/AuthContext";

const sections = [
  {
    label: "Overview",

    items: [
      {
        to: "/",
        label: "Dashboard",
        icon: Gauge,
        permission:
          "dashboard.view",
        end: true
      }
    ]
  },

  {
    label: "Operations",

    items: [
      {
        to:
          "/purchase-orders",

        label:
          "Purchase Orders",

        icon:
          ShoppingCart,

        permission:
          "purchase_orders.view"
      },

      {
        to:
          "/sales-orders",

        label:
          "Sales Orders",

        icon:
          ShoppingBag,

        permission:
          "sales_orders.view"
      },

      {
        to: "/dc",

        label:
          "Outward DC",

        icon:
          Truck,

        permission:
          "dc.view"
      },

      {
        to:
          "/purchases",

        label:
          "Purchase DC / Inward",

        icon:
          ClipboardList,

        permission:
          "purchase.view"
      },

      {
        to:
          "/invoices",

        label:
          "Tally Invoices",

        icon:
          ReceiptText,

        permission:
          "invoices.view"
      }
    ]
  },

  {
    label: "Spinning Mill Production",
    items: [
      { to: "/mill", label: "Production Dashboard", icon: Gauge, permission: "mill.view", end: true },
      { to: "/mill/masters", label: "Factory & Machine Masters", icon: Building2, permission: "mill.view" },
      { to: "/mill/recipes", label: "Mixing Recipes", icon: ClipboardList, permission: "mill.view" },
      { to: "/mill/lots", label: "Production Planning", icon: ShoppingBag, permission: "mill.view" },
      { to: "/mill/raw", label: "Raw Material Lots", icon: Boxes, permission: "mill.view" },
      { to: "/mill/mixing", label: "Mixing", icon: PackageCheck, permission: "mill.view" },
      { to: "/mill/carding", label: "Carding", icon: PackageCheck, permission: "mill.view" },
      { to: "/mill/drawing", label: "Drawing", icon: PackageCheck, permission: "mill.view" },
      { to: "/mill/oe", label: "OE Spinning", icon: Gauge, permission: "mill.view" },
      { to: "/mill/waste", label: "Waste Recovery", icon: Boxes, permission: "mill.view" },
      { to: "/mill/packing", label: "Yarn Packing", icon: PackageCheck, permission: "mill.view" },
      { to: "/mill/dispatch", label: "Bag Dispatch", icon: Truck, permission: "mill.view" },
      { to: "/mill/transfer", label: "Inter-Unit Transfer", icon: Warehouse, permission: "mill.view" },
      { to: "/mill/attendance", label: "Labour & Wages", icon: UsersRound, permission: "mill.view" },
      { to: "/mill/energy", label: "Electricity", icon: Gauge, permission: "mill.view" },
      { to: "/mill/quality", label: "Yarn Quality", icon: PackageCheck, permission: "mill.view" },
      { to: "/mill/costs", label: "Production Costs", icon: ReceiptText, permission: "mill.view" },
      { to: "/mill/downtime", label: "Machine Downtime", icon: History, permission: "mill.view" },
      { to: "/mill/reports", label: "Production Reports", icon: ClipboardList, permission: "mill.view" }
    ]
  },

  {
    label: "Masters",

    items: [
      {
        to:
          "/parties",

        label:
          "Parties",

        icon:
          UsersRound,

        permission:
          "parties.view"
      },

      {
        to:
          "/items",

        label:
          "Items",

        icon:
          Boxes,

        permission:
          "items.view"
      },

      {
        to:
          "/price-lists",

        label:
          "Price Lists",

        icon:
          Tags,

        permission:
          "prices.view"
      }
    ]
  },

  {
    label: "Inventory",

    items: [
      {
        to:
          "/stock",

        label:
          "Stock Summary",

        icon:
          Warehouse,

        permission:
          "stock.view"
      },

      {
        to:
          "/stock-ledger",

        label:
          "Stock Ledger",

        icon:
          PackageCheck,

        permission:
          "stock.view"
      }
    ]
  },

  {
    label:
      "Administration",

    superOnly:
      true,

    items: [
      {
        to:
          "/units",

        label:
          "Units",

        icon:
          Building2,

        superOnly:
          true
      },

      {
        to:
          "/users",

        label:
          "Users & Permissions",

        icon:
          UserCog,

        superOnly:
          true
      },

      {
        to:
          "/audit",

        label:
          "Audit Logs",

        icon:
          History,

        superOnly:
          true
      }
    ]
  }
];

export default function Sidebar({
  open,
  onClose
}) {
  const {
    user,
    hasPermission,
    isSuperAdmin
  } = useAuth();

  return (
    <>
      {
        open &&
        (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            onClick={
              onClose
            }
          />
        )
      }

      <aside
        className={
          `fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0 ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }`
        }
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black text-slate-950 shadow-lg">
            VS
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">
              Vela Spinners
            </div>

            <div className="mt-0.5 truncate text-xs text-slate-400">
              Operations Admin
            </div>
          </div>

          <button
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {
            sections.map(
              (section) => {
                if (
                  section.superOnly &&
                  !isSuperAdmin
                ) {
                  return null;
                }

                const items =
                  section.items.filter(
                    (item) =>
                      isSuperAdmin ||
                      (
                        !item.superOnly &&
                        (
                          !item.permission ||
                          hasPermission(
                            item.permission
                          )
                        )
                      )
                  );

                if (
                  !items.length
                ) {
                  return null;
                }

                return (
                  <div
                    key={
                      section.label
                    }
                    className="mb-6"
                  >
                    <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      {
                        section.label
                      }
                    </div>

                    <div className="space-y-1">
                      {
                        items.map(
                          ({
                            to,
                            label,
                            icon: Icon,
                            end
                          }) => (
                            <NavLink
                              key={to}
                              to={to}
                              end={end}
                              onClick={
                                onClose
                              }
                              className={
                                ({
                                  isActive
                                }) =>
                                  `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${
                                    isActive
                                      ? "bg-white text-slate-950 shadow-lg"
                                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                                  }`
                              }
                            >
                              <Icon
                                size={18}
                              />

                              <span className="truncate">
                                {label}
                              </span>
                            </NavLink>
                          )
                        )
                      }
                    </div>
                  </div>
                );
              }
            )
          }
        </nav>

        <div className="border-t border-white/10 p-4">
          <NavLink
            to="/profile"
            onClick={
              onClose
            }
            className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 transition hover:bg-white/10"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500 font-bold">
              {
                user?.name
                  ?.slice(
                    0,
                    1
                  )
                  ?.toUpperCase() ||
                "U"
              }
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {
                  user?.name
                }
              </div>

              <div className="truncate text-xs capitalize text-slate-400">
                {
                  String(
                    user?.role ||
                    ""
                  ).replace(
                    "_",
                    " "
                  )
                }

                {
                  user?.unit
                    ?.unit_code
                    ? ` · ${user.unit.unit_code}`
                    : ""
                }
              </div>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
}