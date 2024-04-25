/* eslint-disable jsx-a11y/anchor-is-valid */
import { Fragment, useEffect, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const navigation = [
  { name: "Dashboard", href: "#", current: true },
  { name: "Team", href: "#", current: false },
  { name: "Projects", href: "#", current: false },
  { name: "Calendar", href: "#", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({})

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setUserData({
              ...response.data,
              profilePicture: response.data.profilePicture ? `${process.env.REACT_APP_API_URL}/uploads/${response.data.profilePicture.split('/').pop()}` : null
            });
        } catch (error) {
            navigate("/login"); 
        }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    zoomAndPan="magnify"
                    viewBox="0 0 37.5 30.000001"
                    height="40"
                    preserveAspectRatio="xMidYMid meet"
                    version="1.0"
                  >
                    <defs>
                      <clipPath id="701557340f">
                        <path
                          d="M 3.265625 1.828125 L 33.75 1.828125 L 33.75 27.230469 L 3.265625 27.230469 Z M 3.265625 1.828125 "
                          clipRule="nonzero"
                        />
                      </clipPath>
                    </defs>
                    <g clipPath="url(#701557340f)">
                      <path
                        fill="#3de0d2"
                        d="M 21.679688 19.585938 C 23.429688 19.585938 24.851562 18.164062 24.851562 16.414062 L 24.851562 5 C 24.851562 3.25 23.429688 1.828125 21.679688 1.828125 L 6.457031 1.828125 C 4.707031 1.828125 3.285156 3.25 3.285156 5 L 3.285156 16.414062 C 3.285156 18.164062 4.707031 19.585938 6.457031 19.585938 L 8.359375 19.585938 L 8.359375 22.757812 C 8.359375 22.996094 8.496094 23.214844 8.710938 23.324219 C 8.800781 23.367188 8.898438 23.390625 8.996094 23.390625 C 9.128906 23.390625 9.261719 23.347656 9.375 23.265625 L 14.28125 19.585938 Z M 30.558594 5.632812 L 26.753906 5.632812 C 26.402344 5.632812 26.117188 5.917969 26.117188 6.265625 L 26.117188 16.414062 C 26.117188 18.863281 24.128906 20.855469 21.679688 20.855469 L 14.914062 20.855469 C 14.777344 20.855469 14.644531 20.898438 14.535156 20.980469 L 13.484375 21.769531 C 13.320312 21.890625 13.226562 22.082031 13.230469 22.285156 C 13.230469 22.484375 13.328125 22.675781 13.492188 22.792969 C 14.039062 23.183594 14.675781 23.390625 15.335938 23.390625 L 22.734375 23.390625 L 27.640625 27.070312 C 27.753906 27.152344 27.886719 27.195312 28.023438 27.195312 C 28.117188 27.195312 28.214844 27.171875 28.304688 27.128906 C 28.519531 27.019531 28.65625 26.800781 28.65625 26.5625 L 28.65625 23.390625 L 30.558594 23.390625 C 32.308594 23.390625 33.730469 21.96875 33.730469 20.21875 L 33.730469 8.804688 C 33.730469 7.054688 32.308594 5.632812 30.558594 5.632812 Z M 30.558594 5.632812 "
                        fillOpacity="1"
                        fillRule="nonzero"
                      />
                    </g>
                  </svg>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={userData.profilePicture || "https://via.placeholder.com/256"}
                        alt="User Profile"
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Your Profile
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => navigate("/settings")}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Settings
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            onClick={handleLogout}
                            href="#"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Sign out
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
