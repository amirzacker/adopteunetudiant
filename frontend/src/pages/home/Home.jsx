import './home.css'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import axios from "axios";
import { useState } from 'react';
import HomeComponent from '../../components/home/HomeComponent';

function Home () {
  const navigate = useNavigate();
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [students, setStudents] = useState([]);
  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`/api/users/`);
      setStudents(res.data);
    };
    fetchUser();

    
  }, [students, ]);



  return (
    <div >
         
    <div className="container-fluid container-relative" id="img-header-container">
        <img src="/assets/img/6.jpg" className="img-fluid" id="img-header" alt="header"/>
        <div className="slogan-text">
            <p>Vous êtes in <b>THE RIGHT PLACE</b> pour trouver des profils appropriés à votre entreprise</p>
            <div>
            <Link to='/students' className="a-btn">
            <span className="a-btn-text">Profils</span>
            <span className="a-btn-slide-text">Now!</span>
            <span className="a-btn-icon-right"><span></span></span>
            </Link>
            </div>
        </div>
       
    </div>

    <HomeComponent/>

    <div className="pic-ctn">
            {
          students.map((student, i) => (
              <img key={i} onClick={() => navigate('/student/' + student._id)} src={`${student?.profilePicture ? PF + student?.profilePicture : PF + "pic2.jpg"}`} alt="" className="pic btn btn-link"/>
          ))}
    </div>
    <div className="heading text-center">
        <Link to='/students' className="a-btn">
            <span className="a-btn-text">Voir les profils</span>
            <span className="a-btn-slide-text">Now!</span>
            <span className="a-btn-icon-right"><span></span></span>
        </Link>
    </div>
    </div>
  )
}

export default Home
