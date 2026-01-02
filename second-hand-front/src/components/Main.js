import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ItemDetail from "./ItemDetail";
import Items from "./Items";
import Login from "./Login";
import MyListings from "./MyListings";
import Sell from "./Sell";
import SignUp from "./SignUp";

function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Main({ isLoggedIn, handleLoggedIn, handleLogout }) {
  return (
    <div className="main">
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/items" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 登录页面 */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/items" replace />
            ) : (
              <Login handleLoggedIn={handleLoggedIn} />
            )
          }
        />

        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/items" replace /> : <SignUp />}
        />

        <Route
          path="/items"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Items />
            </ProtectedRoute>
          }
        />

        {/* 我的发布 */}
        <Route
          path="/mylistings"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <MyListings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sell"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Sell />
            </ProtectedRoute>
          }
        />

        <Route
          path="/item/:id"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <ItemDetail handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default Main;
