import React, { useEffect, useState } from "react";
import UserForm from "./UserForm";
import { getUserById, updateUser } from "../../services/userService";
import { useParams, useNavigate } from "react-router-dom";

const EditUserPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<any>(null);

  useEffect(() => {
    getUserById(id!)
      .then((res) => {
        const user = res.data;

        // ⭐ Ensure the data matches UserForm fields
        setInitial({
          firstname: user.firstname || "",
          lastname: user.lastname || "",
          username: user.username || "",
          email: user.email || "",
          role: user.role || "viewer",
          clientGroupId: user.clientGroupId || ""
        });
      })
      .catch(() => alert("Failed to load user"));
  }, [id]);

  const handleSubmit = (data: any) => {
    updateUser(id!, data)
      .then(() => navigate("/users"))
      .catch(() => alert("Failed to update user"));
  };

  if (!initial) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-[#0989B1] border-b-4 border-[#549E39] pb-2 mb-6">
        Edit User
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E2E8F0]">
        <UserForm onSubmit={handleSubmit} initialData={initial} />
      </div>
    </div>
  );
};


export default EditUserPage;