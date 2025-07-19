import { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/login/Login'
import NotFound from './pages/notFound/NotFound'
import Footer from './components/footer/Footer'
import MyNavbar from './components/navbar/MyNavbar'
import Home from './pages/home/Home'
import Students from './pages/students/Students'
import Student from './pages/student/Student'
import RegisterStudent from './pages/registerStudent/RegisterStudent'
import RegisterCompany from './pages/registerCompany/RegisterCompany'
import Dashboard from './pages/dashboard/Dashboard'
import Messenger from './pages/messenger/Messenger';
import JobBoard from './pages/jobBoard/JobBoard';
import CompanyJobs from './pages/companyJobs/CompanyJobs';
import CompanyApplications from './pages/companyApplications/CompanyApplications';
import MyApplications from './pages/myApplications/MyApplications';
import { AuthContext } from "./context/AuthContext";
import Contact from './pages/contact/Contact'
import AboutUs from './pages/aboutAs/AboutUs'
import Politique from './pages/politiqueDeConfid/Politique'
import Mentions from './pages/mentionsLegales/Mentions'
import Cgu from './pages/cgu/Cgu'
import ForgotPassword from './pages/forgotPassword/ForgotPassword'
import { AccessibilityProvider, SkipLink } from './components/accessibility/AccessibilityProvider'
import AccessibilityToolbar from './components/accessibility/AccessibilityToolbar'
import './styles/accessibility.css'

function App () {
  //const { context } = useContext(Context)
  const { user } = useContext(AuthContext);
  return (
    <AccessibilityProvider>
      <div>
        {/* Skip Links for Keyboard Navigation */}
        <SkipLink href="#main-content">Aller au contenu principal</SkipLink>
        <SkipLink href="#navigation">Aller à la navigation</SkipLink>

        <MyNavbar/>
          <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route path="/students" element={<Students/>}/>
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/about-us" element={<AboutUs/>}/>
          <Route path="/politique" element={<Politique/>}/>
          <Route path="/mentions" element={<Mentions/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/cgu" element={<Cgu/>}/>
          <Route path="/student/:id" element={<Student/>}/>
 
          {user ? <Route path="/registerStudent" element={<Navigate to="/dashboard" />}/>  : 
          <Route path="/registerStudent" element={<RegisterStudent/>}/>
          }
          {user ? <Route path="/registerCompany" element={<Navigate to="/dashboard" />}/>  : 
          <Route path="/registerCompany" element={<RegisterCompany/>}/>
          }
          {user ? <Route path="/login" element={<Navigate to="/dashboard" />}/>  : 
          <Route path="/login" element={<Login/>}/>
          }
          {!user ? <Route path="/messenger" element={<Navigate to="/login" />}/>  : 
          <Route path="/messenger" element={<Messenger/>}/>
          }
          {!user ? <Route path="/dashboard" element={<Navigate to="/login" />}/>  :
          <Route path="/dashboard" element={<Dashboard/>}/>
          }

          {/* Job Board Routes */}
          <Route path="/job-board" element={<JobBoard/>}/>

          {/* Company Dashboard Routes */}
          {!user ? <Route path="/company-jobs" element={<Navigate to="/login" />}/>  :
          <Route path="/company-jobs" element={<CompanyJobs/>}/>
          }
          {!user ? <Route path="/company-applications" element={<Navigate to="/login" />}/>  :
          <Route path="/company-applications" element={<CompanyApplications/>}/>
          }

          {/* Student Dashboard Routes */}
          {!user ? <Route path="/my-applications" element={<Navigate to="/login" />}/>  :
          <Route path="/my-applications" element={<MyApplications/>}/>
          }

          <Route path="*" element={<NotFound/>}/>
        </Routes>
        <Footer/>

        {/* Accessibility Toolbar */}
        <AccessibilityToolbar />
      </div>
    </AccessibilityProvider>
  )
}

export default App
