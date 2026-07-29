import { toast } from "react-toastify";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const DEFAULT_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileImage, setProfileImage] = useState(
    user?.profileImage || DEFAULT_IMAGE
  );

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.patch("/auth/profile", {
        name,
        phone,
        profileImage,
      });

      setUser(res.data.data);

      toast.success("Profile updated successfully!");
    } catch (err) {
  console.error(err);

  toast.error(
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    "Profile update failed."
  );
}
  };

  return (
    <div className="max-w-3xl mx-auto py-12">

      <h1 className="text-4xl font-bold mb-8">
        Edit Profile
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-8 space-y-6"
      >

        <div className="flex flex-col items-center">

          <img
            src={profileImage}
            alt=""
            className="w-36 h-36 rounded-full object-cover border-4 border-blue-500"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="mt-4"
          />

        </div>

        <div>

          <label>Name</label>

          <input
            className="w-full border rounded p-3 mt-2"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

        </div>

        <div>

          <label>Phone</label>

          <input
            className="w-full border rounded p-3 mt-2"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
          />

        </div>

        <button
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>

      </form>

    </div>
  );
};

export default Profile;