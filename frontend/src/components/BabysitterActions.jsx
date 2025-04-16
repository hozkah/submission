import React from "react";
import {
  FaTimes,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaUserFriends,
} from "react-icons/fa";

const BabysitterActions = ({ babysitter, onClose }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/70 transition-transform duration-500 z-40">
      <div className="flex items-center justify-center h-full">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex 
            items-center justify-center rounded-full border border-indigo-600
            focus:outline-none focus:border-[#4299e1] 
            cursor-pointer hover:animate-spin hover:scale-110"
          >
            <FaTimes className="text-gray-500" />
          </button>

          <h2 className="text-xl font-semibold mb-6 text-center">
            Babysitter Details
          </h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaUser className="text-indigo-500" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">
                  {babysitter.first_name} {babysitter.last_name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaPhone className="text-indigo-500" />
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{babysitter.phone}</p>
              </div>
            </div>

            {babysitter.email && (
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{babysitter.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <FaIdCard className="text-indigo-500" />
              <div>
                <p className="text-sm text-gray-500">National ID (NIN)</p>
                <p className="font-medium">{babysitter.nin}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaUserFriends className="text-indigo-500" />
              <div>
                <p className="text-sm text-gray-500">Next of Kin</p>
                <p className="font-medium">{babysitter.next_of_kin_name}</p>
                <p className="text-sm text-gray-500">
                  {babysitter.next_of_kin_phone}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-medium">{babysitter.age} years old</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabysitterActions;
