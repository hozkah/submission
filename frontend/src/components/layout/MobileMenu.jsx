import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MobileMenu = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const username = user?.username || user?.firstName;

  const baseNavigation = [
    {
      name: "Dashboard",
      href: `/${username}/dashboard`,
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "Children",
      href: `/${username}/children`,
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      name: "Finance",
      href: `/${username}/finance`,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  const managerNavigation = [
    {
      name: "Babysitters",
      href: `/${username}/babysitters`,
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
    {
      name: "Reports",
      href: `/${username}/reports`,
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
  ];

  const navigation =
    user?.role === "manager"
      ? [...baseNavigation, ...managerNavigation]
      : baseNavigation;

  return (
    <>
      {/* Overlay - only covers the menu area */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Mobile menu panel */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between px-4">
            <div className="text-xl font-bold text-white">Daycare</div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center px-2 py-2 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors duration-200"
                onClick={onClose}
              >
                <svg
                  className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-300 transition-colors duration-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
