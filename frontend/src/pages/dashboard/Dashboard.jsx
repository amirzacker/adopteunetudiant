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
	
       <nav className="sidebar" role="navigation" aria-label="Navigation du tableau de bord">
			<ul role="menubar" aria-orientation="vertical">
				<div className="student-avatar-container">
					<li className="student-avatar-dashboard" role="none">
						<img
							src={`${user?.user?.profilePicture ? PF + user?.user?.profilePicture : PF + "pic2.jpg"}`}
							alt={`Photo de profil de ${user?.user?.firstname} ${user?.user?.lastname}`}
						/>
					</li>
				</div>
				<div className="center-icons-dashboard">
					<li className={`home-icon ${userssColor2}`} role="none">
						<Link
							onClick={handleHome}
							to="#"
							role="menuitem"
							aria-label="Aller à l'accueil du tableau de bord"
							tabIndex={0}
						>
							<i className="fas fa-house-user" aria-hidden="true"></i>
							<span className="sr-only">Accueil</span>
						</Link>
					</li>
					<li className="messages-icon" role="none">
						<Link
							to="/messenger"
							role="menuitem"
							aria-label="Accéder à la messagerie"
							tabIndex={0}
						>
							<i className="fas fa-comment" aria-hidden="true"></i>
							<span className="sr-only">Messages</span>
						</Link>
					</li>
					<li className={`users-icon ${userssColor1}`} role="none">
						<Link
							onClick={handleAdoption}
							to="#"
							role="menuitem"
							aria-label="Gérer les adoptions"
							tabIndex={0}
						>
							<i className="fas fa-users" aria-hidden="true"></i>
							<span className="sr-only">Adoptions</span>
						</Link>
					</li>
					{user?.user?.isCompany && (
						<li className="job-board-icon" role="none">
							<Link
								to="/company-jobs"
								role="menuitem"
								aria-label="Gérer mes offres d'emploi"
								tabIndex={0}
							>
								<i className="fas fa-briefcase" aria-hidden="true"></i>
								<span className="sr-only">Mes offres d'emploi</span>
							</Link>
						</li>
					)}
					{user?.user?.isStudent && (
						<li className="applications-icon" role="none">
							<Link
								to="/my-applications"
								role="menuitem"
								aria-label="Voir mes candidatures"
								tabIndex={0}
							>
								<i className="fas fa-file-alt" aria-hidden="true"></i>
								<span className="sr-only">Mes candidatures</span>
							</Link>
						</li>
					)}
					{user?.user?.isCompany && (
						<li className="applications-icon" role="none">
							<Link
								to="/company-applications"
								role="menuitem"
								aria-label="Gérer les candidatures reçues"
								tabIndex={0}
							>
								<i className="fas fa-file-alt" aria-hidden="true"></i>
								<span className="sr-only">Candidatures reçues</span>
							</Link>
						</li>
					)}
					<li className="bell-icon" role="none">
						<Link
							to="#"
							role="menuitem"
							aria-label="Voir les notifications"
							tabIndex={0}
						>
							<i className="fas fa-bell" aria-hidden="true"></i>
							<span className="sr-only">Notifications</span>
						</Link>
					</li>

                <li role="none">
					<Link
						onClick={Logout}
						to="#"
						role="menuitem"
						aria-label="Se déconnecter"
						tabIndex={0}
					>
						<img src="/assets/svg/iconnavdashboard/deconnexion.svg" alt="Se déconnecter" id="logout-icon"/>
					</Link>
				</li>
			</div>
		</ul>
	</nav>

	<main className="dashboard-partition" role="main" aria-label="Contenu principal du tableau de bord">
		{currentComponent}
    </main>
    </main>
  );
}
