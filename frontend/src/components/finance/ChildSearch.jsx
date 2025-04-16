import React, { useState, useEffect } from "react";
import axios from "axios";

const ChildSearch = ({ onSelect, currentChildId }) => {
  const [children, setChildren] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5000/api/children", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setChildren(response.data);
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChildren = children.filter((child) =>
    child.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Search children..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
      />
      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
        {isLoading ? (
          <div className="p-2 text-center text-gray-500">Loading...</div>
        ) : filteredChildren.length === 0 ? (
          <div className="p-2 text-center text-gray-500">No children found</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredChildren.map((child) => (
              <li
                key={child.id}
                className={`p-2 hover:bg-gray-50 cursor-pointer ${
                  currentChildId === child.id ? "bg-indigo-50" : ""
                }`}
                onClick={() => onSelect(child)}
              >
                <div className="flex items-center justify-between">
                  <span>{child.full_name}</span>
                  {currentChildId === child.id && (
                    <span className="text-sm text-indigo-600">Selected</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChildSearch;
