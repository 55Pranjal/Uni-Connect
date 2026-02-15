import React from "react";
import { useNavigate } from "react-router-dom";

const CommunityPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button onClick={() => navigate("/create-community")}>
        Create Community
      </button>
    </div>
  );
};

export default CommunityPage;
