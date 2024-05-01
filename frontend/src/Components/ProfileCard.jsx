import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { FiUser } from "react-icons/fi";

const ProfileCard = () => {
  const [user, setUser] = useState(null);
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 100, damping: 10 });
  const ySpring = useSpring(y, { stiffness: 100, damping: 10 });

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
          coverPhoto: response.data.coverPhoto
            ? `${process.env.REACT_APP_API_URL}/uploads/${response.data.coverPhoto.split("/").pop()}`
            : null,
          about: response.data.about || "No about info available.",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleMouseMove = (event) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (event.clientX - rect.left - width / 2) / width * 100;
    const mouseY = (event.clientY - rect.top - height / 2) / height * 100;

    x.set(mouseY * 0.3);
    y.set(mouseX * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid place-content-center min-h-screen w-full bg-gradient-to-br from-indigo-500 to-violet-500 px-4 py-12 text-slate-900"
         style={{ perspective: '1500px' }}> 
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transformStyle: "preserve-3d", transform }}
        className="relative h-[600px] w-[400px] rounded-xl bg-gradient-to-br from-indigo-300 to-violet-300 shadow-2xl overflow-hidden" 
      >
        <motion.img
          src={user.coverPhoto}
          alt="Cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black bg-opacity-50"
             style={{ transform: "translateZ(50px)" }}>
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="rounded-full border-4 border-white"
              style={{ width: "160px", height: "160px", objectFit: "cover", transform: "translateZ(50px)" }}
            />
          ) : (
            <FiUser className="text-white" style={{ fontSize: "160px", transform: "translateZ(50px)" }} />
          )}
          <motion.p className="text-xl font-semibold text-white mt-4"
                    style={{ transform: "translateZ(30px)" }}>
            {user.username}
          </motion.p>
          <motion.p className="text-white text-center"
                    style={{ transform: "translateZ(30px)" }}>
            {user.about}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCard;
