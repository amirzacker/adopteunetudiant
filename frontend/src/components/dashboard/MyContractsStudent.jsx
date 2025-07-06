import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "@material-ui/lab";
import { useCallback } from "react";
import FlashMessage from "../alert/FlashMessage";
import { Table, Button, Modal, Form } from "react-bootstrap";

export default function MyContractsStudent({ currentUser }) {
  const [contracts, setContract] = useState([]);


  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");

  const [selectedContract, setSelectedContract] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [searchStatus, setSearchStatus] = useState("");
  const handleSatus = useCallback(
    (event) => { event.preventDefault(); setSearchStatus(event.target.value)} ,
    []
  );

  const [filteredcontracts, setFilteredUsers] = useState([]);
  useEffect(() => {
    setFilteredUsers(
      contracts.filter((contract) =>
      contract?.status?.toLowerCase().includes(searchStatus.toLowerCase())
      )
    );
  }, [searchStatus, contracts]);
  const handleCloseModal = () => {
    setSelectedContract(null);
    setShowModal(false);
  };

  const handleShowModal = (contract) => {
    setSelectedContract(contract);
    setShowModal(true);
  };



 

  useEffect(() => {
    const source = axios.CancelToken.source();
    const getAdoptions = async () => {
      try {
        const res = await axios.get(`/api/contracts/${currentUser?.user?._id}`, {
          headers: { "x-access-token": currentUser.token },
          cancelToken: source.token
        });
        //setAdoption(res.data);
        setContract(
          res.data.filter((contract) => contract.status !== "pending")
        );
        //console.log(res);
      } catch (err) {
        console.log(err);
      }
    };
    getAdoptions();
    return () => {
      source.cancel("Component unmounted");
    };
  }, [currentUser, contracts]);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pages = Math.ceil(filteredcontracts.length / itemsPerPage);
  const paginatedData = filteredcontracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //console.log(currentUser?.token);

  const handleChange = (event, page) => {
    setCurrentPage(page);
  };


  function convertDate(date) {
    const month = date.toLocaleString("fr", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${day} ${month}  ${year}`;
  }

  function calculateDuration(startDate, endDate) {
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const duration = (endMonth - startMonth) + (12 * (endDate.getFullYear() - startDate.getFullYear()));
    return duration;
  }
  
  const calculateRemainingDuration = (startDate, endDate) => {
    const totalDuration = calculateDuration(startDate, endDate);
    const elapsedTime = Date.now() - startDate.getTime();
    const elapsedDuration = Math.floor(elapsedTime / (1000 * 60 * 60 * 24 * 30));
    const remainingDuration = totalDuration - elapsedDuration;
    return remainingDuration;
  }

  return (
    <div>
      <h2>Mes Contrats</h2>
      <div className="form">
        <form className="container" style={{ display: "flex" }}>
          <div>
            <select className="form-control  border border-danger " onChange={handleSatus}>
              <option value="">Filtrer mes contracts</option>
              <option value="active">actif</option>
              <option value="terminated">terminé</option>
            </select>
          </div>
        </form>
      </div>
      <>
        <div className="table-responsive">
          <table className="table table-striped striped bordered hover">
            <thead>
              <tr>
                <th>Type</th>
                <th>Durée</th>
                <th>Date de signature</th>
                <th>Durée restante</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
                paginatedData.map((contract, index) => (
                  <tr key={index}>
                    <td>{contract.student?.searchType?.name}</td>
                    <td>{calculateDuration(new Date(contract?.startDate) , new Date(contract?.endDate))} {""}mois </td>
                    <td>{convertDate(new Date(contract?.createdAt))}</td>
                    <td>{calculateRemainingDuration(new Date(contract?.startDate) , new Date(contract?.endDate))} {""}mois </td>
                    <td>{contract.status}</td>
                
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleShowModal(contract)}
                      >
                        Consulter
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleShowModal(contract)}
                      >
                        Télécharger
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                <td colSpan="7" className="">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                <span className="visually">Pas de contrat encours...</span>
                </td>
              </tr>
              
              )}
            </tbody>
          </table>
        </div>
        

        {selectedContract && (
          <Modal show={!!selectedContract} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Details du Contract</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formAdopterName">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Type
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedContract?.student.searchType?.name}
                    disabled
                  />
                </Form.Group>
                <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Durée
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={calculateDuration(new Date(selectedContract?.startDate) , new Date(selectedContract?.endDate)) +  " mois"} 
                    disabled
                  />
                <Form.Group controlId="formPet">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Date
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={convertDate(new Date(selectedContract?.createdAt))}
                    disabled
                  />
                </Form.Group>
                <Form.Group controlId="formPet">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Entreprise : 
                  </Form.Label>
                  <br/>
                  {""}
                  {selectedContract?.company?.name} {" basée à  : "} {selectedContract?.company?.city}
                  {" dans le domaine : "} {selectedContract?.student.domain?.name}
                 
                </Form.Group>
                <Form.Group controlId="formStatus">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Termes du contract
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows="10"
                    type="texte"
                    value={selectedContract?.terms}
                    disabled
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
          </Modal>
        )}
      </>
      <div className="d-flex justify-content-center mt-3">
        <Pagination count={pages} page={currentPage} onChange={handleChange} />
      </div>
    </div>
  );
}
