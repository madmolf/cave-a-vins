import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import AgeGate from "./components/AgeGate";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
import Login from "./pages/Login";
import Cave from "./pages/Cave";
import SearchResults from "./pages/SearchResults";
import WineDetail from "./pages/WineDetail";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import AddWine from "./pages/admin/AddWine";
import AddKeyword from "./pages/admin/AddKeyword";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AgeGate />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cave" element={<Cave />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/wine/:id" element={<WineDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin/wine" element={<AddWine />} />
            <Route path="/admin/keyword" element={<AddKeyword />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
