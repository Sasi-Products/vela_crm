import {
  Navigate,
  Route,
  Routes,
  useLocation
} from "react-router-dom";

import {
  Loader2
} from "lucide-react";

import AppShell from "./components/layout/AppShell";

import {
  useAuth
} from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

import UnitsPage from "./pages/units/UnitsPage";
import UsersPage from "./pages/users/UsersPage";

import PartiesPage from "./pages/parties/PartiesPage";
import ItemsPage from "./pages/items/ItemsPage";
import PriceListsPage from "./pages/prices/PriceListsPage";

import PurchaseOrdersPage from "./pages/purchase-orders/PurchaseOrdersPage";
import SalesOrdersPage from "./pages/sales-orders/SalesOrdersPage";

import DCListPage from "./pages/dc/DCListPage";
import DCFormPage from "./pages/dc/DCFormPage";
import DCDetailPage from "./pages/dc/DCDetailPage";

import PurchaseListPage from "./pages/purchases/PurchaseListPage";
import PurchaseFormPage from "./pages/purchases/PurchaseFormPage";
import PurchaseDetailPage from "./pages/purchases/PurchaseDetailPage";

import InvoicesPage from "./pages/invoices/InvoicesPage";

import StockSummaryPage from "./pages/stock/StockSummaryPage";
import StockLedgerPage from "./pages/stock/StockLedgerPage";

import AuditLogsPage from "./pages/audit/AuditLogsPage";
import ProfilePage from "./pages/profile/ProfilePage";

import ForbiddenPage from "./pages/ForbiddenPage";
import NotFoundPage from "./pages/NotFoundPage";
import MillDashboard from "./pages/mill/MillDashboard";
import MillMasters from "./pages/mill/MillMasters";
import MillRecipes from "./pages/mill/MillRecipes";
import MillLots from "./pages/mill/MillLots";
import MillRaw from "./pages/mill/MillRaw";
import MillStage from "./pages/mill/MillStage";
import MillPacking from "./pages/mill/MillPacking";
import MillWaste from "./pages/mill/MillWaste";
import MillDispatch from "./pages/mill/MillDispatch";
import MillTransfer from "./pages/mill/MillTransfer";
import MillRegister from "./pages/mill/MillRegister";
import MillReports from "./pages/mill/MillReports";

function HomeRoute() {
  const {
    hasPermission,
    isSuperAdmin
  } = useAuth();

  if (
    hasPermission(
      "dashboard.view"
    )
  ) {
    return (
      <DashboardPage />
    );
  }

  if (
    hasPermission(
      "purchase_orders.view"
    )
  ) {
    return (
      <Navigate
        to="/purchase-orders"
        replace
      />
    );
  }

  if (
    hasPermission(
      "sales_orders.view"
    )
  ) {
    return (
      <Navigate
        to="/sales-orders"
        replace
      />
    );
  }

  if (
    hasPermission(
      "dc.view"
    )
  ) {
    return (
      <Navigate
        to="/dc"
        replace
      />
    );
  }

  if (
    hasPermission(
      "purchase.view"
    )
  ) {
    return (
      <Navigate
        to="/purchases"
        replace
      />
    );
  }

  if (
    hasPermission(
      "invoices.view"
    )
  ) {
    return (
      <Navigate
        to="/invoices"
        replace
      />
    );
  }

  if (
    hasPermission(
      "parties.view"
    )
  ) {
    return (
      <Navigate
        to="/parties"
        replace
      />
    );
  }

  if (
    hasPermission(
      "items.view"
    )
  ) {
    return (
      <Navigate
        to="/items"
        replace
      />
    );
  }

  if (
    hasPermission(
      "prices.view"
    )
  ) {
    return (
      <Navigate
        to="/price-lists"
        replace
      />
    );
  }

  if (
    hasPermission(
      "stock.view"
    )
  ) {
    return (
      <Navigate
        to="/stock"
        replace
      />
    );
  }

  if (
    isSuperAdmin
  ) {
    return (
      <Navigate
        to="/units"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/profile"
      replace
    />
  );
}

function Protected({
  children,
  permission,
  superOnly = false
}) {
  const {
    user,
    loading,
    hasPermission,
    isSuperAdmin
  } = useAuth();

  const location =
    useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Loader2 className="animate-spin" />

          Loading Vela Admin...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from:
            location
        }}
        replace
      />
    );
  }

  if (
    superOnly &&
    !isSuperAdmin
  ) {
    return (
      <Navigate
        to="/forbidden"
        replace
      />
    );
  }

  if (
    permission &&
    !hasPermission(
      permission
    )
  ) {
    return (
      <Navigate
        to="/forbidden"
        replace
      />
    );
  }

  return children;
}

