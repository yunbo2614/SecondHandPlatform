import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ItemDetail from "./ItemDetail";
import Items from "./Items";
import Login from "./Login";
import MyListings from "./MyListings";
import Sell from "./Sell";
import SignUp from "./SignUp";

function ProtectedRoute({ children }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Main({ handleLoggedIn, handleLogout }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const hasToken = !!token;

  return (
    <div className="main">
      <Routes>
        <Route
          path="/"
          element={
            hasToken ? (
              <Navigate to="/items" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={
            hasToken ? (
              <Navigate to="/items" replace />
            ) : (
              <Login handleLoggedIn={handleLoggedIn} />
            )
          }
        />

        <Route
          path="/signup"
          element={hasToken ? <Navigate to="/items" replace /> : <SignUp />}
        />

        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <Items />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mylistings"
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <Sell />
            </ProtectedRoute>
          }
        />

        <Route
          path="/item/:id"
          element={
            <ProtectedRoute>
              <ItemDetail handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            hasToken ? (
              <Navigate to="/items" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default Main;
