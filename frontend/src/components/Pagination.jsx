import React from "react";
import "../styles/pagination.css";

export default function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="pagination">
      <button className={`page-btn ${page === 1 ? "disabled" : ""}`} onClick={onPrev} disabled={page === 1}>Prev</button>
      <div className="page-info">Page {page} of {totalPages}</div>
      <button className={`page-btn ${page === totalPages ? "disabled" : ""}`} onClick={onNext} disabled={page === totalPages}>Next</button>
    </div>
  );
}
