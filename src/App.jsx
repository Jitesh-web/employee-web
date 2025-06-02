import "./App.css";
import { useState } from "react";
import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination,
} from "react-table";
import * as React from "react";
import Axios from "axios";

function App() {
  const [employees, setEmployees] = useState([]);
  const [employeeData, setEmployeeData] = useState({
    name: "",
    manager: "",
    salary: "",
  });
  const [hideCancel, setHideCancel] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const columns = React.useMemo(
    () => [
      { Header: "EmployeeId", accessor: "employeeId" },
      { Header: "Name", accessor: "name" },
      { Header: "Manager", accessor: "manager" },
      { Header: "Salary", accessor: "salary" },
      {
        Header: "Edit",
        id: "Edit",
        accessor: "edit",
        Cell: (props) => (
          <button
            className="editBtn"
            onClick={() => handleUpdate(props.cell.row.original)}
          >
            Edit
          </button>
        ),
      },
      {
        Header: "Delete",
        id: "Delete",
        accessor: "delete",
        Cell: (props) => (
          <button
            className="deleteBtn"
            onClick={() => handleDelete(props.cell.row.original)}
          >
            Delete
          </button>
        ),
      },
    ],
    []
  );

  const data = React.useMemo(() => employees, []);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    pageCount,
    nextPage,
    previousPage,
    setGlobalFilter,
    canPreviousPage,
    canNextPage,
    gotoPage,
  } = useTable(
    { columns, data: employees, initialState: { pageSize: 5 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );
  const { globalFilter, pageIndex } = state;
  const getAllEmployees = () => {
    const response = Axios.get("http://localhost:8087/employees");
    response.then((res) => {
      setEmployees(res.data);
    });
  };

  const refreshData = () => {
    getAllEmployees();
  };

  const handleChange = (e) => {
    setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errorMessage = "";
    if (!employeeData.name || !employeeData.manager || !employeeData.salary) {
      errorMessage = "All fields are mandtory!";
      setErrorMsg(errorMessage);
    }
    try {
      if (errorMessage.length === 0 && employeeData.employeeId) {
        const response = await Axios.patch(
          `http://localhost:8087/employees/${employeeData.employeeId}`,
          employeeData
        );
        const result = response.data;
        alert(`Data updated successfully: ${JSON.stringify(result)}`);
      } else if (errorMessage.length === 0) {
        const response = await Axios.post(
          "http://localhost:8087/employees",
          employeeData
        );
        const result = response.data;
        alert(`Data added successfully: ${JSON.stringify(result)}`);
      }
      refreshData();
      setEmployeeData({
        name: "",
        manager: "",
        salary: "",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleUpdate = (editRow) => {
    setEmployeeData(editRow);
    setHideCancel(true);
  };
  const handleDelete = async ({ employeeId }) => {
    const confirmPopup = window.confirm("Are you sure you want to delete");
    if (confirmPopup) {
      const response = await Axios.delete(
        `http://localhost:8087/employees/${employeeId}`
      );
      const result = response.data;
      alert(`Data added successfully: ${result}`);
      refreshData();
    }
  };

  const handleCancel = () => {
    employeeData({
      name: "",
      manager: "",
      salary: "",
    });
    setHideCancel(false);
  };

  React.useEffect(() => {
    getAllEmployees();
  }, []);

  return (
    <>
      <div className="main-container">
        <h3 className="title">
          Full Stack Application with React JS, Spring Boot & PostgreSQL
        </h3>
        {<span className="errMsg">{errorMsg}</span>}
        <div className="panel">
          <form>
            <div className="input-container">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={employeeData.name}
                onChange={handleChange}
              ></input>
            </div>
            <div className="input-container">
              <label>Manager</label>
              <input
                type="text"
                name="manager"
                value={employeeData.manager}
                onChange={handleChange}
              ></input>
            </div>
            <div className="input-container">
              <label>Salary</label>
              <input
                type="number"
                name="salary"
                value={employeeData.salary}
                onChange={handleChange}
              ></input>
            </div>
            <div className="btn-container">
              <button onClick={handleSubmit}>
                {employeeData.employeeId ? "Update" : "Add"}
              </button>
              <button onClick={handleCancel} disabled={!hideCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
        <div className="search">
          <input
            type="text"
            value={globalFilter || ""}
            placeholder="Search Employee Here"
            onChange={(e) => setGlobalFilter(e.target.value)}
          ></input>
        </div>
        <table className="table" {...getTableProps()}>
          <thead>
            {headerGroups.map((hg) => (
              <tr {...hg.getHeaderGroupProps()} key={hg.id}>
                {hg.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={column.id}
                  >
                    {column.render("Header")}
                    {column.isSorted && (
                      <span>{column.isSortedDesc ? " ⬆️" : "⬇️"}</span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} key={cell.column.id}>
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="pageDiv">
          <button
            disabled={!canPreviousPage}
            className="pageBtn"
            onClick={() => gotoPage(0)}
          >
            First
          </button>
          <button
            disabled={!canPreviousPage}
            className="pageBtn"
            onClick={previousPage}
          >
            Prev
          </button>
          <span className="idx">
            {pageIndex} of {pageCount}
          </span>
          <button
            disabled={!canNextPage}
            className="pageBtn"
            onClick={nextPage}
          >
            Next
          </button>
          <button
            disabled={!canNextPage}
            className="pageBtn"
            onClick={() => gotoPage(pageCount - 1)}
          >
            Last
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
