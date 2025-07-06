import "./students.css";
import axios from "axios";
import { useCallback, useState, useEffect } from "react";
import Student from "../../components/student/Student";
import { Pagination } from '@material-ui/lab';


function Students() {
  const [users, setUsers] = useState([]);
  const [domain, setDomain] = useState([]);

  const [searchDomain, setSearchDomain] = useState("");
  const handleDomain = useCallback(
    (event) => { event.preventDefault(); setSearchDomain(event.target.value)} ,
    []
  );

  const [filteredUsers, setFilteredUsers] = useState([]);
  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user?.domain?.name?.toLowerCase().includes(searchDomain.toLowerCase())
      )
    );
  }, [searchDomain, users]);

  useEffect(() => {
    axios.get("/api/users").then((result) => setUsers(result.data));
  }, []);

  useEffect(() => {
    axios.get("/api/domains").then((result) => setDomain(result.data));
  }, []);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8 ;
  const pages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedData = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <section className="content" id="profiletudiants">
        <div className="container">
          <div className="row rowcards">

   
            <div style={{ display: "flex" }}>
              <div className="form">
                <form className="container" style={{ display: "flex" }}>
                  <div>
                    <select className="form-control" onChange={handleDomain}>
                      <option value="">selectionnez.. domain</option>
                      {domain.map((d, i) => (
                        <option key={i} value={d._name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </div>
              <div className="form">
                <form className="container" style={{ display: "flex" }}>
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="filtrez... domain"
                      onChange={handleDomain}
                    />
                  </div>
                  <div  id="top-pagination" className="d-flex justify-content-end align-items-start">
               
                 <Pagination count={pages} page={currentPage} onChange={handleChange} />
                </div> 
                </form>
              </div>
            </div>
            {paginatedData.length ? (
              paginatedData.map((student, i) => (
                <Student key={i} student={student} />
              ))
            ) : (
              <div className="d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
         
          </div>
        </div>
      </section>

      <section className="content" id="profiletudiants">
        <div className="container">
          <div className="row rowcards">
              <div className="d-flex justify-content-center align-items-center">
               
              <Pagination count={pages} page={currentPage} onChange={handleChange} />
              </div> 
          </div>
        </div>
      </section>



      
    </div>
  );
}

export default Students;
