import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Pagination } from '@material-ui/lab';


const Paginated = () => {

  const [users, setUsers] = useState([]);



useEffect(() => {
  // Axios version
  axios.get("/api/users").then((result) => setUsers(result.data));
}, [users]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const pages = Math.ceil(users.length / itemsPerPage);
  const paginatedData = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {paginatedData.map(item => (
        <div key={item._id}>{item.email}</div>
      ))}
      <Pagination count={pages} page={currentPage} onChange={handleChange} />
    </div>
  );
};

export default Paginated;
