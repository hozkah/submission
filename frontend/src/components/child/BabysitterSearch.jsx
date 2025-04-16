import React, { useState, useEffect } from "react";
import axios from "axios";

const BabysitterSearch = ({ onSelect, currentBabysitterId }) => {
  const [babysitters, setBabysitters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBabysitters();
  }, []);

  const fetchBabysitters = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/babysitters",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBabysitters(response.data);
    } catch (error) {
      console.error("Error fetching babysitters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBabysitters = babysitters.filter(
    (babysitter) =>
      babysitter.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      babysitter.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Search babysitters..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
      />
      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
        {isLoading ? (
          <div className="p-2 text-center text-gray-500">Loading...</div>
        ) : filteredBabysitters.length === 0 ? (
          <div className="p-2 text-center text-gray-500">
            No babysitters found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredBabysitters.map((babysitter) => (
              <li
                key={babysitter.id}
                className={`p-2 hover:bg-gray-50 cursor-pointer ${
                  currentBabysitterId === babysitter.id ? "bg-indigo-50" : ""
                }`}
                onClick={() => onSelect(babysitter)}
              >
                <div className="flex items-center justify-between">
                  <span>
                    {babysitter.first_name} {babysitter.last_name}
                  </span>
                  {currentBabysitterId === babysitter.id && (
                    <span className="text-sm text-indigo-600">Current</span>
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

export default BabysitterSearch;
