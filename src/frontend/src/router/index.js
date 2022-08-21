import React from "react";
import {
    BrowserRouter,
    Routes,
    Route
  } from "react-router-dom";

import DashboardPage from '../pages/DashboardPage';
import WalletDetailPage from '../pages/WalletDetailPage';
import BasePage from "../components/shared/BasePage";
import StockDetailPage from "../pages/StockDetailPage";

function MyRouter({children}) {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<BasePage><DashboardPage /></BasePage>} />
                <Route path="/dashboard" element={<BasePage><DashboardPage /></BasePage>} />
                <Route path="/stock" element={<BasePage><StockDetailPage /></BasePage>} />
                <Route path="/wallets/:kind/:wallet" element={<BasePage><WalletDetailPage /></BasePage>} />
            </Routes>
            {children}
        </BrowserRouter>
    );
}

export default MyRouter;