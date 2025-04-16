import React from "react";

const BabysitterSection = ({ child }) => {
  return (
    <div className="pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Assigned Babysitter</p>
          <p className="font-medium">
            {child.babysitter_name || "No babysitter assigned"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BabysitterSection;