export default function App() {
  const {
    user
  } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user
            ? (
                <Navigate
                  to="/"
                  replace
                />
              )
            : (
                <LoginPage />
              )
        }
      />

      <Route
        path="/forbidden"
        element={
          <ForbiddenPage />
        }
      />

      <Route
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route
          index
          element={
            <HomeRoute />
          }
        />

        <Route path="mill" element={<Protected permission="mill.view"><MillDashboard/></Protected>}/>
        <Route path="mill/masters" element={<Protected permission="mill.view"><MillMasters/></Protected>}/>
        <Route path="mill/recipes" element={<Protected permission="mill.view"><MillRecipes/></Protected>}/>
        <Route path="mill/lots" element={<Protected permission="mill.view"><MillLots/></Protected>}/>
        <Route path="mill/raw" element={<Protected permission="mill.view"><MillRaw/></Protected>}/>
        <Route path="mill/mixing" element={<Protected permission="mill.view"><MillStage stage="mixing"/></Protected>}/>
        <Route path="mill/carding" element={<Protected permission="mill.view"><MillStage stage="carding"/></Protected>}/>
        <Route path="mill/drawing" element={<Protected permission="mill.view"><MillStage stage="drawing"/></Protected>}/>
        <Route path="mill/oe" element={<Protected permission="mill.view"><MillStage stage="oe"/></Protected>}/>
        <Route path="mill/packing" element={<Protected permission="mill.view"><MillPacking/></Protected>}/>
        <Route path="mill/waste" element={<Protected permission="mill.view"><MillWaste/></Protected>}/>
        <Route path="mill/dispatch" element={<Protected permission="mill.view"><MillDispatch/></Protected>}/>
        <Route path="mill/transfer" element={<Protected permission="mill.view"><MillTransfer/></Protected>}/>
        <Route path="mill/attendance" element={<Protected permission="mill.view"><MillRegister type="attendance"/></Protected>}/>
        <Route path="mill/energy" element={<Protected permission="mill.view"><MillRegister type="energy_readings"/></Protected>}/>
        <Route path="mill/quality" element={<Protected permission="mill.view"><MillRegister type="quality_checks"/></Protected>}/>
        <Route path="mill/costs" element={<Protected permission="mill.view"><MillRegister type="cost_entries"/></Protected>}/>
        <Route path="mill/downtime" element={<Protected permission="mill.view"><MillRegister type="downtimes"/></Protected>}/>
        <Route path="mill/reports" element={<Protected permission="mill.view"><MillReports/></Protected>}/>

        <Route
          path="units"
          element={
            <Protected
              superOnly
            >
              <UnitsPage />
            </Protected>
          }
        />

        <Route
          path="users"
          element={
            <Protected
              superOnly
            >
              <UsersPage />
            </Protected>
          }
        />

        <Route
          path="parties"
          element={
            <Protected
              permission="parties.view"
            >
              <PartiesPage />
            </Protected>
          }
        />

        <Route
          path="items"
          element={
            <Protected
              permission="items.view"
            >
              <ItemsPage />
            </Protected>
          }
        />

        <Route
          path="price-lists"
          element={
            <Protected
              permission="prices.view"
            >
              <PriceListsPage />
            </Protected>
          }
        />

        <Route
          path="purchase-orders"
          element={
            <Protected
              permission="purchase_orders.view"
            >
              <PurchaseOrdersPage />
            </Protected>
          }
        />

        <Route
          path="sales-orders"
          element={
            <Protected
              permission="sales_orders.view"
            >
              <SalesOrdersPage />
            </Protected>
          }
        />

        <Route
          path="dc"
          element={
            <Protected
              permission="dc.view"
            >
              <DCListPage />
            </Protected>
          }
        />

        <Route
          path="dc/new"
          element={
            <Protected
              permission="dc.create"
            >
              <DCFormPage />
            </Protected>
          }
        />

        <Route
          path="dc/:id/edit"
          element={
            <Protected
              permission="dc.edit"
            >
              <DCFormPage />
            </Protected>
          }
        />

        <Route
          path="dc/:id"
          element={
            <Protected
              permission="dc.view"
            >
              <DCDetailPage />
            </Protected>
          }
        />

        <Route
          path="purchases"
          element={
            <Protected
              permission="purchase.view"
            >
              <PurchaseListPage />
            </Protected>
          }
        />

        <Route
          path="purchases/new"
          element={
            <Protected
              permission="purchase.create"
            >
              <PurchaseFormPage />
            </Protected>
          }
        />

        <Route
          path="purchases/:id/edit"
          element={
            <Protected
              permission="purchase.edit"
            >
              <PurchaseFormPage />
            </Protected>
          }
        />

        <Route
          path="purchases/:id"
          element={
            <Protected
              permission="purchase.view"
            >
              <PurchaseDetailPage />
            </Protected>
          }
        />

        <Route
          path="invoices"
          element={
            <Protected
              permission="invoices.view"
            >
              <InvoicesPage />
            </Protected>
          }
        />

        <Route
          path="stock"
          element={
            <Protected
              permission="stock.view"
            >
              <StockSummaryPage />
            </Protected>
          }
        />

        <Route
          path="stock-ledger"
          element={
            <Protected
              permission="stock.view"
            >
              <StockLedgerPage />
            </Protected>
          }
        />

        <Route
          path="audit"
          element={
            <Protected
              superOnly
            >
              <AuditLogsPage />
            </Protected>
          }
        />

        <Route
          path="profile"
          element={
            <ProfilePage />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <NotFoundPage />
        }
      />
    </Routes>
  );
}