import React from "react";
import UserForm from "./UserForm";
import { createUser } from "../../services/userService";
import { useNavigate } from "react-router-dom";

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    createUser(data)
      .then(() => navigate("/users"))
      .catch(() => alert("Failed to create user"));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-[#0989B1] border-b-4 border-[#549E39] pb-2 mb-6">Add User</h2>
      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E2E8F0]">
        <UserForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateUserPage;