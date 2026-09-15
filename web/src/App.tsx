import { Route, Routes } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";
import { BackofficeLayout } from "./components/BackofficeLayout";
import { RequireAuth } from "./components/RequireAuth";
import { ClientesPage } from "./pages/ClientesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EditarClientePage } from "./pages/EditarClientePage";
import { EditarProductoPage } from "./pages/EditarProductoPage";
import { EditarUsuarioPage } from "./pages/EditarUsuarioPage";
import { LoginPage } from "./pages/LoginPage";
import { NuevoClientePage } from "./pages/NuevoClientePage";
import { NuevoProductoPage } from "./pages/NuevoProductoPage";
import { NuevoUsuarioPage } from "./pages/NuevoUsuarioPage";
import { ProductosPage } from "./pages/ProductosPage";
import { UsuariosPage } from "./pages/UsuariosPage";

export function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route
        element={
          <RequireAuth>
            <BackofficeLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/usuarios/nuevo" element={<NuevoUsuarioPage />} />
        <Route path="/usuarios/:id" element={<EditarUsuarioPage />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/productos/nuevo" element={<NuevoProductoPage />} />
        <Route path="/productos/:id" element={<EditarProductoPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/clientes/nuevo" element={<NuevoClientePage />} />
        <Route path="/clientes/:id" element={<EditarClientePage />} />
      </Route>
    </Routes>
  );
}
