import { useContext, useEffect, useCallback } from "react";
import "./dashboard.css";
import { AuthContext } from "../../context/AuthContext";
import StudentHome from "../../components/dashboard/StudentHome";
import { useState } from "react";
import CompanyHome from "../../components/dashboard/CompanyHome";
import Home from "../../components/dashboard/Home";
import Table from "../../components/dashboard/Table";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { useLocation } from "react-router-dom";


export default function Dashboard() {

	const { user } = useContext(AuthContext);
	const PF = process.env.REACT_APP_PUBLIC_FOLDER;
	const location = useLocation();

	const [userssColor1, setUserssColor1] = useState('');
	const [userssColor2, setUserssColor2] = useState('');

	const [currentComponent, setCurrentComponent] = useState(<Home currentUser={user}/>);

	const handleHome = useCallback(() => {
		if (user?.user?.isCompany) {
			setCurrentComponent(<CompanyHome currentUser={user}/>);
        } else if (user?.user?.isStudent) {
			setCurrentComponent(<StudentHome currentUser={user}/>);

        }
		setUserssColor2('homess-icon');
		setUserssColor1('');
	  }, [user]);

	const handleAdoption = useCallback(() => {
		setCurrentComponent( <Table currentUser={user}/>);
		setUserssColor1('userss-icon');
		setUserssColor2('');

	  }, [user]);

	// Handle URL parameters to show specific views
	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		const view = urlParams.get('view');

		if (view === 'adoptions') {
			handleAdoption();
		}
	}, [location.search, handleAdoption]);

	  const Logout = () => {
	// after delete remove  localStorage
	  localStorage.removeItem('user');
	//and reload page to deconnecte
	  window.location.reload();


	  };


  return (
    <main>
      <DashboardSidebar
        user={user}
        PF={PF}
        userssColor1={userssColor1}
        userssColor2={userssColor2}
        handleHome={handleHome}
        handleAdoption={handleAdoption}
        Logout={Logout}
        activePage="dashboard"
      />

	<main className="dashboard-partition" role="main" aria-label="Contenu principal du tableau de bord">
		{currentComponent}
    </main>
    </main>
  );
}
