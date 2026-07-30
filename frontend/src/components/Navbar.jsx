import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaBell,
  FaCalendarAlt,
  FaTicketAlt,
  FaPlusCircle,
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };


  return (
    <header className="bg-ink text-paper sticky top-0 z-50 shadow-lg">


      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">


        {/* Brand */}
<Link
  to="/"
  className="flex items-center gap-3 group font-display"
>
  <div
    className="
      w-10
      h-10
      rounded-xl
      bg-amber
      flex
      items-center
      justify-center
      shadow-lg
      group-hover:rotate-6
      transition
    "
  >
    <span className="text-ink text-xl font-bold">
      ✦
    </span>
  </div>

  <div className="leading-tight">
    <h1 className="text-lg font-bold tracking-wide text-paper">
      Event
      <span className="text-amber">
        Alchemists
      </span>
    </h1>

    <p className="text-[10px] uppercase tracking-[3px] text-paper/60">
      Premium Experiences
    </p>
  </div>
</Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 text-sm">


          <Link
            to="/"
            className="flex items-center gap-2 hover:text-amber transition"
          >
            <FaCalendarAlt />
            Events
          </Link>



          {user && (
            <Link
              to="/my-tickets"
              className="flex items-center gap-2 hover:text-amber transition"
            >
              <FaTicketAlt />
              My Tickets
            </Link>
          )}



          {user &&
            (user.role === "organizer" ||
              user.role === "admin") && (
              <>

                <Link
                  to="/organizer/events"
                  className="hover:text-amber"
                >
                  My Events
                </Link>


                <Link
                  to="/organizer/create"
                  className="flex items-center gap-2 hover:text-amber"
                >
                  <FaPlusCircle />
                  Create Event
                </Link>


                <Link
                  to="/organizer/check-in"
                  className="hover:text-amber"
                >
                  Check-In
                </Link>

              </>
            )}



          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="hover:text-amber"
            >
              Admin
            </Link>
          )}



          {/* Notification */}
          {user && (
            <button className="relative text-xl hover:text-amber">

              <FaBell />

              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4">
                2
              </span>

            </button>
          )}




          {user ? (

            <div className="flex items-center gap-3 border-l border-paper/20 pl-4">


              <Link
                to="/profile"
                className="flex items-center gap-2 hover:text-amber"
              >

                <img
                  src={user.profileImage}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />


                <span>
                  {user.name}
                </span>

              </Link>



              <button
                onClick={handleLogout}
                className="btn-outline !border-paper/30 !text-paper"
              >
                Logout
              </button>


            </div>


          ) : (

            <div className="flex gap-3 border-l border-paper/20 pl-4">


              <Link
                to="/login"
                className="hover:text-amber"
              >
                Login
              </Link>


              <Link
                to="/register"
                className="btn-amber"
              >
                Join
              </Link>


            </div>

          )}


        </nav>





        {/* Hamburger */}
        <button
          className="md:hidden text-2xl text-amber hover:text-white transition"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>


      </div>





      {/* Mobile Menu */}

      {open && (

        <div className="md:hidden bg-black px-5 py-6 border-t border-white/10">


          {/* Mobile Profile */}
          {user && (

            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 mb-6"
            >

              <img
                src={user.profileImage}
                className="w-12 h-12 rounded-full"
              />


              <div>

                <p className="text-white font-semibold">
                  {user.name}
                </p>

                <p className="text-gray-400 text-sm">
                  {user.role}
                </p>

              </div>

            </Link>

          )}



          {/* Mobile Logo */}

          <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-full bg-amber text-black flex items-center justify-center font-bold">
              EA
            </div>


            <span className="text-white font-semibold">
              Event Alchemists
            </span>

          </div>




          <div className="flex flex-col gap-5">


            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="text-white hover:text-amber"
            >
              Browse Events
            </Link>



            {user && (

              <Link
                to="/my-tickets"
                onClick={() => setOpen(false)}
                className="text-white hover:text-amber"
              >
                My Tickets
              </Link>

            )}



            {user &&
              (user.role === "organizer" ||
                user.role === "admin") && (

              <>

                <Link
                  to="/organizer/events"
                  className="text-white hover:text-amber"
                >
                  My Events
                </Link>


                <Link
                  to="/organizer/create"
                  className="text-white hover:text-amber"
                >
                  Create Event
                </Link>


                <Link
                  to="/organizer/check-in"
                  className="text-white hover:text-amber"
                >
                  Check-In
                </Link>

              </>

            )}



            <Link
              to="/profile"
              className="text-white hover:text-amber"
            >
              Profile
            </Link>




            {user ? (

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white rounded-lg py-2"
              >
                Logout
              </button>

            ) : (

              <>

                <Link
                  to="/login"
                  className="text-white"
                >
                  Login
                </Link>


                <Link
                  to="/register"
                  className="btn-amber text-center"
                >
                  Create Account
                </Link>

              </>

            )}


          </div>


        </div>

      )}

    </header>
  );
};


export default Navbar;