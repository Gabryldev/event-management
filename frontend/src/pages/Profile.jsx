import { toast } from "react-toastify";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  FaCamera,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const DEFAULT_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileImage, setProfileImage] = useState(
    user?.profileImage || DEFAULT_IMAGE
  );
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Limit image size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] py-10 md:py-14">

      <div className="max-w-5xl mx-auto px-5">

        {/* BACK */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-amber-600 transition mb-8"
        >
          <FaArrowLeft />
          Back to Events
        </Link>

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[4px] font-semibold text-amber-600 mb-2">
            Account Settings
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Your Profile
          </h1>

          <p className="text-slate-500 mt-3 max-w-xl">
            Manage your personal information and profile appearance.
            Keep your details up to date for a better event experience.
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">

          {/* CARD TOP */}
          <div className="bg-[#111827] px-6 md:px-10 py-7">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              <div>
                <p className="text-white font-semibold text-lg">
                  Personal Information
                </p>

                <p className="text-white/50 text-sm mt-1">
                  Update the information connected to your account.
                </p>
              </div>

              <div className="px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                {user?.role || "Member"}
              </div>

            </div>

          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>

            <div className="p-6 md:p-10">

              {/* PROFILE IMAGE */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 pb-10 border-b border-slate-100">

                <div className="relative w-fit">

                  <img
                    src={profileImage}
                    alt="Profile"
                    className="
                      w-32
                      h-32
                      md:w-36
                      md:h-36
                      rounded-full
                      object-cover
                      border-4
                      border-white
                      shadow-xl
                      ring-4
                      ring-amber-400/30
                    "
                  />

                  {/* CAMERA BUTTON */}
                  <label
                    htmlFor="profile-upload"
                    className="
                      absolute
                      bottom-1
                      right-1
                      w-11
                      h-11
                      rounded-full
                      bg-amber-400
                      text-slate-900
                      flex
                      items-center
                      justify-center
                      cursor-pointer
                      shadow-lg
                      border-4
                      border-white
                      hover:bg-amber-300
                      hover:scale-105
                      transition
                    "
                    title="Change profile picture"
                  >
                    <FaCamera />
                  </label>

                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                  />

                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Profile Picture
                  </h2>

                  <p className="text-sm text-slate-500 mt-1 max-w-md">
                    Choose a clear profile picture. This image will appear
                    beside your name throughout Event Alchemists.
                  </p>

                  <label
                    htmlFor="profile-upload"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      mt-4
                      px-4
                      py-2.5
                      rounded-xl
                      border
                      border-slate-200
                      text-slate-700
                      text-sm
                      font-semibold
                      cursor-pointer
                      hover:border-amber-400
                      hover:text-amber-600
                      transition
                    "
                  >
                    <FaCamera />
                    Change Photo
                  </label>

                  <p className="text-xs text-slate-400 mt-2">
                    JPG, PNG or WEBP · Max 5MB
                  </p>

                </div>

              </div>

              {/* FIELDS */}
              <div className="grid md:grid-cols-2 gap-6 mt-10">

                {/* NAME */}
                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>

                  <div className="relative">

                    <FaUser
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="
                        w-full
                        pl-11
                        pr-4
                        py-3.5
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        text-slate-900
                        outline-none
                        transition
                        focus:bg-white
                        focus:border-amber-400
                        focus:ring-4
                        focus:ring-amber-400/10
                      "
                    />

                  </div>

                </div>

                {/* PHONE */}
                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number
                  </label>

                  <div className="relative">

                    <FaPhone
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="
                        w-full
                        pl-11
                        pr-4
                        py-3.5
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        text-slate-900
                        outline-none
                        transition
                        focus:bg-white
                        focus:border-amber-400
                        focus:ring-4
                        focus:ring-amber-400/10
                      "
                    />

                  </div>

                </div>

                {/* EMAIL */}
                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>

                  <div className="relative">

                    <FaEnvelope
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="
                        w-full
                        pl-11
                        pr-4
                        py-3.5
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-100
                        text-slate-400
                        cursor-not-allowed
                      "
                    />

                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    Your email address is connected to your account and
                    cannot be changed here.
                  </p>

                </div>

              </div>

            </div>

            {/* FOOTER */}
            <div className="px-6 md:px-10 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">

              <p className="text-xs text-slate-400 text-center sm:text-left">
                Your profile information is securely saved to your account.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  sm:w-auto
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-7
                  py-3.5
                  rounded-xl
                  bg-amber-400
                  text-slate-900
                  font-bold
                  shadow-lg
                  hover:bg-amber-300
                  hover:-translate-y-0.5
                  active:translate-y-0
                  transition
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  disabled:hover:translate-y-0
                "
              >
                <FaSave />

                {loading ? "Saving Changes..." : "Save Changes"}
              </button>

            </div>

          </form>

        </div>

        {/* BOTTOM INFO */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6">

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-amber-500 text-xl mb-2">✦</p>
            <p className="font-semibold text-slate-800">
              Personalized
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Keep your profile information current.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-amber-500 text-xl mb-2">◈</p>
            <p className="font-semibold text-slate-800">
              Event Ready
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Your details are ready when booking events.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-amber-500 text-xl mb-2">✓</p>
            <p className="font-semibold text-slate-800">
              Secure Account
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Your account information stays protected.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;