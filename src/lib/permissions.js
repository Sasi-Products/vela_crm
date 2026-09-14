export const LOCAL_PERMISSION_CATALOG = [
  {
    group: "Dashboard",
    permissions: [
      {
        key: "dashboard.view",
        label: "View dashboard"
      }
    ]
  },

  {
    group: "Parties",
    permissions: [
      {
        key: "parties.view",
        label: "View parties"
      },
      {
        key: "parties.create",
        label: "Create parties"
      },
      {
        key: "parties.edit",
        label: "Edit parties"
      }
    ]
  },

  {
    group: "Items",
    permissions: [
      {
        key: "items.view",
        label: "View items"
      },
      {
        key: "items.create",
        label: "Create items"
      },
      {
        key: "items.edit",
        label: "Edit items"
      },
      {
        key: "items.delete",
        label: "Delete items"
      }
    ]
  },

  {
    group: "Price Lists",
    permissions: [
      {
        key: "prices.view",
        label: "View price lists"
      },
      {
        key: "prices.create",
        label: "Create price lists"
      },
      {
        key: "prices.edit",
        label: "Edit price lists"
      },
      {
        key: "prices.delete",
        label: "Delete price lists"
      }
    ]
  },

  {
    group: "Purchase Orders",
    permissions: [
      {
        key: "purchase_orders.view",
        label: "View Purchase Orders"
      },
      {
        key: "purchase_orders.create",
        label: "Create Purchase Orders"
      },
      {
        key: "purchase_orders.edit",
        label: "Edit Purchase Orders"
      },
      {
        key: "purchase_orders.receive",
        label: "Update Purchase Order received date"
      },
      {
        key: "purchase_orders.delete",
        label: "Delete Purchase Orders"
      }
    ]
  },

  {
    group: "Sales Orders",
    permissions: [
      {
        key: "sales_orders.view",
        label: "View Sales Orders"
      },
      {
        key: "sales_orders.create",
        label: "Create Sales Orders"
      },
      {
        key: "sales_orders.edit",
        label: "Edit Sales Orders"
      },
      {
        key: "sales_orders.delete",
        label: "Delete Sales Orders"
      }
    ]
  },

  {
    group: "Outward DC",
    permissions: [
      {
        key: "dc.view",
        label: "View outward DC"
      },
      {
        key: "dc.create",
        label: "Create outward DC"
      },
      {
        key: "dc.edit",
        label: "Edit / resubmit outward DC"
      },
      {
        key: "dc.print",
        label: "Print outward DC"
      }
    ]
  },

  {
    group: "Purchase DC / Inward",
    permissions: [
      {
        key: "purchase.view",
        label: "View purchase DC"
      },
      {
        key: "purchase.create",
        label: "Create purchase DC"
      },
      {
        key: "purchase.edit",
        label: "Edit / resubmit purchase DC"
      },
      {
        key: "purchase.upload_invoice",
        label: "Upload supplier invoice"
      },
      {
        key: "purchase.print",
        label: "Print purchase DC"
      }
    ]
  },

  {
    group: "Tally Invoices",
    permissions: [
      {
        key: "invoices.view",
        label: "View Tally invoices"
      },
      {
        key: "invoices.print",
        label: "Open / print Tally invoice PDF"
      }
    ]
  },

  {
    group: "Stock",
    permissions: [
      {
        key: "stock.view",
        label: "View stock summary and ledger"
      }
    ]
  }
];

export const normalizePermissions = (
  value
) => {
  if (
    Array.isArray(value)
  ) {
    return [
      ...new Set(value)
    ];
  }

  if (
    typeof value ===
    "string"
  ) {
    try {
      return normalizePermissions(
        JSON.parse(value)
      );
    } catch {
      return value
        .split(",")
        .map(
          (x) =>
            x.trim()
        )
        .filter(Boolean);
    }
  }

  return [];
};

export const hasPermission = (
  user,
  permission
) => {
  if (!user) {
    return false;
  }

  if (
    user.role ===
    "super_admin"
  ) {
    return true;
  }

  /*
   * IMPORTANT:
   * Admin and Employee get ONLY permissions
   * assigned by Super Admin.
   */
  const permissions =
    normalizePermissions(
      user.permissions
    );

  if (
    permissions.includes("*")
  ) {
    return true;
  }

  if (
    permissions.includes(
      permission
    )
  ) {
    return true;
  }

  const moduleName =
    permission.split(".")[0];

  return permissions.includes(
    `${moduleName}.*`
  );
};