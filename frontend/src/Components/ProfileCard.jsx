import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import { FiUser, FiArrowLeft } from "react-icons/fi";

const ProfileCard = () => {
    return (
      <div style={{
        display: 'grid',
        width: '100vw',
        height: '100vh', 
        placeContent: 'center',
        background: 'linear-gradient(to bottom right, #667eea, #764ba2)',
        padding: '0',
        margin: '0'
      }}>
        <TiltCard />
      </div>
    );
  };

const TiltCard = () => {
  const ref = useRef(null);
  const [user, setUser] = useState(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const ROTATION_RANGE = 32.5;
  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser({
          ...response.data,
          profilePicture: response.data.profilePicture
            ? `${process.env.REACT_APP_API_URL}/uploads/${response.data.profilePicture.split("/").pop()}`
            : null,
          about: response.data.about || "No about info available.",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = (e.clientX - rect.left) / width - 0.5;
        const mouseY = (e.clientY - rect.top) / height - 0.5;

        x.set(-mouseY * ROTATION_RANGE);
        y.set(mouseX * ROTATION_RANGE);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{
        transform,
        transformStyle: "preserve-3d"
      }}
      className="relative h-96 w-72 rounded-xl bg-gradient-to-br from-indigo-300 to-violet-300 flex justify-center items-center p-4"
    >
      <div
        className="absolute inset-4 grid place-content-center rounded-xl bg-white shadow-lg"
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
      >
        {user ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <img
              src={user.profilePicture || FiUser}
              alt="Profile"
              className="h-32 w-32 rounded-full object-cover border-4 border-white"
            />
            <h3 className="text-xl font-semibold">{user.username}</h3>
            <p className="text-center">{user.about}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <FiUser className="text-4xl text-indigo-500" />
            <p className="text-lg">Loading...</p>
          </div>
        )}
      </div>
      <button
        onClick={() => window.history.back()}
        className="absolute top-3 left-3 text-cyan-500 bg-transparent hover:bg-cyan-100 rounded-full p-2"
        style={{ transform: "translateZ(85px)" }} 
      >
        <FiArrowLeft size={24} />
      </button>
    </motion.div>
  );
};

export default ProfileCard;
