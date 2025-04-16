/**
 * Navbar Component
 *
 * This component renders the top navigation bar of the application.
 * It includes the application logo, main navigation links,
 * and user-related actions (notifications and profile).
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const username = user?.username || user?.firstName;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Base navigation items for all users
  const baseNavigation = [
    { name: "Dashboard", href: `/${username}/dashboard` },
    { name: "Children", href: `/${username}/children` },
    { name: "Finance", href: `/${username}/finance` },
  ];

  // Additional navigation items for managers
  const managerNavigation = [
    { name: "Babysitters", href: `/${username}/babysitters` },
    { name: "Reports", href: `/${username}/reports` },
  ];

  // Combine navigation items based on user role
  const navigation =
    user?.role === "manager"
      ? [...baseNavigation, ...managerNavigation]
      : baseNavigation;

  return (
    // Navigation bar with white background and shadow
    <nav className="bg-white shadow-lg">
      {/* Container with max width and padding */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Flex container for logo and navigation items */}
        <div className="flex justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold text-purple-600">
                Daystar Daycare
              </Link>
            </div>
          </div>

          {/* Right side - Navigation links and user menu */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 focus:outline-none transition duration-150 ease-in-out"
              >
                <span className="sr-only">Open main menu</span>
                <div className="w-6 h-6 relative flex items-center justify-center">
                  <span
                    className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                      isMenuOpen
                        ? "rotate-45 translate-y-0"
                        : "-translate-y-1.5"
                    }`}
                  ></span>
                  <span
                    className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                      isMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                  ></span>
                  <span
                    className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                      isMenuOpen
                        ? "-rotate-45 translate-y-0"
                        : "translate-y-1.5"
                    }`}
                  ></span>
                </div>
              </button>
            </div>

            {/* Mobile menu */}
            <div
              className={`md:hidden absolute top-16 right-0 w-48 bg-white shadow-lg rounded-md py-1 transform transition-all duration-300 ease-in-out ${
                isMenuOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors duration-200 hover:translate-x-1"
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors duration-200 hover:translate-x-1"
              >
                Logout
              </button>
            </div>

            {/* Desktop profile section */}
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications button - hidden on mobile */}
              <button className="hidden md:block p-1 rounded-full text-gray-600 hover:text-purple-600 focus:outline-none transition-colors duration-200">
                <span className="sr-only">View notifications</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              {/* User profile button */}
              <div className="ml-3 relative">
                <div>
                  <button className="max-w-xs bg-purple-600 rounded-full flex items-center text-sm focus:outline-none transition-transform duration-200 hover:scale-105">
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=6b46c1&color=fff`}
                      alt={user?.firstName}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
