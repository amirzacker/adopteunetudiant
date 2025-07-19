import { useContext } from "react";
import "./dashboard.css";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import StudentHome from "../../components/dashboard/StudentHome";
import { useState } from "react";
import CompanyHome from "../../components/dashboard/CompanyHome";
import Home from "../../components/dashboard/Home";
import Table from "../../components/dashboard/Table";


export default function Dashboard() {
  
	const { user } = useContext(AuthContext);
	const PF = process.env.REACT_APP_PUBLIC_FOLDER;

	const [userssColor1, setUserssColor1] = useState('');
	const [userssColor2, setUserssColor2] = useState('');
	
	const [currentComponent, setCurrentComponent] = useState(<Home currentUser={user}/>);

	const handleHome = () => {
		if (user?.user?.isCompany) {
			setCurrentComponent(<CompanyHome currentUser={user}/>);
        } else if (user?.user?.isStudent) {
			setCurrentComponent(<StudentHome currentUser={user}/>);
		
        }
		setUserssColor2('homess-icon');
		setUserssColor1('');
	  };

	const handleAdoption = () => {
		setCurrentComponent( <Table currentUser={user}/>);
		setUserssColor1('userss-icon');
		setUserssColor2('');

	  };


	  const Logout = () => {
	// after delete remove  localStorage
	  localStorage.removeItem('user');
	//and reload page to deconnecte
	  window.location.reload();

	   
	  };


  return (
    <main>
	
       <div className="sidebar">
			<ul>
				<div className="student-avatar-container">
					<li className="student-avatar-dashboard">
						<img src={`${user?.user?.profilePicture ? PF + user?.user?.profilePicture : PF + "pic2.jpg"}`} alt="avatar-student"/>
					</li>
				</div>
				<div className="center-icons-dashboard">
					<li className={`home-icon ${userssColor2}`}>
						<Link onClick={handleHome}  to="#">
							<i className="fas fa-house-user"></i>
						</Link>
					</li>
					<li className="messages-icon">
						<Link to="/messenger">
							<i className="fas fa-comment"></i>
						</Link>
					</li>
					<li  className={`users-icon ${userssColor1}`}>
						<Link onClick={handleAdoption} to="#">
							<i className="fas fa-users"></i>
						</Link>
					</li>
					{user?.user?.isCompany && (
						<li className="job-board-icon">
							<Link to="/company-jobs">
								<i className="fas fa-briefcase"></i>
							</Link>
						</li>
					)}
					{user?.user?.isStudent && (
						<li className="applications-icon">
							<Link to="/my-applications">
								<i className="fas fa-file-alt"></i>
							</Link>
						</li>
					)}
					{user?.user?.isCompany && (
						<li className="applications-icon">
							<Link to="/company-applications">
								<i className="fas fa-file-alt"></i>
							</Link>
						</li>
					)}
					<li className="bell-icon">
						<Link to="#">
							<i className="fas fa-bell"></i>
						</Link>
					</li>
		
                <li>
					<Link onClick={Logout} to="#"><img src="/assets/svg/iconnavdashboard/deconnexion.svg" alt="deconnexion" id="logout-icon"/></Link>
				</li>
			</div>
		</ul>
	</div>

	<div className="dashboard-partition">

	
	{currentComponent}

    </div>
    </main>
  );
}
