// import React, { useContext } from "react";
// import { Link } from "react-router-dom";
// import { AuthContext } from "../context/authContext";
// import Logo from "../img/logo.png";
// import { FaPencilAlt } from "react-icons/fa"; 

// const Navbar = () => {
//   const { currentUser, logout } = useContext(AuthContext);

//   return (
//     <div className="navbar">
//       <div className="container">
//         <div className="logo">
//           <Link to="/">
//           <img src={Logo} alt="" />
//           </Link>
//         </div>
//         <div className="links">
//           <Link className="link" to="/?cat=art">
//             <h6>IoT & Connectivity</h6>
//           </Link>
//           <Link className="link" to="/?cat=science">
//             <h6>Edge AI & Machine Learning</h6>
//           </Link>
//           <Link className="link" to="/?cat=technology">
//             <h6>Wearable Technologies / Devices</h6>
//           </Link>
//           <Link className="link" to="/?cat=cinema">
//             <h6>HealthTech & Biomedical Engineering</h6>
//           </Link>
//           <Link className="link" to="/?cat=design">
//             <h6>Electronics & Semiconductor Design</h6>
//           </Link>
//           <Link className="link" to="/?cat=food">
//             <h6>Software & Cloud</h6>
//           </Link>
//           <span>{currentUser?.username}</span>
//           {currentUser ? (
//             <span onClick={logout}>Logout</span>
//           ) : (
//             <Link className="link" to="/login">
//               Login
//             </Link>
//           )}
//           <span className="write">
//             <Link className="link" to="/write">
//               <FaPencilAlt size={20} /> 
//             </Link>
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Navbar;
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import Logo from "../img/logo.png";
import { FaPencilAlt } from "react-icons/fa";

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-left">
          <Link to="/" className="logo-link">
            <img src={Logo} alt="Sophrosyne Technologies" className="logo" />
          </Link>
        </div>

        {/* Menu Links */}
        <div className="navbar-links">
          <Link className="nav-link" to="/?cat=iot">
            IoT & Connectivity
          </Link>
          <Link className="nav-link" to="/?cat=edge-ai">
            Edge AI
          </Link>
          <Link className="nav-link" to="/?cat=wearables">
            Technologies
          </Link>
          <Link className="nav-link" to="/?cat=healthtech">
            HealthTech
          </Link>
          <Link className="nav-link" to="/?cat=electronics">
            Electronics
          </Link>
          <Link className="nav-link" to="/?cat=software">
            Software & Cloud
          </Link>
        </div>

        {/* User & Write Icon */}
        <div className="navbar-right">
          {currentUser ? (
            <>
              <span className="username">{currentUser.username}</span>
              <span className="logout-btn" onClick={logout}>
                Logout
              </span>
            </>
          ) : (
            <Link className="nav-link" to="/login">
              Login
            </Link>
          )}

          <Link to="/write" className="write-btn">
            <FaPencilAlt size={18} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
