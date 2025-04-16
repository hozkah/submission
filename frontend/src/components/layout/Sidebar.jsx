/**
 * Sidebar Component
 *
 * This component renders the left sidebar navigation of the application.
 * It displays a list of navigation items with icons and highlights
 * the currently active route. The sidebar is hidden on mobile devices
 * and becomes visible on medium and larger screens.
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  // Get current location for active route highlighting
  const location = useLocation();
  const { user } = useAuth();
  const username = user?.username || user?.firstName;

  // Base navigation items for all users
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

  // Additional navigation items for managers
  const managerNavigation = [
    {
      name: "Babysitters",
      href: `/${username}/babysitters`,
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    }
  ];

  // Combine navigation items based on user role
  const navigation =
    user?.role === "manager"
      ? [...baseNavigation, ...managerNavigation]
      : baseNavigation;

  return (
    // Sidebar container - hidden on mobile, visible on md and up
    <div className="hidden md:flex md:flex-shrink-0">
      {/* Fixed width sidebar */}
      <div className="flex flex-col w-64">
        {/* White background with border */}
        <div className="flex flex-col h-0 flex-1 bg-gray-900 border-r border-gray-800">
          {/* Scrollable content area */}
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Logo section */}
            {/* <div className="flex items-center flex-shrink-0 px-4">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="Daystar Daycare"
              />
            </div> */}
            {/* Navigation links */}
            <nav className="mt-5 flex-1 px-2 bg-gray-900 space-y-1">
              {/* Map through navigation items */}
              {navigation.map((item) => {
                // Check if current route matches this item
                const isActive = location.pathname.includes(
                  item.href.replace(`/${username}`, "")
                );
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? "bg-gray-800 text-white border-l-4 border-indigo-500"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                  >
                    {/* Navigation item icon */}
                    <svg
                      className={`${
                        isActive
                          ? "text-indigo-500"
                          : "text-gray-400 group-hover:text-gray-300"
                      } mr-3 flex-shrink-0 h-6 w-6`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={item.icon}
                      />
                    </svg>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
