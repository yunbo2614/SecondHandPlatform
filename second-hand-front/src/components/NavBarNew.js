import React, { useMemo, useState } from "react";
import { Layout, Menu, Button, Drawer, Typography, Space } from "antd";
import {
  BarsOutlined,
  AppstoreOutlined,
  PlusOutlined,
  LogoutOutlined,
  MenuOutlined,
  WindowsFilled,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/NavBarNew.css";

const { Header } = Layout;
const { Text } = Typography;
const AUTH_ROUTES = ["/login", "/register"]; //fixed display bug

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith("/mylistings")) return "mylistings";
    if (location.pathname.startsWith("/upload")) return "upload";
    return "home";
  }, [location.pathname]);

  const onLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.reload();
  };

  const menuItems = [
    {
      key: "home",
      icon: <AppstoreOutlined />,
      label: "Market",
      onClick: () => navigate("/login"),
    },
    {
      key: "mylistings",
      icon: <BarsOutlined />,
      label: "My Listings",
      onClick: () => navigate("/mylistings"),
    },
  ];

  return (
    <>
      <Header className="navbar">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <div className="brand-logo">UF</div>
          <div className="brand-text">
            <Text className="brand-title">Second Hand Platform</Text>
            <Text className="brand-subtitle">University of Fantasy</Text>
          </div>
        </div>

        {!isAuthPage && (
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={menuItems}
            className="navbar-menu"
          />
        )}

        {!isAuthPage && (
          <div className="navbar-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="post-btn"
              onClick={() => navigate("/upload")}
            >
              Post
            </Button>

            <Button
              icon={<LogoutOutlined />}
              className="logout-btn"
              onClick={onLogout}
            >
              Log Out
            </Button>
          </div>
        )}

        {!isAuthPage && (
          <Button
            className="mobile-menu-btn"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
          />
        )}
      </Header>

      {!isAuthPage && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="right"
          width={320}
          title={
            <Space>
              <div className="brand-logo small">S</div>
              <span className="drawer-title">Second Hand Platform</span>
            </Space>
          }
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            className="drawer-menu"
            items={[
              ...menuItems.map((item) => ({
                ...item,
                onClick: () => {
                  setDrawerOpen(false);
                  item.onClick();
                },
              })),
              { type: "divider" },
              {
                key: "upload",
                icon: <PlusOutlined />,
                label: "Post",
                onClick: () => {
                  setDrawerOpen(false);
                  navigate("/upload");
                },
              },
              {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Log Out",
                onClick: () => {
                  setDrawerOpen(false);
                  onLogout();
                },
              },
            ]}
          />
        </Drawer>
      )}
    </>
  );
}

export default NavBar;
