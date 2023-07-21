import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination, Button } from "react-bootstrap";

const SatelliteSearch = () => {
  const [loading, setLoading] = useState(true);
  const [satellites, setSatellites] = useState([]);
  const [filteredSatellites, setFilteredSatellites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    orbit: "",
    objectType: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const satellitesPerPage = 20;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/satellites"); // Replace with the correct JSON file path or API endpoint.

      if (response.data && Array.isArray(response.data)) {
        setSatellites(response.data);
        setLoading(false);
      } else {
        throw new Error("Invalid data format.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [satellites, filters, searchTerm]);

  const applyFilters = () => {
    let filteredData = satellites;

    if (filters.country) {
      filteredData = filteredData.filter(
        (satellite) => satellite.countryCode === filters.country
      );
    }

    if (filters.orbit) {
      filteredData = filteredData.filter(
        (satellite) => satellite.orbitCode === filters.orbit
      );
    }

    if (filters.objectType) {
      filteredData = filteredData.filter(
        (satellite) => satellite.objectType === filters.objectType
      );
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        (satellite) =>
          satellite.noradCatId.toString().includes(lowerCaseSearchTerm) ||
          satellite.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    setFilteredSatellites(filteredData);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const calculatePageRange = (totalPages, currentPage) => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }
    range.unshift(1);
    range.push(totalPages);
    return range;
  };

  const totalPages = Math.ceil(filteredSatellites.length / satellitesPerPage);
  const pageRange = calculatePageRange(totalPages, currentPage);

  const indexOfLastSatellite = currentPage * satellitesPerPage;
  const indexOfFirstSatellite = indexOfLastSatellite - satellitesPerPage;
  const currentSatellites = filteredSatellites.slice(
    indexOfFirstSatellite,
    indexOfLastSatellite
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row mb-3">
        <div className="col">
          <input
            type="text"
            className="form-control"
            placeholder="Search by NORAD CAT ID or satellite name"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="col">
          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          <label htmlFor="country">Filter by Country:</label>
          <select
            id="country"
            name="country"
            className="form-select"
            onChange={handleFilterChange}
            value={filters.country}
          >
            <option value="">All Countries</option>
            <option value="US">United States</option>
            <option value="PRC">China</option>
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="orbit">Filter by Orbit Regime:</label>
          <select
            id="orbit"
            name="orbit"
            className="form-select"
            onChange={handleFilterChange}
            value={filters.orbit}
          >
            <option value="">All Orbits</option>
            <option value="LEO">Low Earth Orbit (LEO)</option>
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="objectType">Filter by Object Type:</label>
          <select
            id="objectType"
            name="objectType"
            className="form-select"
            onChange={handleFilterChange}
            value={filters.objectType}
          >
            <option value="">All Object Types</option>
            <option value="PAYLOAD">Payload</option>
            <option value="ROCKET BODY">Rocket Body</option>
            <option value="DEBRIS">Debris</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col">
          {filteredSatellites.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>NORAD CAT ID</th>
                  <th>International Designator</th>
                  <th>Launch Date</th>
                  <th>Decay Date</th>
                  <th>Object Type</th>
                  <th>Country Code</th>
                </tr>
              </thead>
              <tbody>
                {currentSatellites.map((satellite) => (
                  <tr key={satellite.noradCatId}>
                    <td>{satellite.name}</td>
                    <td>{satellite.noradCatId}</td>
                    <td>{satellite.intlDes}</td>
                    <td>{satellite.launchDate}</td>
                    <td>{satellite.decayDate}</td>
                    <td>{satellite.objectType}</td>
                    <td>{satellite.countryCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No satellites found.</div>
          )}
          <Pagination className="justify-content-center mt-3">
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {pageRange.map((pageNumber, index) => (
              <Pagination.Item
                key={index}
                active={pageNumber === currentPage}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default SatelliteSearch;
